# Process Management in Operating Systems

## What is a Process?

A **Process** is a running instance of a program. It's a program in execution with its own memory space, resources, and state.

### Process vs Program: Key Difference

| Aspect | Program | Process |
|---|---|---|
| **Definition** | Static code stored on disk | Running instance of a program |
| **Existence** | Exists on disk/storage | Exists in RAM (memory) |
| **State** | Inactive, waiting to run | Active, being executed |
| **Memory** | Doesn't occupy memory | Occupies RAM and resources |
| **Example** | Google Chrome application file | Chrome browser running in your taskbar |

**In Simple Terms:** When you double-click an application icon, the program transitions from disk storage into memory and becomes a **process**.

### Process Components

A process consists of:

1. **Program Counter (PC)** - Address of the next instruction to execute
2. **CPU Registers** - Temporary storage for data being processed
3. **Stack** - Stores function calls and local variables
4. **Heap** - Dynamic memory allocation
5. **Data Section** - Global and static variables
6. **Text Section** - The actual program code

---

## Process States

A process goes through several states during its lifetime. Understanding these states is crucial for process management.

### State Diagram

```
     [NEW]
       ↓
    [READY] → [RUNNING] → [TERMINATED]
       ↑          ↓
       └────────[WAITING]
```

### Detailed Process States

#### 1. **NEW State**
- A process has just been created
- Hasn't started execution yet
- Resources are being allocated
- Waiting to be loaded into memory
- **Duration:** Very brief
- **Next State:** READY

#### 2. **READY State**
- Process is prepared to run
- All resources are allocated
- Waiting for CPU time to execute
- Multiple processes can be in READY state simultaneously
- Processes here are managed by a scheduling queue
- **Waiting For:** CPU scheduler to assign it to CPU
- **Next State:** RUNNING (when scheduler picks it)

#### 3. **RUNNING State**
- Process is actively executing on the CPU
- Instructions are being processed
- Only one process can be in RUNNING state on a single-core CPU
- **Duration:** Depends on time quantum (time slice)
- **What Happens:** 
  - Process completes → TERMINATED
  - Time slice expires → READY
  - Needs I/O operation → WAITING
  - Interrupted by higher priority → READY

#### 4. **WAITING State** (Also called BLOCKED)
- Process is waiting for an event to occur
- CPU is not needed
- **Common Reasons for WAITING:**
  - I/O operation (reading from disk, network)
  - User input (keyboard, mouse)
  - Signal from another process
  - Timer expiration
- **Duration:** Unpredictable (depends on external events)
- **Next State:** READY (when event occurs)

#### 5. **TERMINATED State** (Also called EXIT)
- Process has finished execution or been forcefully terminated
- Resources are being deallocated
- Process control block is removed from memory
- **Reasons for Termination:**
  - Normal completion
  - Error/exception occurred
  - Killed by user or another process
  - Out of memory
- **Final State:** Process no longer exists

### State Transition Examples

**Example 1: Normal Program Execution**
```
NEW → READY → RUNNING → TERMINATED
```

**Example 2: With I/O Operations**
```
NEW → READY → RUNNING → WAITING → READY → RUNNING → TERMINATED
```

**Example 3: Multi-tasking System**
```
NEW → READY → RUNNING (time up) → READY → RUNNING → WAITING → 
READY → RUNNING (completes) → TERMINATED
```

---

## Process Schedulers

**Process Schedulers** are the OS components that decide which process gets CPU time and when. They manage the READY and WAITING queues.

### Types of Process Schedulers

There are three main types of schedulers:

#### 1. **Long-Term Scheduler (Admission Scheduler)**

**Purpose:** Determines which processes enter the READY queue from NEW state

**Characteristics:**
- Runs infrequently (less often)
- Makes decisions about job admission
- Controls the degree of multiprogramming (how many processes in memory)
- Decides if a new process should be loaded into memory

**Responsibility:**
- Load NEW processes into RAM
- Balance between I/O-bound and CPU-bound processes
- Ensure system resources aren't overloaded
- Create process control blocks
- Allocate initial memory

**Key Point:** If too many processes are loaded, system performance decreases. If too few, CPU remains idle.

**Example:**
```
When you launch an application:
NEW → Long-Term Scheduler checks available memory 
→ If memory available: Process moves to READY
→ If memory full: Process waits in queue
```

---

#### 2. **Short-Term Scheduler (CPU Scheduler)**

**Purpose:** Decides which READY process gets the CPU next

**Characteristics:**
- Runs very frequently (dozens to hundreds of times per second)
- Makes split-second decisions
- Most critical scheduler for performance
- Selects from READY queue

