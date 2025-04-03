var fontawe = document.createElement("link");
fontawe.setAttribute("rel", "stylesheet");
fontawe.setAttribute("type", "text/css");
fontawe.setAttribute(
  "href",
  "https://cdn.bootcdn.net/ajax/libs/font-awesome/4.1.0/css/font-awesome.css"
);
document.head.appendChild(fontawe);
var jq = document.createElement("script");
// jq.setAttribute("type", "text/script");
jq.src = "https://cdn.bootcdn.net/ajax/libs/jquery/2.2.4/jquery.min.js";
// jq.setAttribute("src", "https://cdn.bootcdn.net/ajax/libs/jquery/2.2.4/jquery.min.js");
document.body.appendChild(jq);
var bb$ = $.noConflict(true);

this.Handlebars = (function () {
  var __module3__ = (function () {
    "use strict";
    var __exports__;
    function SafeString(string) {
      this.string = string;
    }
    SafeString.prototype.toString = function () {
      return "" + this.string;
    };
    __exports__ = SafeString;
    return __exports__;
  })();
  var __module2__ = (function (__dependency1__) {
    "use strict";
    var __exports__ = {};
    var SafeString = __dependency1__;
    var escape = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "`": "&#x60;",
    };
    var badChars = /[&<>"'`]/g;
    var possible = /[&<>"'`]/;
    function escapeChar(chr) {
      return escape[chr] || "&amp;";
    }
    function extend(obj) {
      for (var i = 1; i < arguments.length; i++) {
        for (var key in arguments[i]) {
          if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
            obj[key] = arguments[i][key];
          }
        }
      }
      return obj;
    }
    __exports__.extend = extend;
    var toString = Object.prototype.toString;
    __exports__.toString = toString;
    var isFunction = function (value) {
      return typeof value === "function";
    };
    if (isFunction(/x/)) {
      isFunction = function (value) {
        return (
          typeof value === "function" &&
          toString.call(value) === "[object Function]"
        );
      };
    }
    var isFunction;
    __exports__.isFunction = isFunction;
    var isArray =
      Array.isArray ||
      function (value) {
        return value && typeof value === "object"
          ? toString.call(value) === "[object Array]"
          : false;
      };
    __exports__.isArray = isArray;
    function escapeExpression(string) {
      if (string instanceof SafeString) {
        return string.toString();
      } else if (!string && string !== 0) {
        return "";
      }
      string = "" + string;
      if (!possible.test(string)) {
        return string;
      }
      return string.replace(badChars, escapeChar);
    }
    __exports__.escapeExpression = escapeExpression;
    function isEmpty(value) {
      if (!value && value !== 0) {
        return true;
      } else if (isArray(value) && value.length === 0) {
        return true;
      } else {
        return false;
      }
    }
    __exports__.isEmpty = isEmpty;
    function appendContextPath(contextPath, id) {
      return (contextPath ? contextPath + "." : "") + id;
    }
    __exports__.appendContextPath = appendContextPath;
    return __exports__;
  })(__module3__);
  var __module4__ = (function () {
    "use strict";
    var __exports__;
    var errorProps = [
      "description",
      "fileName",
      "lineNumber",
      "message",
      "name",
      "number",
      "stack",
    ];
    function Exception(message, node) {
      var line;
      if (node && node.firstLine) {
        line = node.firstLine;
        message += " - " + line + ":" + node.firstColumn;
      }
      var tmp = Error.prototype.constructor.call(this, message);
      for (var idx = 0; idx < errorProps.length; idx++) {
        this[errorProps[idx]] = tmp[errorProps[idx]];
      }
      if (line) {
        this.lineNumber = line;
        this.column = node.firstColumn;
      }
    }
    Exception.prototype = new Error();
    __exports__ = Exception;
    return __exports__;
  })();
  var __module1__ = (function (__dependency1__, __dependency2__) {
    "use strict";
    var __exports__ = {};
    var Utils = __dependency1__;
    var Exception = __dependency2__;
    var VERSION = "2.0.0-alpha.2";
    __exports__.VERSION = VERSION;
    var COMPILER_REVISION = 5;
    __exports__.COMPILER_REVISION = COMPILER_REVISION;
    var REVISION_CHANGES = {
      1: "<= 1.0.rc.2",
      2: "== 1.0.0-rc.3",
      3: "== 1.0.0-rc.4",
      4: "== 1.x.x",
      5: ">= 2.0.0",
    };
    __exports__.REVISION_CHANGES = REVISION_CHANGES;
    var isArray = Utils.isArray,
      isFunction = Utils.isFunction,
      toString = Utils.toString,
      objectType = "[object Object]";
    function HandlebarsEnvironment(helpers, partials) {
      this.helpers = helpers || {};
      this.partials = partials || {};
      registerDefaultHelpers(this);
    }
    __exports__.HandlebarsEnvironment = HandlebarsEnvironment;
    HandlebarsEnvironment.prototype = {
      constructor: HandlebarsEnvironment,
      logger: logger,
      log: log,
      registerHelper: function (name, fn, inverse) {
        if (toString.call(name) === objectType) {
          if (inverse || fn) {
            throw new Exception("Arg not supported with multiple helpers");
          }
          Utils.extend(this.helpers, name);
        } else {
          if (inverse) {
            fn.not = inverse;
          }
          this.helpers[name] = fn;
        }
      },
      unregisterHelper: function (name) {
        delete this.helpers[name];
      },
      registerPartial: function (name, str) {
        if (toString.call(name) === objectType) {
          Utils.extend(this.partials, name);
        } else {
          this.partials[name] = str;
        }
      },
      unregisterPartial: function (name) {
        delete this.partials[name];
      },
    };
    function registerDefaultHelpers(instance) {
      instance.registerHelper("helperMissing", function () {
        if (arguments.length === 1) {
          return undefined;
        } else {
          throw new Exception(
            "Missing helper: '" + arguments[arguments.length - 1].name + "'"
          );
        }
      });
      instance.registerHelper(
        "blockHelperMissing",
        function (context, options) {
          var inverse = options.inverse || function () {},
            fn = options.fn;
          if (isFunction(context)) {
            context = context.call(this);
          }
          if (context === true) {
            return fn(this);
          } else if (context === false || context == null) {
            return inverse(this);
          } else if (isArray(context)) {
            if (context.length > 0) {
              if (options.ids) {
                options.ids = [options.name];
              }
              return instance.helpers.each(context, options);
            } else {
              return inverse(this);
            }
          } else {
            if (options.data && options.ids) {
              var data = createFrame(options.data);
              data.contextPath = Utils.appendContextPath(
                options.data.contextPath,
                options.name
              );
              options = { data: data };
            }
            return fn(context, options);
          }
        }
      );
      instance.registerHelper("each", function (context, options) {
        if (!options) {
          options = context;
          context = this;
        }
        var fn = options.fn,
          inverse = options.inverse;
        var i = 0,
          ret = "",
          data;
        var contextPath;
        if (options.data && options.ids) {
          contextPath =
            Utils.appendContextPath(options.data.contextPath, options.ids[0]) +
            ".";
        }
        if (isFunction(context)) {
          context = context.call(this);
        }
        if (options.data) {
          data = createFrame(options.data);
        }
        if (context && typeof context === "object") {
          if (isArray(context)) {
            for (var j = context.length; i < j; i++) {
              if (data) {
                data.index = i;
                data.first = i === 0;
                data.last = i === context.length - 1;
                if (contextPath) {
                  data.contextPath = contextPath + i;
                }
              }
              ret = ret + fn(context[i], { data: data });
            }
          } else {
            for (var key in context) {
              if (context.hasOwnProperty(key)) {
                if (data) {
                  data.key = key;
                  data.index = i;
                  data.first = i === 0;
                  if (contextPath) {
                    data.contextPath = contextPath + key;
                  }
                }
                ret = ret + fn(context[key], { data: data });
                i++;
              }
            }
          }
        }
        if (i === 0) {
          ret = inverse(this);
        }
        return ret;
      });
      instance.registerHelper("if", function (conditional, options) {
        if (isFunction(conditional)) {
          conditional = conditional.call(this);
        }
        if (
          (!options.hash.includeZero && !conditional) ||
          Utils.isEmpty(conditional)
        ) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      });
      instance.registerHelper("unless", function (conditional, options) {
        return instance.helpers["if"].call(this, conditional, {
          fn: options.inverse,
          inverse: options.fn,
          hash: options.hash,
        });
      });
      instance.registerHelper("with", function (context, options) {
        if (isFunction(context)) {
          context = context.call(this);
        }
        var fn = options.fn;
        if (!Utils.isEmpty(context)) {
          if (options.data && options.ids) {
            var data = createFrame(options.data);
            data.contextPath = Utils.appendContextPath(
              options.data.contextPath,
              options.ids[0]
            );
            options = { data: data };
          }
          return fn(context, options);
        }
      });
      instance.registerHelper("log", function (context, options) {
        var level =
          options.data && options.data.level != null
            ? parseInt(options.data.level, 10)
            : 1;
        instance.log(level, context);
      });
      instance.registerHelper("lookup", function (obj, field, options) {
        return obj && obj[field];
      });
    }
    var logger = {
      methodMap: { 0: "debug", 1: "info", 2: "warn", 3: "error" },
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
      level: 3,
      log: function (level, obj) {
        if (logger.level <= level) {
          var method = logger.methodMap[level];
          if (typeof console !== "undefined" && console[method]) {
            console[method].call(console, obj);
          }
        }
      },
    };
    __exports__.logger = logger;
    function log(level, obj) {
      logger.log(level, obj);
    }
    __exports__.log = log;
    var createFrame = function (object) {
      var frame = Utils.extend({}, object);
      frame._parent = object;
      return frame;
    };
    __exports__.createFrame = createFrame;
    return __exports__;
  })(__module2__, __module4__);
  var __module5__ = (function (
    __dependency1__,
    __dependency2__,
    __dependency3__
  ) {
    "use strict";
    var __exports__ = {};
    var Utils = __dependency1__;
    var Exception = __dependency2__;
    var COMPILER_REVISION = __dependency3__.COMPILER_REVISION;
    var REVISION_CHANGES = __dependency3__.REVISION_CHANGES;
    var createFrame = __dependency3__.createFrame;
    function checkRevision(compilerInfo) {
      var compilerRevision = (compilerInfo && compilerInfo[0]) || 1,
        currentRevision = COMPILER_REVISION;
      if (compilerRevision !== currentRevision) {
        if (compilerRevision < currentRevision) {
          var runtimeVersions = REVISION_CHANGES[currentRevision],
            compilerVersions = REVISION_CHANGES[compilerRevision];
          throw new Exception(
            "Template was precompiled with an older version of Handlebars than the current runtime. " +
              "Please update your precompiler to a newer version (" +
              runtimeVersions +
              ") or downgrade your runtime to an older version (" +
              compilerVersions +
              ")."
          );
        } else {
          throw new Exception(
            "Template was precompiled with a newer version of Handlebars than the current runtime. " +
              "Please update your runtime to a newer version (" +
              compilerInfo[1] +
              ")."
          );
        }
      }
    }
    __exports__.checkRevision = checkRevision;
    function template(templateSpec, env) {
      if (!env) {
        throw new Exception("No environment passed to template");
      }
      env.VM.checkRevision(templateSpec.compiler);
      var invokePartialWrapper = function (
        partial,
        name,
        context,
        hash,
        helpers,
        partials,
        data
      ) {
        if (hash) {
          context = Utils.extend({}, context, hash);
        }
        var result = env.VM.invokePartial.call(
          this,
          partial,
          name,
          context,
          helpers,
          partials,
          data
        );
        if (result != null) {
          return result;
        }
        if (env.compile) {
          var options = { helpers: helpers, partials: partials, data: data };
          partials[name] = env.compile(
            partial,
            { data: data !== undefined },
            env
          );
          return partials[name](context, options);
        } else {
          throw new Exception(
            "The partial " +
              name +
              " could not be compiled when running in runtime-only mode"
          );
        }
      };
      var container = {
        escapeExpression: Utils.escapeExpression,
        invokePartial: invokePartialWrapper,
        fn: function (i) {
          return templateSpec[i];
        },
        programs: [],
        program: function (i, data) {
          var programWrapper = this.programs[i],
            fn = this.fn(i);
          if (data) {
            programWrapper = program(this, i, fn, data);
          } else if (!programWrapper) {
            programWrapper = this.programs[i] = program(this, i, fn);
          }
          return programWrapper;
        },
        programWithDepth: env.VM.programWithDepth,
        initData: function (context, data) {
          if (!data || !("root" in data)) {
            data = data ? createFrame(data) : {};
            data.root = context;
          }
          return data;
        },
        data: function (data, depth) {
          while (data && depth--) {
            data = data._parent;
          }
          return data;
        },
        merge: function (param, common) {
          var ret = param || common;
          if (param && common && param !== common) {
            ret = Utils.extend({}, common, param);
          }
          return ret;
        },
        noop: env.VM.noop,
        compilerInfo: templateSpec.compiler,
      };
      var ret = function (context, options) {
        options = options || {};
        var namespace = options.partial ? options : env,
          helpers,
          partials,
          data = options.data;
        if (!options.partial) {
          helpers = container.helpers = container.merge(
            options.helpers,
            namespace.helpers
          );
          if (templateSpec.usePartial) {
            partials = container.partials = container.merge(
              options.partials,
              namespace.partials
            );
          }
          if (templateSpec.useData) {
            data = container.initData(context, data);
          }
        } else {
          helpers = container.helpers = options.helpers;
          partials = container.partials = options.partials;
        }
        return templateSpec.main.call(
          container,
          context,
          helpers,
          partials,
          data
        );
      };
      ret.child = function (i) {
        return container.programWithDepth(i);
      };
      return ret;
    }
    __exports__.template = template;
    function programWithDepth(i, data) {
      var args = Array.prototype.slice.call(arguments, 2),
        container = this,
        fn = container.fn(i);
      var prog = function (context, options) {
        options = options || {};
        return fn.apply(
          container,
          [
            context,
            container.helpers,
            container.partials,
            options.data || data,
          ].concat(args)
        );
      };
      prog.program = i;
      prog.depth = args.length;
      return prog;
    }
    __exports__.programWithDepth = programWithDepth;
    function program(container, i, fn, data) {
      var prog = function (context, options) {
        options = options || {};
        return fn.call(
          container,
          context,
          container.helpers,
          container.partials,
          options.data || data
        );
      };
      prog.program = i;
      prog.depth = 0;
      return prog;
    }
    __exports__.program = program;
    function invokePartial(partial, name, context, helpers, partials, data) {
      var options = {
        partial: true,
        helpers: helpers,
        partials: partials,
        data: data,
      };
      if (partial === undefined) {
        throw new Exception("The partial " + name + " could not be found");
      } else if (partial instanceof Function) {
        return partial(context, options);
      }
    }
    __exports__.invokePartial = invokePartial;
    function noop() {
      return "";
    }
    __exports__.noop = noop;
    return __exports__;
  })(__module2__, __module4__, __module1__);
  var __module0__ = (function (
    __dependency1__,
    __dependency2__,
    __dependency3__,
    __dependency4__,
    __dependency5__
  ) {
    "use strict";
    var __exports__;
    var base = __dependency1__;
    var SafeString = __dependency2__;
    var Exception = __dependency3__;
    var Utils = __dependency4__;
    var runtime = __dependency5__;
    var create = function () {
      var hb = new base.HandlebarsEnvironment();
      Utils.extend(hb, base);
      hb.SafeString = SafeString;
      hb.Exception = Exception;
      hb.Utils = Utils;
      hb.VM = runtime;
      hb.template = function (spec) {
        return runtime.template(spec, hb);
      };
      return hb;
    };
    var Handlebars = create();
    Handlebars.create = create;
    __exports__ = Handlebars;
    return __exports__;
  })(__module1__, __module3__, __module4__, __module2__, __module5__);
  return __module0__;
})();
(function () {
  var template = Handlebars.template,
    templates = (Handlebars.templates = Handlebars.templates || {});
  templates["amazon"] = template({
    compiler: [5, ">= 2.0.0"],
    main: function (depth0, helpers, partials, data) {
      var helper,
        functionType = "function",
        escapeExpression = this.escapeExpression;
      return (
        '&nbsp;\n<span class="bibbase_amazon">\n  <a href="http://www.amazon.com/s/?url=search-alias=aps&amp;field-keywords=' +
        escapeExpression(
          ((helper = helpers.amazon_string || (depth0 && depth0.amazon_string)),
          typeof helper === functionType
            ? helper.call(depth0, {
                name: "amazon_string",
                hash: {},
                data: data,
              })
            : helper)
        ) +
        '&amp;tag=bib0d-20&amp;link_code=wql&amp;_encoding=UTF-8"\n     onclick="log_buy(\'' +
        escapeExpression(
          ((helper = helpers.bibbaseid || (depth0 && depth0.bibbaseid)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "bibbaseid", hash: {}, data: data })
            : helper)
        ) +
        "', 'http://www.amazon.com/s/?url=search-alias=aps&amp;field-keywords=" +
        escapeExpression(
          ((helper = helpers.amazon_string || (depth0 && depth0.amazon_string)),
          typeof helper === functionType
            ? helper.call(depth0, {
                name: "amazon_string",
                hash: {},
                data: data,
              })
            : helper)
        ) +
        '&amp;tag=bib0d-20&amp;link_code=wql&amp;_encoding=UTF-8\'); return false;"\n     class="bibbase link"\n     target="_blank">\n    buy\n  </a>\n</span>\n'
      );
    },
    useData: true,
  });
  templates["diff"] = template({
    1: function (depth0, helpers, partials, data) {
      var stack1,
        buffer = "\n  ";
      stack1 = helpers.each.call(depth0, depth0 && depth0.change, {
        name: "each",
        hash: {},
        fn: this.program(2, data),
        inverse: this.noop,
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n  ";
    },
    2: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        functionType = "function",
        escapeExpression = this.escapeExpression,
        buffer = '\n  <pre style="\n\t      ';
      stack1 = helpers["if"].call(depth0, depth0 && depth0.added, {
        name: "if",
        hash: {},
        fn: this.program(3, data),
        inverse: this.program(5, data),
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return (
        buffer +
        '\n\t      ">' +
        escapeExpression(
          ((helper = helpers.value || (depth0 && depth0.value)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "value", hash: {}, data: data })
            : helper)
        ) +
        "</pre>\n\n  "
      );
    },
    3: function (depth0, helpers, partials, data) {
      return "\n\t      color: green\n\t      ";
    },
    5: function (depth0, helpers, partials, data) {
      var stack1,
        buffer = "\n\t      ";
      stack1 = helpers["if"].call(depth0, depth0 && depth0.removed, {
        name: "if",
        hash: {},
        fn: this.program(6, data),
        inverse: this.program(8, data),
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n\t      ";
    },
    6: function (depth0, helpers, partials, data) {
      return "\n\t      color: red\n\t      ";
    },
    8: function (depth0, helpers, partials, data) {
      return "\n\t      display: none\n\t      ";
    },
    compiler: [5, ">= 2.0.0"],
    main: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        functionType = "function",
        escapeExpression = this.escapeExpression,
        buffer =
          '\n<div class="' +
          escapeExpression(
            ((helper = helpers.status || (depth0 && depth0.status)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "status", hash: {}, data: data })
              : helper)
          ) +
          '">\n\n  URL: ' +
          escapeExpression(
            ((stack1 =
              ((stack1 = depth0 && depth0.pair),
              stack1 == null || stack1 === false ? stack1 : stack1.a)),
            typeof stack1 === functionType ? stack1.apply(depth0) : stack1)
          ) +
          " <br/>\n\n  Status: " +
          escapeExpression(
            ((helper = helpers.status || (depth0 && depth0.status)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "status", hash: {}, data: data })
              : helper)
          ) +
          " <br/>\n\n  ";
      stack1 = helpers["if"].call(depth0, depth0 && depth0.change, {
        name: "if",
        hash: {},
        fn: this.program(1, data),
        inverse: this.noop,
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n</div>\n";
    },
    useData: true,
  });
  templates["email"] = template({
    compiler: [5, ">= 2.0.0"],
    main: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        functionType = "function",
        buffer =
          '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml">\n\n<head>\n    <meta content=\'text/html; charset=utf-8\' http-equiv=\'Content-Type\'>\n    <meta content=\'width=device-width, initial-scale=1.0\' name=\'viewport\'>\n    <title>BibBase: New Publications in your Feed</title>\n</head>\n\n<body>\n  \x3c!-- Won\'t work on gmail unless I use https (I think) --\x3e\n  \x3c!-- <img src="http://bibbase.org/img/logo.png" --\x3e\n  \x3c!--      style="float: right; height: 40px;"> --\x3e\n\n  New Items in your BibBase\n  <a href="http://bibbase.org/network/feed">Feed</a>:\n\n  <div style="clear: both">\n    ';
      stack1 =
        ((helper = helpers.notifications || (depth0 && depth0.notifications)),
        typeof helper === functionType
          ? helper.call(depth0, { name: "notifications", hash: {}, data: data })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return (
        buffer +
        '\n  </div>\n\n\n  <hr style="margin-top: 50px"/> \n  <div style="color: gray; font-size: 8px;">\n    To unsubscribe from these emails, please visit\n    your <a href="http://bibbase.org/network/feed">feed</a> and uncheck\n    "Send Daily Notifications".\n  </div>\n\n</body>\n</html>\n'
      );
    },
    useData: true,
  });
  templates["email_paper"] = template({
    1: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        helperMissing = helpers.helperMissing,
        buffer = ", editor\n      ";
      stack1 =
        ((helper = helpers.ifx || (depth0 && depth0.ifx) || helperMissing),
        helper.call(depth0, "this[this.role+'_short'].length > 1", {
          name: "ifx",
          hash: {},
          fn: this.program(2, data),
          inverse: this.noop,
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + ".\n      ";
    },
    2: function (depth0, helpers, partials, data) {
      return "s";
    },
    compiler: [5, ">= 2.0.0"],
    main: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        functionType = "function",
        escapeExpression = this.escapeExpression,
        helperMissing = helpers.helperMissing,
        buffer =
          '\n\n<div class="bibbase_paper" id="' +
          escapeExpression(
            ((helper = helpers.bibbaseid || (depth0 && depth0.bibbaseid)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "bibbaseid", hash: {}, data: data })
              : helper)
          ) +
          '"\n     style="padding: 10px;">\n  <span>\n    <b>\n      <a href="' +
          escapeExpression(
            ((helper = helpers.host || (depth0 && depth0.host)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "host", hash: {}, data: data })
              : helper)
          ) +
          "network/publication/" +
          escapeExpression(
            ((helper = helpers.bibbaseid || (depth0 && depth0.bibbaseid)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "bibbaseid", hash: {}, data: data })
              : helper)
          ) +
          '"\n         style="text-decoration: none; color: #000;">\n        ' +
          escapeExpression(
            ((helper =
              helpers.formatTitle ||
              (depth0 && depth0.formatTitle) ||
              helperMissing),
            helper.call(depth0, depth0 && depth0.title, {
              name: "formatTitle",
              hash: {},
              data: data,
            }))
          ) +
          "\n      </a>\n    </b>\n    <span>\n      ";
      stack1 =
        ((helper =
          helpers.getPerson || (depth0 && depth0.getPerson) || helperMissing),
        helper.call(depth0, depth0 && depth0.role, depth0 && depth0.metadata, {
          name: "getPerson",
          hash: {},
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer += "\n      ";
      stack1 =
        ((helper = helpers.ifx || (depth0 && depth0.ifx) || helperMissing),
        helper.call(depth0, "this.role == 'editor'", {
          name: "ifx",
          hash: {},
          fn: this.program(1, data),
          inverse: this.noop,
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer += "\n    </span>\n  </span>\n\n  ";
      stack1 =
        ((helper = helpers.typeTemplate || (depth0 && depth0.typeTemplate)),
        typeof helper === functionType
          ? helper.call(depth0, { name: "typeTemplate", hash: {}, data: data })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n\n</div>\n\n\n";
    },
    useData: true,
  });
  templates["email_response"] = template({
    compiler: [5, ">= 2.0.0"],
    main: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        functionType = "function",
        escapeExpression = this.escapeExpression,
        buffer =
          '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml">\n\n<head>\n    <meta content=\'text/html; charset=utf-8\' http-equiv=\'Content-Type\'>\n    <meta content=\'width=device-width, initial-scale=1.0\' name=\'viewport\'>\n    <title>BibBase: New Response</title>\n</head>\n\n<body>\n  \x3c!-- Use nodemailer to attach logo to make this work  --\x3e\n  \x3c!-- <img src="cid:bibbase.png" style="float: right; height: 40px;"> --\x3e\n\n  A new response has been added to:\n  <div style="clear: both">\n    ';
      stack1 =
        ((helper = helpers.paper || (depth0 && depth0.paper)),
        typeof helper === functionType
          ? helper.call(depth0, { name: "paper", hash: {}, data: data })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer +=
        '\n  </div>\n  <hr style="color: #999"/>\n\n  <img class="profile_pic"\n       style="width: 32px;"\n       src="' +
        escapeExpression(
          ((helper = helpers.picture || (depth0 && depth0.picture)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "picture", hash: {}, data: data })
            : helper)
        ) +
        '" />\n  <a href="' +
        escapeExpression(
          ((helper = helpers.userUrl || (depth0 && depth0.userUrl)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "userUrl", hash: {}, data: data })
            : helper)
        ) +
        '">\n    ' +
        escapeExpression(
          ((helper = helpers.username || (depth0 && depth0.username)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "username", hash: {}, data: data })
            : helper)
        ) +
        "\n  </a>, " +
        escapeExpression(
          ((helper = helpers.date || (depth0 && depth0.date)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "date", hash: {}, data: data })
            : helper)
        ) +
        ":\n\n  <p>\n    ";
      stack1 =
        ((helper = helpers.body || (depth0 && depth0.body)),
        typeof helper === functionType
          ? helper.call(depth0, { name: "body", hash: {}, data: data })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return (
        buffer +
        '\n  </p>\n\n\n  <hr style="margin-top: 50px"/> \n  <div style="color: gray; font-size: 8px;">\n    To unsubscribe from these emails, please visit\n    <a href="http://bibbase.org/network/publication/' +
        escapeExpression(
          ((helper = helpers.bibbaseid || (depth0 && depth0.bibbaseid)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "bibbaseid", hash: {}, data: data })
            : helper)
        ) +
        '">\n      the paper</a>\n    and unclick "Watching".\n  </div>\n\n</body>\n</html>\n'
      );
    },
    useData: true,
  });
  templates["extras"] = template({
    1: function (depth0, helpers, partials, data, depth1) {
      var stack1,
        helper,
        functionType = "function",
        escapeExpression = this.escapeExpression,
        helperMissing = helpers.helperMissing;
      return (
        '\n  <a href="' +
        escapeExpression(
          ((helper = helpers.value || (depth0 && depth0.value)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "value", hash: {}, data: data })
            : helper)
        ) +
        '"\n     onclick="log_download(\'' +
        escapeExpression(
          ((stack1 = depth1 && depth1.bibbaseid),
          typeof stack1 === functionType ? stack1.apply(depth0) : stack1)
        ) +
        "', '" +
        escapeExpression(
          ((helper = helpers.value || (depth0 && depth0.value)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "value", hash: {}, data: data })
            : helper)
        ) +
        '\', event.ctrlKey, event)">\n    <img src="' +
        escapeExpression(
          ((stack1 = depth1 && depth1.host),
          typeof stack1 === functionType ? stack1.apply(depth0) : stack1)
        ) +
        "/img/filetypes/" +
        escapeExpression(
          ((helper =
            helpers.guessFiletype ||
            (depth0 && depth0.guessFiletype) ||
            helperMissing),
          helper.call(depth0, depth0 && depth0.value, {
            name: "guessFiletype",
            hash: {},
            data: data,
          }))
        ) +
        '.svg"\n\t     alt="' +
        escapeExpression(
          ((stack1 = depth1 && depth1.title),
          typeof stack1 === functionType ? stack1.apply(depth0) : stack1)
        ) +
        " [" +
        escapeExpression(
          ((helper =
            helpers.guessFiletype ||
            (depth0 && depth0.guessFiletype) ||
            helperMissing),
          helper.call(depth0, depth0 && depth0.value, {
            name: "guessFiletype",
            hash: {},
            data: data,
          }))
        ) +
        ']"\n       title="' +
        escapeExpression(
          ((helper = helpers.key || (depth0 && depth0.key)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "key", hash: {}, data: data })
            : helper)
        ) +
        '"\n\t     class="bibbase_icon"\n         ><span class="bibbase_icon_text">' +
        escapeExpression(
          ((helper = helpers.key || (depth0 && depth0.key)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "key", hash: {}, data: data })
            : helper)
        ) +
        "</span></a>\n  &nbsp;\n  "
      );
    },
    3: function (depth0, helpers, partials, data, depth1) {
      var stack1,
        helper,
        functionType = "function",
        escapeExpression = this.escapeExpression;
      return (
        '\n  <a href="http://doi.org/' +
        escapeExpression(
          ((helper = helpers.doi || (depth0 && depth0.doi)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "doi", hash: {}, data: data })
            : helper)
        ) +
        '"\n     onclick="log_download(\'' +
        escapeExpression(
          ((stack1 = depth1 && depth1.bibbaseid),
          typeof stack1 === functionType ? stack1.apply(depth0) : stack1)
        ) +
        "', 'http://doi.org/" +
        escapeExpression(
          ((helper = helpers.doi || (depth0 && depth0.doi)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "doi", hash: {}, data: data })
            : helper)
        ) +
        '\', event.ctrlKey)"\n     class="bibbase doi link">\n    <span>doi</span></a>\n  &nbsp;\n  '
      );
    },
    5: function (depth0, helpers, partials, data) {
      return "\n  ";
    },
    7: function (depth0, helpers, partials, data) {
      var helper,
        functionType = "function",
        escapeExpression = this.escapeExpression;
      return (
        '\n  <a href="' +
        escapeExpression(
          ((helper = helpers.host || (depth0 && depth0.host)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "host", hash: {}, data: data })
            : helper)
        ) +
        "/network/publication/" +
        escapeExpression(
          ((helper = helpers.bibbaseid || (depth0 && depth0.bibbaseid)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "bibbaseid", hash: {}, data: data })
            : helper)
        ) +
        '"\n     class="bibbase bibbase_page link">link</a>\n  &nbsp;\n  '
      );
    },
    9: function (depth0, helpers, partials, data) {
      return '\n  &nbsp;\n  <a class="bibbase_abstract_link bibbase link"\n     href="#"\n     onclick="showAbstract(event); return false;">\n    abstract <i class="fa fa-caret-down"></i></a>\n  ';
    },
    11: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        functionType = "function",
        escapeExpression = this.escapeExpression,
        helperMissing = helpers.helperMissing,
        buffer =
          '\n  &nbsp;\n  <span class="bibbase_stats_paper" style="color: #777;">\n    <span>' +
          escapeExpression(
            ((helper = helpers.downloads || (depth0 && depth0.downloads)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "downloads", hash: {}, data: data })
              : helper)
          ) +
          " download";
      stack1 =
        ((helper = helpers.ifx || (depth0 && depth0.ifx) || helperMissing),
        helper.call(depth0, "this.downloads > 1", {
          name: "ifx",
          hash: {},
          fn: this.program(12, data),
          inverse: this.noop,
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "</span>\n  </span>\n  ";
    },
    12: function (depth0, helpers, partials, data) {
      return "s";
    },
    14: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        functionType = "function",
        buffer = "\n  ";
      stack1 =
        ((helper =
          helpers.renderArtifactBadge ||
          (depth0 && depth0.renderArtifactBadge)),
        typeof helper === functionType
          ? helper.call(depth0, {
              name: "renderArtifactBadge",
              hash: {},
              data: data,
            })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n  ";
    },
    16: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        functionType = "function",
        buffer =
          '\n<div class="well well-small bibbase" data-type="abstract"\n     style="display:none">\n  ';
      stack1 =
        ((helper = helpers["abstract"] || (depth0 && depth0["abstract"])),
        typeof helper === functionType
          ? helper.call(depth0, { name: "abstract", hash: {}, data: data })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n</div>\n";
    },
    compiler: [5, ">= 2.0.0"],
    main: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        functionType = "function",
        helperMissing = helpers.helperMissing,
        escapeExpression = this.escapeExpression,
        buffer = '<span class="note">';
      stack1 =
        ((helper = helpers.note || (depth0 && depth0.note)),
        typeof helper === functionType
          ? helper.call(depth0, { name: "note", hash: {}, data: data })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer += '</span>\n\n<span class="bibbase_note">';
      stack1 =
        ((helper = helpers.bibbase_note || (depth0 && depth0.bibbase_note)),
        typeof helper === functionType
          ? helper.call(depth0, { name: "bibbase_note", hash: {}, data: data })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer +=
        '</span>\n\n<br class="bibbase_paper_content"/>\n\n<span class="bibbase_paper_content dontprint">\n\n  ';
      stack1 =
        ((helper =
          helpers.each_with_key ||
          (depth0 && depth0.each_with_key) ||
          helperMissing),
        helper.call(depth0, depth0 && depth0.urls, {
          name: "each_with_key",
          hash: {},
          fn: this.programWithDepth(1, data, depth0),
          inverse: this.noop,
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer += "\n\n  ";
      stack1 = helpers["if"].call(depth0, depth0 && depth0.doi, {
        name: "if",
        hash: {},
        fn: this.programWithDepth(3, data, depth0),
        inverse: this.noop,
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer += "\n\n  ";
      stack1 = helpers["if"].call(depth0, depth0 && depth0.titleLinks, {
        name: "if",
        hash: {},
        fn: this.program(5, data),
        inverse: this.program(7, data),
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer +=
        '\n\n  <a href="#"\n     onclick="showBib(event); return false;"\n     class="bibbase bibtex link">bibtex\n    <i class="fa fa-caret-down"></i></a>\n\n  ';
      stack1 = helpers["if"].call(depth0, depth0 && depth0["abstract"], {
        name: "if",
        hash: {},
        fn: this.program(9, data),
        inverse: this.noop,
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer += "\n\n  ";
      stack1 = helpers["if"].call(depth0, depth0 && depth0.downloads, {
        name: "if",
        hash: {},
        fn: this.program(11, data),
        inverse: this.noop,
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer +=
        '\n\n  \x3c!-- <a class="bibbase read link hidden" --\x3e\n  \x3c!--    href="javascript:toggleRead(\'' +
        escapeExpression(
          ((helper = helpers.bibbaseid || (depth0 && depth0.bibbaseid)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "bibbaseid", hash: {}, data: data })
            : helper)
        ) +
        '\')" --\x3e\n  \x3c!--    title="Marking this paper as read adds it to your library on BibBase." --\x3e\n  \x3c!--    > --\x3e\n  \x3c!--   <i class="fa fa-check"></i>&nbsp; --\x3e\n  \x3c!--   <span>mark as read</span> --\x3e\n  \x3c!-- </a> --\x3e\n\n  &nbsp;\n  ';
      stack1 =
        ((helper =
          helpers.artifactBadgesLabel ||
          (depth0 && depth0.artifactBadgesLabel)),
        typeof helper === functionType
          ? helper.call(depth0, {
              name: "artifactBadgesLabel",
              hash: {},
              data: data,
            })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer += "\n  ";
      stack1 = helpers.each.call(depth0, depth0 && depth0.keyword, {
        name: "each",
        hash: {},
        fn: this.program(14, data),
        inverse: this.noop,
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer +=
        '\n\n</span>\n\n<div class="well well-small bibbase" data-type="bibtex"\n     style="display:none">\n  <pre style="white-space: pre-wrap;">' +
        escapeExpression(
          ((helper = helpers.bibtex || (depth0 && depth0.bibtex)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "bibtex", hash: {}, data: data })
            : helper)
        ) +
        "</pre>\n</div>\n\n";
      stack1 = helpers["if"].call(depth0, depth0 && depth0["abstract"], {
        name: "if",
        hash: {},
        fn: this.program(16, data),
        inverse: this.noop,
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n";
    },
    useData: true,
  });
  templates["groups"] = template({
    1: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        helperMissing = helpers.helperMissing,
        escapeExpression = this.escapeExpression,
        functionType = "function",
        buffer =
          '\n  <div class="bibbase_group_whole" id="group_' +
          escapeExpression(
            ((helper =
              helpers.normalizeString ||
              (depth0 && depth0.normalizeString) ||
              helperMissing),
            helper.call(depth0, depth0 && depth0.key, {
              name: "normalizeString",
              hash: {},
              data: data,
            }))
          ) +
          '">\n    <div class="bibbase_group"\n      onclick="toggleGroup(\'group_' +
          escapeExpression(
            ((helper =
              helpers.normalizeString ||
              (depth0 && depth0.normalizeString) ||
              helperMissing),
            helper.call(depth0, depth0 && depth0.key, {
              name: "normalizeString",
              hash: {},
              data: data,
            }))
          ) +
          "')\"\n      onkeypress=\"toggleGroup('group_" +
          escapeExpression(
            ((helper =
              helpers.normalizeString ||
              (depth0 && depth0.normalizeString) ||
              helperMissing),
            helper.call(depth0, depth0 && depth0.key, {
              name: "normalizeString",
              hash: {},
              data: data,
            }))
          ) +
          '\')"\n      tabindex="0">\n      <i class="fa fa-angle-down bibbase_group_head_icon"></i>&nbsp;\n      <span>' +
          escapeExpression(
            ((helper = helpers.key || (depth0 && depth0.key)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "key", hash: {}, data: data })
              : helper)
          ) +
          '</span>\n      <span class="bibbase_group_count">\n        ';
      stack1 = helpers["if"].call(depth0, depth0 && depth0.items, {
        name: "if",
        hash: {},
        fn: this.program(2, data),
        inverse: this.program(4, data),
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer +=
        '\n      </span>\n    </div>\n    <div class="bibbase_group_body">\n      ';
      stack1 =
        ((helper =
          helpers.insert || (depth0 && depth0.insert) || helperMissing),
        helper.call(depth0, "papers", {
          name: "insert",
          hash: {},
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n    </div>\n  </div>\n";
    },
    2: function (depth0, helpers, partials, data) {
      var stack1,
        functionType = "function",
        escapeExpression = this.escapeExpression;
      return (
        "\n        (" +
        escapeExpression(
          ((stack1 =
            ((stack1 = depth0 && depth0.items),
            stack1 == null || stack1 === false ? stack1 : stack1.length)),
          typeof stack1 === functionType ? stack1.apply(depth0) : stack1)
        ) +
        ")\n        "
      );
    },
    4: function (depth0, helpers, partials, data) {
      var stack1,
        functionType = "function",
        escapeExpression = this.escapeExpression;
      return (
        "\n        (" +
        escapeExpression(
          ((stack1 =
            ((stack1 = depth0 && depth0.groups),
            stack1 == null || stack1 === false ? stack1 : stack1.length)),
          typeof stack1 === functionType ? stack1.apply(depth0) : stack1)
        ) +
        ")\n        "
      );
    },
    compiler: [5, ">= 2.0.0"],
    main: function (depth0, helpers, partials, data) {
      var stack1,
        buffer = "";
      stack1 = helpers.each.call(depth0, depth0 && depth0.groups, {
        name: "each",
        hash: {},
        fn: this.program(1, data),
        inverse: this.noop,
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n";
    },
    useData: true,
  });
  templates["list"] = template({
    1: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        functionType = "function",
        buffer = "\n  ";
      stack1 =
        ((helper = helpers.html || (depth0 && depth0.html)),
        typeof helper === functionType
          ? helper.call(depth0, { name: "html", hash: {}, data: data })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n";
    },
    compiler: [5, ">= 2.0.0"],
    main: function (depth0, helpers, partials, data) {
      var stack1,
        buffer = "";
      stack1 = helpers.each.call(depth0, depth0 && depth0.items, {
        name: "each",
        hash: {},
        fn: this.program(1, data),
        inverse: this.noop,
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n";
    },
    useData: true,
  });
  templates["page"] = template({
    1: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        functionType = "function",
        escapeExpression = this.escapeExpression,
        buffer =
          '\n  <div style="float: right; margin-right: 10px; margin-top: 10px; text-align: right; font-size: 12px">\n    generated by\n    <a href="' +
          escapeExpression(
            ((helper = helpers.host || (depth0 && depth0.host)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "host", hash: {}, data: data })
              : helper)
          ) +
          "\"\n       onclick=\"trackOutboundLink('bibbase', 'logo clicked', window.location.href, '" +
          escapeExpression(
            ((helper = helpers.host || (depth0 && depth0.host)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "host", hash: {}, data: data })
              : helper)
          ) +
          '\'); return false;">\n      <img src="' +
          escapeExpression(
            ((helper = helpers.host || (depth0 && depth0.host)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "host", hash: {}, data: data })
              : helper)
          ) +
          '/img/logo.svg"\n           style="vertical-align: middle; margin-left: 3px; height: 16px;"/\n           alt="bibbase.org"\n           title="BibBase – The easiest way to maintain your publications page."\n        ></a>\n    ';
      stack1 = helpers["if"].call(depth0, depth0 && depth0.fromdata, {
        name: "if",
        hash: {},
        fn: this.program(2, data),
        inverse: this.noop,
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n  </div>\n  ";
    },
    2: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        functionType = "function",
        buffer = "\n    <br/>\n    from ";
      stack1 =
        ((helper = helpers.fromdata || (depth0 && depth0.fromdata)),
        typeof helper === functionType
          ? helper.call(depth0, { name: "fromdata", hash: {}, data: data })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n    ";
    },
    4: function (depth0, helpers, partials, data) {
      return "\n  \x3c!-- Generated by BibBase.org. White-labeled via premium plan  --\x3e\n  ";
    },
    6: function (depth0, helpers, partials, data) {
      var stack1,
        buffer =
          '\n      <li class="dropdown" id="error_dropdown">\n      <a class="dropdown-toggle"\n         data-toggle="dropdown"\n         href="#"\n         style="color: #FBB450">\n          <i class="fa fa-warning"></i>\n          <b class="caret"></b>\n      </a>\n      <ul class="dropdown-menu"\n            style="width: 600px; padding: 10px">\n          Warning, your bibtex file has errors:\n          ';
      stack1 = helpers.each.call(depth0, depth0 && depth0.errors, {
        name: "each",
        hash: {},
        fn: this.program(7, data),
        inverse: this.noop,
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n        </ul>\n      </li>\n      ";
    },
    7: function (depth0, helpers, partials, data) {
      var helper,
        functionType = "function",
        escapeExpression = this.escapeExpression;
      return (
        "\n          <hr />\n          Line " +
        escapeExpression(
          ((helper = helpers.line || (depth0 && depth0.line)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "line", hash: {}, data: data })
            : helper)
        ) +
        ": " +
        escapeExpression(
          ((helper = helpers.message || (depth0 && depth0.message)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "message", hash: {}, data: data })
            : helper)
        ) +
        '\n          <div class="well">\n            <pre style="white-space: pre-wrap;"\n                 >"... ' +
        escapeExpression(
          ((helper = helpers.context || (depth0 && depth0.context)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "context", hash: {}, data: data })
            : helper)
        ) +
        '"</pre>\n          </div>\n          '
      );
    },
    9: function (depth0, helpers, partials, data) {
      return '\n      <div class="navbar-form">\n        <input type="text" class="form-control"\n          onkeyup="handleSearch(this.value)"\n          placeholder="Type to filter"\n          style="width: 20em; height: 1.8em; padding: 0.5em">\n        </input>\n      </div>\n      ';
    },
    11: function (depth0, helpers, partials, data) {
      return "&amp;";
    },
    13: function (depth0, helpers, partials, data) {
      return "?";
    },
    compiler: [5, ">= 2.0.0"],
    main: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        functionType = "function",
        escapeExpression = this.escapeExpression,
        helperMissing = helpers.helperMissing,
        buffer =
          '<img src="' +
          escapeExpression(
            ((helper = helpers.host || (depth0 && depth0.host)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "host", hash: {}, data: data })
              : helper)
          ) +
          '/img/ajax-loader.gif" id="spinner"\n  style="display: none;" alt="Loading.." />\n\n<div id="bibbase">\n\n  <script type="text/javascript">\n    var bibbase = {\n      params: ';
      stack1 =
        ((helper = helpers.params || (depth0 && depth0.params)),
        typeof helper === functionType
          ? helper.call(depth0, { name: "params", hash: {}, data: data })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer += ",\n      data: ";
      stack1 =
        ((helper = helpers.data || (depth0 && depth0.data)),
        typeof helper === functionType
          ? helper.call(depth0, { name: "data", hash: {}, data: data })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer += ",\n      metadata: ";
      stack1 =
        ((helper = helpers.metadata || (depth0 && depth0.metadata)),
        typeof helper === functionType
          ? helper.call(depth0, { name: "metadata", hash: {}, data: data })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer += ",\n      ownerID: ";
      stack1 =
        ((helper = helpers.ownerID || (depth0 && depth0.ownerID)),
        typeof helper === functionType
          ? helper.call(depth0, { name: "ownerID", hash: {}, data: data })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer +=
        '\n    };\n  </script>\n\n  <script type="text/javascript">\n  var site$;\n  if (typeof $ != \'undefined\') {\n    console.log(\'existing jquery: storing and then restoring\');\n    site$ = $;\n    $ = null;\n  }\n  </script>\n\n  <script src="https://cdn.bootcdn.net/ajax/libs/jquery/2.2.4/jquery.min.js">\n  </script>\n  <script type="text/javascript">\n  if (site$) {\n    console.log(\'existing jquery: avoiding conflict and restoring\');\n    bb$ = $.noConflict(true);\n    $ = site$;\n  } else {\n    bb$ = $;\n  }\n  </script>\n\n  <script src="' +
        escapeExpression(
          ((helper = helpers.host || (depth0 && depth0.host)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "host", hash: {}, data: data })
            : helper)
        ) +
        '/js/bibbase.min.js"\n          type="text/javascript">\n  </script>\n\n  <script type="text/javascript"\n          src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-AMS-MML_HTMLorMML">\n  </script>\n  <script type="text/x-mathjax-config">\n    MathJax.Hub.Config({tex2jax: {inlineMath: [[\'$\',\'$\'], [\'\\\\(\',\'\\\\)\']]},\n                        skipTags: ["body"],\n                        processClass: "bibbase_paper"});\n  </script>\n\n  <style>\n  @media print {\n    .dontprint {\n        display: none !important;\n    }\n\n  .bibbase_group {\n    background-color: #E0E0E0;\n    font-style: italic;\n    font-size: larger;\n    text-shadow: 0px 0px 3px #FFFFFF;\n    border-radius: 4px 4px 4px 4px;\n    -moz-border-radius: 4px 4px 4px 4px;\n    -webkit-border-radius: 4px;\n    padding: 5px 40px 5px;\n    margin-top: 10px;\n    margin-bottom: 5px;\n    cursor: pointer;\n  }\n\n  .bibbase_paper {\n    margin-bottom: 5px;\n  }\n\n  }\n  </style>\n\n  ';
      stack1 = helpers.unless.call(depth0, depth0 && depth0.whiteLabel, {
        name: "unless",
        hash: {},
        fn: this.program(1, data),
        inverse: this.program(4, data),
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer +=
        '\n\n  <div id="bibbase_header" class="dontprint" style="' +
        escapeExpression(
          ((helper = helpers.headerStyle || (depth0 && depth0.headerStyle)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "headerStyle", hash: {}, data: data })
            : helper)
        ) +
        '">\n\n    <ul class="nav nav-pills" style="margin: 0px;">\n\n      <li class="dropdown" id="groupby_dropdown">\n      <a class="dropdown-toggle"\n         data-toggle="dropdown"\n         href="#">\n          Group by\n          <b class="caret"></b>\n      </a>\n      <ul class="dropdown-menu">\n        <li class="groupby year"><a onclick="groupby(\'year\')">\n            Year</a>\n        </li>\n        <li class="groupby author"><a onclick="groupby(\'author_short\')">\n            Author</a>\n        </li>\n        <li class="groupby type"><a onclick="groupby(\'type\')">\n            Type</a>\n        </li>\n        <li class="groupby keyword"><a onclick="groupby(\'keyword\')">\n            Keyword</a>\n        </li>\n        <li class="groupby downloads"><a onclick="groupby(\'downloads\')">\n            Downloads</a>\n        </li>\n      </ul>\n      </li>\n\n\n      <li class="dropdown" id="menu_dropdown">\n      <a class="dropdown-toggle"\n         data-toggle="dropdown"\n         href="#" alt="controls">\n          <i class="fa fa-reorder" alt="controls"></i>\n          <b class="caret"></b>\n      </a>\n      <ul class="dropdown-menu">\n        <li>\n          <a onclick="toggleAll()">\n            <i class="fa fa-chevron-down fa-fw"></i> Expand/Collapse All\n          </a>\n        </li>\n        <li>\n          <a download="' +
        escapeExpression(
          ((helper =
            helpers.bibtexFilename || (depth0 && depth0.bibtexFilename)),
          typeof helper === functionType
            ? helper.call(depth0, {
                name: "bibtexFilename",
                hash: {},
                data: data,
              })
            : helper)
        ) +
        '" href="' +
        escapeExpression(
          ((helper = helpers.bibtexDataUrl || (depth0 && depth0.bibtexDataUrl)),
          typeof helper === functionType
            ? helper.call(depth0, {
                name: "bibtexDataUrl",
                hash: {},
                data: data,
              })
            : helper)
        ) +
        '">\n            <i class="fa fa-download fa-fw"></i> Download BibTeX\n          </a>\n        </li>\n        <li>\n          <a href="' +
        escapeExpression(
          ((helper = helpers.host || (depth0 && depth0.host)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "host", hash: {}, data: data })
            : helper)
        ) +
        "/rss?bib=" +
        escapeExpression(
          ((helper = helpers.biburl || (depth0 && depth0.biburl)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "biburl", hash: {}, data: data })
            : helper)
        ) +
        '">\n            <i class="fa fa-rss fa-fw"></i> RSS Feed\n          </a>\n          </li>\n      </ul>\n      </li>\n\n      ';
      stack1 = helpers["if"].call(depth0, depth0 && depth0.errors, {
        name: "if",
        hash: {},
        fn: this.program(6, data),
        inverse: this.noop,
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer += "\n\n\n      ";
      stack1 = helpers["if"].call(depth0, depth0 && depth0.showSearch, {
        name: "if",
        hash: {},
        fn: this.program(9, data),
        inverse: this.noop,
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer +=
        '\n    </ul>\n\n\n    <div class="alert alert-success bibbase_msg" id="bibbase_msg_embed"\n         style="display: none;">\n\n      Excellent! Next you can\n      <a href="/network/register?next=/network/newSiteFromTemplate%3Fbiburl=' +
        escapeExpression(
          ((helper = helpers.biburl || (depth0 && depth0.biburl)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "biburl", hash: {}, data: data })
            : helper)
        ) +
        '"\n      >create a new website with this list</a>, or\n      embed it in an existing web page by copying &amp; pasting\n      any of the following snippets.\n\n      <div style="text-align: left; margin-top: 1em;">\n        <strong>JavaScript</strong>\n        <span class="comment recommended">(easiest)</span>\n        <div class="well well-small">\n          <code>\n            &lt;script src="' +
        escapeExpression(
          ((helper = helpers.embed || (depth0 && depth0.embed)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "embed", hash: {}, data: data })
            : helper)
        );
      stack1 =
        ((helper = helpers.ifx || (depth0 && depth0.ifx) || helperMissing),
        helper.call(depth0, "this.embed.indexOf('?') >= 0", {
          name: "ifx",
          hash: {},
          fn: this.program(11, data),
          inverse: this.program(13, data),
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer +=
        'jsonp=1"&gt;&lt;/script&gt;\n          </code>\n        </div>\n\n        <strong>PHP</strong>\n        <div class="well well-small">\n          <code>\n            &lt;?php\n            $contents = file_get_contents("' +
        escapeExpression(
          ((helper = helpers.embed || (depth0 && depth0.embed)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "embed", hash: {}, data: data })
            : helper)
        ) +
        '");\n            print_r($contents);\n            ?&gt;\n          </code>\n        </div>\n\n        <strong>iFrame</strong>\n        <span class="comment">(not recommended)</span>\n        <div class="well well-small">\n          <code>\n            &lt;iframe src="' +
        escapeExpression(
          ((helper = helpers.embed || (depth0 && depth0.embed)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "embed", hash: {}, data: data })
            : helper)
        ) +
        '"&gt;&lt;/iframe&gt;\n          </code>\n        </div>\n\n        <p>\n          For more details see the <a href="' +
        escapeExpression(
          ((helper = helpers.host || (depth0 && depth0.host)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "host", hash: {}, data: data })
            : helper)
        ) +
        '/help">documention</a>.\n        </p>\n      </div>\n    </div>\n\n    <div class="alert alert-success bibbase_msg" id="bibbase_msg_preview"\n         style="display: none;">\n\n      This is a preview! To use this list on your own web site\n      or create a new web site from it,\n      <a href="/network/register?next=/network/newAccountWithFile%3FfileId=' +
        escapeExpression(
          ((stack1 =
            ((stack1 = depth0 && depth0.allParams),
            stack1 == null || stack1 === false ? stack1 : stack1.fileId)),
          typeof stack1 === functionType ? stack1.apply(depth0) : stack1)
        ) +
        '"\n      >create a free account</a>. The file will be added\n      and you will be able to edit it in the File Manager.\n      We will show you instructions once you\'ve created your account.\n    </div>\n\n    <div class="alert alert-warning bibbase_msg" id="bibbase_msg_mendeley1"\n         style="display: none;">\n\n      <p>To the site owner:</p>\n\n      <p><strong>Action required!</strong> Mendeley is changing its\n        API. In order to keep using Mendeley with BibBase past April\n        14th, you need to:\n        <ol>\n          <li>renew the authorization for BibBase on Mendeley, and</li>\n          <li>update the BibBase URL\n            in your page the same way you did when you initially set up\n            this page.\n          </li>\n        </ol>\n      </p>\n\n      <p>\n        <a href="http://bibbase.org/cgi-bin/mendeley2/get.py">\n          <i class="fa fa-angle-double-right"></i>\n          Fix it now</a>\n      </p>\n    </div>\n\n  </div>\n\n\n  <div id="bibbase_body">\n    ';
      stack1 =
        ((helper = helpers.body || (depth0 && depth0.body)),
        typeof helper === functionType
          ? helper.call(depth0, { name: "body", hash: {}, data: data })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return (
        buffer +
        '\n  </div>\n\n\n  \x3c!-- Modal --\x3e\n\n  \x3c!-- <iframe id="bibbase_network_frame" --\x3e\n  \x3c!--         src="' +
        escapeExpression(
          ((helper = helpers.host || (depth0 && depth0.host)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "host", hash: {}, data: data })
            : helper)
        ) +
        '/network/control" --\x3e\n  \x3c!--         style="display: none;"> --\x3e\n  \x3c!-- </iframe> --\x3e\n\n</div>\n'
      );
    },
    useData: true,
  });
  templates["page_list"] = template({
    1: function (depth0, helpers, partials, data) {
      var helper,
        functionType = "function",
        escapeExpression = this.escapeExpression;
      return (
        '\n    <a href="' +
        escapeExpression(
          ((helper = helpers.next || (depth0 && depth0.next)),
          typeof helper === functionType
            ? helper.call(depth0, { name: "next", hash: {}, data: data })
            : helper)
        ) +
        '">More..</a>\n    '
      );
    },
    compiler: [5, ">= 2.0.0"],
    main: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        functionType = "function",
        escapeExpression = this.escapeExpression,
        helperMissing = helpers.helperMissing,
        buffer =
          '<html>\n\n  <head>\n    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n    <title>BibBase: List of ' +
          escapeExpression(
            ((helper = helpers.title || (depth0 && depth0.title)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "title", hash: {}, data: data })
              : helper)
          ) +
          '</title>\n    <link rel="stylesheet" type="text/css" href="/style.css" />\n  </head>\n  \n\n  <body id="stats">\n\n    <h1>' +
          escapeExpression(
            ((helper = helpers.title || (depth0 && depth0.title)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "title", hash: {}, data: data })
              : helper)
          ) +
          "</h1>    \n\n    ";
      stack1 =
        ((helper =
          helpers.insert || (depth0 && depth0.insert) || helperMissing),
        helper.call(depth0, "page", { name: "insert", hash: {}, data: data }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer += "\n\n    <hr />\n    ";
      stack1 = helpers["if"].call(depth0, depth0 && depth0.next, {
        name: "if",
        hash: {},
        fn: this.program(1, data),
        inverse: this.noop,
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "    \n  </body>\n\n</html>\n";
    },
    useData: true,
  });
  templates["paper"] = template({
    compiler: [5, ">= 2.0.0"],
    main: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        functionType = "function",
        escapeExpression = this.escapeExpression,
        helperMissing = helpers.helperMissing,
        buffer =
          '<div class="bibbase_paper" id="' +
          escapeExpression(
            ((helper = helpers.bibbaseid || (depth0 && depth0.bibbaseid)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "bibbaseid", hash: {}, data: data })
              : helper)
          ) +
          '">\n  ';
      stack1 =
        ((helper =
          helpers.insert || (depth0 && depth0.insert) || helperMissing),
        helper.call(depth0, "title_person", {
          name: "insert",
          hash: {},
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer += "\n  ";
      stack1 =
        ((helper = helpers.typeTemplate || (depth0 && depth0.typeTemplate)),
        typeof helper === functionType
          ? helper.call(depth0, { name: "typeTemplate", hash: {}, data: data })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer += "\n  ";
      stack1 =
        ((helper =
          helpers.insert || (depth0 && depth0.insert) || helperMissing),
        helper.call(depth0, "extras", {
          name: "insert",
          hash: {},
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n</div>\n";
    },
    useData: true,
  });
  templates["papers"] = template({
    1: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        helperMissing = helpers.helperMissing,
        buffer = "\n  ";
      stack1 =
        ((helper =
          helpers.insert || (depth0 && depth0.insert) || helperMissing),
        helper.call(depth0, "groups", {
          name: "insert",
          hash: {},
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n";
    },
    3: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        helperMissing = helpers.helperMissing,
        buffer = "\n  ";
      stack1 =
        ((helper =
          helpers.insert || (depth0 && depth0.insert) || helperMissing),
        helper.call(depth0, "list", { name: "insert", hash: {}, data: data }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n";
    },
    compiler: [5, ">= 2.0.0"],
    main: function (depth0, helpers, partials, data) {
      var stack1,
        buffer = "";
      stack1 = helpers["if"].call(depth0, depth0 && depth0.groups, {
        name: "if",
        hash: {},
        fn: this.program(1, data),
        inverse: this.program(3, data),
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n";
    },
    useData: true,
  });
  templates["person"] = template({
    1: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        helperMissing = helpers.helperMissing,
        buffer = ",\n  editor";
      stack1 =
        ((helper = helpers.ifx || (depth0 && depth0.ifx) || helperMissing),
        helper.call(depth0, "this[this.role+'_short'].length > 1", {
          name: "ifx",
          hash: {},
          fn: this.program(2, data),
          inverse: this.noop,
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + ".\n  ";
    },
    2: function (depth0, helpers, partials, data) {
      return "s";
    },
    compiler: [5, ">= 2.0.0"],
    main: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        helperMissing = helpers.helperMissing,
        buffer = '<span class="bibbase_paper_author">\n  ';
      stack1 =
        ((helper =
          helpers.getPerson || (depth0 && depth0.getPerson) || helperMissing),
        helper.call(depth0, depth0 && depth0.role, depth0 && depth0.metadata, {
          name: "getPerson",
          hash: {},
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      stack1 =
        ((helper = helpers.ifx || (depth0 && depth0.ifx) || helperMissing),
        helper.call(depth0, "this.role == 'editor'", {
          name: "ifx",
          hash: {},
          fn: this.program(1, data),
          inverse: this.noop,
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n</span>\n";
    },
    useData: true,
  });
  templates["poster"] = template({
    compiler: [5, ">= 2.0.0"],
    main: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        functionType = "function",
        buffer =
          '<script type="text/javascript">\n  window.parent.postMessage(';
      stack1 =
        ((helper = helpers.message || (depth0 && depth0.message)),
        typeof helper === functionType
          ? helper.call(depth0, { name: "message", hash: {}, data: data })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + ", '*');\n</script>\n";
    },
    useData: true,
  });
  templates["publication"] = template({
    compiler: [5, ">= 2.0.0"],
    main: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        functionType = "function",
        helperMissing = helpers.helperMissing,
        buffer =
          '\n<html>\n\n  <head>\n    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n    <title>BibBase: ';
      stack1 =
        ((helper = helpers.title || (depth0 && depth0.title)),
        typeof helper === functionType
          ? helper.call(depth0, { name: "title", hash: {}, data: data })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer +=
        '</title>\n    <link rel="stylesheet" type="text/css" href="/css/styles/default.css" />\n    <link rel="stylesheet" type="text/css" href="/css/styles/common.css" />\n  </head>\n\n\n  <body id="publication">\n\n    <img src="/img/logo.svg" id="logo" style="float:right" alt="bibbase.org">\n\n    ';
      stack1 =
        ((helper =
          helpers.insert || (depth0 && depth0.insert) || helperMissing),
        helper.call(depth0, "paper", { name: "insert", hash: {}, data: data }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n\n  </body>\n\n</html>\n";
    },
    useData: true,
  });
  templates["redirector"] = template({
    compiler: [5, ">= 2.0.0"],
    main: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        functionType = "function",
        buffer =
          '<script type="text/javascript">\n  window.parent.location.href = \'';
      stack1 =
        ((helper = helpers.redirect || (depth0 && depth0.redirect)),
        typeof helper === functionType
          ? helper.call(depth0, { name: "redirect", hash: {}, data: data })
          : helper);
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "';\n</script>\n";
    },
    useData: true,
  });
  templates["test_result"] = template({
    1: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        helperMissing = helpers.helperMissing,
        buffer = "\n";
      stack1 =
        ((helper =
          helpers.insert || (depth0 && depth0.insert) || helperMissing),
        helper.call(depth0, "diff", depth0, {
          name: "insert",
          hash: {},
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n";
    },
    compiler: [5, ">= 2.0.0"],
    main: function (depth0, helpers, partials, data) {
      var stack1,
        buffer =
          '<html>\n<head>\n  <link href="css/test.css" rel="stylesheet" type="text/css">\n</head>\n\n<body>\n\n';
      stack1 = helpers.each.call(depth0, depth0, {
        name: "each",
        hash: {},
        fn: this.program(1, data),
        inverse: this.noop,
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n\n</body>\n\n</html>\n";
    },
    useData: true,
  });
  templates["title"] = template({
    1: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        functionType = "function",
        escapeExpression = this.escapeExpression,
        helperMissing = helpers.helperMissing,
        buffer =
          '\n  <a href="' +
          escapeExpression(
            ((helper = helpers.host || (depth0 && depth0.host)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "host", hash: {}, data: data })
              : helper)
          ) +
          "/network/publication/" +
          escapeExpression(
            ((helper = helpers.bibbaseid || (depth0 && depth0.bibbaseid)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "bibbaseid", hash: {}, data: data })
              : helper)
          ) +
          "\"\n     onclick=\"return trackOutboundLink('publications', 'click', '" +
          escapeExpression(
            ((helper = helpers.bibbaseid || (depth0 && depth0.bibbaseid)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "bibbaseid", hash: {}, data: data })
              : helper)
          ) +
          "', '" +
          escapeExpression(
            ((helper = helpers.host || (depth0 && depth0.host)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "host", hash: {}, data: data })
              : helper)
          ) +
          "/network/publication/" +
          escapeExpression(
            ((helper = helpers.bibbaseid || (depth0 && depth0.bibbaseid)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "bibbaseid", hash: {}, data: data })
              : helper)
          ) +
          "', event);\">\n    ";
      stack1 =
        ((helper =
          helpers.formatTitle ||
          (depth0 && depth0.formatTitle) ||
          helperMissing),
        helper.call(depth0, depth0, {
          name: "formatTitle",
          hash: {},
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n  </a>\n  ";
    },
    3: function (depth0, helpers, partials, data) {
      var stack1,
        buffer = "\n  ";
      stack1 = helpers["if"].call(depth0, depth0 && depth0.noTitleLinks, {
        name: "if",
        hash: {},
        fn: this.program(4, data),
        inverse: this.program(6, data),
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n  ";
    },
    4: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        helperMissing = helpers.helperMissing,
        buffer = "\n  ";
      stack1 =
        ((helper =
          helpers.formatTitle ||
          (depth0 && depth0.formatTitle) ||
          helperMissing),
        helper.call(depth0, depth0, {
          name: "formatTitle",
          hash: {},
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n  ";
    },
    6: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        helperMissing = helpers.helperMissing,
        buffer = "\n  ";
      stack1 =
        ((helper = helpers.ifx || (depth0 && depth0.ifx) || helperMissing),
        helper.call(depth0, "Object.values(this.urls).length > 0", {
          name: "ifx",
          hash: {},
          fn: this.program(7, data),
          inverse: this.program(4, data),
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n  ";
    },
    7: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        helperMissing = helpers.helperMissing,
        escapeExpression = this.escapeExpression,
        functionType = "function",
        buffer =
          '\n  <a href="' +
          escapeExpression(
            ((helper =
              helpers.findPdfUrl ||
              (depth0 && depth0.findPdfUrl) ||
              helperMissing),
            helper.call(depth0, depth0 && depth0.urls, {
              name: "findPdfUrl",
              hash: {},
              data: data,
            }))
          ) +
          "\"\n     onclick=\"return trackOutboundLink('publications', 'click', '" +
          escapeExpression(
            ((helper = helpers.bibbaseid || (depth0 && depth0.bibbaseid)),
            typeof helper === functionType
              ? helper.call(depth0, { name: "bibbaseid", hash: {}, data: data })
              : helper)
          ) +
          "', '" +
          escapeExpression(
            ((helper =
              helpers.findPdfUrl ||
              (depth0 && depth0.findPdfUrl) ||
              helperMissing),
            helper.call(depth0, depth0 && depth0.urls, {
              name: "findPdfUrl",
              hash: {},
              data: data,
            }))
          ) +
          "', event);\">\n    ";
      stack1 =
        ((helper =
          helpers.formatTitle ||
          (depth0 && depth0.formatTitle) ||
          helperMissing),
        helper.call(depth0, depth0, {
          name: "formatTitle",
          hash: {},
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n  </a>\n  ";
    },
    compiler: [5, ">= 2.0.0"],
    main: function (depth0, helpers, partials, data) {
      var stack1,
        buffer = '<span class="bibbase_paper_title">\n  ';
      stack1 = helpers["if"].call(depth0, depth0 && depth0.titleLinks, {
        name: "if",
        hash: {},
        fn: this.program(1, data),
        inverse: this.program(3, data),
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n</span>\n";
    },
    useData: true,
  });
  templates["title_person"] = template({
    1: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        helperMissing = helpers.helperMissing,
        buffer = "\n  ";
      stack1 =
        ((helper =
          helpers.insert || (depth0 && depth0.insert) || helperMissing),
        helper.call(depth0, "person", {
          name: "insert",
          hash: {},
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer += "\n  ";
      stack1 =
        ((helper =
          helpers.insert || (depth0 && depth0.insert) || helperMissing),
        helper.call(depth0, "title", { name: "insert", hash: {}, data: data }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n  ";
    },
    3: function (depth0, helpers, partials, data) {
      var stack1,
        helper,
        helperMissing = helpers.helperMissing,
        buffer = "\n  ";
      stack1 =
        ((helper =
          helpers.insert || (depth0 && depth0.insert) || helperMissing),
        helper.call(depth0, "title", { name: "insert", hash: {}, data: data }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      buffer += "\n  ";
      stack1 =
        ((helper =
          helpers.insert || (depth0 && depth0.insert) || helperMissing),
        helper.call(depth0, "person", {
          name: "insert",
          hash: {},
          data: data,
        }));
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n  ";
    },
    compiler: [5, ">= 2.0.0"],
    main: function (depth0, helpers, partials, data) {
      var stack1,
        buffer = '<span class="bibbase_paper_titleauthoryear">\n\n  ';
      stack1 = helpers["if"].call(depth0, depth0 && depth0.authorFirst, {
        name: "if",
        hash: {},
        fn: this.program(1, data),
        inverse: this.program(3, data),
        data: data,
      });
      if (stack1 || stack1 === 0) {
        buffer += stack1;
      }
      return buffer + "\n\n</span>\n";
    },
    useData: true,
  });
})();
console.log("loading bibbase.js");
toggle = function (d) {
  console.log(d);
  bb$(d.nextSibling).toggle(200);
  bb$(d.firstChild).toggleClass("fa-angle-down").toggleClass("fa-angle-right");
};
toggleGroup = function (id) {
  bb$("#" + id + " .bibbase_group_body").toggle(200);
  bb$("#" + id + " .bibbase_group_head_icon")
    .toggleClass("fa-angle-down")
    .toggleClass("fa-angle-right");
};
toggleAll = function () {
  bb$(".bibbase_group_body").toggle(200);
  bb$(".bibbase_group_head_icon")
    .toggleClass("fa-angle-down")
    .toggleClass("fa-angle-right");
};
showBib = function (e) {
  bb$(e.target)
    .parents(".bibbase_paper")
    .find("[data-type=bibtex]")
    .slideToggle(300);
};
showAbstract = function (e) {
  bb$(e.target)
    .parents(".bibbase_paper")
    .find("[data-type=abstract]")
    .slideToggle(300);
};
log_download = function (bibbaseid, URL, ctrlKey, event) {
  console.log("logging");
  event.preventDefault();
  var timeout;
  function go() {
    console.log("go", URL);
    timeout && clearTimeout(timeout);
    if (ctrlKey) {
      Object.assign(document.createElement("a"), {
        target: "_blank",
        href: URL,
      }).click();
    } else {
      document.location = URL;
    }
  }
  var request = bb$
    .ajax({
      type: "POST",
      url: server + "/log",
      data: { type: "download", bibbaseid: bibbaseid, url: URL },
      dataType: "json",
    })
    .done(function () {
      console.log("logged");
      ga("send", "event", "publications", "download", bibbaseid, {
        hitCallback: go,
      });
      timeout && clearTimeout(timeout);
      timeout = setTimeout(go, 500);
    });
  timeout = setTimeout(go, 1e3);
  return false;
};
function log_buy(bibbaseid, url) {
  ga("send", "event", "publications", "buy", bibbaseid, {
    hitCallback: function () {
      document.location = url;
    },
  });
  setTimeout(function () {
    document.location = url;
  }, 500);
}
function log_send(msg, callback) {
  server = server || "";
  var request = bb$
    .ajax({ type: "POST", url: server + "/log", data: msg, dataType: "json" })
    .done(callback);
}
var trackOutboundLink = function (action, label, val, url, event) {
  event.preventDefault();
  var timeout;
  function go() {
    console.log("go", url);
    timeout && clearTimeout(timeout);
    document.location = url;
  }
  ga("send", "event", action, label, val, { hitCallback: go });
  timeout = setTimeout(go, 500);
  return false;
};
// const pushAll = (array, items) => array.splice(array.length, 0, ...items);
reGroup = function () {
  console.log("reGroup", bibbase.groupby, bibbase.filter);
  let data = bibbase.data;
  if (bibbase.filter) {
    bibbase.filter.split(" ").forEach((filter) => {
      const regex = new RegExp(filter, "i");
      data = data.filter((item) => {
        const items = [item.title];
        item.author &&
          item.author.map &&
          pushAll(
            items,
            item.author.map((x) => Object.values(x).join(" "))
          );
        item.editor &&
          item.editor.map &&
          pushAll(
            items,
            item.editor.map((x) => Object.values(x).join(" "))
          );
        item.keyword && pushAll(items, item.keyword);
        item.year && items.push(item.year);
        item.booktitle && items.push(item.booktitle);
        const string = items.join(" ");
        return string.match(regex);
      });
    });
  }
  var dataGrouped = groupDataRec(data, [bibbase.params.groupby || "year"]);
  bb$("#bibbase_body").html(Handlebars.templates["papers"](dataGrouped));
  markRead();
};
groupby = function (category) {
  bibbase.params.groupby = category;
  reGroup();
};
handleSearch = (value) => {
  console.log("handleSearch", value);
  bibbase.filter = value;
  reGroup();
};
if (typeof Meteor == "undefined") {
  TemplatesObject = Handlebars.templates;
}
get = function (field, template, data) {
  if (data[field]) {
    if (template) {
      return template.replace(/X/g, data[field]);
    } else {
      return data[field];
    }
  } else {
    return "";
  }
};
// const groupTransform = (value, category) => {
//   if (category == "author_short" && value instanceof Array) {
//     return value.map((shortname) => {
//       const comma = shortname.indexOf(",");
//       return comma ? shortname.slice(0, comma + 4) : shortname;
//     });
//   } else {
//     return value;
//   }
// };
groupDataRec = function (data, categories) {
  if (categories.length > 0) {
    var dataByGroup = _.reduce(
      data,
      function (memo, item) {
        var addit = function (memo, item, k) {
          if (!memo[k]) {
            memo[k] = [];
          }
          memo[k].push(item);
        };
        var item2;
        if (item.bibdata) {
          item2 = item.bibdata;
        } else {
          item2 = item;
        }
        var catvalue = item2[categories[0]];
        catvalue = groupTransform(catvalue, categories[0]);
        if (catvalue instanceof Array) {
          _.each(catvalue, function (k) {
            addit(memo, item, k);
          });
        } else {
          addit(memo, item, catvalue);
        }
        return memo;
      },
      {}
    );
    var asArray = _.map(dataByGroup, function (list, key) {
      key = key.replace(/<nbsp>/g, " ");
      return _.extend({ key: key }, groupDataRec(list, categories.slice(1)));
    });
    var sorted;
    if (categories[0] == "year" || categories[0] == "downloads") {
      sorted = _.sortBy(asArray, function (item) {
        return -1 * Number(item.key);
      });
    } else {
      sorted = _.sortBy(asArray, function (item) {
        return item.key;
      });
    }
    return { groups: sorted };
  } else {
    return {
      items: _.sortBy(data, function (bibdata) {
        return -bibdata.votes || 0;
      }),
    };
  }
};
amazonString = function (data) {
  let amazon_string;
  if (data.bibtype == "book") {
    amazon_string = data.title;
  } else if (data.bibtype == "inbook") {
    amazon_string = data.series || data.title || data.booktitle;
  } else if (data.bibtype == "incollection") {
    amazon_string = data.booktitle;
  } else if (data.bibtype == "proceedings") {
    amazon_string = data.title || data.title;
  }
  if (amazon_string) {
    amazon_string = amazon_string.replace(/\(.*\)/g, "");
  }
  if (data.author && data.author[0] && data.author[0].lastnames) {
    amazon_string = data.author[0].lastnames[0] + " " + amazon_string;
  }
  return amazon_string;
};
// const artifactIcons = {
//   available: "generic_available.png",
//   functional: "generic_evaluated.png",
//   reusable: "generic_evaluated.png",
//   reproduced: "generic_results.png",
//   replicated: "generic_results.png",
// };
bibbaseHelpers = {
  insert: function (template) {
    return TemplatesObject[template](this);
  },
  get: get,
  getList: function (array) {
    const newarray = [];
    for (let i in array) {
      const val = array[i];
      if (val) {
        if (val.length > 0) {
          newarray.push(val);
        }
      }
    }
    return newarray.join(", ");
  },
  getPerson: function (role, metadata, data) {
    if (!data || data.hash) {
      data = this;
    }
    if (!metadata) {
      metadata = data.metadata;
    }
    let rtv = "";
    const array =
      data.params && data.params.fullnames == "1"
        ? _.map(data[role], function (a) {
            return _.union(
              a.prefixes,
              a.firstnames,
              a.lastnames,
              a.suffixes
            ).join(" ");
          })
        : data[role + "_short"];
    if (array) {
      for (let i = 0; i < array.length; i++) {
        if (i > 0) {
          rtv += data.params.commas ? ", " : "; ";
        }
        if (array.length > 1 && i == array.length - 1) {
          rtv += data.params.commas ? " &amp; " : " and ";
        }
        const coauthor_name = array[i].replace("<nbsp>", "&nbsp;");
        const shortname = coauthor_name
          .slice(0, coauthor_name.indexOf("."))
          .toLowerCase();
        if (
          metadata &&
          metadata != null &&
          metadata.authorlinks &&
          metadata.authorlinks[shortname]
        ) {
          rtv +=
            '<a class="bibbase author link" href="' +
            metadata.authorlinks[shortname] +
            '">' +
            coauthor_name +
            "</a>";
        } else {
          rtv += coauthor_name;
        }
      }
      if (data.params && data.params.fullnames == "1") {
        rtv += ".";
      }
      return rtv;
    } else {
      return null;
    }
  },
  capitalize: function (s) {
    return s && s.length > 0 ? s[0].toUpperCase() + s.slice(1) : s;
  },
  guessFiletype: function (URL) {
    var knownFiletypes = [
      "pdf",
      "ps",
      "txt",
      "png",
      "jpg",
      "gif",
      "tif",
      "doc",
      "docx",
      "ppt",
      "pptx",
      "xls",
      "xlsx",
    ];
    if (URL && typeof URL == "string") {
      var extension = URL.slice(URL.lastIndexOf(".") + 1).toLowerCase();
      if (knownFiletypes.indexOf(extension) >= 0) {
        return extension;
      }
    }
    return "link";
  },
  getExtension: function (URL) {
    if (URL && typeof URL == "string") {
      return URL.slice(URL.lastIndexOf(".") + 1).toLowerCase();
    }
    return "...";
  },
  normalizeString: function (string) {
    return string.replace(/[^a-zA-Z0-9]/g, "_");
  },
  formatTitle: function (data) {
    const title = data.type == "inbook" ? data.chapter : data.title;
    return (title ? title.replace(/\.$/, "") : "") + ".";
  },
  note: function () {
    return get("note", "X", this);
  },
  bibbase_note: function () {
    return get("bibbase_note", "X", this);
  },
  artifactBadgesLabel: function () {
    if (
      this.keyword &&
      this.keyword.some &&
      this.keyword.some((k) => k.match(/artifacts:(.+)/))
    ) {
      return '<span class="bibbase_artifacts_label">Artifact Evaluation Badges:</span>';
    } else {
      return "";
    }
  },
  renderArtifactBadge: function () {
    const match = this.match(/artifacts:(.+)/);
    if (match) {
      const badge = match[1];
      const prefix = badge.startsWith("rep") ? "Results" : "Artifacts";
      const url = Meteor.absoluteUrl(`/img/acm_badges/${artifactIcons[badge]}`);
      const capitalized = badge[0].toUpperCase() + badge.slice(1);
      return `<img src="${url}" title="${prefix} ${capitalized}" class="bibbase_artifact_badge" />`;
    }
    return "";
  },
  typeTemplate: function () {
    var data = this;
    var getList = bibbaseHelpers.getList;
    var capitalize = bibbaseHelpers.capitalize;
    var get = function (field, template) {
      return bibbaseHelpers.get(field, template, data);
    };
    var getPerson = function (field) {
      return bibbaseHelpers.getPerson(field, undefined, data);
    };
    var thesisFunction = function () {
      var typeMap = {
        bathesis: "Bachelor's thesis",
        mathesis: "Master's thesis",
        mastersthesis: "Master's thesis",
      };
      var type = get("type");
      var rtv =
        getList([
          type ? typeMap[type] || type : "Thesis",
          get("school"),
          get("address"),
          get("month") + " " + get("year"),
        ]) + ".";
      return rtv;
    };
    var functions = {
      inproceedings: function () {
        var rtv =
          "In " +
          getList([
            data.editor ? getPerson("editor") + ", editor(s)" : "",
            get("booktitle", "<i>X</i>", data),
            get("volume", "volume X", data),
            get("series") != get("booktitle")
              ? get("series", "of <i>X</i>", data)
              : "",
            get("pages", "pages X", data),
            get("address"),
            get("month") + " " + get("year"),
          ]) +
          ". ";
        if (data.organization || data.publisher) {
          rtv += getList([get("organization"), get("publisher")]);
        }
        return rtv;
      },
      article: function () {
        var rtv = get("journal", "<i>X</i>");
        if (data.number || data.volume || data.pages) {
          rtv += ",";
        }
        if (data.number || data.volume) {
          rtv += " " + get("volume") + get("number", "(X)");
          if (data.pages) {
            rtv += ": ";
          }
        }
        rtv += get("pages") + ". " + get("month") + " " + get("year") + ".";
        return rtv;
      },
      book: function () {
        var rtv = "";
        if (data.volume || data.series) {
          rtv += get("volume", "Volume X") + " " + get("series", "of X");
        }
        rtv +=
          getList([
            get("publisher"),
            get("address"),
            get("edition", "X edition"),
            get("month") + " " + get("year"),
          ]) + ".";
        return rtv;
      },
      booklet: function () {
        var rtv =
          getList([
            get("howpublished"),
            get("address"),
            get("month") + " " + get("year"),
          ]) + ".";
        return rtv;
      },
      inbook: function () {
        var rtv = "";
        if (data.volume || data.series) {
          rtv +=
            capitalize(
              get("volume", "volume X") + " " + get("series", "of X")
            ) + ". ";
        }
        if (data.title || data.pages) {
          rtv += getList([get("title"), get("pages", "pages X")]) + ". ";
          rtv += data.editor ? getPerson("editor") + ", editor(s). " : "";
        }
        rtv +=
          getList([
            get("publisher"),
            get("address"),
            get("edition", "X edition"),
            get("month") + " " + get("year"),
          ]) + ".";
        return rtv;
      },
      incollection: function () {
        var rtv = "";
        rtv +=
          "In " +
          getList([
            data.editor ? getPerson("editor") + ", editor(s)" : "",
            get("booktitle", "<i>X</i>"),
            get("volume", "volume X"),
            get("series", "of X"),
            get("chapter"),
            get("pages", "pages X"),
          ]) +
          ". " +
          capitalize(
            getList([
              get("publisher"),
              get("address"),
              get("edition", "X edition"),
              get("month") + " " + get("year"),
            ])
          ) +
          ".";
        return rtv;
      },
      manual: function () {
        var rtv =
          getList([
            get("organization"),
            get("address"),
            get("edition", "X edition"),
            get("month") + " " + get("year"),
          ]) + ".";
        return rtv;
      },
      mastersthesis: thesisFunction,
      thesis: thesisFunction,
      phdthesis: function () {
        var rtv =
          getList([
            "Ph.D. Thesis",
            get("school"),
            get("address"),
            get("month") + " " + get("year"),
          ]) + ".";
        return rtv;
      },
      misc: function () {
        var rtv = getList([
          get("howpublished"),
          get("month") + " " + get("year"),
        ]);
        if (rtv.length > 1) {
          rtv += ".";
        }
        return rtv;
      },
      proceedings: function () {
        var rtv = "";
        if (data.volume || data.series) {
          rtv +=
            getList([get("volume", "Volume X"), get("series", "of X")]) + ".";
        }
        if (data.organization || data.publisher) {
          rtv += getList([get("organization"), get("publisher")]) + ". ";
        }
        rtv +=
          getList([get("address"), get("month") + " " + get("year")]) + ".";
        return rtv;
      },
      techreport: function () {
        var rtv =
          "Technical Report " +
          getList([
            get("number"),
            get("institution"),
            get("address"),
            get("month") + " " + get("year"),
          ]) +
          ".";
        return rtv;
      },
      unpublished: function () {
        var rtv = get("month") + " " + get("year") + ".";
        return rtv;
      },
    };
    var func =
      functions[data.bibtype.toLowerCase()] ||
      function () {
        var rtv = get("month") + " " + get("year") + ".";
        rtv +=
          "\x3c!-- NOTE FROM BIBBASE: This entry has an invalid bibtex entry type: " +
          data.bibtype +
          ". Therefore, we don't know how to render it properly. Please consider fixing this. --\x3e";
        return rtv;
      };
    return func();
  },
  findPdfUrl: function (urls) {
    if (!urls || Object.values(urls).length == 0) {
      return "#";
    }
    const values = Object.values(urls);
    return (
      values.find((u) => u.match(/pdf($|#.*)/i)) ||
      Object.values(urls)[0] ||
      "#"
    );
  },
};
registerHelper = function (HandlebarsRegister) {
  _.each(bibbaseHelpers, function (value, key) {
    HandlebarsRegister.registerHelper(key, value);
  });
  HandlebarsRegister.registerHelper("each_with_key", function (obj, options) {
    var context = {},
      buffer = "",
      key,
      keyName = options.hash.key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        context.value = obj[key];
        context.key = key;
        buffer += options.fn(context);
      }
    }
    return buffer;
  });
  HandlebarsRegister.registerHelper("ifx", function (conditional, options) {
    var truthValue = false;
    try {
      truthValue = eval(conditional);
    } catch (e) {
      console.log(
        "Exception in #ifx evaluation of condition: ",
        conditional,
        e
      );
    }
    if (truthValue) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
};
// const srcUrl = new URL(document.currentScript.src);
bb$("#bibbase").hide();
bb$("#spinner").show();
var server = srcUrl.origin;
if (
  typeof bibbase != "undefined" &&
  bibbase.params &&
  !bibbase.params["css"] &&
  !bibbase.params["theme"]
) {
  loadcss(server + "/css/styles/hide_text.css");
}
loadcss(server + "/css/styles/common.css");
bibbase.theme = server + "/css/styles/default.css";
if (
  typeof bibbase != "undefined" &&
  bibbase.params &&
  bibbase.params["theme"]
) {
  bibbase.theme = server + "/css/styles/" + bibbase.params["theme"] + ".css";
}
loadcss(bibbase.theme);
if (bibbase.params["css"]) {
  loadcss("//" + bibbase.params.css, "append");
}
function loadBootstrap(callback) {
  if (bibbase.params.noBootstrap) {
    console.log("(BibBase) noBootstrap: not loading Bootstrap");
    callback();
    return;
  }
  var bootstrap_enabled = typeof bb$.fn.modal == "function";
  for (var i = 0; i < document.scripts.length; i++) {
    if (document.scripts[i].src.indexOf("/bootstrap.") >= 0) {
      bootstrap_enabled = true;
      break;
    }
  }
  if (bootstrap_enabled) {
    console.log(
      "(BibBase) Looks like you already have bootstrap. Using that. If things don't work quite right, try to remove your own bootstrap js/css and see whether that fixes things."
    );
    callback();
  } else {
    loadcss(server + "/css/bootstrap.min.css");
    bb$.getScript(server + "/js/bootstrap.min.js", callback);
  }
}
loadcss(
  // "//netdna.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css"
  "//cdn.bootcdn.net/ajax/libs/font-awesome/4.1.0/css/font-awesome.css"
);
function loadcss(css, method) {
  if (document.createStyleSheet) {
    document.createStyleSheet(css);
  } else {
    method = method || "prepend";
    bb$("head")[method](
      bb$(
        "<link rel='stylesheet' href='" +
          css +
          "' type='text/css' media='screen' />"
      )
    );
  }
}
function gatherHTML() {
  var htmls = {};
  bb$(".bibbase_paper").each(function (i, e) {
    htmls[e.id] = e.outerHTML;
  });
  for (var i in bibbase.data) {
    var d = bibbase.data[i];
    d.html = htmls[d.bibbaseid];
  }
}
function markRead() {
  if (bibbase && bibbase.read) {
    bb$(".read").removeClass("hasread");
    bibbase.read.forEach(function (readItem) {
      bb$("#" + readItem.bibbaseid + " .read").addClass("hasread");
    });
  }
}
var handleResponse = {
  get: function (message) {
    if (message.result) {
      console.log("marking read");
      bibbase.read = message.result;
      markRead();
    }
  },
};
onMessage = function (event) {
  if (this != event.source && typeof bibbase != "undefined") {
    var message = JSON.parse(event.data);
    bibbase.networkFrame = event.source;
    if (message.type == "response") {
      handleResponse[message.command](message);
    }
  }
};
toggleRead = function (bibbaseid) {
  console.log("toggle ", bibbaseid);
  var read = false;
  if (bibbase.read) {
    bibbase.read.forEach(function (readitem) {
      if (readitem.bibbaseid == bibbaseid) {
        console.log("unread ", readitem);
        var message = { command: "unread", _id: readitem._id, isbibbase: true };
        bibbase.networkFrame.postMessage(JSON.stringify(message), "*");
        read = true;
      }
    });
  }
  if (!read) {
    console.log("read ", bibbaseid);
    var message = { command: "read", bibbaseid: bibbaseid, isbibbase: true };
    bibbase.networkFrame.postMessage(JSON.stringify(message), "*");
  }
};
bb$(document).ready(function () {
  if (typeof bibbase != "undefined") {
    gatherHTML();
    if (bibbase.params) {
      if (bibbase.params["folding"] && bibbase.params["folding"] == 1) {
        toggleAll();
      }
      log_send({
        type: "visit",
        biburl: bibbase.params.bib,
        title: document.title,
        ownerID: bibbase.ownerID,
        token: bibbase.params.token,
        href: location.href,
      });
      if (bibbase.params.msg) {
        bb$("#bibbase_msg_" + bibbase.params.msg)
          .delay(500)
          .slideDown(400);
      }
    }
  }
  loadBootstrap(function () {
    bb$("#spinner").hide();
    bb$("#bibbase").show();
  });
  bb$(".bibbase.author.link").on("click", function (e) {
    console.log(e.target);
    ga("send", "event", "authors", "link clicked", e.target.innerHTML);
  });
  bb$("head").append(bb$("<style/>", { id: "bibbase_style_read" }));
  if (window.attachEvent) {
    window.attachEvent("onmessage", onMessage);
  } else if (window.addEventListener) {
    window.addEventListener("message", onMessage, false);
  }
  registerHelper(Handlebars);
});
(function () {
  var root = this;
  var previousUnderscore = root._;
  var breaker = {};
  var ArrayProto = Array.prototype,
    ObjProto = Object.prototype,
    FuncProto = Function.prototype;
  var push = ArrayProto.push,
    slice = ArrayProto.slice,
    concat = ArrayProto.concat,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty;
  var nativeForEach = ArrayProto.forEach,
    nativeMap = ArrayProto.map,
    nativeReduce = ArrayProto.reduce,
    nativeReduceRight = ArrayProto.reduceRight,
    nativeFilter = ArrayProto.filter,
    nativeEvery = ArrayProto.every,
    nativeSome = ArrayProto.some,
    nativeIndexOf = ArrayProto.indexOf,
    nativeLastIndexOf = ArrayProto.lastIndexOf,
    nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeBind = FuncProto.bind;
  var _ = function (obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };
  if (typeof exports !== "undefined") {
    if (typeof module !== "undefined" && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }
  _.VERSION = "1.6.0";
  var each =
    (_.each =
    _.forEach =
      function (obj, iterator, context) {
        if (obj == null) return obj;
        if (nativeForEach && obj.forEach === nativeForEach) {
          obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
          for (var i = 0, length = obj.length; i < length; i++) {
            if (iterator.call(context, obj[i], i, obj) === breaker) return;
          }
        } else {
          var keys = _.keys(obj);
          for (var i = 0, length = keys.length; i < length; i++) {
            if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker)
              return;
          }
        }
        return obj;
      });
  _.map = _.collect = function (obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function (value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };
  var reduceError = "Reduce of empty array with no initial value";
  _.reduce =
    _.foldl =
    _.inject =
      function (obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj == null) obj = [];
        if (nativeReduce && obj.reduce === nativeReduce) {
          if (context) iterator = _.bind(iterator, context);
          return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
        }
        each(obj, function (value, index, list) {
          if (!initial) {
            memo = value;
            initial = true;
          } else {
            memo = iterator.call(context, memo, value, index, list);
          }
        });
        if (!initial) throw new TypeError(reduceError);
        return memo;
      };
  _.reduceRight = _.foldr = function (obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial
        ? obj.reduceRight(iterator, memo)
        : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function (value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };
  _.find = _.detect = function (obj, predicate, context) {
    var result;
    any(obj, function (value, index, list) {
      if (predicate.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };
  _.filter = _.select = function (obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter)
      return obj.filter(predicate, context);
    each(obj, function (value, index, list) {
      if (predicate.call(context, value, index, list)) results.push(value);
    });
    return results;
  };
  _.reject = function (obj, predicate, context) {
    return _.filter(
      obj,
      function (value, index, list) {
        return !predicate.call(context, value, index, list);
      },
      context
    );
  };
  _.every = _.all = function (obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery)
      return obj.every(predicate, context);
    each(obj, function (value, index, list) {
      if (!(result = result && predicate.call(context, value, index, list)))
        return breaker;
    });
    return !!result;
  };
  var any =
    (_.some =
    _.any =
      function (obj, predicate, context) {
        predicate || (predicate = _.identity);
        var result = false;
        if (obj == null) return result;
        if (nativeSome && obj.some === nativeSome)
          return obj.some(predicate, context);
        each(obj, function (value, index, list) {
          if (result || (result = predicate.call(context, value, index, list)))
            return breaker;
        });
        return !!result;
      });
  _.contains = _.include = function (obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf)
      return obj.indexOf(target) != -1;
    return any(obj, function (value) {
      return value === target;
    });
  };
  _.invoke = function (obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function (value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };
  _.pluck = function (obj, key) {
    return _.map(obj, _.property(key));
  };
  _.where = function (obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };
  _.findWhere = function (obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };
  _.max = function (obj, iterator, context) {
    if (
      !iterator &&
      _.isArray(obj) &&
      obj[0] === +obj[0] &&
      obj.length < 65535
    ) {
      return Math.max.apply(Math, obj);
    }
    var result = -Infinity,
      lastComputed = -Infinity;
    each(obj, function (value, index, list) {
      var computed = iterator
        ? iterator.call(context, value, index, list)
        : value;
      if (computed > lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };
  _.min = function (obj, iterator, context) {
    if (
      !iterator &&
      _.isArray(obj) &&
      obj[0] === +obj[0] &&
      obj.length < 65535
    ) {
      return Math.min.apply(Math, obj);
    }
    var result = Infinity,
      lastComputed = Infinity;
    each(obj, function (value, index, list) {
      var computed = iterator
        ? iterator.call(context, value, index, list)
        : value;
      if (computed < lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };
  _.shuffle = function (obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function (value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };
  _.sample = function (obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };
  var lookupIterator = function (value) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return value;
    return _.property(value);
  };
  _.sortBy = function (obj, iterator, context) {
    iterator = lookupIterator(iterator);
    return _.pluck(
      _.map(obj, function (value, index, list) {
        return {
          value: value,
          index: index,
          criteria: iterator.call(context, value, index, list),
        };
      }).sort(function (left, right) {
        var a = left.criteria;
        var b = right.criteria;
        if (a !== b) {
          if (a > b || a === void 0) return 1;
          if (a < b || b === void 0) return -1;
        }
        return left.index - right.index;
      }),
      "value"
    );
  };
  var group = function (behavior) {
    return function (obj, iterator, context) {
      var result = {};
      iterator = lookupIterator(iterator);
      each(obj, function (value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };
  _.groupBy = group(function (result, key, value) {
    _.has(result, key) ? result[key].push(value) : (result[key] = [value]);
  });
  _.indexBy = group(function (result, key, value) {
    result[key] = value;
  });
  _.countBy = group(function (result, key) {
    _.has(result, key) ? result[key]++ : (result[key] = 1);
  });
  _.sortedIndex = function (array, obj, iterator, context) {
    iterator = lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0,
      high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value
        ? (low = mid + 1)
        : (high = mid);
    }
    return low;
  };
  _.toArray = function (obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };
  _.size = function (obj) {
    if (obj == null) return 0;
    return obj.length === +obj.length ? obj.length : _.keys(obj).length;
  };
  _.first =
    _.head =
    _.take =
      function (array, n, guard) {
        if (array == null) return void 0;
        if (n == null || guard) return array[0];
        if (n < 0) return [];
        return slice.call(array, 0, n);
      };
  _.initial = function (array, n, guard) {
    return slice.call(array, 0, array.length - (n == null || guard ? 1 : n));
  };
  _.last = function (array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };
  _.rest =
    _.tail =
    _.drop =
      function (array, n, guard) {
        return slice.call(array, n == null || guard ? 1 : n);
      };
  _.compact = function (array) {
    return _.filter(array, _.identity);
  };
  var flatten = function (input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function (value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };
  _.flatten = function (array, shallow) {
    return flatten(array, shallow, []);
  };
  _.without = function (array) {
    return _.difference(array, slice.call(arguments, 1));
  };
  _.partition = function (array, predicate, context) {
    predicate = lookupIterator(predicate);
    var pass = [],
      fail = [];
    each(array, function (elem) {
      (predicate.call(context, elem) ? pass : fail).push(elem);
    });
    return [pass, fail];
  };
  _.uniq = _.unique = function (array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function (value, index) {
      if (
        isSorted
          ? !index || seen[seen.length - 1] !== value
          : !_.contains(seen, value)
      ) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };
  _.union = function () {
    return _.uniq(_.flatten(arguments, true));
  };
  _.intersection = function (array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function (item) {
      return _.every(rest, function (other) {
        return _.contains(other, item);
      });
    });
  };
  _.difference = function (array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function (value) {
      return !_.contains(rest, value);
    });
  };
  _.zip = function () {
    var length = _.max(_.pluck(arguments, "length").concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, "" + i);
    }
    return results;
  };
  _.object = function (list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };
  _.indexOf = function (array, item, isSorted) {
    if (array == null) return -1;
    var i = 0,
      length = array.length;
    if (isSorted) {
      if (typeof isSorted == "number") {
        i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf)
      return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };
  _.lastIndexOf = function (array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = hasIndex ? from : array.length;
    while (i--) if (array[i] === item) return i;
    return -1;
  };
  _.range = function (start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;
    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);
    while (idx < length) {
      range[idx++] = start;
      start += step;
    }
    return range;
  };
  var ctor = function () {};
  _.bind = function (func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind)
      return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError();
    args = slice.call(arguments, 2);
    return (bound = function () {
      if (!(this instanceof bound))
        return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor();
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    });
  };
  _.partial = function (func) {
    var boundArgs = slice.call(arguments, 1);
    return function () {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };
  _.bindAll = function (obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0)
      throw new Error("bindAll must be passed function names");
    each(funcs, function (f) {
      obj[f] = _.bind(obj[f], obj);
    });
    return obj;
  };
  _.memoize = function (func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function () {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key)
        ? memo[key]
        : (memo[key] = func.apply(this, arguments));
    };
  };
  _.delay = function (func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function () {
      return func.apply(null, args);
    }, wait);
  };
  _.defer = function (func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };
  _.throttle = function (func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function () {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function () {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };
  _.debounce = function (func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    var later = function () {
      var last = _.now() - timestamp;
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };
    return function () {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }
      return result;
    };
  };
  _.once = function (func) {
    var ran = false,
      memo;
    return function () {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };
  _.wrap = function (func, wrapper) {
    return _.partial(wrapper, func);
  };
  _.compose = function () {
    var funcs = arguments;
    return function () {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };
  _.after = function (times, func) {
    return function () {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };
  _.keys = function (obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };
  _.values = function (obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };
  _.pairs = function (obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };
  _.invert = function (obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };
  _.functions = _.methods = function (obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };
  _.extend = function (obj) {
    each(slice.call(arguments, 1), function (source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };
  _.pick = function (obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function (key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };
  _.omit = function (obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };
  _.defaults = function (obj) {
    each(slice.call(arguments, 1), function (source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };
  _.clone = function (obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };
  _.tap = function (obj, interceptor) {
    interceptor(obj);
    return obj;
  };
  var eq = function (a, b, aStack, bStack) {
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    if (a == null || b == null) return a === b;
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      case "[object String]":
        return a == String(b);
      case "[object Number]":
        return a != +a ? b != +b : a == 0 ? 1 / a == 1 / b : a == +b;
      case "[object Date]":
      case "[object Boolean]":
        return +a == +b;
      case "[object RegExp]":
        return (
          a.source == b.source &&
          a.global == b.global &&
          a.multiline == b.multiline &&
          a.ignoreCase == b.ignoreCase
        );
    }
    if (typeof a != "object" || typeof b != "object") return false;
    var length = aStack.length;
    while (length--) {
      if (aStack[length] == a) return bStack[length] == b;
    }
    var aCtor = a.constructor,
      bCtor = b.constructor;
    if (
      aCtor !== bCtor &&
      !(
        _.isFunction(aCtor) &&
        aCtor instanceof aCtor &&
        _.isFunction(bCtor) &&
        bCtor instanceof bCtor
      ) &&
      "constructor" in a &&
      "constructor" in b
    ) {
      return false;
    }
    aStack.push(a);
    bStack.push(b);
    var size = 0,
      result = true;
    if (className == "[object Array]") {
      size = a.length;
      result = size == b.length;
      if (result) {
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      for (var key in a) {
        if (_.has(a, key)) {
          size++;
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack)))
            break;
        }
      }
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !size--) break;
        }
        result = !size;
      }
    }
    aStack.pop();
    bStack.pop();
    return result;
  };
  _.isEqual = function (a, b) {
    return eq(a, b, [], []);
  };
  _.isEmpty = function (obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };
  _.isElement = function (obj) {
    return !!(obj && obj.nodeType === 1);
  };
  _.isArray =
    nativeIsArray ||
    function (obj) {
      return toString.call(obj) == "[object Array]";
    };
  _.isObject = function (obj) {
    return obj === Object(obj);
  };
  each(
    ["Arguments", "Function", "String", "Number", "Date", "RegExp"],
    function (name) {
      _["is" + name] = function (obj) {
        return toString.call(obj) == "[object " + name + "]";
      };
    }
  );
  if (!_.isArguments(arguments)) {
    _.isArguments = function (obj) {
      return !!(obj && _.has(obj, "callee"));
    };
  }
  if (typeof /./ !== "function") {
    _.isFunction = function (obj) {
      return typeof obj === "function";
    };
  }
  _.isFinite = function (obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };
  _.isNaN = function (obj) {
    return _.isNumber(obj) && obj != +obj;
  };
  _.isBoolean = function (obj) {
    return (
      obj === true || obj === false || toString.call(obj) == "[object Boolean]"
    );
  };
  _.isNull = function (obj) {
    return obj === null;
  };
  _.isUndefined = function (obj) {
    return obj === void 0;
  };
  _.has = function (obj, key) {
    return hasOwnProperty.call(obj, key);
  };
  _.noConflict = function () {
    root._ = previousUnderscore;
    return this;
  };
  _.identity = function (value) {
    return value;
  };
  _.constant = function (value) {
    return function () {
      return value;
    };
  };
  _.property = function (key) {
    return function (obj) {
      return obj[key];
    };
  };
  _.matches = function (attrs) {
    return function (obj) {
      if (obj === attrs) return true;
      for (var key in attrs) {
        if (attrs[key] !== obj[key]) return false;
      }
      return true;
    };
  };
  _.times = function (n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };
  _.random = function (min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };
  _.now =
    Date.now ||
    function () {
      return new Date().getTime();
    };
  var entityMap = {
    escape: {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
    },
  };
  entityMap.unescape = _.invert(entityMap.escape);
  var entityRegexes = {
    escape: new RegExp("[" + _.keys(entityMap.escape).join("") + "]", "g"),
    unescape: new RegExp("(" + _.keys(entityMap.unescape).join("|") + ")", "g"),
  };
  _.each(["escape", "unescape"], function (method) {
    _[method] = function (string) {
      if (string == null) return "";
      return ("" + string).replace(entityRegexes[method], function (match) {
        return entityMap[method][match];
      });
    };
  });
  _.result = function (object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };
  _.mixin = function (obj) {
    each(_.functions(obj), function (name) {
      var func = (_[name] = obj[name]);
      _.prototype[name] = function () {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };
  var idCounter = 0;
  _.uniqueId = function (prefix) {
    var id = ++idCounter + "";
    return prefix ? prefix + id : id;
  };
  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g,
  };
  var noMatch = /(.)^/;
  var escapes = {
    "'": "'",
    "\\": "\\",
    "\r": "r",
    "\n": "n",
    "\t": "t",
    "\u2028": "u2028",
    "\u2029": "u2029",
  };
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  _.template = function (text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);
    var matcher = new RegExp(
      [
        (settings.escape || noMatch).source,
        (settings.interpolate || noMatch).source,
        (settings.evaluate || noMatch).source,
      ].join("|") + "|$",
      "g"
    );
    var index = 0;
    var source = "__p+='";
    text.replace(
      matcher,
      function (match, escape, interpolate, evaluate, offset) {
        source += text.slice(index, offset).replace(escaper, function (match) {
          return "\\" + escapes[match];
        });
        if (escape) {
          source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
        }
        if (interpolate) {
          source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
        }
        if (evaluate) {
          source += "';\n" + evaluate + "\n__p+='";
        }
        index = offset + match.length;
        return match;
      }
    );
    source += "';\n";
    if (!settings.variable) source = "with(obj||{}){\n" + source + "}\n";
    source =
      "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source +
      "return __p;\n";
    try {
      render = new Function(settings.variable || "obj", "_", source);
    } catch (e) {
      e.source = source;
      throw e;
    }
    if (data) return render(data, _);
    var template = function (data) {
      return render.call(this, data, _);
    };
    template.source =
      "function(" + (settings.variable || "obj") + "){\n" + source + "}";
    return template;
  };
  _.chain = function (obj) {
    return _(obj).chain();
  };
  var result = function (obj) {
    return this._chain ? _(obj).chain() : obj;
  };
  _.mixin(_);
  each(
    ["pop", "push", "reverse", "shift", "sort", "splice", "unshift"],
    function (name) {
      var method = ArrayProto[name];
      _.prototype[name] = function () {
        var obj = this._wrapped;
        method.apply(obj, arguments);
        if ((name == "shift" || name == "splice") && obj.length === 0)
          delete obj[0];
        return result.call(this, obj);
      };
    }
  );
  each(["concat", "join", "slice"], function (name) {
    var method = ArrayProto[name];
    _.prototype[name] = function () {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });
  _.extend(_.prototype, {
    chain: function () {
      this._chain = true;
      return this;
    },
    value: function () {
      return this._wrapped;
    },
  });
  if (typeof define === "function" && define.amd) {
    define("underscore", [], function () {
      return _;
    });
  }
}).call(this);
var GA_LOCAL_STORAGE_KEY = "ga:clientId:bibbase";
if (location.hostname != "localhost") {
  (function (i, s, o, g, r, a, m) {
    i["GoogleAnalyticsObject"] = r;
    (i[r] =
      i[r] ||
      function () {
        (i[r].q = i[r].q || []).push(arguments);
      }),
      (i[r].l = 1 * new Date());
    (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
  })(
    window,
    document,
    "script",
    "//www.google-analytics.com/analytics.js",
    "ga"
  );
  if (window.localStorage) {
    ga("create", "UA-37729657-1", {
      storage: "none",
      clientId: localStorage.getItem(GA_LOCAL_STORAGE_KEY),
    });
    ga(function (tracker) {
      localStorage.setItem(GA_LOCAL_STORAGE_KEY, tracker.get("clientId"));
    });
  } else {
    ga("create", "UA-37729657-1", { storage: "none" });
  }
  ga("require", "displayfeatures");
  ga("require", "linkid", "linkid.js");
  ga("send", "pageview");
} else {
  ga = function (a, b, c, d, e, options) {
    console.log("fake-ga", a, b, c, d, e);
    options && options.hitCallback && setTimeout(options.hitCallback, 1);
  };
}
// const addScript = (url) => {
//   const script = document.createElement("script");
//   script.setAttribute("src", url);
//   document.head.appendChild(script);
// };
if (location.hostname != "localhost") {
  addScript("https://www.googletagmanager.com/gtag/js?id=G-3MRBHT665J");
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "G-3MRBHT665J");
} else {
  gtag = function (...args) {
    console.log("fake-gtag", ...args);
  };
}
