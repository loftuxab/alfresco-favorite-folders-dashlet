/**
 * Copyright (C) 2005-2014 Alfresco Software Limited.
 *
 * This file is part of Alfresco
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Dashboard MyFolders component.
 *
 * @namespace Alfresco
 * @class Alfresco.dashlet.MyFolders
 */
(function()
{
    /**
     * YUI Library aliases
     */
    var Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event,
        Selector = YAHOO.util.Selector,
        $html = Alfresco.util.encodeHTML,
        $links = Alfresco.util.activateLinks,
        $relTime = Alfresco.util.relativeTime,
        $siteDashboard = Alfresco.util.siteDashboardLink,
        $userProfile = Alfresco.util.userProfileLink,
        $combine = Alfresco.util.combinePaths;

    /**
     * Dashboard MyFolders constructor.
     *
     * @param {String} htmlId The HTML id of the parent element
     * @return {Alfresco.dashlet.MyFolders} The new component instance
     * @constructor
     */
    Alfresco.dashlet.MyFolders = function MyFolders_constructor(htmlId)
    {
        return Alfresco.dashlet.MyFolders.superclass.constructor.call(this, htmlId);
    };

    YAHOO.extend(Alfresco.dashlet.MyFolders, Alfresco.component.SimpleDocList,
        {
            PREFERENCES_MYFOLDERS_DASHLET_FILTER: "",
            PREFERENCES_MYFOLDERS_DASHLET_VIEW: "",
            /**
             * Fired by YUI when parent element is available for scripting
             * @method onReady
             */
            onReady: function MyFolders_onReady()
            {
                /**
                 * Preferences
                 */
                var PREFERENCES_MYFOLDERS_DASHLET = this.services.preferences.getDashletId(this, "myfolders");
                this.PREFERENCES_MYFOLDERS_DASHLET_FILTER = PREFERENCES_MYFOLDERS_DASHLET + ".filter";
                this.PREFERENCES_MYFOLDERS_DASHLET_VIEW = PREFERENCES_MYFOLDERS_DASHLET + ".simpleView";

                // Create Dropdown filter
                this.widgets.filter = Alfresco.util.createYUIButton(this, "filters", this.onFilterChange,
                    {
                        type: "menu",
                        menu: "filters-menu",
                        lazyloadmenu: false
                    });

                // Select the preferred filter in the ui
                var filter = this.options.filter;
                filter = Alfresco.util.arrayContains(this.options.validFilters, filter) ? filter : this.options.validFilters[0];
                this.widgets.filter.set("label", this.msg("filter." + filter) + " " + Alfresco.constants.MENU_ARROW_SYMBOL);
                this.widgets.filter.value = filter;

                // Detailed/Simple List button
                this.widgets.simpleDetailed = new YAHOO.widget.ButtonGroup(this.id + "-simpleDetailed");
                if (this.widgets.simpleDetailed !== null)
                {
                    this.widgets.simpleDetailed.check(this.options.simpleView ? 0 : 1);
                    this.widgets.simpleDetailed.on("checkedButtonChange", this.onSimpleDetailed, this.widgets.simpleDetailed, this);
                }

                // Display the toolbar now that we have selected the filter
                Dom.removeClass(Selector.query(".toolbar div", this.id, true), "hidden");

                // DataTable can now be rendered
                Alfresco.dashlet.MyFolders.superclass.onReady.apply(this, arguments);
            },

            /**
             * Generate base webscript url.
             * Can be overridden.
             *
             * @method getWebscriptUrl
             */
            getWebscriptUrl: function SimpleDocList_getWebscriptUrl()
            {
                return Alfresco.constants.PROXY_URI + "slingshot/doclib/doclist/folders/node/alfresco/company/home?max=50";
            },
            renderCellThumbnail: function SimpleDocList_renderCellThumbnail(elCell, oRecord, oColumn, oData) {
               var columnWidth = 40,
                  record = oRecord.getData(),
                  desc = "";

               if (record.isInfo) {
                  columnWidth = 52;
                  desc = '<img src="' + Alfresco.constants.URL_RESCONTEXT + 'components/images/help-docs-bw-32.png" />';
               }
               else {
                  var path;
                  if (record.location.site) {
                     path = record.webdavUrl.substring(record.webdavUrl.indexOf("documentLibrary") + 15);
                  }
                  else {
                     // if this is a folder in My Files, Shared Files, or the Repository (not in a site),
                     // strip the leading /webdav from the link, otherwise it will not work properly
                     if (record.webdavUrl.indexOf('/webdav/') >= 0) {
                        path = record.webdavUrl.substring(7);
                     }
                     else {
                        path = record.webdavUrl;
                     }
                  }

                  var name = record.fileName,
                     extn = name.substring(name.lastIndexOf(".")),
                     locn = record.location,
                     nodeRef = new Alfresco.util.NodeRef(record.nodeRef),
                     folderDetailsUrl = Alfresco.constants.URL_PAGECONTEXT + (locn.site ? "site/" + locn.site + '/' : "") + "documentlibrary#filter=path" + Alfresco.util.encodeURIPath('|' + path + '|');

                  if (this.options.simpleView) {
                     /**
                      * Simple View
                      */
                     var id = this.id + '-preview-' + oRecord.getId();
                     desc = '<span id="' + id + '" class="icon32"><a href="' + folderDetailsUrl + '"><img src="' + Alfresco.constants.URL_RESCONTEXT + 'components/images/filetypes/generic-folder-32.png' + '" alt="' + extn + '" title="' + $html(name) + '" /></a></span>';

                  }
                  else {
                     /**
                      * Detailed View
                      */
                     columnWidth = 100;
                     desc = '<span class="thumbnail"><a href="' + folderDetailsUrl + '"><img src="' + Alfresco.constants.URL_RESCONTEXT + 'components/images/filetypes/generic-folder-48.png' + '" alt="' + extn + '" title="' + $html(name) + '" /></a></span>';
                  }
               }

                oColumn.width = columnWidth;

                Dom.setStyle(elCell, "width", oColumn.width + "px");
                Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");

                elCell.innerHTML = desc;
            },


           renderCellDetail: function SimpleDocList_renderCellDetail(elCell, oRecord, oColumn, oData) {
              var record = oRecord.getData(),
                 desc = "";

              if (record.isInfo) {
                 desc += '<div class="empty"><h3>' + record.title + '</h3>';
                 desc += '<span>' + record.description + '</span></div>';
              }
              else {
                 var path;
                 if (record.location.site) {
                    path = record.webdavUrl.substring(record.webdavUrl.indexOf("documentLibrary") + 15);
                 }
                 else {
                     // if this is a folder in My Files, Shared Files, or the Repository (not in a site),
                     // strip the leading /webdav from the link, otherwise it will not work properly
                     if (record.webdavUrl.indexOf('/webdav/') >= 0) {
                        path = record.webdavUrl.substring(7);
                     }
                     else {
                        path = record.webdavUrl;
                     }
                 }

                 var id = this.id + '-metadata-' + oRecord.getId(),
                    version = "",
                    description = '<span class="faded">' + this.msg("details.description.none") + '</span>',
                    dateLine = "",
                    canComment = record.permissions.userAccess.create,
                    locn = record.location,
                    nodeRef = new Alfresco.util.NodeRef(record.nodeRef),
                    docDetailsUrl = Alfresco.constants.URL_PAGECONTEXT + (locn.site ? "site/" + locn.site + '/' : "") + "documentlibrary#filter=path" + Alfresco.util.encodeURIPath('|' + path + '|');

                 // Description non-blank?
                 if (record.description && record.description !== "") {
                    description = $links($html(record.description));
                 }

                 // Version display
                 if (record.version && record.version !== "") {
                    version = '<span class="document-version">' + $html(record.version) + '</span>';
                 }

                 // Date line
                 var dateI18N = "modified", dateProperty = record.modifiedOn;
                 if (record.custom && record.custom.isWorkingCopy) {
                    dateI18N = "editing-started";
                 }
                 else if (record.modifiedOn === record.createdOn) {
                    dateI18N = "created";
                    dateProperty = record.createdOn;
                 }
                 if (locn.site) {
                    dateLine = this.msg("details." + dateI18N + "-in-site", $relTime(dateProperty), $siteDashboard(locn.site, locn.siteTitle, 'class="site-link theme-color-1" id="' + id + '"'));
                 }
                 else {
                    dateLine = this.msg("details." + dateI18N + "-by", $relTime(dateProperty), $userProfile(record.modifiedByUser, record.modifiedBy, 'class="theme-color-1"'));
                 }

                 if (this.options.simpleView) {
                    /**
                     * Simple View
                     */
                    desc += '<h3 class="filename simple-view"><a class="theme-color-1" href="' + docDetailsUrl + '">' + $html(record.displayName) + '</a></h3>';
                    desc += '<div class="detail"><span class="item-simple">' + dateLine + '</span></div>';
                 }
                 else {
                    /**
                     * Detailed View
                     */
                    desc += '<h3 class="filename"><a class="theme-color-1" href="' + docDetailsUrl + '">' + $html(record.displayName) + '</a>' + version + '</h3>';

                    desc += '<div class="detail">';
                    desc += '<span class="item">' + dateLine + '</span>';
                    if (this.options.showFileSize) {
                       desc += '<span class="item">' + Alfresco.util.formatFileSize(record.size) + '</span>';
                    }
                    desc += '</div>';
                    desc += '<div class="detail"><span class="item">' + description + '</span></div>';

                    /* Favourite / Likes / Comments */
                    desc += '<div class="detail detail-social">';
                    desc += '<span class="item item-social">' + Alfresco.component.SimpleDocList.generateFavourite(this, oRecord) + '</span>';
                    desc += '<span class="item item-social item-separator">' + Alfresco.component.SimpleDocList.generateLikes(this, oRecord) + '</span>';
                    if (canComment) {
                       desc += '<span class="item item-social item-separator">' + Alfresco.component.SimpleDocList.generateComments(this, oRecord) + '</span>';
                    }
                    desc += '</div>';
                 }

              }
              elCell.innerHTML = desc;
           },

            /**
             * Calculate webscript parameters
             *
             * @method getParameters
             * @override
             */
            getParameters: function MyFolders_getParameters()
            {
                return "filter=" + this.widgets.filter.value;
            },

            /**
             * Filter Change menu handler
             *
             * @method onFilterChange
             * @param p_sType {string} The event
             * @param p_aArgs {array}
             */
            onFilterChange: function MyFolders_onFilterChange(p_sType, p_aArgs)
            {
                var menuItem = p_aArgs[1];
                if (menuItem)
                {
                    this.widgets.filter.set("label", menuItem.cfg.getProperty("text") + " " + Alfresco.constants.MENU_ARROW_SYMBOL);
                    this.widgets.filter.value = menuItem.value;

                    this.services.preferences.set(this.PREFERENCES_MYFOLDERS_DASHLET_FILTER, this.widgets.filter.value);

                    this.reloadDataTable();
                }
            },

            /**
             * Show/Hide detailed list buttongroup click handler
             *
             * @method onSimpleDetailed
             * @param e {object} DomEvent
             * @param p_obj {object} Object passed back from addListener method
             */
            onSimpleDetailed: function MyFolders_onSimpleDetailed(e, p_obj)
            {
                this.options.simpleView = e.newValue.index === 0;
                this.services.preferences.set(this.PREFERENCES_MYFOLDERS_DASHLET_VIEW, this.options.simpleView);
                if (e)
                {
                    Event.preventDefault(e);
                }

                this.reloadDataTable();
            }
        });
})();