**Responsibility:**
- Select next process from READY queue
- Assign CPU time to processes
- Context switching between processes
- Manage CPU allocation fairly
- Implement scheduling algorithms
- Load process context into CPU registers

**Frequency:** Runs on every timer interrupt (every few milliseconds)

**Example:**
```
READY Queue: [Process A] → [Process B] → [Process C]
Short-Term Scheduler picks Process A
Process A runs for 20ms (time quantum)
Next turn: Short-Term Scheduler picks Process B
```

**Impact on User Experience:**
- Well-designed short-term scheduler = smooth operation
- Poor scheduler = lag and stuttering

---

#### 3. **Medium-Term Scheduler (Swapper)**

**Purpose:** Manages the transition between READY and WAITING states, or removes processes temporarily

**Characteristics:**
- Runs occasionally (between long and short-term)
- Works with memory management
- Handles process suspension and resumption
- Modern OS feature

**Responsibility:**
- Swap processes between RAM and disk (swapping)
- Suspend processes when memory is low
- Resume suspended processes when memory available
- Balance memory usage
- Reduce degree of multiprogramming if needed
- Move processes from memory to disk storage temporarily

**When It Activates:**
- Memory usage exceeds threshold
- System needs to make room for critical processes
- I/O devices need temporary relief

**Example:**
```
Scenario: Computer running too slowly (memory full)
1. Medium-Term Scheduler identifies inactive processes
2. Temporarily moves them from RAM to disk
3. Frees up memory for active processes
4. Later resumes them when memory available
```

---

## Scheduler Interactions

```plaintext
┌─────────────────────────────────────────────────┐
│           PROCESS CREATION                      │
│                                                 │
│  NEW Queue with unstarted processes             │
└────────────────┬────────────────────────────────┘
                 │
         [LONG-TERM SCHEDULER]←─ Decides admission
                 │              based on resources
                 ↓
         NEW → READY Queue
              (In Memory)
                 │
         [MEDIUM-TERM SCHEDULER]←─ If memory low:
                 │                  suspend to disk
                 ↓
         ┌───────────────────┐
         │      READY        │←─┐
         │  (In Memory)      │  │
         └────────┬──────────┘  │
                  │             │
         [SHORT-TERM SCHEDULER] │
                  │             │
                  ↓             │
            [RUNNING]        Resume
                  │          from disk
                  ↓
            I/O Request
                  │
                  ↓
         [WAITING Queue]
         (Blocked on I/O)
                  │
         Event Occurs (I/O Complete)
                  │
                  └─→ Back to READY Queue
```

---

## Comparison of Schedulers

| Aspect | Long-Term | Medium-Term | Short-Term |
|---|---|---|---|
| **Frequency** | Least frequent | Occasionally | Most frequent |
| **When Invoked** | Job arrival | Memory pressure | Timer interrupt |
| **Decision Time** | Seconds | Seconds to minutes | Milliseconds |
| **Selects From** | NEW queue | Suspended queue | READY queue |
| **Moves To** | READY queue | READY or disk | RUNNING state |
| **Impact** | System stability | Memory efficiency | User responsiveness |
| **Complexity** | Low | Medium | High |
| **Example** | Application launcher | Memory manager | Timer routine |

---

## Key Points Summary

### Process Definition
- ✅ Running instance of a program with its own memory and resources
- ✅ Program becomes a process when executed

### Process States
- ✅ **NEW** → READY → RUNNING → TERMINATED
- ✅ **WAITING** state for I/O operations
- ✅ Processes transition based on events and scheduler decisions

### Three Schedulers Working Together
- ✅ **Long-Term:** Controls entry into memory (admission control)
- ✅ **Medium-Term:** Manages memory by suspending/resuming processes
- ✅ **Short-Term:** Assigns CPU time to ready processes (dispatcher)

### Scheduler Responsibilities

| Scheduler | Main Responsibility |
|---|---|
| Long-Term | "Who enters the system?" |
| Medium-Term | "Who stays in memory?" |
| Short-Term | "Who gets the CPU now?" |

---

## Real-World Analogy

Think of a university cafeteria:

- **Long-Term Scheduler** = Gate keeper who decides how many students can enter based on cafeteria capacity
- **Medium-Term Scheduler** = Manager who asks students to wait outside or temporarily leave if cafeteria gets too crowded
- **Short-Term Scheduler** = Cashier who decides which student at the counter gets service next

Each plays a role in keeping the system running smoothly!

---

## Practice Questions

1. What's the difference between a program and a process?
2. Why does a process need to go into the WAITING state?
3. Which scheduler runs most frequently and why?
4. If a system has only a long-term scheduler, what problem might arise?
5. What happens when the short-term scheduler's time quantum expires?

---