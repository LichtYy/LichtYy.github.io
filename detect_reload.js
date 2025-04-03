window.addEventListener(
  "error",
  function (e) {
    // console.log(e, '错误捕获===');
    if (e) {
      let target = e.target || e.srcElement;
      let isElementTarget = target instanceof HTMLElement;
      if (!isElementTarget) {
        // js错误
        // js error处理
      } else {
        // 页面静态资源加载错误处理
        // console.log('资源加载错误===');
        let { type, timeStamp, target } = e;
        let { localName, outerHTML, tagName, src } = target;
        let typeName = target.localName;
        let sourceUrl = "";
        if (typeName === "link") {
          sourceUrl = target.href;
        } else if (typeName === "script") {
          sourceUrl = target.src;
          if (
            sourceUrl ===
            "https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"
          ) {
            window.onload = function () {
              var bibbase_reload = document.createElement("script");
              bibbase_reload.src = "bibbase_reload.js";
              document.body.appendChild(bibbase_reload);
            };
          }
        }
      }
    }
  },
  true
);
