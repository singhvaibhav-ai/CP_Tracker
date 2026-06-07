import { CourseDay } from '../types';
import { addDays, format } from 'date-fns';

const rawVideoData = `
Level 1
Module-1: C++ Basics

Introduction to CP
C++ Beginner
Online Judges with Coding
Local IDE Setup for CP

Module-2: C++ Intermediate

C++ Intermediate
Pattern Printing

Module-3: C++ Advanced

C++ Advanced
Problem Solving

Module-4: Time & Space Complexity

Time & Space Complexity
Problem Solving

Module-5: Maths for CP Beginner

Maths for CP Beginner
Problem Solving

Module-6: Maths for CP Intermediate

Maths for CP Intermediate
Problem Solving

Module-7: Searching and Sorting

Searching and Sorting
Problem Solving 1
Searching and Sorting 2
Problem Solving 2

Module-8: C++ STL Beginner

C++ STL Beginner
Problem Solving

Module-9: C++ STL Intermediate

C++ STL Intermediate
Strings & Problem Solving
Problem Solving

Module-10: Debugging

Debugging 1
Common Mistakes in CP


Level 2
Module-1: Prefix Sums & Difference Arrays

Prefix Sums
Difference Arrays
Coordinate Compression

Module-2: Bit Manipulation Beginner

Bit Manipulation 1
Bit Manipulation 2
Problem Solving 1

Module-3: Bit Manipulation Intermediate

Bitsets & Bitmasking
Problem Solving 2

Module-4: Ad-hoc & Patterns

Ad-hoc & Patterns
Problem Solving 1

Module-5: Recursion

Recursion
Time Complexity of Recursion
Problem Solving

Module-6: Backtracking

Backtracking Problems 1
Backtracking Problems 2
Backtracking Problems 3
Backtracking Problems 4

Module-7: Number Theory Beginner

Prime Factorisation & Sieve
Problem Solving

Module-8: Number Theory Intermediate

Exponentiation, GCD, LCM, Pigeonhole
Problem Solving 1
Problem Solving 2
Problem Solving 3

Module-9: Stacks, Queues, and Deques

Stacks, Queues, Deques
Heaps
Priority Queue & Problem Solving 1
Problem Solving 2

Module-10: Advanced Searching & Sorting

Advanced sorting
Binary Search
Problem Solving


level 3
Module-1: Binary Search

Binary Search on Answer
Binary Search on Decimals
Problem Solving
Problem Solving [Bonus]

Module-2: Binary Search & Interactive Problems

Transforming Equations for Binary Search
Interactive Problems
Problem Solving

Module-3: Sliding Windows

Sliding Windows Introduction
Sliding Window Problem Solving

Module-4: Two Pointers

Two Pointers Introduction
Problem Solving 1
Problem Solving 2

Module-5: Advanced Number Theory

Number Theory 1
Number Theory 2
Problem Solving

Module-6: Combinatorics & Probability

Combinatorics 1
Combinatorics 2
Probability & Expectation

Module-7: Greedy Algorithms

Greedy 1
Greedy 2
Problem Solving

Module-8: Greedy Problem Solving

Problem Solving 1
Problem Solving 2
Problem Solving 3

Module-9: String Hashing

String Hashing
Problem Solving

Module-10: Tries

String Tries
Binary Tries


level 4
Module-1: DP Beginner

Dynamic Programming Introduction 1
Dynamic Programming Introduction 2
DP Problem Solving

Module-2: DP Intermediate

Space & Transition Optimization
State Elimination & Cyclic DP States
Answer Construction & Non Integer States
Problem Solving

Module-3: DP Advanced

DP with Bitmasking
Digit DP
Problem Solving 1
Problem Solving 2

Module-4: Trees Beginner

Trees Introduction 1
Trees Introduction 2
Problem Solving

Module-5: Trees Advanced

Binary Lifting & LCA
DP on Trees

Module-6: Graphs Beginner

Intro to Graphs
Graph Traversals & Bipartite Graphs
Problem Solving

Module-7: Graphs Intermediate

Dijkstra & Applications
Disjoint Set Union
Problem Solving

Module-8: Graphs Advanced

Minimum Spanning Trees
Directed Graphs, Topo Sort
Strongly Connected Components
Problem Solving

Module-9: Range Queries Beginner

Introduction to Segment Trees
Generic Segment Trees
Problem Solving

Module-10: Range Queries Advanced

Lazy Propagation
Problem Solving

Module-11: Bonus Topics

Sparse Tables
Euler Tour in Trees
Bellman Ford & Floyd Warshall
`;

