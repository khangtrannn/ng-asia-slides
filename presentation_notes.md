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


## runOutsideAngular
```typescript
@Component({
  selector: 'todos',
  standalone: true,
  imports: [AsyncPipe, JsonPipe],
  template: `{{ todos$ | async | json }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodosComponent {
  private http = inject(HttpClient);
  private ngZone = inject(NgZone);

  todos$ = of([] as any[]);

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        // this will be updated, but there's nothing triggering zonejs
        this.todos$ = this.getTodos();
      });
    });
  }

  getTodos() {
    return this.http
      .get<any>('https://jsonplaceholder.typicode.com/todos/1')
      .pipe(shareReplay(1));
  }
}
```
- We use `setTimeout` (to skip the first task being run and also because Angular runs change detection at least once by default) and inside the `setTimeout`, we assign a value to the observable (yay we have a change).
- Because `setTimeout` won’t run inside the zone, also the API call will be made outside the zone because the code is run inside `runOutsideAngular`, **there is nothing notifying zonejs that something changed**

## AsyncPipe
```typescript
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

it('should request a change detection check upon receiving a new value', done => {
    pipe.transform(subscribable);
    emitter.emit(message);
 
    setTimeout(() => {
      expect(ref.markForCheck).toHaveBeenCalled();
      done();
    }, 10);
});
```

# Glitch-Free Efect or Push/Pull Algorithm
```ts
effect(() => {
  console.log(this.holidays());
})

async search() {
  const holidays = await this.holidayService.find(this.query(), this.type());
  this.holidays.set([]);
  this.holidays.set([{ ...createHoliday(), isFavourite: false }]);
  this.holidays.update((value) => [...value, ...value]);
  this.holidays.set([]);
  this.holidays.set(holidays;)
}
```
The effect only aware of the last holidays => that's the glitch-free
Glitch-free: I am only going to activate or request the data from the signals if I'm running in the change detection so if I'm running asynchronously and only then will I take the last value that I have or the current value and this also has an impact on the computed because they will only run once in the change detection.

### Drawbacks
You can't expect that every change will be processed by an effect 
So if you want to implement something and you rely there that every effect knows about the changes of the signals then you will not be very lucky here

```ts
async search() {
  this.holidays.set([]);
  const holidays = await this.holidayService.find(this.query(), this.type());
  this.holidays.set(holidays);
}
```
With the above code the effect will execute twice. 
When we click on search the holidays are set to empty and in the same time or right afterwards I'm starting with an HTTP request now, why should Angular wait until this request comes back, it wants of course it needs to render now because it says yeah now I'm run the change detection and it will then say okay this holidays have being set to empty we don't know about the rest. that's asynchronous will happen sometime later so this first one will be then triggered or will then be processed by the effect and also by the template then the response comes back which is where we are then and they all run asynchronously and then only the last one will be taoken into consideration and that's why we see then only the last execution.

# async/await & effect
```ts
effect(async () => {
  console.log('Async/await experimental with effect');
   await new Promise((resolve) => setTimeout(resolve, 1000));
  this.greeny.set(true);
});
```
With the above implementation, we won't encounter the issue `allowSignalWrites` because:
When you run an asyn function, an async function is not really one function. Async function is compiled into two parts. The part before the await, which is synchronous, and everything after the await, which is actually wrapped into another function that is scheduled to run later.
So this is actuall different task. This is not the same task.
So in the first part is a synchronous function. And it runs normally. And during these lines you are in reactive context.
But once this function completes, the effect gets the control back completes the reactive context, and then the rest of the function is wrapped in another function, which is scheduled to run later. So it just gets in the queue, but it's not executed yet. And when it's executed, it's no long executed in reactive context, which means that we're now in a whole new cycle of the thread and things are already released. Everything has to do with changes has already been taken care of.
So now `this.greeny.set(true)` that runs laters and it initiates a change in a signal. And it can actually do that.
So this is a new task. And you can actually do that.

# effect timing
```ts
export class FooComponent {
  // Run before component is synced
  effect(() => {})

  // Run after app is fully synced
  afterRenderEffect(() => {
    
  });

  // Run once after the app rendered, can be used as replacement of ngAfterViewInit
  afterNextRender(() => {
    
  });

  // run everytime the app rendered
  afterRender(() => {
    
  })
}
```

# Fundamentals
The getter function is used to access the current value and record signal read in a reactive context - this is an essential operation that builds the reactive dependencies graph.

# Equality
It is possible to, optionally, specify an equality comparator function. If the equality function determines that 2 values are equal, and if not equal, writable signal implementation will:
- block update of signal’s value
- skip change propagation.

# Computed
```ts
const counter = signal(0);

// creating a computed signal
const isEven = computed(() => counter() % 2 === 0);

// computed properties are signals themselves
const color = computed(() => isEven() ? 'red' : 'blue');

// providing a different, even value, to the counter signal means that:
// - isEven must be recomputed (its dependency changed)
// - color don't need to be recomputed (isEven() value stays the same)
counter.set(2);
```
The algorithm chosen to implement the computed functionality makes strong guarantees about the timing and correctness of computations:
- Computations are lazy: the computation function is not invoked, unless someone is interested in (reads) its value.
- Computations are disposed of automatically: as soon as the computed signal reference is out of scope it is automatically eligible for garbage collection. No explicit cleanup boundaries and / or operations are exposed by the library.
- Computations are glitch-free: it is guaranteed that a given computation is executed a minimal number of times in response to dependencies change. The computation never executes with stale / intermediate dependency values and is immune to the famous “diamond dependency problem”. The glitch-free execution doesn’t require any explicit “transaction” or “batching” operations.

# Scheduling and timing of effects
Effects in Angular Signals must always be executed after the operation of changing a signal has completed.

Given the variety of effect use-cases, there is a wide spectrum of possible execution timings. This is why the actual effect execution timing is not guaranteed and Angular might choose different strategies. Application developers should not depend on any observed execution timing. The only thing that can be guaranteed is that:
- effects will execute at least once;
- effects will execute in response to their dependencies changes at some point in the future;
- effects will execute minimal number of times: if an effect depends on multiple signals and several of them change at once, only one effect execution will be scheduled.

# Can I create signals outside of components / stores / services?
Yes! You can create and read signals in components, services, regular functions, top-level JS module code - anywhere you might need a reactive primitive.
We see this as a huge benefit of signals - reactivity is not exclusively contained within components. Signals empower you to model data flow without being constrained by the visual hierarchy of a page

# LinkedSignal
So in these hybrid situations where you have a signal which one hand is writable, but at the same time it is computed, it is in some way dependent on another signal.

```ts
selectedProduct = linkedSignal(() => {
  source: this.products,
  computation: (products, prev) => {
    if (products.include(prev?.value)) {
      return prev.value;
    }

    return this.products[0];
  }
})
```

# Isn't calling a function in a template slow?
Angular developers have learned over the years to avoid calling functions inside templates because the function re-runs on every change detection. This idea no longer applies in a signal-based component because the expressions will only re-evaluate as a result of a signal dependency changing.

# Signal-based inputs
```ts
@Component({
  signals: true,
  selector: 'user-profile',
  template: `
    <p>Name: {{ firstName() }} {{ lastName() }}</p>
    <p>Account suspended: {{ suspended() }}</p>
  `,
})
export class UserProfile {
  // Create an optional input without an initial value.
  firstName = input<string>(); // Signal<string|undefined>

  // Create an input with a default value
  lastName = input('Smith'); // Signal<string>

  // Create an input with options.
  suspended = input<boolean>(false, {
    alias: 'disabled',
  }); // Signal<boolean>
}
```

Reading the value from an input always returns the up-to-date bound value.

# Model inputs
When using two-way binding, the binding accepts a WritableSignal reference and not the unwrapped signal value. By passing the signal reference instead of the value, you're explicitly opting into the contract that the child component can write values into your signal. We see this pattern as additionally illustrating, by contrast, the value of explicitly invoking the signal getting for one-way bindings.

# TODO
- Read Angular documention inside source code about Signal

- Combine your talk with this one
Very good video about Angular compiler
https://www.youtube.com/watch?v=S0o-4yc2n-8

# Terms
- Zone-awere
- Dirty checking, dirtyness
- Dirty marking

# Signal Mental Model & Bidirectional
- Signals at their core are an event system. You have publishers and subscribers. However, they are more specific than a typical event system in that their only event is their value and they relay events along a whole graph synchronously based on value change. They are also more than an event system which only relies on pushing out change notifications. They defer execution until their values are pulled. So while a state change may schedule some value update or side effect, it's not until you read that value or execute that side effect that the code needs to run. This is called push/pull system. It gives us gurantees that aren't possible in a purely pushbased system like an event. No matter the graph shape, we can ensure that each node runs only once and with the correct value. This is called glitch-free execution as become common in signals libraries in Javascript.
This means that siganls form a directed asylic graph and their updates are predictable and avoid stabiilization bouncing that were common in the early 2010s.

- With Signal, we will automatically bidirectional data flow possible. Because it understands what changes and where it changes.
- Signal will bring you a data structure that has a hierachy that has links between consumers and producers will have the framework now when and more what to rerender
- By reacting to the Signals, Angular knows exactly when and what to update.
- So the rendering the DOM update is just a side effect of those signals which also means that the perspective will change from a componentry to that signal graph because this is where the data comes from and this is also where the change detection where the update of the DOM needs to be triggered.

- setTimeout, setInterval will always triggering change detection cycle. If any data changes occur, the component view will be updated during the change detection process.

- Angular signals are "eager push / lazy pull" based reactive primitive
  - Lazy pull means that the value is only pull when the caller executes the getter function.

- Executing signals does not trigger side effects, though it may lazily recompute intermediate values (lazy memoization).
  Particular contexts (such as template expressions) can be reactive. In such contexts, executing a signal will return the value, but also register the signal as dependency of the context in question. The context's owner will then be notified if any of its signal dependencies produces a new value (usually, this results in the re-execution of those expressions to consume the new values).

# Angular Pull Based
### Observable
Observables are async!
```ts
myObservable.subscribe(console.log);
// Doesn't log synchronously (could in some cases)
```
Observables are sync!
```ts
const subject = new Subject<number>();
subject.subscribe(console.log);

subject.next(42);
// synchronously logs 42

console.log('foobar');
```
The log here inside subscribe is kind of synchronous. Pushing something into a pipe if you already subscribed to it will call the subscription synchronously before calling to the next function.

### Signal
```ts
const mySignal = signal(42);
console.log(mySignal());
// synchronously logs 42
```

Signals are also async!
```ts
const mySignal = signal(0);
effect(() => console.log(mySignal()));

mySignal.set(42);
console.log('before');
// logs "before" then "42"
```

Reading with Signals are synchronous, but when your write to it, the subscribers will be asynchronous.
But with Observable, when you read something you will have to wait until it emits value, so read is asynchronous. But when you write to it, the subscribers will execute synchronous

```ts
@Component({
  template: `
    @if (viewModel$ | async; as viewModel) {
      // async is an implicit subscription
      {{ viewModel.someProp }}
    }
  `
})
export class MyComponent {
  viewModel$ = combineLatest({
    someProp: someService.someValue$,
    someOther: someService.someOtherValue$,
    // imagine if this observable doesn't emit, we will get a blank screen
    someStream: someService.aSubject$
  });
  // updated everytime once one of the observables is updated
}
```

*Push-based sum up*
- We're working with streams, not states
- Each emit ("push") triggers the computation in the subscribers (mostly the template for us)
- A void when nothing is emitted (if not taken care of)
- Change deteciton is still coalesced thansk to the Hybird CD
We are driven by event emission

**UI = fn(state)**
Consumption and computations are driven by consumers
So it means that it will be the framework that determines when you want to do the computations to run it only when you need it so by running our framework like I said with the function the UI is the function of the state. When we know that we need to update the UI that we will call the state and we will compute everything when it's actually needed and not too many times.

# @inputs are signals
In signal-based components, inputs will be signals! This choice is directly aimed at the goal of having a clear, unified model for how data flows through an application.

Signal-based inputs have a major impact on data flow, because they work as computed signals, and not change-detected expressions.

In a zone-based application today, inputs are set during change detection. Let's say the HomePageCmp has the following template:
```ts
// <user-profile [userData]="authService.loggedInUser.data" />
ɵɵdefineComponent({
  type: TestCmp,
  selectors: [['test-cmp']],
  decls: 1,
  vars: 1,
  consts: [[3, 'userData']],
  template: function TestCmp_Template(rf, ctx) {
    if (rf & 1) {
      ɵɵelement(0, 'user-profile', 0);
    }
    if (rf & 2) {
      ɵɵproperty('userData', ctx.authService.loggedInUser.data);
    }
  },
  encapsulation: 2,
});
```
Suppose the loggedInUser changes. zone.js will notice something happened but doesn't know what specifically changed, and will trigger change detection for the whole application. Change detection will process the HomePageCmp and re-evaluate the binding to [userData]: the expression authService.loggedInUser.data. It will set the UserProfileCmp.userData field to the new value, before descending into the UserProfileCmp and evaluating its template, which might make use of the userData.

#### Signal-based inputs as computations


# Requirements for new reactive primitive
- It must be able to notify Angular about model changes affecting individual components (per overall goals).
- It must provide synchronous access to the model, because template bindings must always have a current value.
- Reading values must be side-effect free.
- It must be _glitch fre_e: reading values should never return an inconsistent state.
- Dependency tracking should be ergonomic.

# Mental models
- Reactive context & reactive graph
- Producer vs Consumer (Non Live / Live / Transitive Live)
- Push vs Poll Pull? (algorithms adn phases)
- Eager vs Lazy
- Equality & value version (poll)

# Signals reactivity
- Reading singal pulls the current value
- Updating signal sends eager push notifications that its value might have changed (dirtiness)
- Only reactive live consumers get notified
- The console.log() is not a live reactive consumer!
- Because reading a signal is done through a getter rather than accessing a plain variable or value, signals are able to keep track of where they're being read. And because mutations are always done with the mutation API, signals can know when they're mutated and inform previous readers about the change.

# Why is this a good fit for Angular?
Signals as a reactive primitive meet all of the above requirements:
- The framework can track which signals are accessed in a given template, giving us fine-grained information about which components are affected by a given change to the model.
- Signals allow synchronous access to their values.
- Reading signals can't trigger side effects.
- Modern signal implementations are glitch-free and don't expose inconsistent states to the user.
= Signal implementations can track dependencies automatically.
- Signals can be used anywhere, not just in components, which plays well with Angular's dependency injection system.

Additionally, we see a number of additional benefits of signals:
- Computed signals can be lazy and only recompute intermediate values on demand.
- There are relatively few concepts for developers to learn.
- They are easily composed with other reactivity systems, including RxJS and Angular's current zone-based reactivity.

Signals will affect many areas of the framework, especially including:
- Data flow and model synchronization
- The change detection process
- Component lifecycle
- Reactive values produced by the framework (ex. @Inputs)



# Reactive context
```typescript
computed(() => {
  return this.counter() % 2 === 0;
});

