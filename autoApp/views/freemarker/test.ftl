<!DOCTYPE html>
<html>
  <head>
   <meta charset="utf-8" />
   <title>${title}</title>
   <link rel="stylesheet" href="/stylesheets/front.css" />
  </head>
  <body>
      <div class="area">
        <header class="header">汽车品牌列表</header>
        <ul class="brand-list">
          <#list brandArr as item>
             <li class="brand-item">
                <a href="brand/${item.sohuId}" target="_blank" title="${item.name}">
                   <img src="${item.logo}" width=100 height=100>
                   <h3>${item.name}</h3>
                </a>
             </li>
          </#list>
        </ul>
      </div>
      <footer>新军汽车公司版权所有</footer>
  </body>
</html>