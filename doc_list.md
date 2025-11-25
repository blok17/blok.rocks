---
title: /docs
layout: default
permalink: "/docs/"
---

<style>
input:focus::placeholder {color: transparent} 
</style>

<p style="display:inline;">The <div style="color:red;display:inline;">DOCS</div> are a list of notes, researches and relevant knowledge that I personally worked on that might help the community with engagements of various types.</p>
&nbsp;
<p>Please use this responsably, remember we are the good guys!</p>
&nbsp;
<!-- Html Elements for Search -->
<div id="search-container" style="text-align: center;" display="inline;">
<input type="text" id="search-input" placeholder="search..." style="text-align: center;" display="inline;">
<ul id="results-container"></ul>
</div>

<!-- Script pointing to search-script.js -->
<script src="/js/search-script.js" type="text/javascript"></script>

<!-- Configuration -->

<script>
SimpleJekyllSearch({
  searchInput: document.getElementById('search-input'),
  resultsContainer: document.getElementById('results-container'),
  json: '/search.json'
})
</script>

&nbsp;