effect(() => {
  console.log(this.counter());
});

@Component({
  template: `{{ counter() }}`
})

// The currently active consumer `ReactiveNode`, if running code in a react context
let activeConumser: ReactiveNode | null = null;
```

*Accessing Signal value (pull) in reactive context (eg effect) creates new edge in reactive graph*

Angular reactive graph consists of producers who push dirtiness and consumers who pull* current value

# Reactive graph for computed (non live consumer)
```typescript
@Component()
export class CouterComponent {
  counter = signal(0);

  isEven = computed(() => this.counter() % 2 === 0);

  ngOnInit() {
    console.log(this.isEven());
  }
}
```
- Pulling Signal value in a non-live consumer will create unidirectional reference from non-live consumer to the producer, no dirtiness will be pushed

# Reactive graph for effect (live consumer)
```typescript
@Component()
export class CounterComponent {
  counter = signal(0);

  constructor() {
    effect(() => {
      console.log(`counter value is`, this.counter());
    });
  }
}
```
- Pulling Signal value in a live consumer will create bi-directional reference, eager push (producer) and lazy pull* (live consumer)
  Pulling Signal in a live consumer will create a bi-directional reference so the producer (the counter) will eagerly push the dirtiness whenever it changes to the effect so then effect can schedule itself to rerun and then lazy pull that value out of the counter.

# Reactive graph for computed (transitive live consumer)
```typescript
@Component()
export class CounterComponent {
  counter = signal(0);
  isEven = computed(() => this.counter() % 2 === 0);

  constructor() {
    effect(() => {
      console.log('effect is even', this.isEven());
    });
  }
}
```
A computed which became live because it was used in another live consumer like `effect` or a template which makes it transitive live consumer

- The computed will become live consumer with bi-directional reference if it's consumed by other live consumer (effect or template)

# Reactive graph
- Not everything about Angular Signals is reactive in BOTH directions! (push vs pull)
- Only LIVE (and TRANSITIVE LIVE) CONSUMERS are bi-directinoala
  - effect
  - template
  - computed as long as is used in transitively in
    - effect
    - template

- Whenenver we are accessing a Signal by executing their getter function, the Signal will look for activeConsumer, if there is any, it will push that active consumer to the dependencies tracking for dirty push phase later.

# Reactive Graph Gotchas
- "Signals used in the reactive context"
```typescript
effect(() => {
  if (Math.random() > 0.5) { // 50% chance
    console.log(this.counter());
  }
});
```

# Reactive Graph Untraced
- Consume signals without updating reactive graph
```typescript
effect(() => {
  // direct access
  console.log(untracked(counter));

  const user = currentUser(); // this is tracked

  // prevent adding of accidental deps in external code
  untracked(() => {
    this.loggingService.log(`User set to ${user}`) ;
  });
});
```

# Separation of PUS vs PULL phases
```typescript
@Component({})
export class CounterComponent {
  counter = signal(0);

  constructor() {
    effect(() => {
      console.log('effect', this.counter()) // ??
    });
    this.counter.set(1);
    this.counter.update(current => current + 1);
  }
}
```
Effect schedules itself on the microtask queue and this code runs synchronously at constructor time. So what does it mean?
We define the signal, we define the effect. The effect starts as dirty and it schedules its own run in the microtask queue and then still synchronously we set the value to 1 and then update value to 1.
So the counter signal definitely push the dirtiness through the reactive graph. But the thing is because this effect didn't run yet, so the counter signal was not yet added as a dependency inside of that reactive graph. So these updates to the counter signal are basically ignored and even the dirtiness was not really pushed because there was no edge in the graph yet.
After this effect actually runs it will access the value of the counter for the first time and only then the edge in the reactive graph between the counter signal as a producer and effect as a consumer will be created.
This also means we are going to get the latest value of the counter signal when the effect run for the first time.

Angular fully separates the push phase from the pull phase so you will never really update the values in the signals in that single execution

# PUSH / POLL PULL? ALGORITHM
- The count() was updated +1 and send push notification (dirtiness)
- The computed and effect are live consumers, effect runs and...
🧩 TODO: Watch video for this section again and reread the book Angular Signals from Kevin

# Laziness, polling, value versions...
- Laziness applies to the POLL PULL? phase of the reactive algorithm
- Consumers POLL the producers to see if their value (version) as changed
- The computed can be both producer and consumer as we move through the graph
- Polling will re-run some producers (eg computed)
- Consumers don't run if the value version of producer stays the same (after poll)
- Always be mindful of the fact the computed and effects are lazy and might not run on every "interaction"

# What is the current role of Zone.js

# Mutate
The mutate API has been removed from Angular v17, so this is in general to be a good step in the right direction because mutating your data breaks a lot of functionality in basic Angular itself. So the most typical example, even when you use default change detection, if you mutate your data which are passing through inputs to some kind of components, the ngOnChanges life cylce hook will not be called.

# COMPUTED
Both state and computed signals are considered producers of values. Producers represent signals that produce values and can deliver change notifications.
### Lazy evaluation (Pull-based)
When a producer signal’s value is changed, the values of dependent consumers, e.g. computed signals, are not immediately updated. When a computed signal is read, it checks if any of its previously recorded dependencies have changed and re-evaluates itself if necessary.
This makes computed signals lazy, or pull-based, meaning they are only evaluated when accessed, even if the underlying state changed earlier.
*Reading computed signals is synchronous - their value is always available*

# EFFECTS (Watchers)
Effect will run once initially

Besides regural writable and computed signals, there’s also a concept of watchers (effects). In contrast to the pull based evalulation of computed signals, changing a producer signal will immediately notify a wacher, synchronously calling watcher’s notification callback, effectively “pushing” the notification. Frameworks wrap watchers into effects that are exposed to users. Effects delay notification of user code through scheduling.
*Watchers are notified synchronously*

# Event binding
Angular wraps every event listener using `wrapListener()`. This method is responsible for calling `markViewDirty` when an event is fired.
This particular method `markViewDirty`, is also the one called by `markForCheck`.
So this means, _every event within the inner-zone is expected to trigger CD on parent components (marked as dirty + tick() triggered)._

# Using Signal in the template
- When a signal read in the template gets new value, it marks the reactive consumer as dirty.
- It's important to emphasize this distinction - the reactive consumer attached to the component view is marked as dirty, not the component view itself (i.e., not the node in the component tree). Otherwise, it would be the same process as the regular OnPush strategy.
- Mark all parent components as HAS_CHILD_VIEW_REFRESHED
- Before v17, marking the reactive consumer as dirty would also mark the component view as dirty, resulting in behavior similar to the `AsyncPipe`. However, as we just discovered, it works exactly like the `AsyncPipe`, so there doesn't seem to be much benefit here.
- But what does marking the reactive consumer as dirty mean for our application? Well, this depends on which version of Angular you’re using. Before v17, marking the reactive consumer as dirty would also mark the component view as dirty, resulting in behavior similar to the AsyncPipe.
- Things change drastically with Angular 17 or newer. In these versions, marking the reactive consumer as dirty no longer marks the entire component as dirty. Instead, a new function called markAncestorsForTraversal is triggered. This function travels from the component up through its ancestors to the root component (as markViewDirty did), but instead of marking them as dirty, it leaves the current component as is (since the reactive consumer is already marked as dirty). Its ancestors, however, receive a new HasChildViewsToRefresh flag. It looks like this:
[Mark traversal](https://wp.angular.love/wp-content/uploads/2024/10/mark-traversal.gif)
The change detection traversal mechanism has also been updated. Now, when the process starts with the tree in this state, it passes through components A and E without performing change detection on them. This is because they are OnPush but not dirty. Thanks to the new HasChildViewsToRefresh flag, Angular continues visiting nodes marked with this flag and searching for the component requiring change detection (in our example it’s the one with a reactive consumer marked as dirty). When it reaches component F, it finds that its reactive consumer is dirty, so this component gets change detected – and it’s the only one!
[one-node](https://wp.angular.love/wp-content/uploads/2024/10/one-node.gif)
Pretty cool, right? We’ve gone from change detecting the entire path of components to just one component. While this is a simplified example of a component tree, the performance gains in real applications are much more substantial.
This new approach to change detection, where only one component is change detected thanks to signals, is often called “semi-local” or “global-local/glocal” change detection.
However, there are some caveats to consider. Let’s examine this example, where a user click triggers a signal change:
[caveate1](https://wp.angular.love/wp-content/uploads/2024/10/caveat1.gif)
After the button is clicked, we notice that instead of the scenario described earlier, our component and all of its ancestors are marked as dirty, resulting in all of them being change detected. Why does this happen? It’s because the old change detection rules are still in effect. Do you remember the triggers for marking a component as dirty? One of them is `template-bound events`, and that’s precisely what’s occurring here. If you debug such an example, you will see that while `markAncestorsForTraversal` is called, so is `markViewDirty`.
This leads us to the conclusion that the source of the signal value change matters. If it originates from something that marks the component as dirty, there is no advantage over the standard OnPush strategy used, for example, with the async pipe. To benefit from semi-local change detection, the trigger needs to come from an action that does not mark the component as dirty but still schedules change detection for us. Examples include:
- setInterval, setTimeout
- Observable.subscribe, toSignal(Observable), e.g., HttpClient call
- RxJS fromEvent, Renderer2.listen

- Before we used the async pipe, so it would call the markForCheck method, and with signals, we just have to normally call them. Angular now will register an effect (consumer) that will listen to this signal and mark the template for check every time the signal changes.
When the template effect runs, Angular will run a function called markViewForRefresh which sets the current component flag to RefreshView and then calls markAncestorsForTraversal which will mark all the ancestors with HAS_CHILD_VIEWS_TO_REFRESH.

💡 Angular Signal Changes => Template effect runs => markViewForRefresh =>markAncestorForTraversal
```typescript
/**
 * Adds the `RefreshView` flag from the lView and updates HAS_CHILD_VIEWS_TO_REFRESH flag of
 * parents.
 */
export function markViewForRefresh(lView: LView) {
  if (lView[FLAGS] & LViewFlags.RefreshView) {
    return;
  }
  lView[FLAGS] |= LViewFlags.RefreshView;
  if (viewAttachedToChangeDetector(lView)) {
    markAncestorsForTraversal(lView);
  }
}
```

# Local change detection
One significant new capability that signal-based components will have is local change detection. Unlike zone.js, signals give fine-grained information about which parts of the model have changed, signal-based components do not participate in the global change detection. Instead, Angular understands which signals are used in different parts of the component's template, and only synchronizes that component with the DOM when a signal changes.

This is the golden rule of signal components: change detection for a component will be scheduled when and only when a signal read in the template notifies Angular that it has changed.

In fact, in our current design this change detection will happen independently for each view within a component.

# Targeted mode rules
NgZone triggers change detection in `GlobalMode` (it will go top-down checking & refreshing all components)
In GlobalMode we check **CheckAlways** and **Dirty OnPush** components

What will trigger `TargetedMode`?
When in `GlobalMode` we encounter a **Non-Dirty OnPush** component with _HAS_CHILD_VIEWS_TO_REFRESH_, we switch to `TargetedMode`!

In TargetedMode:
- **Only refresh a view if it has the RefreshView flag set**
- **DO NOT Refresh CheckAlways or regular Dirty flag views**
- If we reach a view with RefreshView flag, traverse children in GlobalMode

# Why do we need to get rid of Zone.Js
Avoiding unnecessary change detection cycles: Zone.js assists Angular’s change detection by notifying it when operations finish, but it doesn’t actually know whether these operations change any data. Because of this, the framework tends to overreact by scheduling a run “just in case.”

# Alternative of Zone.Js
So, what is the alternative to Zone.js in Angular? Well, since we already know it’s the scheduler’s job to trigger change detection, it’s no surprise that we got a new one.

## Zone Scheduler (Synchronization instead Change Detection)
The new Zoneless scheduler, introduced in version 17.1, moves away from relying on Zone.js events and waits for explicit notifications of changes from other parts of the framework. This shift is significant. Rather than triggering change detection “when some operation just happened, and something might have changed”, the framework now triggers it “when it receives a notification that the data has changed”.

⚠️ Video from Alex mentioned about Sychronization
**The assumption here is that most events cause application state change that needs to be reflected in the DOM and correspondingly on the screen.**

You might wonder if change detection could run too frequently, such as when several signals change values or events occur quickly. Fortunately, the scheduler’s implementation is designed to handle this efficiently. It collects notifications over a short period and schedules a single change detection run instead of triggering it multiple times. This behavior is based on a race condition between `setTimeout` and `requestAnimationFrame`, but we won’t dive into those details here. The key takeaway is that these notify calls are coalesced, ensuring optimal performance.

[Zoneless](https://wp.angular.love/wp-content/uploads/2024/10/zoneless.gif)

Of course, this represents the best-case scenario, where a signal value change marks only a single component for change detection and triggers the change detection run. This means we’re running change detection only where it’s necessary and exactly when it’s needed.
An important insight is that you don’t have to use signals to switch to a Zoneless approach. The new scheduler can respond to various types of notifications beyond signals (as mentioned earlier), allowing OnPush-rich applications to benefit from this capability as well.

## Zonefull/hybrid scheduler
Before Angular 18, if a signal value changed outside of the zone, change detection would not be scheduled – only operations performed within the zone would guarantee that change detection would be scheduled. For example, consider the following code, which would not result in a view refresh:
```typescript
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
With the enriched hybrid scheduler, we can still achieve a view refresh in the same scenario. This is because the change in the signal value invokes the notify method, and it no longer matters whether we are inside or outside of the zone.

- You don't need signals to go Zoneless!
	- `OnPush` + `async pipe` (or markForChecked) should work!
	
- From v18
```typescript
export function markForCheck(...) {
	lView[ENVIRONMENT].changeDetectionScheduler?.notify();
	...
}
```

