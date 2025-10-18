import React, { useState } from 'react';
import { Zap, AlertTriangle, CheckCircle, XCircle, ArrowRight, Activity, GitBranch, Layers, Code, Cpu, Workflow, Target, Pause, Play, RefreshCw } from 'lucide-react';

const PresentationFull = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // SECTION 1: INTRODUCTION
    {
      title: "Angular Change Detection",
      subtitle: "The Complete Deep Dive - From Zone.js to Signals",
      content: (
        <div className="space-y-6 flex flex-col justify-center h-full">
          <div className="text-6xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent text-center">
            Understanding Angular's Reactivity
          </div>
          <div className="text-3xl text-gray-300 text-center mt-6">
            How Angular keeps your UI in sync with your data
          </div>
          <div className="grid grid-cols-3 gap-6 mt-12 text-lg">
            <div className="bg-blue-900 bg-opacity-30 p-6 rounded-lg text-center">
              <Activity className="mx-auto mb-3 text-blue-400" size={40} />
              <strong>Zone.js Era</strong>
              <p className="text-gray-400 text-sm mt-2">Check everything, always</p>
            </div>
            <div className="bg-purple-900 bg-opacity-30 p-6 rounded-lg text-center">
              <Target className="mx-auto mb-3 text-purple-400" size={40} />
              <strong>OnPush Era</strong>
              <p className="text-gray-400 text-sm mt-2">Manual optimization</p>
            </div>
            <div className="bg-green-900 bg-opacity-30 p-6 rounded-lg text-center">
              <Zap className="mx-auto mb-3 text-green-400" size={40} />
              <strong>Signals Era</strong>
              <p className="text-gray-400 text-sm mt-2">Reactive synchronization</p>
            </div>
          </div>
          <div className="text-center mt-8 text-xl text-gray-400">
            Press → or Space to navigate | Home/End to jump
          </div>
        </div>
      )
    },
    
    // SECTION 2: FUNDAMENTALS
    {
      title: "What is Change Detection?",
      subtitle: "The Core Concept",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-8 rounded-lg">
            <p className="text-2xl text-gray-200">
              <strong className="text-blue-400">Change Detection</strong> is the process through which Angular 
              checks to see whether your application state has changed, and if any DOM needs to be updated.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-green-400">What Triggers It?</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• User events (clicks, inputs, etc.)</li>
                <li>• HTTP requests completing</li>
                <li>• setTimeout / setInterval</li>
                <li>• Promise resolution</li>
                <li>• Any asynchronous operation</li>
              </ul>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">The Goal</h3>
              <p className="text-gray-300 leading-relaxed">
                Keep the view in sync with the model. When data changes, Angular needs to:
              </p>
              <ul className="space-y-2 text-gray-300 mt-3">
                <li>1. Detect the change</li>
                <li>2. Update the DOM</li>
                <li>3. Maintain consistency</li>
              </ul>
            </div>
          </div>
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 p-6 rounded-lg">
            <p className="text-xl">
              <AlertTriangle className="inline mr-3 text-yellow-400" size={28} />
              Angular walks your components <strong>from top to bottom</strong>, looking for changes
            </p>
          </div>
        </div>
      )
    },

    {
      title: "Web Development 101",
      subtitle: "The Manual Era - Plain JavaScript",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-sm">
            <div className="text-green-400 text-lg mb-3">// Manual Change Detection</div>
            <pre className="text-white leading-relaxed">
{`let title = 'Hello World';
const element = document.getElementById('title');

// Manual rendering
function render() {
  element.textContent = title;
}

// Manual change detection
function detectChanges() {
  if (element.textContent !== title) {
    element.textContent = title;
  }
}

// After every change, you must call render
title = 'Hello Angular';
render(); // Manually trigger update`}
            </pre>
          </div>
          <div className="bg-red-900 bg-opacity-30 border border-red-500 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-red-400 flex items-center gap-3">
              <AlertTriangle size={28} />
              The setTimeout Problem
            </h3>
            <pre className="bg-gray-900 p-4 rounded font-mono text-sm">
{`setTimeout(() => {
  title = 'Updated';
  // Oops! Forgot to call render()
  // UI is now out of sync!
}, 1000);`}
            </pre>
            <p className="text-gray-300 mt-4">
              Asynchronous operations make manual change detection error-prone and difficult to maintain.
            </p>
          </div>
        </div>
      )
    },

    {
      title: "UI = fn(state)",
      subtitle: "The Fundamental Equation",
      content: (
        <div className="space-y-8 flex flex-col justify-center h-full">
          <div className="text-7xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent text-center">
            UI = fn(state)
          </div>
          <div className="space-y-6 text-2xl">
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <Code className="text-yellow-500" size={40} />
                <span className="text-yellow-400 font-semibold">React:</span>
              </div>
              <p className="ml-14 text-gray-300">vDOM = fn(state)</p>
              <p className="ml-14 text-gray-500 text-lg mt-2">
                React re-renders entire component trees and diffs virtual DOM
              </p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <Zap className="text-red-500" size={40} />
                <span className="text-red-400 font-semibold">Angular:</span>
              </div>
              <p className="ml-14 text-gray-300">deltaUI = fn(deltaState)</p>
              <p className="ml-14 text-gray-500 text-lg mt-2">
                Angular tracks bindings and updates only what changed
              </p>
            </div>
          </div>
          <div className="bg-blue-900 bg-opacity-30 border border-blue-500 p-6 rounded-lg text-center">
            <p className="text-xl text-gray-300">
              The challenge: <strong className="text-blue-400">When</strong> and <strong className="text-blue-400">How</strong> to detect changes?
            </p>
          </div>
        </div>
      )
    },

    // SECTION 3: COMPONENT VIEWS AND BINDINGS
    {
      title: "Component Views and Bindings",
      subtitle: "The Foundation of Change Detection",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-6 text-blue-400 flex items-center gap-3">
              <Layers size={32} />
              Two Building Blocks
            </h3>
            <div className="space-y-6">
              <div className="border-l-4 border-green-500 pl-6">
                <p className="font-semibold text-green-400 text-xl mb-2">1. Component View (LView)</p>
                <p className="text-lg text-gray-400">
                  A fundamental building block of the application UI. The smallest grouping of elements 
                  which are created and destroyed together.
                </p>
                <ul className="mt-3 space-y-1 text-gray-400">
                  <li>• Stores DOM node references</li>
                  <li>• Contains component instance</li>
                  <li>• Holds previous values (oldValues array)</li>
                  <li>• Links to child views</li>
                </ul>
              </div>
              <div className="border-l-4 border-purple-500 pl-6">
                <p className="font-semibold text-purple-400 text-xl mb-2">2. Associated Bindings</p>
                <p className="text-lg text-gray-400">
                  Defines the relationship between component properties and DOM element properties
                </p>
                <ul className="mt-3 space-y-1 text-gray-400">
                  <li>• Created by the compiler from template</li>
                  <li>• Maps expressions to DOM properties</li>
                  <li>• Stores binding metadata</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-green-900 bg-opacity-30 border border-green-500 p-4 rounded-lg">
            <p className="text-gray-300">
              <strong className="text-green-400">Key Insight:</strong> There's a one-to-one relationship between a component and a view
            </p>
          </div>
        </div>
      )
    },

    {
      title: "What is a Binding?",
      subtitle: "Connecting Component Properties to DOM",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <p className="text-xl text-gray-300 mb-4">
              A <strong className="text-blue-400">binding</strong> defines the property name to update 
              and the expression that Angular uses to obtain a new value.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-sm">
            <div className="text-green-400 mb-3">// Template</div>
            <pre className="text-white">
{`<span [textContent]="user.name"></span>
<div [className]="'status-' + user.status"></div>
<p>{{ user.age }}</p>`}
            </pre>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-sm">
            <div className="text-green-400 mb-3">// Binding Structure</div>
            <pre className="text-white">
{`interface Binding {
  propertyName: string;  // e.g., 'textContent', 'className'
  expression: Function;  // e.g., () => user.name
  oldValue: any;        // Previous value for comparison
}`}
            </pre>
          </div>
          <div className="bg-purple-900 bg-opacity-30 border border-purple-500 p-6 rounded-lg">
            <p className="text-gray-300">
              During change detection, Angular evaluates expressions, compares to oldValues, 
              and updates DOM if different. This is <strong className="text-purple-400">dirty checking</strong>.
            </p>
          </div>
        </div>
      )
    },

    {
      title: "How Templates Become Instructions",
      subtitle: "The Angular Compiler",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-blue-400">Template</h3>
              <pre className="bg-gray-800 p-4 rounded font-mono text-xs text-white">
{`<h3>
  Change detection is triggered at:
  <span [textContent]="time | date:'hh:mm:ss'"></span>
</h3>
<button (click)="onClick()">Click</button>`}
              </pre>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-green-400">Compiled Code</h3>
              <pre className="bg-gray-800 p-4 rounded font-mono text-xs text-white">
{`// Creation Phase (rf & 1)
ɵɵelementStart(0, 'h3');
ɵɵtext(1, ' Change detection...');
ɵɵelement(2, 'span', 0);
ɵɵpipe(3, 'date');
ɵɵelementEnd();
ɵɵelementStart(4, 'button', 1);
ɵɵlistener('click', ctx.onClick);
ɵɵtext(5, 'Click');
ɵɵelementEnd();

// Update Phase (rf & 2)
ɵɵadvance(2);
ɵɵproperty('textContent', 
  ɵɵpipeBind2(3, 1, ctx.time, 'hh:mm:ss'));`}
              </pre>
            </div>
          </div>
          <div className="bg-blue-900 bg-opacity-30 border border-blue-500 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-blue-400">Two Phases</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-green-400">Creation (rf & 1):</strong>
                <p className="text-gray-300 mt-2">Create DOM structure, set up listeners</p>
              </div>
              <div>
                <strong className="text-purple-400">Update (rf & 2):</strong>
                <p className="text-gray-300 mt-2">Evaluate bindings, update properties</p>
              </div>
            </div>
          </div>
        </div>
      )
    },

    {
      title: "The property() Instruction",
      subtitle: "The Heart of Binding Updates",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs">
            <div className="text-green-400 text-lg mb-3">// property() implementation</div>
            <pre className="text-white leading-relaxed">
{`export function property(propName: string, value: any) {
  const lView = getLView();                    // Get current view
  const bindingIndex = nextBindingIndex();      // Get binding slot
  
  if (bindingUpdated(lView, bindingIndex, value)) {
    // Value changed! Update DOM
    const tView = getTView();
    const tNode = getSelectedTNode();
    elementPropertyInternal(tView, tNode, lView, propName, value);
  }
  
  return property; // Chainable for multiple properties
}

function bindingUpdated(lView: LView, bindingIndex: number, value: any): boolean {
  const oldValue = lView[bindingIndex];
  
  if (Object.is(oldValue, value)) {
    return false; // No change
  } else {
    lView[bindingIndex] = value; // Store new value
    return true; // Changed!
  }
}`}
            </pre>
          </div>
          <div className="bg-purple-900 bg-opacity-30 border border-purple-500 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-purple-400">This is Dirty Checking!</h3>
            <p className="text-gray-300">
              Angular compares the new value with the old value stored in LView. 
              If different, it updates the DOM property via elementPropertyInternal.
            </p>
          </div>
        </div>
      )
    },

    {
      title: "DOM Update Flow",
      subtitle: "From Expression to Screen",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs">
            <div className="text-green-400 mb-3">// Template expression</div>
            <pre className="text-white">
{`[className]="'fa-star ' + (rating > 0 ? 'fas' : 'far')"`}
            </pre>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs">
            <div className="text-green-400 mb-3">// Compiled to</div>
            <pre className="text-white">
{`if (changeDetectionPhase) {
  property("className", "fa-star " + (ctx.rating > 0 ? "fas" : "far"));
}`}
            </pre>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">The Update Flow</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-green-400 font-bold">1.</span>
                <span>Evaluate expression: <code className="text-yellow-400">"fa-star fas"</code></span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-400 font-bold">2.</span>
                <span>Compare to oldValue in LView[bindingIndex]</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-purple-400 font-bold">3.</span>
                <span>If different, call elementPropertyInternal</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-pink-400 font-bold">4.</span>
                <span>renderer.setProperty(element, 'className', 'fa-star fas')</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-yellow-400 font-bold">5.</span>
                <span>Store new value in LView[bindingIndex]</span>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SECTION 4: ZONE.JS
    {
      title: "Enter Zone.js",
      subtitle: "Automatic Change Detection",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-8 rounded-lg">
            <h3 className="text-3xl font-bold mb-4 text-center">Zone.js is NOT Change Detection</h3>
            <p className="text-center text-xl text-gray-300">
              Zone.js is a <strong className="text-yellow-400">notification system</strong>, not the detector itself
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-4 text-xl flex items-center gap-2">
                <CheckCircle size={24} />
                What Zone.js Does
              </h4>
              <ul className="text-lg space-y-3 text-gray-300">
                <li>✓ Monkey patches async APIs</li>
                <li>✓ Tracks async operations</li>
                <li>✓ Detects when tasks complete</li>
                <li>✓ Emits onMicrotaskEmpty event</li>
                <li>✓ Notifies ApplicationRef</li>
              </ul>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <h4 className="font-semibold text-red-400 mb-4 text-xl flex items-center gap-2">
                <XCircle size={24} />
                What Zone.js Does NOT Do
              </h4>
              <ul className="text-lg space-y-3 text-gray-300">
                <li>✗ Run change detection</li>
                <li>✗ Know what changed</li>
                <li>✗ Update the DOM</li>
                <li>✗ Track dependencies</li>
                <li>✗ Optimize performance</li>
              </ul>
            </div>
          </div>
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 p-6 rounded-lg">
            <p className="text-xl text-gray-300">
              <AlertTriangle className="inline mr-3 text-yellow-400" size={28} />
              Zone.js tells Angular <em>"something happened, you should probably check"</em>
            </p>
          </div>
        </div>
      )
    },

    {
      title: "How Zone.js Works",
      subtitle: "Monkey Patching Async APIs",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">APIs Patched by Zone.js</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-800 p-4 rounded">
                <strong className="text-green-400 block mb-2">Timers</strong>
                <div className="space-y-1 text-gray-400">
                  <div>• setTimeout</div>
                  <div>• setInterval</div>
                  <div>• setImmediate</div>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <strong className="text-purple-400 block mb-2">Promises</strong>
                <div className="space-y-1 text-gray-400">
                  <div>• Promise.then</div>
                  <div>• Promise.catch</div>
                  <div>• Promise.finally</div>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <strong className="text-pink-400 block mb-2">Events</strong>
                <div className="space-y-1 text-gray-400">
                  <div>• addEventListener</div>
                  <div>• removeEventListener</div>
                  <div>• dispatchEvent</div>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <strong className="text-yellow-400 block mb-2">XHR/Fetch</strong>
                <div className="space-y-1 text-gray-400">
                  <div>• XMLHttpRequest</div>
                  <div>• fetch</div>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <strong className="text-blue-400 block mb-2">Browser</strong>
                <div className="space-y-1 text-gray-400">
                  <div>• requestAnimationFrame</div>
                  <div>• MutationObserver</div>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <strong className="text-red-400 block mb-2">WebSocket</strong>
                <div className="space-y-1 text-gray-400">
                  <div>• WebSocket.send</div>
                  <div>• WebSocket.onmessage</div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs">
            <div className="text-green-400 mb-3">// How patching works</div>
            <pre className="text-white">
{`// Original API
const originalSetTimeout = window.setTimeout;

// Patched version
window.setTimeout = function(callback, delay) {
  // Zone.js intercepts this
  zone.schedule(() => {
    callback();
    // After callback completes, check if microtask queue is empty
    if (microTaskQueueEmpty) {
      zone.onMicrotaskEmpty.emit(); // Notify Angular!
    }
  });
};`}
            </pre>
          </div>
        </div>
      )
    },

    {
      title: "Zone.js Lifecycle",
      subtitle: "Stable → Unstable → Stable",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-purple-400">Zone States</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-32 bg-green-600 text-white px-4 py-2 rounded text-center font-semibold">
                  STABLE
                </div>
                <p className="text-gray-300">No pending async tasks</p>
              </div>
              <div className="flex items-center gap-4">
                <ArrowRight className="text-yellow-400" size={32} />
                <p className="text-gray-400">Async task starts (setTimeout, Promise, etc.)</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 bg-yellow-600 text-white px-4 py-2 rounded text-center font-semibold">
                  UNSTABLE
                </div>
                <p className="text-gray-300">Tasks are running</p>
              </div>
              <div className="flex items-center gap-4">
                <ArrowRight className="text-green-400" size={32} />
                <p className="text-gray-400">All tasks complete, microtask queue empty</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 bg-green-600 text-white px-4 py-2 rounded text-center font-semibold">
                  STABLE
                </div>
                <p className="text-gray-300">
                  <strong className="text-green-400">onMicrotaskEmpty fires</strong> → ApplicationRef.tick()
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs">
            <div className="text-green-400 mb-3">// NgZone events</div>
            <pre className="text-white">
{`interface NgZone {
  onUnstable: EventEmitter;      // Code enters Angular Zone
  onMicrotaskEmpty: EventEmitter; // No more microtasks (CD trigger!)
  onStable: EventEmitter;         // Last onMicrotaskEmpty, about to exit
  onError: EventEmitter;          // Error occurred
  
  isStable: boolean;              // Current stability state
}`}
            </pre>
          </div>
        </div>
      )
    },

    {
      title: "ApplicationRef and Zone.js",
      subtitle: "The Connection",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs">
            <div className="text-green-400 mb-3">// ApplicationRef constructor</div>
            <pre className="text-white leading-relaxed">
{`@Injectable({ providedIn: 'root' })
export class ApplicationRef {
  constructor(
    private _zone: NgZone,
    private _injector: EnvironmentInjector
  ) {
    // Subscribe to Zone.js events
    this._onMicrotaskEmptySubscription = 
      this._zone.onMicrotaskEmpty.subscribe({
        next: () => {
          // Run change detection inside the zone
          this._zone.run(() => {
            this.tick(); // THE MAGIC HAPPENS HERE!
          });
        }
      });
  }
  
  tick(): void {
    // Check all views
    for (let view of this._views) {
      view.detectChanges();
    }
    
    // Dev mode: check for expression changed errors
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      for (let view of this._views) {
        view.checkNoChanges(); // More on this later!
      }
    }
  }
}`}
            </pre>
          </div>
          <div className="bg-blue-900 bg-opacity-30 border border-blue-500 p-6 rounded-lg">
            <p className="text-xl text-gray-300">
              <strong className="text-blue-400">The Flow:</strong> Zone.js detects async completion 
              → onMicrotaskEmpty emits → ApplicationRef.tick() runs → Change detection for all views
            </p>
          </div>
        </div>
      )
    },

    {
      title: "The Problem with Zone.js",
      subtitle: "Wasteful and Unpredictable",
      content: (
        <div className="space-y-6">
          <div className="bg-red-900 bg-opacity-40 border-2 border-red-500 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4 text-red-400">Zone.js Doesn't Know What Changed</h3>
            <p className="text-xl text-gray-300">
              It only knows <em>something happened</em>, so Angular checks <strong>everything</strong>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Example: Scroll Event</h4>
              <pre className="bg-gray-800 p-4 rounded font-mono text-xs text-white">
{`@Component({
  template: \`<div>{{ counter }}</div>\`
})
export class MyComponent {
  counter = 0;
  
  @HostListener('window:scroll')
  onScroll() {
    // This runs on EVERY scroll event!
    // Zone.js triggers CD even though
    // counter didn't change
  }
}`}
              </pre>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <h4 className="font-semibold text-red-400 mb-4 text-xl">The Cost</h4>
              <ul className="space-y-3 text-gray-300">
                <li>• Change detection runs on every scroll</li>
                <li>• Checks entire component tree</li>
                <li>• Even though nothing changed</li>
                <li>• Performance degradation</li>
                <li>• Can cause jank in complex apps</li>
              </ul>
            </div>
          </div>
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 p-6 rounded-lg">
            <p className="text-xl">
              <AlertTriangle className="inline mr-3 text-yellow-400" size={28} />
              Traditional solution: <code className="text-yellow-400">ngZone.runOutsideAngular()</code> - 
              but this is manual and error-prone
            </p>
          </div>
        </div>
      )
    },

    // Continue with remaining slides in next response...
    // This is getting very long. Would you like me to continue generating more slides
    // or would you prefer a different approach to handle the massive amount of content?
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          if (currentSlide > 0) prevSlide();
          break;
        case 'ArrowRight':
          if (currentSlide < slides.length - 1) nextSlide();
          break;
        case ' ':
          event.preventDefault();
          if (currentSlide < slides.length - 1) nextSlide();
          break;
        case 'Home':
          setCurrentSlide(0);
          break;
        case 'End':
          setCurrentSlide(slides.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, slides.length]);

  return (
    <div className="w-screen h-screen bg-gray-950 text-white overflow-hidden flex items-center justify-center relative">
      {/* Main content */}
      <div className="w-full h-full max-w-[1920px] max-h-[1080px] flex flex-col p-8">
        <div className="mb-4">
          <h1 className="text-4xl font-bold mb-2">{slides[currentSlide].title}</h1>
          <h2 className="text-xl text-gray-400">{slides[currentSlide].subtitle}</h2>
        </div>
        
        <div className="flex-1 bg-gray-900 rounded-lg p-6 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto">
            {slides[currentSlide].content}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>
          <span className="text-gray-400 text-sm font-mono">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
      </div>

      {/* Navigation hint */}
      <div className="absolute bottom-4 right-4 text-gray-600 text-sm">
        ← → Space | Home End
      </div>
    </div>
  );
};

export default PresentationFull;
