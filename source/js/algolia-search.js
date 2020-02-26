/* global instantsearch, algoliasearch, CONFIG */

window.addEventListener('DOMContentLoaded', () => {
  var algoliaSettings = CONFIG.algolia;
  var isAlgoliaSettingsValid = algoliaSettings.appID
                            && algoliaSettings.apiKey
                            && algoliaSettings.indexName;
  window.console.log(algoliaSettings.appID);
  window.console.log(algoliaSettings.apiKey);
  window.console.log(algoliaSettings.indexName);
  if (!isAlgoliaSettingsValid) {
    window.console.error('Algolia Settings are invalid.');
    return;
  }

  var search = instantsearch({
    indexName     : algoliaSettings.indexName,
    searchClient  : algoliasearch(algoliaSettings.appID,algoliaSettings.apiKey),
    searchFunction: helper => {
      let searchInput = document.querySelector('.search-input');
      if (searchInput.value) {
        helper.search();
      }
    }
  });

  window.pjax && search.on('render', () => {
    window.pjax.refresh(document.getElementById('algolia-hits'));
  });

  // Registering Widgets
  search.addWidgets([
    instantsearch.widgets.configure({
      hitsPerPage: algoliaSettings.hits.per_page || 10
    }),

    instantsearch.widgets.searchBox({
      container           : '.search-input-container',
      placeholder         : algoliaSettings.labels.input_placeholder,
      // Hide default icons of algolia search
      showReset           : false,
      showSubmit          : false,
      showLoadingIndicator: false,
      cssClasses          : {
        input: 'search-input'
      }
    }),

    instantsearch.widgets.stats({
      container: '#algolia-stats',
      templates: {
        text: data => {
          let stats = algoliaSettings.labels.hits_stats
            .replace(/\$\{hits}/, data.nbHits)
            .replace(/\$\{time}/, data.processingTimeMS);
          return `${stats}
            <span class="algolia-powered">
              <img src="${CONFIG.root}images/algolia_logo.svg" alt="Algolia">
            </span>
            <hr>`;
        }
      }
    }),

    instantsearch.widgets.hits({
      container  : '#algolia-hits',
      hitsPerPage: algoliaSettings.hits.per_page || 10,
      templates  : {
        item: function(data) {
          var link = data.permalink ? data.permalink : CONFIG.root + data.path;
          return (
              '<a href="' + link + '" class="algolia-hit-item-link">'
                            + '<div class="algolia-hit-item-title">'
                            + data._highlightResult.title.value + '</div>'
                            + '<div class="algolia-hit-item-content">'
                            + data._snippetResult.contentStripTruncate.value + '</div>'
                            + '</a>');
          // return (
          //   '<a href="' + link + '" class="algolia-hit-item-link">'
          // + data._highlightResult.title.value
          // + '</a>'
          // );
        },
        empty: data => {
          return `<div id="algolia-hits-empty">
              ${algoliaSettings.labels.hits_empty.replace(/\$\{query}/, data.query)}
            </div>`;
        }
      },
      cssClasses: {
        item: 'algolia-hit-item'
      }
    }),

    instantsearch.widgets.pagination({
      container: '#algolia-pagination',
      scrollTo : false,
      showFirst: false,
      showLast : false,
      templates: {
        first   : '<i class="fa fa-angle-double-left"></i>',
        last    : '<i class="fa fa-angle-double-right"></i>',
        previous: '<i class="fa fa-angle-left"></i>',
        next    : '<i class="fa fa-angle-right"></i>'
      },
      cssClasses: {
        root        : 'pagination',
        item        : 'pagination-item',
        link        : 'page-number',
        selectedItem: 'current',
        disabledItem: 'disabled-item'
      }
    })
  ]);

  search.start();

  // Handle and trigger popup window
  document.querySelectorAll('.popup-trigger').forEach(element => {
    element.addEventListener('click', () => {
      document.body.style.overflow = 'hidden';
      document.querySelector('.search-pop-overlay').style.display = 'block';
      document.querySelector('.popup').style.display = 'block';
      document.querySelector('.search-input').focus();
    });
  });

  // Monitor main search box
  const onPopupClose = () => {
    document.body.style.overflow = '';
    document.querySelector('.search-pop-overlay').style.display = 'none';
    document.querySelector('.popup').style.display = 'none';
  };

  document.querySelector('.search-pop-overlay').addEventListener('click', onPopupClose);
  document.querySelector('.popup-btn-close').addEventListener('click', onPopupClose);
  window.addEventListener('pjax:success', onPopupClose);
  window.addEventListener('keyup', event => {
    if (event.key === 'Escape') {
      onPopupClose();
    }
  });
});