## Two phases of Angular application
- Angular separates the change detection process into two distinct phases:
  - 1. Phase 1: Model Update (Developer's)
  - 2. Phase 2: View Update (Angular's responsibility)

## ng-docheck
# KeyValueDiffers

# Snippet
```typescript
@Component({})
export class TestComponent {
  @Input() user;
  previousName = '';

  constructor(private cd: ChangeDetectorRef) {}

  ngDoCheck() {
    if (this.previousName !== this.user.name) {
      this.previousName = this.user.name;
      this.cd.markForCheck();
    }
  }
}
```

# ngDoCheck
This lifecyle hook is run when it checks the component, but it doesn't necessarily reflect the latest changes. Let's say that there is a component that runs Change Detection, but its children shouldn't be, then it will still execute the ngDoCheck() life cycle hook for those children, but it will not run Change Detection.

The ngDoCheck() lifecycle hook will be called for all the direct children of a component where Change Detection is being executed on.

Angular uses Zone.js and patches all kinds of async APIs `addEventListener`, `setTimeout`,... Every time an event handler or some other async code is completed or when change detection is invoked explicitly by some code, Angular runs change detection. This is when `ngDoCheck` is called. Angular invokes `ngDoCheck` hook during ***every change detection cycle*.

ngDoCheck: this function will get called every single time an event has fired in the app that may cause a change, but not necessarily is considered a change.

Angular invokes `ngDoCheck` lifecycle hook after `ngOnChanges` & `ngOnInit` hooks.

When a parent component runs the change detection, *during the same cycle*, Angular traverses to child components to run their check hooks.

💡⚠️ Example the case that ngDoCheck is triggered for every keystroke or focus event on input

# ngDoCheck vs. ngOnChanges
In Angular, we can perform chagne detection using two different lifecyle hooks: the `ngOnChanges lifecycle hook` and `ngDoCheck lifecycle hook`
But in some cases, the `ngOnChanges` is not enough to detect all changes because it uses the property reference to check the difference, so it can't detect the changes if you update the object property.
Meanwhile, the `ngDoCheck` lifecyle hook allows us to perform our custom change detection so we can bypass the `ngOnChanges lifecycle hook` limitations.

`ngOnChanges` is only called when change detection detects a change that requires an input to be updates. 

ngDocheck called every time when there is change detection cycle runs while ngOnChange only fire when there is a change in bound model property in component

# OnPush Change Detection and ngDoCheck
❓ I have used `OnPush` strategy for my component and no bindings have changed, but the `ngDoCheck` lifecycle hook is triggered. Is the strategy not working?

When using `OnPush` change detection strategy:
```typescript
@Component({
  selector: 'my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```
`ngDoCheck` still runs, but less frequently - only when:
- Input references change
- An event originated from the component or its children
- Explicit change detection is triggered (e.g., with `ChangeDetectorRef.markForCheck()`)

You probably already know that ngDoCheck being called on a component doesn’t mean that the component itself is undergoing a change detection cycle - it means its parent is. When Angular runs change detection on a parent, ngDoCheck is called on its child components, but that doesn’t mean the child’s bindings are being reevaluated. Instead, this hook allows you to run custom logic and, if necessary, let Angular know that the child should be change detected as well.
This article by Max explains exactly this topic: 
https://angular.love/if-you-think-ngdocheck-means-your-component-is-being-checked-read-this-article

### Visualize
What is interesting is that the hooks for the child component are triggered when the parent component is being checked. You can see that `ngDoCheck` is called on the child component *when the parent component is being checked*.
```typescript
Checking A component:
  - update B input bindings
  - call NgDoCheck on the B component
  - update DOM interpolations for component A
  
 if (bindings changed) -> checking B component:
    - update C input bindings
    - call NgDoCheck on the C component
    - update DOM interpolations for component B
 
   Checking C component:
      - update DOM interpolations for component C
```
So with the introduction of the `OnPush` strategy we see the small condition `if (bindings changed) -> checking B component` is added before `B` component is checked. If this condition doesn't hold, you can see that Angular won't execute the operations under `checkig B component`. However, the `NgDoCheck` on the `B` component is still triggered even though the `B` component wil not be checked. It's important to understand that the hook is triggered only for the top level `B` component with `OnPush` strategy, and not triggered for its children - `C` component in our case.
❓ The design decision to run NgDoCheck hook even if a component is OnPush often causes confusion. But that’s intentional and there's no inconsistency if you know that it's run as part of the parent component check. Keep in mind that ngDoCheck is triggered only for top-most child component. If the component has children, and Angular doesn't check this component, ngDoCheck is not triggered for them.

# Why do we need ngDoCheck?
Granular control is necessary
Unlike `ngOnChanges`, which tracks changes to input properties using a simple object reference comparison, `ngDoCheck` gives you the flexibility to define your own rules for detecting changes.

You probably know that Angular tracks binding inputs by object reference. It means that if an object reference hasn't changed, the binding change is not detected and change detection is not executed for a component that uses `OnPush` strategy.
So if we want to track an object or an object or an array mutations we need to manually do that. And if discover the change we need to let Angular know so that it will run change detection for a component even though the object refrence hasn't changed.

The `NgDoCheck` hook is very good candidate. It's executed before Angular will run change detection for the component but during the check of the parent component. This where we'll put the logic to compare values and manually mark component as diry when detecting the change.

1. Deep Object Comparisons: When tracking changes in nested or deeply structured objects.
2. Non-Input Properties: When monitoring internal states or properties not bound by @Input.
3. Complex Change Scenarios: For scenarios where Angular’s default change detection fails or isn’t sufficient.

## Angular Output
# Subscribe issue
```ts
@Component({
  selector: 'app-child',
  template: `<h1>Child component render</h1>`,
  standalone: true,
})
export class ChildComponent implements OnInit {
  @Output() nameChanged = new EventEmitter<Hero>();

  constructor() {
    console.log('[ChildComponent] constructor');
    this.nameChanged.emit({ name: 'Superman Updated' });
  }

  ngOnInit(): void {
    console.log('[ChildComponent] ngOnInit');
  }
}

@Component({
  selector: 'app-root',
  template: `
    {{ render() }}
    <h1>{{ hero.name }}</h1>
    <app-child (nameChanged)="handleNameChange($event)" />
  `,
  imports: [ChildComponent],
})
export class AppComponent implements OnInit {
  hero = { name: 'Superman' };

  constructor() {
    console.log('[AppComponent] constructor');
  }

  ngOnInit(): void {
    console.log('[AppComponent] ngOnInit');
  }

  render() {
    console.log('[AppComponent] render');
  }

  handleNameChange(event: Hero) {
    this.hero = event;
  }
}
```
With the above implementation, we will encounter an issue that the `handleNameChange` will no triggered properly, because the statement `this.nameChanged.emit({ name: 'Superman Updated' })` was executed because `AppComponent` template render. The subscribe for `nameChanged` is only established when the AppComponent template is render. And it will be handle by
```ts
ɵɵlistener('nameChanged', function($event) {
    return ctx.handleNameChange($event);
  });
```


### 1. Compilation Phase: Template Analysis
```typescript
// Template
<app-counter (countChanged)="handleCountChanged($event)"></app-counter>

 function AppCounterComponentTemplate(rf, ctx) {
   if (rf & 1) { // RenderFlags.Create
    ɵɵelementStart(0, 'app-counter');
    ɵɵlistener('countChanged', function($event) {
      return ctx.handleCountChanged($event);
    });
    ɵɵelementEnd(); 
   }
 }
```

### 2. Component Creation: Setting up the Infrastructure
When ɵɵelementStart creates the child component, Angular:
1. Creates the component instance
2. Analyzes the component's metadata for @Output() properties
3. Stores output configuration in the TNode (Template Node)

```typescript
// Child component
@Component({...})
export class CounterComponent {
  @Output() countChanged = new EventEmitter<number>();
}

// Angular stores this metada:
tNode.outputs = {
  'countChanged': [directiveIndex] // Maps event name to directive index
}
```

### 3. ɵɵlistener: The Event Subscription Setup
Let's break down what happens inside ɵɵlistener:
```typescript
export function ɵɵlistener(eventName: string, listenerFn: EventCallback) {
  const lView = getLView();    // Current view
  const tView = getTView();    // Template view
  const tNode = getCurrentTNode(); // Current template node
  
  listenerInternal(tView, lView, renderer, tNode, eventName, listenerFn);
}
```

### 4. listnerInternal: The Core Logic
This function handles both DOM events and component outputs:
```typescript
export function listenerInternal(
  tView: TView,
  lView: LView,
  renderer: Renderer,
  tNode: TNode,
  eventName: string,
  listenerFn: EventCallback
) {
  let processOutputs = true;
  
  // Step 1: Handle DOM events (if applicable)
  if (tNode.type & TNodeType.AnyRNode) {
    // This would handle native DOM events like 'click', 'input', etc.
    // For component outputs, this usually doesn't apply
  }
  
  // Step 2: Handle @Output events
  if (processOutputs) {
    const outputConfig = tNode.outputs?.[eventName]; // ['countChanged']
    
    if (outputConfig && outputConfig.length) {
      for (const directiveIndex of outputConfig) {
        const wrappedListener = wrapListener(tNode, lView, listenerFn);
        listenToOutput(tNode, lView, directiveIndex, eventName, eventName, wrappedListener);
      }
    }
  }
}
```

### listenToOutput: The Actual Subscription
This is where the magic happens - Angular subscribes to the EventEmitter:
```typescript
export function listenToOutput(
  tNode: TNode,
  lView: LView,
  directiveIndex: number,
  lookupName: string,
  eventName: string,
  listenerFn: WrappedEventCallback
) {
  // Get the component instance
  const instance = lView[directiveIndex]; // CounterComponent instance
  
  // Get the component definition
  const tView = lView[TVIEW];
  const def = tView.data[directiveIndex] as DirectiveDef<unknown>;
  
  // Find the actual property name for the output
  const propertyName = def.outputs[lookupName]; // 'countChanged'
  
  // Get the EventEmitter from the component instance
  const output = instance[propertyName]; // instance.countChanged (EventEmitter)
  
  // Subscribe to the EventEmitter!
  const subscription = output.subscribe(listenerFn);
  
  // Store subscription for cleanup later
  storeListenerCleanup(tNode.index, tView, lView, eventName, listenerFn, subscription, true);
}
```

### wrapListener: Adding Angular's Magic
The wrapListener function wraps your event handler with Angular's change detection logic:
```typescript
export function wrapListener(
  tNode: TNode,
  lView: LView,
  listenerFn: EventCallback
): WrappedEventCallback {
  return function wrapListenerIn_markDirtyAndPreventDefault(event: any) {
    // Mark the view as dirty for change detection
    const startView = isComponentHost(tNode) 
      ? getComponentLViewByIndex(tNode.index, lView) 
      : lView;
    markViewDirty(startView, NotificationSource.Listener);
    
    // Execute your actual event handler
    const context = lView[CONTEXT]; // Parent component instance
    let result = executeListenerWithErrorHandling(lView, context, listenerFn, event);
    
    return result;
  };
}
```

# Complete Example Flow
Let's trace through a complete example:
### Intial Setup
```typescript
// Child Component
@Component({
  selector: 'app-counter',
  template: `<button (click)="increment()">+1</button>`
})
export class CounterComponent {
  @Output() countChanged = new EventEmitter<number>();
  count = 0;
  
  increment() {
    this.count++;
    this.countChanged.emit(this.count); // ← This triggers the flow
  }
}

// Parent Component
@Component({
  template: `<app-counter (countChanged)="handleCountChanged($event)"></app-counter>`
})
export class AppComponent {
  handleCountChanged(value: number) {
    console.log('Count changed to:', value);
  }
}
```

### Runtime Execution
#### 1. Component Creation (rf & 1)
```typescript
// Angular creates CounterComponent
const counterInstance = new CounterComponent();

// Angular calls ɵɵlistener
ɵɵlistener('countChanged', function($event) {
  return ctx.handleCountChanged($event);
});

// Inside listenToOutput:
const eventEmitter = counterInstance.countChanged; // EventEmitter instance
const subscription = eventEmitter.subscribe(wrappedListener);
```
#### 2. User Clicks Button:
```typescript
// User clicks, increment() is called
increment() {
  this.count++; // count = 1
  this.countChanged.emit(this.count) // EventEmitter.emit(1)
}
```

#### 3. EventEmitter Fires:
```typescript
// Inside EventEmitter.emit():
this._observers.forEach(observer => {
  observer.next(value); // Calls our wrapped listener
});
```

#### 4. Wrapped Listener Executes:
```typescript
function wrapListenerIn_markDirtyAndPreventDefault(event) {
  // Mark parent view dirty
  markViewDirty(parentView, NotificationSource.Listener);
  
  // Execute parent's handler
  return parentComponent.handleCountChanged(event); // handleCountChanged(1)
}
```

#### 5. Change Detection Runs:
Angular automatically runs change detection after the listener
Updates all property bindings in parent and child components

# Key Insights
1. EventEmitter is Just RxJS Subject
```typescript
@Injectable()
export class EventEmitter<T> extends Subject<T> {
  emit(value?: T): void {
    super.next(value);
  }
}
```

2. Subscription Management
Angular automatically:
- Creates subscriptons during component ceation
- Stores them for cleanup
- Unsubscribes when component is destroyed

3. Change Detection Integration
The `wrapListener` function ensures that:
- Parent view is marked dirty
- Change detection runs after the event handler
- Proper error handling is in place

4. Performance Optimization
- Creating subscriptions only once during component creation
- Reusing wrapped listner functions

# Subscribe issue
```ts
@Component({
  selector: 'app-child',
  template: `<h1>Child component render</h1>`,
  standalone: true,
})
export class ChildComponent implements OnInit {
  @Output() nameChanged = new EventEmitter<Hero>();

  constructor() {
    console.log('[ChildComponent] constructor');
    this.nameChanged.emit({ name: 'Superman Updated' });
  }

  ngOnInit(): void {
    console.log('[ChildComponent] ngOnInit');
  }
}

@Component({
  selector: 'app-root',
  template: `
    {{ render() }}
    <h1>{{ hero.name }}</h1>
    <app-child (nameChanged)="handleNameChange($event)" />
  `,
  imports: [ChildComponent],
})
export class AppComponent implements OnInit {
  hero = { name: 'Superman' };

  constructor() {
    console.log('[AppComponent] constructor');
  }

  ngOnInit(): void {
    console.log('[AppComponent] ngOnInit');
  }

  render() {
    console.log('[AppComponent] render');
  }

  handleNameChange(event: Hero) {
    this.hero = event;
  }
}
```
With the above implementation, we will encounter an issue that the `handleNameChange` will no triggered properly, because the statement `this.nameChanged.emit({ name: 'Superman Updated' })` was executed because `AppComponent` template render. The subscribe for `nameChanged` is only established when the AppComponent template is render. And it will be handle by
```ts
ɵɵlistener('nameChanged', function($event) {
    return ctx.handleNameChange($event);
  });
```


### 1. Compilation Phase: Template Analysis
```typescript
// Template
<app-counter (countChanged)="handleCountChanged($event)"></app-counter>

 function AppCounterComponentTemplate(rf, ctx) {
   if (rf & 1) { // RenderFlags.Create
    ɵɵelementStart(0, 'app-counter');
    ɵɵlistener('countChanged', function($event) {
      return ctx.handleCountChanged($event);
    });
    ɵɵelementEnd(); 
   }
 }
```

### 2. Component Creation: Setting up the Infrastructure
When ɵɵelementStart creates the child component, Angular:
1. Creates the component instance
2. Analyzes the component's metadata for @Output() properties
3. Stores output configuration in the TNode (Template Node)

```typescript
// Child component
@Component({...})
export class CounterComponent {
  @Output() countChanged = new EventEmitter<number>();
}

// Angular stores this metada:
tNode.outputs = {
  'countChanged': [directiveIndex] // Maps event name to directive index
}
```

### 3. ɵɵlistener: The Event Subscription Setup
Let's break down what happens inside ɵɵlistener:
```typescript
export function ɵɵlistener(eventName: string, listenerFn: EventCallback) {
  const lView = getLView();    // Current view
  const tView = getTView();    // Template view
  const tNode = getCurrentTNode(); // Current template node
  
  listenerInternal(tView, lView, renderer, tNode, eventName, listenerFn);
}
```

### 4. listnerInternal: The Core Logic
This function handles both DOM events and component outputs:
```typescript
export function listenerInternal(
  tView: TView,
  lView: LView,
  renderer: Renderer,
  tNode: TNode,
  eventName: string,
  listenerFn: EventCallback
) {
  let processOutputs = true;
  
  // Step 1: Handle DOM events (if applicable)
  if (tNode.type & TNodeType.AnyRNode) {
    // This would handle native DOM events like 'click', 'input', etc.
    // For component outputs, this usually doesn't apply
  }
  
  // Step 2: Handle @Output events
  if (processOutputs) {
    const outputConfig = tNode.outputs?.[eventName]; // ['countChanged']
    
    if (outputConfig && outputConfig.length) {
      for (const directiveIndex of outputConfig) {
        const wrappedListener = wrapListener(tNode, lView, listenerFn);
        listenToOutput(tNode, lView, directiveIndex, eventName, eventName, wrappedListener);
      }
    }
  }
}
```

### listenToOutput: The Actual Subscription
This is where the magic happens - Angular subscribes to the EventEmitter:
```typescript
export function listenToOutput(
  tNode: TNode,
  lView: LView,
  directiveIndex: number,
  lookupName: string,
  eventName: string,
  listenerFn: WrappedEventCallback
) {
  // Get the component instance
  const instance = lView[directiveIndex]; // CounterComponent instance
  
  // Get the component definition
  const tView = lView[TVIEW];
  const def = tView.data[directiveIndex] as DirectiveDef<unknown>;
  
  // Find the actual property name for the output
  const propertyName = def.outputs[lookupName]; // 'countChanged'
  
  // Get the EventEmitter from the component instance
  const output = instance[propertyName]; // instance.countChanged (EventEmitter)
  
  // Subscribe to the EventEmitter!
  const subscription = output.subscribe(listenerFn);
  
  // Store subscription for cleanup later
  storeListenerCleanup(tNode.index, tView, lView, eventName, listenerFn, subscription, true);
}
```

### wrapListener: Adding Angular's Magic
The wrapListener function wraps your event handler with Angular's change detection logic:
```typescript
export function wrapListener(
  tNode: TNode,
  lView: LView,
  listenerFn: EventCallback
): WrappedEventCallback {
  return function wrapListenerIn_markDirtyAndPreventDefault(event: any) {
    // Mark the view as dirty for change detection
    const startView = isComponentHost(tNode) 
      ? getComponentLViewByIndex(tNode.index, lView) 
      : lView;
    markViewDirty(startView, NotificationSource.Listener);
    
    // Execute your actual event handler
    const context = lView[CONTEXT]; // Parent component instance
    let result = executeListenerWithErrorHandling(lView, context, listenerFn, event);
    
    return result;
  };
}
```

# Complete Example Flow
Let's trace through a complete example:
### Intial Setup
```typescript
// Child Component
@Component({
  selector: 'app-counter',
  template: `<button (click)="increment()">+1</button>`
})
export class CounterComponent {
  @Output() countChanged = new EventEmitter<number>();
  count = 0;
  
  increment() {
    this.count++;
    this.countChanged.emit(this.count); // ← This triggers the flow
  }
}

// Parent Component
@Component({
  template: `<app-counter (countChanged)="handleCountChanged($event)"></app-counter>`
})
export class AppComponent {
  handleCountChanged(value: number) {
    console.log('Count changed to:', value);
  }
}
```

### Runtime Execution
#### 1. Component Creation (rf & 1)
```typescript
// Angular creates CounterComponent
const counterInstance = new CounterComponent();

// Angular calls ɵɵlistener
ɵɵlistener('countChanged', function($event) {
  return ctx.handleCountChanged($event);
});

// Inside listenToOutput:
const eventEmitter = counterInstance.countChanged; // EventEmitter instance
const subscription = eventEmitter.subscribe(wrappedListener);
```
#### 2. User Clicks Button:
```typescript
// User clicks, increment() is called
increment() {
  this.count++; // count = 1
  this.countChanged.emit(this.count) // EventEmitter.emit(1)
}
```

#### 3. EventEmitter Fires:
```typescript
// Inside EventEmitter.emit():
this._observers.forEach(observer => {
  observer.next(value); // Calls our wrapped listener
});
```

#### 4. Wrapped Listener Executes:
```typescript
function wrapListenerIn_markDirtyAndPreventDefault(event) {
  // Mark parent view dirty
  markViewDirty(parentView, NotificationSource.Listener);
  
  // Execute parent's handler
  return parentComponent.handleCountChanged(event); // handleCountChanged(1)
}
```

#### 5. Change Detection Runs:
Angular automatically runs change detection after the listener
Updates all property bindings in parent and child components

# Key Insights
1. EventEmitter is Just RxJS Subject
```typescript
@Injectable()
export class EventEmitter<T> extends Subject<T> {
  emit(value?: T): void {
    super.next(value);
  }
}
```

2. Subscription Management
Angular automatically:
- Creates subscriptons during component ceation
- Stores them for cleanup
- Unsubscribes when component is destroyed

3. Change Detection Integration
The `wrapListener` function ensures that:
- Parent view is marked dirty
- Change detection runs after the event handler
- Proper error handling is in place

4. Performance Optimization
- Creating subscriptions only once during component creation
- Reusing wrapped listner functions


# Expression changed after it has been checked error
# Subscribe issue
```ts
@Component({
  selector: 'app-child',
  template: `<h1>Child component render</h1>`,
  standalone: true,
})
export class ChildComponent implements OnInit {
  @Output() nameChanged = new EventEmitter<Hero>();

  constructor() {
    console.log('[ChildComponent] constructor');
    this.nameChanged.emit({ name: 'Superman Updated' });
  }

  ngOnInit(): void {
    console.log('[ChildComponent] ngOnInit');
  }
}

@Component({
  selector: 'app-root',
  template: `
    {{ render() }}
    <h1>{{ hero.name }}</h1>
    <app-child (nameChanged)="handleNameChange($event)" />
  `,
  imports: [ChildComponent],
})
export class AppComponent implements OnInit {
  hero = { name: 'Superman' };

  constructor() {
    console.log('[AppComponent] constructor');
  }

  ngOnInit(): void {
    console.log('[AppComponent] ngOnInit');
  }

  render() {
    console.log('[AppComponent] render');
  }

  handleNameChange(event: Hero) {
    this.hero = event;
  }
}
```
With the above implementation, we will encounter an issue that the `handleNameChange` will no triggered properly, because the statement `this.nameChanged.emit({ name: 'Superman Updated' })` was executed because `AppComponent` template render. The subscribe for `nameChanged` is only established when the AppComponent template is render. And it will be handle by
```ts
ɵɵlistener('nameChanged', function($event) {
    return ctx.handleNameChange($event);
  });
```


### 1. Compilation Phase: Template Analysis
```typescript
// Template
<app-counter (countChanged)="handleCountChanged($event)"></app-counter>

 function AppCounterComponentTemplate(rf, ctx) {
   if (rf & 1) { // RenderFlags.Create
    ɵɵelementStart(0, 'app-counter');
    ɵɵlistener('countChanged', function($event) {
      return ctx.handleCountChanged($event);
    });
    ɵɵelementEnd(); 
   }
 }
```

### 2. Component Creation: Setting up the Infrastructure
When ɵɵelementStart creates the child component, Angular:
1. Creates the component instance
2. Analyzes the component's metadata for @Output() properties
3. Stores output configuration in the TNode (Template Node)

```typescript
// Child component
@Component({...})
export class CounterComponent {
  @Output() countChanged = new EventEmitter<number>();
}

// Angular stores this metada:
tNode.outputs = {
  'countChanged': [directiveIndex] // Maps event name to directive index
}
```

### 3. ɵɵlistener: The Event Subscription Setup
Let's break down what happens inside ɵɵlistener:
```typescript
export function ɵɵlistener(eventName: string, listenerFn: EventCallback) {
  const lView = getLView();    // Current view
  const tView = getTView();    // Template view
  const tNode = getCurrentTNode(); // Current template node
  
  listenerInternal(tView, lView, renderer, tNode, eventName, listenerFn);
}
```

### 4. listnerInternal: The Core Logic
This function handles both DOM events and component outputs:
```typescript
export function listenerInternal(
  tView: TView,
  lView: LView,
  renderer: Renderer,
  tNode: TNode,
  eventName: string,
  listenerFn: EventCallback
) {
  let processOutputs = true;
  
  // Step 1: Handle DOM events (if applicable)
  if (tNode.type & TNodeType.AnyRNode) {
    // This would handle native DOM events like 'click', 'input', etc.
    // For component outputs, this usually doesn't apply
  }
  
  // Step 2: Handle @Output events
  if (processOutputs) {
    const outputConfig = tNode.outputs?.[eventName]; // ['countChanged']
    
    if (outputConfig && outputConfig.length) {
      for (const directiveIndex of outputConfig) {
        const wrappedListener = wrapListener(tNode, lView, listenerFn);
        listenToOutput(tNode, lView, directiveIndex, eventName, eventName, wrappedListener);
      }
    }
  }
}
```

### listenToOutput: The Actual Subscription
This is where the magic happens - Angular subscribes to the EventEmitter:
```typescript
export function listenToOutput(
  tNode: TNode,
  lView: LView,
  directiveIndex: number,
  lookupName: string,
  eventName: string,
  listenerFn: WrappedEventCallback
) {
  // Get the component instance
  const instance = lView[directiveIndex]; // CounterComponent instance
  
  // Get the component definition
  const tView = lView[TVIEW];
  const def = tView.data[directiveIndex] as DirectiveDef<unknown>;
  
  // Find the actual property name for the output
  const propertyName = def.outputs[lookupName]; // 'countChanged'
  
  // Get the EventEmitter from the component instance
  const output = instance[propertyName]; // instance.countChanged (EventEmitter)
  
  // Subscribe to the EventEmitter!
  const subscription = output.subscribe(listenerFn);
  
  // Store subscription for cleanup later
  storeListenerCleanup(tNode.index, tView, lView, eventName, listenerFn, subscription, true);
}
```

### wrapListener: Adding Angular's Magic
The wrapListener function wraps your event handler with Angular's change detection logic:
```typescript
export function wrapListener(
  tNode: TNode,
  lView: LView,
  listenerFn: EventCallback
): WrappedEventCallback {
  return function wrapListenerIn_markDirtyAndPreventDefault(event: any) {
    // Mark the view as dirty for change detection
    const startView = isComponentHost(tNode) 
      ? getComponentLViewByIndex(tNode.index, lView) 
      : lView;
    markViewDirty(startView, NotificationSource.Listener);
    
    // Execute your actual event handler
    const context = lView[CONTEXT]; // Parent component instance
    let result = executeListenerWithErrorHandling(lView, context, listenerFn, event);
    
    return result;
  };
}
```

# Complete Example Flow
Let's trace through a complete example:
### Intial Setup
```typescript
// Child Component
@Component({
  selector: 'app-counter',
  template: `<button (click)="increment()">+1</button>`
})
export class CounterComponent {
  @Output() countChanged = new EventEmitter<number>();
  count = 0;
  
  increment() {
    this.count++;
    this.countChanged.emit(this.count); // ← This triggers the flow
  }
}

// Parent Component
@Component({
  template: `<app-counter (countChanged)="handleCountChanged($event)"></app-counter>`
})
export class AppComponent {
  handleCountChanged(value: number) {
    console.log('Count changed to:', value);
  }
}
```

### Runtime Execution
#### 1. Component Creation (rf & 1)
```typescript
// Angular creates CounterComponent
const counterInstance = new CounterComponent();

// Angular calls ɵɵlistener
ɵɵlistener('countChanged', function($event) {
  return ctx.handleCountChanged($event);
});

// Inside listenToOutput:
const eventEmitter = counterInstance.countChanged; // EventEmitter instance
const subscription = eventEmitter.subscribe(wrappedListener);
```
#### 2. User Clicks Button:
```typescript
// User clicks, increment() is called
increment() {
  this.count++; // count = 1
  this.countChanged.emit(this.count) // EventEmitter.emit(1)
}
```

#### 3. EventEmitter Fires:
```typescript
// Inside EventEmitter.emit():
this._observers.forEach(observer => {
  observer.next(value); // Calls our wrapped listener
});
```

#### 4. Wrapped Listener Executes:
```typescript
function wrapListenerIn_markDirtyAndPreventDefault(event) {
  // Mark parent view dirty
  markViewDirty(parentView, NotificationSource.Listener);
  
  // Execute parent's handler
  return parentComponent.handleCountChanged(event); // handleCountChanged(1)
}
```

#### 5. Change Detection Runs:
Angular automatically runs change detection after the listener
Updates all property bindings in parent and child components

# Key Insights
1. EventEmitter is Just RxJS Subject
```typescript
@Injectable()
export class EventEmitter<T> extends Subject<T> {
  emit(value?: T): void {
    super.next(value);
  }
}
```

2. Subscription Management
Angular automatically:
- Creates subscriptons during component ceation
- Stores them for cleanup
- Unsubscribes when component is destroyed

3. Change Detection Integration
The `wrapListener` function ensures that:
- Parent view is marked dirty
- Change detection runs after the event handler
- Proper error handling is in place

4. Performance Optimization
- Creating subscriptions only once during component creation
- Reusing wrapped listner functions


# Change detection internal
# Subscribe issue
```ts
@Component({
  selector: 'app-child',
  template: `<h1>Child component render</h1>`,
  standalone: true,
})
export class ChildComponent implements OnInit {
  @Output() nameChanged = new EventEmitter<Hero>();

  constructor() {
    console.log('[ChildComponent] constructor');
    this.nameChanged.emit({ name: 'Superman Updated' });
  }

  ngOnInit(): void {
    console.log('[ChildComponent] ngOnInit');
  }
}

@Component({
  selector: 'app-root',
  template: `
    {{ render() }}
    <h1>{{ hero.name }}</h1>
    <app-child (nameChanged)="handleNameChange($event)" />
  `,
  imports: [ChildComponent],
})
export class AppComponent implements OnInit {
  hero = { name: 'Superman' };

  constructor() {
    console.log('[AppComponent] constructor');
  }

  ngOnInit(): void {
    console.log('[AppComponent] ngOnInit');
  }

  render() {
    console.log('[AppComponent] render');
  }

  handleNameChange(event: Hero) {
    this.hero = event;
  }
}
```
With the above implementation, we will encounter an issue that the `handleNameChange` will no triggered properly, because the statement `this.nameChanged.emit({ name: 'Superman Updated' })` was executed because `AppComponent` template render. The subscribe for `nameChanged` is only established when the AppComponent template is render. And it will be handle by
```ts
ɵɵlistener('nameChanged', function($event) {
    return ctx.handleNameChange($event);
  });
```


### 1. Compilation Phase: Template Analysis
```typescript
// Template
<app-counter (countChanged)="handleCountChanged($event)"></app-counter>

 function AppCounterComponentTemplate(rf, ctx) {
   if (rf & 1) { // RenderFlags.Create
    ɵɵelementStart(0, 'app-counter');
    ɵɵlistener('countChanged', function($event) {
      return ctx.handleCountChanged($event);
    });
    ɵɵelementEnd(); 
   }
 }
```

### 2. Component Creation: Setting up the Infrastructure
When ɵɵelementStart creates the child component, Angular:
1. Creates the component instance
2. Analyzes the component's metadata for @Output() properties
3. Stores output configuration in the TNode (Template Node)

```typescript
// Child component
@Component({...})
export class CounterComponent {
  @Output() countChanged = new EventEmitter<number>();
}

// Angular stores this metada:
tNode.outputs = {
  'countChanged': [directiveIndex] // Maps event name to directive index
}
```

### 3. ɵɵlistener: The Event Subscription Setup
Let's break down what happens inside ɵɵlistener:
```typescript
export function ɵɵlistener(eventName: string, listenerFn: EventCallback) {
  const lView = getLView();    // Current view
  const tView = getTView();    // Template view
  const tNode = getCurrentTNode(); // Current template node
  
  listenerInternal(tView, lView, renderer, tNode, eventName, listenerFn);
}
```

### 4. listnerInternal: The Core Logic
This function handles both DOM events and component outputs:
```typescript
export function listenerInternal(
  tView: TView,
  lView: LView,
  renderer: Renderer,
  tNode: TNode,
  eventName: string,
  listenerFn: EventCallback
) {
  let processOutputs = true;
  
  // Step 1: Handle DOM events (if applicable)
  if (tNode.type & TNodeType.AnyRNode) {
    // This would handle native DOM events like 'click', 'input', etc.
    // For component outputs, this usually doesn't apply
  }
  
  // Step 2: Handle @Output events
  if (processOutputs) {
    const outputConfig = tNode.outputs?.[eventName]; // ['countChanged']
    
    if (outputConfig && outputConfig.length) {
      for (const directiveIndex of outputConfig) {
        const wrappedListener = wrapListener(tNode, lView, listenerFn);
        listenToOutput(tNode, lView, directiveIndex, eventName, eventName, wrappedListener);
      }
    }
  }
}
```

### listenToOutput: The Actual Subscription
This is where the magic happens - Angular subscribes to the EventEmitter:
```typescript
export function listenToOutput(
  tNode: TNode,
  lView: LView,
  directiveIndex: number,
  lookupName: string,
  eventName: string,
  listenerFn: WrappedEventCallback
) {
  // Get the component instance
  const instance = lView[directiveIndex]; // CounterComponent instance
  
  // Get the component definition
  const tView = lView[TVIEW];
  const def = tView.data[directiveIndex] as DirectiveDef<unknown>;
  
  // Find the actual property name for the output
  const propertyName = def.outputs[lookupName]; // 'countChanged'
  
  // Get the EventEmitter from the component instance
  const output = instance[propertyName]; // instance.countChanged (EventEmitter)
  
  // Subscribe to the EventEmitter!
  const subscription = output.subscribe(listenerFn);
  
  // Store subscription for cleanup later
  storeListenerCleanup(tNode.index, tView, lView, eventName, listenerFn, subscription, true);
}
```

### wrapListener: Adding Angular's Magic
The wrapListener function wraps your event handler with Angular's change detection logic:
```typescript
export function wrapListener(
  tNode: TNode,
  lView: LView,
  listenerFn: EventCallback
): WrappedEventCallback {
  return function wrapListenerIn_markDirtyAndPreventDefault(event: any) {
    // Mark the view as dirty for change detection
    const startView = isComponentHost(tNode) 
      ? getComponentLViewByIndex(tNode.index, lView) 
      : lView;
    markViewDirty(startView, NotificationSource.Listener);
    
    // Execute your actual event handler
    const context = lView[CONTEXT]; // Parent component instance
    let result = executeListenerWithErrorHandling(lView, context, listenerFn, event);
    
    return result;
  };
}
```

# Complete Example Flow
Let's trace through a complete example:
### Intial Setup
```typescript
// Child Component
@Component({
  selector: 'app-counter',
  template: `<button (click)="increment()">+1</button>`
})
export class CounterComponent {
  @Output() countChanged = new EventEmitter<number>();
  count = 0;
  
  increment() {
    this.count++;
    this.countChanged.emit(this.count); // ← This triggers the flow
  }
}

// Parent Component
@Component({
  template: `<app-counter (countChanged)="handleCountChanged($event)"></app-counter>`
})
export class AppComponent {
  handleCountChanged(value: number) {
    console.log('Count changed to:', value);
  }
}
```

### Runtime Execution
#### 1. Component Creation (rf & 1)
```typescript
// Angular creates CounterComponent
const counterInstance = new CounterComponent();

// Angular calls ɵɵlistener
ɵɵlistener('countChanged', function($event) {
  return ctx.handleCountChanged($event);
});

// Inside listenToOutput:
const eventEmitter = counterInstance.countChanged; // EventEmitter instance
const subscription = eventEmitter.subscribe(wrappedListener);
```
#### 2. User Clicks Button:
```typescript
// User clicks, increment() is called
increment() {
  this.count++; // count = 1
  this.countChanged.emit(this.count) // EventEmitter.emit(1)
}
```

#### 3. EventEmitter Fires:
```typescript
// Inside EventEmitter.emit():
this._observers.forEach(observer => {
  observer.next(value); // Calls our wrapped listener
});
```

#### 4. Wrapped Listener Executes:
```typescript
function wrapListenerIn_markDirtyAndPreventDefault(event) {
  // Mark parent view dirty
  markViewDirty(parentView, NotificationSource.Listener);
  
  // Execute parent's handler
  return parentComponent.handleCountChanged(event); // handleCountChanged(1)
}
```

#### 5. Change Detection Runs:
Angular automatically runs change detection after the listener
Updates all property bindings in parent and child components

# Key Insights
1. EventEmitter is Just RxJS Subject
```typescript
@Injectable()
export class EventEmitter<T> extends Subject<T> {
  emit(value?: T): void {
    super.next(value);
  }
}
```

2. Subscription Management
Angular automatically:
- Creates subscriptons during component ceation
- Stores them for cleanup
- Unsubscribes when component is destroyed

3. Change Detection Integration
The `wrapListener` function ensures that:
- Parent view is marked dirty
- Change detection runs after the event handler
- Proper error handling is in place

4. Performance Optimization
- Creating subscriptions only once during component creation
- Reusing wrapped listner functions

# Angular template
# Understanding timings with `ViewChildren`
**ngDoCheck**: These checks trigger the lifecycle method DoCheck, which you can manually handle. The DoCheck lifecycle method will trigger every time Angular detects data changes, regardless of if the check of that data does not decide to update the item on-screen or not.

The templateFn (compiled template function) is invoked with RenderFlags.Update after ngOnInit().

```typescript
@Component({
	selector: "app-root",
	imports: [NgTemplateOutlet],
	template: `
		<ng-template #helloThereMsg>
			Hello There!
			<ng-template #testingMessage>Testing 123</ng-template>
		</ng-template>
		<ng-template [ngTemplateOutlet]="helloThereMsg"></ng-template>
		<ng-template [ngTemplateOutlet]="testingMessageCompVar"></ng-template>
	`
})
export class AppComponent {
	@ViewChild("testingMessage", { static: false }) testingMessageCompVar!: any;
}
```

The reason we're hitting the error is that the template is not defined in the component logic until `ngAfterViewInit`. It is not defined until them due to timing issues: *the template is being declared in an embedded view, which takes a portion of time to render to screen*. As a result, the hellThereMsg template must render first, then the ViewChild can get a reference to the child after the initial update.

*To fix the expression changed after it has been checked issue above, we can do it like this*
```ts
@Component({
	selector: "app-root",
	imports: [NgTemplateOutlet],
	template: `
        <ng-template #helloThereMsg>
			Hello There!
			<ng-template #testingMessage>Testing 123</ng-template>
		</ng-template>
		<ng-template [ngTemplateOutlet]="realMsgVar"></ng-template>
	`
})
export class AppComponent implement DoCheck {
	@ViewChild("testingMessage", { static: false }) testingMessageCompVar!: any;
    realMsgVar: any;

   ngDoCheck() {
     this.realMsgVar = this.testingMessageCompVar;
   }
}
```

**🔍 What Happens Under the Hood**
1. Angular compiles your component template into instructions
```html
<ng-template [ngTemplateOutlet]="testingMessageCompVar"></ng-template>
```
```ts
ɵɵproperty("ngTemplateOutlet", ctx.testingMessageCompVar);
```
And during change detection, this is evaluated via the `ɵɵproperty()` function. (triggering templateFn)
2. ɵɵproperty() invokes `bindingUpdated`
```ts
/**
 * Updates binding if changed, then returns whether it was updated.
 *
 * This function also checks the `CheckNoChangesMode` and throws if changes are made.
 * Some changes (Objects/iterables) during `CheckNoChangesMode` are exempt to comply with VE
 * behavior.
 *
 * @param lView current `LView`
 * @param bindingIndex The binding in the `LView` to check
 * @param value New value to check against `lView[bindingIndex]`
 * @returns `true` if the bindings has changed. (Throws if binding has changed during
 *          `CheckNoChangesMode`)
 */
export function bindingUpdated(lView: LView, bindingIndex: number, value: any): boolean {
  ngDevMode && assertNotSame(value, NO_CHANGE, 'Incoming value should never be NO_CHANGE.');
  ngDevMode &&
    assertLessThan(bindingIndex, lView.length, `Slot should have been initialized to NO_CHANGE`);
  const oldValue = lView[bindingIndex];

  if (Object.is(oldValue, value)) {
    return false;
  } else {
    if (ngDevMode && isInCheckNoChangesMode()) {
      // View engine didn't report undefined values as changed on the first checkNoChanges pass
      // (before the change detection was run).
      const oldValueToCompare = oldValue !== NO_CHANGE ? oldValue : undefined;
      if (!devModeEqual(oldValueToCompare, value)) {
        const details = getExpressionChangedErrorDetails(
          lView,
          bindingIndex,
          oldValueToCompare,
          value,
        );
        throwErrorIfNoChangesMode(
          oldValue === NO_CHANGE,
          details.oldValue,
          details.newValue,
          details.propName,
          lView,
        );
      }
      // There was a change, but the `devModeEqual` decided that the change is exempt from an error.
      // For this reason we exit as if no change. The early exit is needed to prevent the changed
      // value to be written into `LView` (If we would write the new value that we would not see it
      // as change on next CD.)
      return false;
    }
    lView[bindingIndex] = value;
    return true;
  }
}
```

**🧵 Detailed Execution Timeline**
🧱 Step 1: Component Creation
- Angular creates the component instance (new Component()).
- Dependency injection and constructor run.
- The compiled ɵɵdefineComponent() tells Angular what the templateFn looks like.

🧩 Step 2: Initial Render — RenderFlags.Create
Angular calls the templateFn with:
```ts
templateFn(RenderFlags.Create, ctx);
```
- This phrase sets up the template structure.
- Angular create `ng-template`s, elements, text nodes, and ViewChild anchors.
- `@ViewChild()` properties are not yet available.
- No lifecycle hooks run yet.

🚨 Step 3: Lifecycle — ngOnInit()
Once the component view and child views are created (including content projection and queries), Angular runs:
```ts
ctx.ngOnInit?.();
```
- At this point, the view is structurally ready.
- @Input() values are set.
- But DOM and bindings are not updated yet.

🔁 Step 4: First Binding Evaluation — RenderFlags.Update
Angular now calls:
```ts
templateFn(RenderFlags.Update, ctx);
```
- This is the first time bindings are evaluated and expressions are resolved.
- Angular evaluates things like:
```ts
ɵɵproperty('title', ctx.pageTitle);
```
- Results are stored in `LView` at a specific binding index.
- Angular renders text, attributes, and directives based on evaluated values.

🧪 Step 5: Check-No-Changes Phase (Dev Mode Only)
- Angular runs the same template function again with RenderFlags.Update.
- It uses bindingUpdated() to compare previous and current values in LView.
- If they changed, Angular throws ExpressionChangedAfterItHasBeenCheckedError.

# The Content Without the `ng`
ContentChild even works when you're not using ng-content but still passing components and elements as children to the component. So, for example, if you wanted to pass a template as a child but wanted to render it in a very specific way, you could do so:
```html
<!-- root-template.component.html -->
<render-template-with-name>
	<ng-template let-userName>
		<p>Hello there, {{userName}}</p>
	</ng-template>
</render-template-with-name>
```
```typescript
// render-template-with-name.component.ts
@Component({
	selector: 'render-template-with-name',
	imports: [NgTemplateOutlet],
	template: `
	<ng-template
		[ngTemplateOutlet]="contentChildTemplate"
		[ngTemplateOutletContext]="{$implicit: 'Name here'}">
	</ng-template>
`
})
export class AppComponent {
	@ContentChild(TemplateRef, {static: false}) contentChildTemplate;
}
```
This is a perfect example of where you might want @ContentChild — not only are you unable to use ng-content to render this template without a template reference being passed to an outlet, but you're able to create a context that can pass information to the template being passed as a child.

# View Hierarchy Tree
In the same way, the browser keeps track of what's rendered into the dom using the DOM tree, Angular has its own tree to keep track what's rendered on-screen.

While Angular renders to the DOM in the end (just as vanilla HTML would), Angular has the original information that described how to render things onto screen. When Angular detects changes to this tree, it will then update the DOM with the changes that Angular has tracked.

# View
A view is a grouping of elements and is the smallest grouping of elements that can be created or destroyed together. A view is defined by a template. This template on its own is not a view, but does define a view

Because of this, despite there being many templates — this code sample does not have any views in it, because they are not being created from any of the templates:
```html
<ng-template>I am a view that's defined by a template</ng-template>
<ng-template>
	<p>So am I! Just a different one. Everything in THIS template is in the same view</p>
	<div>Even with me in here? <span>Yup!</span></div>
</ng-template>
```
However, when you create a view from a template, you're able to display them on-screen. When a view is displayed on-screen, they're then called an embedded view. So, when we render a template using ngTemplateOutlet, we are creating a view from a template, then embedding the view in the view that you called the ngTemplateOutlet in.

As such, the following code example would create the view hierarchy in the chart below the code sample:
```html
<ng-template>
	<p>I am in a view right now</p>
	<ng-template #rememberMsg>
		But as you might recall, this is also a view
	</ng-template>
	<ng-template
		[ngTemplateOutlet]="rememberMsg"
		[ngTemplateOutletContext]="{$implicit: 'So when we render it, it\'s a view within a view'}"
	></ng-template>
</ng-template>
```

# View Container
A view container is just what it sounds like: It's a container for views. That is to say, whenever you see a view embedded, you can be sure it's a child of a view container. While our code might not make it apparent, when we're using ngTemplateOutlet, Angular creates a view container for us to place the view into. It will create the view container from a template, view, or even from an element.

# Host Views
Well, there's a good reason for that: A component is actually just a directive with a special view — a "host view" (defined by the template or templateUrl field in the decorator) associated with it.
A component is technically a directive. However, components are so distinctive and central to Angular applications that Angular defines the @Component() decorator, which extends the @Directive()decorator with template-oriented features.

# Change detection mental model
# Further research
❓ It’s super important to understand that Angular *update bindings during change detection*.
    Which code snippet handles for that.


💡 Angular is responsible for component dirty marking and detect changes when Zone.js tells "Hey Angular, something maybe change"
💡 An asynchronous task only triggers the Change Detection but does not mark the component as dirty.

❓ Why Angular always trigger change detection from top to bottom?
But, why does Angular check all the components 🤔? Why doesn’t it check only the dirty components 🤔?


Asynchronous task doesn't mark the component dirty while DOM event does

Angular change dection will be triggering based on two things:
- Handled DOM events
  - Apart from marking component dirty, the fired event also notified zone.js about the change.
  - After the event is handled, the change detection is triggered by the zone.js observable called "onMicrotaskEmpty"
  
- Asynchronous tasks

Issue with change detection
- Runs too often
- Location of Change is unknown

# Operation
```tex
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

# markForCheck
markForCheck() method is used in combination with OnPush change detection strategy to manually mark the current view and all of its successors as to be Checked Once so that they can be checked again during the current or next change detection cycle.
Using markForCheck() with ngDoCheck Lifecycle hook: Angular runs the ngDoCheck lifecycle method of the immediate child component whenever change detection runs for the parent component irrespective of the change detection strategy. 

# Triggering
- Triggering is one of the most important thing for change detection
- An angular.js library ứa always a wrapper that manually executed digest cycles for us so the framework would know when to re-render parts of the DOM of the application.

# Change Detection Responsibilities
- Update UI
- Propogate inputs
- Lifecycle of components/directives
- Run reactive effects
- Enforce template invariants

# Sychronization
### Goals
- batch rendering as much as possible
- consistent, responsive UI
-> new state is on-screen in the next paint

### What triggers synchronization?
- When we think something's changed
- When we know something's changed

### When do we need to sync?
- zone.js
  So in zone, we're monkey-patching browser APIs, so we know when application code runs and the assumption is when application code run, it may have changed state and so we'll run synchronization on a just in case basis and that's how Angular has traditionally worked
```ts
el.addEventListner('click', $event => {
  getComponent(el).onClick($event);
  scheduleSync();
});
```
  
- markForCheck(), signal set, etc
  And secondly that we have APIs that you call and you tell Angular "Hey, I actually change state. I set a signal somewhere, I call markForCheck or my Async Pipe call markForCheck for me". And in that case we can know that synchronization needs to run.
  Direct notification
```ts
class ChangeDetectorRef {
  markForCheck() {
    view.dirty = true;
    scheduler.notify(NotificationSource.MarkForCheck);
  }
}
```

### What we check
- effect()s
- Views
  - DOM updates
  - Inputs
  - Queries
  - Lifecyle hooks
- Render hooks

### UI has a natural hierarchy
```ts
if (user()) {
  {{ user().name }}
}

let view;
effect(() => {
  if (user()) {
    // child view assumes user is defined
    view = vcr.createEmbeddedView(tpl, { $implicit: user() });
  } else {
    view?.destroy();
    view = undefined;
  }
});
```

### View can be dirty in three ways
*Flavors of view dirtiness*
- Marked for check
- Maybe dirty via signal
- Contains dirtiness
  - Dirty child views
  - Effects, render hooks, etc.

# How Signals Change the Timing of Model Updates
```ts
class ChangeDetectorRef {
  markForCheck() {
    view.markedForCheck = true;
    scheduler.notify(NotificationSource.MarkForCheck);
  }
}

// In the scheduler:
case NotificationSource.MarkForCheck:
  app.dirty |= Dirty.ViewMarkedForCheck;
```

```ts
while (dirty) {
  if (dirty & Dirty.RootEffects) runRootEffects();
  if (dirty & Dirty.Views) checkViews();

  // if we still have dirty views, loop back
  if (dirty & Dirty.Views) continue;
  if (dirty & Dirty.RenderHooks)  runRenderHooks();
}
```

```ts
function detectChangesInViewWhileDirty() {
  while (requiresRefreshOrTraversal(lView)) {
    detectChangesInView(lView, ChangeDetectionMode.Targeted);
  }
}
```
💡 With the curent Zone-based approach, if we change the model in the mid-way between the first pass and the second pass (checkNoChanges) detection change, we will encounter the issue `ExpressionChangedAfterItHasBeenChecked` issue. Because there is no clue for the framework to re-run change detection when we break the unidirectional data flow. However, with Signal when we change the model in half-way, Angular will be notified and re-run the change detection until there is no `requiresRefreshOrTraversal`.
So we can think of using Signal as using ChangeDetectorRef.detectChanges() to schedule the change detection re-run immediately.

When you call markForCheck, this notification to the scheduler in addition to scheduling synchronization is also setting a flag on the application saying "Hey, there's some views that got marked for check"

Basically, we have a loop and the loop runs saying hey while there are things that need to be checked, we're going to go through this process and you know there might be some effects at the top level that are dirty, we need to run those. There might be some views that are dirty we need to check the view hierarchy. We have this early exit here or early loop back that says Hey if there's still dirty views continue. Why that? Well it turns out inside of a life cycle hook or something in a component you can make more State changes and as a result of making more state changes you can make something that previously got check need to be checked again and there are some ways of doing this that are kind of going to produce you know your expression change after checked there but with signals we've decided okay we want to honor that set the signal set and go back and check that view even if it was previously checked and that's what this kind of continue is doing here.
It's saying if we exit the single pass through the tree and something got made dirty that we previously checked we're going to go back and make sure we run it again and if we get all the views clean then we can do render hooks.

# Change detection strategy
- With `OnPush` change detection strategy, it only checks for changes in very specific situations or we manually tell it to.
  - Firing Angulary events or Angular mechanisms
    - inputs, outputs, events
  - Changing component's inputs
    Every time we change one of the inputs, Angular automatically check for changes in the expressions that the templates are bound to.
  - Manually trigger change detection through ChangeDetectorRef

While the OnPush strategy can reduce some of the performance cost, this strategy is limited:
- Because OnPush components prevent their descendants from being checked, descendent components that depend on global state may not correctly update if they depend on global state outside of their ancestor components.
- Because change detection always starts from the application root, running change detection on an OnPush component additionally checks every component between that component and the root, limiting the value of the optimization.

```typescript
@Component({
  template: `
    Counter: {{counter}}
    <button (click)="doNothing()">Do Nothing</button>
  `
})
export class CounterComponent {
  counter = 0;
  constructor() {
    setInterval(() => {
      this.counter++;
      console.log(this.counter);
    }, 1000);
  }

  doNothing() {}
}
```
The counter advances in the console log, but the screen does not update.
Every time when we click the button, the Counter in the DOM is updated. It happens because whenever we use something "angulary" such as an Angular event or an Angular input, whenever we use the Angular mechanism to cause Javascript to run, **Angular assumes that changes can occur and it checks for changes regardless of whether we tell it or not**. _So calling an event is one way to force the change detection to occur when we are OnPush._

🧩 Using renderer2 or add event listener manually (web 101) is NOT Zone-aware


# When & How
- The “when” part is related to change detection scheduling. It covers when change detection occurs and the factors that lead to its execution
  They are all asynchronous. Which brings us to the conclusion that, basically whenever some asynchronous operation has been performed, our application state might have changed. This is when someone needs to tell Angular to update the view.

- The “how” part focuses on the mechanics of change detection execution, including the traversal of the component tree and the process of checking for changes.

# Unidirectional data flow

# Component Dirty Marking
One thing Angular does is that it marks the component as dirty when it knows something inside the component changed.
If the component is:
- OnPush + Non-Dirty -> Skip
- OnPush + Dirty -> Check bindings -> Refresh bindings -> Check children

# markForCheck vs. detectChanges
When we use markForCheck we just tell Angular that a component is dirty, and nothing else happens, so even if we call markForCheck 1000 times it’s not going to be an issue. But, when we use detectChanges, Angular will do actual work like checking bindings and updating the view if needed. And that’s why we should use markForCheck instead of detectChanges.

# Three core operations related to component change detection
- Update child component input bindings
- Update DOM interpolations
- Update query list

# ONPUSH
The default strategy, internally refferred to as `CheckAlways`, implies regular automatic change detection for a component unless the view is explicitly detached. What's known as `OnPush` strategy, internally reffered to as `CheckOnce`, implies that change detection is skipped unless a component is marked as dirty. As it implies that change detection is skipped for a component until it's marked as dirty, then checked once, and then skipped again.

## What can make a component dirty
We mentioned that the OnPush strategy relies on component dirtiness for the change detection process. A natural question arises: what can make a component dirty?
### 1. An input (@Input, input signal) value changes (immutable = reference change)
Also, while running the change detection, Angular will check if the input value of a component has changed (=== check). If it has changed, it will mark the component as dirty.
```typescript
setInput(name: string, value: unknown): void {
  // Do not set the input if it is the same as the last value
  if (Object.is(this.previousInputValues.get(name), value)) {
    return;
  }
  // code removed for brevity
  setInputsForProperty(lView[TVIEW], lView, dataValue, name, value);
  markViewDirty(childComponentLView); // mark the component as dirty
}
```

This only marks the view of the component that has an input set, with LViewFlags.Dirty, not its parents.

### 2. A template-bound event origniates from the component or its children (including output emit and host listener, click, mouseover, etc.).
Every time we click a button with a listener in the template, Angular will wrap the callback function with a functon call **wrapListenerIn_markDirtyAndPreventDefault**. And as we can see from the name of the function, it will mark the component as dirty.
```typescript
function wrapListener(): EventListener {
  return function wrapListenerIn_markDirtyAndPreventDefault(e: any) {
    // ... code removed for brevity
    markViewDirty(startView); // mark the component as dirty
  };
}
```

### 2. An Observable bound with the async pipe emits a new value
```typescript
@Pipe()
export class AsyncPipe implements OnDestroy, PipeTransform {
  constructor(ref: ChangeDetectorRef) {}

  transform<T>(obj: Observable<T>): T|null {
    // code removed for brevity
  }

  private _updateLatestValue(async: any, value: Object): void {
    // code removed for brevity
    this._ref!.markForCheck(); // <-- marks component for check
  }
}

// view_ref.ts
markForCheck(): void {
  markViewDirty(this._cdRefInjectingView || this._lView);
}
```
So, the same as before, if we use observables with async pipe in the template it will act the same as if we used the (click) event. It will mark the component as dirty and Angular will run the change detection.
### 3. A direct call to ChangeDetectorRef.markForCheck().
### 4. A state change of a @defer block.
### 5. A Signal changes

# markViewDirty & bubbling up proccess
**Bubbling up** rule: this means that not only is the component where the change originates marked as dirty but all of its parent components up to the root are also marked as dirty. This ensures that a nested component will always be reached by change detection and not cut off by any OnPush and non-dirty parent.
The only exception to the **bubbling up** rule occurs when a component is marked as dirty due to an input value change from a parent component’s binding. In this case, the parent component is already in the middle of its own change detection check, so there’s no need to mark it as dirty again. Instead, only the component receiving the input is marked, allowing change detection to process it after the parent finishes.
**Dirty marking** as a separate process which runs before the Change Detection. This is only true as property binding is not involved. **Dirty marking** would also happen during the Change Detection

# When will OnPush component being checked?
```text
should skip OnPush components in update mode when they are not dirty
should not check OnPush components in update mode when parent events occur

should check OnPush components on initialization
should call doCheck even when OnPush components are not dirty
should check OnPush components in update mode when inputs change
should check OnPush components in update mode when component events occur
should check parent OnPush components in update mode when child events occur
should check parent OnPush components when child directive on a template emits event
```

# In-depth Angular Signals, mental models for reactive graph, push / pull, laziness and more! - Tomas Trajan 🚥
### Why Signals?
- Simpler / powerful state management
- Better DX
- Performance

#### Angular Signals are eager push / lazy pull based reactive primitive for Angular!
#### Angular Signals behave intuitively & "just work"

## Developing Mental Models
- REACTIVE CONTEXT AND REACTIVE GRAPH
- PRODUCER vs CONSUMER (NON LIVE / LIVE / TRANSITIVE LIVE)
- PUSH vs POLL PULL? (algorithm and phases)
- EAGER vs LAZY
- EQUALITY & VALUE VERSION (POLL)

## Signals reactivity
- Reading signal pulls the current value
- Updating signal sends eager push notification that its value might have changed (dirtiness)
- Only reactive `live consumers` get notified
- The `console.log()` is not a live reactive consumer!

## Reactive Context
```typescript
computed(() => {
	// reading signals here !
	return this.counter() % 2 === 0;
});

effect(() => {
	// reading signals here !
	console.log(this.counter());
});

@Component({
	template: `{{ counter() }}` // also here!
})
```
Accessing Signal value (pull) in reactive context (eg effect) creates new edge in reactive graph
Angular reactive graph consists of producers who push dirtiness and consumers who pull* current value

### Reactive graph for computed (non live consumer)
```typescript
@Component()
export class CounterComponent {
	counter = signal(0);
	isEven = computed(() => this.counter() % 2 === 0);
	
	constructor() {
		console.log(this.isEven());
	}
}
```
- Pulling Signal value in a non-live consumer will create unidirectional reference from non-live consumer to the producer, no dirtiness will be pushed
![Non-live consumer](https://firebasestorage.googleapis.com/v0/b/mktrannblog.appspot.com/o/non-live%20consumer.png?alt=media&token=a0ef3087-460f-47d1-bd1e-d471405b1914)

### Reactive graph for effect (live consumer)
```typescript
@Component()
export class CounterComponent {
	counter = signal(0);
	
	constructor() {
		effect(() => {
			console.log('counter value is', this.counter());
		});
	}
}
```
- Pulling Signal value in a live consumer will create bi-directional reference, eager push (producer) and lazy pull* (live consumer)

### Reactive graph for computed (transitive live consumer)
```typescript
@Component()
export class CounterCompnent {
	counter = signal(0);
	isEven = computed(() => this.counter() % 2 === 0);
	
	constructor() {
		effect(() => {
			console.log('effect is even', this.isEven())
		});
	}
}
```
- The computed will become live consumer with bi-directional reference if it's consumed by other live consumer (effect or template)

## Reactive Graph
- Not everything about Angular Signals is reactive in BOTH directions! (push vs pull)
- Only LIVE and (TRANSITIVE LIVE) CONSUMERS are bi-directional
	-	effect
	- template
	- computed as long as is used in transitively in
		- effect
		- template
		
### Reactive Graph Untracked
- Consumer signals without updating reactive graph
```typescript
effect(() => {
	// direct access
	console.log(untracked(counter));
	
	const user = currentUser(); // this is tracked
	
	// prevent adding of accidental deps in external code
	untracked(() => {
		this.loggingService.log(`User set to ${user}`);
	});
});
```

## Separation of PUSH vs PULL phases
```typescript
@Component
export class CounterComponent {
	counter = signal(0);
	
	constructor() {
		effect(() => {
			console.log('effect', this.counter()); // ??
		});
		this.counter.set(1);
		this.counter.update(current => current + 1);
	}
}
```
**How many time the effect is going run?**
We need to understand that effect schedules itself on the microtask queue and the above code runs synchronously at Constructor time. So what does that mean?
The effect starts as dirty and it schedules its own run in the microtasks queue. And then synchronously we set the value to 1 and then update the value by incremeting 1. So those updating should lead to push the dirtiness through the reactive graph. But the thing is because the effect didn't run yet, the counter signal was not yet added as a dependency inside of that reactive graph. So the updating counter signal will be ignored, even the dirtiness was really pushed because there was no edge in the reactive graph yet. So after this effect actually runs it will access the value of the counter for the first time and only then the edge in that reactive graph between the counter signal as a producer and effect as a consumer will be created. That also means we are going to get the latest value of that counter signal when the effect run for the first time.

# Angular change detection
## Good things take time
- These were the questions that sparked my curiousity and eventually led me down into the internals of change detection. Because, to find out answers to these questions I had to start debugging. And I was debugging and debugging and, well, I think it lasted for about... `a few months`

## Key Concepts
- `Change detection`
	- Ensures the UI stays in sync with the internal state
- Rendering
- `Bindings`
	- Once bindings are created, Angular no longer works with the template. Then change detection mechanism executes instructions that process bindings. The job of these instructions is to check if the value of an expression with a component property has changed and perform DOM updates if neccessary
- Dirty checking

### Component views and bindings
There are two main building blocks of change detection in Angular:
- a component view
- the associated bindings

## Check No Changes and Uniderectional Data Flow
⚠️ But why does Angular need this check?
 Well, imagine that some properties of components have been updated during the change detection run. As a result, expressions produce new values that are inconsistent with what's rendered in the user interface. So, what does Angular do? It certainly could run another change detection cycle to synchronize the application state with the user interface. But what if during that process some properties are updated again? See the pattern? Angular could actually end up in an infinite loop of change detection runs. And actually, that happened quite often in AngularJS.
 
## The compiled template
```html
<h3>
  Change detection is triggered at:
  <span [textContent]="time | date:'hh:mm:ss:SSS'"></span>
</h3>
<button (click)="0">Trigger Change Detection</button>
```
```javascript
ɵɵdefineComponent({
  type: TestCmp,
  selectors: [['test-cmp']],
  standalone: true,
  features: [ɵɵStandaloneFeature],
  decls: 6,
  vars: 4,
  consts: [
    [3, 'textContent'],
    [3, 'click'],
  ],
  template: function TestCmp_Template(rf, ctx) {
    if (rf & 1) {
      ɵɵelementStart(0, 'h3');
      ɵɵtext(1, ' Change detection is triggered at: ');
      ɵɵelement(2, 'span', 0);
      ɵɵpipe(3, 'date');
      ɵɵelementEnd();
      ɵɵelementStart(4, 'button', 1);
      ɵɵlistener('click', function TestCmp_Template_button_click_4_listener() {
        return 0;
      });
      ɵɵtext(5, 'Trigger Change Detection');
      ɵɵelementEnd();
    }
    if (rf & 2) {
      ɵɵadvance(2);
      ɵɵproperty('textContent', ɵɵpipeBind2(3, 1, ctx.time, 'hh:mm:ss:SSS'));
    }
  },
  encapsulation: 2,
});
```

## Angular applicationRef._tick() triggered twice
```typescript
@Component({
	selector: 'app-root',
	template: `
		{{ title }}
	`
})
export class AppComponent {
	title = 'Title'
}
```

#### Component initialized and rendered has been triggered before _tick()
![Angular initialized components before _tick()](https://firebasestorage.googleapis.com/v0/b/mktrannblog.appspot.com/o/Angular%20initialized%20components%20before%20_tick().png?alt=media&token=ef1ed758-7d37-4bfd-91c7-10b9f4e3b67c)

The double tick happens because of two main phrases
- Initial Bootstrap phrase
	- When `bootstrapApplication()` is called, Angular performs an initial tick to establish the application state
	- This is the first `ApplicationRef.tick()`
	- This tick ensures the intial state is properly rendered
- Zone.js Stablization Phase:
	- After the intial bootstrap, Zone.js triggers its stablization phase
	- The second tick ensures any asynchronous operations or side effects from the first tick are properly handled.

# Master Angular Signals
# Effects

Changes in effect()
Also in Angular blog Alex Rickabaugh and Mark Thompson said that Angular’s developer preview process allows early testing of new APIs, enabling adjustments based on real-world feedback. Through this feedback on the effect() API, Angular has identified improvements for v19, including the removal of the “allowSignalWrites” flag, which was initially designed to prevent improper signal usage but proved ineffective. Now, effects can set signals by default, with a focus on encouraging good practices through new reactivity helpers. Additionally, effects will now run during change detection rather than as independent microtasks, improving predictability and resolving timing issues. While most effect use cases will remain unaffected, developers should be aware of potential timing changes, particularly with view queries and Observable chains. The effect() API will remain in preview through v19 as these updates are further refined.

### Highlights
- Effects are intended to sync state with the outside world,
- Don't use `effect` to sync state with other state.
- Avoid using effects for the propagation of state changes
- The `effect` only runs once the graph is consistent. Effects always execute *asynchronously* during the change detection process.
- Effects will execute at least once
- `Glitch-free`: effects will execute a minimal number of times. If an effect depends on multiple signals and several changes at once, only one effect execution will be scheduled.
- The `effect` timing will be updated in **Angular 19**
- The most common uses cases for `effect` are:
1. `Signal-exclusive` side effects: When reacting to a Signal's change where the immediate outcome is not a derived Signal.
2. `asynchronous changes to Signals`: When `effect` updates another Signal, but first has to fetch data from a server.
- It may seem like `loadEffect` is setting a derived value, but since there's an asynchronous task involved, `computed()` isn't an option. `computed` requires the function to return a value immediately, which isn't possibible here.

When working with Signals, it's important to understand the concept of a `glitch-free` effect. This means that if a Signal changes multiple times synchronously, the frontend is only concerned with the final state. There's no need to update the DOM with intermediate states while synchronous execution has completed.

Scheduling the `effect()` asynchronously makes sense because it ensures that all synchronous execution has completed.

In this context, `effect()` and the template act as the \"end\" or \"final consumer\" of a Signal's reactive graph. On the other hand, `computed()` is part of the reactive graph itself but is not the final consumer, which is why `computed()` runs synchronously.

### Scheduling and timing of effects
Effects in Angular Signals must always be executed after the operation of changing a signal has completed.
Given the variety of effect use-cases, there is a wide spectrum of possible execution timings. This is why the actual effect execution timing is not guaranteed and Angular might choose different strategies. Application developers should not depend on any observed execution timing. The only thing that can be guaranteed is that:
- effects will execute at least once;
- effects will execute in response to their dependencies changes at some point in the future;
- effects will execute minimal number of times; if an effect depends on multiple signals and several of them change at once, only one effect execution will be scheduled.

### Questions & Concerns
- How and when does the initial run of the `effect` happen?
- Why do `effects` happen asynchronously, and why does it happen only once after the underlying signals change?
- Why are they connected to the change detection cycle?
- How are `effects` scheduled to re-run when one or more underlying signals change?

### Types of effect
- Angular has two different kinds of effect: `component effects` and `root effects`.
	- Component effects are created when `effect()` is called from a component, directive, or within a service of a component/directive. 
	- Root effects are created when `effect()` is called from outside the component tree, such as in a root service, or when the `forceRoot` option is provided.
	- The two effect types differ in their timing. Component effects run as a component lifecycle event during Angular's synchronization (change detection) process, and can safely read input signals or create/destroy views that depend on the component state. Root effects run as microtasks and have no connection to the component tree or change detection.

### What happens when the `effect` is created?

# Angular Space First Blog
https://medium.com/angularwave/introduction-to-angular-signals-e20dba5737db
## Table of content
- What is change detection?
- Change term from change detection to Synchronization
- Why do we need change detection?
- Plain change detection with HTML and Javascript
- Change detection example with Angular API (defineComponent)
- Angular Compiler
- Angular Template
- Two phases change detection: Creation Mode and Updation Mode
- Zone.JS
- Angular Zone
- Improve change detection with runOutSide Angular
	- Scroll listener example
	- But it will solve with Zoneless
- Expression Has Been Changed After Checked
- How do Signal solve problem for Expression Has Been Changed After Checked
- Optimize change detection with OnPush strategy
- Pokemon application - demo
- ZoneJs assumption => dirty checking process
- `markViewDirty` is at the heart of the framework

- There's must be a trigger

## Change Detection 101

## Notes
A View is re-rendered only if it is marked as Dirty which means the View has changed and needs to be updated.

## Signal
This is what makes signals so powerful as a mechanism of change detection and DOM synchronization. The affected template is directly notified. No walking of component trees and guesing when to recheck everything is necessary!

## Consider 
`refreshView`

## Push/poll/pull algorithm
We refer to this as the "push/pull" algorithm: "dirtiness" is eagerly pushed through the graph when a source signal is changed, but recalculation is performed lazily - only when values are pulled by reading their signals.

## Dirty marking process
- Before running change detection, when a trigger occurs in a component, Angular marks that component as "dirty".
- All ancestors marked as dirty
- CD runs through "dirty" components

## Dirty checking
By default, Angular makes not assumption on what the component depends upon. So it has to be conservative and will checks every time something may have changed, this is called dirty checking. In a more concrete way, it will perform checks for each browser events, timers, XHRs and promises.
By default, Angular Change Detection checks for all components from top to bottom if a template value has changed.

## Unidirectional Data Flow

## Angular Signals
Angular Signals is a system that granularly tracks how and where your state is used throughout an application. It allows the framework to optimize rendering updates.
A signal is a wrapper around a value that can notify interested consumers when that value changes. Signals can contain any value, from simple primitives to complex data structures.

The Angular team introduces two abstractions: Producer and Consumer. Producers are values that can deliver notifications about changes, and consumers consume them. Actually, there is a case when one node can be both producer & consumer. That happens for a computed signal, which is used as a dependency for another computed signal. Only computed or derived signals can be producers & consumers at the same time. Writable signals can only be producers. They can't consume any dependencies.

Angular Signals is an implementation of a fine-grained reactive system. The core things in the Angular Signals system are the `ReactiveNode` and `ReactiveEdge` classes. When you use signals public APIS, thouse structures are actually created and maintained under the hood.

## Order of operations
https://medium.com/angular-in-depth/a-gentle-introduction-into-change-detection-in-angular-33f9ffff6f10
We've just learned that because of the unidirectional data flow restriction you can't change some properties of a component during change detection after this component has been checked. Most often, this update happens through a shared service or synchronous event broadcasting when Angular runs change detection for child components. But it's also possible to directly inject a parent component into a child component and update the parent state in a lifecycle hooks.

As you can see, Angular also triggers lifecycle hooks as part of change detection. What’s interesting is that some hooks are called before the rendering part when Angular processes bindings and some are called after that. Here’s a diagram that demonstrates what happens when Angular runs change detection for the parent component:

![Order of operations](https://miro.medium.com/v2/resize:fit:720/format:webp/1*G4DbNvyRq4MVrSTcehQ5rA.png)

Let’s go through it step by step. First, it updates the input bindings for the child component. Then it calls the OnInit, DoCheck, and OnChanges hooks, again, on the child component. It makes sense because it just updated the input bindings and Angular needs to notify the child components that the input bindings have been initialized. Then Angular performs rendering for the current component. And after that, it runs change detection for the child component. This means that it’ll basically repeat these operations on the child view. And finally, it calls theAfterViewChecked and AfterViewInit hooks on the child component to let it know that it’s been checked.

What we can notice here is that Angular calls the AfterViewChecked lifecycle hook for the child component after it’s processed the bindings of the parent component. On the other hand, the OnInit hook is called before the bindings are processed. So even if there’s a change on the text value in the OnInit, it’s still going to be the same during the following check. And that explains the seemingly weird behavior of not having the error with the ngOnInit hook. Mystery solved 

## Bindings
- Event bindings
- Property bindings

## OnPush
With onPush, Angular will only depend on the component’s inputs, events, markForCheck method, or the use of the async pipe in the template, to perform a change detection mechanism and update the view.

## Local Change Detection
Right now (in v17), if your component uses the OnPush strategy and the only source of reactivity in the template is signals, then signals will mark this component as dirty, but will not mark its ancestors as dirty - ancestors will be marked only "for traversal", and Change Detection will still traverse the ancestors, but will not "execute" them.

## ZoneJS
- Angular leverages ZoneJS in order to find out when an asynchronous task is completed, and as a result, a change detection cycle should be triggered.

- So far, Angular uses Zone.js to update components. This works by assuming that any event handler can theoretically change a or some components or bound data.

- Zone is a mechanism for intercepting and keeping track of asynchronous work.

- The problem with Zone.js
Although Zone.js is so powerful and worked well so far. It has its limitations. Zone.js can only notify us when something **might** have happened in the app. The problem is in the 'might'. Zone.js is not capable of giving us more information about what happened, where, and what has changed.

- A zone normally has these phases:
	- It starts stable
	- It becomes unstable if tasks run in the zone
	- It becomes stable again if the tasks completed
	
- Give example for how Zone.js trigger change detection by `noopZone`

At its core, Zone.js monkey patches most standard APIs such as:
- Macrotasks: tasks that the browser event loop handles one at a time. They include events like setTimeout, setInterval, and I/O operations;
- Microtasks: smaller task of work that are processed after a current macrotask but before any new macrotask is started. They include Promises and the MutationObserver callback;
- EventTasks: tasks associated with event listeners. When an event occurs, the associated listener callback is scheduled as an EventTask;

- Avoiding unnecessary change detection cycles: Zone.js assists Angular's change detection by notifying it when operations finish, but it doesn't actually know whether these operations change any data. Because of this, the framework tends to overreact by scheduling a run "just in case".

## Role of Zone.js in Change Detection
Think of Zone.js as a supervisor that watches over your application's tasks. When an asynchronous task completes, Zone.js alerts Angular to check for changes in your application. This ensures that your UI stays up-to-date with the latest data and user interactions.

## When does Angular perform change detection?
- **After the application initilisation**
That is after the Angular application is bootstrapped, and Angular loads the bootstrap component
- **After the DOM event listeners**
After the browser events such as click, focus, blur and so on are handled.
- **MacroTasks**
That is after the macro-tasks such as `setTimeout()` so `setInterval()` are completed. These macro tasks are considered completed once the callback function passed to them completes the execution.
- **MicroTasks**
That is after the micro-tasks such as Promise are completed - a Promise will be considered complete once it is resolved or rejected.
- **Other async operations**
That is after the other async operations such as webSocket.onMessage and Canvas.toBlob complete the execution.

## Scroll
One of the browser APIs that's monkey patched by ZoneJS is `addEventListener`. So, for example, when we register an event in our component:
```typescript
import { fromEvent } from 'rxjs';

@Component({
  selector: 'component',
})
export class TestComponent {

  ngOnInit() {
    fromEvent(window, 'scroll').subscribe(...);
  }
  
  // Or
  @HostListener('window:scroll')
  onScroll() {}
}
```
Each time the event is fired, NgZone notifies Angular, which causes a new change detection cycle to run. We can easily see this in action by adding a getter our component's template

Angular is subscribed to the `onMicrotaskEmpty` observable, which is fired when all the tasks are completed and the zone is stable. When this observable emits, Angular calls the `tick()` method, which runs change detection on each view.

## Change detection
Angular Change Detection is responsible for make the component dynamic. During Change Detection cycle, Angular looks for all the bindings, re-executes all the expression, compares it with the previous values and if the change is detected, it propagates the change to the DOM elements.

![Change detection flow](https://miro.medium.com/v2/resize:fit:720/format:webp/0*T_KPw5SaCVShe2VY.png)

![Compare change detection](https://miro.medium.com/v2/resize:fit:720/format:webp/1*wXsYipp66MXRZOoQUYrpzQ.jpeg)

## AsyncPipe
```typescript
private _updateLatestValue(): void {
	if (async === this._obj) {
		this._latestValue = value;
		this._ref.markForCheck();
	}
}
```
- Problems
	- `observables$ | async` => create new subscription everytime and trigger side effects

## Distilled
One of Angular’s greatest strengths is its ability to easily detect and update changes in an application, while automatically rendering the updated state on the screen. 

Changes occur on different occasions and derive from different events:
- Data received from network requests or component events
- Mouse clicks, scrolling, mouseover, keyboard navigation
- AJAX calls
- Use of JavaScript timer functions such as setTimeOut, SetInterval

To detect and update the DOM with changed data, the framework provides its own change detector to each component.
- The change detector reads the binding on the template
- Reflects the updated data to the view
- Ensuring that both the data model and the DOM are in sync

![Every component in angular has an associated View and Change Detector](https://miro.medium.com/v2/resize:fit:720/format:webp/1*4UxFNyyzVuNrAawsh6cNAQ.png)

**markForCheck()**
`markForCheck()` method is used in combination with `OnPush` change detection strategy to manually mark the current view and all of its successors as to be Checked Once so that they can be checked again during the current or next change detection cycle.

## Manually Triggered Change Detection
```typescript
@Component({
	selector: 'app-data-loader',
	template: `
		@if (data) {
			<p>{{ data }}</p>
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataLoaderComponent {
	data: string;
	
	constructor(private cdr: ChangeDetectorRef, private dataService: DataService) {}
	
	loadData() {
		this.dataService.getData().subscribe((response) => {
			this.data = response;
			this.cdr.markForCheck();
		});
	}
}
```

### Angular component tree
We have a tree of components in our application, and each of them has a template. Templates describe that DOM elements Angular should create, and what properties DOM nodes should have.

The template is just a blueprint, a set of instructions. The process of converting these instructions into real DOM nodes is called "rendering" and Angular does it for us.

### Observerbles as a source of reactivity
We use Observables as a source of reactivity - `async` pipe reacts to the changes and marks views as dirty, and because Observables use async APIs, that are patched by ZoneJS, changes will also schedule a CD cycle.

### Using markForCheck() with ngDoCheck LifeCycle hook
Angular runs the ngDoCheck lifecycle method of the immediate child component whenever change detection runs for the parent component irrespective of the change detection strategy. 
We can use this behavior to improve the performance of the App by calling the markForCheck() method in ngDoCheck() by checking if firstname property has changed.

```typescript
import { ChangeDetectorRef, Component, DoCheck, Input, OnInit } from "@angular/core";

@Component({
  selector: 'app-child',
  template: `<span>
                Name : {{user.firstname}} {{user.lastname}}
             </span>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildComponent implements DoCheck, OnInit {
  @Input() user: User;

  firstname: string;
  
  constructor(private cd: ChangeDetectorRef) {}
  
  ngOnInit() {
    this.firstname = this.user.firstname;
  }
  
  ngDoCheck() {
    if (this.firstname != this.user.firstname) {
      this.cd.markForCheck();
    }
  }
}
```
Change detection will not run by default when firstname is changed As the change detection strategy is OnPush for ChildComponent, but ngDoCheck life cycle method will run whenever change detection is triggered for the app component, in this method we can check if firstname property of user object is changed and then call the markForCheck() accordingly, which will mark the current View as to be Checked Once.
   
## Build change detection from scratch, just Javascript
```javascript
// creation phase
const div = document.createElement('div');
const button = document.createElement('button');

// create state
let count = 0;

// create click handler function
const buttonClick = () => { count++; console.log(count); };

// create the update phase
function updatePhase() {
	div.textContent = `Count ${count}`;
	button.textConent = `I've been click: ${count} times`;
}

// add elements to the body
document.body.append(div, button);

// call updatePhase once by default
updatePhase();

const myZone = Zone.current.fork({
	name: 'myZone',
	onInvokeTask: (delegate, current, target, task) => {
		const result = delegate.invokeTask(target, task);
		// run updatePhase every time zone is notified for events
		updatePhase();
		return result;
	}
});

myZone.run(() => {
	// register click event listener inside the custom zone
	button.addEventListner('click', buttonClick);
});
```

# Never doubt NG100: Expression Changed After Checked Error
https://angular.love/expression-changed-error-causes-and-workarounds

## Introduction
If you have been working with Angular for while then I bet that you have probably encountered this unfamous error `ExpressionChangedAfterItHasBeenCheckedError` more than once already and so have I. And as a normal Software Engineer, I tried to google the error myself and come up with lots of solutions `ChangeDetectorRef.detectChanges()`, `setTimeout`, Promise.then() or update the DOM without using bindings. I have tried out all sorts of solutions. It all works but the biggest question in my head is that why do these solutions solve the issue and what is the message that Angular team want to give us for `ExpressionChangedAfterItHasBeenCheckedError`? This article is like a documentary about my own journey went through to answer these questions and I hope this article will help you understand the error better from the perspective of someone who has less experience with the framework back then.

## Reproducing the issue
### Update state in `AfterViewInit`
The first step in fixing a bug is reproducing the issue. So before we try to fully understand the issue, let's try to make this error happens by considering the following example:
```typescript
@Component({
	selector: 'app-counter',
	template: `{{count}}`
})
export class CounterComponent implement AfterViewInit {
	count = 0;
	
	ngAfterViewInit() {
		this.count = 9;
	}
}
``` 
If you have tried it yourself, you will definitely guess what happens `ExpressionChangedAfterItHasBeenCheckedError`.
```text
ERROR RuntimeError: NG0100: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. 
Previous value: '0'. Current value: '9'. Expression location: _CounterComponent component. 
Find more at https://angular.dev/errors/NG0100
    at throwErrorIfNoChangesMode (core.mjs:11079:9)
    at bindingUpdated (core.mjs:22191:9)
    at interpolation1 (core.mjs:23979:21)
    at Module.ɵɵtextInterpolate1 (core.mjs:30732:24)
    at CounterComponent_Template
```
When the first time I have seen this error, there are many questions that come up in my mind back then:
1. What is `Expression`?
2. When has exactly the `Expression` been checked?
3. Where are `CounterComponent_Template`, `bindingUpdated` and `ɵɵtextInterpolate` come from?
4. Why does the latest value (9) reflected on UI but Angular still throw the issue?

We will reveal these questions one by one during this blog to understand this error in-depth. Updating state inside `AfterViewInit` is not the only way that cause the error. There are many wrong way of updating state that lead to encounter this issue.

### Update state inside `AfterViewChecked`
Simliar to `AfterViewInit`, if we update the state inside `AfterViewChecked`, we also end up with the same error.
```typescript
export class CounterComponent implement AfterViewChecked {
  ngAfterViewChecked() {
  	this.count = 9;
  }
}
```
With new way of reproducing the issue, it becomes a bit clear because the name of this lifecycle hook says it all. It obviously indicates that we have changed something after the view has been checked which is the root cause of the issue.

### Using random state
Another way to trigger the ExpressionChangedAfterItHasBeenCheckedError is by rendering a random value, such as generated unique IDs, timestamps, and similar dynamic values. In this example, we will show how easily the error can be reproduced by ensuring that the state returns a different random number each time it is accessed.
```typescript
@Component({
	template: `randomNumber()`
})
export class RandomComponent {
	randomNumber() {
		return Math.random()
	}
}
```
If you try it yourself, you will end up with the error message kind of similar to the following:
```
Expression has changed after it was checked. Previous value: '0.6216365849166838'. Current value: '0.836623591923682'.
```
With this experimental, we can guess that the `randomNumber` must be triggered twice to get two random numbers. But why is `randomNumber` function triggered twice? Who then trigger `randomNumber` function?

### Updating parent state from child component
```typescript
@Component({
	selector: 'app-child',
	template: ``,
	standalone: true,
})
export class ChildComponent implements OnInit {
	parentComponent = inject(ParentComponent);
	
	ngOnInit() {
		this.parentComponent.name = 'Doe';
	}
}

@Component({
	selector: 'app-parent',
	template: `
		{{name}}
		<app-child />
	`,
	imports: [ChildComponent]
})
export class ParentComponent {
	name = "John";
}
```
Another way to reproduce the error is that try to update the parent's state via child component. Specifically, in our case, the name state of `ParentComponent` is updated via `ChildComponent` OnInIt hook. So you maybe guess that Angular framework prevent us to update the parent state from the child. But it is not totally right. The interest thing is that if you adjust the render part of ParentComponent by switching the order of rendering, the error won't be thrown.
```typesript
@Component({
	template: `
		<app-child />
		{{name}}
	`
})
export class ParentComponent {}
```
## Understand the error

### Unidirectional data flow

### Change Detection 101

## Deep dive into how Angular implement the check

## Solutions


The truth is: It's Angular that is telling us that we are doing something wrong, and most of the time we are breaking unidirectional data flow or doing side effects.

For workarounds, there are basically two options:
- delay the actual update until after the change detection cycle is finished
- run lcoal change detection cycle to bring the application state and DOM into sync before `checkNoChanges` error

```typescript
ngAfterViewChecked() {
	this.numberOfChildren = this.children.length;
	this.cdr.detectChanges();
}
```
Calling detectChanges from inside ngAfterViewChecked basically re-runs refreshView for the current component.
After the first run of refreshView, Angular remembers the value 0 for the {{numberOfChildren}} expression.
Inside the ngAfterViewChecked hook we update the value for the expression to 1.
Those are inconsistent and would lead to the error during the following checkNoChanges verification loop.

However, before Angular runs this verification loop, we trigger another cycle of detectChanges
inside the ngAfterViewChecked right after we update the numberOfChildren property.
This will make Angular remember value 1 for the binding because {{numberOfChildren}} evaluates to 1
after the first run of change detection.

When Angular runs its verification loop, {{numberOfChildren}} again evaluates to the value of 1 which matches the remembered value. There’s no inconsistency anymore.

## Delay update vs. Trigger Local Change Detection
A very important difference between running local change detection cycle and delaying the update is that a delayed update will lead to the application wide change detection, while calling `detectChanges` will trigger local change detection. This means that most of the time `detectChanges` is the preferred solutions.


Surprisingly, though, this use of setTimeout will lead to an infinite loop of change detection runs.
It’s hard to notice because the application doesn’t freeze.
Scheduling a macrotask gives the browser room for handling UI events such as clicks.
The infinite loops happens because each setTimeout call triggers change detection,
and during each change detection run the ngAfterViewChecked is executed, which calls setTimeout again.

