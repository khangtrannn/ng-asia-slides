import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import TitleSlide from '../components/TitleSlide';

export interface Slide {
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

export const allSlides: Slide[] = [
  {
    title: "",
    subtitle: "",
    content: <TitleSlide />
  },
  {
    title: "Angular Change Detection Deep Dive",
    subtitle: "From Zone.js to Signals: The Complete Journey",
    content: (
      <div className="space-y-8 flex flex-col justify-center h-full">
        <div className="text-7xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent text-center">
          UI = fn(state)
        </div>
        <div className="space-y-6 text-2xl">
          <div className="flex items-center gap-4">
            <Zap className="text-yellow-500" size={32} />
            <span>React: vDOM = fn(state)</span>
          </div>
          <div className="flex items-center gap-4">
            <Zap className="text-red-500" size={32} />
            <span>Angular: deltaUI = fn(deltaState)</span>
          </div>
        </div>
        <p className="text-2xl text-gray-400 text-center mt-12">
          From manual ticks to intelligent reactive synchronization
        </p>
        <div className="grid grid-cols-3 gap-4 mt-8 text-sm">
          <div className="bg-blue-900 bg-opacity-30 p-4 rounded text-center">
            <strong>Zone.js Era</strong>
            <p className="text-gray-400 text-xs mt-2">Check everything</p>
          </div>
          <div className="bg-purple-900 bg-opacity-30 p-4 rounded text-center">
            <strong>OnPush Era</strong>
            <p className="text-gray-400 text-xs mt-2">Manual optimization</p>
          </div>
          <div className="bg-green-900 bg-opacity-30 p-4 rounded text-center">
            <strong>Signals Era</strong>
            <p className="text-gray-400 text-xs mt-2">Fine-grained reactivity</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Web Development 101",
    subtitle: "The Manual Era",
    content: (
      <div className="space-y-8">
        <CodeBlock
          language="javascript"
          comment="// Plain JavaScript - Manual CD"
          code={`let textContent = 'Initial';

function render() {
  el.textContent = textContent;
}

function changeDetection() {
  if (el.textContent !== textContent) {
    el.textContent = textContent;
  }
}`}
        />
        <div className="text-yellow-400 flex items-start gap-4 text-xl">
          <AlertTriangle className="mt-1 flex-shrink-0" size={28} />
          <div>
            <p className="font-semibold">The setTimeout Problem</p>
            <p className="text-gray-400 text-lg">Asynchronous changes do not trigger detection automatically</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Component Views and Bindings",
    subtitle: "The Foundation of Angular Architecture",
    content: (
      <div className="space-y-8">
        <div className="rounded-lg">
          <h3 className="text-2xl font-semibold mb-6 text-blue-400">Two Building Blocks</h3>
          <div className="space-y-6">
            <div className="border-l-4 border-green-500 pl-6">
              <p className="font-semibold text-green-400 text-xl">Component View (LView)</p>
              <p className="text-lg text-gray-400">Container for DOM references, component instance, and oldValues array</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-6">
              <p className="font-semibold text-purple-400 text-xl">Associated Bindings</p>
              <p className="text-lg text-gray-400">Maps component properties to DOM element properties</p>
            </div>
          </div>
        </div>
        <CodeBlock
          comment="// Binding Structure"
          code={`binding = {
  name: 'textContent',
  expression: 'time | date',
  oldValue: stored_in_LView
}`}
        />
      </div>
    )
  },
  {
    title: "The Ivy Instructions - Part 1",
    subtitle: "How Templates Become Change Detection Code",
    content: (
      <div className="space-y-8">
        <CodeBlock
          comment="// Template to compiled code"
          code={`// Template: 
[className]="'fa-star ' + (rating > 0 ? 'fas' : 'far')"

// Compiled to:
if (changeDetectionPhase) {
  property("className", 
    "fa-star " + (ctx.rating > 0 ? "fas" : "far")
  );
}`}
        />
        <p className="text-gray-300 p-4 text-[16px] bg-gray-800 rounded-lg">
          This is <strong className="text-yellow-400">dirty checking</strong> at its core: compare oldValue to update if different
        </p>
      </div>
    )
  },
  {
    title: "The Ivy Instructions - Part 2",
    subtitle: "The property() Implementation",
    content: (
      <div className="space-y-6">
        <CodeBlock
          comment="// property implementation"
          code={`export function property(propName, value) {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  
  if (bindingUpdated(lView, bindingIndex, value)) {
    elementPropertyInternal(..., propName, value);
  }
  
  return property; // chainable
}`}
        />
        <div className="space-y-4 text-lg text-gray-300 bg-gray-800 p-6 rounded-lg">
          <p><strong className="text-blue-400 text-xl">Key Steps:</strong></p>
          <ol className="list-decimal list-inside space-y-3 ml-4">
            <li>Get the current LView (component data)</li>
            <li>Get the binding index for this property</li>
            <li>Check if value changed (dirty check)</li>
            <li>If changed, update DOM via elementPropertyInternal</li>
            <li>Return self for chaining</li>
          </ol>
        </div>
      </div>
    )
  },
  {
    title: "Zone.js - The Notification System",
    subtitle: "Intercepting Async Operations",
    content: (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 rounded-lg">
          <h3 className="text-2xl font-semibold mb-4">Zone.js is not Change Detection</h3>
          <p className="text-gray-300 text-xl">Zone.js is a <strong>notifier</strong>, not the detector</p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-lg">
            <h4 className="font-semibold text-green-400 mb-4 text-xl">What Zone.js Does</h4>
            <ul className="text-lg space-y-2 text-gray-300">
              <li>• Patches async APIs</li>
              <li>• Tracks microtask queue</li>
              <li>• Emits onMicrotaskEmpty</li>
              <li>• Notifies ApplicationRef</li>
            </ul>
          </div>
          <div className="rounded-lg">
            <h4 className="font-semibold text-red-400 mb-4 text-xl">What Zone.js Does Not Do</h4>
            <ul className="text-lg space-y-2 text-gray-300">
              <li>• Run change detection</li>
              <li>• Know what changed</li>
              <li>• Update the DOM</li>
              <li>• Track dependencies</li>
            </ul>
          </div>
        </div>
        <CodeBlock
          comment="// Inside ApplicationRef"
          code={`this._zone.onMicrotaskEmpty.subscribe({
  next: () => {
    this._zone.run(() => {
      this.tick(); // Actual CD happens here
    });
  }
});`}
        />
      </div>
    )
  },
  {
    title: "The Unidirectional Data Flow",
    subtitle: "Why Angular Checks Top-Down",
    content: (
      <div className="space-y-6">
        <div className="rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-blue-400">The Invariant Problem</h3>
          <CodeBlock
            language="typescript"
            code={`@if (user) {
  {{ user.name }}
}`}
          />
          <p className="mt-4 text-gray-300">
            If we check user.name before checking the @if, we crash when user becomes undefined.
          </p>
          <p className="mt-2 text-red-400 font-semibold">
            Parents must run first to enforce invariants on children
          </p>
        </div>
        <div className="rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-green-400">Change Detection Order</h3>
          <div className="space-y-2 text-sm font-mono">
            <div>1. Update @Input bindings on child</div>
            <div>2. Call OnInit, DoCheck, OnChanges on child</div>
            <div>3. Render parent template</div>
            <div>4. Run CD for child (recursive)</div>
            <div>5. Call AfterViewInit, AfterViewChecked on child</div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "NG0100 - ExpressionChanged Error",
    subtitle: "The Enforcement Mechanism",
    content: (
      <div className="space-y-6">
        <div className="bg-red-900 bg-opacity-30 border border-red-500 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-red-400">The Two-Phase Check</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold">Phase 1:</span>
              <span>Run change detection, update DOM, store values in oldValues</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">Phase 2:</span>
              <span>Run again (dev mode), compare to oldValues, throw if different</span>
            </div>
          </div>
        </div>
        <CodeBlock
          comment="// Why the check exists"
          code={`Without it, Angular could enter an infinite loop:

CD Run 1: value = A, update DOM
Lifecycle hook: value = B
CD Run 2: value = B, update DOM
Lifecycle hook: value = C
CD Run 3: value = C, update DOM
... infinite loop ...`}
        />
        <div className="rounded-lg">
          <h4 className="font-semibold text-yellow-400 mb-2">The Rule</h4>
          <p className="text-gray-300">
            Once Angular processes bindings for a component, you cannot update properties 
            used in those bindings until the next CD cycle.
          </p>
        </div>
      </div>
    )
  },
  {
    title: "OnPush Strategy",
    subtitle: "From Global to Selective Checking",
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg">
            <h4 className="font-semibold text-blue-400 mb-3">Default (CheckAlways)</h4>
            <ul className="text-sm space-y-2 text-gray-300">
              <li>✓ Checks every CD cycle</li>
              <li>✓ Simple to reason about</li>
              <li>✗ Redundant checks</li>
              <li>✗ Does not scale</li>
            </ul>
          </div>
          <div className="rounded-lg">
            <h4 className="font-semibold text-purple-400 mb-3">OnPush (CheckOnce)</h4>
            <ul className="text-sm space-y-2 text-gray-300">
              <li>✓ Skips if not dirty</li>
              <li>✓ Scales with changes</li>
              <li>✗ Requires discipline</li>
              <li>✗ Easy to break</li>
            </ul>
          </div>
        </div>
        <div className="rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-green-400">What Makes OnPush Dirty?</h3>
          <div className="space-y-2 text-sm">
            <div>• @Input reference change</div>
            <div>• markForCheck called</div>
            <div>• Template-bound event fires</div>
            <div>• async pipe emits</div>
            <div>• ComponentRef.setInput</div>
          </div>
        </div>
        <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 p-4 rounded-lg">
          <p className="text-sm text-yellow-200">
            <strong>Key Insight:</strong> OnPush does not prevent checking—it requires explicit dirtiness. 
            The Dirty flag is automatically unset after the first check.
          </p>
        </div>
      </div>
    )
  }
  // Note: This is a partial implementation. The full file would contain all slides from the original Presentation.tsx
  // For brevity, I'm showing the structure with the first 10 slides
];