const rawProblemData = `
Module 1
Welcome for you with Conditions, Multiples, Digits Summation, The Brothers, Comparison, Max and Min, Memo and Momo, Ali Baba and Puzzles, Watermelon, Catch the Coin, Is It a Cat?, Politics

Module 2
Even, Odd, Positive and Negative, In Search of an Easy Problem, Divisors, One Prime, Pattern, Fibonacci, Permutation with array, Queue at the School, Pattern Printing, Print the Pattern, Pattern2, Word, Even Array, and 3 bonus problems will be unlocked after solving rest all problems of module 2

Module 3
Water Station, Full House, Beautiful Year, Again Twenty Five!, When?, Rotate, Fill the Gaps, Same Map in the RPG World, Discord, Three Numbers, Everyone Loves to Sleep, Mark the Dust Sweeper, Subset MEX, Array Cancellation, and 3 bonus problems will be unlocked after solving rest all problems of module 3

Module 4
Minimize Ordering
Pasta
Go Straight and Turn Right
At Most 3 (Judge ver.)
Holiday Of Equality
Equation
Number Groups
Counting Divisors
Divan and a New Project
XXYYX
TMT Document
Mirror Grid
and 3 bonus problems

Module 5
Lucky Division
Maximum GCD
Odd Divisor
Square Difference
GCD Arrays
Divide and Conquer
Proper Nutrition
Noldbach problem
GCD Problem
Co-prime Array
and 3 bonus problems

Module 6
Divisibility Problem
Multiplication 2
Anti-Division
Gregor and Cryptography
Integer Factorization
K-th Common Divisor
Modulo Summation
Max GCD 2
Divide by 2 or 3
Product and GCD
and 3 bonus problems

Module 7
Equal Candies
Closest to the Left
Gravity Flip
Cubes Sorting
Ehab Fails to Be Thanos
Fast search
Sqrt(x)
Peak Index in a Mountain Array
Even-Odd Game
Playing in a Casino
and 3 bonus problems

Module 8
Wonderful Coloring
gacha
Chat Order
Good Sequence
Sum of Two Values
Make Them Odd
Fencing
Chef of the Year
Palindrome Reorder
Playlist
Not All Flavours
and 3 bonus problems

Module 9
Sort Characters By Frequency
String Task
Boxes Packing
Isomorphic Strings
RPLD - Database
Stacks
Concert Tickets
Registration system
Longest Palindromic Substring
and 3 bonus problems

Module 10 has no problems

this was all about level 1

Module 1
Static Range Sum Queries
Subarray Sums II
Maximum Population Year
Kuriyama Mirai's Stones
Forest Queries
Subarray Divisibility
Count Number of Nice Subarrays
Vacation
Little Girl and Maximum Sum
Karen and Coffee
and 2 bonus problems

Module 2
XORwice
Raising Bacteria
AND 0, Sum Big
You Are Given Two Binary Strings...
Johnny and His Hobbies
Longest AND Subarray
XxOoRr
Co-growing Sequence
Mainak and Interesting Sequence
Adding Powers
Orray
Even-Odd XOR
Maximal AND
and 3 bonus problems

Module 3
Powers Of Two
OR Tuples
Xor and Multiply
And Or Union
Johnny and Another Rating Drop
Array Elimination
MEXor Mixup
and 3 bonus problems

Module 4
Minimize Inversions
Remove a Progression
Teleporters (Easy Version)
Sort the Subarray
Constructive Problem
Reverse Binary Strings
ABSP1
Gray Code
Qingshan Loves Strings 2
Five, Five Everywhere
and 3 bonus problems

Module 5
Factorial
3n + 1
Subsets
Subsets II
Sum of a Matrix
Knapsack
The maximum Path-Sum
Creating Expression1
Creating Strings
Palindrome Partitioning
and 3 bonus problems

Module 6
Combination Sum
Combination Sum II
Letter Combinations of a Phone Number
Sum String
N Queens
Generate Parentheses
Sudoku Solver
Restore IP Addresses
Different Ways to Add Parentheses
Word Search
and 3 bonus problems

Module 7
Almost Prime
Sherlock and his girlfriend
A conjecture of Paul Erdős
Prime Matrix
k-Factorization
T-primes
Fadi and LCM
Longest Divisors Interval
Number Factorization
Divide and Equalize
Make Almost Equal With Mod
Happy New Year 2023
and 2 bonus problems

Module 8
Minimum LCM
Different Divisors
Buying Shovels
Exponentiation
Super Pow
Factors of Factorial
Coprime 2
Count Good Numbers
and 3 bonus problems

Module 9
Valid Parentheses
Min Stack
Next Greater Element I
Validate Stack Sequences
Kth Largest Element in a Stream
Remove Duplicate Letters
Evaluate Reverse Polish Notation
Minimum Insertions to Balance a Parentheses String
Valeriy and Deque
and 3 bonus problems

Module 10
Find Peak Element
Very Easy Task
Laizy Faith
Search a 2D Matrix
Inversion Count
Intersections
Points on Line
Aggressive cows
Capacity To Ship Packages Within D Days
and 3 bonus problems

this is all about level 2

Module 1
Array Division
Factory Machines
Multiplication Table
Minimum Days to make N Bouquets
Nth Magical Number
Worms
Find the Duplicate Number
Aggressive cows
Median of Two Sorted Arrays
A Tale of Two Lands
Cellular Network
and 3 bonus problems

Module 2
Bear and Prime 100
Flamingoes of Mystery
Pythagorean Triples
Guess the Kth Zero (Easy Version)
Find Kth Smallest Pair Distance
Interview
Lost Numbers
Fixed Point Guessing
Keshi Is Throwing a Party
Guessing the Greatest (Easy Version)
Save the Nature
and 3 bonus problems

Module 3
Sage's Birthday (hard version)
Balanced Stone Heaps
Set or Decrease
Sliding Window Maximum
Permutation in String
Sliding Median
Minimum Number of K Consecutive Bit Flips
K Radius Subarray Averages
Nastya and Door
Sum of Three Values
and 3 bonus probelms

Module 4
Number of Equal
Segments with Small Set
Total Length
They Are Everywhere
Segments with Small Spread
Money Trees
Books
TV Subscriptions (Hard Version)
Looped Playlist
Che city
Minimize The Integer
Smallest Range Covering Elements from K Lists
Ira and Flamenco
and 3 bonus problems

Module 5
Lunatic Never Content
Divisiblity of Differences
Row GCD
Modular Equations
Common Divisors
We Were Both Children
Colliders
A conjecture of Paul Erdős
Double Factorial
Vasya and Petya's Game
Orac and LCM
Div Game
and 3 bonus problems

Module 6
Christmas Party
Rectangles
Pocket Book
Almost Identity Permutations
Dreamoon and WiFi
Archer
Kolya and Tanya
Alice and the List of Presents
New Year and Permutation
Advertising Agency
Jury Meeting
The Fair Nut and String
Little Pony and Expected Maximum
and 3 bonus problems

Module 7
Phoenix and Balance
Jump Game
USB vs. PS/2
Room Allocation
Stick Lengths
Double Lexicographically Minimum
Reading Books
Megalomania
Replace With the Previous, Minimize
Maximum Score Of Spliced Array
Movie Festival II
Chat room
Teleporters (Easy Version)
and bonus 3 problems

Module 8
Missing Coin Sum
Just Eat It!
Make It Permutation
Towers
Number Reduction
Biased Standings
Pearls in a Row
Smaller
Powered Addition
Defense of a Kingdom
Woodcutters
Alarm Clock
and 3 bonus problems

Module 9
String Matching
Ada and Spring Cleaning
Finding Borders
Longest Happy Prefix
Good Substrings
Finding Periods
Password
Repeating Substring
and 3 bonus problems

Module 10
Implement Trie (Prefix Tree)
Phone directory
Shortest Unique prefix for every word
Map Sum Pairs
Longest Word in Dictionary
Sum of Prefix Scores of Strings
Maximum XOR of Two Numbers in an Array
Maximum XOR subarray
Maximum XOR With an Element From Array
and 3 bonus problems

this is all about level 3

Module 1
Dice Combinations
Coin Combinations 1
Grid Paths
Minimizing Coins
Coin Combination 2
Edit Distance
Mashmokh and ACM
Orac and Models
Array Description
Coins
Tetrahedron
Add One
Rectangle Cutting
and 3 bonus probelms

Module 2
Between Two Arrays
Candies
Increasing Subsequence
Make Them Equal
Sleeping Schedule
Omkar and Bed wars
Explorer Space
Sending a Sequence Over the Network
Hot Start Up (easy version)
The Sports Festival
and 3 bonus problems

Module 3
Coloring Trees
Money Sums
Office Keys
Yet Another Problem On a Subsequence
Checkout Assistant
Minimum XOR Sum of Two Arrays
Little Elephant and T-Shirts
Kefa and Dishes
Beautiful Arrangement
Cashback
Smallest Sufficient Team
Classy Numbers
Counting Numbers
Number of Beautiful Integers in the Range
and 6 bonus problems

Module 4
Christmas Spruce
Kefa and Park
Gardener and Tree
Peculiar apple-tree
Subordinates
Queen
Valera and Elections
Useful Decomposition
Timofey and a tree
Tree Diameter
Dynamic Diameter
Path Prefixes
and 3 bonus problems

Module 5
Company Queries I
Company Queries II
Distance Queries
Cycle Free Flow
Query on a tree II
Counting Paths
Tree Distances I
Tree Distances II
Tree with Maximum Cost
Maximum White Subtree
and 3 bonus problems

Module 6
Fox And Two Dots
Labyrinth
Building Roads
Ada and Cycle
Fair
Secret Passwords
Mahmoud and Ehab and the bipartiteness
News Distribution
Hongcow Builds A Nation
Peaks
Solve The Maze
and 3 bonus problems

Module 7
Dijkstra?
COSTLY CHESS
Flight Discount
Minimum Obstacle Removal to Reach Corner
Number of Ways to Arrive at Destination
Nearest Excluded Points
Disjoint Sets Union
Mocha and Diana (Easy Version)
Road Construction
Experience
Cutting a Graph
and 3 bonus problems

Module 8
Dark roads
Hierarchy
Min Cost to Connect All Points
Built?
Course Schedule
Mouse Hunt
Flight Routes Check
Checkposts
Game Routes
Longest Flight Route
GCD on Directed Graph
3 bonus problems

Module 9
Dynamic Range Minimum Queries
Xenia and Bit Operations
Number of Minimums on a Segment
First element at least X - 2
List Removals
Hotel Queries
Subsequences
Sereja and Brackets
Nested Segments
Intersecting Segments
and 2 bonus problems

Module 10
Addition and Minimum
Addition and First element at least X
Little Girl and Maximum Sum
Multiplication and Sum
Counting Primes
Bitwise OR and AND
Inverse and K-th one
Assignment and Maximal Segment
XOR on Segment
and 3 bonus problems

Module 11
Array Stabilization (GCD version)
New Year Concert
Subtree Queries
Path Queries
Gao on a tree
Greg and Graph
Cheapest Flights Within K Stops
and 1 bonus problem

this is all about level 4
`;

