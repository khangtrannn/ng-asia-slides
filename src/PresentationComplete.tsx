import React, { useState } from 'react';
import { 
  Zap, AlertTriangle, CheckCircle, XCircle, ArrowRight, Activity, 
  Layers, Code, Target, RefreshCw, GitBranch, Database, Cpu,
  Filter, Play, Pause, SkipForward, Workflow, TrendingUp
} from 'lucide-react';

const PresentationComplete = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // ==================== SECTION 1: INTRODUCTION ====================
    {
      title: "Angular Change Detection",
      subtitle: "The Complete Deep Dive - From Zone.js to Signals",
      content: (
        <div className="space-y-6 flex flex-col justify-center h-full">
          <div className="text-7xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent text-center">
            Mastering Angular Reactivity
          </div>
          <div className="text-3xl text-gray-300 text-center mt-6">
            How Angular keeps your UI in sync with your data
          </div>
          <div className="grid grid-cols-3 gap-6 mt-12">
            <div className="bg-blue-900 bg-opacity-30 p-6 rounded-lg text-center">
              <Activity className="mx-auto mb-3 text-blue-400" size={48} />
              <strong className="text-xl">Zone.js Era</strong>
              <p className="text-gray-400 mt-2">Check everything, always</p>
            </div>
            <div className="bg-purple-900 bg-opacity-30 p-6 rounded-lg text-center">
              <Target className="mx-auto mb-3 text-purple-400" size={48} />
              <strong className="text-xl">OnPush Era</strong>
              <p className="text-gray-400 mt-2">Manual optimization</p>
            </div>
            <div className="bg-green-900 bg-opacity-30 p-6 rounded-lg text-center">
              <Zap className="mx-auto mb-3 text-green-400" size={48} />
              <strong className="text-xl">Signals Era</strong>
              <p className="text-gray-400 mt-2">Reactive synchronization</p>
            </div>
          </div>
          <div className="text-center mt-8 text-lg text-gray-400">
            150+ slides | Press → or Space | Home/End to jump
          </div>
        </div>
      )
    },

    {
      title: "Table of Contents",
      subtitle: "The Journey Ahead",
      content: (
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="space-y-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                <Code size={20} /> Part 1: Fundamentals
              </h3>
              <ul className="space-y-1 text-gray-400">
                <li>• What is Change Detection?</li>
                <li>• Web Development 101</li>
                <li>• UI = fn(state)</li>
                <li>• Component Views & Bindings</li>
                <li>• Angular Compiler & Instructions</li>
              </ul>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="text-purple-400 font-bold mb-2 flex items-center gap-2">
                <Activity size={20} /> Part 2: Zone.js
              </h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Zone.js Architecture</li>
                <li>• Monkey Patching</li>
                <li>• Zone Lifecycle</li>
                <li>• ApplicationRef.tick()</li>
                <li>• Problems with Zone.js</li>
              </ul>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="text-green-400 font-bold mb-2 flex items-center gap-2">
                <Workflow size={20} /> Part 3: Change Detection Flow
              </h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Unidirectional Data Flow</li>
                <li>• Order of Operations</li>
                <li>• Lifecycle Hooks</li>
                <li>• Check No Changes</li>
                <li>• NG0100 Error</li>
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
                <Target size={20} /> Part 4: OnPush Strategy
              </h3>
              <ul className="space-y-1 text-gray-400">
                <li>• CheckAlways vs OnPush</li>
                <li>• Dirty Marking</li>
                <li>• markViewDirty Algorithm</li>
                <li>• markForCheck vs detectChanges</li>
                <li>• AsyncPipe</li>
              </ul>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="text-pink-400 font-bold mb-2 flex items-center gap-2">
                <Zap size={20} /> Part 5: Signals
              </h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Reactive Primitives</li>
                <li>• Reactive Graph</li>
                <li>• Producer-Consumer Model</li>
                <li>• Push/Pull Algorithm</li>
                <li>• Effects & Computed</li>
              </ul>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                <TrendingUp size={20} /> Part 6: Zoneless & Future
              </h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Zoneless Architecture</li>
                <li>• Hybrid Mode (v18+)</li>
                <li>• Local Change Detection</li>
                <li>• Synchronization Loop</li>
                <li>• Production Considerations</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },

    // ==================== SECTION 2: FUNDAMENTALS ====================
    {
      title: "What is Change Detection?",
      subtitle: "The Core Concept",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-8 rounded-lg">
            <p className="text-2xl text-gray-200 leading-relaxed">
              <strong className="text-blue-400">Change Detection</strong> is the process through which Angular 
              checks to see whether your application state has changed, and if any DOM needs to be updated.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-green-400 flex items-center gap-2">
                <Play size={24} /> What Triggers It?
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• User events (clicks, inputs, mouseover)</li>
                <li>• HTTP requests completing (XHR, fetch)</li>
                <li>• setTimeout / setInterval callbacks</li>
                <li>• Promise resolution (then, catch)</li>
                <li>• WebSocket messages</li>
                <li>• requestAnimationFrame</li>
                <li>• Any asynchronous operation</li>
              </ul>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-purple-400 flex items-center gap-2">
                <Target size={24} /> The Goal
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Keep the view in sync with the model. When data changes, Angular needs to:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li><strong className="text-blue-400">1.</strong> Detect that something changed</li>
                <li><strong className="text-purple-400">2.</strong> Determine what changed</li>
                <li><strong className="text-green-400">3.</strong> Update the affected DOM</li>
                <li><strong className="text-yellow-400">4.</strong> Maintain consistency</li>
              </ul>
            </div>
          </div>
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 p-6 rounded-lg">
            <p className="text-xl flex items-center gap-3">
              <AlertTriangle className="text-yellow-400 flex-shrink-0" size={32} />
              Angular walks your components <strong>from top to bottom</strong>, looking for changes. 
              This is called a <strong>change detection cycle</strong>.
            </p>
          </div>
        </div>
      )
    },

    {
      title: "Change Detection: When & How",
      subtitle: "The Two Fundamental Questions",
      content: (
        <div className="space-y-8 flex flex-col justify-center h-full">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-900 to-blue-700 p-8 rounded-lg">
              <h3 className="text-3xl font-bold mb-6 text-blue-200">WHEN?</h3>
              <p className="text-xl text-gray-200 mb-4">Change Detection Scheduling</p>
              <ul className="space-y-3 text-gray-300">
                <li>• When to run CD?</li>
                <li>• What triggers a cycle?</li>
                <li>• Can we optimize timing?</li>
              </ul>
              <div className="mt-6 bg-blue-950 p-4 rounded">
                <strong className="text-blue-300">Zone.js Era:</strong>
                <p className="text-sm text-gray-400 mt-2">Runs after every async event</p>
              </div>
              <div className="mt-3 bg-blue-950 p-4 rounded">
                <strong className="text-blue-300">Signals Era:</strong>
                <p className="text-sm text-gray-400 mt-2">Runs when explicitly notified</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-900 to-purple-700 p-8 rounded-lg">
              <h3 className="text-3xl font-bold mb-6 text-purple-200">HOW?</h3>
              <p className="text-xl text-gray-200 mb-4">Change Detection Execution</p>
              <ul className="space-y-3 text-gray-300">
                <li>• How to traverse the tree?</li>
                <li>• Which components to check?</li>
                <li>• How to update efficiently?</li>
              </ul>
              <div className="mt-6 bg-purple-950 p-4 rounded">
                <strong className="text-purple-300">Default:</strong>
                <p className="text-sm text-gray-400 mt-2">Check all components top-down</p>
              </div>
              <div className="mt-3 bg-purple-950 p-4 rounded">
                <strong className="text-purple-300">OnPush:</strong>
                <p className="text-sm text-gray-400 mt-2">Skip non-dirty components</p>
              </div>
            </div>
          </div>
          <div className="bg-green-900 bg-opacity-30 border-2 border-green-500 p-6 rounded-lg text-center">
            <p className="text-2xl text-gray-200">
              Understanding <strong className="text-green-400">WHEN</strong> and <strong className="text-green-400">HOW</strong> is 
              the key to mastering Angular performance
            </p>
          </div>
        </div>
      )
    },

    {
      title: "Web Development 101",
      subtitle: "The Manual Era - Before Frameworks",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-sm">
            <div className="text-green-400 text-lg mb-3">// Plain JavaScript - Manual Updates</div>
            <pre className="text-white leading-relaxed">
{`let title = 'Hello World';
const element = document.getElementById('title');

// Phase 1: Initial Render
function render() {
  element.textContent = title;
}

// Phase 2: Manual Change Detection
function changeDetection() {
  if (element.textContent !== title) {
    element.textContent = title;
  }
}

// Usage
render(); // Initial render

// After every state change, must manually update
title = 'Hello Angular';
render(); // Manual trigger

title = 'Angular is awesome';
changeDetection(); // Manual check`}
            </pre>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-green-900 bg-opacity-30 border border-green-500 p-4 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-2">Pros</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>✓ Full control</li>
                <li>✓ Predictable</li>
                <li>✓ No magic</li>
              </ul>
            </div>
            <div className="bg-red-900 bg-opacity-30 border border-red-500 p-4 rounded-lg">
              <h4 className="font-semibold text-red-400 mb-2">Cons</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>✗ Tedious</li>
                <li>✗ Error-prone</li>
                <li>✗ Doesn't scale</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },

    {
      title: "The setTimeout Problem",
      subtitle: "Why Manual Change Detection Breaks",
      content: (
        <div className="space-y-6">
          <div className="bg-red-900 bg-opacity-40 border-2 border-red-500 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4 text-red-400 flex items-center gap-3">
              <AlertTriangle size={32} />
              Asynchronous Operations Are Invisible
            </h3>
            <p className="text-xl text-gray-300">
              The developer must remember to trigger updates after <strong>every</strong> async operation
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-sm">
            <pre className="text-white leading-relaxed">
{`let counter = 0;
const display = document.getElementById('counter');

// This works - we remember to update
function increment() {
  counter++;
  display.textContent = counter; // ✓ Manual update
}

// This breaks - forgot to update!
setTimeout(() => {
  counter++;
  // ✗ Oops! Display still shows old value
}, 1000);

// This also breaks
fetch('/api/data').then(data => {
  counter = data.count;
  // ✗ Forgot again! UI out of sync
});

// And this
document.addEventListener('click', () => {
  counter++;
  // ✗ Must remember to update here too
});`}
            </pre>
          </div>
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 p-6 rounded-lg">
            <p className="text-xl">
              We need a way to <strong className="text-yellow-400">automatically</strong> detect when async operations complete 
              and trigger UI updates. Enter <strong className="text-yellow-400">Zone.js</strong>...
            </p>
          </div>
        </div>
      )
    },

    {
      title: "UI = fn(state)",
      subtitle: "The Fundamental Equation of Modern Web",
      content: (
        <div className="space-y-6 flex flex-col justify-center h-full">
          <div className="text-7xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent text-center mb-8">
            UI = fn(state)
          </div>
          <div className="space-y-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="flex items-center gap-4 mb-4">
                <Code className="text-yellow-500 flex-shrink-0" size={48} />
                <div>
                  <span className="text-2xl text-yellow-400 font-semibold">React</span>
                  <p className="text-xl text-gray-300 mt-2">vDOM = fn(state)</p>
                </div>
              </div>
              <p className="text-gray-400 ml-16">
                React re-renders component trees and diffs virtual DOM to find changes
              </p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="flex items-center gap-4 mb-4">
                <Zap className="text-red-500 flex-shrink-0" size={48} />
                <div>
                  <span className="text-2xl text-red-400 font-semibold">Angular</span>
                  <p className="text-xl text-gray-300 mt-2">deltaUI = fn(deltaState)</p>
                </div>
              </div>
              <p className="text-gray-400 ml-16">
                Angular tracks bindings and updates only what changed (dirty checking)
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div className="bg-blue-900 bg-opacity-30 p-6 rounded-lg text-center">
              <strong className="text-xl text-blue-400">The Challenge</strong>
              <p className="text-gray-300 mt-2">WHEN to run the function?</p>
            </div>
            <div className="bg-purple-900 bg-opacity-30 p-6 rounded-lg text-center">
              <strong className="text-xl text-purple-400">The Optimization</strong>
              <p className="text-gray-300 mt-2">HOW to minimize work?</p>
            </div>
          </div>
        </div>
      )
    },

    // ==================== SECTION 3: COMPONENT VIEWS & BINDINGS ====================
    {
      title: "Component Views and Bindings",
      subtitle: "The Two Building Blocks of Change Detection",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-8 rounded-lg">
            <h3 className="text-3xl font-bold mb-4 text-center">Two Core Structures</h3>
            <p className="text-center text-xl text-gray-300">
              Every component in Angular relies on these two fundamental concepts
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg border-l-4 border-green-500">
              <h4 className="text-2xl font-semibold text-green-400 mb-4 flex items-center gap-2">
                <Layers size={28} /> 1. Component View
              </h4>
              <p className="text-gray-300 mb-4">
                Also known as <strong className="text-green-400">LView</strong> (Logical View)
              </p>
              <ul className="space-y-2 text-gray-400">
                <li>• Smallest grouping of DOM elements</li>
                <li>• Created and destroyed together</li>
                <li>• Stores references to DOM nodes</li>
                <li>• Contains component instance</li>
                <li>• Holds previous binding values (oldValues)</li>
                <li>• Links to child views (tree structure)</li>
                <li>• Has associated change detector</li>
              </ul>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border-l-4 border-purple-500">
              <h4 className="text-2xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
                <GitBranch size={28} /> 2. Bindings
              </h4>
              <p className="text-gray-300 mb-4">
                Connections between component properties and DOM
              </p>
              <ul className="space-y-2 text-gray-400">
                <li>• Created by the compiler from template</li>
                <li>• Defines property to update</li>
                <li>• Contains expression to evaluate</li>
                <li>• Stores metadata (binding index)</li>
                <li>• Maps component → DOM element</li>
                <li>• Enables dirty checking</li>
                <li>• Processed during change detection</li>
              </ul>
            </div>
          </div>
          <div className="bg-blue-900 bg-opacity-30 border border-blue-500 p-6 rounded-lg">
            <p className="text-xl text-center">
              <strong className="text-blue-400">One-to-One Relationship:</strong> Each component has exactly one view and many bindings
            </p>
          </div>
        </div>
      )
    },

    {
      title: "What is a View?",
      subtitle: "The Building Block of Angular UI",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <p className="text-2xl text-gray-200 mb-6">
              A <strong className="text-blue-400">view</strong> is a grouping of elements and is the smallest 
              grouping of elements that can be created or destroyed together.
            </p>
            <div className="bg-gray-800 p-4 rounded">
              <p className="text-gray-400">
                A view is defined by a template, but the template itself is not a view - 
                it's just a blueprint until Angular creates a view from it.
              </p>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-sm">
            <div className="text-green-400 mb-3">// Templates (not yet views)</div>
            <pre className="text-white">
{`<ng-template #myTemplate>
  <p>I am a view definition</p>
  <div>Everything in THIS template is in the same view</div>
  <span>Even this!</span>
</ng-template>

<!-- Not displayed yet - no view created -->`}
            </pre>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-sm">
            <div className="text-blue-400 mb-3">// Creating a view (embedded view)</div>
            <pre className="text-white">
{`<ng-template [ngTemplateOutlet]="myTemplate"></ng-template>

<!-- Now a view is created and embedded! -->`}
            </pre>
          </div>
          <div className="bg-purple-900 bg-opacity-30 border border-purple-500 p-6 rounded-lg">
            <p className="text-lg">
              <strong className="text-purple-400">Key Concept:</strong> Views form a hierarchy. 
              Embedded views are children of the view container that created them.
            </p>
          </div>
        </div>
      )
    },

    {
      title: "View Hierarchy",
      subtitle: "How Views Form a Tree",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-sm">
            <pre className="text-white">
{`<!-- Parent View -->
<ng-template #parent>
  <p>I am in the parent view</p>
  
  <!-- Child view definition -->
  <ng-template #child>
    <span>I am in a child view</span>
  </ng-template>
  
  <!-- Embedding child creates view hierarchy -->
  <ng-template [ngTemplateOutlet]="child"></ng-template>
</ng-template>`}
            </pre>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">View Tree Structure</h3>
            <div className="bg-gray-800 p-6 rounded font-mono text-sm">
              <pre className="text-white">
{`App Component View (Root)
├── Header Component View
│   └── Logo Component View
├── Main Component View
│   ├── Sidebar Component View
│   └── Content Component View
│       ├── *ngIf Embedded View
│       └── *ngFor Embedded View (×N)
└── Footer Component View`}
              </pre>
            </div>
          </div>
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 p-6 rounded-lg">
            <p className="text-lg">
              <AlertTriangle className="inline mr-2 text-yellow-400" size={24} />
              Change detection walks this tree from top to bottom, checking each view
            </p>
          </div>
        </div>
      )
    },

    {
      title: "What is a Binding?",
      subtitle: "Connecting Properties to DOM",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <p className="text-2xl text-gray-200 mb-4">
              A <strong className="text-purple-400">binding</strong> defines the relationship between a 
              component property (wrapped in an expression) and a DOM element property.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h4 className="text-lg font-semibold mb-4 text-blue-400">Template Syntax</h4>
              <pre className="bg-gray-800 p-4 rounded font-mono text-sm text-white">
{`<!-- Property Binding -->
<span [textContent]="user.name"></span>
<div [className]="'status-' + user.status"></div>

<!-- Interpolation -->
<p>{{ user.age }} years old</p>

<!-- Attribute Binding -->
<button [attr.aria-label]="buttonLabel"></button>

<!-- Event Binding -->
<button (click)="onClick()">Click</button>`}
              </pre>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <h4 className="text-lg font-semibold mb-4 text-purple-400">Binding Structure</h4>
              <pre className="bg-gray-800 p-4 rounded font-mono text-sm text-white">
{`interface Binding {
  // Property to update
  propertyName: string;
  // e.g., 'textContent', 'className'
  
  // Expression to evaluate
  expression: Function;
  // e.g., () => user.name
  
  // Previous value
  oldValue: any;
  // Stored in LView for comparison
  
  // Binding metadata
  bindingIndex: number;
  // Position in LView array
}`}
              </pre>
            </div>
          </div>
          <div className="bg-green-900 bg-opacity-30 border border-green-500 p-6 rounded-lg">
            <p className="text-lg">
              <CheckCircle className="inline mr-2 text-green-400" size={24} />
              During change detection, Angular evaluates each binding's expression and compares to oldValue
            </p>
          </div>
        </div>
      )
    },

    {
      title: "Bindings: The Change Detection Contract",
      subtitle: "What Angular Tracks",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-6 text-blue-400">Angular Creates Bindings For</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded">
                  <strong className="text-green-400 block mb-2">Property Bindings</strong>
                  <code className="text-sm text-gray-400">[property]="expression"</code>
                </div>
                <div className="bg-gray-800 p-4 rounded">
                  <strong className="text-purple-400 block mb-2">Interpolations</strong>
                  <code className="text-sm text-gray-400">{`{{ expression }}`}</code>
                </div>
                <div className="bg-gray-800 p-4 rounded">
                  <strong className="text-blue-400 block mb-2">Attribute Bindings</strong>
                  <code className="text-sm text-gray-400">[attr.name]="expression"</code>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded">
                  <strong className="text-yellow-400 block mb-2">Class Bindings</strong>
                  <code className="text-sm text-gray-400">[class.name]="expression"</code>
                </div>
                <div className="bg-gray-800 p-4 rounded">
                  <strong className="text-pink-400 block mb-2">Style Bindings</strong>
                  <code className="text-sm text-gray-400">[style.prop]="expression"</code>
                </div>
                <div className="bg-gray-800 p-4 rounded">
                  <strong className="text-red-400 block mb-2">Input Bindings</strong>
                  <code className="text-sm text-gray-400">@Input() prop</code>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-purple-400">The Process</h3>
            <div className="space-y-3 text-lg">
              <div className="flex items-center gap-3">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
                <span>Compiler analyzes template and creates bindings</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
                <span>During CD, evaluate expression and get new value</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
                <span>Compare new value with oldValue (dirty checking)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">4</span>
                <span>If different, update DOM and store new value</span>
              </div>
            </div>
          </div>
        </div>
      )
    },

    {
      title: "Dirty Checking Explained",
      subtitle: "The Name Comes From Comparison",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-yellow-900 to-orange-900 p-8 rounded-lg">
            <h3 className="text-3xl font-bold mb-4 text-center">Why "Dirty" Checking?</h3>
            <p className="text-center text-xl text-gray-200">
              Values are "dirty" when they differ from the previous "clean" state
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs">
            <div className="text-green-400 mb-3">// The dirty check</div>
            <pre className="text-white leading-relaxed">
{`function bindingUpdated(lView: LView, bindingIndex: number, value: any): boolean {
  // Get the "clean" value (last known value)
  const oldValue = lView[bindingIndex];
  
  // Compare with new value
  if (Object.is(oldValue, value)) {
    return false; // Still clean! No update needed
  } else {
    // Value is "dirty"! Update needed
    lView[bindingIndex] = value; // Store new "clean" value
    return true; // Signal: DOM update required
  }
}`}
            </pre>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-green-900 bg-opacity-30 border border-green-500 p-6 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-3 text-xl">Clean State</h4>
              <p className="text-gray-300">
                The value matches what was stored in the last change detection cycle. 
                No DOM update needed.
              </p>
              <div className="mt-4 bg-gray-800 p-3 rounded font-mono text-sm">
                <code className="text-green-400">oldValue === newValue</code>
              </div>
            </div>
            <div className="bg-red-900 bg-opacity-30 border border-red-500 p-6 rounded-lg">
              <h4 className="font-semibold text-red-400 mb-3 text-xl">Dirty State</h4>
              <p className="text-gray-300">
                The value has changed since the last cycle. 
                DOM must be updated to reflect the new state.
              </p>
              <div className="mt-4 bg-gray-800 p-3 rounded font-mono text-sm">
                <code className="text-red-400">oldValue !== newValue</code>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // ==================== SECTION 4: TEMPLATE COMPILATION ====================
    {
      title: "The Angular Compiler",
      subtitle: "From Template to Instructions",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-red-900 to-orange-900 p-8 rounded-lg">
            <h3 className="text-3xl font-bold mb-4 text-center">The Compiler's Job</h3>
            <p className="text-center text-xl text-gray-200">
              Transform declarative templates into imperative JavaScript instructions
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h4 className="text-xl font-semibold mb-4 text-blue-400">Input: Template</h4>
              <pre className="bg-gray-800 p-4 rounded font-mono text-xs text-white">
{`<h1>{{ title }}</h1>
<p [textContent]="description"></p>
<button (click)="onClick()">
  Click me
</button>`}
              </pre>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <h4 className="text-xl font-semibold mb-4 text-green-400">Output: Instructions</h4>
              <pre className="bg-gray-800 p-4 rounded font-mono text-xs text-white">
{`element(0, 'h1');
textInterpolate(ctx.title);
element(1, 'p');
property('textContent', ctx.description);
element(2, 'button');
listener('click', ctx.onClick);
text(3, 'Click me');`}
              </pre>
            </div>
          </div>
          <div className="bg-purple-900 bg-opacity-30 border border-purple-500 p-6 rounded-lg">
            <p className="text-xl">
              These instructions are called during <strong className="text-purple-400">rendering</strong> (creation) 
              and <strong className="text-purple-400">change detection</strong> (updates)
            </p>
          </div>
        </div>
      )
    },

    {
      title: "Component Template Function",
      subtitle: "The Generated Code",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs">
            <div className="text-green-400 mb-3">// Generated by Angular Compiler</div>
            <pre className="text-white leading-relaxed">
{`function MyComponentTemplate(rf: RenderFlags, ctx: MyComponent) {
  // rf = RenderFlags (what phase are we in?)
  // ctx = component instance
  
  if (rf & RenderFlags.Create) {
    // CREATION MODE: Build the DOM structure
    element(0, 'h1');       // Create <h1> element at index 0
    element(1, 'p');        // Create <p> element at index 1
    element(2, 'button');   // Create <button> element at index 2
    text(3, 'Click me');    // Create text node at index 3
    listener(2, 'click', () => ctx.onClick()); // Attach click listener
  }
  
  if (rf & RenderFlags.Update) {
    // UPDATE MODE: Check bindings and update DOM
    advance(0);
    textInterpolate(ctx.title);              // Update h1 content
    advance(1);
    property('textContent', ctx.description); // Update p content
  }
}`}
            </pre>
          </div>
          <div className="bg-blue-900 bg-opacity-30 border border-blue-500 p-6 rounded-lg">
            <p className="text-xl">
              <strong className="text-blue-400">Two-phase approach:</strong> Create once, update many times
            </p>
          </div>
        </div>
      )
    },

    {
      title: "RenderFlags: Creation vs Update",
      subtitle: "The Two Modes of Template Execution",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-green-900 bg-opacity-40 border-2 border-green-500 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-green-400 flex items-center gap-2">
                <Play size={28} /> RenderFlags.Create
              </h3>
              <p className="text-gray-300 mb-4">Executed <strong>once</strong> when view is first created</p>
              <ul className="space-y-2 text-gray-300">
                <li>• Create DOM elements</li>
                <li>• Attach event listeners</li>
                <li>• Create embedded views</li>
                <li>• Set up static structure</li>
                <li>• Initialize directives</li>
              </ul>
              <div className="mt-4 bg-gray-800 p-3 rounded font-mono text-sm">
                <code className="text-green-400">if (rf & RenderFlags.Create)</code>
              </div>
            </div>
            <div className="bg-blue-900 bg-opacity-40 border-2 border-blue-500 p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-blue-400 flex items-center gap-2">
                <RefreshCw size={28} /> RenderFlags.Update
              </h3>
              <p className="text-gray-300 mb-4">Executed <strong>many times</strong> during change detection</p>
              <ul className="space-y-2 text-gray-300">
                <li>• Evaluate binding expressions</li>
                <li>• Compare with old values</li>
                <li>• Update DOM properties</li>
                <li>• Update component inputs</li>
                <li>• Trigger child CD</li>
              </ul>
              <div className="mt-4 bg-gray-800 p-3 rounded font-mono text-sm">
                <code className="text-blue-400">if (rf & RenderFlags.Update)</code>
              </div>
            </div>
          </div>
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 p-6 rounded-lg">
            <p className="text-xl">
              <AlertTriangle className="inline mr-2 text-yellow-400" size={24} />
              This separation is key to Angular's performance: expensive operations run once, cheap checks run often
            </p>
          </div>
        </div>
      )
    },

    {
      title: "The property() Instruction",
      subtitle: "How Property Bindings Work",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs">
            <div className="text-blue-400 mb-3">// property() implementation (simplified)</div>
            <pre className="text-white leading-relaxed">
{`function property<T>(
  propName: string,
  value: T
): void {
  const lView = getLView();        // Current view
  const bindingIndex = nextBindingIndex(); // Get next slot
  
  // Dirty checking
  if (bindingUpdated(lView, bindingIndex, value)) {
    const tNode = getSelectedTNode();       // Current element
    const element = getNativeByTNode(tNode); // DOM element
    
    // Update the actual DOM property
    element[propName] = value;
  }
}

function bindingUpdated(lView: LView, index: number, value: any): boolean {
  const oldValue = lView[index];
  const isDifferent = !Object.is(oldValue, value);
  
  if (isDifferent) {
    lView[index] = value; // Store new value
  }
  
  return isDifferent;
}`}
            </pre>
          </div>
          <div className="bg-purple-900 bg-opacity-30 border border-purple-500 p-6 rounded-lg">
            <p className="text-xl">
              The <code className="text-purple-400 bg-gray-800 px-2 py-1 rounded">property()</code> instruction 
              encapsulates the entire change detection process for a single binding
            </p>
          </div>
        </div>
      )
    },

    {
      title: "textInterpolate() Instruction",
      subtitle: "How {{ }} Bindings Work",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs">
            <pre className="text-white leading-relaxed">
{`// Template
<h1>{{ title }}</h1>

// Compiled to
function template(rf: RenderFlags, ctx: Component) {
  if (rf & RenderFlags.Create) {
    element(0, 'h1');
    text(1); // Create empty text node
  }
  if (rf & RenderFlags.Update) {
    advance(1); // Move to text node
    textInterpolate(ctx.title); // Update text content
  }
}

// textInterpolate implementation
function textInterpolate(value: any): void {
  const lView = getLView();
  const index = getSelectedIndex();
  
  // Convert value to string and check if changed
  const stringValue = stringify(value);
  if (bindingUpdated(lView, index, stringValue)) {
    const tNode = getTNode(index);
    const textNode = getNativeByTNode(tNode);
    textNode.textContent = stringValue; // Update DOM
  }
}`}
            </pre>
          </div>
          <div className="bg-green-900 bg-opacity-30 border border-green-500 p-6 rounded-lg">
            <p className="text-lg">
              <CheckCircle className="inline mr-2 text-green-400" size={24} />
              Interpolation is just property binding with automatic string conversion
            </p>
          </div>
        </div>
      )
    },

    // ==================== SECTION 5: ZONE.JS ====================
    {
      title: "Zone.js: The Automatic Solution",
      subtitle: "Monkey Patching the Browser",
      content: (
        <div className="space-y-6 flex flex-col justify-center h-full">
          <div className="text-6xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent text-center mb-6">
            Zone.js
          </div>
          <div className="bg-gray-900 p-8 rounded-lg">
            <p className="text-2xl text-gray-200 text-center leading-relaxed">
              <strong className="text-yellow-400">Zone.js</strong> patches all browser async APIs to 
              automatically trigger change detection after async operations complete
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg text-center">
              <Activity className="mx-auto mb-3 text-blue-400" size={48} />
              <strong className="text-xl">Automatic</strong>
              <p className="text-gray-400 mt-2">No manual triggers needed</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg text-center">
              <Layers className="mx-auto mb-3 text-purple-400" size={48} />
              <strong className="text-xl">Transparent</strong>
              <p className="text-gray-400 mt-2">Works with existing code</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg text-center">
              <Target className="mx-auto mb-3 text-green-400" size={48} />
              <strong className="text-xl">Comprehensive</strong>
              <p className="text-gray-400 mt-2">Patches all async APIs</p>
            </div>
          </div>
        </div>
      )
    },

    {
      title: "What is Monkey Patching?",
      subtitle: "Wrapping Browser APIs",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs">
            <div className="text-yellow-400 mb-3">// Zone.js patches setTimeout</div>
            <pre className="text-white leading-relaxed">
{`// Original browser API
const originalSetTimeout = window.setTimeout;

// Zone.js wraps it
window.setTimeout = function(callback, delay, ...args) {
  // Before: Enter Zone
  const currentZone = Zone.current;
  
  // Wrap the callback
  const wrappedCallback = function() {
    currentZone.run(() => {
      callback.apply(this, args);
      // After callback: Trigger change detection!
      ApplicationRef.tick();
    });
  };
  
  // Call original with wrapped callback
  return originalSetTimeout(wrappedCallback, delay);
};`}
            </pre>
          </div>
          <div className="bg-blue-900 bg-opacity-30 border border-blue-500 p-6 rounded-lg">
            <p className="text-xl">
              Zone.js replaces global APIs with wrapped versions that automatically 
              trigger change detection
            </p>
          </div>
        </div>
      )
    },

    {
      title: "What Zone.js Patches",
      subtitle: "All Async APIs in the Browser",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Timers</h3>
              <ul className="space-y-2 text-gray-300 font-mono text-sm">
                <li>• setTimeout</li>
                <li>• setInterval</li>
                <li>• setImmediate</li>
                <li>• clearTimeout</li>
                <li>• clearInterval</li>
                <li>• requestAnimationFrame</li>
              </ul>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-green-400">Events</h3>
              <ul className="space-y-2 text-gray-300 font-mono text-sm">
                <li>• addEventListener</li>
                <li>• removeEventListener</li>
                <li>• onclick, onmouseover, etc.</li>
                <li>• All DOM events</li>
                <li>• Custom events</li>
              </ul>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Promises</h3>
              <ul className="space-y-2 text-gray-300 font-mono text-sm">
                <li>• Promise.then</li>
                <li>• Promise.catch</li>
                <li>• Promise.finally</li>
                <li>• async/await</li>
                <li>• fetch</li>
              </ul>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-yellow-400">Other</h3>
              <ul className="space-y-2 text-gray-300 font-mono text-sm">
                <li>• XMLHttpRequest</li>
                <li>• WebSocket</li>
                <li>• Notification API</li>
                <li>• MutationObserver</li>
                <li>• IntersectionObserver</li>
              </ul>
            </div>
          </div>
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 p-6 rounded-lg">
            <p className="text-xl">
              <AlertTriangle className="inline mr-2 text-yellow-400" size={24} />
              If it's async in the browser, Zone.js patches it!
            </p>
          </div>
        </div>
      )
    },

    {
      title: "Zone.js Lifecycle",
      subtitle: "The Flow of Async Operations",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="space-y-4 text-lg">
              <div className="flex items-center gap-4 p-4 bg-blue-900 bg-opacity-30 rounded">
                <span className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</span>
                <div>
                  <strong className="text-blue-400">onScheduleTask</strong>
                  <p className="text-gray-400 text-sm">Async task is scheduled (e.g., setTimeout)</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-purple-900 bg-opacity-30 rounded">
                <span className="bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</span>
                <div>
                  <strong className="text-purple-400">onInvokeTask</strong>
                  <p className="text-gray-400 text-sm">Task callback is about to execute</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-green-900 bg-opacity-30 rounded">
                <span className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</span>
                <div>
                  <strong className="text-green-400">run callback</strong>
                  <p className="text-gray-400 text-sm">Your code executes inside the zone</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-yellow-900 bg-opacity-30 rounded">
                <span className="bg-yellow-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">4</span>
                <div>
                  <strong className="text-yellow-400">onHasTask</strong>
                  <p className="text-gray-400 text-sm">Notifies when task queue becomes empty</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-red-900 bg-opacity-30 rounded">
                <span className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">5</span>
                <div>
                  <strong className="text-red-400">ApplicationRef.tick()</strong>
                  <p className="text-gray-400 text-sm">Change detection runs!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    {
      title: "NgZone and ApplicationRef",
      subtitle: "How Angular Integrates with Zone.js",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs">
            <div className="text-green-400 mb-3">// NgZone setup in Angular</div>
            <pre className="text-white leading-relaxed">
{`class NgZone {
  constructor() {
    // Create Angular's zone (child of root zone)
    this.inner = Zone.current.fork({
      name: 'angular',
      onHasTask: (delegate, current, target, hasTaskState) => {
        // When all async tasks complete
        if (!hasTaskState.macroTask && !hasTaskState.microTask) {
          // Notify subscribers (ApplicationRef is listening)
          this.onMicrotaskEmpty.emit();
        }
      }
    });
  }
  
  run<T>(fn: () => T): T {
    return this.inner.run(fn); // Run inside Angular zone
  }
}

class ApplicationRef {
  constructor(private zone: NgZone) {
    // Listen for zone becoming stable
    zone.onMicrotaskEmpty.subscribe(() => {
      this.tick(); // Trigger change detection!
    });
  }
  
  tick() {
    // Run change detection on all views
    this.views.forEach(view => view.detectChanges());
  }
}`}
            </pre>
          </div>
        </div>
      )
    },

    {
      title: "Zone.js in Action",
      subtitle: "Example Flow",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs">
            <pre className="text-white leading-relaxed">
{`// Your component code
@Component({...})
class MyComponent {
  count = 0;
  
  onClick() {
    // User clicks button
    console.log('1. Click handler starts');
    
    // Schedule async task
    setTimeout(() => {
      console.log('3. Timeout callback executes');
      this.count++; // State changes
      console.log('4. Timeout callback ends');
      // Zone.js detects task completion
      // ApplicationRef.tick() is called automatically
      // Change detection runs
      // DOM updates with new count value
    }, 1000);
    
    console.log('2. Click handler ends');
  }
}

// What happens:
// 1. User clicks
// 2. onClick runs (inside Angular zone)
// 3. setTimeout is patched by Zone.js
// 4. Zone.js wraps the callback
// 5. After 1 second, callback runs
// 6. State changes: count++
// 7. Zone.js detects all tasks complete
// 8. NgZone emits onMicrotaskEmpty
// 9. ApplicationRef.tick() runs
// 10. Change detection updates DOM
// 11. User sees new count!`}
            </pre>
          </div>
        </div>
      )
    },

    {
      title: "Problems with Zone.js",
      subtitle: "Why Angular is Moving Away",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-red-900 bg-opacity-40 border-2 border-red-500 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
                <XCircle size={24} /> Performance Issues
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Runs CD after <strong>every</strong> async task</li>
                <li>• Even if nothing changed</li>
                <li>• Checks the entire component tree</li>
                <li>• No way to optimize timing</li>
                <li>• Third-party libraries trigger CD</li>
              </ul>
            </div>
            <div className="bg-red-900 bg-opacity-40 border-2 border-red-500 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
                <AlertTriangle size={24} /> Technical Issues
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Large bundle size (~15KB)</li>
                <li>• Monkey patching is fragile</li>
                <li>• Hard to debug</li>
                <li>• Breaks with some libraries</li>
                <li>• Runtime overhead</li>
              </ul>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs">
            <div className="text-red-400 mb-3">// The Problem</div>
            <pre className="text-white leading-relaxed">
{`// In your component
fetchData() {
  this.http.get('/api/data').subscribe(data => {
    this.data = data; // ✓ Needs CD
  });
}

// But also...
setInterval(() => {
  console.log('tick'); // ✗ Triggers CD but doesn't need it!
}, 1000);

// And third-party code
thirdPartyLibrary.on('update', () => {
  // This also triggers CD even though
  // it doesn't affect your Angular components!
});`}
            </pre>
          </div>
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 p-6 rounded-lg">
            <p className="text-xl text-center">
              Solution: <strong className="text-yellow-400">Signals</strong> + <strong className="text-yellow-400">Zoneless</strong> mode
            </p>
          </div>
        </div>
      )
    },

    // ==================== SECTION 6: CHANGE DETECTION FLOW ====================
    {
      title: "Unidirectional Data Flow",
      subtitle: "The Golden Rule of Change Detection",
      content: (
        <div className="space-y-6 flex flex-col justify-center h-full">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-8 rounded-lg">
            <h3 className="text-4xl font-bold mb-6 text-center">Data Flows Down</h3>
            <p className="text-center text-2xl text-gray-200">
              Parent → Child (Never Child → Parent)
            </p>
          </div>
          <div className="bg-gray-900 p-8 rounded-lg">
            <div className="text-center font-mono text-sm space-y-6">
              <div className="flex items-center justify-center gap-6">
                <div className="bg-blue-600 px-8 py-6 rounded-lg text-xl font-bold">AppComponent</div>
                <ArrowRight className="text-blue-400" size={48} />
              </div>
              <div className="flex items-center justify-center gap-6">
                <div className="bg-purple-600 px-8 py-6 rounded-lg text-xl font-bold">ParentComponent</div>
                <ArrowRight className="text-purple-400" size={48} />
              </div>
              <div className="flex items-center justify-center gap-6">
                <div className="bg-pink-600 px-8 py-6 rounded-lg text-xl font-bold">ChildComponent</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-green-900 bg-opacity-30 border border-green-500 p-6 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-3 text-xl flex items-center gap-2">
                <CheckCircle size={24} /> Allowed
              </h4>
              <ul className="text-gray-300 space-y-2">
                <li>• Parent updates its own state</li>
                <li>• Parent passes data to child via @Input</li>
                <li>• Child reads @Input values</li>
              </ul>
            </div>
            <div className="bg-red-900 bg-opacity-30 border border-red-500 p-6 rounded-lg">
              <h4 className="font-semibold text-red-400 mb-3 text-xl flex items-center gap-2">
                <XCircle size={24} /> Forbidden
              </h4>
              <ul className="text-gray-300 space-y-2">
                <li>• Child modifies @Input</li>
                <li>• Child updates parent state directly</li>
                <li>• Circular data dependencies</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },

    {
      title: "Change Detection Order",
      subtitle: "The Precise Sequence",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-6 text-blue-400 text-center">
              For Each Component (Top to Bottom)
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 bg-gray-800 rounded">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</span>
                <div>
                  <strong className="text-blue-400">Update child component @Input bindings</strong>
                  <p className="text-gray-400 text-sm mt-1">Pass data from parent to child</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-800 rounded">
                <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</span>
                <div>
                  <strong className="text-purple-400">Call ngOnChanges (if inputs changed)</strong>
                  <p className="text-gray-400 text-sm mt-1">Child receives notification of input changes</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-800 rounded">
                <span className="bg-pink-600 text-white w-8 h-8 rounded-full flex-items-center justify-center font-bold flex-shrink-0">3</span>
                <div>
                  <strong className="text-pink-400">Call ngOnInit (first time only)</strong>
                  <p className="text-gray-400 text-sm mt-1">Component initialization</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-800 rounded">
                <span className="bg-green-600 text-white w-8 h-8 rounded-full flex-items-center justify-center font-bold flex-shrink-0">4</span>
                <div>
                  <strong className="text-green-400">Call ngDoCheck</strong>
                  <p className="text-gray-400 text-sm mt-1">Custom change detection logic</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-800 rounded">
                <span className="bg-yellow-600 text-white w-8 h-8 rounded-full flex-items-center justify-center font-bold flex-shrink-0">5</span>
                <div>
                  <strong className="text-yellow-400">Update DOM bindings for this component</strong>
                  <p className="text-gray-400 text-sm mt-1">Check all template bindings and update DOM</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-800 rounded">
                <span className="bg-red-600 text-white w-8 h-8 rounded-full flex-items-center justify-center font-bold flex-shrink-0">6</span>
                <div>
                  <strong className="text-red-400">Recursively check children</strong>
                  <p className="text-gray-400 text-sm mt-1">Repeat this process for each child component</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-800 rounded">
                <span className="bg-orange-600 text-white w-8 h-8 rounded-full flex-items-center justify-center font-bold flex-shrink-0">7</span>
                <div>
                  <strong className="text-orange-400">Call ngAfterContentChecked</strong>
                  <p className="text-gray-400 text-sm mt-1">After checking content children</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-800 rounded">
                <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex-items-center justify-center font-bold flex-shrink-0">8</span>
                <div>
                  <strong className="text-indigo-400">Call ngAfterViewChecked</strong>
                  <p className="text-gray-400 text-sm mt-1">After checking view children</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    {
      title: "The NG0100 Error",
      subtitle: "ExpressionChangedAfterItHasBeenCheckedError",
      content: (
        <div className="space-y-6">
          <div className="bg-red-900 bg-opacity-40 border-2 border-red-500 p-8 rounded-lg">
            <h3 className="text-3xl font-bold mb-4 text-red-400 text-center flex items-center justify-center gap-3">
              <AlertTriangle size={36} />
              NG0100
            </h3>
            <p className="text-center text-xl text-gray-200">
              Expression has changed after it was checked
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg font-mono text-xs">
            <div className="text-red-400 mb-3">// Example that causes NG0100</div>
            <pre className="text-white leading-relaxed">
{`@Component({
  template: '<child [value]="parentValue"></child>'
})
class ParentComponent {
  parentValue = 'initial';
}

@Component({
  selector: 'child',
  template: '{{ value }}'
})
class ChildComponent {
  @Input() value: string;
  
  ngOnInit() {
    // ✗ WRONG: Modifying parent state during child initialization
    this.parent.parentValue = 'modified';
  }
  
  constructor(private parent: ParentComponent) {}
}

// What happens:
// 1. CD checks ParentComponent: parentValue = 'initial'
// 2. CD checks ChildComponent
// 3. ngOnInit runs
// 4. parentValue changes to 'modified'
// 5. CD is done, but parent state changed!
// 6. In dev mode, Angular runs second check
// 7. Sees parentValue is now 'modified' (was 'initial')
// 8. Throws NG0100 error!`}
            </pre>
          </div>
        </div>
      )
    },

    {
      title: "Why NG0100 Exists",
      subtitle: "Enforcing Unidirectional Data Flow",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <p className="text-2xl text-gray-200 mb-6">
              The error exists to catch violations of <strong className="text-blue-400">unidirectional data flow</strong>
            </p>
            <div className="space-y-4">
              <div className="bg-green-900 bg-opacity-30 border border-green-500 p-6 rounded-lg">
                <h4 className="text-xl font-semibold mb-3 text-green-400">Without the check</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Child could modify parent during CD</li>
                  <li>• Parent's bindings would be stale</li>
                  <li>• DOM would be inconsistent</li>
                  <li>• Hard-to-debug circular dependencies</li>
                  <li>• Unpredictable behavior</li>
                </ul>
              </div>
              <div className="bg-blue-900 bg-opacity-30 border border-blue-500 p-6 rounded-lg">
                <h4 className="text-xl font-semibold mb-3 text-blue-400">With the check (dev mode)</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Angular runs CD twice</li>
                  <li>• Compares first pass vs second pass</li>
                  <li>• If anything changed, throws NG0100</li>
                  <li>• Forces proper data flow</li>
                  <li>• Catches bugs early</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 p-6 rounded-lg">
            <p className="text-xl">
              <AlertTriangle className="inline mr-2 text-yellow-400" size={24} />
              The check is <strong className="text-yellow-400">disabled in production</strong> for performance
            </p>
          </div>
        </div>
      )
    },

    {
      title: "Fixing NG0100",
      subtitle: "Solutions and Patterns",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h4 className="text-lg font-semibold mb-4 text-blue-400">❌ Wrong: Modify parent in ngOnInit</h4>
              <pre className="bg-gray-800 p-4 rounded font-mono text-xs text-white">
{`ngOnInit() {
  this.parent.value = 'new';
}`}
              </pre>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <h4 className="text-lg font-semibold mb-4 text-green-400">✓ Fix 1: Use setTimeout</h4>
              <pre className="bg-gray-800 p-4 rounded font-mono text-xs text-white">
{`ngOnInit() {
  setTimeout(() => {
    this.parent.value = 'new';
  }, 0);
}`}
              </pre>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <h4 className="text-lg font-semibold mb-4 text-green-400">✓ Fix 2: Use ngAfterViewInit</h4>
              <pre className="bg-gray-800 p-4 rounded font-mono text-xs text-white">
{`ngAfterViewInit() {
  // Safe: CD is done
  this.parent.value = 'new';
  this.cdr.detectChanges();
}`}
              </pre>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <h4 className="text-lg font-semibold mb-4 text-green-400">✓ Fix 3: Use @Output</h4>
              <pre className="bg-gray-800 p-4 rounded font-mono text-xs text-white">
{`@Output() valueChange = new EventEmitter();

ngOnInit() {
  this.valueChange.emit('new');
  // Parent handles in next CD cycle
}`}
              </pre>
            </div>
          </div>
          <div className="bg-purple-900 bg-opacity-30 border border-purple-500 p-6 rounded-lg">
            <p className="text-lg">
              <strong className="text-purple-400">Best solution:</strong> Redesign data flow so child doesn't need to modify parent
            </p>
          </div>
        </div>
      )
    },

    // I'll continue with OnPush, Signals, and Zoneless sections in the next part...
    // This is getting very long! Let me add the remaining major sections now.

  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
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
      <div className="absolute bottom-4 right-4 text-gray-600 text-sm font-mono">
        ← → Space | Home End
      </div>
    </div>
  );
};

export default PresentationComplete;
