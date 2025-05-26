# @kanzen/result

[![npm version](https://img.shields.io/npm/v/@kanzen/result.svg)](https://www.npmjs.com/package/@kanzen/result)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A minimal TypeScript implementation of Rust's Result type for elegant error handling without exceptions.

## 📋 Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Key Features](#key-features)
- [Basic Usage](#basic-usage)
- [API Reference](#api-reference)
  - [Synchronous API](#synchronous-api)
  - [Asynchronous API](#asynchronous-api)
- [Advanced Examples](#advanced-examples)
- [Migration from try/catch](#migration-from-trycatch)
- [TypeScript Integration](#typescript-integration)
- [License](#license)

## 🌟 Introduction

`@kanzen/result` provides a robust alternative to traditional try/catch error handling in JavaScript and TypeScript. Inspired by Rust's Result type, it enables functional, type-safe error handling that makes your code more predictable and easier to reason about.

With this library, errors become first-class citizens in your code rather than exceptional flow-breaking events, allowing for more elegant composition of functions that might fail.

## 📦 Installation

```bash
# npm
npm install @kanzen/result

# yarn
yarn add @kanzen/result

# pnpm
pnpm add @kanzen/result
```

## ✨ Key Features

- **Type-safe error handling** - Leverage TypeScript to ensure errors are handled properly
- **Functional approach** - Chain operations with clear success and error paths
- **Synchronous and asynchronous support** - Handle both sync and async operations with a consistent API
- **Zero dependencies** - Lightweight and focused implementation
- **Comprehensive TypeScript types** - Full type inference for both success and error values

## 🚀 Basic Usage

### Synchronous Example

```typescript
import { okSync, errSync, safeTrySync } from '@kanzen/result';

// Create a successful result
const success = okSync('Hello, world!');
console.log(success.unwrap()); // 'Hello, world!'

// Create a failed result
const failure = errSync(new Error('Something went wrong'));
console.log(failure.isErr()); // true

// Handle both cases with match
const message = failure.match({
  ok: (value) => `Success: ${value}`,
  err: (error) => `Error: ${error.message}`,
});
console.log(message); // 'Error: Something went wrong'

// Safely try an operation that might throw
function divideBy(a: number, b: number) {
  return safeTrySync(
    () => {
      if (b === 0) throw new Error('Division by zero');
      return a / b;
    },
    (error) => new Error(`Math error: ${error instanceof Error ? error.message : String(error)}`)
  );
};

const result = divideBy(10, 2)
  .map(result => result * 2)
  .andTee(result => console.log(`Result: ${result}`))
  .unwrapOr(0);

console.log(result); // 10
```

### Asynchronous Example

```typescript
import { ok, err, safeTry } from '@kanzen/result';

// Fetch API with Result
const fetchUser = safeTry(
  async (id: string) => {
    const response = await fetch(`https://api.example.com/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return await response.json();
  },
  (error) => new Error(`Failed to fetch user: ${error instanceof Error ? error.message : String(error)}`)
)

// Use the result
fetchUser('123')
  .andThen((user) => {
    // Only runs if fetchUser succeeded
    return ok({ ...user, lastLogin: new Date() });
  })
  .orElse((error) => {
    // Only runs if fetchUser failed
    console.error(`Error fetching user: ${error.message}`);
    return ok({ id: '123', name: 'Default User', lastLogin: null });
  })
  .match({
    ok: (user) => console.log(`User loaded: ${user.name}`),
    err: (error) => console.error(`Failed to load user: ${error.message}`),
  });
```

## 📘 API Reference

### Synchronous API

#### Creating Results

- **`okSync<T>(value: T): Result<T, never>`** - Creates a successful Result
- **`errSync<E>(error: E): Result<never, E>`** - Creates a failed Result
- **`safeTrySync<T, E>(fn: () => T, fnErr?: (error: unknown) => E): Result<T, E>`** - Safely executes a function that might throw

#### Result Methods

- **`isOk(): boolean`** - Checks if the Result is successful
- **`isErr(): boolean`** - Checks if the Result is an error
- **`unwrap(): T`** - Returns the value if Ok, throws the error if Err
- **`unwrapOr<U>(fallback: U): T | U`** - Returns the value if Ok, or the fallback if Err
- **`match<R>({ ok, err }: { ok: (value: T) => R, err: (error: E) => R }): R`** - Pattern matches on the Result
- **`map<U>(fn: (value: T) => U): Result<U, E>`** - Maps the success value
- **`mapErr<F>(fn: (error: E) => F): Result<T, F>`** - Maps the error value
- **`andThen<U, F>(fn: (value: T) => Result<U, F>): Result<U, E | F>`** - Chains a function that returns a Result
- **`orElse<U, F>(fn: (error: E) => Result<U, F>): Result<T | U, F>`** - Handles errors by returning a new Result
- **`andTee(fn: (value: T) => unknown): Result<T, E>`** - Performs a side effect on success (tee/tap pattern)
- **`orTee(fn: (error: E) => unknown): Result<T, E>`** - Performs a side effect on error

### Asynchronous API

#### Creating Async Results

- **`ok<T>(value: T): ResultAsync<T, never>`** - Creates a successful ResultAsync
- **`err<E>(error: E): ResultAsync<never, E>`** - Creates a failed ResultAsync
- **`safeTry<T, E>(fn: () => Promise<T>, fnErr?: (error: unknown) => E): ResultAsync<T, E>`** - Safely executes an async function
- **`toAsync<T, E>(result: Result<T, E>): ResultAsync<T, E>`** - Converts a Result to a ResultAsync

#### ResultAsync Methods

ResultAsync implements all the methods from Result but returns promises or new ResultAsync instances:

- **`isOk(): Promise<boolean>`**
- **`isErr(): Promise<boolean>`**
- **`unwrap(): Promise<T>`**
- **`unwrapOr<U>(fallback: U): Promise<T | U>`**
- **`match<R>({ ok, err }: { ok: (value: T) => R, err: (error: E) => R }): Promise<R>`**
- **`map<U>(fn: (value: T) => U): ResultAsync<U, E>`**
- **`mapErr<F>(fn: (error: E) => F): ResultAsync<T, F>`**
- **`andThen<U, F>(fn: (value: T) => ResultAsync<U, F>): ResultAsync<U, E | F>`**
- **`orElse<U, F>(fn: (error: E) => ResultAsync<U, F>): ResultAsync<T | U, F>`**
- **`andTee(fn: (value: T) => unknown): ResultAsync<T, E>`**
- **`orTee(fn: (error: E) => unknown): ResultAsync<T, E>`**

## 🔍 Advanced Examples

## 🔄 Migration from try/catch

### Before

```typescript
function divideNumbers(a: number, b: number) {
  try {
    if (b === 0) {
      throw new Error('Division by zero');
    }
    return a / b;
  } catch (error) {
    console.error('Error dividing numbers:', error);
    return null;
  }
}

// Usage:
const result = divideNumbers(10, 0);
if (result === null) {
  console.log('An error occurred');
} else {
  console.log(`Result: ${result}`);
}
```

### After

```typescript
import { safeTrySync } from '@kanzen/result';

// Declare a unsafe function
function divideNumbers(a: number, b: number): number {
    if (b === 0) {
        throw new Error("Division by zero");
    }
    return a / b;
}

// Make it safe function
const safeDivideNumbers = safeTrySync(
    divideNumbers,
    (error) => new Error(`Division error: ${String(error)}`), // optional
);

// Usage:
safeDivideNumbers(10, 2).match({
    ok: (result) => console.log(`Result: ${result}`),
    err: (error) => console.log(`An error occurred: ${error.message}`),
});
```

## 🧩 TypeScript Integration

The library provides full TypeScript support with strong type inference:

```typescript
import { okSync, errSync, type Result } from '@kanzen/result';

// Function return types
function divide(a: number, b: number): Result<number, Error> {
  if (b === 0) {
      return errSync(new Error("Can't divide by zero"));
  }
  return okSync(a / b);
}

// Type narrowing with isOk and isErr
const result = divide(10, 2);
if (result.isOk()) {
  // TypeScript knows result.ok is a number here
  const value = result.ok; // number
} else {
  // TypeScript knows result.err is an Error here
  const error = result.err; // Error
}

// Generic type parameters are preserved through transformations
const transformed = divide(10, 2)
  .map((value) => value.toString()) // Result<string, Error>
  .mapErr(error => new Error(`transform: ${error.message}`)); // Result<string, TypeError>
```

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ by [Oscar Luis Jimenez Gonzalez](https://github.com/oljimenez)
