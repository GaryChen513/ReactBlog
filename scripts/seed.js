const articles = [
  `
=====================================



The normal string method \`.replace()\` only lets you replace one occurrence if you search for string (and not a regular expression with the flag \`/g\`). The proposal \`String.prototype.replaceAll\` 

\`.replace()\`: the status quo [#](#.replace()%3A-the-status-quo)
---------------------------------------------------------------

Let’s look at three options for replacing that we currently have.

First, we can search for a string and replace the first occurrence:

    > 'Cyan + magenta + yellow + black'.replace('+', 'and')
    'Cyan and magenta + yellow + black'
    

Second, we can search for a regular expression with the flag \`/g\` and replace all occurrences:

    > 'Cyan + magenta + yellow + black'.replace(/\+/g, 'and')
    'Cyan and magenta and yellow and black'
    

Third, we can convert a string into a regular expression with flag \`/g\` and replace all occurrences:

    function escapeForRegExp(str) {
      return str.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&'); // (A)
    }
    const regExp = new RegExp(escapeForRegExp('+'), 'g');
    assert.equal(
      'Cyan + magenta + yellow + black'.replace(regExp, 'and'),
      'Cyan and magenta and yellow and black'
    );
    

“JavaScript for impatient programmers” has [a few more details on \`escapeForRegExp()\`](https://exploringjs.com/impatient-js/ch_regexps.html#escapeForRegExp).

\`.replaceAll()\`: replacing strings multiple times [#](#.replaceall()%3A-replacing-strings-multiple-times)
---------------------------------------------------------------------------------------------------------

The proposed string method \`.replaceAll()\` provides one service that \`.replace()\` can’t: Searching for a string and replacing all occurrences:

    > 'Cyan + magenta + yellow + black'.replaceAll('+', 'and')
    'Cyan and magenta and yellow and black'
    

\`.replaceAll()\` throws an exception if we use a regular expression that does not have the flag \`/g\`. The assumption is that we made a mistake and should switch to \`.replace()\` if we really only want to replace the first occurrence. The following code demonstrates that:

    assert.throws(
      () => 'abcdef'.replaceAll(/abc/, 'x'),
      TypeError
    );
    

Other than that, \`.replaceAll()\` works like \`.replace()\`. This table summarizes the differences between \`.replace()\` and \`.replaceAll()\`:

Search: for string

for RegExp w/o \`\g\`

for RegExp with \`/g\`

\`.replace\`

First occurrence

First occurrence

All occurrences

\`.replaceAll\`

All occurrences

\`TypeError\`

All occurrences

Implementations [#](#implementations)
-------------------------------------

*   Polyfills:
    *   [\`string.prototype.replaceall\`](https://github.com/es-shims/String.prototype.replaceAll)
    *   [\`core-js\`](https://github.com/zloirock/core-js#stringreplaceall)
*   Support in JavaScript engines: [Keep an eye on the proposal for updates](https://github.com/tc39/proposal-string-replaceall#implementations).

`,
  `
====================================


In this blog post, we examine several approaches for creating instances of classes: Constructors, factory functions, etc. We do so by solving one concrete problem several times. The focus of this post is on classes, which is why alternatives to classes are ignored.

* * *

**Table of contents:**

*   [The problem: initializing a property asynchronously](#the-problem%3A-initializing-a-property-asynchronously)
*   [Solution: Promise-based constructor](#solution%3A-promise-based-constructor)
    *   [Using an immediately-invoked asynchronous arrow function](#using-an-immediately-invoked-asynchronous-arrow-function)
*   [Solution: static factory method](#solution%3A-static-factory-method)
    *   [Improvement: private constructor via secret token](#improvement%3A-private-constructor-via-secret-token)
    *   [Improvement: constructor throws, factory method borrows the class prototype](#improvement%3A-constructor-throws%2C-factory-method-borrows-the-class-prototype)
    *   [Improvement: instances are inactive by default, activated by factory method](#improvement%3A-instances-are-inactive-by-default%2C-activated-by-factory-method)
    *   [Variant: separate factory function](#variant%3A-separate-factory-function)
*   [Subclassing a Promise-based constructor (advanced)](#subclassing-a-promise-based-constructor-(advanced))
*   [Conclusion](#conclusion)
*   [Further reading](#further-reading)

* * *

The problem: initializing a property asynchronously [#](#the-problem%3A-initializing-a-property-asynchronously)
---------------------------------------------------------------------------------------------------------------

The following container class is supposed to receive the contents of its property \`.data\` asynchronously. This is our first attempt:

    class DataContainer {
      #data; // (A)
      constructor() {
        Promise.resolve('downloaded')
          .then(data => this.#data = data); // (B)
      }
      getData() {
        return 'DATA: '+this.#data; // (C)
      }
    }
    

Key issue of this code: Property \`.data\` is initially \`undefined\`.

    const dc = new DataContainer();
    assert.equal(dc.getData(), 'DATA: undefined');
    setTimeout(() => assert.equal(
      dc.getData(), 'DATA: downloaded'), 0);
    

In line A, we declare the [private field](https://2ality.com/2019/07/private-class-fields.html) \`.#data\` that we use in line B and line C.

The Promise inside the constructor of \`DataContainer\` is settled asynchronously, which is why we can only see the final value of \`.data\` if we finish the current task and start a new one, via \`setTimeout()\`. In other words, the instance of \`DataContainer\` is not completely initialized, yet, when we first see it.

Solution: Promise-based constructor [#](#solution%3A-promise-based-constructor)
-------------------------------------------------------------------------------

What if we delay access to the instance of \`DataContainer\` until it is fully initialized? We can achieve that by returning a Promise from the constructor. By default, a constructor returns a new instance of the class that it is part of. We can override that if we explicitly return an object:

    class DataContainer {
      #data;
      constructor() {
        return Promise.resolve('downloaded')
          .then(data => {
            this.#data = data;
            return this; // (A)
          });
      }
      getData() {
        return 'DATA: '+this.#data;
      }
    }
    new DataContainer()
      .then(dc => assert.equal( // (B)
        dc.getData(), 'DATA: downloaded'));
    

Now we have to wait until we can access our instance (line B). It is passed on to us one the data was “downloaded” (line A). There are two possible sources of errors in this code:

*   The download may fail and produce a rejection.
*   An exception may be thrown in the body of the first \`.then()\` callback.

In either case, the errors become rejections of the Promise that is returned from the constructor.

Pros and cons:

*   A benefit of this approach is that we can only access the instance once it is fully initialized. And there is no other way of creating instances of \`DataContainer\`.
*   A disadvantage is that it may be surprising to have a constructor return a Promise instead of an instance.

### Using an immediately-invoked asynchronous arrow function [#](#using-an-immediately-invoked-asynchronous-arrow-function)

Instead of using the Promise API directly to create the Promise that is returned from the constructor, we can also use an asynchronous arrow function that [we invoke immediately](https://exploringjs.com/impatient-js/ch_async-functions.html#immediately-invoked-async-arrow-functions):

    constructor() {
      return (async () => {
        this.#data = await Promise.resolve('downloaded');
        return this;
      })();
    }
    

Solution: static factory method [#](#solution%3A-static-factory-method)
-----------------------------------------------------------------------

Our next attempt is to implement a _static factory method_. That is, \`DataContainer\` now has the static method \`.create()\` which returns Promises for instances of \`DataContainer\`:

    class DataContainer {
      #data;
      static async create() {
        const data = await Promise.resolve('downloaded');
        return new this(data);
      }
      constructor(data) {
        this.#data = data;
      }
      getData() {
        return 'DATA: '+this.#data;
      }
    }
    DataContainer.create()
      .then(dc => assert.equal(
        dc.getData(), 'DATA: downloaded'));
    

Pros and cons:

*   A benefit of this approach is that the constructor becomes simple.
*   A disadvantage of this approach is that it’s now possible to create instances that are incorrectly set up, via \`new DataContainer()\`.

### Improvement: private constructor via secret token [#](#improvement%3A-private-constructor-via-secret-token)

If we want to ensure that instances are always correctly set up, we must ensure that only \`DataContainer.create()\` can invoke the constructor of \`DataContainer\`. We can achieve that via a secret token:

    const secretToken = Symbol('secretToken');
    class DataContainer {
      #data;
      static async create() {
        const data = await Promise.resolve('downloaded');
        return new this(secretToken, data);
      }
      constructor(token, data) {
        if (token !== secretToken) {
          throw new Error('Constructor is private');
        }
        this.#data = data;
      }
      getData() {
        return 'DATA: '+this.#data;
      }
    }
    DataContainer.create()
      .then(dc => assert.equal(
        dc.getData(), 'DATA: downloaded'));
    

Assuming that \`secretToken\` and \`DataContainer\` reside in the same module, outside parties don’t have access to \`secretToken\` and therefore can’t create instances of \`DataContainer\`.

Pros and cons:

*   Benefit: safe and straightforward.
*   Disadvantage: slightly verbose.

### Improvement: constructor throws, factory method borrows the class prototype [#](#improvement%3A-constructor-throws%2C-factory-method-borrows-the-class-prototype)

The following variant of our solution disables the constructor of \`DataContainer\` and uses a trick to create instances of it another way (line A):

    class DataContainer {
      static async create() {
        const data = await Promise.resolve('downloaded');
        return Object.create(this.prototype)._init(data); // (A)
      }
      constructor() {
        throw new Error('Constructor is private');
      }
      _init(data) {
        this._data = data;
        return this;
      }
      getData() {
        return 'DATA: '+this._data;
      }
    }
    DataContainer.create()
      .then(dc => {
        assert.equal(dc instanceof DataContainer, true); // (B)
        assert.equal(
          dc.getData(), 'DATA: downloaded');
      });
    

Internally, an instance of \`DataContainer\` is any object whose prototype is \`DataContainer.prototype\`. That’s why we can create instances via \`Object.create()\` (line A) and that’s why \`instanceof\` works in line B.

Pros and cons:

*   Benefit: elegant; \`instanceof\` works.
*   Disadvantages:
    *   Creating instances is not completely prevented. To be fair, though, the work-around via \`Object.create()\` can also be used for our previous solutions.
    *   We can’t use [private fields](https://2ality.com/2019/07/private-class-fields.html) and [private methods](https://2ality.com/2019/07/private-methods-accessors-in-classes.html) in \`DataContainer\`, because those are only set up correctly for instances that were created via the constructor.

### Improvement: instances are inactive by default, activated by factory method [#](#improvement%3A-instances-are-inactive-by-default%2C-activated-by-factory-method)

Another, more verbose variant is that, by default, instances are switched off via the flag \`.#active\`. The initialization method \`.#init()\` that switches them on cannot be accessed externally, but \`Data.container()\` can invoke it:

    class DataContainer {
      #data;
      static async create() {
        const data = await Promise.resolve('downloaded');
        return new this().#init(data);
      }
    
      #active = false;
      constructor() {
      }
      #init(data) {
        this.#active = true;
        this.#data = data;
        return this;
      }
      getData() {
        this.#check();
        return 'DATA: '+this.#data;
      }
      #check() {
        if (!this.#active) {
          throw new Error('Not created by factory');
        }
      }
    }
    DataContainer.create()
      .then(dc => assert.equal(
        dc.getData(), 'DATA: downloaded'));
    

The flag \`.#active\` is enforced via the private method \`.#check()\` which must be invoked at the beginning of every method.

The major downside of this solution is its verbosity. There is also a risk of forgetting to invoke \`.#check()\` in each method.

### Variant: separate factory function [#](#variant%3A-separate-factory-function)

For completeness sake, I’ll show another variant: Instead of using a static method as a factory you can also use a separate stand-alone function.

    const secretToken = Symbol('secretToken');
    class DataContainer {
      #data;
      constructor(token, data) {
        if (token !== secretToken) {
          throw new Error('Constructor is private');
        }
        this.#data = data;
      }
      getData() {
        return 'DATA: '+this.#data;
      }
    }
    
    async function createDataContainer() {
      const data = await Promise.resolve('downloaded');
      return new DataContainer(secretToken, data);
    }
    
    createDataContainer()
      .then(dc => assert.equal(
        dc.getData(), 'DATA: downloaded'));
    

Stand-alone functions as factories are occasionally useful, but in this case, I prefer a static method:

*   The stand-alone function can’t access private members of \`DataContainer\`.
*   I prefer the way \`DataContainer.create()\` looks.

Subclassing a Promise-based constructor (advanced) [#](#subclassing-a-promise-based-constructor-(advanced))
-----------------------------------------------------------------------------------------------------------

In general, subclassing is something to use sparingly.

With a separate factory function, it is relatively easy to extend \`DataContainer\`.

Alas, extending the class with the Promise-based constructor leads to severe limitations. In the following example, we subclass \`DataContainer\`. The subclass \`SubDataContainer\` has its own private field \`.#moreData\` that it initializes asynchronously by hooking into the Promise returned by the constructor of its superclass.

    class DataContainer {
      #data;
      constructor() {
        return Promise.resolve('downloaded')
          .then(data => {
            this.#data = data;
            return this; // (A)
          });
      }
      getData() {
        return 'DATA: '+this.#data;
      }
    }
    
    class SubDataContainer extends DataContainer {
      #moreData;
      constructor() {
        super();
        const promise = this;
        return promise
          .then(_this => {
            return Promise.resolve('more')
              .then(moreData => {
                _this.#moreData = moreData;
                return _this;
              });
          });
      }
      getData() {
        return super.getData() + ', ' + this.#moreData;
      }
    }
    

Alas, we can’t instantiate this class:

    assert.rejects(
      () => new SubDataContainer(),
      {
        name: 'TypeError',
        message: 'Cannot write private member #moreData ' +
          'to an object whose class did not declare it',
      }
    );
    

Why the failure? A constructor always adds its private fields to its \`this\`. However, here, \`this\` in the subconstructor is the Promise returned by the superconstructor (and not the instance of \`SubDataContainer\` delivered via the Promise).

However, this approach still works if \`SubDataContainer\` does not have any private fields.

Conclusion [#](#conclusion)
---------------------------

For the scenario examined in this blog post, I prefer either a Promise-based constructor or a static factory method plus a private constructor via a secret token.

However, the other techniques presented here can still be useful in other scenarios.

`,
  `
=====================================================================


This blog post compares four ways of looping over Arrays:

*   The \`for\` loop:
    
        for (let index=0; index < someArray.length; index++) {
          const elem = someArray[index];
          // ···
        }
        
    
*   The \`for-in\` loop:
    
        for (const key in someArray) {
          console.log(key);
        }
        
    
*   The Array method \`.forEach()\`:
    
        someArray.forEach((elem, index) => {
          console.log(elem, index);
        });
        
    
*   The \`for-of\` loop:
    
        for (const elem of someArray) {
          console.log(elem);
        }
        
    

\`for-of\` is often the best choice. We’ll see why.

* * *

**Table of contents:**

*   [The for loop \[ES1\]](#the-for-loop-%5Bes1%5D)
*   [The for-in loop \[ES1\]](#the-for-in-loop-%5Bes1%5D)
*   [The Array method .forEach() \[ES5\]](#the-array-method-.foreach()-%5Bes5%5D)
    *   [Breaking from .forEach() – a workaround](#breaking-from-.foreach()-%E2%80%93-a-workaround)
*   [The for-of loop \[ES6\]](#the-for-of-loop-%5Bes6%5D)
    *   [for-of and iterable objects](#for-of-and-iterable-objects)
    *   [for-of and Array indices](#for-of-and-array-indices)
    *   [for-of and the entries (\[index, value\] pairs) of an Array](#for-of-and-the-entries-(%5Bindex%2C-value%5D-pairs)-of-an-array)
*   [Conclusion](#conclusion)

* * *

The \`for\` loop \[ES1\] [#](#the-for-loop-%5Bes1%5D)
---------------------------------------------------

The plain \`for\` loop in JavaScript is old. It already existed in ECMAScript 1. This \`for\` loop logs the index and value of each element of \`arr\`:

    const arr = ['a', 'b', 'c'];
    arr.prop = 'property value';
    
    for (let index=0; index < arr.length; index++) {
      const elem = arr[index];
      console.log(index, elem);
    }
    
    // Output:
    // 0, 'a'
    // 1, 'b'
    // 2, 'c'
    

What are the pros and cons of this loop?

*   It is quite versatile, but alas also verbose when all we want to do is loop over an Array.
*   It is still useful if we don’t want to start looping with the first Array element. None of the other looping mechanisms let us do that.

The \`for-in\` loop \[ES1\] [#](#the-for-in-loop-%5Bes1%5D)
---------------------------------------------------------

The \`for-in\` loop is as old as the \`for\` loop – it also already existed in ECMAScript 1. This \`for-in\` loop logs the keys of \`arr\`:

    const arr = ['a', 'b', 'c'];
    arr.prop = 'property value';
    
    for (const key in arr) {
      console.log(key);
    }
    
    // Output:
    // '0'
    // '1'
    // '2'
    // 'prop'
    

\`for-in\` is not a good choice for looping over Arrays:

*   It visits property keys, not values.
*   As property keys, the indices of Array elements are strings, not numbers ([more information on how Array elements work](https://exploringjs.com/impatient-js/ch_arrays.html#array-indices)).
*   It visits all enumerable property keys (both own and inherited ones), not just those of Array elements.

\`for-in\` visiting inherited properties does have a use case: Looping over all enumerable properties of an object. But even here, I’d prefer iterating over the prototype chain manually because you have more control.

The Array method \`.forEach()\` \[ES5\] [#](#the-array-method-.foreach()-%5Bes5%5D)
---------------------------------------------------------------------------------

Given that neither \`for\` nor \`for-in\` are particularly well suited for looping over Arrays, a helper method was introduced in ECMAScript 5: \`Array.prototype.forEach()\`:

    const arr = ['a', 'b', 'c'];
    arr.prop = 'property value';
    
    arr.forEach((elem, index) => {
      console.log(elem, index);
    });
    
    // Output:
    // 'a', 0
    // 'b', 1
    // 'c', 2
    

This method is really convenient: It gives us access to both Array elements and Array element indices without us having to do much. Arrow functions (which were introduced in ES6) made this method even more syntactically elegant.

The main downsides of \`.forEach()\` are:

*   You can’t use \`await\` in the “body” of this kind of loop.
*   You can’t leave a \`.forEach()\` loop early. In \`for\` loops, we can use \`break\`.

### Breaking from \`.forEach()\` – a workaround [#](#breaking-from-.foreach()-%E2%80%93-a-workaround)

There is a workaround if you want to use a loop like \`.forEach()\` and leave early: \`.some()\` also loops over all Array elements and stops if its callback returns a truthy value.

    const arr = ['red', 'green', 'blue'];
    arr.some((elem, index) => {
      if (index >= 2) {
        return true; // break from loop
      }
      console.log(elem);
      // This callback implicitly returns \`undefined\`, which
      // is a falsy value. Therefore, looping continues.
    });
    
    // Output:
    // 'red'
    // 'green'
    

Arguably, this is an abuse of \`.some()\` and I’m not sure how easy it is to understand this code (compared to \`for-of\` and \`break\`).

The \`for-of\` loop \[ES6\] [#](#the-for-of-loop-%5Bes6%5D)
---------------------------------------------------------

The \`for-of\` loop was added to JavaScript in ECMAScript 6:

    const arr = ['a', 'b', 'c'];
    arr.prop = 'property value';
    
    for (const elem of arr) {
      console.log(elem);
    }
    // Output:
    // 'a'
    // 'b'
    // 'c'
    

\`for-of\` works really well for looping over Arrays:

*   It iterates over Array elements.
*   We can use \`await\`.
    *   And it’s easy to migrate to [\`for-await-of\`](https://exploringjs.com/impatient-js/ch_async-iteration.html#for-await-of), should you need to.
*   We can use \`break\` and \`continue\` – even for outer scopes.

### \`for-of\` and iterable objects [#](#for-of-and-iterable-objects)

An additional benefit of \`for-of\` is that we can loop not just over Arrays, but over any iterable object – for example, over Maps:

    const myMap = new Map()
      .set(false, 'no')
      .set(true, 'yes')
    ;
    for (const [key, value] of myMap) {
      console.log(key, value);
    }
    
    // Output:
    // false, 'no'
    // true, 'yes'
    

Iterating over \`myMap\` produces \[key, value\] pairs which we [destructure](https://exploringjs.com/impatient-js/ch_destructuring.html) to directly access the components of each pair.

### \`for-of\` and Array indices [#](#for-of-and-array-indices)

The Array method \`.keys()\` returns an iterable over the indices of an Array:

    const arr = ['chocolate', 'vanilla', 'strawberry'];
    
    for (const index of arr.keys()) {
      console.log(index);
    }
    // Output:
    // 0
    // 1
    // 2
    

### \`for-of\` and the entries (\[index, value\] pairs) of an Array [#](#for-of-and-the-entries-(%5Bindex%2C-value%5D-pairs)-of-an-array)

The Array method \`.entries()\` returns an iterable over \[index, value\] pairs. If we use \`for-of\` and destructuring with this method, we get convenient access to both indices and values:

    const arr = ['chocolate', 'vanilla', 'strawberry'];
    
    for (const [index, value] of arr.entries()) {
      console.log(index, value);
    }
    // Output:
    // 0, 'chocolate'
    // 1, 'vanilla'
    // 2, 'strawberry'
    

Conclusion [#](#conclusion)
---------------------------

As we have seen, the \`for-of\` loop beats \`for\`, \`for-in\`, and \`.forEach()\` w.r.t. usability.

Any difference in performance between the four looping mechanisms should normally not matter. If it does, you are probably doing something very computationally intensive and switching to WebAssembly may make sense.

`,
  `
===============================================


In this blog post, we look at three approaches for eliminating duplicate objects from Arrays.

Eliminating duplicates from Arrays [#](#eliminating-duplicates-from-arrays)
---------------------------------------------------------------------------

Eliminating duplicate values from Arrays is simple – as long as the values are primitive (and therefore compared by value):

    const values = ['jane', 'lars', 'jane'];
    const uniqueValues = [...new Set(values)];
    assert.deepEqual(
      uniqueValues,
      ['jane', 'lars']);
    

However, that approach doesn’t work with the following data because a Set would consider each object to be unique:

    const members = [
      {
        first: 'Jane',
        last: 'Bond',
        id: '10yejma',
      },
      {
        first: 'Lars',
        last: 'Croft',
        id: '1hhs0k2',
      },
      {
        first: 'Jane',
        last: 'Bond',
        id: '1y15hhu',
      },
    ];
    

Approach 1: building a new Array without duplicates [#](#approach-1%3A-building-a-new-array-without-duplicates)
---------------------------------------------------------------------------------------------------------------

    const uniqueMembers1 = [];
    
    for (const m of members) {
      if (!containsMember(uniqueMembers1, m)) {
        uniqueMembers1.push(m);
      }
    }
    
    function containsMember(memberArray, member) {
      return memberArray.find(
        (m) => m.first === member.first && m.last === member.last);
    }
    
    assert.deepEqual(
      uniqueMembers1,
      [
        {
          first: 'Jane',
          id: '10yejma',
          last: 'Bond',
        },
        {
          first: 'Lars',
          id: '1hhs0k2',
          last: 'Croft',
        },
      ]);
    

We only add an object from \`members\` to \`uniqueMembers1\` if it doesn’t already exist in that Array. That’s why the earlier Jane with ID \`'10yejma'\` “wins”.

Approach 2: using \`.filter()\` [#](#approach-2%3A-using-.filter())
-----------------------------------------------------------------

    // Only keep members m if they appear for the first time
    const uniqueMembers2 = members.filter(
      (m, index, ms) => getIndexOfMember(ms, m) === index);
    
    function getIndexOfMember(memberArray, member) {
      return memberArray.findIndex(
        (m) => m.first === member.first && m.last === member.last);
    }
    
    assert.deepEqual(
      uniqueMembers2,
      [
        {
          first: 'Jane',
          id: '10yejma',
          last: 'Bond',
        },
        {
          first: 'Lars',
          id: '1hhs0k2',
          last: 'Croft',
        },
      ]);
    

\`getIndexOfMember()\` returns the first index where a member appears. We tell \`.filter()\` to only keep the members at those indices. That’s why the first Jane “wins”.

Approach 3: a Map from unique keys to members [#](#approach-3%3A-a-map-from-unique-keys-to-members)
---------------------------------------------------------------------------------------------------

    // Create a Map from [key,value] pairs:
    const uniqueKeyToMember = new Map(
      members.map(m => [m.first+'\t'+m.last, m])); // [key, value]
    const uniqueMembers3 = [...uniqueKeyToMember.values()];
    
    assert.deepEqual(
      uniqueMembers3,
      [
        {
          first: 'Jane',
          id: '1y15hhu',
          last: 'Bond',
        },
        {
          first: 'Lars',
          id: '1hhs0k2',
          last: 'Croft',
        },
      ]);
    

If an object that is added to the Map has the same unique key as a previous object, it replaces that object. That’s why the later Jane with ID \`'1y15hhu'\` “wins”.

### Variants of approach 1 and approach 2 [#](#variants-of-approach-1-and-approach-2)

*   We use a Set to record unique keys of members that we have visited.
*   If the key of the current member is already in that Set, then we don’t push it (approach 1) or filter it out (approach 2).

This may help with large Arrays because we don’t have to search them. On the other hand, creating keys and maintaining a Set affects performance negatively.
`,
  `

====================================


The proposal “[Well-formed \`JSON.stringify\`](https://github.com/tc39/proposal-well-formed-stringify)” (by Richard Gibson) is at [stage 4](http://exploringjs.com/es2016-es2017/ch_tc39-process.html) and therefore part of ECMAScript 2019. This blog post explains how it works.

According to [the RFC for JSON](https://tools.ietf.org/html/rfc8259#section-8.1), if you exchange JSON “in public”, you must encode it as UTF-8. That can be a problem if you use \`JSON.stringify()\`, because it may return sequences of UTF-16 code units that can’t be encoded as UTF-8.

How can that happen? If a JavaScript string contains a _lone surrogate_ (a JavaScript character in the range 0xD800–0xDFFF) then \`JSON.stringify()\` produces a string with a lone surrogate:

    assert.equal(JSON.stringify('\u{D800}'), '"\u{D800}"');
    

Lone UTF-16 surrogates cannot be encoded as UTF-8, which is why this proposal changes \`JSON.stringify()\` so that it represents them via code unit escape sequences:

    assert.equal(JSON.stringify('\u{D800}'), '"\\ud800"');
    

Note: JSON supports code unit escape sequences (e.g. \`\uD800\`), but not code point escape sequences (e.g. \`\u{D800}\`).
`,
  `

==============================

The proposal “[\`Object.fromEntries\`](https://github.com/tc39/proposal-object-from-entries)” (by Darien Maillet Valentine, Jordan Harband and Kevin Gibbons) is at [stage 4](http://exploringjs.com/es2016-es2017/ch_tc39-process.html) and therefore part of ECMAScript 2019. This blog post explains how it works.

\`Object.fromEntries()\` vs. \`Object.entries()\` [#](#object.fromentries()-vs.-object.entries())
---------------------------------------------------------------------------------------------

Given an iterable over \[key,value\] pairs, \`Object.fromEntries()\` creates an object:

    assert.deepEqual(
      Object.fromEntries([['foo',1], ['bar',2]]),
      {
        foo: 1,
        bar: 2,
      }
    );
    

It does the opposite of [\`Object.entries()\`](http://exploringjs.com/es2016-es2017/ch_object-entries-object-values.html):

    const obj = {
      foo: 1,
      bar: 2,
    };
    assert.deepEqual(
      Object.entries(obj),
      [['foo',1], ['bar',2]]
    );
    

Combining \`Object.entries()\` with \`Object.fromEntries()\` helps with implementing a variety of operations related to objects. Read on for examples.

Examples [#](#examples)
-----------------------

In this section, we’ll use \`Object.entries()\` and \`Object.fromEntries()\` to implement several tool functions from the library [Underscore](https://underscorejs.org).

### \`_.pick(object, ...keys)\` [#](#_.pick(object%2C-...keys))

[\`pick()\`](https://underscorejs.org/#pick) removes all properties from \`object\` whose keys are not among \`keys\`. The removal is _non-destructive_: \`pick()\` creates a modified copy and does not change the original. For example:

    const address = {
      street: 'Evergreen Terrace',
      number: '742',
      city: 'Springfield',
      state: 'NT',
      zip: '49007',
    };
    assert.deepEqual(
      pick(address, 'street', 'number'),
      {
        street: 'Evergreen Terrace',
        number: '742',
      }
    );
    

We can implement \`pick()\` as follows:

    function pick(object, ...keys) {
      const filteredEntries = Object.entries(object)
        .filter(([key, _value]) => keys.includes(key));
      return Object.fromEntries(filteredEntries);
    }
    

### \`_.invert(object)\` [#](#_.invert(object))

[\`invert()\`](https://underscorejs.org/#invert) non-destructively swaps the keys and the values of an object:

    assert.deepEqual(
      invert({a: 1, b: 2, c: 3}),
      {1: 'a', 2: 'b', 3: 'c'}
    );
    

We can implement it like this:

    function invert(object) {
      const mappedEntries = Object.entries(object)
        .map(([key, value]) => [value, key]);
      return Object.fromEntries(mappedEntries);
    }
    

### \`_.mapObject(object, iteratee, context?)\` [#](#_.mapobject(object%2C-iteratee%2C-context%3F))

[\`mapObject()\`](https://underscorejs.org/#mapObject) is like the Array method \`.map()\`, but for objects:

    assert.deepEqual(
      mapObject({x: 7, y: 4}, value => value * 2),
      {x: 14, y: 8}
    );
    

This is an implementation:

    function mapObject(object, callback, thisValue) {
      const mappedEntries = Object.entries(object)
        .map(([key, value]) => {
          const mappedValue = callback.call(thisValue, value, key, object);
          return [key, mappedValue];
        });
      return Object.fromEntries(mappedEntries);
    }
    

### \`_.findKey(object, predicate, context?)\` [#](#_.findkey(object%2C-predicate%2C-context%3F))

[\`findKey()\`](https://underscorejs.org/#findKey) returns the key of the first property for which \`predicate\` returns \`true\`:

    const address = {
      street: 'Evergreen Terrace',
      number: '742',
      city: 'Springfield',
      state: 'NT',
      zip: '49007',
    };
    assert.equal(
      findKey(address, (value, _key) => value === 'NT'),
      'state'
    );
    

We can implement it as follows:

    function findKey(object, callback, thisValue) {
      for (const [key, value] of Object.entries(object)) {
        if (callback.call(thisValue, value, key, object)) {
          return key;
        }
      }
      return undefined;
    }
    

An implementation [#](#an-implementation)
-----------------------------------------

\`Object.fromEntries()\` could be implemented as follows (I’ve omitted a few checks):

    function fromEntries(iterable) {
      const result = {};
      for (const [key, value] of iterable) {
        let coercedKey;
        if (typeof key === 'string' || typeof key === 'symbol') {
          coercedKey = key;
        } else {
          coercedKey = String(key);
        }
        Object.defineProperty(result, coercedKey, {
          value,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      return result;
    }
    

The official polyfill is available via [the npm package \`object.fromentries\`](https://github.com/es-shims/Object.fromEntries).

A few more details about \`Object.fromEntries()\` [#](#a-few-more-details-about-object.fromentries())
---------------------------------------------------------------------------------------------------

*   Duplicate keys: If you mention the same key multiple times, the last mention “wins”.
    
        > Object.fromEntries([['a', 1], ['a', 2]])
        { a: 2 }
        
    
*   Symbols as keys: Even though \`Object.entries()\` ignores properties whose keys are symbols, \`Object.fromEntries()\` accepts symbols as keys.
*   Coercion of keys: The keys of the \[key,value\] pairs are coerced to property keys: Values other than strings and symbols are coerced to strings.
*   Iterables vs. Arrays:
    *   \`Object.entries()\` returns an Array (which is consistent with \`Object.keys()\` etc.). Its \[key,value\] pairs are 2-element Arrays.
    *   \`Object.fromEntries()\` is flexible: It accepts iterables (which includes Arrays and is consistent with \`new Map()\` etc.). Its \[key,value\] pairs are only required to be objects that have properties with the keys \`'0'\` and \`'1'\` (which includes 2-element Arrays).
*   Only enumerable data properties are supported: If you want to create non-enumerable properties and/or non-data properties, you need to use [\`Object.defineProperty()\` or \`Object.defineProperties()\`](http://speakingjs.com/es5/ch17.html#functions_for_property_descriptors).

`,
];

module.exports = articles;