function generateSeedData(): CourseDay[] {
  const levelsData: Record<string, { problems: { title: string, moduleName: string }[], videos: { title: string, moduleName: string }[] }> = {
    'l1': { problems: [], videos: [] },
    'l2': { problems: [], videos: [] },
    'l3': { problems: [], videos: [] },
    'l4': { problems: [], videos: [] }
  };

  // Map to link a simple "Module 1" to "Module-1: C++ Basics" for a given level
  const moduleNameMap: Record<number, Record<number, string>> = {
    1: {}, 2: {}, 3: {}, 4: {}
  };

  // 1. Parse Videos and populate the moduleNameMap
  let currentLevel = 1;
  let currentModuleFullName = "General";
  let currentModuleNumber = 1;

  const videoLines = rawVideoData.split('\n').map(l => l.trim()).filter(l => l !== '');

  for (const line of videoLines) {
    if (line.toLowerCase().startsWith('level')) {
      const match = line.match(/\d+/);
      if (match) currentLevel = parseInt(match[0], 10);
      continue;
    }

    if (line.toLowerCase().startsWith('module-')) {
      currentModuleFullName = line;
      // Extract the module number
      const match = line.match(/Module-(\d+)/i);
      if (match) {
        currentModuleNumber = parseInt(match[1], 10);
        moduleNameMap[currentLevel][currentModuleNumber] = currentModuleFullName;
      }
      continue;
    }

    // It's a video title
    if (currentLevel >= 1 && currentLevel <= 4) {
      levelsData[`l${currentLevel}`].videos.push({ title: line, moduleName: currentModuleFullName });
    }
  }

  // 2. Parse Problems
  currentLevel = 1;
  currentModuleFullName = "General";

  const problemLines = rawProblemData.split('\n').map(l => l.trim()).filter(l => l !== '');

  for (const line of problemLines) {
    if (line.toLowerCase().includes("this was all about level 1")) {
      currentLevel = 2;
      continue;
    }
    if (line.toLowerCase().includes("this is all about level 2")) {
      currentLevel = 3;
      continue;
    }
    if (line.toLowerCase().includes("this is all about level 3")) {
      currentLevel = 4;
      continue;
    }
    if (line.toLowerCase().includes("this is all about level 4")) {
      break;
    }

    if (line.toLowerCase().startsWith('module') && !line.toLowerCase().includes('bonus')) {
      // It's a simple module header like "Module 1" or "Moduel 4" (typo in raw text)
      const match = line.match(/\d+/);
      if (match) {
        currentModuleNumber = parseInt(match[0], 10);
        // Look up the full name
        if (moduleNameMap[currentLevel][currentModuleNumber]) {
          currentModuleFullName = moduleNameMap[currentLevel][currentModuleNumber];
        } else {
          currentModuleFullName = line;
        }
      }
      continue;
    }

    // It's a problem
    if (line && !line.toLowerCase().startsWith('this ')) {
      let currentLineToProcess = line;

      const bonusMatch = currentLineToProcess.match(/and (\d+) bonus problems?/i);
      let bonusCount = 0;
      if (bonusMatch) {
        bonusCount = parseInt(bonusMatch[1], 10);
        // Remove the bonus problem text so we can process the rest of the line normally
        currentLineToProcess = currentLineToProcess.replace(bonusMatch[0], "").trim();
        // Optionally remove trailing words like "will be unlocked..." and trailing commas
        currentLineToProcess = currentLineToProcess.replace(/,?\s*will be unlocked.*$/i, "").trim();
        currentLineToProcess = currentLineToProcess.replace(/,?\s*$/, "").trim();
        // Remove dangling "and" if it was left behind
        if (currentLineToProcess.toLowerCase() === "and") {
          currentLineToProcess = "";
        }
      }

      if (currentLevel === 1 && currentLineToProcess.includes(',') && currentLineToProcess.startsWith("Welcome for you")) {
        currentLineToProcess.split(',').forEach(p => {
          if (p.trim()) levelsData[`l${currentLevel}`].problems.push({ title: p.trim(), moduleName: currentModuleFullName });
        });
      } else if (currentLevel === 1 && currentLineToProcess.includes(',') && currentLineToProcess.includes("Even, Odd")) {
        currentLineToProcess.split(',').forEach(p => {
          if (p.trim()) levelsData[`l${currentLevel}`].problems.push({ title: p.trim(), moduleName: currentModuleFullName });
        });
      } else if (currentLevel === 1 && currentLineToProcess.includes(',') && currentLineToProcess.includes("Water Station")) {
        currentLineToProcess.split(',').forEach(p => {
          if (p.trim()) levelsData[`l${currentLevel}`].problems.push({ title: p.trim(), moduleName: currentModuleFullName });
        });
      } else {
        if (currentLineToProcess && currentLineToProcess.toLowerCase() !== "and") {
          levelsData[`l${currentLevel}`].problems.push({ title: currentLineToProcess, moduleName: currentModuleFullName });
        }
      }

      if (bonusCount > 0) {
        for (let i = 1; i <= bonusCount; i++) {
          levelsData[`l${currentLevel}`].problems.push({
            title: `Bonus Problem ${i}`,
            moduleName: currentModuleFullName
          });
        }
      }
    }
  }

  // 3. Chunking Algorithm
  const levelDays: Record<string, number[]> = {
    'l1': Array.from({ length: 4 }, (_, i) => i + 1), // 1-4
    'l2': Array.from({ length: 15 }, (_, i) => i + 5), // 5-19
    'l3': Array.from({ length: 20 }, (_, i) => i + 20), // 20-39
    'l4': Array.from({ length: 31 }, (_, i) => i + 40) // 40-70
  };

  const courseDays: CourseDay[] = [];
  let taskIdCounter = 1;
  let globalLectureCounter = 1; // Added global counter for Lectures
  let globalProblemCounter = 1; // Added global counter for Problems

  function distribute<T>(items: T[], numDays: number): T[][] {
    if (numDays === 0) return [];
    const avg = items.length / numDays;
    const out: T[][] = [];
    let last = 0.0;
    for (let i = 0; i < numDays; i++) {
      const count = Math.round(last + avg) - Math.round(last);
      out.push(items.slice(Math.round(last), Math.round(last + count)));
      last += avg;
    }
    return out;
  }

  const START_DATE = new Date(2026, 4, 18);

  for (const lId of ['l1', 'l2', 'l3', 'l4'] as const) {
    const daysForLevel = levelDays[lId];
    const numDays = daysForLevel.length;

    const videos = levelsData[lId].videos;
    const problems = levelsData[lId].problems;

    const vidChunks = distribute(videos, numDays);
    const probChunks = distribute(problems, numDays);

    // Removed the resetting counters from here!

    for (let idx = 0; idx < daysForLevel.length; idx++) {
      const dayNum = daysForLevel[idx];
      const vChunk = vidChunks[idx] || [];
      const pChunk = probChunks[idx] || [];

      const dateObj = addDays(START_DATE, dayNum - 1);

      const dayObj: CourseDay = {
        dayNumber: dayNum,
        date: format(dateObj, 'yyyy-MM-dd'),
        lectures: [],
        problems: []
      };

      for (const v of vChunk) {
        // Create the padded string (e.g., "001", "045", "120")
        const numStr = String(globalLectureCounter++).padStart(3, '0');

        dayObj.lectures.push({
          id: `t${taskIdCounter++}`,
          title: `#${numStr}: ${v.title}`,
          type: "Video",
          isCompleted: false,
          moduleName: v.moduleName
        });
      }

      for (const p of pChunk) {
        // Create the padded string for problems
        const numStr = String(globalProblemCounter++).padStart(3, '0');

        dayObj.problems.push({
          id: `t${taskIdCounter++}`,
          title: `#${numStr}: ${p.title}`,
          type: "Problem",
          isCompleted: false,
          moduleName: p.moduleName
        });
      }

      courseDays.push(dayObj);
    }
  }

  return courseDays;
}

export const INITIAL_TRACKER_DATA: CourseDay[] = generateSeedData();