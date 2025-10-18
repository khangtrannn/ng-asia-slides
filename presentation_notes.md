https://angular.love/running-change-detection-manual-control

https://angular.love/level-up-your-reverse-engineering-skills
https://angular.love/these-5-articles-will-make-you-an-angular-change-detection-expert

https://angular.love/what-every-front-end-developer-should-know-about-change-detection-in-angular-and-react
https://www.youtube.com/watch?v=DsBy9O0c6eo

I think all of us is not strange to NG100. One of the goal of inducing Angular Signals is *Better guardrails to avoid common pitfalls that lead to poor change detection performance and avoid common pain points such as `ExpressionChangedAfterItHasBeenChecked` errors*. In this article, we will reveal how Signals can solve this pain points obstacle.

[Presentation](https://www.notion.so/Presentation-28ee19a9ad0380949887e4566b698244?pvs=21)

![image.png](attachment:949120af-039c-4259-9010-c2a235cd872c:image.png)

**Overview about change detection**

**Change detection** is the process through which Angular checks to see whether your application state has changed, and if any DOM needs to be updated. At a high level, Angular walks your components from top to bottom, looking for changes. Angular runs its change detection mechanism periodically so that changes to the data model are reflected in an application’s view. Change detection can be triggered either manually or through an asynchronous event (for example, a user interaction or an XMLHttpRequest completion).

**Web development 101**

Plain example about Javascript that need to trigger change detection manually

→ Issue if we use setTimeout, because the change detection is triggered synchronously

→ trigger change detection automatically with Zone.js

---

### Zone.js

Two capabilities that Zone provides:

- Context propagation
- Outstanding asynchronous

While there are no DOM events, and no async code execution — no CD cycles will be scheduled and our browser has time to rest (and render the changes we requested).

Event binding without handling still trigger change detection. `mousemove` for example, or scroll

One thing that need to be clear that Zone.js doesn’t handle the change detection. It just acts like a notifier. `applicationRef.tick` will handle the change detection part.

```jsx
k.increment();

// once increment finishes component and ancestors are marked for refresh
k.markAsDirty();

// after marking the application tree is traversed to detect changes
applicationRef.tick();
```

When is the right time for change detection to be triggered? Since a component’s method has to finish executing before change detection runs, there needs to be a notification mechanism to inform the framework and run the change detection logic at the correct time so that the affected component and its views are correctly updated.

```jsx
// app.config.ts
{
	provide: NgZone,
	useClass: ɵNoopNgZone
}

@Component({

})
export class App {
	appRef = inject(ApplicationRef);
	title = 'Original';
	
	changeName() {
		this.title = 'Updated';
		this.appRef.tick();
	}
}

// With about using ngZone.run
changeName() {
	this.ngZone.run(() => {
		this.title = 'Updated';
	});
}
```

Sometimes you may see that [`NgZone.run`](http://NgZone.run) is recommended as way to run change detection globally. But as explained in the [Auto run with Zones](https://angular.love/running-change-detection-autorun-with-zones/) chapter, the `run` method simply evaluates the callback function inside the Angular zone. There’s not explicit call to `ApplicationRef.tick()` inside. This means that if there’s no event notification from Angular zone when the callback has finished executing, change detection will not happen automatically.

As opposed to React, change detection in Angular can be triggered completely automatically as a result of any async event in a browser.

What’s interesting is that you can have many different zones on a web page. One of them is going to be `NgZone` . It’s created when Angular bootstraps. This is the zone that the Angular application runs in. And Angular **only** gets notifications about events that occur inside this zone.

But, `zone.js` also provides an API to run some code in a zone other than the Angular zone. Angular is not notified about async events happening in other zones. And no notification means no change detection. The method name to do this is called `runOutsideAngular` and it’s implemented by the `NgZone` service. 

NgZone has `isStable` property that denotes whether there are no outstanding micro and macro tasks.

| Event | Description |
| --- | --- |
| onUnstatble | Notifies when code enters Angular Zone. This gets fired first on VM Turn. |
| onMicrotaskEmpty | Notifies when there is no more microtasks enqueued in the current VM Turn. This is a hint for Angular to do change detection which may enqueue more microtasks.  For this reason this event can fire multiple times per VM Turn. |
| onStable | Notifies when the last `onMicotaskEmpty` has run and there are no more microtasks, which implies we are about to relinquish VM turn. This event gets called just once. |
| onError | Notifies that an error hsa been delivered |

### Component views and bindings

All components in Angular internally are represented in a data structure known as the view. Angular’s compiler parses a template and creates the bindings. Each binding defines a property of a DOM element to update and the expression used to obtain the value. The previous values used for comparison during change detection are stored on a view in the `oldValues` property. During change detection Angular runs over the bindings, evaluates expressions, compares them to the previous values and updates the DOM if necessary. After each change detection cycle, Angular runs a check to ensure the component state is in sync with user interface. This check is performed synchronously and my throw the `ExpressionChangedAfterItHasBeenCheck`  error.

There are two main building blocks of change detection in Angular:

- A component view
- The associated bindings

A View is a fundamental building block of the application UI. It is the smallest grouping of Elements which are created and destroyed together. Properties of elements in a View can change, but the structure (number and order) of elements in a View cannot. Changing the structure of Elements can only be done by inserting, moving or removing nested Views via a ViewContainerRef. Each View can contain many View Containers.

Each view has a link to its child views through nodes property and hence can perform actions on child views.

When an asynchronous event takes place, Angular triggers change detection on its top-most ViewRef, which after running change detection for itself runs change detection for its child views.

Every component in Angular has a template with HTML elements. When Angular creates the DOM nodes to render the contents of the template on the screen, it needs a place to store the references to those DOM nodes. For the purpose, internally there’s a data structure known as View. It’s also used to store the reference to the component instance and the previous values of binding expressions. There’s a one to one relationship between a component and a view.

![image.png](attachment:4dca697e-3c02-4ae6-83cd-b9f7c0e187a5:image.png)

As the compiler analyzes the template, it identifies properties of the DOM elements that may need to be updated during change detection. For each such property, the compiler creates a **binding**. The binding defines the property name to update and the expression  that Angular uses to obtain a new value.

When Angular checks a view, it simply runs over all bindings generated for a view by the compiler. It evaluates expressions and compares their result to the values stored in the `oldValues` array on the view. *That’s where the name dirty checking comes from.* If it detects the difference, it updates the DOM property relevant to the binding. And it also needs to puts for child components. the new value into the `oldValues` array on the view. Once Angular is done checking the current component, it repeats exactly the same step.

```tsx

```

In our application, there’s only one binding property `textContent` of the **span** element in the **App** component. So during the change detection Angular reads the value of the component’s property `time` , applies the `date` pipe, and compares it to the previous value stored on the view. If it detects a difference, Angular update the `textContent` property of the **span** and the `oldValues` array.

**But where does the error come from?**

After eahc change detection cycle, in the development mode, Angular **synchronously** runs another check *(checkNoChanges pass*) to ensure that expressions produce the same values as during the preceding  change detection run. It runs after the check is finished for the entire tree of components and performs exactly the same steps. However, this time, as Angular detects the difference, it doesn’t update the DOM. Instead, it throws the `ExpressionChangedAfterItHasBeenCheckedError` .

**But why does Angular need this check?**

Well, imagine that some properties of components have been updated during the change detection run. As a result, expressions produce new values that are inconsistent with what’s rendered in the user interface. So, what does Angular do? It certainly could run another change detection cycle to synchronize the application state with the user interface. But what if during that process some properties are updated again? See the pattern? Angular could actually end up in an infinite loop of change detection runs.

To avoid that situation, Angular imposed the so-called Unidirectional Data Flow. And this check that runs after change detection the resulting `ExpressionChangedAfterItHasBeenCheckedError` error is the enforcement mechanism. Once Angular has processed bindings for the current component, you can no longer update the properties of the component that are used in expressions for bindings.

**Fix the error**

To prevent the error, we need to ensure that the values returned by expressions during the change detection and the following check are the same. 

We learned earlier that the check that produces the error runs **synchronously** right after the change detection cycle. So if we update it **asynchronously**, we will avoid the error.

### detectChanges

This so-called local change detection cycle. This method is available on the change detector service that is created by Angular for each component. It is used to explicitly process change detection and its side-effects for the tree of components starting with the component that you trigger `detectChanges()` on.

Under the hood `detectChanges` simply calls `refreshView` function.

```jsx
export class ViewRef implements ChangeDetectorRef_interface {
	constructor(public _lView: LView, ...) {}
	
	detectChanges() {
		detectChangesInternal(this._lView[TVIEW], this._lView, this.context);
	}
}

export function detectChangesInternal(tView, lView, context, ...) {
	try {
		refreshView(tView, lView, tView.template, context);
	} catch (error) { ... } finally { ... }
}
```

A Change Detector service is basically a shallow wrapper around a component container implemented through `LView`. When a `ViewRef` is created for components the `LView` associated with the component is injected into the constructor. When `ViewRef` is created for an embedded view, the `LView` that it receives also describes the embedded view, not the component.

![image.png](attachment:92d674be-fd35-48b4-bb5d-30ee40264c5c:image.png)

Angular implements a different subtype of a `ViewRef` for each type of views:

- `ViewRef` is used for component views
- `EmbededViewRef` is used for embedded views
- `InternalViewRef` is used for root/host views

---

### NgDoCheck

There’s an unexpected behaviour related to `detectChanges` . The `ngDoCheck` hook is not triggered for the component that you trigger `detectChanges` on. This happens because lifecycle hooks are executed on child components when checking their parents, not the current component on which the call is made.

The order of `ngDoCheck` hook

```tsx
@Component({
	selector: "a-cmp",
	template: `A`,
})
export class A {
	ngDoCheck() {
		console.log("A");
	}
}
```

![](https://wp.angular.love/wp-content/uploads/2024/08/8-1.gif)

The `NgDoCheck` is executed before Angular will run change detection for the component but during the check of the parent component. This is where we’ll put the logic to compare values and manually mark component as dirty when detecting the change.

```tsx
@Component({
	selector: 'child',
	template: `
		<span>User name: {{user.name}}</span>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class Child {
	@Input() user;
	previousUsername = '';
	
	constructor(private cd: ChangeDetectorRef) {}
	
	ngDoCheck() {
		if (this.user.name !== this.previousUsername() {
			this.cd.markForCheck();
			this.previousUsername = this.user.name;
		}
	}
}
```

### markForCheck

Remember that `markForCheck` neither triggers nor guarantees change detection run.

**How do detect if change detection was triggered?**

**Incremental DOM update**

**Component tree (Change detector ref)**

Each Angular component has an associated change detector, which is created at application startup time.

**Default change detection vs OnPush (CheckOnce) Change detection**

Introduce that everything will be broken after switching to `OnPush`, using `AsyncPipe` to obscue

**When and How?**

## **Unidirectional data flow**

With Signals, it enable `bi-directional flow`

Angular enforces so-called unidirectional data flow form top to bottom. The essence of this convention is that data flows from the parent to the child, but not the other way around. IF the parent state changes, and there are input bindings to child components, those changes are pushed down to the child component during the rendering (change detection) process.

It’s super important to understand that Angular update bindings during change detection.

So when the framework runs change detection for the parent component A it will update the prop input binding on the child component B. This means that change detection is also always performed from top to bottom for every single component, every single time, starting from the root component.

If the child state changes and the parent somehow depends on those changes, the child needs to explicitly send an event back up to the parent with the changed data. There’s no built-in mechanism that tracks those changes in the child component and auto-magically propagates them back to the parent.
What if child doesn’t explicitly send an event back up to the parent → NG100

This is what is called unidirectional data flow. Application state gets stable after **a single pass of change detection.** ⇒ *efficient & predictable & we always know where the data we use in our views comes from, because it can only result from its parent component.*

During change detection, Angular checks each component and updates the view. If a checked component changes again in the same run, its template values no longer match what’s on the screen. Angular could try to fix this by running change detection again. But if updates keep happening, it could fall into an endless loop, chasing changes that never stop. That’s why, once Angular finishes checking a component, its bound properties must stay the same for the rest of that cycle.

```tsx
MAXIMUM_REFRESH_RERUNS = 10;
private synchronize(): void {
	if ((typeof ngDevMode === 'undefined' || ngDevMode) && runs >= MAXIMUM_REFRESH_RERUNS) {
      throw new RuntimeError(
        RuntimeErrorCode.INFINITE_CHANGE_DETECTION,
        ngDevMode &&
          'Infinite change detection while refreshing application views. ' +
            'Ensure views are not calling `markForCheck` on every template execution or ' +
            'that afterRender hooks always mark views for check.',
      );
    }
}

// typeof ngDevMode === 'undefined' (default development)
// ngDevMode = true (explicit development)
// ngDevMode = false (production)
```

### Enforcing unidirectional flow

In the development mode Angular enforces unidirectional data flow by running an extra check after regular change detection cycle. This check includes comparing the current values of component properties and expressions in the template to the ones Angular used and remembered during the preceding change detection cycle. If any of the values are different, the framework throws an infamous error NG100.

Although there’s no built-in mechanism in Angular that can cause parent component model update during change detection, it’s still possible to do cause that affect unintentionally through a variety of mechanisms: injecting parent component reference, a shared service or synchronous event broadcasting.

### Child to parent communication

In Angular, the notification mechanism from a child component to its parent is implemented through output bindings, often referred to as component events. It looks like this:

```tsx
// parent component
@Component({
	template: `
		<h1>Hello {{ value.name }}</h1>
		<child-comp (updateObj)="value = $event" />
	`
})
export class AppComponent {
	value = { name: 'initial' };
	
	constructor() {
		setTimeout(() => {
			console.log(this.value); // logs { name: 'updated' }
		}, 3000);
	}
}

// child component
@Component(...)
export class ChildComponent {
	@Output() updateObj = new EventEmitter();
	
	constructor() {
		setTimeout(() => {
			this.updateObj.emit({ name: 'updated' });
		}, 2000);
	}
}
```

Component events are most often broadcasted from within the event handlers which are attached to UI events, network events or timers. Since those events are triggered **before** Angular runs the change detection cycle, it’s perfectly fine to emit an event that will result to a parent component update. In fact, those browser events is what most often triggers change detection. The assumption is that event handlers might change the application state so Angular needs to process side effects, like synchronizing component state with the DOM.

However, if the emitted event leads to updates of a parent component properties, and those properties are processed during change detection, i.e. template expressions, the event must be emitted outside of the Angular’s change detection loop. Otherwise this will lead to the properties of a parent component being updated inside the change detection cycle leading to the `ExpressionChangedAfterItHasBeenCheckedError` error.

Sometimes the event is emitted synchronously from inside the handler that is being executed during the change detection loop.

It’s OK as long as the logic that reacts to the event updates the properties of a parent component before Angular completes the check of the parent component.

---

## **Dirtiness + Dirty marking**

## **Inside Angular Compiler**

The template is just a blueprint, a set of instructions. The process of converting these instructions into real DOM nodes is called “**rendering**” and Angular does it for us.

In Angular, when the compiler analyzes the template, it identifies properties of a component that are associated with DOM elements. For each such association, the compiler creates a binding.

A binding defines a relationship between a component's property (usually wrapped in some expression) and the DOM element property. The change detection mechanism executes instructions that process bindings.

The job of these instructions is to check if the value of an expression with a component property has changed and perform DOM updates if necessary. Processing bindings that perform dirty checks and update the relevant parts of the DOM are the core operations of change detection in Angular.

**DOM updates overview**

```tsx
[className]="'fa-star ' + (rating > value ? 'fas' : 'far')"
```

For this part of the template, the compiler generates instructions that set up a binding, performs dirty checks and update the DOM.

```tsx
if (changeDetectionPhase) {
    property("className", "fa-star " + (ctx.rating > 0 ? "fas" : "far"));
}
```

```tsx
export function property(propName, value, ...) {
    const lView = getLView();
    const bindingIndex = nextBindingIndex();

    if (bindingUpdated(lView, bindingIndex, value)) {
        const tView = getTView();
        const tNode = getSelectedTNode();
        elementPropertyInternal(tView, tNode, lView, propName, value, ...);
    }

    return property;
}
```

First we get a reference to the LView, which is a container for Angular components and all relevant data. The using `nextBindingIndex` we retrieve the index the LView that holds information about the binding on the `propName`. In our case it's the `className` property.

The `bindingUpdated` function evaluates the expression and uses it to compare to the previous value remembered by the binding. This is where the name "dirty checking" comes from. If the value has changed, it updates the current value and returns `true`;

```tsx
function bindingUpdated(lView, bindingIndex, value) {
    const oldValue = lView[bindingIndex];

    if (Object.is(oldValue, value)) {
        return false;
    } else {
        ...
        lView[bindingIndex] = value;
        return true;
    }
}
```

If the expression changed, Angular runs `elementPropertyInternal` function that uses the new value to update the DOM. In our case it will update the `className` property of the list item.

```tsx
function elementPropertyInternal() {
    ...
    renderer.setProperty(element, propName, value); // propName = 'className'
}
```

The `property` function returns itself so that it may be chained:

```tsx
property("name", ctx.name)("title", ctx.title);
```

**Order of checks**

We need to know when Angular executes instructions that process bindings.

Angular runs change detection for each component in the depth-first order.

Operations that result in DOM and binding updates are executed in the proper depth-first order. I’m using the function `logRender` to log exactly when Angular updates the template and executes the function to evaluate the template expression:

```tsx
@Component({
	selector: "a-cmp",
	template: `{{ logRender() }}`
})
export class A {
	logRender() {
		console.log("A");
	}
}
```

![](https://wp.angular.love/wp-content/uploads/2024/08/7-1.gif)

- **to explicitly tell the framework** that something has changed or there’s a possibility of a change so it should run change detection. (`ChangeDetectorRef`)
- `Zone.js` : It patches all asynchronous events in a browser and can then notify Angular when a certain event occurs. Similarly to UI events, Angular can then wait until the application code has finished executing and initiate change detection automatically.

**Instructions**

***ɵɵproperty***

- If the property name also exists as an input property on one of the element’s directives, the component property will be set instead of the element property. This check must be conducted at runtime so child components that add new `@Inputs` don’t have to be re-compiled.
- This function returns itself so that it may be chained (e.g. `property('name', ctx.name)('title', ctx.title)`

## OnPush strategy

Angular implements two strategies that control change detection behavior on the level of individual components:

```tsx
export enum ChangeDetectionStrategy {
	Default,    // CheckAlways
	OnPush      // CheckOnce
	            // change detection is skipped unless a component is marked as dirty
}
```

What’s known as `OnPush` strategy, internally referred to as `CheckOnce` , implies that change detection is skipped unless a component is marked as dirty. Angular implements mechanisms to automatically mark a component as dirty.

For the `OnPush` strategy the `Dirty` flag will be automatically unset after the first change detection pass.

**shouldRefreshView**

‘continues to refresh views until none are dirty’

The flags set on `LView` are checked inside the `detectChangesInView` function when Angular determines whether a component should be check:

Visits a view as part of change detection traversal.

The view is refreshed if:

- If the view is `CheckAlways` or `Dirty` and ChangeDetectionMode is `Global`
- If the view has the `RefreshView` flag

The view is not refreshed, but descendants are traversed in `ChangeDetectionMode.Targeted` if the view `HasChildViewsToRefresh`  flag is set.

```tsx
function detectChangesInView(lView: LView, mode: ChangeDetectionMode) {
	const isInCheckNoChangesPass = ngDevMode && isInCheckNoChangesMode();
	const flags = lView[FLAGS];
	const consumer = lView[REACTIVE_TEMPLATE_CONSUMER];
	
	
	// Refresh CheckAlways views in Global mode.
	let shouldRefreshView: boolean = !!(
		mode === ChangeDetectionMode.Global && flags & LViewFlags.CheckAlways
	);
	
	// Refresh Dirty views in Global mode, as long as we're not in checkNoChanges.
	// CheckNoChanges never worked with `OnPush` components because the `Dirty` flag was
	// cleared before checkNoChanges ran. Because there is now a loop for to check for
	// backwards views, it gives an opportunity for `OnPush` components to be marked `Dirty`
	// before the CheckNoChanges pass. We don't want exisiting errors that are hidden by the
	// current CheckNoChanges bug to surface when marking unrelated changes.
	shouldRefreshView ||= !!(
		flags & LViewFlags.Dirty &&
		mode === ChangeDetectionMode.Global &&
		!isInCheckNoChangesPass
	);
	
	// Always refresh views marked for refresh, regardless of mode.
	shouldRefreshView ||= !!(flags & LViewFlags.RefreshView);
	
	// Refresh views when they have a dirty reactive consumer, regardless of mode.
	shouldRefreshView ||= (consumer?.dirty && consumerPollProducersForChange(consumer))
	
}
```

If a parent component isn’t checked, Angular won’t run change detection for the child component even if it uses default change detection strategy. This comes from the fact that Angular runs check for a child component as part of checking its parent.

An example of the enforced workflow is object immutability that’s passed through `@Input` bindings.
While the reference to the `user` object hasn’t changed, it has been mutated inside but we can still see the new name rendered on the screen. *That is why the default behavior is to check all components. Without the object immutability restriction in place Angular, can’t know if inputs have changed and caused an update to the component’s state.*

🅰️ TODO:  why the B is displayed on the screen? → Because of the `click`

```tsx
@Component({
	selector: 'a-op',
	template: `
		<button (click)="changeName()">Change name</button>
		<b-op [user]="user"></b-op>
	`	
})
export class AOpComponent {}

@Component({
	selector: 'b-op',
	template: `<span>User name: {{ user.name }}</span>`
})
export class BOpComponent {
	@Input() user;
}
```

While Angular does not force object immutability on us, it gives us a mechanism to declare a component as having immutable inputs to reduce the number of times a component is checked. Internally this strategy is called `CheckOnce`, as it implies that change detection is skipped for a component until it’s marked as dirty, then checked once, and then skipped again. A component can be marked dirty either automatically or manually using `markForCheck` method.

Testing `OnPush` behavior

```tsx
should skip OnPush components in update mode when they are not dirty
should not check OnPush components in update mode when parent events occur

should check OnPush components on initilization
should call doCheck even when OnPush components are not dirty
should check OnPush components in update mode when inputs change
should check OnPush components in update mode when component events occur
should check parent OnPush components in update mode when child events occur
should check parent OnPush components when child directive on a template emits event
```

**Bound UI events**

All native events, when triggered on a current component, will mark dirty all ancestors of the component up to the root component. The assumptions that an event could trigger change in the components tree. Angular doesn’t know if the parents will change or not. This is why always checks every component after an event has been fired.

### AsyncPipe

```tsx
@Component({
	selector: 'greeny',
	template: `
		<span>User name: {{ user.name }}</span>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Greeny {
	@Input() user$;
	user = null;
	
	constructor(private cd: ChangeDetectorRef) {}
	
	// Option 1
	ngOnChanges() {
		this.user$.subscribe((user) => {
			if (user !== this.user) {
				this.cd.markForCheck();
				this.user = user;
			}
		});
	}
	
	// Option 2
	ngOnChanges() {
		this.user$.subscribe((user) => {
			if (this.user.name !== user.name) {
				this.cd.markForCheck();
				this.user = user;
			}
		});
	}
}
```

This logic inside the `ngOnChanges` is almost exactly what the async pipe is doing:

```tsx
export class AsyncPipe {
	transform() {
		if (obj) {
			this._subscribe(obj);
		}
	}
	
	private _updateLatestValue(async, value) {
		if (async === this._obj) {
			this._latestValue = value;
			this._ref!.markForCheck();
		}
	}
}
```

Unlike input bindings that perform shallow comparison, the async pipe implementation doesn’t perform comparison at all. It treats every new emission as an update even if it matches the previously emitted value.

```tsx
export class AComponent {
	o = { name: 'A' };
	user = new BehaviorSubject(this.o);
	
	changeName() {
		this.user.next(this.o);
	}
}
```

It means that the component with the async pipe will be **marked for check every time a new value is emitted.** And Angular will check the component next time it runs change detection even if the value hasn’t changed.

`NgDoCheck` hook is only triggered if the parent component is checked, it won’t be triggered if one of its parent components uses `OnPush` strategy and is not checked during change detection. So you can’t rely on it to trigger change detection when you receive a new value through a service. In this case, the solution I showed with putting `markForCheck` in the subscription callback is the way to go.

Basically, manual comparison gives you more control over the check. You can define when the component needs to be checked. And this is the same as with many other tools - manual control gives you more flexibility.

## **Local change detection**

## **Zoneless: New Scheduler**

[ngNoop](https://www.notion.so/ngNoop-284e19a9ad0380189929e6848d35b8a4?pvs=21)

(⬆️ explain about RafRace: requestAnimationFrame + setTimeout)

**Micro vs. macro tasks**

Simply put, zoneless change detection is the new change notification/scheduling mechanism that triggers change detection. It calls the `tick()` method on the Angular application without replying on the Zone.js library.

```jsx
export function provideZonelessChangeDetection() {
	return makeEnvironmentProviders([
		{
			provide: ChangeDetectionScheduler,
			useExisting: ChangeDetectionSchedulerImpl,
		},
		{
			provide: NgZone, useClass: NoopNgZone,
		}
	]);
}
```

Among the two classes, `ChangeDetectionSchedulerImpl` has a method called `notify()` that calls the application’s `tick()` method to trigger change detection. On the other hand, the `NoopNgZone` class is just a placeholder that partially implements `NgZone` interface. This class is included to prevent breaking changes in applications that might have been using Zone.js’s NgZone implementation.

```tsx

@Injectable({ providedIn: 'root' })
export class ApplicationRef {
	tick(): void {
    if (!this.zonelessEnabled) {
      this.dirtyFlags |= ApplicationRefDirtyFlags.ViewTreeGlobal;
    }
    this._tick();
  }

  /** @internal */
  _tick(): void {
    profiler(ProfilerEvent.ChangeDetectionStart);

    if (this.tracingSnapshot !== null) {
      // Ensure we always run `tickImpl()` in the context of the most recent snapshot,
      // if one exists. Snapshots may be reference counted by the implementation so
      // we want to ensure that if we request a snapshot that we use it.
      this.tracingSnapshot.run(TracingAction.CHANGE_DETECTION, this.tickImpl);
    } else {
      this.tickImpl();
    }
  }

  private tickImpl = (): void => {
    (typeof ngDevMode === 'undefined' || ngDevMode) && warnIfDestroyed(this._destroyed);
    if (this._runningTick) {
      throw new RuntimeError(
        RuntimeErrorCode.RECURSIVE_APPLICATION_REF_TICK,
        ngDevMode && 'ApplicationRef.tick is called recursively',
      );
    }

    const prevConsumer = setActiveConsumer(null);
    try {
      this._runningTick = true;
      this.synchronize();
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        for (let view of this.allViews) {
          view.checkNoChanges();
        }
      }
    } finally {
      this._runningTick = false;
      this.tracingSnapshot?.dispose();
      this.tracingSnapshot = null;
      setActiveConsumer(prevConsumer);
      this.afterTick.next();

      profiler(ProfilerEvent.ChangeDetectionEnd);
    }
  };
  
  /**
   * Performs the core work of synchronizing the application state with the UI, resolving any
   * pending dirtiness (potentially in a loop).
   */
  private synchronize(): void {
    if (this._rendererFactory === null && !(this._injector as R3Injector).destroyed) {
      this._rendererFactory = this._injector.get(RendererFactory2, null, {optional: true});
    }

    let runs = 0;
    while (this.dirtyFlags !== ApplicationRefDirtyFlags.None && runs++ < MAXIMUM_REFRESH_RERUNS) {
      profiler(ProfilerEvent.ChangeDetectionSyncStart);
      this.synchronizeOnce();
      profiler(ProfilerEvent.ChangeDetectionSyncEnd);
    }

    if ((typeof ngDevMode === 'undefined' || ngDevMode) && runs >= MAXIMUM_REFRESH_RERUNS) {
      throw new RuntimeError(
        RuntimeErrorCode.INFINITE_CHANGE_DETECTION,
        ngDevMode &&
          'Infinite change detection while refreshing application views. ' +
            'Ensure views are not calling `markForCheck` on every template execution or ' +
            'that afterRender hooks always mark views for check.',
      );
    }
  }
}

/**
   * Performs the core work of synchronizing the application state with the UI, resolving any
   * pending dirtiness (potentially in a loop).
   */
  private synchronize(): void {
    if (this._rendererFactory === null && !(this._injector as R3Injector).destroyed) {
      this._rendererFactory = this._injector.get(RendererFactory2, null, {optional: true});
    }

    let runs = 0;
    while (this.dirtyFlags !== ApplicationRefDirtyFlags.None && runs++ < MAXIMUM_REFRESH_RERUNS) {
      profiler(ProfilerEvent.ChangeDetectionSyncStart);
      this.synchronizeOnce();
      profiler(ProfilerEvent.ChangeDetectionSyncEnd);
    }

    if ((typeof ngDevMode === 'undefined' || ngDevMode) && runs >= MAXIMUM_REFRESH_RERUNS) {
      throw new RuntimeError(
        RuntimeErrorCode.INFINITE_CHANGE_DETECTION,
        ngDevMode &&
          'Infinite change detection while refreshing application views. ' +
            'Ensure views are not calling `markForCheck` on every template execution or ' +
            'that afterRender hooks always mark views for check.',
      );
    }
  }

export function markViewDirty(lView: LView, source: NotificationSource) {
	lView[ENVIRONMENT].changeDetectionScheduler?.notify(source);
}

@Injectable({ providedIn: 'root' })
export class ChangeDetectionSchedulerImpl implements ChangeDetectionScheduler {
	notify(source: NotificationSource): void {
		switch (source) {
			case NotificationSource.MarkForCheck:
				this.appRef.dirtyFlags |= ApplicationRefDirtyFlags.ViewTreeCheck;
		}
	}
}
```

The new zoneless change detection is build on the idea that your components will let Angular know when something has changed immediately. So, there won’t be any intermediate layer like `zone.js` to notify Angular that something has changed.

Currently, to tell Angular that something changed we have API-s like:

- `ChangeDetectorRef.markForCheck()`
- `ComponentRef.setInput`
- Updating a signals value that is used in the template
- When template event listeners are triggered
- Attaching/Detaching a view using `ViewContainerRef`
- registering a render hook (templates are only refreshed if render hooks do one of the above)

---

### **Zonefull/Hybrid change detection**

In the previous chapter, we noted the Zoneless scheduler was first introduced in version 17.1. Angular 18 not only significantly improved this implementation but also introduced an exciting enhancement to the existing zone-based scheduler by incorporating the explicit notification mechanism we’ve already seen in the Zoneless scheduler. This means that the scheduler now listens not only for Zone.js events but is also trigger by the `notify` method.

```jsx
zone.runOutsideAngular(() => {
  httpClient.get<Post>('https://jsonplaceholder.typicode.com/posts/1')
    .pipe(
      delay(3000),
      map((res) => res.title)
    ).subscribe((title) => {
      this.title.set(title);
    });
});
```

In the past, we need to wrap it into `ngZone.run`

Expression Changed After It has been checked

- onMicrotaskEmpty ⇒ tick()
- this._zone.onStable ⇒ tick()

Following example doesn’t trigger onStable

```jsx
import { AfterViewInit, Component, signal } from '@angular/core';

@Component({
  template: `{{ title }}`,
  selector: 'app-child',
})
export class ChildComponent implements AfterViewInit {
  title = 'Testing'

  ngAfterViewInit(): void {
    this.title = 'Testing - after view init';
  }
}

@Component({
  selector: 'app-root',
  imports: [ChildComponent],
  styleUrl: './app.scss',
  template: `
    <button (click)="show.set(!show())">Toggle</button>
    @if (show()) {
      <app-child></app-child>
    }
  `,
})
export class App {
  show = signal(false);
}
```

### should schedule tick

```tsx
// zoneless_scheduling_impl.ts
@Injectable({ providedIn: 'root' })
export class ChangeDetectionSchedulerImpl implements ChangeDetectionScheduler {
	notify(source: NotificationSource) {
		...
		
		if (!this.shouldScheduleTick()) {
			return;
		}
	}
}

private shouldScheduleTick() {
	...
	if (
		!this.zonelessEnabled && this.zoneIsDefined &&
		Zone.current.get(angularZoneInstanceIdProperty + this.angularZoneId
	) {
		return false;
	}
	
	return true;
}
```

**Three Execution Modes**

- Mode 1: Pure Zoneless (`zonelessEnabled = true` )

```tsx
// In this mode, the zone check is skipped entirely
if (!this.zonelessEnabled && /* zone check */) {
	return false;
}
// zonelessEnabled = true, so condition is false
// Scheduler ALWAYS handles change detection
```

- Mode 2: Pure Zone.js (`zonelessEnabled = false` , inside Angular Zone)

```tsx
if (
	!this.zonelessEnabled &&                 // false (using Zone.js)
	this.zoneIsDefined &&                    // true (Zone.js is loaded)
	Zone.current.get(/* angular zone */)     // true (inside Angular Zone)
) {
	return false; // Let Zone.js handle it - DON'T schedule
}
```

- Mode 3: Hybrid/Outside Zone (`zonelessEnabled = false`, outside Angular Zone)

```tsx
if (
	!this.zonelessEnabled &&                // false (using Zone.js)
	this.zoneIsDefined &&                   // true (Zone.js is load)
	Zone.current.get(/* angular zone */)    // FALSE (outside Angular Zone)
) {
	return false;
}

return true; // Scheduler handles it because we're outside the zone
```

Basically, change detection was scheduled when an patched browser API was invoked (`setTimeout` , `setInterval` , `Promise.then` , `addEventListener` , etc)

This came with a caveat, Change Detection was only triggered when you were in the Angular zone. This had performance implications, which led us to write code jumping in and out of the Angular Zone respectively with `ngZone.runOutsideAngular(() => ...)` / `ngZone.run(() => ...)` . This meant that the execution context mattered, which is something that can hardly be ensured statically.

One of the common issue we’ve seen developers had, was having signals being updated outside the Angular zone not scheduling a change detection cycle.

This was not considered great DX. Updating a signal really is telling the framework, “Hey data changed, please refresh my component”. Angular should not ignore changes that happen outside the zone.

In v18, for Zone-based apps, the framework will leverage this same scheduler alongside the existing Zone-based scheduler: Welcome to hybrid mode.

Imagine a situation where you’re jumping outside the angular zone.

```tsx
ngZone.runOutsideAngular(() => {
	setInterval(() => {
		someFunctionSomewhere();
	})
});

function someFunctionSomewhere() {
	mySignal.set(newValue);
}
```

In this example, nothing will schedule a change detection. `setInterval` , because of the context (outside the angular zone) won’t trigger CD and signals by themselves don’t schedule any CD, they just mark the component as dirty. This make this code a bit brittle. Because of the execution context you don’t know if `someFunctionSomewhere()` will actually result in the updated view.

Here hybrid mode will come in handy and remove the execution context issue: A signal update will always schedule a CD cycle.

You’re asking for an update, you will get an update, not matter of the context. Great DX win ain’t it?

To sum up the changes, these are the new cases when Change Detection will be scheduled:

- You’re explicitly instructing the framework to update: `signal.set() / signal.update() / changeDetectorRef.markForCheck()`
- **A new value is passed to an `AsyncPipe` . It being based on `markForCheck` , it will now also always schedule CD**
- When attaching/detaching views

Running outside the angular zone was meant to reduce the numbers of CD scheduling. It will stay this way for all `zone.js` patched API. `setInterval` will still not schedule CD, you don’t have to worry about that.

What will change is that, if ever you were telling the framework to update its state (via `signal.set` of `markForCheck` ); it will now schedule change detection because you explicitly told him to!

---

### Running change detection - Manual control

Angular has two ways to manually trigger change detection:

- calling `tick` through `ApplicationRef`
- calling `detectChanges` through `ChangeDetectorRef`

---

### NG100

```jsx
export class ApplicationRef {
  constructor() {
    this._onMicrotaskEmptySubscription = this._zone.onMicrotaskEmpty.subscribe({
      next: () => {
        this._zone.run(() => {
          this.tick();
        });
      },
    });
  }
  
  tick(): void {
	  try {
	    this._runningTick = true;
	    for (let view of this._views) {
	      view.detectChanges();
	    }
	    if (typeof ngDevMode === 'undefined' || ngDevMode) {
	      for (let view of this._views) {
	        view.checkNoChanges();
	      }
	    }
	  } catch (e) { ... } finally { ... }
	}
}
```

We can also see that in development mode, `tick` also runs `checkNoChanges` that performs a second change detection cycle to ensure that no further changes are detected. If additional changes are picked up during this second cycle, it means that bindings in the app have side-effects that cannot be resolved in **a single change detection pass.** In this case, Angular throws an error ExpressionChanged error, since an Angular enforces unidirectional data flow.

In development mode, `tick()` also performs a second change detection cycle to ensure that no further changes are detected. If additional changes are picked up during this second cycle, bindings in the app have side-effects that cannot be resolved in a single change detection pass. In this case, Angular throws an error, since an Angular application can only have one change detection pass during which all change detection must complete.

A binding’s value changes after Angular has finished the first change detection pass for that view.

Here’s the implementation which injects `NgZone` and runs `setInterval` outside of the Angular zone:

```tsx
export class AppComponent {
	_time;
	get time() {
		return this._time;
	}
	
	constructor(zone: NgZone) {
		this._time = Date.now();
		
		zone.runOutsideAngular(() => {
			setInterval(() => {
				this._time = Date.now();
			}, 1);
		});
	}
}
```

Now we’re constantly updating the time, but we’re doing so asynchronously and outside of the Angular zone. This guarantees that during change detection and the following check the getter `time` returns the same value. And when Angular reads the `time` value during the next change detection cycle, the value will be updated and the changes will be reflected on the screen.

### The Key Insight: Two-Level Tracking System

Angular uses a two-level tracking system for change detection:

1. Application-level flags (`ApplicationRefDirtyFlags`) - tracks what types of work need to be done
2. View-level flags (`LViewFlags`) - track which specific views need checking

```tsx
// mark_view_dirty.ts
export function markViewDirty(lView: LView, source: NotificationSource): LView {
  // 1. Notify the scheduler (sets ApplicationRefDirtyFlags.ViewTreeCheck)
  lView[ENVIRONMENT].changeDetectionScheduler?.notify(source);

  // 2. Mark the actual view with LViewFlags
  while (lView) {
    lView[FLAGS] |= LViewFlags.RefreshView | LViewFlags.Dirty; // The actual view marking
    // ... traverse up to mark ancestors
  }
}

```

```tsx
// zoneless_scheduling_impl.ts
case NotificationSource.MarkForCheck:
  this.appRef.dirtyFlags |= ApplicationRefDirtyFlags.ViewTreeCheck; // Application knows work is needed

```

```tsx
// application_ref.ts
private synchronizeOnce(): void {
  if (this.dirtyFlags & ApplicationRefDirtyFlags.ViewTreeAny) {
    // Clear ALL view flags at once - we're about to process them
    this.dirtyFlags &= ~ApplicationRefDirtyFlags.ViewTreeAny;

    // Process all views, checking their individual LViewFlags
    for (let {_lView} of this.allViews) {
      if (!useGlobalCheck && !requireRefreshOrTraversal(_lView)) {
        continue; // Skip views that don't have LViewFlags.RefreshView or other flags
      }
      detectChangesInternal(_lView, mode); // Actually check the view
    }

    // IMPORTANT: Clear ViewTreeCheck flag specifically
    this.dirtyFlags &= ~ApplicationRefDirtyFlags.ViewTreeCheck;

    // Check if any views are still dirty after checking and we need to loop back
    this.syncDirtyFlagsWithViews();

    if (this.dirtyFlags & (ApplicationRefDirtyFlags.ViewTreeAny | ApplicationRefDirtyFlags.RootEffects)) {
      // If any views or effects are still dirty after checking, loop back before running render hooks
      return; // EARLY RETURN - restart synchronizeOnce()
    }
  }
}

```

```tsx
private syncDirtyFlagsWithViews() {
  if (this.allViews.some(({ _lView }) => requiresRefreshOrTraversal(_lView))) {
    // If ANY view still needs work, set the flag to loop back
    this.dirtyFlags |= ApplicationRefDirtyFlags.ViewTreeTraversal;
    return;
  } else {
    // All views are clean, clear all view flags
    this.dirtyFlags &= ~ApplicationRefDirtyFlags.ViewTreeAny;
  }
}

```

```tsx
export function requiresRefreshOrTraversal(lView: LView) {
  return !!(
    lView[FLAGS] & (LViewFlags.RefreshView | LViewFlags.HasChildViewsToRefresh) ||
    lView[REACTIVE_TEMPLATE_CONSUMER]?.dirty
  )
}

```

### Why the Flag is Cleared

The `ViewTreeCheck` flag is cleared for backward compatibility and to prevent infinite loops. Here's why:
The Problem Scenario:

1. During change detection, a component's lifecycle hook calls `markForCheck()`
2. This would set `ApplicationRefDirtyFlags.ViewTreeCheck` again
3. Without clearing this flag, it would cause the synchronization loop to run again
4. This could lead to infinite loops or unexpected re-check
The solution:

```tsx
// If `markForCheck()` was called during view checking, it will have set the `ViewTreeCheck`
// flag. We clear the flag here because, for backwards compatibility, `markForCheck()`
// during view checking doesn't cause the view to be re-checked.
this.dirtyFlags &= ~ApplicationRefDirtyFlags.ViewTreeCheck;

```

### The Actual Work Happens at View Level

The key insight: The application-level flag (`ViewTreeCheck`) is just a signal that work needs to be done. The actual work is determined by the view-level flags (`LViewFlags.RefreshView`, `LViewFlags.Dirty`)
Whey `markViewDirty` is called:

- ✅ Application flag is set to schedule a tick
- ✅ View flags are set to mark specific views for checking
- ✅ Views are actually processed based on their individual LViewFlags
- ✅ Application flag is cleared to prevent re-processing

### Why This Matters for Backward Compatibility

```tsx
// What WOULD happen without the flag clearing:
ngAfterViewChecked() {
  this.cdr.markForCheck(); // Sets ViewTreeCheck flag
  // Without clearing: This would cause immediate re-checking
  // Leading to: ngAfterViewChecked() -> markForCheck() -> re-check -> ngAfterViewChecked() -> infinite loop
}

```

In the old Zone.js system, calling `markForCheck()` during change detection would naturally schedule the check for the next Zone task, not immediately. The new system needed to preserve this behavior to avoid breaking existing code that relied on this timing.

### Example for NG100

Random value

```tsx
get time() {
	return Date.now()
}
```

### Order of operations

We’ve just learned that because of the unidirectional data flow restriction you can’t change some properties of a component during change detection after this component has been checked. Most often, this update happens through a shared service or synchronous event broadcasting when Angular runs change detection for child components. But it’s also possible to directly inject a parent component into a child component and update the parent state in a lifecycle hook.

```tsx
@Component({
    selector: 'my-app',
    template: `
        <div [textContent]="text"></div>
        <child-comp></child-comp>
    `
})
export class AppComponent {
    text = 'Original text in parent component';
}

@Component({
    selector: 'child-comp',
    template: `<span>I am child component</span>`
})
export class ChildComponent {
    constructor(private parent: AppComponent) {}

    ngAfterViewChecked() {
        this.parent.text = 'Updated text in parent component';
    }
}
```

Basically, we’re defining a simple hierarchy of two components. The parent component declares the `text` property that is isued in the binding. The child component injects the parent component into the constructor and updates its property in the `ngAfterViewChecked` lifecycle hook. → NG100

And that’s because when Angular calls the `ngAfterViewChecked` lifecycle hook for the child component, it already checked the binding for the parent `App` component. But we’re updating the parent’s property `text` used in the binding after the check.

But here’s the interesting part. What if I now change the hook? Say, to `ngOnInit`

```tsx
export class ChildComponent {
	constructor(private parent: AppComponent) {}
	
	ngOnInit() {
		this.parent.text = 'Updated text in parent component';
	}
}
```

Well, this time it’s not there. In fact, we can put the code in any other hook (except for `AfterViewInit` and `AfterViewChecked` ). So why is the `ngAfterViewChecked` hook special?

To understand this behavior, we need to know what operations Angular performs during change detection and their order.

```tsx
function checkAndUpdateView(view, ...) {
	// update input bindings on child views (components) & directives,
  // call NgOnInit, NgDoCheck and ngOnChanges hooks if needed
  Services.updateDirectives(view, CheckType.CheckAndUpdate);
  
  // DOM updates, perform rendering for the current view (component)
  Services.updateRenderer(view, CheckType.CheckAndUpdate);
  
  // run change detection on child views (components)
  execComponentViewsAction(view, ViewAction.CheckAndUpdate);
  
  // call AfterViewChecked and AfterViewInit hooks
  callLifecycleHooksChildrenFirst(…, NodeFlags.AfterViewChecked…);
}
```

As you can see, Angular also triggers lifecycle hooks as part of change detection. What’s interesting is that some hooks are called before the rendering part when Angular processes bindings and some are called after that.

First, it updates the bindings for the **child** component. Then it calls the `OnInit`, `DoCheck`, and `OnChanges` hooks, again, on the **child** component. It makes sense because it just updated the input bindings and Angular needs to notify the child components that the input bindings have been initialized. **Then Angular performs rendering for the current component**. And after that, it runs change detection for the child component. This means that it’ll basically repeat these operations on the child view. And finally, it calls the `AfterViewChecked` and `AfterViewInit` hooks on the **child** component to let it know that it’s been checked.

What we can notice here is that Angular **calls the** `AfterViewChecked` lifecycle hook for the child component **after** it’s processed the bindings of the parent component. On the other hand, the `OnInit` **hook is called before** the bindings are processed. So even if there’s a change on the `text` value in the `OnInit` , it’s still going to be the same during the following check. And that explains the seemingly weird behavior of not having the error with the `ngOnInit` hook. Mystery solved?

The main logic responsible for running change detection for a view resides in `checkAndUpdateView` function. Most of its functionality performs operations on **child** component views. This function **is called recursively** for each component starting from the host component. It means that a child component becomes parent component on the next call as a recursive tree unfolds.

When this function triggered for a particular view it does the following operations in the specified order:

1. sets `ViewState.firstCheck` to `true` if a view is checked for the first time and to `false` if it was already checked before
2. checks and updates input properties on a child component/directive instance
3. updates child view change detection state (part of change detection strategy implementation)
4. runs change detection for the embeded views (repeats the steps in the list)
5. calls `OnChanges` lifecycle hook on a child component if bindings changed
6. calls `OnInit` and `ngDoCheck` on chind component (`OnInit` is called only during first check)
7. updates `ContentChildren` query list on a child view component instance
8. calls `AfterContentInit` and `AfterContentChecked` lifecycle hooks on child component instance (`AfterContentInit` is called only during first check)
9. update DOM interpolations for the **current view** if properties on **current view** component instance changed
10. runs change detection for a child view (repeats the steps in this list)
11. updates `ViewChildren` query list on the current view component instance
12. calls `AfterViewInit` and `AfterViewChecked` lifecycle hooks on child component instance (`AtfterViewInit` is called only during first check)
13. disables checks for the current view (part of change detection strategy implementation)

The first thing is that `onChanges` lifeycle hook is triggered on a child component before the child view is checked and it will be triggered even if changed detection for the child view will be skipped.

Please note that `ng

The second thing is that DOM for a view is updated as part of a change detection mechanism while the view being checked. This means that if a component is not checked, the DOM is not updated even if component properties used in a template change. The templates are rendered before the first check. What I refer to as DOM update is actually interpoplation update. So if you have `<span>some {{name}}</span>` , the DOM element `span` will be rendered before the first check. During the check only `{{name}}` part will be rendered.

Another interesting observation is that state of a child component view can be changed during change detection.

```tsx
if (view.def.flags & ViewFlags.OnPush) {
  view.state &= ~ViewState.ChecksEnabled;
}
```

It means that during the following change detection run the check will be skipped for this component view and all its children.

```tsx
A: AfterContentInit
A: AfterContentChecked
A: Update bindings
    B: AfterContentInit
    B: AfterContentChecked
    B: Update bindings
        C: AfterContentInit
        C: AfterContentChecked
        C: Update bindings
        C: AfterViewInit
        C: AfterViewChecked
    B: AfterViewInit
    B: AfterViewChecked
A: AfterViewInit
A: AfterViewChecked
```

### change_detection_signals_in_zones_spec.ts

```tsx
it('continues to refresh views until none are dirty', () => {
	const aVal = signal('intial');
	const bVal = signal('intial');
	let updateAValDuringAChangeDetection = false;
	
	@Component({
		template: '{{val()}}',
		selector: 'a-comp'
	})
	class A {
		val = aVal;
	}
	
	@Component({
		template: '{{val()}}',
		selector: 'b-comp'
	})
	class B {
		val = bVal;
		
		ngAfterViewChecked() {
			// Set value in parent view after this view is checked
			// Without signals, this is ExpressionChangedAfterItWasChecked
		}
	} 
	
	@Component({template: '<a-comp />-<b-comp />', imports: [A, B]})
  class App {}

  const fixture = TestBed.createComponent(App);
  fixture.detectChanges();
  expect(fixture.nativeElement.innerText).toContain('initial-initial');

  bVal.set('new');
  fixture.detectChanges();
  expect(fixture.nativeElement.innerText).toContain('initial-new');

  updateAValDuringAChangeDetection = true;
  bVal.set('newer');
  fixture.detectChanges();
  expect(fixture.nativeElement.innerText).toContain('new-newer');
});
```

![image.png](attachment:fa276849-f6f7-42ef-b5d7-fbbe040812b4:image.png)

Need a deep dive

https://angular.love/change-detection-big-picture-overview

Use DevTools to demonstrate Angular change detection for presentation

Re-read Simplified Change Detection ebook for blog idea about how to determine if change detection is called.

**Change detection**

That’s also why it’s called change detection, we need to detect if there was a change

*Calling a function inside template is not a triggering for change detection*

There are only two triggers for that, it could be a `handled DOM event` or it is an `asynchronous task` . Well, since I don’t click on anything and the change detection is still running in the meantime, it needs to be an asynchronous task.

Assigning a value to a primitive property, this is not a trigger, this is not something that marks a component that’s dirty. In this case, we have two options to mark a component dirty:

- Using Observable or Signal
- Handle a DOM event
    - This one will now mark this component as dirty and at the same time also trigger the change detection
- `ChangeDetectorRef`

### ApplicationRef

```tsx
bootstrapApplication(AppComponent, appConfig)
	.then(appRef => {
		appRef.tick();
	});
```

## UI = fn(state)

React:        vDOM = fn(state)

Angular:     deltaUI = fn(deltaState)

- The change in the state of the application = that’s the change in the bindings that are in your template

### ~~Change detection~~ to Synchronization

What **triggers** synchronization?

- When we **think** something’s changed
- When we **know** something’s changed

When do we need to **sync**?

- Zone.js
    - Zone.js monkey patches almost all the browser APIs in order to get notified whenever an event happens!
    - The assumption is that when the application code runs, it may have changed the state, and so we’ll run synchronization just in case basis
        
        ```tsx
        el.addEventListener('click', ($event) => {
        	getComponent(el).onClick($event);
        	scheduleSync();
        })
        ```
        
- markForCheck(), signal set(), etc. (*direct notification*)
    - We have APIs that you call, and you tell Angular, “Hey, I actually changed state”. In this case, we know that synchronization needs to run even without Zone.js (*Zoneless*)
        
        ```tsx
        class ChangeDetectorRef {
        	markForCheck() {
        		view.dirty = true;
        		scheduler.notify(NotificationSource.MarkForCheck);
        	}
        }
        ```
        

Synchronization doesn’t happen immediately; we schedule it.

Microtask delay: A common way of avoiding the challenges of synchronous rendering is to wait for a microtask. a microtask right wait for one promise resolve, and that makes sure that all of the state changes that happen kind of synchronously in a row get batched together automatically.

```tsx
user.set({...});
showDetails.set(false);

await Promise.resolve();
// Render happens here
```

You have multiple signal sets, but then only after a promise kind of delay does the rendering actually happen

When do we (Angular) sync? → After all microtasks (Zone.js)

Goals:

- batch rendering as much as possible
- consistent, responsive UI

→ the new state is on the screen on the next paint

What we want is some combination of these APIs, something that has guarantees of animation frames, but kind of runs in the background, like a timeout does

We decided to use both of them together, so we run both, and whichever one finishes first is the one that does synchronization.

**Rafrace strategy**

`setTimeout(0)`

`requestAnimationFrame():` Asking the browser, “Hey, I want to do something before you paint next time”.

![image.png](attachment:c7f26312-a1ef-43a4-8a2d-d6c33f99582c:image.png)

![image.png](attachment:7cb9fecd-a831-467d-ac9a-f9e978762947:image.png)

**What to check?**

- effects
- View
    - DOM updates
    - Inputs Propagation
    - Queries
    - Lifecyle hooks
- Render hooks

**UI has a natural hierarchy**

```tsx
@if (user) {
	{{ user.name }}
}
```

Angular creates two views:

- One parent's view that contains conditional
- And a child's view that exists or not, depending on what the parent view decides to do with it

![image.png](attachment:4a1196d6-f114-4d72-9836-8f002fcb11b7:image.png)

So let’s say the user is defined, so we have this text node on screen, and we set it to undefined. What happens? 

If we run the `{{ user.name }}` first, the application will crash. You’re trying to use a property name of undefined. We have to run the parent view first. Since the child view is not supposed to exist at all if the user is undefined. The parents are kind of enforcing this invariant and making sure that the child view never sees a value of user that is not defined, and we have to respect this relationship when we’re updating the binding.
It’s controlling what data the downstream part of the UI sees and so parents are able to enforce these kinds of restrictions on children and we have to respect that when we’re check updating the UI.

So it’s not just a matter of refreshing all the bindings in some arbitrary order we actually want to walk the UI top to bottom and flow the data down at the same time to give parents the opportunity to say wait a minute this child shouldn’t exist anymore.

The same thing is true in effects, so effects can control the existence of a child view or not inside of a component, depending on the value of some data, so it can enforce invariance and make guarantees about what data that child view will ever see. So we can’t check a child view without making sure all the parent effects have run first. And in fact, every reactive framework that has effects gives the same ordering guarantees.

```tsx
let view;
effect(() => {
	if (user()) {
		// child view assume user is defined
		view = vcr.createEmbeddedView(tpl, { $implicit: user() };
	} else {
		view?.destroy();
		view = undefined;
	}
});
```

**Views can be dirty in three ways**

Flavor of view dirtiness

- Marked for check (`markForCheck`)
    - The traditional operation for telling Angular, “Hey, this view might be OnPush, but I changed something that affects it, so it needs to run.
- `AsyncPipe`
- Maybe dirty via signal
    - That’s a different kind of dirtiness; it doesn’t mark the parents
    - If a signal changes, that doesn’t mean the signal has a new value, it just means that it might have a new value
    For example, it could be behind a `computed`, which is going to actually derive the same thing.
    The signal flag is more like this might be dirty and we have to check with the signals before running it.
    - We keep track of that separately because it has separate semantics; signals don’t really require this traversal all the way down from the top, we only need to make sure that we run things in order and to make sure we do that we keep track of when a parent part of the application, part of the UI isn’t itself dirty but contains something that is whether that’s a child that needs to be checked with signals or whether that’s an effect that might need to run.
- Contain dirtiness (something in its child view is dirty)
    - Dirty child view
    - Effects, render hooks, etc.

**We also track application dirtiness**

Finally, the application itself has a rolled-up concept of what needs to be changed

```tsx
class ChangeDetectorRef {
	markForCheck() {
	  view.markedForCheck = true;
	  scheduler.notify(NotificationSource.MarkForCheck);
	}
}

// In the scheduler
case NotificationSource.MarkForCheck:
	app.dirty |= Dirty.ViewMarkedForCheck;
```

When you call markForCheck, this notification is sent to the scheduler in addition to scheduling synchronization.
It is also setting a flag on the application saying, “Hey, there are some views that got marked for check.” 

**Synchronization algorithm**

```tsx
while (dirty) {
	if (dirty & Dirty.RootEffects) runRootEffects();
	if (dirty & Dirty.View) checkViews();
	
	// if we still have dirty views, loop back
	if (dirty & Dirty.View) continue;
	if (dirty & Dirty.RenderHooks) runRenderHooks();
}
```

Basically, we have a loop, and the loop is saying: *“Hey, while there are things that need to be checked, we’re going to go through this process.”*

There might be some effects at the top level that are dirty, so we need to run those. There might be some views that are dirty, so we need to check those—so we check the view hierarchy.

We have an early exit here—or maybe an early loop back—that says: *“Hey, if there are still dirty views, continue.”* Why is that?

Well, it turns out that inside a lifecycle hook, or inside a component, you can make more state changes. As a result of making those state changes, something that was previously checked might need to be checked again. There are even ways of doing this that can produce the *“expression changed after it was checked”* error.

But with Signals, we decided: okay, we actually want to honor that set—the signal set—and go back and check that view, even if it was previously checked. And so that’s what this `continue` is doing here. It’s saying: *“If we exit the single pass through the tree and something got marked dirty that we previously checked, we’re going to go back and make sure we run it again.”*

And if we finally get all the views clean, then we can go on and run the render hooks.

**View Modes**

```tsx
Global -> check if not OnPush
Targeted -> check if marked dirty
```

So when the algorithm starts visiting the view tree—which is a recursive traversal—we start at the parent, check if the parent needs anything, and then proceed to the children. We do this in one of two modes. These modes are what allow us to trim away the parts of the tree that don’t need to be visited, while still ensuring that everything that needs to be checked actually gets checked. This is why modern change detection scales with the number of things that became dirty, not with the size of your whole application.

**Global mode** is the default for zone-based change detection. In this mode, we check all components that use default change detection, and we only check `OnPush` components if they are dirty.

We also have what we call **targeted mode**. In targeted mode, we skip components that are not dirty and only check the views that Angular has been explicitly told *need to be checked*. Targeted mode is the default for zoneless change detection.

Targeted mode will be activated every time Angular goes and checks if I have an `OnPush` component that `HasChildViewsToRefresh` . When on `Targeted` mode, we only update `RefreshView`

![image.png](attachment:3e5ed20f-f5f0-463d-a4cf-a776573a39a9:image.png)

Every time Angular goes and refreshes some `RefreshView` it goes `Global` mode again. The reason is backward compatibility, because now, even if we have signals, we can still use the default change detection components, and those also need to be updated, so this way Angular doesn’t break the old components but also introduces this new optimization of the change detection.

![image.png](attachment:0d08d35a-080c-4937-977f-b407e7b6ad8c:image.png)

**Mode Switching**

```tsx
Global + OnPush -> visit children in Targeted
Targeted + Dirty -> visit children in Global
```

So the trick is that as the algorithm is descending recursively through the view tree—from parent to child to grandchild—it will switch between **targeted mode** and **global mode**.

When we hit a non-dirty `OnPush` view that doesn’t need to be checked, the algorithm switches to **targeted mode** to check its children. That means things inside the children that use default change detection (not `OnPush`) will still not be checked until we reach something that actually does need to be—like a component that changed because of a signal.

If we reach such a component and see that it needs to be checked, then the algorithm switches back to **global mode** for its children, because that component might be propagating state to its children through inputs, services, or something similar.

So this flip-flopping allows us to prune away parts of the tree that have nothing dirty in them, while still being able to visit child components that are hidden behind `OnPush` parents.

**Example**

Suppose we have a component tree that looks something like this. The red components use **default change detection**—they get checked all the time in zone-based change detection. The purple/pink components are `OnPush`.

Let’s say we start off by calling `markForCheck` on this right-hand-side `OnPush` component. Because `markForCheck` marks the root, we can see that the parent also gets marked with a **C**. I’m using that to indicate the `markForCheck` operation.

So, in zone-based change detection, we start at the root component and check it. Since we’re in **global mode**, checking it will clear its `markForCheck` flag, and then change detection will proceed to its child.

This `OnPush` component was dirty, so we check it. This other `OnPush` component was not dirty, so we never descended into it. Instead, we continue down to the default change detection component that’s a child of the dirty `OnPush`.

Notice again that we skipped the left-hand-side `OnPush`, because it was never dirty to begin with.

So now let’s look at what happens when we update the same component using **signals**, and view it from a **zoneless** perspective.

First of all, we’ll set this up by saying: we’re changing the same component, but this time through a **signal**. I’ll use a different letter **S** to mark that it’s dirty through a signal. Notice that the parent does **not** get a signal flag. Instead, the parent gets tagged with something like *“I contain something that needs to be checked.”* I’ll mark that with an **exclamation point**. It’s not dirty by itself, but we know it has dirty children.

Zoneless change detection starts in **targeted mode**. So this root component, even though it’s default (not `OnPush`), will actually be skipped—it doesn’t need to be checked. But because it has the flag that says *“I contain something dirty,”* we propagate down into its children, and we end up checking the `OnPush` component that was marked dirty through a signal.

At that point, because we found something that needs to be checked in the tree, the algorithm switches to **global mode**. This means that the child component that’s not `OnPush` will also get checked, along with any children it might have.

We’re still skipping the `OnPush` branch of the tree that wasn’t dirty.

So what we’re doing here is essentially **tree pruning**. We navigate through the application’s component tree and check the parts where the dirtiness flags (`markForCheck` or signal) tell us work is needed, while skipping over the parts of the tree where no work is required.

**Granularity of dirtiness**

There’s another interesting part of this equation though which is what actually get checked when something is marked as dirty and the answer today is we do that operation on the component level. So we check the component and all of the views that are created inside of that component togethe,r and let’s look at why?

```tsx
// What does this mean?
cdr.markForCheck();

@for (item of items(); track item.id) {
  {{ item.name }}
}
```

So we have an example template, it has kind of a parent view that has a for loop and it might have you know one to a thousand child views for each item inside that for loop. Angular calls those embedded views you might know. And top level is reading of signal items, you might notice the child views are not reading any singals right? They just get the item from the parent from the for loop as a plain value. And so if we wanted to be able to check the parent but not the children or check the children but not the parent. We would have to separate those somehow we would have to give Angular specific information that the parent change the items changed but not each individual item or vice versa. 
And even without signals you can see that our APIs weren’t really designed for this. When you call mark for check, you’re calling it at a component level, it’s marking the entire component, everything in that for loop, all of the rows that as needing to be checked, you don’t have a way of telling Angular specifically which row which item needs change.

**Change detection responsibility**

- Update UI
- Propagate inputs
- Lifecycle of components/directives
- Run reactive effects
- Enforce template invariants

## Local Change Detection

`Signals & OnPush`

Signal Change with `OnPush` & without DOM Event

The change needs to happen via a signal and you also need to make sure that this change does not mark the component as dirty. We have two possible events: `handle DOM event` & `asynchronous task` and if there is a handle DOM event then we know that the handle DOM event is already marking this component also as dirty but also not the child component here but also its parent components as well. So the only thing that could do this is a change to a signal via an asynchronous task because then the asynchronous task will not mark the component as dirty.

## Zoneless

Which Zoneless only `markForCheck` trigger the change detection. It means that asynchronous tasks like `.subscribe` , `Promise` , `setTimeout`  or `setInterval`  won’t trigger change detection anymore.

`provideExperimentalCheckNoChangesForDebug`

## Unidirectional data flow

Angular refreshes bindings top-down ⬇️

- Is the previous value different from the new value?
→ Yes, update DOM
→ No, skip DOM update (no work)

Angular enforces so-called **unidirectional data flow from top to bottom**.

- Data flows from the parent to the child, and not the other way around
- If the parent state changes, and there are input bindings to child components, those changes are **pushed down** to the child component **during the rendering (change detection) process.**

It’s super important to understand that **Angular updates bindings during change detection**

- So when the framework runs change detection for the parent component `A` it will update the `prop` input binding on the child component `B`.
- This means that **change detection** is also **always performed from top to bottom** for every single component, every single time, **starting from the root component**.

If the child state changes and the parent somehow depends on those changes, the child needs to explicitly send an event back up to the parent with the changed data.

- There’s no built-in mechanism that tracks those changes in the child component and auto-magically propagates them back to the parent.
    - Parent → Child is automatic (@Input)
        - Angular’s change detection engine automatically pushes parent values into child inputs
    - Child → Parent is not automatic
        - No built-in mechanism to “watch” child’s state and update parent.
        - Angular will never magically sync child changes back to parent.
        - Use `@Output()` + `EventEmitter` to notify parent.
        - The child decides **when** and **what** to send upward.

Application state gets stable after a single pass of change detection.

- Keeps the data flow predictable and avoids hidden two-way binding
- Parent is the source of truth; the child only requests changes via events.

Although there’s no built-in mechanism in Angular that can cause parent component model update during change detection, it’s still possible to do cause that effect unintentionally through a variety of mechanisms:

- Injecting parent component reference
- A shared service
- Synchronous event broadcasting

To understand this restriction better, imagine that during the current change detection run, some properties of already checked components somehow got updated. As a result, expressions in templates will produce new values that are inconsistent with what Angular rendered on the screen as part of those components’ check.

So, to summarize, once Angular has processed bindings for the current component, you can no longer update the properties of the component that are used in expressions for bindings.

## Enforcing unidirectional flow

Comparing the current values of component properties and expressions in the template to the ones Angular used and remembered during the preceding change detection cycle.

## Child to parent communication

In Angular, the notification mechanism from a child component to its parent is implemented through output bindings, often referred to as component events.

```jsx
// parent component
@Component({
	template: `
		<h1>Hello {{ value.name }}</h1>
		<a-comp (updateObj)="value = $event" />
	`
})
export class AComponent {
	value = { naem: 'initial' };
	
	constructor() {
		setTimeout(() => {
			console.log(this.value); // logs { name: 'updated' }
		}, 3000);
	}
}

// child component
@Component({})
export class AComponent {
	@Output() updateObj = new EventEmitter();
	
	constructor() {
		setTimeout(() => {
			this.updateObj.emit({ name: 'updated' });
		}, 2000);
	}
}
```

`<a-comp (updateObj)="value = $event" />`

Event through the event binding is part of the template, however those events are triggered **before** Angular runs the change detection cycle, it’s perfectly fine to emit an event that will result to a parent component update.

> *Component events* are most often broadcasted from within the event handlers which are attached to UI events, network events or timers. Since those events are triggered **before** Angular runs the change detection cycle, it’s perfectly fine to emit an event that will result to a parent component update.

In fact, those browser events is what most often triggers change detection. The assumption is that event handlers might change the application state so Angular needs to process side effects, like synchronizing component state with the DOM.
> 

- Where events normally come from
    - A UI event → e.g. a user clicks a button → child emits `clicked`.
    - A network event → e.g. an HTTP request finishes → child emits `dataLoaded`.
    - A timer → e.g. `setTimeout` fires → child emits `timeUp`.
- The timing of these events
    - Angular listens to browser events (clicks, timer ticks, XHR callbacks) via Zone.js
    - When such an event fires, Angular does two things:
        1. Runs the event handler (your code → maybe an `emit(...)` happens here).
        2. After the event handler finishes, Angular runs change detection across components.
        
        ```jsx
        Browser event -> handler executes -> child emits -> parent updates 
        -> Angualr change detection runs -> DOM syncs
        ```
        

However, if the emitted event leads to updates of a parent component properties, and those properties are processed during change detection, i.e. template expressions, the event must be emitted outside of the Angular’s change detection loop. Otherwise this will lead to the properties of a parent component being updated inside the change detection cycle leading to the `NG100`

---

## Zone

Zones provide a mechanism to intercept the scheduling and calling of asynchronous operations. Interceptor logic can execute additional code before or after the task and notify interested parties about the event.

Only one zone can be active at any given time, and this zone can be retrieved through `Zone.current` property

The change detection mechanism is Angular’s internal algorithm (a tree walk of components, running template expressions, etc.).

`onMicrotaskEmpty` basically, will say whenever there are no more microtasks, please notify me.

Zone.js does not run change detection itself. Instead, Zone.js is a notification system. It just tells Angular: *“Hey, something happened (click, setTimeout, HTTP finished, etc.). You might want to check the app state.”*

Angular Zone = a special version that knows how to notify Angular

- NgZone only gets notifications about events that occur inside

```jsx
export class NgZone {
	readonly onMicrotaskEmpty: EventEmitter<any>;
  constructor(...) {
	  forkInnerZoneWithAngularBehavior(self);
  }
  
  run(fn, applyThis, applyArgs) {
    return this._inner.run(fn, applyThis, applyArgs);
  }
  
  runOutsideAngular(fn) {
    return (this as any as NgZonePrivate)._outer.run(fn);
  }
}

function forkInnerZoneWithAngularBehavior(zone: NgZonePrivate) {
  zone._inner = zone._inner.fork({ ... });
}

@Injectable({ providedIn: 'root' })
export class ApplicationRef {
  constructor(
    private _zone: NgZone,
    private _injector: EnvironmentInjector,
    private _exceptionHandler: ErrorHandler
  ) {
    this._onMicrotaskEmptySubscription = this._zone.onMicrotaskEmpty.subscribe({
      next: () => {
        this._zone.run(() => {
          this.tick();
        });
      },
    });
  }
}
```

---

**Zone checking**

```tsx
export class AppComponent {
  constructor(zone: NgZone) {
    console.log((zone as any)._inner.name); // angular
    console.log((zone as any)._outer.name); // root
  }
}

// ɵNoopNgZone
platformBrowserDynamic().bootstrapModule(AppModule, {
  ngZone: 'noop',
});

export class AppComponent {
  constructor(zone: NgZone) {
    console.log(zone instanceof ɵNoopNgZone); // true
  }
}
```

---

**Angular will throw the "ASSERTION ERROR" error: Should be run in update mode**

```tsx
@Component({...})
export class AppComponent {
  constructor(cdRef: ChangeDetectorRef) {
    cdRef.detectChanges();
  }
}
```

This error comes from [this line of code](https://github.com/angular/angular/blob/5f9c7ceb907be47dff3e203dd837fd6ee9133fcb/packages/core/src/render3/instructions/shared.ts#L356) to prevent a change detection run until the entire component tree is instantiated.

---

**runOutsideAngular nuance**

```tsx
@Component({
  selector: 'child',
  template: `Emitted value from parent: {{title}}`,
})
export class Child {
  title = 'nothing yet';

  parent = inject(App)
  ngZone = inject(NgZone);

  constructor() {
    this.parent.emitter.subscribe(value => {
      this.ngZone.run(() => {
        this.title = value.toString();
      });
    });
  }
}

@Component({
  template: `<child />`,
  imports: [Child],
})
export class App {
  emitter = new Subject<number>();
  ngZone = inject(NgZone);

  constructor() {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.emitter.next(9);
      }, 1000);
    });
  }
}
```

We need to add [ngZone.run](http://ngZone.run) because when the setTimeout callback is triggered, it is triggered under the outer zone context. [`this.emitter.next`](http://this.emitter.next) will call the .subscribe synchronously and immediately, so the .subscribe will also be triggered under the outer zone. That is the reason why we need to re-enter the zone again

```tsx
this.ngZone.runOutsideAngular(() => {
	setTimeout(() => {
		this.todo$.next({ name: 'Is it broken?' });
		// Before v17 it's broken, in v18 it just works!
	}, 1000);
});
```

Basically `asyncPipe` does the same thing and is let’s say affected by the same Zone.js patched stuff as other events `{{ todo$ | async }}` , so we have top-down refreshing again.

From v18, even though it’s running outside the Zone, that will still work because now we have `markForCheck` which triggers change detection

```tsx
export class markViewDirty(lView: LView, source: NotificationSource): LView | null {
	// From v18 🔄
	lView[ENVIRONMENT].changeDetectionScheduler?.notify();
	
	// ...
}
```

---

## How & When

As you might expect, the “**when**” part is related to change detection scheduling. It covers when change detection occurs and the factors that lead to its execution.

Importantly, this duo does not know at this point whether any data bound to the template has actually changed, meaning that a refresh may or may not be necessary.

The “**how**” part focuses on the mechanics of change detection execution, including the traversal of the component tree and the process of checking for changes.

Improve when and how

### Change detection scheduler

```tsx
@Injectable({ provideIn: 'root' })
export class NgZoneChangeDetectionScheduler {
  private readonly zone = inject(NgZone);
  
  initilize(): void {
	  this._onMicrotaskEmptySubscription = this.zone.onMicrotaskEmpty.subscibe(() => {
		  next: () => {
			  this.zone.run(() => {
				  this.applicationRef.tick();
			  });
		  }
	  });
  }
  
  tick(): void {
		// ...
		this.detectChangesInAttachedViews(...);
  }
  
  private detectChangesInAttachedViews(...) {
	  for (let (lView) of this._views) {
		  detectChangesInternal(lView, ...);
	  }
  }
}
```

Simplifying a bit, we can say that Angular’s zone (*NgZone*) checks if the microtask queue is empty after each intercepted operation finishes. If it is, it emits a special event, which is then consumed by the scheduler, ultimately resulting in a change detection run.

*Zone.js* provides Angular with hints about completed operations, prompting the framework to react by running change detection. 

- Importantly, this duo does not know at this point whether any data bound to the template has actually changed, meaning that a refresh may or may not be necessary.

**How can the “when” part be improved?**

- Avoiding unnecessary change detection cycles: Zone.js assists Angular’s change detection by notifying it when operations finish, but it doesn’t actually know whether these operations change any data. Because of this, the framework tends to overreact by scheduling a run “just in case”.

### Zoneless scheduler

This shift is significant. Rather than triggering change detection “when some operations just happened, and something might have changed”, the framework now triggers it “when it receives a notification that the data has changed”.

To facilitate this, the new scheduler exposes a special `notify` method, which is called in the following scenarios:

- When a signal read in the template receives a new value (specifically, when **`markAncestorsForTraversal`** is called).
- When a component is marked as dirty via the `markViewDirty` function. This can occur due to a new value received by an `AsyncPipe` , a template-bound event, a call to `ComponentRef.setInput` , or an explicit call to `ChangeDetectorRef.markForCheck` , among others.
- When an `afterRender` hook is registered, a view is reattached to the change detection tree or removed from the DOM. In these cases, `notify` is called, but it only executes hooks without refreshing the view.

Scheduler collects notifications over a short period and schedules a single change detection run instead of triggering it multiple times. This behavior is based on a race condition between `setTimeout` and `requestAnimationFrame`

The key takeaway is that these notify calls are coalesced, ensuring optimal performance.

### Zonefull/hybrid scheduler

Before Angular 18, if a signal value changed outside of the zone, change detection would not be scheduled - only operations performed within the zone would guarantee that change detection would be scheduled. For example, consider the following code, which would not result in a view refresh:

```jsx
zone.runOutsideAngular(() => {
	httpClient.get<Post>('http://jsonplaceholder.typicde.com/posts/1')
		.pipe(
			delay(3000),
			map((res) => res.title)
		).subscribe((title) => {
			this.title.set(title);
		});
});
```

With the enriched hybrid scheduler, we can still achieve a view refresh in the same scenario. This is because the change in the signal value invokes the `notfiy` method, and it no longer matters whether we are inside or outside of the zone.

### How

The “**how**” part focuses on the mechanics of change detection execution, *including the traversal of the component tree* and *the process of checking for changes*.

This involves several operations, including:

- Executing lifecyle hooks
- Update bindings
- Refreshing the view if neccessary

Angular’s component structure form a tree ⇒ a depth-first search (DFS) algorithm

---

## OnPush

OnPush allows us to “cut off” or skip some branches during change detection. 

OnPush components will only be checked when marked as “dirty”

OnPush then kind of tells to says to the change detection “Hey, look, you don’t need to check this particular component unless yes I am telling you to do that.”

For the **`OnPush`** strategy the **`Dirty`** flag will be automatically unset after the first change detection pass.

**`CheckOnce`**, as it implies that change detection is skipped for a component until it’s marked as dirty, then checked once, and then skipped again.

```tsx
function refreshComponent(hostLView, componentHostIdx) {
  // Only attached components that are CheckAlways or OnPush and dirty 
  // should be refreshed
  if (viewAttachedToChangeDetector(componentView)) {
    const tView = componentView[TVIEW];
    if (componentView[FLAGS] & (LViewFlags.CheckAlways | LViewFlags.Dirty)) {
      refreshView(tView, componentView, tView.template, componentView[CONTEXT]);
    } else if (componentView[TRANSPLANTED_VIEWS_TO_REFRESH] > 0) {
      // Only attached components that are CheckAlways 
      // or OnPush and dirty should be refreshed
      refreshContainsDirtyView(componentView);
    }
  }
}
```

**OnPush test case**

```tsx
should skip OnPush components in update mode when they are not dirty
should not check OnPush components in update mode when parent events occur

should check OnPush components on initialization
should call doCheck even when OnPush components are not dirty
should check OnPush components in update mode when inputs change
should check OnPush components in update mode when component events occur
should check parent OnPush components in update mode when child events occur
should check parent OnPush components when child directive on a template emits event
```

### Dirty marking

***Dirtiness***

What can make a component dirty?

- An input value changes (immutable) (`setInput`)
    
    ```tsx
    setInput(name: string, value: unknown): void {
      // Do not set the input if it is the same as the last value
      if (Object.is(this.previousInputValues.get(name), value)) {
    	  return;
      }
      
      // ...
      setInputsForProperty(lView[TVIEW], lView, dataValue, name, value);
      markViewDirty(childComponentLView); // mark the component as dirty
    }
    ```
    
- A template-bound event occurs (including output emit and host listener)
    
    ```tsx
    <button (click)="onClick()">Hi</button>
    <hlm-select (openedChange)="onOpen()"></hlm-select>
    
    // instructions/listener.ts
    function wrapListener(): EventListener {
      return function wrapListenerIn_markDirtyAndPreventDefault(e) {
    	  // ...
    	  markViewDirty(startView); // mark the component as dirty
      }
    }
    ```
    
- A value is consumed by an async pipe
- A direct call to `ChangeDetectorRef.markForCheck()`
    
    ```tsx
    export class ChangeDetectorRef {
    	markForCheck(): void {
    		markViewDirty(...);
    	}
    }
    ```
    
- A state change of a `@defer` block

```tsx
export class markViewDirty(lView: LView, source: NotificationSource): LView | null {
	// From v18 🔄
	lView[ENVIRONMENT].changeDetectionScheduler?.notify();
	
	while (lView) {
		lView[FLAGS] |= LViewFlags.Dirty;
		const parent = getLViewParent(lView);
		if (isRootView(lView) && !parent) {
			return lView;
		}
		
		lView = parent!;
	}
	
	return null;
}
```

The heart of the dirty marking process is `markViewDirty`

- “bubble up” dirty not only the component where the change originates but all of its parent components up to the root
- The only exception to the “bubbling up” rule occurs when a component is marked as dirty due to an input value change from a parent component’s binding. In this case, the parent component is already in the middle of its own change detection check, so there’s no need to mark it as dirty again. Instead, only the component receiving the input is marked, allowing change detection to process it after the parent finishes.
    - Two implicit phases: conceptually you can think of “marking” (what needs to be checked) and then “checking” (the top → down traversal that actually runs checks). If the parent is already being checked we are in the “checking” phase for that parent - so marking the parent again during that phase is unnecessary; the important thing is making sure the child is included in the remaining traversal.

**Example for button click under the hood**

So with this thing in mind, let’s say we have a button click example, and then we have a button like a plus on there. And then we click on the button, and now Angular calls this `wrapListenerIn_markDirtyAndPreventDefault`. What this will do is call `markViewDirty`. So what we do is mark the current component and its ancestors up to the top as dirty.

But don’t forget about Zone.js, because now Zone.js gets notified by the click, since Angular basically uses `addEventListener` under the hood. So Zone.js gets notified by the click, and after everything is finished—when there’s no more work on the microtask queue—`onMicroTaskEmpty` gets fired. Then `applicationRef.tick()` gets called, and Angular goes to the app component and says: refresh everything from the top down.

### Check No Changes

```tsx
export class ApplicationRef {
	tick(): void {
	  try {
	    this._runningTick = true;
	    for (let view of this._views) {
	      view.detectChanges();
	    }
	    if (typeof ngDevMode === 'undefined' || ngDevMode) {
	      for (let view of this._views) {
	        view.checkNoChanges();
	      }
	    }
	  } catch (e) { ... } finally { ... }
	}
}
```

We can also see that in development mode, tick also runs checkNoChanges that performs a second change detection cycle to ensure that no further changes are detected.
If additional changes are picked up during this second cycle, it means that bindings in the app have side-effects that cannot be resolved in a single change detection pass.

### Surprising ngDoCheck behavior

There’s an unexpected behaviour related to **`detectChanges`**.

The **`ngDoCheck`** hook is not triggered for the component that you trigger **`detectChanges`** on.

This happens because lifecycle hooks are executed on child components when checking their parents,

not the current component on which the call is made.

One of the reasons it’s designed like this is to allow manual control of **`OnPush`** logic from the **`ngDoCheck`** hook.

If a child component is defined as **`onPush`**, and no input bindings have changed, you still can call **`markForCheck()`**

from [**`ngDoCheck`**](https://angular.love/if-you-think-ngdocheck-means-your-component-is-being-checked-read-this-article/) of this child component to mark the component as dirty.

```tsx
function refreshComponent(hostLView, componentHostIdx): void {
  ...
  const tView = componentView[TVIEW];
  if (componentView[FLAGS] & (LViewFlags.CheckAlways | LViewFlags.Dirty)) {
    refreshView(tView, componentView, tView.template, componentView[CONTEXT]);
  }
}
```

### Signals Part

When a producer signal’s value is changed, the values of dependent consumers, e.g. computed signals, are not immediately updated. When a computed signal is read, it checks if any of its previously recorded dependencies have changed and re-evaluates itself if necessary.

This makes computed signals lazy, or pull-based, meaning they are only evaluated when accessed, even if the underlying state changed earlier. In our example above, the computed signal value is only evaluated when we call **`isEven()`**, although the update to the underlying dependency **`counter`** happened earlier, when we executed **`counter.set()`**.

Besides regural writable and computed signals, there’s also a concept of watchers (effects). In contrast to the pull based evalulation of computed signals, changing a producer signal will immediately notify a wacher, **synchronously** calling watcher’s notification callback, effectively “pushing” the notification. Frameworks wrap watchers into effects that are exposed to users. Effects delay notification of user code through scheduling.

Unlike Promises, everything in signals runs synchronously:

- Setting a signal to a new value is synchronous, and this is immediately reflected when reading any computed signal which depends on it afterwards. There is no built-in batching of this mutation.
- Reading computed signals is synchronous — their value is always available.
- Watchers are notified synchronously, but effects that wrap those watchers may opt to batch and delay notification through scheduling.

### Active consumer

**The reactive context defines an active consumer object**, that depend on producers, and is available to their accessor function whenever their value is read. For example, we have a consumer **`isEvent`** here, that depends on the **`counter`** producer (consumes its value). That’s dependency is defined by accessing the value of **`counter`** inside the **`computed`** callback:

```jsx
isEvent = computed(() => (counter() & 1) === 0)
```

When the computed callback will run, it will automatically execute the accessor function of the **`counter`** signal to get its value. **We can say that in that case the `counter` signal is being executed in the reactive context of the `isEvent` consumer.** So, a producer is being executed in the reactive context if there’s an active consumer that depends on this producer’s value.

To implement this mechanism of reactive context, every time a consumer’s value is accessed, but before it’s recomputed (before the `computed` callback is run), we can set this consumer as the active consumer. This can be done by simply assigning that consumer object to the global variable and keep it there while the callback is being executed. This global variable will be available to all producers queried during the execute on of `computed` callback, and it will define the reactive context for all producers that this consumer depends on.

That’s exactly what Angular is doing. When the computed callback is executed, it will first set the current node as active consumer in `producerRecomputedValue` :

```jsx

export function createComputed<T>(computation: () => T): ComputedGetter<T> {
  ...
  const computed = () => {
    // Check if the value needs updating before returning it.
    **producerUpdateValueVersion**(node);
		...
  };
}

function **producerUpdateValueVersions**() {
	...
	node.producerRecomputeValue(node);
	...
}

function **producerRecomputeValue**(node: Computed<unknown>): void {
	...
	const prevConsumer = consumerBeforeComputation(node);
	
	...
	newValue = node.computation();
	...
}

function **consumerBeforeComputation**(node: ReactiveNode | null) {
	node && (node.nextProducerIndex = 0);
	return setActiveConsumer(node);
}
```

![image.png](attachment:8fa52629-b026-412b-8ee4-779e126b91b1:image.png)

Because of that, while the computed’s callback is being executed, every producer that’s queried during the time of that consumer being active, will know that they are executed in the reactive context. All producers executed in the react context of a particular consumer are added as the dependencies of the consumer.

### Reactive graph

The reactive graph is built through dependencies between consumers and producers. Reactive context implementation through value accessors make it possible for signal dependencies to be tracked automatically and implicitly.

When a producer is executed, it adds itself to the dependencies of the current active consumer (the consumer defining the current reactive context). This happens inside the `producerAccessed` function:

```jsx
// Record that someone looked at this signal
export function producerAccessed(node: ReactiveNode): void {
	...
	// This producer is the `idx`th dependency of `activeConsumer`
	const idx = activeConsumer.nextProducerIndex++;
	if (activeConsumer.producerNode[idx] !== node) {
		// We're a new dependency of the consumer (at `idx`)
		activeConsumer.producerNode[idx] = node;
		
		// If the active consumer is live, then add it as a live consumer.
		// If not, then use 0 as a placeholder value.
		activeConsumer.producerIndexOfThis[idx] = consumerIsLive(activeConsumer)
			? producerAddLiveConsumer(node, activeConsumer, idx);
	}
}
```

Both producers and consumers participate in the reactive graph. This dependency graph is bidirectional, but there are differences in which dependencies are tracked in each direction.

Producers are tracked as dependencies of a consumer through the `producerNode` property, creating edges **from consumers to producers**:

```jsx
interface ConsumerNode extends ReactiveNode {
	producerNode: NonNullable<ReactiveNode['producerNode'];
	producerIndexOfThis: NonNullable<ReactiveNode['producerIndexOfThis']>;
  producerLastReadVersion: NonNullable<ReactiveNode['producerLastReadVersion']>;
```

Certain consumers are also tracked as “live” consumers and create edges in the other direction, **from producer to consumer**. These edges are used to propagate change notifications when a producer’s value is updated:

```jsx
interface ProducerNode extends ReactiveNode {
	liveConsumerNode: NonNullable<ReactiveNode['liveConsumerNode']>;
  liveConsumerIndexOfThis: NonNullable<ReactiveNode['liveConsumerIndexOfThis']>;
 }
```

Consumers always keep track of the producers they depend on. Producers only track dependencies from consumers which are considered as “live”. A consumer is “live” when it has `consumerIsAlwaysLive` property set to `true`, or is a producer which is depended upon by a live consumer.

In Angular, two types of nodes are defined as live consumers:

- `watch` nodes (used in effects)
- reactive `LView` nodes (used in change detection)

---

From the perspective of the signals graph, the component view acts as a reactive consumer.

When a signal in the template gets a new value, it marks the reactive consumer as dirty. It’s important to emphasize this distinction - the reactive consumer attached to the component view is marked as dirty, not the component view itself (i.e., not the node in the component tree). Otherwise, it would be the same process as the regular OnPush strategy.

Marking the reactive consumer as dirty will trigger `markAncestorsForTraversal`

- This function travels from the component up through its ancestors to the root component (as `markViewDirty` did), but instead of marking them as dirty, it leaves the current component as is (since the reactive consumer is already marked as dirty). Its ancestors, however, receive a new `HasChild.ViewsToRefresh` flag

This new approach to change detection, where only one component is change detected thanks to signals, is often called “semi-local” or “global-local/glocal” change detection.

Without Zoneless, to benefit from semi-local change detection, the trigger needs to come from an action that does not mark the component as dirty but still schedules change detection for us. Examples include:

- `setInterval` , `setTimeout`
- `Observable.subscribe` , `toSignal(Observable)` , e.g. `HttpClient` call
- RxJS `fromEvent` , `Renderer2.listen`

**Effects**

Angular templates are now **“effects” (consumers)!**

Every time a signal that is read inside a template is updated, the component is marked as `RefreshView`

![image.png](attachment:11380beb-78ba-4215-9f78-89adbfe0b86e:image.png)

Anytime that Angular does change detection or top down refreshing it will go on each node and see okay if this is a `RefreshView` then I should always refresh this no matter what.

Another flag is `HasChildViewsToRefresh` and what this will do is this basically will be applied on all the ancestors of this `RefreshView` let’s say component.

---

### ngDoCheck

- `ngDoCheck` being called on a component doesn’t mean that the component itself is undergoing a change detection cycle - it means its parent is.
    - When Angular runs change detection on a parent, `ngDoCheck` is called on its child component, but that doesn’t mean the child’s bindings are being reevaluated. Instead, this hook allows you to run custom logic and, if necessary, let Angular know that the child should be change detected as well.

---

## Component views and bindings

There are two main building blocks of change detection in Angular:

- a component view
- a associated bindings
    - In Angular, when the compiler analyzes the template, it identifies properties of a component that are associated with DOM elements. For each such association, the compiler creates a binding.
    - A binding defines a relationship between a component’s property (usually wrapped in some expression) and the DOM element property.
    - The binding defines the property name to update and the expression that Angular uses to obtain a new value
        
        ```tsx
        binding
        name: textContent
        expression: time | date: 'dd.MM.yyyy'
        ```
        

```tsx
if (changeDetectionPhase) {
    property("className", "fa-star " + (ctx.rating > 0 ? "fas" : "far"));
    ...
}

export function property(propName, value, ...) {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();

  if (bindingUpdated(lView, bindingIndex, value)) {
    const tView = getTView();
    const tNode = getSelectedTNode();
    elementPropertyInternal(tView, tNode, lView, propName, value, ...);
  }

  return property;
}
```

The change detection mechanism executes instructions that process bindings.

The job of these instructions is to check if the value of an expression with a component property has changed and perform DOM updates if necessary.

Change detection is performed for each view. When Angular checks a view, it simply runs over all bindings, evaluates their expressions, and compares their result to the value stored in the **oldValues** array on the view.

After each change detection cycle, in the development mode, Angular **synchronously** runs another check to ensure that expressions produce the same values as during the preceding change detection run. This check is not part of the original change detection cycle. It runs **after** the check is finished for the entire tree of components and performs exactly the same steps. However, this time, as Angular detects the difference, it doesn’t update the DOM. Instead, it throws the **`****ExpressionChangedAfterItHasBeenCheckedError****`**.

Once Angular has processed bindings for the current component, you can no longer update the properties of the component that are used in expressions for bindings.

To prevent the error, we need to ensure that the value returned by expressions during the change detection run and the following check are the same. We learned that the check that produces the error runs **synchronously** right after the change detection cycle. So if we update it **asynchronously**, we will avoid the error. 

### Change detection operations and order

```tsx
function checkAndUpdateView(view, ...) {
    ...       
    // update input bindings on child views (components) & directives,
    // call NgOnInit, NgDoCheck and ngOnChanges hooks if needed
    Services.updateDirectives(view, CheckType.CheckAndUpdate);
    
    // DOM updates, perform rendering for the current view (component)
    Services.updateRenderer(view, CheckType.CheckAndUpdate);
    
    // run change detection on child views (components)
    execComponentViewsAction(view, ViewAction.CheckAndUpdate);
    
    // call AfterViewChecked and AfterViewInit hooks
    callLifecycleHooksChildrenFirst(…, NodeFlags.AfterViewChecked…);
    ...
}
```

Angular triggers lifecycle hooks as a part of change detection.

Some hooks are called before rendering the part when Angular processes bindings, and some are called after that.

- First, it updates input bindings for child components
- Then it calls the **OnInit**, **DoCheck,** and **OnChanges** hooks again on the child components
- Then Angular performs rendering for the current component, after that it runs change detection for child components (*This means that it’ll basically repeat these operations on the child view*)
- And finally, it calls **AfterViewChecked** and **AfterViewInit** hooks on the child components to let them know that it’s been checked

### Lifecyle hooks

It’s important to understand that most lifecycle hooks are called on the child component while Angular runs change detection for the current component. The behavior is a bit different only for the `ngAfterViewChecked` hook.

If you have the following component hierarchy: `A -> B -> C` , here is the order of hooks calls and bindings updates :

```jsx
Entering view: A
    B: updateBinding
    B: ngOnChanges
    B: ngDoCheck
        A: updateTemplate
    B: ngAfterContentChecked
    Entering view: B
        С: updateBinding
        C: ngOnChanges
        С: ngDoCheck
            B: updateTemplate
        С: ngAfterContentChecked
        Entering view: C
            С: updateTemplate
            С: ngAfterViewChecked
    B: ngAfterViewChecked
A: ngAfterViewChecked
```

## NOTES

Fine-grained information

**a new reactivity primitive**

Signal getter functions → signals are able to keep track of where they're being read (interested consumers)

Mutation API → Signals can know when they're mutated and notify previous interested consumers about the change.

An operation that's performed when the signals it depends on are changed is called an "effect".

Template pseudo-effect
- For example, Angular will use an effect to update a component's UI whenever any signals read within that component's template are changed.

Computed signals can be *lazy* and only recompute intermediate values on demand.

Automatically Tracking

A cornerstone of our signal system design is that when computed signals and effects run, they keep track of which signals were read as part of the computation or effect function. Knowing the dependencies allows the signal system to re-run the computation or effect function automatically whenever any signal dependencies change.

• The framework can track which signals are accessed in a given template, giving us fine-grained information about which components are affected by a given change to the model.
• Reading signals can't trigger side effects.
• Computed signals can be *lazy* and only recompute intermediate values on demand.