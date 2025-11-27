# Cassette Journal - Issues Tracker

## Non-Priority Issues

### 1. Task Panel Width Contraction on Edit

**Status**: Open  
**Component**: `TaskItem.tsx`  
**Description**: When clicking on a task title to edit it, the task panel contracts width-wise. This is especially noticeable when searching for tasks with shorter titles and then editing a longer title task.

**Steps to Reproduce**:

1. Open a tape with extracted tasks
2. Search for a task with a shorter title
3. Click on a longer task title to edit it
4. Observe the panel width contracts

**Expected Behavior**: Task panel width should remain constant when switching between view and edit modes.

**Attempted Fixes**:

- Changed span from `w-fit` to `block`
- Added `min-w-full` to input field
- Added `mb-1` to input for consistent spacing

**Notes**: Issue persists despite attempted fixes. May need deeper investigation into flex layout behavior or parent container constraints.

---

## Priority Issues

(None currently)

---

## Completed Issues

(None yet)
