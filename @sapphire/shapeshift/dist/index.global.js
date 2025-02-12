var SapphireShapeshift = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    BaseError: () => BaseError,
    CombinedError: () => CombinedError,
    CombinedPropertyError: () => CombinedPropertyError,
    ExpectedConstraintError: () => ExpectedConstraintError,
    ExpectedValidationError: () => ExpectedValidationError,
    MissingPropertyError: () => MissingPropertyError,
    MultiplePossibilitiesConstraintError: () => MultiplePossibilitiesConstraintError,
    Result: () => Result,
    UnknownEnumValueError: () => UnknownEnumValueError,
    UnknownPropertyError: () => UnknownPropertyError,
    ValidationError: () => ValidationError,
    customInspectSymbol: () => customInspectSymbol,
    customInspectSymbolStackLess: () => customInspectSymbolStackLess,
    s: () => s
  });

  // src/lib/Result.ts
  var Result = class {
    constructor(success, value, error) {
      this.success = success;
      if (success) {
        this.value = value;
      } else {
        this.error = error;
      }
    }
    isOk() {
      return this.success;
    }
    isErr() {
      return !this.success;
    }
    unwrap() {
      if (this.isOk())
        return this.value;
      throw this.error;
    }
    static ok(value) {
      return new Result(true, value);
    }
    static err(error) {
      return new Result(false, void 0, error);
    }
  };
  __name(Result, "Result");

  // src/validators/BaseValidator.ts
  var BaseValidator = class {
    constructor(constraints = []) {
      this.constraints = [];
      this.constraints = constraints;
    }
    get optional() {
      return new UnionValidator([new LiteralValidator(void 0), this.clone()]);
    }
    get nullable() {
      return new UnionValidator([new LiteralValidator(null), this.clone()]);
    }
    get nullish() {
      return new UnionValidator([new NullishValidator(), this.clone()]);
    }
    get array() {
      return new ArrayValidator(this.clone());
    }
    get set() {
      return new SetValidator(this.clone());
    }
    or(...predicates) {
      return new UnionValidator([this.clone(), ...predicates]);
    }
    transform(cb) {
      return this.addConstraint({ run: (input) => Result.ok(cb(input)) });
    }
    default(value) {
      return new DefaultValidator(this.clone(), value);
    }
    run(value) {
      let result = this.handle(value);
      if (result.isErr())
        return result;
      for (const constraint of this.constraints) {
        result = constraint.run(result.value);
        if (result.isErr())
          break;
      }
      return result;
    }
    parse(value) {
      return this.constraints.reduce((v, constraint) => constraint.run(v).unwrap(), this.handle(value).unwrap());
    }
    clone() {
      return Reflect.construct(this.constructor, [this.constraints]);
    }
    addConstraint(constraint) {
      const clone = this.clone();
      clone.constraints = clone.constraints.concat(constraint);
      return clone;
    }
  };
  __name(BaseValidator, "BaseValidator");

  // src/lib/errors/ExpectedConstraintError.ts
  var import_node_util = __require("util");

  // src/lib/errors/BaseError.ts
  var customInspectSymbol = Symbol.for("nodejs.util.inspect.custom");
  var customInspectSymbolStackLess = Symbol.for("nodejs.util.inspect.custom.stack-less");
  var BaseError = class extends Error {
    [customInspectSymbol](depth, options) {
      return `${this[customInspectSymbolStackLess](depth, options)}
${this.stack.slice(this.stack.indexOf("\n"))}`;
    }
  };
  __name(BaseError, "BaseError");

  // src/lib/errors/BaseConstraintError.ts
  var BaseConstraintError = class extends BaseError {
    constructor(constraint, message, given) {
      super(message);
      this.constraint = constraint;
      this.given = given;
    }
  };
  __name(BaseConstraintError, "BaseConstraintError");

  // src/lib/errors/ExpectedConstraintError.ts
  var ExpectedConstraintError = class extends BaseConstraintError {
    constructor(constraint, message, given, expected) {
      super(constraint, message, given);
      this.expected = expected;
    }
    toJSON() {
      return {
        name: this.name,
        constraint: this.constraint,
        given: this.given,
        expected: this.expected
      };
    }
    [customInspectSymbolStackLess](depth, options) {
      const constraint = options.stylize(this.constraint, "string");
      if (depth < 0) {
        return options.stylize(`[ExpectedConstraintError: ${constraint}]`, "special");
      }
      const newOptions = { ...options, depth: options.depth === null ? null : options.depth - 1 };
      const padding = `
  ${options.stylize("|", "undefined")} `;
      const given = (0, import_node_util.inspect)(this.given, newOptions).replaceAll("\n", padding);
      const header = `${options.stylize("ExpectedConstraintError", "special")} > ${constraint}`;
      const message = options.stylize(this.message, "regexp");
      const expectedBlock = `
  ${options.stylize("Expected: ", "string")}${options.stylize(this.expected, "boolean")}`;
      const givenBlock = `
  ${options.stylize("Received:", "regexp")}${padding}${given}`;
      return `${header}
  ${message}
${expectedBlock}
${givenBlock}`;
    }
  };
  __name(ExpectedConstraintError, "ExpectedConstraintError");

  // src/constraints/util/operators.ts
  function lt(a, b) {
    return a < b;
  }
  __name(lt, "lt");
  function le(a, b) {
    return a <= b;
  }
  __name(le, "le");
  function gt(a, b) {
    return a > b;
  }
  __name(gt, "gt");
  function ge(a, b) {
    return a >= b;
  }
  __name(ge, "ge");
  function eq(a, b) {
    return a === b;
  }
  __name(eq, "eq");
  function ne(a, b) {
    return a !== b;
  }
  __name(ne, "ne");

  // src/constraints/ArrayLengthConstraints.ts
  function arrayLengthComparator(comparator, name, expected, length) {
    return {
      run(input) {
        return comparator(input.length, length) ? Result.ok(input) : Result.err(new ExpectedConstraintError(name, "Invalid Array length", input, expected));
      }
    };
  }
  __name(arrayLengthComparator, "arrayLengthComparator");
  function arrayLengthLt(value) {
    const expected = `expected.length < ${value}`;
    return arrayLengthComparator(lt, "s.array(T).lengthLt", expected, value);
  }
  __name(arrayLengthLt, "arrayLengthLt");
  function arrayLengthLe(value) {
    const expected = `expected.length <= ${value}`;
    return arrayLengthComparator(le, "s.array(T).lengthLe", expected, value);
  }
  __name(arrayLengthLe, "arrayLengthLe");
  function arrayLengthGt(value) {
    const expected = `expected.length > ${value}`;
    return arrayLengthComparator(gt, "s.array(T).lengthGt", expected, value);
  }
  __name(arrayLengthGt, "arrayLengthGt");
  function arrayLengthGe(value) {
    const expected = `expected.length >= ${value}`;
    return arrayLengthComparator(ge, "s.array(T).lengthGe", expected, value);
  }
  __name(arrayLengthGe, "arrayLengthGe");
  function arrayLengthEq(value) {
    const expected = `expected.length === ${value}`;
    return arrayLengthComparator(eq, "s.array(T).lengthEq", expected, value);
  }
  __name(arrayLengthEq, "arrayLengthEq");
  function arrayLengthNe(value) {
    const expected = `expected.length !== ${value}`;
    return arrayLengthComparator(ne, "s.array(T).lengthNe", expected, value);
  }
  __name(arrayLengthNe, "arrayLengthNe");
  function arrayLengthRange(start, endBefore) {
    const expected = `expected.length >= ${start} && expected.length < ${endBefore}`;
    return {
      run(input) {
        return input.length >= start && input.length < endBefore ? Result.ok(input) : Result.err(new ExpectedConstraintError("s.array(T).lengthRange", "Invalid Array length", input, expected));
      }
    };
  }
  __name(arrayLengthRange, "arrayLengthRange");
  function arrayLengthRangeInclusive(start, end) {
    const expected = `expected.length >= ${start} && expected.length <= ${end}`;
    return {
      run(input) {
        return input.length >= start && input.length <= end ? Result.ok(input) : Result.err(new ExpectedConstraintError("s.array(T).lengthRangeInclusive", "Invalid Array length", input, expected));
      }
    };
  }
  __name(arrayLengthRangeInclusive, "arrayLengthRangeInclusive");
  function arrayLengthRangeExclusive(startAfter, endBefore) {
    const expected = `expected.length > ${startAfter} && expected.length < ${endBefore}`;
    return {
      run(input) {
        return input.length > startAfter && input.length < endBefore ? Result.ok(input) : Result.err(new ExpectedConstraintError("s.array(T).lengthRangeExclusive", "Invalid Array length", input, expected));
      }
    };
  }
  __name(arrayLengthRangeExclusive, "arrayLengthRangeExclusive");

  // src/lib/errors/CombinedPropertyError.ts
  var CombinedPropertyError = class extends BaseError {
    constructor(errors) {
      super("Received one or more errors");
      this.errors = errors;
    }
    [customInspectSymbolStackLess](depth, options) {
      if (depth < 0) {
        return options.stylize("[CombinedPropertyError]", "special");
      }
      const newOptions = { ...options, depth: options.depth === null ? null : options.depth - 1, compact: true };
      const padding = `
  ${options.stylize("|", "undefined")} `;
      const header = `${options.stylize("CombinedPropertyError", "special")} (${options.stylize(this.errors.length.toString(), "number")})`;
      const message = options.stylize(this.message, "regexp");
      const errors = this.errors.map(([key, error]) => {
        const property = CombinedPropertyError.formatProperty(key, options);
        const body = error[customInspectSymbolStackLess](depth - 1, newOptions).replaceAll("\n", padding);
        return `  input${property}${padding}${body}`;
      }).join("\n\n");
      return `${header}
  ${message}

${errors}`;
    }
    static formatProperty(key, options) {
      if (typeof key === "string")
        return options.stylize(`.${key}`, "symbol");
      if (typeof key === "number")
        return `[${options.stylize(key.toString(), "number")}]`;
      return `[${options.stylize("Symbol", "symbol")}(${key.description})]`;
    }
  };
  __name(CombinedPropertyError, "CombinedPropertyError");

  // src/lib/errors/ValidationError.ts
  var import_node_util2 = __require("util");
  var ValidationError = class extends BaseError {
    constructor(validator, message, given) {
      super(message);
      this.validator = validator;
      this.given = given;
    }
    toJSON() {
      return {
        name: this.name,
        validator: this.validator,
        given: this.given
      };
    }
    [customInspectSymbolStackLess](depth, options) {
      const validator = options.stylize(this.validator, "string");
      if (depth < 0) {
        return options.stylize(`[ValidationError: ${validator}]`, "special");
      }
      const newOptions = { ...options, depth: options.depth === null ? null : options.depth - 1, compact: true };
      const padding = `
  ${options.stylize("|", "undefined")} `;
      const given = (0, import_node_util2.inspect)(this.given, newOptions).replaceAll("\n", padding);
      const header = `${options.stylize("ValidationError", "special")} > ${validator}`;
      const message = options.stylize(this.message, "regexp");
      const givenBlock = `
  ${options.stylize("Received:", "regexp")}${padding}${given}`;
      return `${header}
  ${message}
${givenBlock}`;
    }
  };
  __name(ValidationError, "ValidationError");

  // src/validators/ArrayValidator.ts
  var ArrayValidator = class extends BaseValidator {
    constructor(validator, constraints = []) {
      super(constraints);
      this.validator = validator;
    }
    lengthLt(length) {
      return this.addConstraint(arrayLengthLt(length));
    }
    lengthLe(length) {
      return this.addConstraint(arrayLengthLe(length));
    }
    lengthGt(length) {
      return this.addConstraint(arrayLengthGt(length));
    }
    lengthGe(length) {
      return this.addConstraint(arrayLengthGe(length));
    }
    lengthEq(length) {
      return this.addConstraint(arrayLengthEq(length));
    }
    lengthNe(length) {
      return this.addConstraint(arrayLengthNe(length));
    }
    lengthRange(start, endBefore) {
      return this.addConstraint(arrayLengthRange(start, endBefore));
    }
    lengthRangeInclusive(startAt, endAt) {
      return this.addConstraint(arrayLengthRangeInclusive(startAt, endAt));
    }
    lengthRangeExclusive(startAfter, endBefore) {
      return this.addConstraint(arrayLengthRangeExclusive(startAfter, endBefore));
    }
    clone() {
      return Reflect.construct(this.constructor, [this.validator, this.constraints]);
    }
    handle(values) {
      if (!Array.isArray(values)) {
        return Result.err(new ValidationError("s.array(T)", "Expected an array", values));
      }
      const errors = [];
      const transformed = [];
      for (let i = 0; i < values.length; i++) {
        const result = this.validator.run(values[i]);
        if (result.isOk())
          transformed.push(result.value);
        else
          errors.push([i, result.error]);
      }
      return errors.length === 0 ? Result.ok(transformed) : Result.err(new CombinedPropertyError(errors));
    }
  };
  __name(ArrayValidator, "ArrayValidator");

  // src/constraints/BigIntConstraints.ts
  function bigintComparator(comparator, name, expected, number) {
    return {
      run(input) {
        return comparator(input, number) ? Result.ok(input) : Result.err(new ExpectedConstraintError(name, "Invalid bigint value", input, expected));
      }
    };
  }
  __name(bigintComparator, "bigintComparator");
  function bigintLt(value) {
    const expected = `expected < ${value}n`;
    return bigintComparator(lt, "s.bigint.lt", expected, value);
  }
  __name(bigintLt, "bigintLt");
  function bigintLe(value) {
    const expected = `expected <= ${value}n`;
    return bigintComparator(le, "s.bigint.le", expected, value);
  }
  __name(bigintLe, "bigintLe");
  function bigintGt(value) {
    const expected = `expected > ${value}n`;
    return bigintComparator(gt, "s.bigint.gt", expected, value);
  }
  __name(bigintGt, "bigintGt");
  function bigintGe(value) {
    const expected = `expected >= ${value}n`;
    return bigintComparator(ge, "s.bigint.ge", expected, value);
  }
  __name(bigintGe, "bigintGe");
  function bigintEq(value) {
    const expected = `expected === ${value}n`;
    return bigintComparator(eq, "s.bigint.eq", expected, value);
  }
  __name(bigintEq, "bigintEq");
  function bigintNe(value) {
    const expected = `expected !== ${value}n`;
    return bigintComparator(ne, "s.bigint.ne", expected, value);
  }
  __name(bigintNe, "bigintNe");
  function bigintDivisibleBy(divider) {
    const expected = `expected % ${divider}n === 0n`;
    return {
      run(input) {
        return input % divider === 0n ? Result.ok(input) : Result.err(new ExpectedConstraintError("s.bigint.divisibleBy", "BigInt is not divisible", input, expected));
      }
    };
  }
  __name(bigintDivisibleBy, "bigintDivisibleBy");

  // src/validators/BigIntValidator.ts
  var BigIntValidator = class extends BaseValidator {
    lt(number) {
      return this.addConstraint(bigintLt(number));
    }
    le(number) {
      return this.addConstraint(bigintLe(number));
    }
    gt(number) {
      return this.addConstraint(bigintGt(number));
    }
    ge(number) {
      return this.addConstraint(bigintGe(number));
    }
    eq(number) {
      return this.addConstraint(bigintEq(number));
    }
    ne(number) {
      return this.addConstraint(bigintNe(number));
    }
    get positive() {
      return this.ge(0n);
    }
    get negative() {
      return this.lt(0n);
    }
    divisibleBy(number) {
      return this.addConstraint(bigintDivisibleBy(number));
    }
    get abs() {
      return this.transform((value) => value < 0 ? -value : value);
    }
    intN(bits) {
      return this.transform((value) => BigInt.asIntN(bits, value));
    }
    uintN(bits) {
      return this.transform((value) => BigInt.asUintN(bits, value));
    }
    handle(value) {
      return typeof value === "bigint" ? Result.ok(value) : Result.err(new ValidationError("s.bigint", "Expected a bigint primitive", value));
    }
  };
  __name(BigIntValidator, "BigIntValidator");

  // src/constraints/BooleanConstraints.ts
  var booleanTrue = {
    run(input) {
      return input ? Result.ok(input) : Result.err(new ExpectedConstraintError("s.boolean.true", "Invalid boolean value", input, "true"));
    }
  };
  var booleanFalse = {
    run(input) {
      return input ? Result.err(new ExpectedConstraintError("s.boolean.false", "Invalid boolean value", input, "false")) : Result.ok(input);
    }
  };

  // src/validators/BooleanValidator.ts
  var BooleanValidator = class extends BaseValidator {
    get true() {
      return this.addConstraint(booleanTrue);
    }
    get false() {
      return this.addConstraint(booleanFalse);
    }
    eq(value) {
      return value ? this.true : this.false;
    }
    ne(value) {
      return value ? this.false : this.true;
    }
    handle(value) {
      return typeof value === "boolean" ? Result.ok(value) : Result.err(new ValidationError("s.boolean", "Expected a boolean primitive", value));
    }
  };
  __name(BooleanValidator, "BooleanValidator");

  // src/constraints/DateConstraints.ts
  function dateComparator(comparator, name, expected, number) {
    return {
      run(input) {
        return comparator(input.getTime(), number) ? Result.ok(input) : Result.err(new ExpectedConstraintError(name, "Invalid Date value", input, expected));
      }
    };
  }
  __name(dateComparator, "dateComparator");
  function dateLt(value) {
    const expected = `expected < ${value.toISOString()}`;
    return dateComparator(lt, "s.date.lt", expected, value.getTime());
  }
  __name(dateLt, "dateLt");
  function dateLe(value) {
    const expected = `expected <= ${value.toISOString()}`;
    return dateComparator(le, "s.date.le", expected, value.getTime());
  }
  __name(dateLe, "dateLe");
  function dateGt(value) {
    const expected = `expected > ${value.toISOString()}`;
    return dateComparator(gt, "s.date.gt", expected, value.getTime());
  }
  __name(dateGt, "dateGt");
  function dateGe(value) {
    const expected = `expected >= ${value.toISOString()}`;
    return dateComparator(ge, "s.date.ge", expected, value.getTime());
  }
  __name(dateGe, "dateGe");
  function dateEq(value) {
    const expected = `expected === ${value.toISOString()}`;
    return dateComparator(eq, "s.date.eq", expected, value.getTime());
  }
  __name(dateEq, "dateEq");
  function dateNe(value) {
    const expected = `expected !== ${value.toISOString()}`;
    return dateComparator(ne, "s.date.ne", expected, value.getTime());
  }
  __name(dateNe, "dateNe");
  var dateInvalid = {
    run(input) {
      return Number.isNaN(input.getTime()) ? Result.ok(input) : Result.err(new ExpectedConstraintError("s.date.invalid", "Invalid Date value", input, "expected === NaN"));
    }
  };
  var dateValid = {
    run(input) {
      return Number.isNaN(input.getTime()) ? Result.err(new ExpectedConstraintError("s.date.valid", "Invalid Date value", input, "expected !== NaN")) : Result.ok(input);
    }
  };

  // src/validators/DateValidator.ts
  var DateValidator = class extends BaseValidator {
    lt(date) {
      return this.addConstraint(dateLt(new Date(date)));
    }
    le(date) {
      return this.addConstraint(dateLe(new Date(date)));
    }
    gt(date) {
      return this.addConstraint(dateGt(new Date(date)));
    }
    ge(date) {
      return this.addConstraint(dateGe(new Date(date)));
    }
    eq(date) {
      const resolved = new Date(date);
      return Number.isNaN(resolved.getTime()) ? this.invalid : this.addConstraint(dateEq(resolved));
    }
    ne(date) {
      const resolved = new Date(date);
      return Number.isNaN(resolved.getTime()) ? this.valid : this.addConstraint(dateNe(resolved));
    }
    get valid() {
      return this.addConstraint(dateValid);
    }
    get invalid() {
      return this.addConstraint(dateInvalid);
    }
    handle(value) {
      return value instanceof Date ? Result.ok(value) : Result.err(new ValidationError("s.date", "Expected a Date", value));
    }
  };
  __name(DateValidator, "DateValidator");

  // src/lib/errors/ExpectedValidationError.ts
  var import_node_util3 = __require("util");
  var ExpectedValidationError = class extends ValidationError {
    constructor(validator, message, given, expected) {
      super(validator, message, given);
      this.expected = expected;
    }
    toJSON() {
      return {
        name: this.name,
        validator: this.validator,
        given: this.given,
        expected: this.expected
      };
    }
    [customInspectSymbolStackLess](depth, options) {
      const validator = options.stylize(this.validator, "string");
      if (depth < 0) {
        return options.stylize(`[ExpectedValidationError: ${validator}]`, "special");
      }
      const newOptions = { ...options, depth: options.depth === null ? null : options.depth - 1 };
      const padding = `
  ${options.stylize("|", "undefined")} `;
      const expected = (0, import_node_util3.inspect)(this.expected, newOptions).replaceAll("\n", padding);
      const given = (0, import_node_util3.inspect)(this.given, newOptions).replaceAll("\n", padding);
      const header = `${options.stylize("ExpectedValidationError", "special")} > ${validator}`;
      const message = options.stylize(this.message, "regexp");
      const expectedBlock = `
  ${options.stylize("Expected:", "string")}${padding}${expected}`;
      const givenBlock = `
  ${options.stylize("Received:", "regexp")}${padding}${given}`;
      return `${header}
  ${message}
${expectedBlock}
${givenBlock}`;
    }
  };
  __name(ExpectedValidationError, "ExpectedValidationError");

  // src/validators/InstanceValidator.ts
  var InstanceValidator = class extends BaseValidator {
    constructor(expected, constraints = []) {
      super(constraints);
      this.expected = expected;
    }
    handle(value) {
      return value instanceof this.expected ? Result.ok(value) : Result.err(new ExpectedValidationError("s.instance(V)", "Expected", value, this.expected));
    }
    clone() {
      return Reflect.construct(this.constructor, [this.expected, this.constraints]);
    }
  };
  __name(InstanceValidator, "InstanceValidator");

  // src/validators/LiteralValidator.ts
  var LiteralValidator = class extends BaseValidator {
    constructor(literal, constraints = []) {
      super(constraints);
      this.expected = literal;
    }
    handle(value) {
      return Object.is(value, this.expected) ? Result.ok(value) : Result.err(new ExpectedValidationError("s.literal(V)", "Expected values to be equals", value, this.expected));
    }
    clone() {
      return Reflect.construct(this.constructor, [this.expected, this.constraints]);
    }
  };
  __name(LiteralValidator, "LiteralValidator");

  // src/validators/NeverValidator.ts
  var NeverValidator = class extends BaseValidator {
    handle(value) {
      return Result.err(new ValidationError("s.never", "Expected a value to not be passed", value));
    }
  };
  __name(NeverValidator, "NeverValidator");

  // src/validators/NullishValidator.ts
  var NullishValidator = class extends BaseValidator {
    handle(value) {
      return value === void 0 || value === null ? Result.ok(value) : Result.err(new ValidationError("s.nullish", "Expected undefined or null", value));
    }
  };
  __name(NullishValidator, "NullishValidator");

  // src/constraints/NumberConstraints.ts
  function numberComparator(comparator, name, expected, number) {
    return {
      run(input) {
        return comparator(input, number) ? Result.ok(input) : Result.err(new ExpectedConstraintError(name, "Invalid number value", input, expected));
      }
    };
  }
  __name(numberComparator, "numberComparator");
  function numberLt(value) {
    const expected = `expected < ${value}`;
    return numberComparator(lt, "s.number.lt", expected, value);
  }
  __name(numberLt, "numberLt");
  function numberLe(value) {
    const expected = `expected <= ${value}`;
    return numberComparator(le, "s.number.le", expected, value);
  }
  __name(numberLe, "numberLe");
  function numberGt(value) {
    const expected = `expected > ${value}`;
    return numberComparator(gt, "s.number.gt", expected, value);
  }
  __name(numberGt, "numberGt");
  function numberGe(value) {
    const expected = `expected >= ${value}`;
    return numberComparator(ge, "s.number.ge", expected, value);
  }
  __name(numberGe, "numberGe");
  function numberEq(value) {
    const expected = `expected === ${value}`;
    return numberComparator(eq, "s.number.eq", expected, value);
  }
  __name(numberEq, "numberEq");
  function numberNe(value) {
    const expected = `expected !== ${value}`;
    return numberComparator(ne, "s.number.ne", expected, value);
  }
  __name(numberNe, "numberNe");
  var numberInt = {
    run(input) {
      return Number.isInteger(input) ? Result.ok(input) : Result.err(new ExpectedConstraintError("s.number.int", "Given value is not an integer", input, "Number.isInteger(expected) to be true"));
    }
  };
  var numberSafeInt = {
    run(input) {
      return Number.isSafeInteger(input) ? Result.ok(input) : Result.err(new ExpectedConstraintError("s.number.safeInt", "Given value is not a safe integer", input, "Number.isSafeInteger(expected) to be true"));
    }
  };
  var numberFinite = {
    run(input) {
      return Number.isFinite(input) ? Result.ok(input) : Result.err(new ExpectedConstraintError("s.number.finite", "Given value is not finite", input, "Number.isFinite(expected) to be true"));
    }
  };
  var numberNaN = {
    run(input) {
      return Number.isNaN(input) ? Result.ok(input) : Result.err(new ExpectedConstraintError("s.number.eq(NaN)", "Invalid number value", input, "expected === NaN"));
    }
  };
  var numberNeNaN = {
    run(input) {
      return Number.isNaN(input) ? Result.err(new ExpectedConstraintError("s.number.ne(NaN)", "Invalid number value", input, "expected !== NaN")) : Result.ok(input);
    }
  };
  function numberDivisibleBy(divider) {
    const expected = `expected % ${divider} === 0`;
    return {
      run(input) {
        return input % divider === 0 ? Result.ok(input) : Result.err(new ExpectedConstraintError("s.number.divisibleBy", "Number is not divisible", input, expected));
      }
    };
  }
  __name(numberDivisibleBy, "numberDivisibleBy");

  // src/validators/NumberValidator.ts
  var NumberValidator = class extends BaseValidator {
    lt(number) {
      return this.addConstraint(numberLt(number));
    }
    le(number) {
      return this.addConstraint(numberLe(number));
    }
    gt(number) {
      return this.addConstraint(numberGt(number));
    }
    ge(number) {
      return this.addConstraint(numberGe(number));
    }
    eq(number) {
      return Number.isNaN(number) ? this.addConstraint(numberNaN) : this.addConstraint(numberEq(number));
    }
    ne(number) {
      return Number.isNaN(number) ? this.addConstraint(numberNeNaN) : this.addConstraint(numberNe(number));
    }
    get int() {
      return this.addConstraint(numberInt);
    }
    get safeInt() {
      return this.addConstraint(numberSafeInt);
    }
    get finite() {
      return this.addConstraint(numberFinite);
    }
    get positive() {
      return this.ge(0);
    }
    get negative() {
      return this.lt(0);
    }
    divisibleBy(divider) {
      return this.addConstraint(numberDivisibleBy(divider));
    }
    get abs() {
      return this.transform(Math.abs);
    }
    get sign() {
      return this.transform(Math.sign);
    }
    get trunc() {
      return this.transform(Math.trunc);
    }
    get floor() {
      return this.transform(Math.floor);
    }
    get fround() {
      return this.transform(Math.fround);
    }
    get round() {
      return this.transform(Math.round);
    }
    get ceil() {
      return this.transform(Math.ceil);
    }
    handle(value) {
      return typeof value === "number" ? Result.ok(value) : Result.err(new ValidationError("s.number", "Expected a number primitive", value));
    }
  };
  __name(NumberValidator, "NumberValidator");

  // src/lib/errors/MissingPropertyError.ts
  var MissingPropertyError = class extends BaseError {
    constructor(property) {
      super("A required property is missing");
      this.property = property;
    }
    toJSON() {
      return {
        name: this.name,
        property: this.property
      };
    }
    [customInspectSymbolStackLess](depth, options) {
      const property = options.stylize(this.property.toString(), "string");
      if (depth < 0) {
        return options.stylize(`[MissingPropertyError: ${property}]`, "special");
      }
      const header = `${options.stylize("MissingPropertyError", "special")} > ${property}`;
      const message = options.stylize(this.message, "regexp");
      return `${header}
  ${message}`;
    }
  };
  __name(MissingPropertyError, "MissingPropertyError");

  // src/lib/errors/UnknownPropertyError.ts
  var import_node_util4 = __require("util");
  var UnknownPropertyError = class extends BaseError {
    constructor(property, value) {
      super("Received unexpected property");
      this.property = property;
      this.value = value;
    }
    toJSON() {
      return {
        name: this.name,
        property: this.property,
        value: this.value
      };
    }
    [customInspectSymbolStackLess](depth, options) {
      const property = options.stylize(this.property.toString(), "string");
      if (depth < 0) {
        return options.stylize(`[UnknownPropertyError: ${property}]`, "special");
      }
      const newOptions = { ...options, depth: options.depth === null ? null : options.depth - 1, compact: true };
      const padding = `
  ${options.stylize("|", "undefined")} `;
      const given = (0, import_node_util4.inspect)(this.value, newOptions).replaceAll("\n", padding);
      const header = `${options.stylize("UnknownPropertyError", "special")} > ${property}`;
      const message = options.stylize(this.message, "regexp");
      const givenBlock = `
  ${options.stylize("Received:", "regexp")}${padding}${given}`;
      return `${header}
  ${message}
${givenBlock}`;
    }
  };
  __name(UnknownPropertyError, "UnknownPropertyError");

  // src/validators/ObjectValidator.ts
  var ObjectValidator = class extends BaseValidator {
    constructor(shape, strategy = ObjectValidatorStrategy.Ignore, constraints = []) {
      super(constraints);
      this.shape = shape;
      this.keys = Object.keys(shape);
      this.strategy = strategy;
      switch (this.strategy) {
        case ObjectValidatorStrategy.Ignore:
          this.handleStrategy = (value) => this.handleIgnoreStrategy(value);
          break;
        case ObjectValidatorStrategy.Strict: {
          this.handleStrategy = (value) => this.handleStrictStrategy(value);
          break;
        }
        case ObjectValidatorStrategy.Passthrough:
          this.handleStrategy = (value) => this.handlePassthroughStrategy(value);
          break;
      }
    }
    get strict() {
      return Reflect.construct(this.constructor, [this.shape, ObjectValidatorStrategy.Strict, this.constraints]);
    }
    get ignore() {
      return Reflect.construct(this.constructor, [this.shape, ObjectValidatorStrategy.Ignore, this.constraints]);
    }
    get passthrough() {
      return Reflect.construct(this.constructor, [this.shape, ObjectValidatorStrategy.Passthrough, this.constraints]);
    }
    get partial() {
      const shape = Object.fromEntries(this.keys.map((key) => [key, this.shape[key].optional]));
      return Reflect.construct(this.constructor, [shape, this.strategy, this.constraints]);
    }
    extend(schema) {
      const shape = { ...this.shape, ...schema instanceof ObjectValidator ? schema.shape : schema };
      return Reflect.construct(this.constructor, [shape, this.strategy, this.constraints]);
    }
    pick(keys) {
      const shape = Object.fromEntries(keys.filter((key) => this.keys.includes(key)).map((key) => [key, this.shape[key]]));
      return Reflect.construct(this.constructor, [shape, this.strategy, this.constraints]);
    }
    omit(keys) {
      const shape = Object.fromEntries(this.keys.filter((key) => !keys.includes(key)).map((key) => [key, this.shape[key]]));
      return Reflect.construct(this.constructor, [shape, this.strategy, this.constraints]);
    }
    handle(value) {
      const typeOfValue = typeof value;
      if (typeOfValue !== "object") {
        return Result.err(new ValidationError("s.object(T)", `Expected the value to be an object, but received ${typeOfValue} instead`, value));
      }
      if (value === null) {
        return Result.err(new ValidationError("s.object(T)", "Expected the value to not be null", value));
      }
      return this.handleStrategy(value);
    }
    clone() {
      return Reflect.construct(this.constructor, [this.shape, this.strategy, this.constraints]);
    }
    handleIgnoreStrategy(value, errors = []) {
      const entries = {};
      let i = this.keys.length;
      while (i--) {
        const key = this.keys[i];
        const result = this.shape[key].run(value[key]);
        if (result.isOk()) {
          entries[key] = result.value;
        } else {
          const error = result.error;
          if (error instanceof ValidationError && error.given === void 0) {
            errors.push([key, new MissingPropertyError(key)]);
          } else {
            errors.push([key, error]);
          }
        }
      }
      return errors.length === 0 ? Result.ok(entries) : Result.err(new CombinedPropertyError(errors));
    }
    handleStrictStrategy(value) {
      const errors = [];
      const finalResult = {};
      const keysToIterateOver = [.../* @__PURE__ */ new Set([...Object.keys(value), ...this.keys])].reverse();
      let i = keysToIterateOver.length;
      while (i--) {
        const key = keysToIterateOver[i];
        if (Object.prototype.hasOwnProperty.call(this.shape, key)) {
          const result = this.shape[key].run(value[key]);
          if (result.isOk()) {
            finalResult[key] = result.value;
          } else {
            const error = result.error;
            if (error instanceof ValidationError && error.given === void 0) {
              errors.push([key, new MissingPropertyError(key)]);
            } else {
              errors.push([key, error]);
            }
          }
          continue;
        }
        errors.push([key, new UnknownPropertyError(key, value[key])]);
      }
      return errors.length === 0 ? Result.ok(finalResult) : Result.err(new CombinedPropertyError(errors));
    }
    handlePassthroughStrategy(value) {
      const result = this.handleIgnoreStrategy(value);
      return result.isErr() ? result : Result.ok({ ...value, ...result.value });
    }
  };
  __name(ObjectValidator, "ObjectValidator");
  var ObjectValidatorStrategy = /* @__PURE__ */ ((ObjectValidatorStrategy2) => {
    ObjectValidatorStrategy2[ObjectValidatorStrategy2["Ignore"] = 0] = "Ignore";
    ObjectValidatorStrategy2[ObjectValidatorStrategy2["Strict"] = 1] = "Strict";
    ObjectValidatorStrategy2[ObjectValidatorStrategy2["Passthrough"] = 2] = "Passthrough";
    return ObjectValidatorStrategy2;
  })(ObjectValidatorStrategy || {});

  // src/validators/PassthroughValidator.ts
  var PassthroughValidator = class extends BaseValidator {
    handle(value) {
      return Result.ok(value);
    }
  };
  __name(PassthroughValidator, "PassthroughValidator");

  // src/validators/RecordValidator.ts
  var RecordValidator = class extends BaseValidator {
    constructor(validator, constraints = []) {
      super(constraints);
      this.validator = validator;
    }
    clone() {
      return Reflect.construct(this.constructor, [this.validator, this.constraints]);
    }
    handle(value) {
      if (typeof value !== "object") {
        return Result.err(new ValidationError("s.record(T)", "Expected an object", value));
      }
      if (value === null) {
        return Result.err(new ValidationError("s.record(T)", "Expected the value to not be null", value));
      }
      const errors = [];
      const transformed = {};
      for (const [key, val] of Object.entries(value)) {
        const result = this.validator.run(val);
        if (result.isOk())
          transformed[key] = result.value;
        else
          errors.push([key, result.error]);
      }
      return errors.length === 0 ? Result.ok(transformed) : Result.err(new CombinedPropertyError(errors));
    }
  };
  __name(RecordValidator, "RecordValidator");

  // src/lib/errors/CombinedError.ts
  var CombinedError = class extends BaseError {
    constructor(errors) {
      super("Received one or more errors");
      this.errors = errors;
    }
    [customInspectSymbolStackLess](depth, options) {
      if (depth < 0) {
        return options.stylize("[CombinedError]", "special");
      }
      const newOptions = { ...options, depth: options.depth === null ? null : options.depth - 1, compact: true };
      const padding = `
  ${options.stylize("|", "undefined")} `;
      const header = `${options.stylize("CombinedError", "special")} (${options.stylize(this.errors.length.toString(), "number")})`;
      const message = options.stylize(this.message, "regexp");
      const errors = this.errors.map((error, i) => {
        const index = options.stylize((i + 1).toString(), "number");
        const body = error[customInspectSymbolStackLess](depth - 1, newOptions).replaceAll("\n", padding);
        return `  ${index} ${body}`;
      }).join("\n\n");
      return `${header}
  ${message}

${errors}`;
    }
  };
  __name(CombinedError, "CombinedError");

  // src/validators/SetValidator.ts
  var SetValidator = class extends BaseValidator {
    constructor(validator, constraints = []) {
      super(constraints);
      this.validator = validator;
    }
    clone() {
      return Reflect.construct(this.constructor, [this.validator, this.constraints]);
    }
    handle(values) {
      if (!(values instanceof Set)) {
        return Result.err(new ValidationError("s.set(T)", "Expected a set", values));
      }
      const errors = [];
      const transformed = /* @__PURE__ */ new Set();
      for (const value of values) {
        const result = this.validator.run(value);
        if (result.isOk())
          transformed.add(result.value);
        else
          errors.push(result.error);
      }
      return errors.length === 0 ? Result.ok(transformed) : Result.err(new CombinedError(errors));
    }
  };
  __name(SetValidator, "SetValidator");

  // src/constraints/StringConstraints.ts
  var import_node_net = __require("net");

  // src/constraints/util/emailValidator.ts
  var accountRegex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")$/;
  function validateEmail(email) {
    if (!email)
      return false;
    const atIndex = email.indexOf("@");
    if (atIndex === -1)
      return false;
    if (atIndex > 64)
      return false;
    const domainIndex = atIndex + 1;
    if (email.includes("@", domainIndex))
      return false;
    if (email.length - domainIndex > 255)
      return false;
    let dotIndex = email.indexOf(".", domainIndex);
    if (dotIndex === -1)
      return false;
    let lastDotIndex = domainIndex;
    do {
      if (dotIndex - lastDotIndex > 63)
        return false;
      lastDotIndex = dotIndex + 1;
    } while ((dotIndex = email.indexOf(".", lastDotIndex)) !== -1);
    if (email.length - lastDotIndex > 63)
      return false;
    return accountRegex.test(email.slice(0, atIndex)) && validateEmailDomain(email.slice(domainIndex));
  }
  __name(validateEmail, "validateEmail");
  function validateEmailDomain(domain) {
    try {
      return new URL(`http://${domain}`).hostname === domain;
    } catch {
      return false;
    }
  }
  __name(validateEmailDomain, "validateEmailDomain");

  // src/lib/errors/MultiplePossibilitiesConstraintError.ts
  var import_node_util5 = __require("util");
  var MultiplePossibilitiesConstraintError = class extends BaseConstraintError {
    constructor(constraint, message, given, expected) {
      super(constraint, message, given);
      this.expected = expected;
    }
    toJSON() {
      return {
        name: this.name,
        constraint: this.constraint,
        given: this.given,
        expected: this.expected
      };
    }
    [customInspectSymbolStackLess](depth, options) {
      const constraint = options.stylize(this.constraint, "string");
      if (depth < 0) {
        return options.stylize(`[MultiplePossibilitiesConstraintError: ${constraint}]`, "special");
      }
      const newOptions = { ...options, depth: options.depth === null ? null : options.depth - 1 };
      const verticalLine = options.stylize("|", "undefined");
      const padding = `
  ${verticalLine} `;
      const given = (0, import_node_util5.inspect)(this.given, newOptions).replaceAll("\n", padding);
      const header = `${options.stylize("MultiplePossibilitiesConstraintError", "special")} > ${constraint}`;
      const message = options.stylize(this.message, "regexp");
      const expectedPadding = `
  ${verticalLine} - `;
      const expectedBlock = `
  ${options.stylize("Expected any of the following:", "string")}${expectedPadding}${this.expected.map((possible) => options.stylize(possible, "boolean")).join(expectedPadding)}`;
      const givenBlock = `
  ${options.stylize("Received:", "regexp")}${padding}${given}`;
      return `${header}
  ${message}
${expectedBlock}
${givenBlock}`;
    }
  };
  __name(MultiplePossibilitiesConstraintError, "MultiplePossibilitiesConstraintError");

  // src/constraints/util/common/combinedResultFn.ts
  function combinedErrorFn(...fns) {
    switch (fns.length) {
      case 0:
        return () => null;
      case 1:
        return fns[0];
      case 2: {
        const [fn0, fn1] = fns;
        return (...params) => fn0(...params) || fn1(...params);
      }
      default: {
        return (...params) => {
          for (const fn of fns) {
            const result = fn(...params);
            if (result)
              return result;
          }
          return null;
        };
      }
    }
  }
  __name(combinedErrorFn, "combinedErrorFn");

  // src/constraints/util/urlValidators.ts
  function createUrlValidators(options) {
    const fns = [];
    if (options?.allowedProtocols?.length)
      fns.push(allowedProtocolsFn(options.allowedProtocols));
    if (options?.allowedDomains?.length)
      fns.push(allowedDomainsFn(options.allowedDomains));
    return combinedErrorFn(...fns);
  }
  __name(createUrlValidators, "createUrlValidators");
  function allowedProtocolsFn(allowedProtocols) {
    return (input, url) => allowedProtocols.includes(url.protocol) ? null : new MultiplePossibilitiesConstraintError("s.string.url", "Invalid URL protocol", input, allowedProtocols);
  }
  __name(allowedProtocolsFn, "allowedProtocolsFn");
  function allowedDomainsFn(allowedDomains) {
    return (input, url) => allowedDomains.includes(url.hostname) ? null : new MultiplePossibilitiesConstraintError("s.string.url", "Invalid URL domain", input, allowedDomains);
  }
  __name(allowedDomainsFn, "allowedDomainsFn");

  // src/constraints/StringConstraints.ts
  function stringLengthComparator(comparator, name, expected, length) {
    return {
      run(input) {
        return comparator(input.length, length) ? Result.ok(input) : Result.err(new ExpectedConstraintError(name, "Invalid string length", input, expected));
      }
    };
  }
  __name(stringLengthComparator, "stringLengthComparator");
  function stringLengthLt(length) {
    const expected = `expected.length < ${length}`;
    return stringLengthComparator(lt, "s.string.lengthLt", expected, length);
  }
  __name(stringLengthLt, "stringLengthLt");
  function stringLengthLe(length) {
    const expected = `expected.length <= ${length}`;
    return stringLengthComparator(le, "s.string.lengthLe", expected, length);
  }
  __name(stringLengthLe, "stringLengthLe");
  function stringLengthGt(length) {
    const expected = `expected.length > ${length}`;
    return stringLengthComparator(gt, "s.string.lengthGt", expected, length);
  }
  __name(stringLengthGt, "stringLengthGt");
  function stringLengthGe(length) {
    const expected = `expected.length >= ${length}`;
    return stringLengthComparator(ge, "s.string.lengthGe", expected, length);
  }
  __name(stringLengthGe, "stringLengthGe");
  function stringLengthEq(length) {
    const expected = `expected.length === ${length}`;
    return stringLengthComparator(eq, "s.string.lengthEq", expected, length);
  }
  __name(stringLengthEq, "stringLengthEq");
  function stringLengthNe(length) {
    const expected = `expected.length !== ${length}`;
    return stringLengthComparator(ne, "s.string.lengthNe", expected, length);
  }
  __name(stringLengthNe, "stringLengthNe");
  function stringEmail() {
    return {
      run(input) {
        return validateEmail(input) ? Result.ok(input) : Result.err(new ExpectedConstraintError("s.string.email", "Invalid email address", input, "expected to be an email address"));
      }
    };
  }
  __name(stringEmail, "stringEmail");
  function stringRegexValidator(type, expected, regex) {
    return {
      run(input) {
        return regex.test(input) ? Result.ok(input) : Result.err(new ExpectedConstraintError(type, "Invalid string format", input, expected));
      }
    };
  }
  __name(stringRegexValidator, "stringRegexValidator");
  function stringUrl(options) {
    const validatorFn = createUrlValidators(options);
    return {
      run(input) {
        let url;
        try {
          url = new URL(input);
        } catch {
          return Result.err(new ExpectedConstraintError("s.string.url", "Invalid URL", input, "expected to match an URL"));
        }
        const validatorFnResult = validatorFn(input, url);
        if (validatorFnResult === null)
          return Result.ok(input);
        return Result.err(validatorFnResult);
      }
    };
  }
  __name(stringUrl, "stringUrl");
  function stringIp(version) {
    const ipVersion = version ? `v${version}` : "";
    const validatorFn = version === 4 ? import_node_net.isIPv4 : version === 6 ? import_node_net.isIPv6 : import_node_net.isIP;
    const name = `s.string.ip${ipVersion}`;
    const message = `Invalid IP${ipVersion} address`;
    const expected = `expected to be an IP${ipVersion} address`;
    return {
      run(input) {
        return validatorFn(input) ? Result.ok(input) : Result.err(new ExpectedConstraintError(name, message, input, expected));
      }
    };
  }
  __name(stringIp, "stringIp");
  function stringRegex(regex) {
    return stringRegexValidator("s.string.regex", `expected ${regex}.test(expected) to be true`, regex);
  }
  __name(stringRegex, "stringRegex");
  function stringUuid({ version = 4, nullable = false } = {}) {
    version ??= "1-5";
    const regex = new RegExp(`^(?:[0-9A-F]{8}-[0-9A-F]{4}-[${version}][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}${nullable ? "|00000000-0000-0000-0000-000000000000" : ""})$`, "i");
    const expected = `expected to match UUID${typeof version === "number" ? `v${version}` : ` in range of ${version}`}`;
    return stringRegexValidator("s.string.uuid", expected, regex);
  }
  __name(stringUuid, "stringUuid");

  // src/validators/StringValidator.ts
  var StringValidator = class extends BaseValidator {
    lengthLt(length) {
      return this.addConstraint(stringLengthLt(length));
    }
    lengthLe(length) {
      return this.addConstraint(stringLengthLe(length));
    }
    lengthGt(length) {
      return this.addConstraint(stringLengthGt(length));
    }
    lengthGe(length) {
      return this.addConstraint(stringLengthGe(length));
    }
    lengthEq(length) {
      return this.addConstraint(stringLengthEq(length));
    }
    lengthNe(length) {
      return this.addConstraint(stringLengthNe(length));
    }
    get email() {
      return this.addConstraint(stringEmail());
    }
    url(options) {
      return this.addConstraint(stringUrl(options));
    }
    uuid(options) {
      return this.addConstraint(stringUuid(options));
    }
    regex(regex) {
      return this.addConstraint(stringRegex(regex));
    }
    get ipv4() {
      return this.ip(4);
    }
    get ipv6() {
      return this.ip(6);
    }
    ip(version) {
      return this.addConstraint(stringIp(version));
    }
    handle(value) {
      return typeof value === "string" ? Result.ok(value) : Result.err(new ValidationError("s.string", "Expected a string primitive", value));
    }
  };
  __name(StringValidator, "StringValidator");

  // src/validators/TupleValidator.ts
  var TupleValidator = class extends BaseValidator {
    constructor(validators, constraints = []) {
      super(constraints);
      this.validators = [];
      this.validators = validators;
    }
    clone() {
      return Reflect.construct(this.constructor, [this.validators, this.constraints]);
    }
    handle(values) {
      if (!Array.isArray(values)) {
        return Result.err(new ValidationError("s.tuple(T)", "Expected an array", values));
      }
      if (values.length !== this.validators.length) {
        return Result.err(new ValidationError("s.tuple(T)", `Expected an array of length ${this.validators.length}`, values));
      }
      const errors = [];
      const transformed = [];
      for (let i = 0; i < values.length; i++) {
        const result = this.validators[i].run(values[i]);
        if (result.isOk())
          transformed.push(result.value);
        else
          errors.push([i, result.error]);
      }
      return errors.length === 0 ? Result.ok(transformed) : Result.err(new CombinedPropertyError(errors));
    }
  };
  __name(TupleValidator, "TupleValidator");

  // src/validators/UnionValidator.ts
  var UnionValidator = class extends BaseValidator {
    constructor(validators, constraints = []) {
      super(constraints);
      this.validators = validators;
    }
    get optional() {
      if (this.validators.length === 0)
        return new UnionValidator([new LiteralValidator(void 0)], this.constraints);
      const [validator] = this.validators;
      if (validator instanceof LiteralValidator) {
        if (validator.expected === void 0)
          return this.clone();
        if (validator.expected === null) {
          return new UnionValidator([new NullishValidator(), ...this.validators.slice(1)], this.constraints);
        }
      } else if (validator instanceof NullishValidator) {
        return this.clone();
      }
      return new UnionValidator([new LiteralValidator(void 0), ...this.validators]);
    }
    get nullable() {
      if (this.validators.length === 0)
        return new UnionValidator([new LiteralValidator(null)], this.constraints);
      const [validator] = this.validators;
      if (validator instanceof LiteralValidator) {
        if (validator.expected === null)
          return this.clone();
        if (validator.expected === void 0) {
          return new UnionValidator([new NullishValidator(), ...this.validators.slice(1)], this.constraints);
        }
      } else if (validator instanceof NullishValidator) {
        return this.clone();
      }
      return new UnionValidator([new LiteralValidator(null), ...this.validators]);
    }
    get nullish() {
      if (this.validators.length === 0)
        return new UnionValidator([new NullishValidator()], this.constraints);
      const [validator] = this.validators;
      if (validator instanceof LiteralValidator) {
        if (validator.expected === null || validator.expected === void 0) {
          return new UnionValidator([new NullishValidator(), ...this.validators.slice(1)], this.constraints);
        }
      } else if (validator instanceof NullishValidator) {
        return this.clone();
      }
      return new UnionValidator([new NullishValidator(), ...this.validators]);
    }
    or(...predicates) {
      return new UnionValidator([...this.validators, ...predicates]);
    }
    clone() {
      return Reflect.construct(this.constructor, [this.validators, this.constraints]);
    }
    handle(value) {
      const errors = [];
      for (const validator of this.validators) {
        const result = validator.run(value);
        if (result.isOk())
          return result;
        errors.push(result.error);
      }
      return Result.err(new CombinedError(errors));
    }
  };
  __name(UnionValidator, "UnionValidator");

  // src/validators/MapValidator.ts
  var MapValidator = class extends BaseValidator {
    constructor(keyValidator, valueValidator, constraints = []) {
      super(constraints);
      this.keyValidator = keyValidator;
      this.valueValidator = valueValidator;
    }
    clone() {
      return Reflect.construct(this.constructor, [this.keyValidator, this.valueValidator, this.constraints]);
    }
    handle(value) {
      if (!(value instanceof Map)) {
        return Result.err(new ValidationError("s.map(K, V)", "Expected a map", value));
      }
      const errors = [];
      const transformed = /* @__PURE__ */ new Map();
      for (const [key, val] of value.entries()) {
        const keyResult = this.keyValidator.run(key);
        const valueResult = this.valueValidator.run(val);
        const { length } = errors;
        if (keyResult.isErr())
          errors.push([key, keyResult.error]);
        if (valueResult.isErr())
          errors.push([key, valueResult.error]);
        if (errors.length === length)
          transformed.set(keyResult.value, valueResult.value);
      }
      return errors.length === 0 ? Result.ok(transformed) : Result.err(new CombinedPropertyError(errors));
    }
  };
  __name(MapValidator, "MapValidator");

  // src/validators/util/getValue.ts
  function getValue(valueOrFn) {
    return typeof valueOrFn === "function" ? valueOrFn() : valueOrFn;
  }
  __name(getValue, "getValue");

  // src/validators/DefaultValidator.ts
  var DefaultValidator = class extends BaseValidator {
    constructor(validator, value, constraints = []) {
      super(constraints);
      this.validator = validator;
      this.defaultValue = value;
    }
    default(value) {
      const clone = this.clone();
      clone.defaultValue = value;
      return clone;
    }
    handle(value) {
      return typeof value === "undefined" ? Result.ok(getValue(this.defaultValue)) : this.validator["handle"](value);
    }
    clone() {
      return Reflect.construct(this.constructor, [this.validator, this.defaultValue, this.constraints]);
    }
  };
  __name(DefaultValidator, "DefaultValidator");

  // src/lib/errors/UnknownEnumValueError.ts
  var UnknownEnumValueError = class extends BaseError {
    constructor(value, keys, enumMappings) {
      super("Expected the value to be one of the following enum values:");
      this.value = value;
      this.enumKeys = keys;
      this.enumMappings = enumMappings;
    }
    toJSON() {
      return {
        name: this.name,
        value: this.value,
        enumKeys: this.enumKeys,
        enumMappings: [...this.enumMappings.entries()]
      };
    }
    [customInspectSymbolStackLess](depth, options) {
      const value = options.stylize(this.value.toString(), "string");
      if (depth < 0) {
        return options.stylize(`[UnknownEnumValueError: ${value}]`, "special");
      }
      const padding = `
  ${options.stylize("|", "undefined")} `;
      const pairs = this.enumKeys.map((key) => {
        const enumValue = this.enumMappings.get(key);
        return `${options.stylize(key, "string")} or ${options.stylize(enumValue.toString(), typeof enumValue === "number" ? "number" : "string")}`;
      }).join(padding);
      const header = `${options.stylize("UnknownEnumValueError", "special")} > ${value}`;
      const message = options.stylize(this.message, "regexp");
      const pairsBlock = `${padding}${pairs}`;
      return `${header}
  ${message}
${pairsBlock}`;
    }
  };
  __name(UnknownEnumValueError, "UnknownEnumValueError");

  // src/validators/NativeEnumValidator.ts
  var NativeEnumValidator = class extends BaseValidator {
    constructor(enumShape) {
      super();
      this.hasNumericElements = false;
      this.enumMapping = /* @__PURE__ */ new Map();
      this.enumShape = enumShape;
      this.enumKeys = Object.keys(enumShape).filter((key) => {
        return typeof enumShape[enumShape[key]] !== "number";
      });
      for (const key of this.enumKeys) {
        const enumValue = enumShape[key];
        this.enumMapping.set(key, enumValue);
        this.enumMapping.set(enumValue, enumValue);
        if (typeof enumValue === "number") {
          this.hasNumericElements = true;
          this.enumMapping.set(`${enumValue}`, enumValue);
        }
      }
    }
    handle(value) {
      const typeOfValue = typeof value;
      if (typeOfValue === "number") {
        if (!this.hasNumericElements) {
          return Result.err(new ValidationError("s.nativeEnum(T)", "Expected the value to be a string", value));
        }
      } else if (typeOfValue !== "string") {
        return Result.err(new ValidationError("s.nativeEnum(T)", "Expected the value to be a string or number", value));
      }
      const casted = value;
      const possibleEnumValue = this.enumMapping.get(casted);
      return typeof possibleEnumValue === "undefined" ? Result.err(new UnknownEnumValueError(casted, this.enumKeys, this.enumMapping)) : Result.ok(possibleEnumValue);
    }
    clone() {
      return Reflect.construct(this.constructor, [this.enumShape]);
    }
  };
  __name(NativeEnumValidator, "NativeEnumValidator");

  // src/constraints/TypedArrayLengthConstraints.ts
  function typedArrayByteLengthComparator(comparator, name, expected, length) {
    return {
      run(input) {
        return comparator(input.byteLength, length) ? Result.ok(input) : Result.err(new ExpectedConstraintError(name, "Invalid Typed Array byte length", input, expected));
      }
    };
  }
  __name(typedArrayByteLengthComparator, "typedArrayByteLengthComparator");
  function typedArrayByteLengthLt(value) {
    const expected = `expected.byteLength < ${value}`;
    return typedArrayByteLengthComparator(lt, "s.typedArray(T).byteLengthLt", expected, value);
  }
  __name(typedArrayByteLengthLt, "typedArrayByteLengthLt");
  function typedArrayByteLengthLe(value) {
    const expected = `expected.byteLength <= ${value}`;
    return typedArrayByteLengthComparator(le, "s.typedArray(T).byteLengthLe", expected, value);
  }
  __name(typedArrayByteLengthLe, "typedArrayByteLengthLe");
  function typedArrayByteLengthGt(value) {
    const expected = `expected.byteLength > ${value}`;
    return typedArrayByteLengthComparator(gt, "s.typedArray(T).byteLengthGt", expected, value);
  }
  __name(typedArrayByteLengthGt, "typedArrayByteLengthGt");
  function typedArrayByteLengthGe(value) {
    const expected = `expected.byteLength >= ${value}`;
    return typedArrayByteLengthComparator(ge, "s.typedArray(T).byteLengthGe", expected, value);
  }
  __name(typedArrayByteLengthGe, "typedArrayByteLengthGe");
  function typedArrayByteLengthEq(value) {
    const expected = `expected.byteLength === ${value}`;
    return typedArrayByteLengthComparator(eq, "s.typedArray(T).byteLengthEq", expected, value);
  }
  __name(typedArrayByteLengthEq, "typedArrayByteLengthEq");
  function typedArrayByteLengthNe(value) {
    const expected = `expected.byteLength !== ${value}`;
    return typedArrayByteLengthComparator(ne, "s.typedArray(T).byteLengthNe", expected, value);
  }
  __name(typedArrayByteLengthNe, "typedArrayByteLengthNe");
  function typedArrayByteLengthRange(start, endBefore) {
    const expected = `expected.byteLength >= ${start} && expected.byteLength < ${endBefore}`;
    return {
      run(input) {
        return input.byteLength >= start && input.byteLength < endBefore ? Result.ok(input) : Result.err(new ExpectedConstraintError("s.typedArray(T).byteLengthRange", "Invalid Typed Array byte length", input, expected));
      }
    };
  }
  __name(typedArrayByteLengthRange, "typedArrayByteLengthRange");
  function typedArrayByteLengthRangeInclusive(start, end) {
    const expected = `expected.byteLength >= ${start} && expected.byteLength <= ${end}`;
    return {
      run(input) {
        return input.byteLength >= start && input.byteLength <= end ? Result.ok(input) : Result.err(new ExpectedConstraintError("s.typedArray(T).byteLengthRangeInclusive", "Invalid Typed Array byte length", input, expected));
      }
    };
  }
  __name(typedArrayByteLengthRangeInclusive, "typedArrayByteLengthRangeInclusive");
  function typedArrayByteLengthRangeExclusive(startAfter, endBefore) {
    const expected = `expected.byteLength > ${startAfter} && expected.byteLength < ${endBefore}`;
    return {
      run(input) {
        return input.byteLength > startAfter && input.byteLength < endBefore ? Result.ok(input) : Result.err(new ExpectedConstraintError("s.typedArray(T).byteLengthRangeExclusive", "Invalid Typed Array byte length", input, expected));
      }
    };
  }
  __name(typedArrayByteLengthRangeExclusive, "typedArrayByteLengthRangeExclusive");
  function typedArrayLengthComparator(comparator, name, expected, length) {
    return {
      run(input) {
        return comparator(input.length, length) ? Result.ok(input) : Result.err(new ExpectedConstraintError(name, "Invalid Typed Array length", input, expected));
      }
    };
  }
  __name(typedArrayLengthComparator, "typedArrayLengthComparator");
  function typedArrayLengthLt(value) {
    const expected = `expected.length < ${value}`;
    return typedArrayLengthComparator(lt, "s.typedArray(T).lengthLt", expected, value);
  }
  __name(typedArrayLengthLt, "typedArrayLengthLt");
  function typedArrayLengthLe(value) {
    const expected = `expected.length <= ${value}`;
    return typedArrayLengthComparator(le, "s.typedArray(T).lengthLe", expected, value);
  }
  __name(typedArrayLengthLe, "typedArrayLengthLe");
  function typedArrayLengthGt(value) {
    const expected = `expected.length > ${value}`;
    return typedArrayLengthComparator(gt, "s.typedArray(T).lengthGt", expected, value);
  }
  __name(typedArrayLengthGt, "typedArrayLengthGt");
  function typedArrayLengthGe(value) {
    const expected = `expected.length >= ${value}`;
    return typedArrayLengthComparator(ge, "s.typedArray(T).lengthGe", expected, value);
  }
  __name(typedArrayLengthGe, "typedArrayLengthGe");
  function typedArrayLengthEq(value) {
    const expected = `expected.length === ${value}`;
    return typedArrayLengthComparator(eq, "s.typedArray(T).lengthEq", expected, value);
  }
  __name(typedArrayLengthEq, "typedArrayLengthEq");
  function typedArrayLengthNe(value) {
    const expected = `expected.length !== ${value}`;
    return typedArrayLengthComparator(ne, "s.typedArray(T).lengthNe", expected, value);
  }
  __name(typedArrayLengthNe, "typedArrayLengthNe");
  function typedArrayLengthRange(start, endBefore) {
    const expected = `expected.length >= ${start} && expected.length < ${endBefore}`;
    return {
      run(input) {
        return input.length >= start && input.length < endBefore ? Result.ok(input) : Result.err(new ExpectedConstraintError("s.typedArray(T).lengthRange", "Invalid Typed Array length", input, expected));
      }
    };
  }
  __name(typedArrayLengthRange, "typedArrayLengthRange");
  function typedArrayLengthRangeInclusive(start, end) {
    const expected = `expected.length >= ${start} && expected.length <= ${end}`;
    return {
      run(input) {
        return input.length >= start && input.length <= end ? Result.ok(input) : Result.err(new ExpectedConstraintError("s.typedArray(T).lengthRangeInclusive", "Invalid Typed Array length", input, expected));
      }
    };
  }
  __name(typedArrayLengthRangeInclusive, "typedArrayLengthRangeInclusive");
  function typedArrayLengthRangeExclusive(startAfter, endBefore) {
    const expected = `expected.length > ${startAfter} && expected.length < ${endBefore}`;
    return {
      run(input) {
        return input.length > startAfter && input.length < endBefore ? Result.ok(input) : Result.err(new ExpectedConstraintError("s.typedArray(T).lengthRangeExclusive", "Invalid Typed Array length", input, expected));
      }
    };
  }
  __name(typedArrayLengthRangeExclusive, "typedArrayLengthRangeExclusive");

  // src/constraints/util/typedArray.ts
  var TypedArrays = {
    Int8Array: (x) => x instanceof Int8Array,
    Uint8Array: (x) => x instanceof Uint8Array,
    Uint8ClampedArray: (x) => x instanceof Uint8ClampedArray,
    Int16Array: (x) => x instanceof Int16Array,
    Uint16Array: (x) => x instanceof Uint16Array,
    Int32Array: (x) => x instanceof Int32Array,
    Uint32Array: (x) => x instanceof Uint32Array,
    Float32Array: (x) => x instanceof Float32Array,
    Float64Array: (x) => x instanceof Float64Array,
    BigInt64Array: (x) => x instanceof BigInt64Array,
    BigUint64Array: (x) => x instanceof BigUint64Array,
    TypedArray: (x) => ArrayBuffer.isView(x) && !(x instanceof DataView)
  };

  // src/constraints/util/common/vowels.ts
  var vowels = ["a", "e", "i", "o", "u"];
  var aOrAn = /* @__PURE__ */ __name((word) => {
    return `${vowels.includes(word[0].toLowerCase()) ? "an" : "a"} ${word}`;
  }, "aOrAn");

  // src/validators/TypedArrayValidator.ts
  var TypedArrayValidator = class extends BaseValidator {
    constructor(type, constraints = []) {
      super(constraints);
      this.type = type;
    }
    byteLengthLt(length) {
      return this.addConstraint(typedArrayByteLengthLt(length));
    }
    byteLengthLe(length) {
      return this.addConstraint(typedArrayByteLengthLe(length));
    }
    byteLengthGt(length) {
      return this.addConstraint(typedArrayByteLengthGt(length));
    }
    byteLengthGe(length) {
      return this.addConstraint(typedArrayByteLengthGe(length));
    }
    byteLengthEq(length) {
      return this.addConstraint(typedArrayByteLengthEq(length));
    }
    byteLengthNe(length) {
      return this.addConstraint(typedArrayByteLengthNe(length));
    }
    byteLengthRange(start, endBefore) {
      return this.addConstraint(typedArrayByteLengthRange(start, endBefore));
    }
    byteLengthRangeInclusive(startAt, endAt) {
      return this.addConstraint(typedArrayByteLengthRangeInclusive(startAt, endAt));
    }
    byteLengthRangeExclusive(startAfter, endBefore) {
      return this.addConstraint(typedArrayByteLengthRangeExclusive(startAfter, endBefore));
    }
    lengthLt(length) {
      return this.addConstraint(typedArrayLengthLt(length));
    }
    lengthLe(length) {
      return this.addConstraint(typedArrayLengthLe(length));
    }
    lengthGt(length) {
      return this.addConstraint(typedArrayLengthGt(length));
    }
    lengthGe(length) {
      return this.addConstraint(typedArrayLengthGe(length));
    }
    lengthEq(length) {
      return this.addConstraint(typedArrayLengthEq(length));
    }
    lengthNe(length) {
      return this.addConstraint(typedArrayLengthNe(length));
    }
    lengthRange(start, endBefore) {
      return this.addConstraint(typedArrayLengthRange(start, endBefore));
    }
    lengthRangeInclusive(startAt, endAt) {
      return this.addConstraint(typedArrayLengthRangeInclusive(startAt, endAt));
    }
    lengthRangeExclusive(startAfter, endBefore) {
      return this.addConstraint(typedArrayLengthRangeExclusive(startAfter, endBefore));
    }
    clone() {
      return Reflect.construct(this.constructor, [this.type, this.constraints]);
    }
    handle(value) {
      return TypedArrays[this.type](value) ? Result.ok(value) : Result.err(new ValidationError("s.typedArray", `Expected ${aOrAn(this.type)}`, value));
    }
  };
  __name(TypedArrayValidator, "TypedArrayValidator");

  // src/lib/Shapes.ts
  var Shapes = class {
    get string() {
      return new StringValidator();
    }
    get number() {
      return new NumberValidator();
    }
    get bigint() {
      return new BigIntValidator();
    }
    get boolean() {
      return new BooleanValidator();
    }
    get date() {
      return new DateValidator();
    }
    object(shape) {
      return new ObjectValidator(shape);
    }
    get undefined() {
      return this.literal(void 0);
    }
    get null() {
      return this.literal(null);
    }
    get nullish() {
      return new NullishValidator();
    }
    get any() {
      return new PassthroughValidator();
    }
    get unknown() {
      return new PassthroughValidator();
    }
    get never() {
      return new NeverValidator();
    }
    enum(...values) {
      return this.union(...values.map((value) => this.literal(value)));
    }
    nativeEnum(enumShape) {
      return new NativeEnumValidator(enumShape);
    }
    literal(value) {
      if (value instanceof Date)
        return this.date.eq(value);
      return new LiteralValidator(value);
    }
    instance(expected) {
      return new InstanceValidator(expected);
    }
    union(...validators) {
      return new UnionValidator(validators);
    }
    array(validator) {
      return new ArrayValidator(validator);
    }
    typedArray(type = "TypedArray") {
      return new TypedArrayValidator(type);
    }
    get int8Array() {
      return this.typedArray("Int8Array");
    }
    get uint8Array() {
      return this.typedArray("Uint8Array");
    }
    get uint8ClampedArray() {
      return this.typedArray("Uint8ClampedArray");
    }
    get int16Array() {
      return this.typedArray("Int16Array");
    }
    get uint16Array() {
      return this.typedArray("Uint16Array");
    }
    get int32Array() {
      return this.typedArray("Int32Array");
    }
    get uint32Array() {
      return this.typedArray("Uint32Array");
    }
    get float32Array() {
      return this.typedArray("Float32Array");
    }
    get float64Array() {
      return this.typedArray("Float64Array");
    }
    get bigInt64Array() {
      return this.typedArray("BigInt64Array");
    }
    get bigUint64Array() {
      return this.typedArray("BigUint64Array");
    }
    tuple(validators) {
      return new TupleValidator(validators);
    }
    set(validator) {
      return new SetValidator(validator);
    }
    record(validator) {
      return new RecordValidator(validator);
    }
    map(keyValidator, valueValidator) {
      return new MapValidator(keyValidator, valueValidator);
    }
  };
  __name(Shapes, "Shapes");

  // src/index.ts
  var s = new Shapes();
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=index.global.js.map