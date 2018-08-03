/** 
 * Flexmonster Pivot Table Component v2.6.0 [https://flexmonster.com/]
 * Copyright (c) 2018 Flexmonster. All rights reserved.
 *
 * Flexmonster Pivot Table Component commercial licenses may be obtained at
 * http://www.flexmonster.com/pricing-and-download/
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
var FlexmonsterToolbar = function (pivotContainer, pivot, _, width, labels, dataSourceType) {
    this.pivot = pivot;
    this.pivotContainer = pivotContainer;
    this.width = (typeof width == "number" || (width.indexOf("px") < 0 && width.indexOf("%") < 0)) ? width + "px" : width;
    this.Labels = labels;
    this.dataSourceType = dataSourceType || 5;
}
FlexmonsterToolbar.prototype.getTabs = function () {
    var tabs = [];
    var Labels = this.Labels;
    // Connect tab
    tabs.push({
        title: Labels.connect, id: "fm-tab-connect", icon: this.icons.connect,
        menu: [
            { title: Labels.connect_local_csv, id: "fm-tab-connect-local-csv", handler: this.connectLocalCSVHandler, mobile: false, icon: this.icons.connect_csv },
            { title: Labels.connect_local_json, id: "fm-tab-connect-local-json", handler: this.connectLocalJSONHandler, mobile: false, icon: this.icons.connect_json },
            { title: this.osUtils.isMobile ? Labels.connect_remote_csv_mobile : Labels.connect_remote_csv, id: "fm-tab-connect-remote-csv", handler: this.connectRemoteCSV, icon: this.icons.connect_csv },
            { title: this.osUtils.isMobile ? Labels.connect_remote_json_mobile : Labels.connect_remote_json, id: "fm-tab-connect-remote-json", handler: this.connectRemoteJSON, icon: this.icons.connect_json },
            { title: this.osUtils.isMobile ? Labels.connect_olap_mobile : Labels.connect_olap, id: "fm-tab-connect-olap", handler: this.connectOLAP, flat: false, icon: this.icons.connect_olap }
        ]
    });

    // Open tab
    tabs.push({
        title: Labels.open, id: "fm-tab-open", icon: this.icons.open,
        menu: [
            { title: Labels.local_report, id: "fm-tab-open-local-report", handler: this.openLocalReport, mobile: false, icon: this.icons.open_local },
            { title: this.osUtils.isMobile ? Labels.remote_report_mobile : Labels.remote_report, id: "fm-tab-open-remote-report", handler: this.openRemoteReport, icon: this.icons.open_remote }
        ]
    });

    // Save tab
    tabs.push({ title: Labels.save, id: "fm-tab-save", handler: this.saveHandler, mobile: false, icon: this.icons.save });

    // Export tab
    tabs.push({
        title: Labels.export, id: "fm-tab-export", mobile: false, icon: this.icons.export,
        menu: [
            { title: Labels.export_print, id: "fm-tab-export-print", handler: this.printHandler, icon: this.icons.export_print },
            { title: Labels.export_html, id: "fm-tab-export-html", handler: this.exportHandler, args: "html", icon: this.icons.export_html },
            { title: Labels.export_csv, id: "fm-tab-export-csv", handler: this.exportHandler, args: "csv", icon: this.icons.connect_csv },
            { title: Labels.export_excel, id: "fm-tab-export-excel", handler: this.exportHandler, args: "excel", icon: this.icons.export_excel },
            { title: Labels.export_image, id: "fm-tab-export-image", handler: this.exportHandler, args: "image", icon: this.icons.export_image },
            { title: Labels.export_pdf, id: "fm-tab-export-pdf", handler: this.exportHandler, args: "pdf", icon: this.icons.export_pdf },
        ]
    });
    tabs.push({ divider: true });

    // Grid tab
    tabs.push({ title: Labels.grid, id: "fm-tab-grid", handler: this.gridHandler, icon: this.icons.grid });

    // Charts tab
    tabs.push({
        title: Labels.charts, id: "fm-tab-charts", onShowHandler: this.checkChartMultipleMeasures, icon: this.icons.charts,
        menu: [
            { title: Labels.charts_bar, id: "fm-tab-charts-bar", handler: this.chartsHandler, args: "column", icon: this.icons.charts },
            { title: Labels.charts_bar_horizontal, id: "fm-tab-charts-bar-horizontal", handler: this.chartsHandler, args: "bar_h", icon: this.icons.charts_bar },
            { title: Labels.charts_line, id: "fm-tab-charts-line", handler: this.chartsHandler, args: "line", icon: this.icons.charts_line },
            { title: Labels.charts_scatter, id: "fm-tab-charts-scatter", handler: this.chartsHandler, args: "scatter", icon: this.icons.charts_scatter },
            { title: Labels.charts_pie, id: "fm-tab-charts-pie", handler: this.chartsHandler, args: "pie", icon: this.icons.charts_pie },
            { title: Labels.charts_bar_stack, id: "fm-tab-charts-bar-stack", handler: this.chartsHandler, args: "bar_stack", flat: false, icon: this.icons.charts_bar_stack },
            { title: Labels.charts_bar_line, id: "fm-tab-charts-bar-line", handler: this.chartsHandler, args: "bar_line", icon: this.icons.charts_bar_line },
            { divider: true, flat: false, mobile: false },
            { title: Labels.charts_multiple, id: "fm-tab-charts-multiple", handler: this.chartsMultipleHandler, flat: false, mobile: false }
        ]
    });
    tabs.push({ divider: true });

    // Format tab
    tabs.push({
        title: Labels.format, id: "fm-tab-format", icon: this.icons.format, rightGroup: true,
        menu: [
            { title: this.osUtils.isMobile ? Labels.format_cells_mobile : Labels.format_cells, id: "fm-tab-format-cells", handler: this.formatCellsHandler, icon: this.icons.format_number },
            { title: this.osUtils.isMobile ? Labels.conditional_formatting_mobile : Labels.conditional_formatting, id: "fm-tab-format-conditional", handler: this.conditionalFormattingHandler, icon: this.icons.format_conditional }
        ]
    });

    // Options tab
    tabs.push({ title: Labels.options, id: "fm-tab-options", handler: this.optionsHandler, icon: this.icons.options, rightGroup: true });

    // Fields tab
    tabs.push({ title: Labels.fields, id: "fm-tab-fields", handler: this.fieldsHandler, icon: this.icons.fields, rightGroup: true });

    // Fullscreen tab
    if (document["addEventListener"] != undefined) { // For IE8
        tabs.push({ divider: true, rightGroup: true });
        tabs.push({ title: Labels.fullscreen, id: "fm-tab-fullscreen", handler: this.fullscreenHandler, mobile: false, icon: this.icons.fullscreen, rightGroup: true });
    }

    return tabs;
}
FlexmonsterToolbar.prototype.create = function () {
    this.popupManager = new FlexmonsterToolbar.PopupManager(this);
    this.dataProvider = this.getTabs();
    if (this.dataSourceType != 5) {
        this.filterConnectMenu();
    }
    this.init();
}

FlexmonsterToolbar.prototype.dispose = function () {
    this.popupManager = null;
    this.pivot = null;
    this.pivotContainer = null;
    this.Labels = null;
    this.dataProvider = null;
}

FlexmonsterToolbar.prototype.applyToolbarLayoutClasses = function() {
    if (!this.osUtils.isMobile) {
        var _this = this;
        var addLayoutClasses = function() {
            if (!_this.toolbarWrapper) return;
            var toolbarWidth = _this.toolbarWrapper.getBoundingClientRect().width;
            if (toolbarWidth == 0) {
                return;
            }
            _this.toolbarWrapper.classList.remove("fm-layout-700");
            _this.toolbarWrapper.classList.remove("fm-layout-600");
            _this.toolbarWrapper.classList.remove("fm-layout-500");
            if (toolbarWidth < 700) {
                _this.toolbarWrapper.classList.add("fm-layout-700");
            }
            if (toolbarWidth < 600) {
                _this.toolbarWrapper.classList.add("fm-layout-600");
            }
            if (toolbarWidth < 500) {
                _this.toolbarWrapper.classList.add("fm-layout-500");
            }
        };
        addLayoutClasses();
        window.addEventListener("resize", addLayoutClasses);
    }
}

FlexmonsterToolbar.prototype.init = function () {
    this.container = this.pivotContainer;
    this.container.style.position = (this.container.style.position == "") ? "relative" : this.container.style.position;
    this.toolbarWrapper = document.createElement("div");
    this.toolbarWrapper.id = "fm-toolbar-wrapper";
    this.listWrapper = document.createElement("div");
    this.listWrapper.id = "fm-list-wrapper";
    this.listWrapper.style.width = "100%";
    this.toolbarWrapper.appendChild(this.listWrapper);
    var toolbar = document.createElement("ul");
    
    this.addClass(this.toolbarWrapper, "fm-toolbar-ui");
    if (this.width.indexOf("px") > -1) {
        this.toolbarWrapper.style.width = this.width;
        this.listWrapper.style.width = this.width;
    }
    toolbar.id = "fm-toolbar";
    if (!this.osUtils.isMobile) {
        var rightGroup = document.createElement("div");
        rightGroup.classList.add("fm-toolbar-group-right");
        toolbar.appendChild(rightGroup);
    }

    for (var i = 0; i < this.dataProvider.length; i++) {
        if (this.isDisabled(this.dataProvider[i])) continue;
        if (this.osUtils.isMobile && this.dataProvider[i].menu != null && this.dataProvider[i].collapse != true) {
            for (var j = 0; j < this.dataProvider[i].menu.length; j++) {
                if (this.isDisabled(this.dataProvider[i].menu[j])) continue;
                toolbar.appendChild(this.createTab(this.dataProvider[i].menu[j]));
            }
        } else {
            var tab = (this.dataProvider[i].divider) ? this.createDivider(this.dataProvider[i]) : this.createTab(this.dataProvider[i]);
            if (rightGroup && this.dataProvider[i].rightGroup) {
                rightGroup.appendChild(tab);
            } else {
                toolbar.appendChild(tab);
            }
        }
    }
    this.listWrapper.appendChild(toolbar);

    this.container.insertBefore(this.toolbarWrapper, this.container.firstChild);
    this.updateLabels(this.Labels);

    this.applyToolbarLayoutClasses();

    if (this.osUtils.isMobile) {
        this.addClass(this.listWrapper, "fm-mobile");
        if (toolbar.scrollWidth - toolbar.clientWidth > 0) {
            this.leftScrollButton = document.createElement("div");
            this.leftScrollButton.id = "fm-left-scroll-button";
            this.rightScrollButton = document.createElement("div");
            this.rightScrollButton.id = "fm-right-scroll-button";
            this.addClass(this.rightScrollButton, "fm-scroll-arrow");
            this.addClass(this.listWrapper, "fm-one-arrow-scroll");
            var _this = this;

            var changeListWrapperWidth = function (option) {
                if (option == "inc") {
                    _this.listWrapper.classList.remove("fm-two-arrow-scroll");
                    _this.listWrapper.classList.add("fm-one-arrow-scroll");                    
                } else if (option = "dec") {
                    _this.listWrapper.classList.remove("fm-one-arrow-scroll");
                    _this.listWrapper.classList.add("fm-two-arrow-scroll");
                }
            }

            var switchScrollArrows = function () {
                var maxWidth = toolbar.scrollWidth - toolbar.clientWidth;
                if (toolbar.scrollLeft > 0 && !_this.leftScrollButton.classList.contains("fm-scroll-arrow")) {
                    changeListWrapperWidth("dec");
                    _this.addClass(_this.leftScrollButton, "fm-scroll-arrow");
                } else if (toolbar.scrollLeft == 0 && _this.leftScrollButton.classList.contains("fm-scroll-arrow")) {
                    changeListWrapperWidth("inc");
                    _this.leftScrollButton.classList.remove("fm-scroll-arrow");
                }
                if (toolbar.scrollLeft == maxWidth && _this.rightScrollButton.classList.contains("fm-scroll-arrow")) {
                    changeListWrapperWidth("inc");
                    _this.rightScrollButton.classList.remove("fm-scroll-arrow");
                } else if (toolbar.scrollLeft < maxWidth && !_this.rightScrollButton.classList.contains("fm-scroll-arrow")) {
                    changeListWrapperWidth("dec");
                    _this.addClass(_this.rightScrollButton, "fm-scroll-arrow");
                }
            }

            var scrollList = function (direction) {
                var luft = 40;
                if (direction == "left") {
                    toolbar.scrollLeft -= luft;
                } else if (direction == "right") {
                    toolbar.scrollLeft += luft;
                }
                switchScrollArrows();
            }

            var scrollLeft = function () {
                scrollList("left");
            }
            var scrollRight = function () {
                scrollList("right");
            }

            toolbar.onscroll = function () {
                switchScrollArrows();
            }

            this.leftScrollButton.onclick = scrollLeft;
            this.rightScrollButton.onclick = scrollRight;

            this.toolbarWrapper.insertBefore(this.leftScrollButton, this.toolbarWrapper.firstChild);
            this.toolbarWrapper.appendChild(this.rightScrollButton);
        }
    }
}

// LABELS
FlexmonsterToolbar.prototype.updateLabels = function (labels) {
    var Labels = this.Labels = labels;

    this.setText(this.pivotContainer.querySelector("#fm-tab-connect > a > span"), Labels.connect);
    this.setText(this.pivotContainer.querySelector("#fm-tab-connect-local-csv > a > span"), Labels.connect_local_csv);
    this.setText(this.pivotContainer.querySelector("#fm-tab-connect-local-json > a > span"), Labels.connect_local_json);
    this.setText(this.pivotContainer.querySelector("#fm-tab-connect-remote-csv > a > span"), this.osUtils.isMobile ? Labels.connect_remote_csv_mobile : Labels.connect_remote_csv);
    this.setText(this.pivotContainer.querySelector("#fm-tab-connect-remote-json > a > span"), this.osUtils.isMobile ? Labels.connect_remote_json_mobile : Labels.connect_remote_json);
    this.setText(this.pivotContainer.querySelector("#fm-tab-connect-olap > a > span"), this.osUtils.isMobile ? Labels.connect_olap_mobile : Labels.connect_olap);

    this.setText(this.pivotContainer.querySelector("#fm-tab-open > a > span"), Labels.open);
    this.setText(this.pivotContainer.querySelector("#fm-tab-open-local-report > a > span"), Labels.local_report);
    this.setText(this.pivotContainer.querySelector("#fm-tab-open-remote-report > a > span"), this.osUtils.isMobile ? Labels.remote_report_mobile : Labels.remote_report);

    this.setText(this.pivotContainer.querySelector("#fm-tab-save > a > span"), Labels.save);

    this.setText(this.pivotContainer.querySelector("#fm-tab-grid > a > span"), Labels.grid);

    this.setText(this.pivotContainer.querySelector("#fm-tab-charts > a > span"), Labels.charts);
    this.setText(this.pivotContainer.querySelector("#fm-tab-charts-bar > a > span"), Labels.charts_bar);
    this.setText(this.pivotContainer.querySelector("#fm-tab-charts-bar-horizontal > a > span"), Labels.charts_bar_horizontal);
    this.setText(this.pivotContainer.querySelector("#fm-tab-charts-line > a > span"), Labels.charts_line);
    this.setText(this.pivotContainer.querySelector("#fm-tab-charts-scatter > a > span"), Labels.charts_scatter);
    this.setText(this.pivotContainer.querySelector("#fm-tab-charts-pie > a > span"), Labels.charts_pie);
    this.setText(this.pivotContainer.querySelector("#fm-tab-charts-bar-stack > a > span"), Labels.charts_bar_stack);
    this.setText(this.pivotContainer.querySelector("#fm-tab-charts-bar-line > a > span"), Labels.charts_bar_line);
    this.setText(this.pivotContainer.querySelector("#fm-tab-charts-multiple > a > span"), Labels.charts_multiple);

    this.setText(this.pivotContainer.querySelector("#fm-tab-format > a > span"), Labels.format);
    this.setText(this.pivotContainer.querySelector("#fm-tab-format-cells > a > span"), this.osUtils.isMobile ? Labels.format_cells_mobile : Labels.format_cells);
    this.setText(this.pivotContainer.querySelector("#fm-tab-format-conditional > a > span"), this.osUtils.isMobile ? Labels.conditional_formatting_mobile : Labels.conditional_formatting);

    this.setText(this.pivotContainer.querySelector("#fm-tab-options > a > span"), Labels.options);
    this.setText(this.pivotContainer.querySelector("#fm-tab-fullscreen > a > span"), Labels.fullscreen);

    this.setText(this.pivotContainer.querySelector("#fm-tab-export > a > span"), Labels.export);
    this.setText(this.pivotContainer.querySelector("#fm-tab-export-print > a > span"), Labels.export_print);
    this.setText(this.pivotContainer.querySelector("#fm-tab-export-html > a > span"), Labels.export_html);
    this.setText(this.pivotContainer.querySelector("#fm-tab-export-csv > a > span"), Labels.export_csv);
    this.setText(this.pivotContainer.querySelector("#fm-tab-export-excel > a > span"), Labels.export_excel);
    this.setText(this.pivotContainer.querySelector("#fm-tab-export-image > a > span"), Labels.export_image);
    this.setText(this.pivotContainer.querySelector("#fm-tab-export-pdf > a > span"), Labels.export_pdf);

    this.setText(this.pivotContainer.querySelector("#fm-tab-fields > a > span"), Labels.fields);
}
// ICONS
FlexmonsterToolbar.prototype.icons = {
    connect: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><style>.a{fill:none;}</style><path d="M9.9 18.4c2.1 0.9 5 1.4 8.1 1.4 3.1 0 6-0.5 8.1-1.4C27.9 17.7 29 16.7 29 15.8v-3.9c-1 0.5-1.3 0.9-2.1 1.2 -2.4 1.1-5.5 1.7-8.9 1.7 -3.3 0-6.5-0.6-8.9-1.7C8.3 12.8 8 12.3 7 11.9v3.9c0 0 0 0 0 0C7 16.7 8.1 17.7 9.9 18.4z" class="a"/><path d="M9.9 24.5c2.1 0.9 5 1.4 8.1 1.4 3.1 0 6-0.5 8.1-1.4C27.9 23.7 29 21.8 29 20.9v-2.7c-1 0.4-1.3 0.8-2.1 1.2 -2.4 1-5.5 1.6-8.9 1.6 -3.3 0-6.5-0.6-8.9-1.6C8.3 19 8 18.6 7 18.1v3.7c0 0 0 0 0 0C7 22.8 8.1 23.7 9.9 24.5z" class="a"/><path d="M29 24.2c-0.6 0.4-1.3 0.8-2.1 1.2 -2.4 1-5.5 1.6-8.9 1.6 -3.3 0-6.5-0.6-8.9-1.6C8.3 25 8 24.6 7 24.2v3.7c0 0.9 1.1 1.9 2.9 2.6 2.1 0.9 5 1.4 8.1 1.4 3.1 0 6-0.5 8.1-1.4C27.9 29.8 29 28.8 29 27.9h0V24.2z" class="a"/><path d="M26.9 4.7C24.5 3.6 21.3 3 18 3c-3.3 0-6.5 0.6-8.9 1.7C6.5 5.9 6 7.5 6 9.4c0 0 0 0 0 0C6 9.5 6 9.5 6 9.5v18.5c0 1.8 0.5 2.4 3.1 3.5C11.5 32.4 14.7 33 18 33c3.3 0 6.5-0.6 8.9-1.6C29.5 30.3 30 29.7 30 27.9V9.4c0 0 0 0 0 0C30 7.5 29.5 5.9 26.9 4.7zM7 15.8v-3.9c1 0.5 1.3 0.9 2.1 1.3 2.4 1.1 5.5 1.7 8.9 1.7 3.3 0 6.5-0.6 8.9-1.7C27.7 12.8 28 12.3 29 11.9v3.9c0 0.9-1.1 1.9-2.9 2.6 -2.1 0.9-5 1.4-8.1 1.4 -3.1 0-5.9-0.5-8.1-1.4C8.1 17.7 7 16.7 7 15.8 7 15.8 7 15.8 7 15.8zM7 18.1c1 0.4 1.3 0.8 2.1 1.2 2.4 1 5.5 1.6 8.9 1.6 3.3 0 6.5-0.6 8.9-1.6C27.7 19 28 18.6 29 18.1v2.7c0 0.9-1.1 2.9-2.9 3.6 -2.1 0.9-5 1.4-8.1 1.4 -3.1 0-6-0.5-8.1-1.4 -1.8-0.8-2.9-1.8-2.9-2.6 0 0 0 0 0 0V18.1zM26.1 30.6c-2.1 0.9-5 1.4-8.1 1.4 -3.1 0-5.9-0.5-8.1-1.4C8.1 29.8 7 28.8 7 27.9v-3.7c1 0.4 1.3 0.8 2.1 1.2 2.4 1 5.5 1.6 8.9 1.6 3.3 0 6.5-0.6 8.9-1.6 0.8-0.3 1.5-0.7 2.1-1.2v3.7h0C29 28.8 27.9 29.8 26.1 30.6z"/></svg>',
    connect_olap: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path d="M30 10.9c0 0-0.1-0.3-0.2-0.3 0 0 0 0-0.1 0 0 0 0 0 0 0L17.8 4.1c-0.2-0.1-0.3-0.1-0.5 0L5.3 10.5c0 0 0 0 0 0C5.1 10.6 5 10.8 5 11V27l12 5c0 0 0.4-0.1 0.4-0.1 0.1 0.1 0.3 0.1 0.5 0C17.8 31.9 18 32 18 32l12-5 0-16L30 10.9zM22.4 7.7l-4.8 2.4 -4.8-2.4 4.8-2.4L22.4 7.7zM11 21l-5-2V12l5 3V21zM6.3 10.9l4.8-2.4L16 11l-5 2L6.3 10.9zM17 31l-5-2v-6l5 2V31zM17 24l-5-2v-6l5 2V24zM17.6 16.5L12 14l6-2 5 2L17.6 16.5zM23 29l-5 2v-6l5-2V29zM23 22l-5 2v-6l5-2V22zM29 26l-5 2v-6l5-2V26zM29 19l-5 2v-6l5-2V19z"/></svg>',
    connect_csv: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path d="M11 24l6 0V27h-6V24z"/><path d="M12.8 22L12.8 22l1.2-2.5L15.1 22h1.9l-2-3.9L16.9 14h-1.8l-1 2.5L12.9 14h-1.8l1.9 3.9L11 22H12.8z"/><path d="M19 19h6v3h-6V19z"/><path d="M19 14h6v3L19 17V14z"/><path d="M19 24h6v3h-6V24z"/><path d="M23 4H7v28h22V11L23 4zM8 31V5h14v7h6v19H8L8 31z"/></svg>',
    connect_json: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path d="M23 4H7v28h22V11L23 4zM8 31V5h14v7h6v19H8L8 31z"/><path d="M19 24c0 0.6-0.4 1-1 1 -0.6 0-1-0.4-1-1v-2c0-0.6 0.4-1 1-1 0.6 0 1 0.4 1 1V24zM21 18v-2c0-0.6-0.4 0-1 0 -0.6 0-1-0.4-1-1 0-0.6 0.4-1 1-1 1.7 0 3 0.3 3 2v2c0 1.1 0.9 2 2 2 0.6 0 1 0.4 1 1 0 0.6-0.4 1-1 1 -1.1 0-2 0.9-2 2v2c0 1.7-1.3 2-3 2 -0.6 0-1-0.4-1-1s0.4-1 1-1c0.6 0 1 0.6 1 0v-2c0-1.2 0.5-2.3 1.4-3C21.5 20.3 21 19.2 21 18zM11 20c1.1 0 2-0.9 2-2v-2c0-1.7 1.3-2 3-2 0.6 0 1 0.4 1 1 0 0.6-0.4 1-1 1 -0.6 0-1-0.6-1 0v2c0 1.2-0.5 2.3-1.4 3 0.8 0.7 1.4 1.8 1.4 3v2c0 0.6 0.4 0 1 0 0.6 0 1 0.4 1 1s-0.4 1-1 1c-1.7 0-3-0.3-3-2v-2c0-1.1-0.9-2-2-2 -0.6 0-1-0.4-1-1C10 20.4 10.4 20 11 20z"/><path d="M18 17c0.6 0 1 0.4 1 1s-0.4 1-1 1 -1-0.4-1-1S17.4 17 18 17z"/></svg>',
    open: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path d="M34.4 16.5C34.3 16.4 34.7 16 34.5 16H31V8C32 7.4 31.1 6 29.5 6h-15l-2-2c-0.1-0.2-0.7 0-1 0h-6C4.9 4 4 5.3 4 6V16H1.5c-0.2 0 0.2 0.4 0.1 0.5 -0.1 0.1-0.2 0.3-0.1 0.5l3.2 14.5C4.8 31.8 5.2 32 5.5 32h25c0.3 0 1 0.3 1 0l3-15C34.5 16.8 34.5 16.7 34.4 16.5zM5 5h6.5l1.9 1.7C13.5 7 14.2 7 14.5 7H30v9h-4v-5H9v5H5V5zM25 16H10v-4h15V16z"/></svg>',
    open_local: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><style>.a{fill:none;}</style><path d="M30.9 10.6C30.8 10.4 30.2 10 30 10h-1V8c0-0.4-0.6-1-1-1H15l-1-2H8C7.6 5 7 5.6 7 6v4H6c-0.2 0-0.8 0.4-0.9 0.6 -0.1 0.1-0.2 0.3-0.1 0.5l2.1 19.5C7.2 30.8 7.7 31 8 31h20c0.3 0 0.8-0.2 0.9-0.5l2.1-19.5C31 10.9 31 10.7 30.9 10.6zM28 30H8L6 11h24L28 30z"/><line x1="11" y1="23" x2="11" y2="23" class="a"/><line x1="25" y1="23" x2="25" y2="23" class="a"/><polygon points="11 15 11 23 17 23 17 25 14 25 14 26 22 26 22 25 19 25 19 23 25 23 25 15 "/></svg>',
    open_remote: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path d="M30.9 10.6C30.8 10.4 30.2 10 30 10h-1V8c0-0.4-0.6-1-1-1H15l-1-2H8C7.6 5 7 5.6 7 6v4H6c-0.2 0-0.8 0.4-0.9 0.6 -0.1 0.1-0.2 0.3-0.1 0.5l2.1 19.5C7.2 30.8 7.7 31 8 31h20c0.3 0 0.8-0.2 0.9-0.5l2.1-19.5C31 10.9 31 10.7 30.9 10.6zM28 30H8L6 11h24L28 30z"/><path d="M24.8 18.1l-0.8 1.5c-0.2 0.2-0.5 0.2-0.8 0 -1.3-1.2-3.2-1.9-5.3-1.9 -2.1 0-4 0.7-5.3 1.9 -0.2 0.2-0.5 0.2-0.8 0l-0.8-1.5c-0.1-0.1-0.2-0.2-0.2-0.3 0-0.1 0.1-0.2 0.2-0.3 1.7-1.5 4.1-2.5 6.8-2.5 2.7 0 5.1 0.9 6.8 2.5 0.1 0 0.2 0.2 0.2 0.3C25 17.9 24.9 18 24.8 18.1zM18 19.6c1.5 0 2.8 0.5 3.8 1.4 0.2 0.2 0.2 0.5 0 0.7l-0.8 1.5c-0.2 0.2-0.5 0.2-0.8 0 -0.6-0.5-1.4-0.8-2.3-0.8 -0.9 0-1.7 0.3-2.3 0.8 -0.2 0.2-0.5 0.2-0.8 0l-0.8-1.5c-0.2-0.2-0.2-0.5 0-0.7C15.2 20.1 16.5 19.6 18 19.6zM18 23.4c0.8 0 1.4 0.6 1.4 1.3 0 0.7-0.6 1.3-1.4 1.3 -0.8 0-1.4-0.6-1.4-1.3C16.6 24 17.2 23.4 18 23.4z"/></svg>',
    grid: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><style>.a{fill:none;}</style><polygon points="30 15 23 15 23 22 30 22 30 15 " class="a"/><polygon points="14 22 14 15 7 15 7 22 14 22 " class="a"/><polygon points="14 23 7 23 7 30 14 30 14 23 " class="a"/><polygon points="22 15 15 15 15 22 22 22 22 15 " class="a"/><polygon points="30 23 23 23 23 30 30 30 30 23 " class="a"/><polygon points="22 23 15 23 15 30 22 30 22 23 " class="a"/><path d="M30.5 6l-0.2 0L30 6H7L6.7 6 6.5 6 6 6.5v24L6.5 31l0.2 0L7 31h23.1l0.3 0L30.5 31l0.5-0.5v-24L30.5 6 30.5 6zM14 15v7H7v-7H14L14 15zM15 15h7v7h-7V15L15 15zM23 15h7v7h-7V15L23 15zM7 23h7v7H7V23L7 23zM15 23h7v7h-7V23L15 23zM23 23h7v7h-7V23L23 23z"/></svg>',
    save: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path d="M30 10.9l-6-5.2 0 0 0 0 0 0L24 5.5l-0.1 0 0 0.2L23.8 6H6.1L5 6.1v23.7V31h24.5l0.1-0.3L30 29.5v-18L30 10.9 30 10.9zM22 26h-9v-2h9V26L22 26zM29 30h-3V19h-0.5 -15H9v11H6V7h6v5.5l1.5 1.5h9l0.5-1.5v-6l6 5V30L29 30z"/></svg>',
    export: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><polygon points="14 27 22 27 22 15 27 15 18 5 9 15 14 15 "/><path d="M32.5 21h-5c-0.3 0-0.5 0.2-0.5 0.5s0.2 0.5 0.5 0.5H32v10H4V22h4.5C8.8 22 9 21.8 9 21.5S8.8 21 8.5 21h-5C3.2 21 3 21.2 3 21.5v11C3 32.8 3.2 33 3.5 33h29c0.3 0 0.5-0.2 0.5-0.5v-11C33 21.2 32.8 21 32.5 21z"/></svg>',
    export_print: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path d="M23 23H13v1h10V23L23 23z"/><path d="M13 25v1h10v-1H13z"/><path d="M26 12V5H10v7H6v14h3v4h18v-4h3V12H26zM11 6h14v6H11V6zM26 29H10v-9h16V29zM26 17.8c-1.1 0-2-0.9-2-2s0.9-2 2-2c1.1 0 2 0.9 2 2S27.1 17.8 26 17.8z"/><path d="M26 14.6c0.7 0 1.2 0.5 1.2 1.2 0 0.7-0.5 1.2-1.2 1.2 -0.7 0-1.2-0.5-1.2-1.2C24.8 15.1 25.3 14.6 26 14.6z"/></svg>',
    export_excel: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path d="M24.4 15h-3.8L18 18.6 15.3 15h-3.8l4.5 5.2L11 27h7.3L18 25h-2l2-3L21.1 27H25l-5.1-6.8L24.4 15z"/><path d="M23 4H7v28h22V11L23 4zM8 31V5h14v7h6v19H8L8 31z"/></svg>',
    export_html: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path d="M25.7 20.8l-2.3-2.5c-0.2-0.2-0.4-0.3-0.6-0.3 -0.2 0-0.4 0.1-0.6 0.3 -0.3 0.4-0.3 1 0 1.4l1.7 1.9 -1.7 1.9c-0.2 0.2-0.3 0.4-0.3 0.7 0 0.3 0.1 0.5 0.3 0.7 0.2 0.2 0.4 0.3 0.6 0.3 0.2 0 0.4-0.1 0.6-0.3l2.3-2.5C26.1 21.8 26.1 21.2 25.7 20.8z"/><path d="M14 24c0-0.3-0.1-0.5-0.3-0.7l-1.7-1.9 1.7-1.9c0.3-0.4 0.3-1 0-1.4 -0.2-0.2-0.4-0.3-0.6-0.3 -0.2 0-0.4 0.1-0.6 0.3l-2.3 2.5c-0.3 0.4-0.3 1 0 1.4l2.3 2.5c0.2 0.2 0.4 0.3 0.6 0.3 0.2 0 0.4-0.1 0.6-0.3C13.9 24.5 14 24.3 14 24z"/><path d="M20.4 15.1c-0.1 0-0.2-0.1-0.3-0.1 -0.4 0-0.8 0.3-0.9 0.6l-4.1 11.1c-0.1 0.2-0.1 0.5 0 0.7 0.1 0.2 0.3 0.4 0.5 0.5C15.7 28 15.8 28 16 28c0.4 0 0.8-0.3 0.9-0.6l4.1-11.1C21.1 15.8 20.9 15.2 20.4 15.1z"/><path d="M23 4H7v28h22V11L23 4zM8 31V5h14v7h6v19H8L8 31z"/></svg>',
    export_image: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path d="M25 21.5c0 1.9 0 3.7 0 5.6 0 0.5-0.4 0.9-1 0.9C20 28 16 28 12 28 11.4 28 11 27.7 11 27.1c0-3.2 0-6.4 0-9.5 0-0.6 0-1.1 0-1.7 0-0.4 0.3-0.7 0.7-0.8C11.8 15 11.9 15 11.9 15c4.1 0 8.1 0 12.2 0C24.6 15 25 15.3 25 15.9 25 17.7 25 19.6 25 21.5zM14 26h8c0 0-1.4-3.7-2.2-5.3 -0.8 1.1-1.5 2.1-2.3 3.2 -0.4-0.5-0.8-1-1.2-1.5C15.4 23.4 14 26 14 26zM14.5 17c-0.8 0-1.5 0.7-1.5 1.5 0 0.8 0.7 1.5 1.5 1.5C15.3 20 16 19.3 16 18.5 16 17.7 15.3 17 14.5 17z"/><path d="M23 4H7v28h22V11L23 4zM8 31V5h14v7h6v19H8L8 31z"/></svg>',
    export_pdf: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path d="M17.2 17.1L17.2 17.1C17.3 17.1 17.3 17.1 17.2 17.1c0.1-0.5 0.2-0.7 0.2-1V15.8c0.1-0.6 0.1-1 0-1.1 0 0 0 0 0-0.1l-0.1-0.1 0 0 0 0c0 0 0 0.1-0.1 0.1C16.9 15.2 16.9 16 17.2 17.1L17.2 17.1zM13.8 24.8c-0.2 0.1-0.4 0.2-0.6 0.3 -0.8 0.7-1.3 1.5-1.5 1.8l0 0 0 0 0 0C12.5 26.9 13.1 26.2 13.8 24.8 13.9 24.8 13.9 24.8 13.8 24.8 13.9 24.8 13.8 24.8 13.8 24.8zM24.1 23.1c-0.1-0.1-0.6-0.5-2.1-0.5 -0.1 0-0.1 0-0.2 0l0 0c0 0 0 0 0 0.1 0.8 0.3 1.6 0.6 2.1 0.6 0.1 0 0.1 0 0.2 0l0 0h0.1c0 0 0 0 0-0.1l0 0C24.2 23.3 24.1 23.3 24.1 23.1zM24.6 24c-0.2 0.1-0.6 0.2-1 0.2 -0.9 0-2.2-0.2-3.4-0.8 -1.9 0.2-3.4 0.5-4.5 0.9 -0.1 0-0.1 0-0.2 0.1 -1.3 2.4-2.5 3.5-3.4 3.5 -0.2 0-0.3 0-0.4-0.1l-0.6-0.3v-0.1c-0.1-0.2-0.1-0.3-0.1-0.6 0.1-0.6 0.8-1.6 2.1-2.4 0.2-0.1 0.6-0.3 1-0.6 0.3-0.6 0.7-1.2 1.1-2 0.6-1.1 0.9-2.3 1.2-3.3l0 0c-0.4-1.4-0.7-2.1-0.2-3.7 0.1-0.5 0.4-0.9 0.9-0.9h0.2c0.2 0 0.4 0.1 0.7 0.2 0.8 0.8 0.4 2.6 0 4.1 0 0.1 0 0.1 0 0.1 0.4 1.2 1.1 2.3 1.8 2.9 0.3 0.2 0.6 0.5 1 0.7 0.6 0 1-0.1 1.5-0.1 1.3 0 2.2 0.2 2.6 0.8 0.1 0.2 0.1 0.5 0.1 0.7C24.9 23.5 24.8 23.8 24.6 24zM17.3 19.6c-0.2 0.8-0.7 1.7-1.1 2.7 -0.2 0.5-0.4 0.8-0.7 1.2h0.1 0.1l0 0c1.5-0.6 2.8-0.9 3.7-1 -0.2-0.1-0.3-0.2-0.4-0.3C18.4 21.6 17.7 20.7 17.3 19.6z"/><path d="M23 4H7v28h22V11L23 4zM8 31V5h14v7h6v19H8L8 31z"/></svg>',
    charts: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><polygon points="28 30 28 22 23 22 23 30 21 30 21 9 16 9 16 30 14 30 14 17 9 17 9 30 5 30 5 5 4 5 4 31 32 31 32 30 "/></svg>',
    charts_bar: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><polygon points="32 30 5 30 5 26 18 26 18 21 5 21 5 19 26 19 26 14 5 14 5 12 13 12 13 7 5 7 5 3 4 3 4 31 32 31 "/></svg>',
    charts_bar_line: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><polygon points="32 30 29 30 29 17 26 17 26 30 23 30 23 19 20 19 20 30 17 30 17 14 14 14 14 30 11 30 11 20 8 20 8 30 5 30 5 3 4 3 4 31 32 31 32 30 "/><path d="M8.7 12.5c1 0 1.7-0.8 1.7-1.7 0-0.3 0-0.5-0.1-0.8l4.3-3.9c0.3 0.3 0.5 0.3 0.9 0.3 0.2 0 0.5 0 0.6-0.1l4.8 6c-0.3 0.3-0.4 0.6-0.4 1 0 0.9 0.7 1.6 1.8 1.6 0.9 0 1.7-0.8 1.7-1.6 0-0.3-0.1-0.5-0.3-0.8l4.3-3.8c0.3 0.2 0.6 0.3 0.9 0.3 1.1 0 1.8-0.8 1.8-1.7 0-0.4-0.2-0.9-0.5-1.2C30.2 6 30 5.8 29.6 5.8c0 0-0.2-0.1-0.4-0.1 -0.9 0-1.7 0.8-1.7 1.7 0 0.3 0.1 0.5 0.3 0.8l-4.3 3.7c-0.3-0.1-0.5-0.3-0.9-0.3 -0.3 0-0.5 0.1-0.7 0.2l-4.8-6.1c0.2-0.3 0.4-0.6 0.4-0.9 0-1-0.8-1.7-1.7-1.7 -0.9 0-1.7 0.8-1.7 1.7 0 0.3 0.1 0.6 0.1 0.8l-4.3 3.9C9.4 9.2 9.1 9.1 8.7 9.1c-0.9 0-1.7 0.7-1.7 1.6C7 11.7 7.8 12.5 8.7 12.5z"/></svg>',
    charts_bar_stack: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><polygon points="32 30 28 30 28 27 23 27 23 30 21 30 21 14 16 14 16 30 14 30 14 22 9 22 9 30 5 30 5 3 4 3 4 31 32 31 32 30 "/><polygon points="14 15 9 15 9 21 14 21 14 15 "/><polygon points="21 9 16 9 16 13 21 13 21 9 "/><polygon points="28 22 23 22 23 26 28 26 28 22 "/></svg>',
    charts_line: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><polygon points="32 30 5 30 5 3 4 3 4 31 32 31 32 30 "/><path d="M9.4 24c1.3 0 2.4-1.1 2.4-2.3 0-0.7-0.3-1.3-0.8-1.8l2.8-4.3c0.4 0.1 0.6 0.2 1 0.2 0.8 0 1.4-0.3 1.9-0.7l2.8 2.6c-0.2 0.4-0.2 0.6-0.2 0.9 0 1.2 1 2.2 2.1 2.2 1.3 0 2.2-1 2.2-2.2 0-0.2 0-0.5-0.1-0.8l2.9-8c0.6 0.5 1.3 0.7 2.1 0.7 1.6 0 3-1.3 3-3.1 0-1.7-1.3-3.1-3-3.1 -1.7 0-3.1 1.4-3.1 3.1 0 0.6 0.2 1.1 0.4 1.6l-2.8 8c-0.4-0.5-0.9-0.7-1.6-0.7 -0.5 0-1 0.2-1.4 0.6l-2.8-2.7c0.1-0.4 0.2-0.8 0.2-1.2 0-1.6-1.1-2.8-2.7-2.8 -1.4 0-2.7 1.3-2.7 2.8 0 0.8 0.4 1.5 0.9 2.1l-2.8 4.2c-0.2-0.1-0.5-0.1-0.8-0.1C8.1 19.2 7 20.3 7 21.7 7 22.9 8.1 24 9.4 24z"/></svg>',
    charts_pie: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path d="M25.2 28.8c3.3-2.2 5.5-5.8 5.8-9.8h-12L25.2 28.8z"/><path d="M17 18v-13c-7 0.4-12 6.1-12 13 0 7.2 5.9 13 13 13 2.1 0 4-0.5 5.8-1.4C23.8 29.6 17 18.2 17 18z"/><path d="M18 5V18h13l0-0.9C30.6 10.6 25 5.4 18 5z"/></svg>',
    charts_scatter: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><polygon points="32 30 5 30 5 3 4 3 4 31 32 31 "/><path d="M9.5 20c1.4 0 2.5 1.1 2.5 2.5 0 1.4-1.1 2.5-2.5 2.5S7 23.9 7 22.5C7 21.1 8.1 20 9.5 20z"/><path d="M21.5 17c1.4 0 2.5 1.1 2.5 2.5 0 1.4-1.1 2.5-2.5 2.5S19 20.9 19 19.5C19 18.1 20.1 17 21.5 17z"/><path d="M14 11c1.7 0 3 1.3 3 3s-1.3 3-3 3 -3-1.3-3-3S12.3 11 14 11z"/><path d="M28 6c1.7 0 3 1.3 3 3 0 1.7-1.3 3-3 3s-3-1.3-3-3C25 7.3 26.3 6 28 6z"/></svg>',
    format: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><rect x="18.8" y="12.9" transform="matrix(-0.7073 -0.7069 0.7069 -0.7073 21.6275 41.9551)" width="1.3" height="7.1" fill="none"/><polygon points="24 25 23 25 23 32 4 32 4 13 11 13 11 12 3 12 3 33 24 33 "/><path d="M28.3 3.5c-0.9 0-1.8 0.3-2.5 0.8l-1.7 1.7 5.9 5.9 1.7-1.7c0.5-0.7 0.8-1.6 0.8-2.5C32.5 5.4 30.6 3.5 28.3 3.5z"/><path d="M11.2 18.9L9.5 26.5l7.6-1.7 11.6-11.6 -5.9-5.9L11.2 18.9zM17.4 19.5l-0.9-0.9 5.1-5 0.9 0.9L17.4 19.5z"/></svg>',
    format_number: '<svg xmlns="http://www.w3.org/2000/svg" width="52" height="36" viewBox="0 0 52 36"><path d="M31 19.2v-3.4l2.5-0.4c0.2-0.7 0.5-1.4 0.9-2.1l-1.4-2 2.4-2.4 2 1.4c0.7-0.4 1.4-0.7 2.1-0.9l0.4-2.5h3.4l0.4 2.5c0.7 0.2 1.4 0.5 2.1 0.9l2-1.4 2.4 2.4 -1.4 2c0.4 0.7 0.7 1.4 0.9 2.1L52 15.8v3.4l-2.5 0.4c-0.2 0.7-0.5 1.4-0.9 2.1l1.4 2 -2.4 2.4 -2-1.5c-0.7 0.4-1.4 0.7-2.1 0.9l-0.4 2.5h-3.4l-0.4-2.5c-0.7-0.2-1.4-0.5-2.1-0.9l-2 1.5 -2.4-2.4 1.4-2c-0.4-0.7-0.7-1.4-0.9-2.1L31 19.2zM41.5 21c1.9 0 3.5-1.6 3.5-3.5 0-1.9-1.6-3.5-3.5-3.5 -1.9 0-3.5 1.6-3.5 3.5C38 19.4 39.6 21 41.5 21z"/><path d="M38 30H1V6h36V5H0v26h38V30L38 30z"/><path d="M9.4 21.1c-0.3 0.3-0.7 0.4-1.2 0.4 -0.5 0-0.9-0.2-1.2-0.5s-0.4-0.8-0.4-1.4H5c0 0.9 0.2 1.7 0.7 2.2 0.5 0.6 1.2 0.9 2 1v1.3h1.1v-1.4c0.8-0.1 1.5-0.4 1.9-0.9 0.5-0.5 0.7-1.1 0.7-1.9 0-0.4-0.1-0.8-0.2-1.1 -0.1-0.3-0.3-0.6-0.5-0.8 -0.2-0.2-0.5-0.4-0.8-0.6 -0.3-0.2-0.8-0.4-1.4-0.6 -0.6-0.2-1-0.4-1.2-0.7s-0.4-0.6-0.4-1c0-0.4 0.1-0.8 0.4-1 0.2-0.2 0.6-0.4 1-0.4 0.4 0 0.8 0.2 1 0.5 0.3 0.3 0.4 0.8 0.4 1.4h1.6c0-0.9-0.2-1.6-0.6-2.2 -0.4-0.6-1-0.9-1.8-1v-1.5H7.9v1.5C7.1 12.6 6.5 12.9 6 13.4s-0.7 1.1-0.7 1.9c0 1.1 0.5 2 1.6 2.6 0.3 0.2 0.8 0.4 1.3 0.6 0.6 0.2 1 0.4 1.2 0.7s0.4 0.6 0.4 1C9.8 20.5 9.7 20.8 9.4 21.1z"/><path d="M16.3 12.6h-0.2l-3.8 1.5v1.4l2.4-0.8v8.1h1.6V12.6z"/><path d="M19.9 23.8c0.2-0.5 0.4-1 0.4-1.5l0-1.2h-1.5v1.3c0 0.3-0.1 0.6-0.2 1 -0.1 0.3-0.3 0.7-0.5 1.1l0.9 0.5C19.3 24.7 19.6 24.3 19.9 23.8z"/><path d="M27 16.7c0-1.4-0.3-2.5-0.8-3.2s-1.3-1.1-2.4-1.1c-1.1 0-1.9 0.4-2.4 1.1 -0.5 0.7-0.8 1.8-0.8 3.3v1.8c0 1.4 0.3 2.5 0.8 3.2s1.3 1.1 2.4 1.1c1.1 0 1.9-0.4 2.4-1.1 0.5-0.7 0.8-1.8 0.8-3.3V16.7zM25.4 18.9c0 0.9-0.1 1.6-0.4 2 -0.2 0.4-0.6 0.6-1.2 0.6 -0.5 0-0.9-0.2-1.2-0.7 -0.3-0.5-0.4-1.2-0.4-2.1v-2.3c0-0.9 0.1-1.5 0.4-2 0.3-0.4 0.6-0.6 1.2-0.6 0.5 0 0.9 0.2 1.2 0.7 0.3 0.4 0.4 1.1 0.4 2.1V18.9z"/></svg>',
    format_conditional: '<svg xmlns="http://www.w3.org/2000/svg" width="52" height="36" viewBox="0 0 52 36"><polygon points="38 5 0 5 0 31 26 31 26 30 1 30 1 6 37 6 37 10 38 10 "/><path d="M9 13H8.6L5 14.4v1.4l2-0.8V23h2V13z"/><path d="M17 22h-4l2.4-2.9c0.6-0.7 1-1.3 1.3-1.8 0.3-0.5 0.4-1.1 0.4-1.5 0-0.8-0.3-1.5-0.8-2 -0.5-0.5-1.2-0.7-2.2-0.7 -0.6 0-1.2 0.1-1.7 0.4s-0.9 0.6-1.1 1C11.1 14.9 11 16 11 16h1.6c0 0 0.1-0.9 0.4-1.3s0.7-0.4 1.2-0.4c0.4 0 0.8 0.2 1 0.5 0.3 0.3 0.4 0.7 0.4 1.1 0 0.4-0.1 0.7-0.3 1.1 -0.2 0.4-0.6 0.8-1.1 1.3L11 21.9V23h6V22z"/><path d="M21 19h0.8c0.6 0 1-0.1 1.3 0.2 0.3 0.3 0.4 0.6 0.4 1.1 0 0.5-0.1 0.8-0.4 1.1 -0.3 0.3-0.6 0.4-1.1 0.4 -0.5 0-0.8-0.3-1.1-0.5C20.6 20.9 20.5 21 20.5 20h-1.5c0 1 0.3 1.6 0.8 2.1s1.3 0.8 2.1 0.8c0.9 0 1.6-0.2 2.2-0.7 0.6-0.5 0.8-1.2 0.8-2.1 0-0.5-0.1-1-0.4-1.4 -0.3-0.4-0.6-0.7-1.1-0.9 0.4-0.2 0.7-0.5 1-0.9 0.3-0.4 0.4-0.8 0.4-1.2 0-0.9-0.3-1.5-0.8-2 -0.5-0.5-1.2-0.7-2.1-0.7 -0.5 0-1 0.1-1.5 0.3 -0.4 0.2-0.8 0.7-1 1.1S19.1 15 19.1 16h1.5c0-1 0.1-0.9 0.4-1.1 0.3-0.3 0.6-0.5 1-0.5 0.5 0 0.8 0.1 1 0.3s0.3 0.6 0.3 1.1c0 0.5-0.1 0.7-0.4 1C22.7 17 22.3 17 21.9 17H21V19z"/><path d="M47.8 7C50.1 7 52 8.9 52 11.2c0 1-0.3 1.8-0.8 2.5l-1.7 1.7L43.6 9.5l1.7-1.7C46 7.3 46.8 7 47.8 7zM30.7 22.4L29 30l7.6-1.7 11.6-11.6 -5.9-5.9L30.7 22.4zM42 17.9l-5.1 5.1 -0.9-0.9 5.1-5L42 17.9z"/></svg>',
    options: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path d="M19.8 34.5h-3.5c-0.5 0-0.7 0-2.5-4.5l-1.4-0.6c-3.7 1.7-4.2 1.7-4.3 1.7H7.9l-0.2-0.2 -2.5-2.5c-0.4-0.4-0.5-0.5 1.4-5l-0.6-1.4c-4.5-1.7-4.5-1.8-4.5-2.4v-3.5c0-0.5 0-0.7 4.5-2.5l0.6-1.4C4.5 8.1 4.7 8 5.1 7.6l2.6-2.6 0.3 0c0.4 0 1.9 0.6 4.4 1.6l1.4-0.6c1.7-4.5 1.9-4.5 2.4-4.5h3.5c0.5 0 0.7 0 2.5 4.5l1.4 0.6c3.7-1.7 4.2-1.7 4.3-1.7h0.3l0.2 0.2 2.5 2.5c0.4 0.4 0.5 0.5-1.4 5l0.6 1.4c4.5 1.6 4.5 1.8 4.5 2.4v3.5c0 0.5 0 0.7-4.5 2.5l-0.6 1.4c2 4.4 1.9 4.5 1.5 4.9l-2.7 2.7 -0.3 0c-0.4 0-1.9-0.6-4.4-1.6l-1.4 0.6C20.5 34.5 20.3 34.5 19.8 34.5zM16.7 33.1h2.7c0.3-0.7 1-2.4 1.5-3.9l0.1-0.3 2.5-1 0.3 0.1c1.5 0.6 3.2 1.4 3.9 1.6l1.9-1.9c-0.2-0.7-1-2.4-1.7-3.8l-0.1-0.3 1-2.5 0.3-0.1c1.5-0.6 3.2-1.3 3.9-1.6v-2.7c-0.7-0.3-2.4-1-3.9-1.5l-0.3-0.1 -1-2.5 0.1-0.3c0.6-1.5 1.3-3.2 1.6-3.9l-1.9-1.9c-0.6 0.2-2.4 1-3.8 1.7l-0.3 0.1L21.1 7.1l-0.1-0.3c-0.6-1.5-1.3-3.2-1.7-3.9h-2.7c-0.3 0.7-1 2.4-1.5 3.9l-0.1 0.3 -2.5 1 -0.3-0.1c-1.5-0.6-3.2-1.4-3.9-1.6l-1.9 1.9c0.2 0.7 1 2.4 1.6 3.8l0.1 0.3 -1 2.5 -0.3 0.1c-1.5 0.6-3.2 1.3-3.9 1.6v2.7c0.7 0.3 2.4 1 3.9 1.5l0.3 0.1 1 2.5 -0.1 0.3c-0.6 1.5-1.3 3.2-1.6 3.9l1.9 1.9c0.6-0.2 2.4-1 3.8-1.7l0.3-0.1 2.5 1 0.1 0.3C15.6 30.7 16.4 32.4 16.7 33.1zM18 23.8c-3.2 0-5.8-2.6-5.8-5.8 0-3.2 2.6-5.8 5.8-5.8 3.2 0 5.8 2.6 5.8 5.8C23.8 21.2 21.2 23.8 18 23.8z"/></svg>',
    fields: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><style>.a{fill:none;}</style><path d="M2 25.2v-3.4l2.5-0.4c0.2-0.7 0.5-1.4 0.9-2.1l-1.4-2 2.4-2.4 2 1.4c0.7-0.4 1.4-0.7 2.1-0.9L10.8 13h3.4l0.4 2.5c0.7 0.2 1.4 0.5 2.1 0.9l2-1.4 2.4 2.4 -1.4 2c0.4 0.7 0.7 1.4 0.9 2.1L23 21.8v3.4l-2.5 0.4c-0.2 0.7-0.5 1.4-0.9 2.1l1.4 2 -2.4 2.4 -2-1.5c-0.7 0.4-1.4 0.7-2.1 0.9L14.2 34h-3.4l-0.4-2.5c-0.7-0.2-1.4-0.5-2.1-0.9l-2 1.5 -2.4-2.4 1.4-2c-0.4-0.7-0.7-1.4-0.9-2.1L2 25.2zM12.5 27c1.9 0 3.5-1.6 3.5-3.5 0-1.9-1.6-3.5-3.5-3.5S9 21.6 9 23.5C9 25.4 10.6 27 12.5 27z"/><polygon points="24 18.9 24 12 17.3 12 24 18.9 " class="a"/><polygon points="32 27 32 20 25 20 25 24 25 27 32 27 " class="a"/><polygon points="16 4 9 4 9 11 12.5 11 16 11 16 4 " class="a"/><polygon points="17 11 24 11 24 4 17 4 17 11 " class="a"/><polygon points="25 19 32 19 32 12 25 12 25 19 " class="a"/><polygon points="25 11 32 11 32 4 25 4 25 11 " class="a"/><path d="M33 3H8v8.9L11 11H9V4h7v7h-2l3.3 1H24v6.9L25 22v-2h7v7h-7v-2l-1 3h9V3zM24 11h-7V4h7V11L24 11zM32 19h-7v-7h7V19L32 19zM32 11h-7V4h7V11L32 11z"/></svg>',
    fullscreen: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><polygon points="31 13 31 5 23 5 23 6 29.3 6 22.3 13 13.7 13 6.7 6 13 6 13 5 5 5 5 13 6 13 6 6.7 13 13.7 13 22.3 6 29.3 6 23 5 23 5 31 13 31 13 30 6.7 30 13.7 23 22.3 23 29.3 30 23 30 23 31 31 31 31 23 30 23 30 29.3 23 22.3 23 13.7 30 6.7 30 13 "/></svg>',
    minimize: '<svg xmlns="http://www.w3.org/2000/svg" width="36px" height="36px" enable-background="new -0.5 0.5 36 36" version="1.1" viewBox="-0.5 0.5 36 36" xml:space="preserve"><polygon points="10.796 12.499 4.5 12.5 4.5 13.5 12.496 13.5 12.5 5.5 11.5 5.5 11.497 11.799 4.628 4.924 3.925 5.622"/><rect x="12.5" y="13.5" width="10" height="10"/><line x1="13" x2="13" y1="13.7" y2="13.7"/><line x1="13.7" x2="13.7" y1="13" y2="13"/><polygon points="11.492 25.2 11.5 31.497 12.5 31.496 12.491 23.5 4.491 23.506 4.492 24.506 10.791 24.501 3.924 31.378 4.623 32.08"/><polygon points="24.2 24.506 30.497 24.5 30.496 23.5 22.5 23.506 22.502 31.506 23.502 31.505 23.5 25.206 30.373 32.076 31.076 31.378"/><polygon points="23.506 11.8 23.5 5.503 22.5 5.504 22.506 13.5 30.506 13.498 30.505 12.498 24.206 12.5 31.076 5.627 30.378 4.924"/></svg>',

};
// HANDLERS
// Connect tab
FlexmonsterToolbar.prototype.connectLocalCSVHandler = function () {
    this.pivot.connectTo({ dataSourceType: "csv", browseForFile: true });
}
FlexmonsterToolbar.prototype.connectLocalJSONHandler = function () {
    this.pivot.connectTo({ dataSourceType: "json", browseForFile: true });
}
FlexmonsterToolbar.prototype.connectRemoteCSV = function () {
    this.showConnectToRemoteCSVDialog();
}
FlexmonsterToolbar.prototype.connectRemoteJSON = function () {
    this.showConnectToRemoteJsonDialog();
}
FlexmonsterToolbar.prototype.connectOLAP = function () {
    this.showConnectToOLAPDialog();
}
// Open tab
FlexmonsterToolbar.prototype.openLocalReport = function () {
    this.pivot.open();
}
FlexmonsterToolbar.prototype.openRemoteReport = function () {
    this.showOpenRemoteReportDialog();
}
// Save tab
FlexmonsterToolbar.prototype.saveHandler = function () {
    this.pivot.save("report.json", 'file');
}
// Grid tab
FlexmonsterToolbar.prototype.gridHandler = function () {
    this.pivot.showGrid();
}
// Charts tab
FlexmonsterToolbar.prototype.chartsHandler = function (type) {
    var options = this.pivot.getOptions() || {};
    var chartOptions = options['chart'] || {};
    var multiple = chartOptions['multipleMeasures'];
    var node = this.getElementById("fm-tab-charts-multiple");
    if (node != null) this.disableMultipleValues(type, multiple, node);
    this.pivot.showCharts(type, multiple);
}
FlexmonsterToolbar.prototype.chartsMultipleHandler = function () {
    var options = this.pivot.getOptions() || {};
    var chartOptions = options['chart'] || {};
    var type = chartOptions['type'];
    var multiple = !chartOptions['multipleMeasures'];
    var node = this.getElementById("fm-tab-charts-multiple");
    multiple ? this.addClass(node, "fm-selected") : this.removeClass(node, "fm-selected");
    if (type == "pie" || type == "bar_stack" || type == "bar_line") {
        this.removeClass(node, "fm-selected");
    } else {
        this.pivot.showCharts(type, multiple);
    }
}
FlexmonsterToolbar.prototype.checkChartMultipleMeasures = function () {
    var options = this.pivot.getOptions() || {};
    var chartOptions = options['chart'] || {};
    var multiple = chartOptions['multipleMeasures'];
    var node = this.getElementById("fm-tab-charts-multiple");
    if (node != null) {
        this.disableMultipleValues(chartOptions['type'], multiple, node);
    }
}
FlexmonsterToolbar.prototype.disableMultipleValues = function (type, multiple, node) {
    var Labels = this.Labels;
    if (type == "pie" || type == "bar_stack" || type == "bar_line") {
        var chartType = "";
        switch (type) {
            case ("pie"):
                chartType = Labels.charts_pie;
                break;
            case ("bar_stack"):
                chartType = Labels.charts_bar_stack;
                break;
            case ("bar_line"):
                chartType = Labels.charts_bar_line;
                break;
        }
        this.removeClass(node, "fm-selected");
        this.addClass(node, "fm-multdisabled");
        isMultipleValDisabled = true;
        node.innerHTML = "<abbr title=\"" + Labels.charts_multiple_disabled + chartType.toLocaleLowerCase() + " " + Labels.charts.toLocaleLowerCase() + "\"> <a href=\"javascript:void(0)\"><span>" + Labels.charts_multiple + "</span></a></abbr>";
    } else if (multiple) {
        this.addClass(node, "fm-selected");
        this.removeClass(node, "fm-multdisabled");
        node.innerHTML = "<a href=\"javascript:void(0)\"><span>" + Labels.charts_multiple + "</span></a>";
        var _this = this;
        node.onclick = function () {
            _this.chartsMultipleHandler();
        }
    } else {
        this.removeClass(node, "fm-multdisabled");
        node.innerHTML = "<a href=\"javascript:void(0)\"><span>" + Labels.charts_multiple + "</span></a>";
        var _this = this;
        node.onclick = function () {
            _this.chartsMultipleHandler();
        }
    }
}
// Format tab
FlexmonsterToolbar.prototype.formatCellsHandler = function () {
    this.showFormatCellsDialog();
}
FlexmonsterToolbar.prototype.conditionalFormattingHandler = function () {
    this.showConditionalFormattingDialog();
}
// Options tab
FlexmonsterToolbar.prototype.optionsHandler = function () {
    this.showOptionsDialog();
}
// Fields tab
FlexmonsterToolbar.prototype.fieldsHandler = function () {
    this.pivot.openFieldsList();
}
// Export tab
FlexmonsterToolbar.prototype.printHandler = function () {
    this.pivot.print();
}
FlexmonsterToolbar.prototype.exportHandler = function (type) {
    (type == "pdf") ? this.showExportPdfDialog() : this.pivot.exportTo(type);
}
// Fullscreen tab
FlexmonsterToolbar.prototype.fullscreenHandler = function () {
    this.toggleFullscreen();
}

// DIALOGS
FlexmonsterToolbar.prototype.defaults = {};
// Connect to remote CSV
FlexmonsterToolbar.prototype.showConnectToRemoteCSVDialog = function () {
    var self = this;
    var Labels = this.Labels;
    var applyHandler = function () {
        if (textInput.value.length > 0) {
            self.pivot.connectTo({ filename: textInput.value, dataSourceType: "csv" });
        }
    }
    var dialog = this.popupManager.createPopup();
    dialog.content.classList.add("fm-popup-w500");
    dialog.setTitle(Labels.open_remote_csv);
    dialog.setToolbar([
        { id: "fm-btn-open", label: Labels.open, handler: applyHandler, isPositive: true },
        { id: "fm-btn-cancel", label: Labels.cancel }
    ]);

    var content = document.createElement("div");
    var textInput = document.createElement("input");
    textInput.id = "fm-inp-file-url";
    textInput.type = "text";
    textInput.value = "https://cdn.flexmonster.com/data/data.csv";
    content.appendChild(textInput);

    dialog.setContent(content);
    this.popupManager.addPopup(dialog.content);
}
// Connect to remote JSON
FlexmonsterToolbar.prototype.showConnectToRemoteJsonDialog = function () {
    var self = this;
    var Labels = this.Labels;
    var applyHandler = function () {
        if (textInput.value.length > 0) {
            self.pivot.connectTo({ filename: textInput.value, dataSourceType: "json" });
        }
    }
    var dialog = this.popupManager.createPopup();
    dialog.content.classList.add("fm-popup-w500");
    dialog.setTitle(Labels.open_remote_json);
    dialog.setToolbar([
        { id: "fm-btn-open", label: Labels.open, handler: applyHandler, isPositive: true },
        { id: "fm-btn-cancel", label: Labels.cancel }
    ]);

    var content = document.createElement("div");
    var textInput = document.createElement("input");
    textInput.id = "fm-inp-file-url";
    textInput.type = "text";
    textInput.value = "https://cdn.flexmonster.com/data/data.json";
    content.appendChild(textInput);

    dialog.setContent(content);
    this.popupManager.addPopup(dialog.content);
}
// Connect to OLAP (XMLA)
FlexmonsterToolbar.prototype.showConnectToOLAPDialog = function () {
    var self = this;
    var Labels = this.Labels;
    var onConnectBtnClick = function () {
        if (proxyUrlInput.value.length == 0) return;
        var credentialsCeckBox = self.getElementById("fm-credentials-checkbox");
        self.pivot.getXMLADataSources(proxyUrlInput.value,
            dataSourcesHandler,
            credentialsCeckBox && credentialsCeckBox.checked ? self.getElementById("fm-username-input").value : null,
            credentialsCeckBox && credentialsCeckBox.checked ? self.getElementById("fm-password-input").value : null);
    };
    var dataSourcesHandler = function (dataProvider) {
        if (dataProvider != null && dataProvider.length > 0) {
            fillList(olapDataSourcesList, dataProvider, Labels.select_data_source);
        }
    };
    var onOlapDataSourcesListChange = function () {
        var credentialsCeckBox = self.getElementById("fm-credentials-checkbox");
        self.pivot.getXMLACatalogs(proxyUrlInput.value,
            olapDataSourcesList.value,
            catalogsHandler,
            credentialsCeckBox && credentialsCeckBox.checked ? self.getElementById("fm-username-input").value : null,
            credentialsCeckBox && credentialsCeckBox.checked ? self.getElementById("fm-password-input").value : null);
    };
    var catalogsHandler = function (dataProvider) {
        if (dataProvider != null && dataProvider.length > 0) {
            fillList(olapCatalogsList, dataProvider, Labels.select_catalog);
        }
    };
    var onOlapCatalogsListChange = function () {
        var credentialsCeckBox = self.getElementById("fm-credentials-checkbox");
        self.pivot.getXMLACubes(proxyUrlInput.value, olapDataSourcesList.value, olapCatalogsList.value,
            cubesHandler,
            credentialsCeckBox && credentialsCeckBox.checked ? self.getElementById("fm-username-input").value : null,
            credentialsCeckBox && credentialsCeckBox.checked ? self.getElementById("fm-password-input").value : null);
    };
    var cubesHandler = function (dataProvider) {
        if (dataProvider != null && dataProvider.length > 0) {
            fillList(olapCubesList, dataProvider, Labels.select_cube);
        }
    };
    var onOlapCubesListChange = function () {
        self.removeClass(self.getElementById("fm-btn-open"), "fm-ui-disabled");
    };
    var okHandler = function () {
        var provider = self.pivot.getXMLAProviderName(proxyUrlInput.value, '');
        var credentialsCeckBox = self.getElementById("fm-credentials-checkbox");
        self.pivot.connectTo({
            dataSourceType: provider,
            proxyUrl: proxyUrlInput.value,
            dataSourceInfo: olapDataSourcesList.value,
            catalog: olapCatalogsList.value,
            cube: olapCubesList.value,
            username: credentialsCeckBox && credentialsCeckBox.checked ? self.getElementById("fm-username-input").value : null,
            password: credentialsCeckBox && credentialsCeckBox.checked ? self.getElementById("fm-password-input").value : null
        });
    };
    var fillList = function (list, dataProvider, prompt) {
        // clear
        var length = list.options.length;
        for (var i = 0; i < length; i++) {
            list.options[i] = null;
        }
        // fill
        list.options[0] = new Option(prompt, "");
		list.options[0].disabled = true;
        for (var i = 0; i < dataProvider.length; i++) {
            list.options[i + 1] = new Option(dataProvider[i], dataProvider[i]);
        }
        list.disabled = false;
        list.focus();
    };
    var onUseCredentialsChange = function () {
        var cbx = self.getElementById("fm-credentials-checkbox");
        var useCredentials = !self.hasClass(cbx, "fm-selected");
        if (useCredentials) {
            self.addClass(cbx, "fm-selected");
        } else {
            self.removeClass(cbx, "fm-selected");
        }
        self.getElementById("fm-credentials").style.display = useCredentials ? "inline" : "none";
    }

    var dialog = this.popupManager.createPopup();
    dialog.content.id = "fm-popup-olap";
    dialog.content.classList.add("fm-popup-w570");
    dialog.setTitle(this.osUtils.isMobile ? Labels.connect_olap_mobile : Labels.olap_connection_tool);
    dialog.setToolbar([
        { id: "fm-btn-open", label: Labels.ok, handler: okHandler, disabled: true, isPositive: true },
        { id: "fm-btn-cancel", label: Labels.cancel }
    ]);

    var content = document.createElement("div");
    var group = document.createElement("div");
    group.classList.add("fm-inp-group");
    content.appendChild(group);

    // proxy url
    var row = document.createElement("div");
    row.classList.add("fm-inp-row");
    row.classList.add("fm-ir-horizontal");
    group.appendChild(row);
    var label = document.createElement("label");
    this.setText(label, Labels.proxy_url);
    row.appendChild(label);

    var proxyUrlInput = document.createElement("input");
    proxyUrlInput.id = "fm-inp-proxy-url";
    proxyUrlInput.type = "text";
    proxyUrlInput.classList.add("fm-inp");
    proxyUrlInput.value = (this.dataSourceType == 3) ? "http://olap.flexmonster.com:8080/mondrian/xmla" : "https://olap.flexmonster.com/olap/msmdpump.dll";
    row.appendChild(proxyUrlInput);

    var connectBtn = document.createElement("a");
    connectBtn.id = "fm-btn-connect";
    connectBtn.setAttribute("href", "javascript:void(0)");
    connectBtn.classList.add("fm-ui-btn");
    connectBtn.classList.add("fm-ui-btn-dark");
    this.setText(connectBtn, Labels.connect);
    connectBtn.onclick = onConnectBtnClick;
    row.appendChild(connectBtn);

    // ds info
    var row = document.createElement("div");
    row.classList.add("fm-inp-row");
    row.classList.add("fm-ir-horizontal");
    group.appendChild(row);
    var label = document.createElement("label");
    this.setText(label, Labels.data_source_info);
    row.appendChild(label);

    var select = this.createSelect();
    var olapDataSourcesList = select.select;
    olapDataSourcesList.id = "fm-lst-dsinfo";
    olapDataSourcesList.disabled = true;
    olapDataSourcesList.innerHTML = '<option value="" class="placeholder" disabled selected>'
        + Labels.select_data_source + '</option>';
    olapDataSourcesList.onchange = onOlapDataSourcesListChange;
    row.appendChild(select);

    // catalogs
    var row = document.createElement("div");
    row.classList.add("fm-inp-row");
    row.classList.add("fm-ir-horizontal");
    group.appendChild(row);
    var label = document.createElement("label");
    this.setText(label, Labels.catalog);
    row.appendChild(label);

    var select = this.createSelect();
    var olapCatalogsList = select.select;
    olapCatalogsList.id = "fm-lst-catalogs";
    olapCatalogsList.disabled = true;
    olapCatalogsList.innerHTML = '<option value="" class="placeholder" disabled selected>'
        + Labels.select_catalog + '</option>';
    olapCatalogsList.onchange = onOlapCatalogsListChange;
    row.appendChild(select);

    // cube
    var row = document.createElement("div");
    row.classList.add("fm-inp-row");
    row.classList.add("fm-ir-horizontal");
    group.appendChild(row);
    var label = document.createElement("label");
    this.setText(label, Labels.cube);
    row.appendChild(label);

    var select = this.createSelect();
    var olapCubesList = select.select;
    olapCubesList.id = "fm-lst-cubes";
    olapCubesList.disabled = true;
    olapCubesList.innerHTML = '<option value="" class="placeholder" disabled selected>'
        + Labels.select_cube + '</option>';
    olapCubesList.onchange = onOlapCubesListChange;
    row.appendChild(select);

    dialog.setContent(content);
    this.popupManager.addPopup(dialog.content);
}
// Open remote report
FlexmonsterToolbar.prototype.showOpenRemoteReportDialog = function () {
    var self = this;
    var Labels = this.Labels;
    var applyHandler = function () {
        if (textInput.value.length > 0) {
            self.pivot.load(textInput.value);
        }
    }
    var dialog = this.popupManager.createPopup();
    dialog.content.classList.add("fm-popup-w500");
    dialog.setTitle(Labels.open_remote_report);
    dialog.setToolbar([
        { id: "fm-btn-open", label: Labels.open, handler: applyHandler, isPositive: true },
        { id: "fm-btn-cancel", label: Labels.cancel }
    ]);
    var content = document.createElement("div");
    var textInput = document.createElement("input");
    textInput.type = "text";
    var options = self.pivot.getOptions() || {};
    var isFlatTable = (options.grid && options.grid.type == "flat");
    textInput.value = isFlatTable ? "https://cdn.flexmonster.com/reports/report-flat.json" : "https://cdn.flexmonster.com/reports/report.json";
    content.appendChild(textInput);

    dialog.setContent(content);
    this.popupManager.addPopup(dialog.content);
}
// Format cells
FlexmonsterToolbar.prototype.showFormatCellsDialog = function () {
    var self = this;
    var Labels = this.Labels;
    function updateDropdowns() {
        textAlignDropDown.disabled = thousandsSepDropDown.disabled = decimalSepDropDown.disabled = decimalPlacesDropDown.disabled = currencySymbInput.disabled = currencyAlignDropDown.disabled = nullValueInput.disabled = isPercentDropdown.disabled = (valuesDropDown.value == "empty");
    }
    var valuesDropDownChangeHandler = function () {
        updateDropdowns();
        var formatVO = self.pivot.getFormat(valuesDropDown.value);
        textAlignDropDown.value = (formatVO.textAlign == "left" || formatVO.textAlign == "right") ? formatVO.textAlign : "right";
        thousandsSepDropDown.value = formatVO.thousandsSeparator;
        decimalSepDropDown.value = formatVO.decimalSeparator;
        decimalPlacesDropDown.value = formatVO.decimalPlaces;
        currencySymbInput.value = formatVO.currencySymbol;
        currencyAlignDropDown.value = formatVO.currencySymbolAlign;
        nullValueInput.value = formatVO.nullValue;
        isPercentDropdown.value = (formatVO.isPercent == true) ? true : false;
    }
    var applyHandler = function () {
        var formatVO = {};
        if (valuesDropDown.value == "") formatVO.name = "";

        formatVO.textAlign = textAlignDropDown.value;
        formatVO.thousandsSeparator = thousandsSepDropDown.value;
        formatVO.decimalSeparator = decimalSepDropDown.value;
        formatVO.decimalPlaces = decimalPlacesDropDown.value;
        formatVO.currencySymbol = currencySymbInput.value;
        formatVO.currencySymbolAlign = currencyAlignDropDown.value;
        formatVO.nullValue = nullValueInput.value;
        formatVO.isPercent = isPercentDropdown.value == "true" ? true : false;
        self.pivot.setFormat(formatVO, (valuesDropDown.value == "" ? null : valuesDropDown.value));
        self.pivot.refresh();
    }

    var dialog = this.popupManager.createPopup();
    dialog.content.id = "fm-popup-format-cells";
    dialog.setTitle(this.osUtils.isMobile ? Labels.format : Labels.format_cells);
    dialog.setToolbar([
        { id: "fm-btn-apply", label: Labels.apply, handler: applyHandler, isPositive: true },
        { id: "fm-btn-cancel", label: Labels.cancel }
    ], true);

    var content = document.createElement("div");
    var group = document.createElement("div");
    group.classList.add("fm-inp-group");
    content.appendChild(group);

    var row = document.createElement("div");
    row.classList.add("fm-inp-row");
    row.classList.add("fm-ir-horizontal");
    group.appendChild(row);

    // measures
    var label = document.createElement("label");
    label.classList.add("fm-uc");
    self.setText(label, Labels.choose_value);
    row.appendChild(label);
    var select = self.createSelect();
    var valuesDropDown = select.select;
    valuesDropDown.onchange = valuesDropDownChangeHandler;
    valuesDropDown.options[0] = new Option(Labels.choose_value, "empty");
    valuesDropDown.options[0].disabled = true;
    valuesDropDown.options[1] = new Option(Labels.all_values, "");
    row.appendChild(select);

    var row = document.createElement("div");
    row.classList.add("fm-inp-row");
    row.classList.add("fm-ir-horizontal");
    group.appendChild(row);

    var group = document.createElement("div");
    group.classList.add("fm-inp-group");
    content.appendChild(group);

    // text align
    var row = document.createElement("div");
    row.classList.add("fm-inp-row");
    row.classList.add("fm-ir-horizontal");
    group.appendChild(row);
    var label = document.createElement("label");
    self.setText(label, Labels.text_align);
    row.appendChild(label);
    var select = self.createSelect();
    var textAlignDropDown = select.select;
    textAlignDropDown.options[0] = new Option(Labels.align_left, "left");
    textAlignDropDown.options[1] = new Option(Labels.align_right, "right");
    row.appendChild(select);

    // thousand_separator
    var row = document.createElement("div");
    row.classList.add("fm-inp-row");
    row.classList.add("fm-ir-horizontal");
    group.appendChild(row);
    var label = document.createElement("label");
    self.setText(label, Labels.thousand_separator);
    row.appendChild(label);
    var select = self.createSelect();
    var thousandsSepDropDown = select.select;
    thousandsSepDropDown.options[0] = new Option(Labels.none, "");
    thousandsSepDropDown.options[1] = new Option(Labels.space, " ");
    thousandsSepDropDown.options[2] = new Option(",", ",");
    thousandsSepDropDown.options[3] = new Option(".", ".");
    row.appendChild(select);

    // decimal_separator
    var row = document.createElement("div");
    row.classList.add("fm-inp-row");
    row.classList.add("fm-ir-horizontal");
    group.appendChild(row);
    var label = document.createElement("label");
    self.setText(label, Labels.decimal_separator);
    row.appendChild(label);
    var select = self.createSelect();
    var decimalSepDropDown = select.select;
    decimalSepDropDown.options[0] = new Option(".", ".");
    decimalSepDropDown.options[1] = new Option(",", ",");
    row.appendChild(select);

    // decimal_places
    var row = document.createElement("div");
    row.classList.add("fm-inp-row");
    row.classList.add("fm-ir-horizontal");
    group.appendChild(row);
    var label = document.createElement("label");
    self.setText(label, Labels.decimal_places);
    row.appendChild(label);
    var select = self.createSelect();
    var decimalPlacesDropDown = select.select;
    for (var i = 0; i < 11; i++) {
        decimalPlacesDropDown.options[i] = new Option(i === 0 ? Labels.none : (i - 1), i - 1);
    }
    row.appendChild(select);

    // currency_symbol
    var row = document.createElement("div");
    row.classList.add("fm-inp-row");
    row.classList.add("fm-ir-horizontal");
    group.appendChild(row);
    var label = document.createElement("label");
    self.setText(label, Labels.currency_symbol);
    row.appendChild(label);
    var currencySymbInput = document.createElement("input");
    currencySymbInput.classList.add("fm-inp");
    currencySymbInput.type = "text";
    row.appendChild(currencySymbInput);

    // currency_align
    var row = document.createElement("div");
    row.classList.add("fm-inp-row");
    row.classList.add("fm-ir-horizontal");
    group.appendChild(row);
    var label = document.createElement("label");
    self.setText(label, Labels.currency_align);
    row.appendChild(label);
    var select = self.createSelect();
    var currencyAlignDropDown = select.select;
    currencyAlignDropDown.options[0] = new Option(Labels.align_left, "left");
    currencyAlignDropDown.options[1] = new Option(Labels.align_right, "right");
    row.appendChild(select);

    // null_value
    var row = document.createElement("div");
    row.classList.add("fm-inp-row");
    row.classList.add("fm-ir-horizontal");
    group.appendChild(row);
    var label = document.createElement("label");
    self.setText(label, Labels.null_value);
    row.appendChild(label);
    var nullValueInput = document.createElement("input");
    nullValueInput.classList.add("fm-inp");
    nullValueInput.type = "text";
    row.appendChild(nullValueInput);

    // is_percent
    var row = document.createElement("div");
    row.classList.add("fm-inp-row");
    row.classList.add("fm-ir-horizontal");
    group.appendChild(row);
    var label = document.createElement("label");
    self.setText(label, Labels.is_percent);
    row.appendChild(label);
    var select = self.createSelect();
    var isPercentDropdown = select.select;
    isPercentDropdown.options[0] = new Option(Labels.true_value, true);
    isPercentDropdown.options[1] = new Option(Labels.false_value, false);
    row.appendChild(select);

    dialog.setContent(content);
    this.popupManager.addPopup(dialog.content);

    var _measures = self.pivot.getMeasures();
    var _uniqueNames = [];
    var measures = [];
    for (var i = 0; i < _measures.length; i++) {
        if (_uniqueNames.indexOf(_measures[i].uniqueName) == -1) {
            _uniqueNames.push(_measures[i].uniqueName);
            measures.push(_measures[i]);
        }
    }
    for (var i = 0; i < measures.length; i++) {
        valuesDropDown.options[i + 2] = new Option(measures[i].name, measures[i].uniqueName);
    }
    valuesDropDownChangeHandler();
}
// Conditional formatting
FlexmonsterToolbar.prototype.showConditionalFormattingDialog = function () {
    var self = this;
    var Labels = this.Labels;
    var conditions = this.pivot.getAllConditions();

    var _measures = self.pivot.getMeasures();
    var _uniqueNames = [];
    var measures = [];
    for (var i = 0; i < _measures.length; i++) {
        if (_uniqueNames.indexOf(_measures[i].uniqueName) == -1) {
            _uniqueNames.push(_measures[i].uniqueName);
            measures.push(_measures[i]);
        }
    }

    var applyHandler = function () {
        self.pivot.removeAllConditions();
        for (var i = 0; i < conditions.length; i++) {
            var formula = composeFormula(conditions[i].sign, conditions[i].value1, conditions[i].value2);
            if (formula == null) return;
            conditions[i].formula = formula;
            self.pivot.addCondition(conditions[i]);
        }
        self.pivot.refresh();
    };
    var onAddConditionBtnClick = function () {
        var condition = {
            sign: "<",
            value1: "0",
            measures: measures,
            format: { fontFamily: 'Arial', fontSize: '12px', color: '#000000', backgroundColor: '#FFFFFF' }
        };
        conditions.push(condition);
        content.appendChild(self.createConditionalFormattingItem(condition, conditions));
        self.popupManager.centerPopup(dialog.content);
    };
    var composeFormula = function (sign, value1, value2) {
        var formula = '';
        var firstValueEmpty = (value1 == null || value1.length == 0);
        var secondValueEmpty = (value2 == null || value2.length == 0);
        var isBetween = (sign === '><');
        var isEmpty = (sign === 'isNaN');
        if ((firstValueEmpty && !isEmpty) || (isBetween && secondValueEmpty)) {
            return formula;
        }
        if (isBetween && !secondValueEmpty) {
            formula = "AND(#value > " + value1 + ", #value < " + value2 + ")";
        } else if (isEmpty) {
            formula = "isNaN(#value)";
        } else {
            var isString = isNaN(parseFloat(value1));
            if (isString) {
                value1 = "'" + value1 + "'";
            }
            formula = "#value " + sign + " " + value1;
        }
        return formula;
    };
    var parseStrings = function (input) {
        var output = [];
        var openQuote = false;
        var str = "";
        for (var i = 0; i < input.length; i++) {
            if (input[i] == '"' || input[i] == "'") {
                if (openQuote) {
                    output.push(str);
                } else {
                    str = "";
                }
                openQuote = !openQuote;
                continue;
            }
            if (openQuote) {
                str += input[i];
            }
        }
        return output;
    };
    var parseFormula = function (formula) {
        var parseNumber = /\W\d+\.*\d*/g;
        var parseSign = /<=|>=|<|>|=|=|!=|isNaN/g;
        var numbers = formula.match(parseNumber);
        var strings = parseStrings(formula);
        var signs = formula.match(parseSign);
        if (numbers == null && strings == null) return {};
        return {
            value1: (numbers != null) ? numbers[0].replace(/\s/, '') : strings[0],
            value2: (numbers != null && numbers.length > 1) ? numbers[1].replace(/\s/, '') : '',
            sign: signs ? signs.join('') : ""
        };
    };
    var dialog = this.popupManager.createPopup();
    dialog.content.id = "fm-popup-conditional";
    dialog.setTitle(this.osUtils.isMobile ? Labels.conditional : Labels.conditional_formatting);
    dialog.setToolbar([
        { id: "fm-btn-apply", label: Labels.apply, handler: applyHandler, isPositive: true },
        { id: "fm-btn-cancel", label: Labels.cancel }
    ], true);

    var addConditionBtn = document.createElement("a");
    addConditionBtn.id = "fm-add-btn";
    addConditionBtn.setAttribute("href", "javascript:void(0)");
    addConditionBtn.classList.add("fm-ui-btn");
    addConditionBtn.classList.add("fm-ui-btn-light");
    addConditionBtn.classList.add("fm-button-add");
    addConditionBtn.onclick = onAddConditionBtnClick;
    addConditionBtn.setAttribute("title", Labels.add_condition);
    var icon = document.createElement("span");
    icon.classList.add("fm-icon");
    icon.classList.add("fm-icon-act_add");
    addConditionBtn.appendChild(icon);
    dialog.toolbar.insertBefore(addConditionBtn, dialog.toolbar.firstChild);

    var content = document.createElement("div");
    content.classList.add("fm-popup-content");
    content.onclick = function (event) {
        if (event.target.classList.contains("fm-cr-delete")) {
            self.popupManager.centerPopup(dialog.content);
        }
    }

    for (var i = 0; i < conditions.length; i++) {
        var formula = parseFormula(conditions[i].formula);
        conditions[i].value1 = formula.value1;
        conditions[i].value2 = formula.value2;
        conditions[i].sign = formula.sign;
        conditions[i].measures = measures;
        content.appendChild(self.createConditionalFormattingItem(conditions[i], conditions));
    }
    dialog.setContent(content);
    this.popupManager.addPopup(dialog.content);
};
FlexmonsterToolbar.prototype.defaults.fontSizes = ["8px", "9px", "10px", "11px", "12px", "13px", "14px"],
    FlexmonsterToolbar.prototype.defaults.fonts = ['Arial', 'Lucida Sans Unicode', 'Verdana', 'Courier New', 'Palatino Linotype', 'Tahoma', 'Impact', 'Trebuchet MS', 'Georgia', 'Times New Roman'],
    FlexmonsterToolbar.prototype.defaults.conditions = [
        { label: "less_than", sign: '<' },
        { label: "less_than_or_equal", sign: '<=' },
        { label: "greater_than", sign: '>' },
        { label: "greater_than_or_equal", sign: '>=' },
        { label: "equal_to", sign: '=' },
        { label: "not_equal_to", sign: '!=' },
        { label: "between", sign: '><' },
        { label: "is_empty", sign: 'isNaN' }
    ];
FlexmonsterToolbar.prototype.createConditionalFormattingItem = function (data, allConditions) {
    var self = this;
    var Labels = this.Labels;
    var fillValuesDropDown = function (measures, selectedMeasure) {
        valuesDropDown[0] = new Option(Labels.all_values, "");
        var options = self.pivot.getOptions() || {};
        var isFlatTable = (options.grid && options.grid.type == "flat");
        for (var i = 0; i < measures.length; i++) {
            if (isFlatTable && measures[i].type == 7) { // count measure
                continue;
            }
            valuesDropDown[valuesDropDown.options.length] = new Option(measures[i].name, measures[i].uniqueName);
            // backward compatibility with 2.1
            if (selectedMeasure == "[Measures].[" + measures[i].uniqueName + "]") {
                selectedMeasure = measures[i].uniqueName;
            }
        }
        if (selectedMeasure != null) {
            valuesDropDown.value = selectedMeasure;
        } else {
            valuesDropDown.selectedIndex = 0;
        }
    };
    var fillConditionsDropDown = function (selectedCondition) {
        for (var i = 0; i < self.defaults.conditions.length; i++) {
            conditionsDropDown[i] = new Option(Labels[self.defaults.conditions[i].label], self.defaults.conditions[i].sign);
        }
        if (selectedCondition != null) {
            conditionsDropDown.value = selectedCondition;
        } else {
            conditionsDropDown.selectedIndex = 0;
        }
    };
    var fillFontFamiliesDropDown = function (selectedFont) {
        for (var i = 0; i < self.defaults.fonts.length; i++) {
            fontFamiliesDropDown[i] = new Option(self.defaults.fonts[i], self.defaults.fonts[i]);
        }
        fontFamiliesDropDown.value = (selectedFont == null ? 'Arial' : selectedFont);
    };
    var fillFontSizesDropDown = function (selectedFontSize) {
        for (var i = 0; i < self.defaults.fontSizes.length; i++) {
            fontSizesDropDown[i] = new Option(self.defaults.fontSizes[i], self.defaults.fontSizes[i]);
        }
        fontSizesDropDown.value = (selectedFontSize == null ? "12px" : selectedFontSize);
    };
    var onValueChanged = function () {
        data.measure = valuesDropDown.value;
    };
    var onFontFamilyChanged = function () {
        if (data.format != null) {
            data.format.fontFamily = fontFamiliesDropDown.value;
            drawSample();
        }
    };
    var onFontSizeChanged = function () {
        if (data.format != null) {
            data.format.fontSize = fontSizesDropDown.value;
            drawSample();
        }
    };
    var onConditionChanged = function () {
        data.sign = conditionsDropDown.value;
        if (('sign' in data) && data.sign === '><') {
            data.value2 = 0;
        } else if (('sign' in data) && data.sign === 'isNaN') {
            delete data.value1;
            delete data.value2;
        } else {
            delete data.value2;
        }
        drawInputs();
    };
    var onInput1Changed = function () {
        data.value1 = (input1.value.length == 0) ? "0" : input1.value;
    };
    var onInput2Changed = function () {
        data.value2 = (input2.value.length == 0) ? "0" : input2.value;
    };
    var onRemoveBtnClick = function () {
        var idx = allConditions.indexOf(data);
        if (idx > -1) {
            allConditions.splice(idx, 1);
        }
        output.parentNode.removeChild(output);
    };
    var onColorChanged = function () {
        if (data.format != null) {
            sample.style.color = colorPicker.fontColor || '#000';
            sample.style.backgroundColor = colorPicker.backgroundColor || '#fff';
        }
    };
    var onColorApply = function () {
        if (data.format != null) {
            data.format.color = colorPicker.fontColor;
            data.format.backgroundColor = colorPicker.backgroundColor;
            drawSample();
        }
    };
    var onColorCancel = function () {
        if (data.format != null) {
            colorPicker.setColor(data.format.hasOwnProperty('backgroundColor') ? data.format.backgroundColor : '0xFFFFFF', "bg");
            colorPicker.setColor(data.format.hasOwnProperty('color') ? data.format.color : '0x000000', "font");
        }
        drawSample();
    }
    var drawInputs = function () {
        if (('sign' in data) && data.sign === '><') {
            input1.classList.remove("fm-width120");
            input1.classList.add("fm-width50");
            input1.style.display = "inline-block";
            input2.value = ('value2' in data ? data.value2 : "0");
            input2.style.display = "inline-block";
            andLabel.style.display = "inline-block";
        } else if (('sign' in data) && data.sign === 'isNaN') {
            input1.style.display = "none";
            input2.style.display = "none";
            andLabel.style.display = "none";
        } else {
            input1.classList.add("fm-width120");
            input1.classList.remove("fm-width50");
            input1.style.display = "inline-block";
            input2.style.display = "none";
            andLabel.style.display = "none";
        }
    };
    var drawSample = function () {
        var format = data.format;
        if (format != null) {
            sample.style.backgroundColor = format.backgroundColor || '#fff';
            sample.style.color = format.color || '#000';
            sample.style.fontFamily = format.fontFamily || 'Arial';
            sample.style.fontSize = format.fontSize || '12px';
        }
    };

    var output = document.createElement("div");
    output.classList.add("fm-condition-row");

    var itemRenderer = document.createElement("div");
    itemRenderer.classList.add("fm-wrap-relative");
    output.appendChild(itemRenderer);

    var removeBtn = document.createElement("span");
    removeBtn.classList.add("fm-cr-delete");
    removeBtn.classList.add("fm-icon");
    removeBtn.classList.add("fm-icon-act_trash");
    removeBtn.onclick = onRemoveBtnClick;
    itemRenderer.appendChild(removeBtn);

    var row = document.createElement("div");
    row.classList.add("fm-cr-inner");
    itemRenderer.appendChild(row);

    var label = document.createElement("div");
    label.classList.add("fm-cr-lbl");
    label.classList.add("fm-width50");
    self.setText(label, Labels.value + ":");
    row.appendChild(label);

    var select = self.createSelect();
    select.id = "fm-values";
    var valuesDropDown = select.select;
    if ('measures' in data) {
        fillValuesDropDown(data.measures, data.measure);
        valuesDropDown.disabled = (data.measures.length === 0);
    } else {
        valuesDropDown.disabled = true;
    }
    valuesDropDown.onchange = onValueChanged;
    row.appendChild(select);

    var select = self.createSelect();
    select.id = "fm-conditions";
    var conditionsDropDown = select.select;
    fillConditionsDropDown(!('sign' in data) ? null : data.sign);
    conditionsDropDown.onchange = onConditionChanged;
    row.appendChild(select);

    var input1 = document.createElement("input");
    input1.classList.add("fm-number-inp");
    input1.classList.add("fm-width50");
    input1.type = "number";
    input1.value = ('value1' in data ? data.value1 : "0");
    input1.onchange = onInput1Changed;
    row.appendChild(input1);

    var andLabel = document.createElement("span");
    andLabel.id = "fm-and-label";
    andLabel.classList.add("fm-width20");
    self.setText(andLabel, Labels.and_symbole);
    row.appendChild(andLabel);

    var input2 = document.createElement("input");
    input2.classList.add("fm-number-inp");
    input2.classList.add("fm-width50");
    input2.type = "number";
    input2.value = ('value2' in data ? data.value2 : "0");
    input2.onchange = onInput2Changed;
    row.appendChild(input2);

    drawInputs();

    var row = document.createElement("div");
    row.classList.add("fm-cr-inner");
    itemRenderer.appendChild(row);

    var label = document.createElement("div");
    label.classList.add("fm-cr-lbl");
    label.classList.add("fm-width50");
    self.setText(label, Labels.format + ":");
    row.appendChild(label);

    var select = self.createSelect();
    select.id = "fm-font-family";
    var fontFamiliesDropDown = select.select;
    fillFontFamiliesDropDown((data.hasOwnProperty('format')) && (data.format.hasOwnProperty('fontFamily')) ? data.format.fontFamily : null);
    fontFamiliesDropDown.onchange = onFontFamilyChanged;
    row.appendChild(select);

    var select = self.createSelect();
    select.id = "fm-font-size";
    var fontSizesDropDown = select.select;
    fillFontSizesDropDown((data.hasOwnProperty('format')) && (data.format.hasOwnProperty('fontSize')) ? data.format.fontSize : null);
    fontSizesDropDown.onchange = onFontSizeChanged;
    row.appendChild(select);

    var colorPicker = new FlexmonsterToolbar.ColorPicker(this, output);
    colorPicker.setColor((data.hasOwnProperty('format')) && (data.format.hasOwnProperty('backgroundColor')) ? data.format.backgroundColor : '0xFFFFFF', "bg");
    colorPicker.setColor((data.hasOwnProperty('format')) && (data.format.hasOwnProperty('color')) ? data.format.color : '0x000000', "font");
    colorPicker.changeHandler = onColorChanged;
    colorPicker.applyHandler = onColorApply;
    colorPicker.cancelHandler = onColorCancel;
    row.appendChild(colorPicker.element);

    var sample = document.createElement("input");
    sample.id = "fm-sample";
    sample.classList.add("fm-inp");
    sample.type = "number";
    sample.value = "73.93";
    sample.style.pointerEvents = "none";
    row.appendChild(sample);
    drawSample();

    return output;
};
// Options
FlexmonsterToolbar.prototype.showOptionsDialog = function () {
    var self = this;
    var Labels = this.Labels;
    var applyHandler = function () {
        var showGrandTotals;
        if (offRowsColsCbx.checked) {
            showGrandTotals = "off";
        } else if (onRowsColsCbx.checked) {
            showGrandTotals = "on";
        } else if (onRowsCbx.checked) {
            showGrandTotals = "rows";
        } else if (onColsCbx.checked) {
            showGrandTotals = "columns";
        }
        var showTotals;
        if (offSubtotalsCbx.checked) {
            showTotals = "off";
        } else if (onSubtotalsCbx.checked) {
            showTotals = "on";
        } else if (rowsSubtotalsCbx.checked) {
            showTotals = "rows";
        } else if (colsSubtotalsCbx.checked) {
            showTotals = "columns";
        }
        var gridType = "compact";
        if (classicViewCbx && classicViewCbx.checked) {
            gridType = "classic";
        } else if (flatViewCbx && flatViewCbx.checked) {
            gridType = "flat";
        }

        var options = self.pivot.getOptions();
        var currentViewType = options["viewType"];
        var currentType = options["grid"]["type"];

        var options = {
            grid: {
                showGrandTotals: showGrandTotals,
                showTotals: showTotals,
                type: gridType
            }
        };
        options.viewType = (currentType != gridType && currentViewType == "charts") ? "grid" : currentViewType;

        self.pivot.setOptions(options);
        self.pivot.refresh();
    }
    var dialog = this.popupManager.createPopup();
    dialog.content.id = "fm-popup-options";
    dialog.setTitle(this.osUtils.isMobile ? Labels.options : Labels.layout_options);
    dialog.setToolbar([
        { id: "fm-btn-apply", label: Labels.apply, handler: applyHandler, isPositive: true },
        { id: "fm-btn-cancel", label: Labels.cancel }
    ], true);

    var content = document.createElement("div");
    content.classList.add("fm-popup-content");

    var row = document.createElement("div");
    row.classList.add("fm-ui-row");
    content.appendChild(row);

    var col = document.createElement("div");
    col.classList.add("fm-ui-col-2");
    row.appendChild(col);

    // grand totals
    var title = document.createElement("div");
    title.classList.add("fm-title-2");
    self.setText(title, Labels.grand_totals);
    col.appendChild(title);

    var grandTotalsGroup = "fm-grand-totals-" + Date.now();
    var list = document.createElement("ul");
    list.classList.add("fm-radiobtn-list");
    col.appendChild(list);

    // grand totals - off
    var item = document.createElement("li");
    var itemWrap = document.createElement("div");
    itemWrap.classList.add("fm-radio-wrap");
    var offRowsColsCbx = document.createElement("input");
    offRowsColsCbx.type = "radio";
    offRowsColsCbx.name = grandTotalsGroup;
    offRowsColsCbx.id = "fm-gt-1";
    offRowsColsCbx.value = "off";
    itemWrap.appendChild(offRowsColsCbx);
    var label = document.createElement("label");
    label.setAttribute("for", "fm-gt-1");
    self.setText(label, Labels.grand_totals_off);
    itemWrap.appendChild(label);
    item.appendChild(itemWrap);
    list.appendChild(item);

    // grand totals - on
    var item = document.createElement("li");
    var itemWrap = document.createElement("div");
    itemWrap.classList.add("fm-radio-wrap");
    var onRowsColsCbx = document.createElement("input");
    onRowsColsCbx.type = "radio";
    onRowsColsCbx.name = grandTotalsGroup;
    onRowsColsCbx.id = "fm-gt-2";
    onRowsColsCbx.value = "on";
    itemWrap.appendChild(onRowsColsCbx);
    var label = document.createElement("label");
    label.setAttribute("for", "fm-gt-2");
    self.setText(label, Labels.grand_totals_on);
    itemWrap.appendChild(label);
    item.appendChild(itemWrap);
    list.appendChild(item);

    // grand totals - on rows
    var item = document.createElement("li");
    var itemWrap = document.createElement("div");
    itemWrap.classList.add("fm-radio-wrap");
    var onRowsCbx = document.createElement("input");
    onRowsCbx.type = "radio";
    onRowsCbx.name = grandTotalsGroup;
    onRowsCbx.id = "fm-gt-3";
    onRowsCbx.value = "rows";
    itemWrap.appendChild(onRowsCbx);
    var label = document.createElement("label");
    label.setAttribute("for", "fm-gt-3");
    self.setText(label, Labels.grand_totals_on_rows);
    itemWrap.appendChild(label);
    item.appendChild(itemWrap);
    list.appendChild(item);

    // grand totals - on cols
    var item = document.createElement("li");
    var itemWrap = document.createElement("div");
    itemWrap.classList.add("fm-radio-wrap");
    var onColsCbx = document.createElement("input");
    onColsCbx.type = "radio";
    onColsCbx.name = grandTotalsGroup;
    onColsCbx.id = "fm-gt-4";
    onColsCbx.value = "rows";
    itemWrap.appendChild(onColsCbx);
    var label = document.createElement("label");
    label.setAttribute("for", "fm-gt-4");
    self.setText(label, Labels.grand_totals_on_columns);
    itemWrap.appendChild(label);
    item.appendChild(itemWrap);
    list.appendChild(item);

    // layout
    var title = document.createElement("div");
    title.classList.add("fm-title-2");
    self.setText(title, Labels.layout);
    col.appendChild(title);

    var layoutGroup = "fm-layout-" + Date.now();
    var list = document.createElement("ul");
    list.classList.add("fm-radiobtn-list");
    col.appendChild(list);

    // layout - compact
    var item = document.createElement("li");
    var itemWrap = document.createElement("div");
    itemWrap.classList.add("fm-radio-wrap");
    var compactViewCbx = document.createElement("input");
    compactViewCbx.type = "radio";
    compactViewCbx.name = layoutGroup;
    compactViewCbx.id = "fm-lt-1";
    compactViewCbx.value = "compact";
    itemWrap.appendChild(compactViewCbx);
    var label = document.createElement("label");
    label.setAttribute("for", "fm-lt-1");
    self.setText(label, Labels.compact_view);
    itemWrap.appendChild(label);
    item.appendChild(itemWrap);
    list.appendChild(item);

    // layout - classic
    var item = document.createElement("li");
    var itemWrap = document.createElement("div");
    itemWrap.classList.add("fm-radio-wrap");
    var classicViewCbx = document.createElement("input");
    classicViewCbx.type = "radio";
    classicViewCbx.name = layoutGroup;
    classicViewCbx.id = "fm-lt-2";
    classicViewCbx.value = "classic";
    itemWrap.appendChild(classicViewCbx);
    var label = document.createElement("label");
    label.setAttribute("for", "fm-lt-2");
    self.setText(label, Labels.classic_view);
    itemWrap.appendChild(label);
    item.appendChild(itemWrap);
    list.appendChild(item);

    var options = self.pivot.getReport({ withDefaults: true, withGlobals: true });

    if (options != null && options.hasOwnProperty("dataSource")
        && !(options["dataSource"]["dataSourceType"] == "microsoft analysis services"
            || options["dataSource"]["dataSourceType"] == "mondrian"
            || options["dataSource"]["dataSourceType"] == "iccube")) {

        // layout - flat
        var item = document.createElement("li");
        var itemWrap = document.createElement("div");
        itemWrap.classList.add("fm-radio-wrap");
        var flatViewCbx = document.createElement("input");
        flatViewCbx.type = "radio";
        flatViewCbx.name = layoutGroup;
        flatViewCbx.id = "fm-lt-3";
        flatViewCbx.value = "flat";
        itemWrap.appendChild(flatViewCbx);
        var label = document.createElement("label");
        label.setAttribute("for", "fm-lt-3");
        self.setText(label, Labels.flat_view);
        itemWrap.appendChild(label);
        item.appendChild(itemWrap);
        list.appendChild(item);
    }

    var col = document.createElement("div");
    col.classList.add("fm-ui-col-2");
    row.appendChild(col);

    // subtotals
    var title = document.createElement("div");
    title.classList.add("fm-title-2");
    self.setText(title, Labels.subtotals);
    col.appendChild(title);

    var subTotalsGroup = "fm-subtotals-" + Date.now();
    var list = document.createElement("ul");
    list.classList.add("fm-radiobtn-list");
    col.appendChild(list);

    // subtotals - off
    var item = document.createElement("li");
    var itemWrap = document.createElement("div");
    itemWrap.classList.add("fm-radio-wrap");
    var offSubtotalsCbx = document.createElement("input");
    offSubtotalsCbx.type = "radio";
    offSubtotalsCbx.name = subTotalsGroup;
    offSubtotalsCbx.id = "fm-st-1";
    offSubtotalsCbx.value = "off";
    itemWrap.appendChild(offSubtotalsCbx);
    var label = document.createElement("label");
    label.setAttribute("for", "fm-st-1");
    self.setText(label, Labels.subtotals_off);
    itemWrap.appendChild(label);
    item.appendChild(itemWrap);
    list.appendChild(item);

    // subtotals - on
    var item = document.createElement("li");
    var itemWrap = document.createElement("div");
    itemWrap.classList.add("fm-radio-wrap");
    var onSubtotalsCbx = document.createElement("input");
    onSubtotalsCbx.type = "radio";
    onSubtotalsCbx.name = subTotalsGroup;
    onSubtotalsCbx.id = "fm-st-2";
    onSubtotalsCbx.value = "on";
    itemWrap.appendChild(onSubtotalsCbx);
    var label = document.createElement("label");
    label.setAttribute("for", "fm-st-2");
    self.setText(label, Labels.subtotals_on);
    itemWrap.appendChild(label);
    item.appendChild(itemWrap);
    list.appendChild(item);

    // subtotals - rows
    var item = document.createElement("li");
    var itemWrap = document.createElement("div");
    itemWrap.classList.add("fm-radio-wrap");
    var rowsSubtotalsCbx = document.createElement("input");
    rowsSubtotalsCbx.type = "radio";
    rowsSubtotalsCbx.name = subTotalsGroup;
    rowsSubtotalsCbx.id = "fm-st-3";
    rowsSubtotalsCbx.value = "rows";
    itemWrap.appendChild(rowsSubtotalsCbx);
    var label = document.createElement("label");
    label.setAttribute("for", "fm-st-3");
    self.setText(label, Labels.subtotals_on_rows);
    itemWrap.appendChild(label);
    item.appendChild(itemWrap);
    list.appendChild(item);

    // subtotals - columns
    var item = document.createElement("li");
    var itemWrap = document.createElement("div");
    itemWrap.classList.add("fm-radio-wrap");
    var colsSubtotalsCbx = document.createElement("input");
    colsSubtotalsCbx.type = "radio";
    colsSubtotalsCbx.name = subTotalsGroup;
    colsSubtotalsCbx.id = "fm-st-4";
    colsSubtotalsCbx.value = "columns";
    itemWrap.appendChild(colsSubtotalsCbx);
    var label = document.createElement("label");
    label.setAttribute("for", "fm-st-4");
    self.setText(label, Labels.subtotals_on_columns);
    itemWrap.appendChild(label);
    item.appendChild(itemWrap);
    list.appendChild(item);
	
    dialog.setContent(content);
    this.popupManager.addPopup(dialog.content);

    var options = self.pivot.getOptions() || {};
    var optionsGrid = options.grid || {};

    if (optionsGrid.showGrandTotals == "off" || optionsGrid.showGrandTotals == false) {
        offRowsColsCbx.checked = true;
    } else if (optionsGrid.showGrandTotals == "on" || optionsGrid.showGrandTotals == true) {
        onRowsColsCbx.checked = true;
    } else if (optionsGrid.showGrandTotals == "rows") {
        onRowsCbx.checked = true;
    } else if (optionsGrid.showGrandTotals == "columns") {
        onColsCbx.checked = true;
    }

    if (optionsGrid.showTotals == "off") {
        offSubtotalsCbx.checked = true;
    } else if (optionsGrid.showTotals == "on") {
        onSubtotalsCbx.checked = true;
    } else if (optionsGrid.showTotals == "rows") {
        rowsSubtotalsCbx.checked = true;
    } else if (optionsGrid.showTotals == "columns") {
        colsSubtotalsCbx.checked = true;
    }

    if (optionsGrid.type == "flat" && flatViewCbx) {
        flatViewCbx.checked = true;
    } else if (optionsGrid.type == "classic" && classicViewCbx) {
        classicViewCbx.checked = true;
    } else if (compactViewCbx) {
        compactViewCbx.checked = true;
    }
}
// Export to PDF
FlexmonsterToolbar.prototype.showExportPdfDialog = function () {
    var self = this;
    var Labels = this.Labels;
    var applyHandler = function () {
        var orientation = "portrait";
        if (landscapeRadio.checked) {
            orientation = "landscape";
        }
        self.pivot.exportTo('pdf', { pageOrientation: orientation });
    }
    var dialog = this.popupManager.createPopup();
    dialog.setTitle(Labels.choose_page_orientation);
    dialog.setToolbar([
        { id: "fm-btn-apply", label: Labels.apply, handler: applyHandler, isPositive: true },
        { id: "fm-btn-cancel", label: Labels.cancel }
    ]);

    var content = document.createElement("div");

    var list = document.createElement("ul");
    list.classList.add("fm-radiobtn-list");
    content.appendChild(list);

    // portrait
    var item = document.createElement("li");
    list.appendChild(item);
    var wrap = document.createElement("div");
    wrap.classList.add("fm-radio-wrap");
    item.appendChild(wrap);

    var portraitRadio = document.createElement("input");
    portraitRadio.id = "fm-portrait-radio";
    portraitRadio.type = "radio";
    portraitRadio.name = "fm-pdf-orientation";
    portraitRadio.checked = true;
    wrap.appendChild(portraitRadio);

    var label = document.createElement("label");
    label.setAttribute("for", "fm-portrait-radio");
    self.setText(label, Labels.portrait);
    wrap.appendChild(label);

    // landscape
    var item = document.createElement("li");
    list.appendChild(item);
    var wrap = document.createElement("div");
    wrap.classList.add("fm-radio-wrap");
    item.appendChild(wrap);

    var landscapeRadio = document.createElement("input");
    landscapeRadio.id = "fm-landscape-radio";
    landscapeRadio.type = "radio";
    landscapeRadio.name = "fm-pdf-orientation";
    wrap.appendChild(landscapeRadio);

    var label = document.createElement("label");
    label.setAttribute("for", "fm-landscape-radio");
    self.setText(label, Labels.landscape);
    wrap.appendChild(label);

    dialog.setContent(content);
    this.popupManager.addPopup(dialog.content);
}

// Fullscreen
FlexmonsterToolbar.prototype.toggleFullscreen = function () {
    this.isFullscreen() ? this.exitFullscreen() : this.enterFullscreen(this.container);
}
FlexmonsterToolbar.prototype.isFullscreen = function () {
    return document.fullScreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
}
FlexmonsterToolbar.prototype.enterFullscreen = function (element) {
    if (element.requestFullscreen || element.webkitRequestFullScreen
        || element.mozRequestFullScreen || (element.msRequestFullscreen && window == top)) {
        this.containerStyle = {
            width: this.container.style.width,
            height: this.container.style.height,
            position: this.container.style.position,
            top: this.container.style.top,
            bottom: this.container.style.bottom,
            left: this.container.style.left,
            right: this.container.style.right,
            marginTop: this.container.style.marginTop,
            marginLeft: this.container.style.marginLeft,
            toolbarWidth: this.toolbarWrapper.style.width
        };
        this.container.style.width = "100%";
        this.container.style.height = "100%";
        this.container.style.position = "fixed";
        this.container.style.top = 0 + "px";
        this.container.style.left = 0 + "px";

        this.toolbarWrapper.style.width = "100%";
        var fullScreenChangeHandler = null;

        if (element.requestFullscreen) {
            element.requestFullscreen();

            fullScreenChangeHandler = function () {
                if (!window.screenTop && !window.screenY && !this.isFullscreen()) {
                    this.exitFullscreen();
                    element.removeEventListener("fullscreenchange", fullScreenChangeHandler);
                }
            }.bind(this);
            element.addEventListener("fullscreenchange", fullScreenChangeHandler , false);

        } else if (element.webkitRequestFullScreen) {
                var ua = navigator.userAgent;
                if ((ua.indexOf("Safari") > -1) && (ua.indexOf("Chrome") == -1)) {
                        element.webkitRequestFullScreen();
                } else {
                        element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                }

                fullScreenChangeHandler = function () {
                    if (!this.isFullscreen()) {
                        this.exitFullscreen();
                        element.removeEventListener("webkitfullscreenchange", fullScreenChangeHandler);
                    }
                }.bind(this);
                element.addEventListener("webkitfullscreenchange", fullScreenChangeHandler, false);


        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();

            fullScreenChangeHandler = function () {
                if (!this.isFullscreen()) {
                    this.exitFullscreen();
                    document.removeEventListener("mozfullscreenchange", fullScreenChangeHandler);
                }
            }.bind(this);

            document.addEventListener("mozfullscreenchange", fullScreenChangeHandler, false);


        } else if (element.msRequestFullscreen) { //IE 11

                if (window == top) {
                    element.msRequestFullscreen();

                    fullScreenChangeHandler = function () {
                        if (!this.isFullscreen()) {
                            this.exitFullscreen();
                            document.removeEventListener("MSFullscreenChange", fullScreenChangeHandler);
                        }
                    }.bind(this);
    
                    document.addEventListener("MSFullscreenChange", fullScreenChangeHandler, false);

                } else {
                    alert("Fullscreen mode in IE 11 is not currently supported while Pivot embeded in iframe.");
                }                
        }

        this.setText(document.querySelector("#fm-tab-fullscreen > a > span"), this.Labels.minimize);
        document.querySelector("#fm-tab-fullscreen > a > div").innerHTML = this.icons.minimize;
    }
}
FlexmonsterToolbar.prototype.exitFullscreen = function () {
    this.container.style.width = this.containerStyle.width;
    this.container.style.height = this.containerStyle.height;
    this.container.style.position = this.containerStyle.position;
    this.container.style.top = this.containerStyle.top;
    this.container.style.left = this.containerStyle.left;
    this.container.style.marginTop = this.containerStyle.marginTop;
    this.container.style.marginLeft = this.containerStyle.marginLeft;

    this.toolbarWrapper.style.width = this.containerStyle.toolbarWidth;
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.cancelFullscreen) {
        document.cancelFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullScreen) {
        document.webkitExitFullScreen();
    } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    } else if (document.msExitFullscreen) { //IE 11
        document.msExitFullscreen();
    }

    this.setText(document.querySelector("#fm-tab-fullscreen > a > span"), this.Labels.fullscreen);
    document.querySelector("#fm-tab-fullscreen > a > div").innerHTML = this.icons.fullscreen;

}

// PRIVATE API
FlexmonsterToolbar.prototype.nullOrUndefined = function (val) {
    return (typeof (val) === 'undefined' || val === null);
}
FlexmonsterToolbar.prototype.hasClass = function (elem, cls) {
    return elem.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}
FlexmonsterToolbar.prototype.addClass = function (elem, cls) {
    if (!this.hasClass(elem, cls)) {
        elem.className += " " + cls;
    }
}
FlexmonsterToolbar.prototype.removeClass = function (elem, cls) {
    if (this.hasClass(elem, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        elem.className = elem.className.replace(reg, ' ');
    }
}
FlexmonsterToolbar.prototype.setText = function (target, text) {
    if (!target) return;
    if (target.innerText !== undefined) {
        target.innerText = text;
    }
    if (target.textContent !== undefined) {
        target.textContent = text;
    }
}
FlexmonsterToolbar.prototype.createSelect = function () {
    var wrapper = document.createElement("div");
    wrapper.classList.add("fm-select");
    var select = document.createElement("select");
    wrapper.appendChild(select);
    wrapper.select = select;
    return wrapper;
}
FlexmonsterToolbar.prototype.createDivider = function (data) {
    var item = document.createElement("li");
    item.className = "fm-divider";
    return item;
}
FlexmonsterToolbar.prototype.createTab = function (data) {
    var tab = document.createElement("li");
    tab.id = data.id;
    var tabLink = document.createElement("a");
    if (data.hasOwnProperty("class_attr")) {
        tabLink.setAttribute("class", data.class_attr);
    }
    tabLink.setAttribute("href", "javascript:void(0)");

    if (data.icon) {
        var svgIcon = document.createElement("div");
        svgIcon.classList.add("fm-svg-icon");
        svgIcon.innerHTML = data.icon;
        tabLink.appendChild(svgIcon);
    }

    var title = document.createElement("span");
    this.setText(title, data.title);
    tabLink.appendChild(title);
    var _this = this;
    var _handler = typeof data.handler == "function" ? data.handler : this[data.handler];
    if (!this.nullOrUndefined(_handler)) {
        tabLink.onclick =
            function (handler, args) {
                return function () {
                    handler.call(_this, args);
                }
            }(_handler, data.args);
    }
    if (!this.nullOrUndefined(this[data.onShowHandler])) {
        tabLink.onmouseover =
            function (handler) {
                return function () {
                    handler.call(_this);
                }
            }(this[data.onShowHandler]);
    }
    tab.onmouseover = function () {
        _this.showDropdown(this);
    }
    tab.onmouseout = function () {
        _this.hideDropdown(this);
    }
    tab.appendChild(tabLink);
    if (data.menu != null && (!this.osUtils.isMobile || data.collapse == true)) {
        tab.appendChild(this.createTabMenu(data.menu));
    }
    return tab;
}
FlexmonsterToolbar.prototype.showDropdown = function (elem) {
    var menu = elem.querySelectorAll(".fm-dropdown")[0];
    if (menu) {
        menu.style.display = "block";
        if (menu.getBoundingClientRect().right > this.toolbarWrapper.getBoundingClientRect().right) {
            menu.style.right = 0;
            this.addClass(elem, "fm-align-rigth");
        }
    }
};
FlexmonsterToolbar.prototype.hideDropdown = function (elem) {
    var menu = elem.querySelectorAll(".fm-dropdown")[0];
    if (menu) {
        menu.style.display = "none";
        menu.style.right = null;
        this.removeClass(elem, "fm-align-rigth");
    }
};
FlexmonsterToolbar.prototype.createTabMenu = function (dataProvider) {
    var container = document.createElement("div");
    container.className = "fm-dropdown fm-shadow-container";
    var content = document.createElement("ul");
    content.className = "fm-dropdown-content";
    for (var i = 0; i < dataProvider.length; i++) {
        if (this.isDisabled(dataProvider[i])) continue;
        content.appendChild((dataProvider[i].divider) ? this.createMenuDivider() : this.createTab(dataProvider[i]));
    }
    container.appendChild(content);
    return container;
}
FlexmonsterToolbar.prototype.createMenuDivider = function () {
    var item = document.createElement("li");
    item.className = "fm-v-divider";
    return item;
}
FlexmonsterToolbar.prototype.isDisabled = function (data) {
    if (this.nullOrUndefined(data)) return true;
    return (data.ios === false && this.osUtils.isIOS) || (data.android === false && this.osUtils.isAndroid) || (data.mobile === false && this.osUtils.isMobile);
}
FlexmonsterToolbar.prototype.filterConnectMenu = function () {
    var menu = [];
    var Labels = this.Labels;
    if (this.dataSourceType == 1 || this.dataSourceType == 2) {
        menu.push({ title: Labels.connect_local_csv, id: "fm-tab-connect-local-csv", handler: this.connectLocalCSVHandler, mobile: false, icon: this.icons.connect_csv });
        menu.push({ title: Labels.connect_local_json, id: "fm-tab-connect-local-json", handler: this.connectLocalJSONHandler, mobile: false, icon: this.icons.connect_json });
        menu.push({ title: this.osUtils.isMobile ? Labels.connect_remote_csv_mobile : Labels.connect_remote_csv, id: "fm-tab-connect-remote-csv", handler: this.connectRemoteCSV, icon: this.icons.connect_csv });
        menu.push({ title: this.osUtils.isMobile ? Labels.connect_remote_json_mobile : Labels.connect_remote_json, id: "fm-tab-connect-remote-json", handler: this.connectRemoteJSON, icon: this.icons.connect_json });
    } else if (this.dataSourceType == 3 || this.dataSourceType == 4) {
        menu.push({ title: this.osUtils.isMobile ? Labels.connect_olap_mobile : Labels.connect_olap, id: "fm-tab-connect-olap", handler: this.connectOLAP, flat: false, icon: this.icons.connect_olap });
    }
    if (this.dataSourceType != 0 && this.dataProvider[0] && this.dataProvider[0].id == "fm-tab-connect") {
        this.dataProvider[0]["menu"] = menu;
    }
}
FlexmonsterToolbar.prototype.updateDataSourceType = function (dataType) {
    this.dataSourceType = dataType || 5;
    if (this.dataSourceType != 5 && this.dataProvider[0] && this.dataProvider[0].id == "fm-tab-connect") {
        this.filterConnectMenu();
        if (!this.osUtils.isMobile) {
            var connect = this.pivotContainer.querySelector("#fm-tab-connect");
            var open = this.pivotContainer.querySelector("#fm-tab-open");
            this.toolbarWrapper.firstChild.firstChild.removeChild(connect ? connect : this.toolbarWrapper.firstChild.firstChild.firstChild.nextSibling);
            this.toolbarWrapper.firstChild.firstChild.insertBefore(this.createTab(this.dataProvider[0]), open ? document.getElementById("fm-tab-open") : this.toolbarWrapper.firstChild.firstChild.firstChild.nextSibling);
        } else {
            var elemList = ["#fm-tab-connect-remote-csv", "#fm-tab-connect-remote-json", "#fm-tab-connect-olap"];
            for (var i = 0; i < elemList.length; i++) {
                var elem = this.pivotContainer.querySelector(elemList[i]);
                if (elem) {
                    this.toolbarWrapper.firstChild.firstChild.removeChild(elem);
                }
            }
            var filterList = this.dataProvider[0].menu;
            for (var i = filterList.length - 1; i >= 0; i--) {
                if (!filterList[i].hasOwnProperty("mobile") || filterList[i].mobile) {
                    this.toolbarWrapper.firstChild.firstChild.insertBefore(this.createTab(filterList[i]), this.toolbarWrapper.firstChild.firstChild.firstChild);
                }
            }
        }
    }
}
FlexmonsterToolbar.prototype.getElementById = function (id, parent) {
    var find = function (node, id) {
        for (var i = 0; i < node.childNodes.length; i++) {
            var child = node.childNodes[i];
            if (child.id == id) {
                return child;
            } else {
                var res = find(child, id);
            }
            if (res != null) {
                return res;
            }
        }
        return null;
    };
    return find(parent || this.toolbarWrapper, id);
}

FlexmonsterToolbar.prototype.osUtils = {
    isIOS: navigator.userAgent.match(/iPhone|iPad|iPod/i) || navigator.platform.match(/iPhone|iPad|iPod/i) ? true : false,
    isMac: /Mac/i.test(navigator.platform),
    isAndroid: navigator.userAgent.match(/Android/i) ? true : false,
    isBlackBerry: /BlackBerry/i.test(navigator.platform),
    isMobile: navigator.userAgent.match(/iPhone|iPad|iPod/i) || navigator.platform.match(/iPhone|iPad|iPod/i) || navigator.userAgent.match(/Android/i) || /BlackBerry/i.test(navigator.platform)
};
FlexmonsterToolbar.PopupManager = function (toolbar) {
    this.toolbar = toolbar;
    this.activePopup = null;
}
FlexmonsterToolbar.PopupManager.prototype.createPopup = function () {
    return new FlexmonsterToolbar.PopupManager.PopupWindow(this);
};
FlexmonsterToolbar.PopupManager.prototype.addPopup = function (popup) {
    if (popup == null) return;
    this.removePopup();
    this.modalOverlay = this.createModalOverlay();
    this.activePopup = popup;
    this.toolbar.toolbarWrapper.appendChild(popup);
    this.toolbar.toolbarWrapper.appendChild(this.modalOverlay);
    this.addLayoutClasses(popup);
    this.centerPopup(popup);
    var _this = this;
    popup.resizeHandler = function () {
        if (!popup) return;
        _this.addLayoutClasses(popup);
        _this.centerPopup(popup);
    };
    window.addEventListener("resize", popup.resizeHandler);
};
FlexmonsterToolbar.PopupManager.prototype.addLayoutClasses = function (popup) {
    popup.classList.remove("fm-layout-tablet");
    popup.classList.remove("fm-layout-mobile");
    popup.classList.remove("fm-layout-mobile-small");
    var rect = this.getBoundingRect(this.toolbar.container);
    if (rect.width < 768) {
        popup.classList.add("fm-layout-tablet");
    }
    if (rect.width < 580) {
        popup.classList.add("fm-layout-mobile");
    }
    if (rect.width < 460) {
        popup.classList.add("fm-layout-mobile-small");
    }
};
FlexmonsterToolbar.PopupManager.prototype.centerPopup = function (popup) {
    var containerRect = this.getBoundingRect(this.toolbar.container);
    var popupRect = this.getBoundingRect(popup);
    var toolbarRect = this.getBoundingRect(this.toolbar.toolbarWrapper);
    popup.style.zIndex = parseInt(this.modalOverlay.style.zIndex) + 1;
    //this.modalOverlay.style.top = toolbarRect.height + "px";
    this.modalOverlay.style.height = containerRect.height /*- toolbarRect.height*/ + "px";
    popup.style.left = Math.max(0, (toolbarRect.width - popupRect.width) / 2) + "px";
    popup.style.top = Math.max(toolbarRect.height, (containerRect.height - toolbarRect.height - popupRect.height) / 2 + toolbarRect.height) + "px";
};
FlexmonsterToolbar.PopupManager.prototype.removePopup = function (popup) {
    var popup = (popup || this.activePopup);
    if (this.modalOverlay != null) {
        this.toolbar.toolbarWrapper.removeChild(this.modalOverlay);
        this.modalOverlay = null;
    }
    if (popup != null) {
        this.toolbar.toolbarWrapper.removeChild(popup);
        this.activePopup = null;
        window.removeEventListener("resize", popup.resizeHandler);
    }
};
FlexmonsterToolbar.PopupManager.prototype.getBoundingRect = function (target) {
    var rect = target.getBoundingClientRect();
    return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width || target.clientWidth,
        height: rect.height || target.clientHeight
    };
};
FlexmonsterToolbar.PopupManager.prototype.createModalOverlay = function () {
    var modalOverlay = document.createElement("div");
    modalOverlay.className = "fm-modal-overlay";
    modalOverlay.id = "fm-popUp-modal-overlay";
    var _this = this;
    modalOverlay.addEventListener('click', function (e) {
        _this.removePopup(_this.activePopup);
    });
    return modalOverlay;
};
FlexmonsterToolbar.PopupManager.PopupWindow = function (popupManager) {
    this.popupManager = popupManager;
    var contentPanel = document.createElement("div");
    contentPanel.className = "fm-panel-content";
    var titleBar = document.createElement("div");
    titleBar.className = "fm-title-bar";
    var titleLabel = document.createElement("div");
    titleLabel.className = "fm-title-text";
    var toolbar = document.createElement("div");
    toolbar.className = "fm-toolbox";
    toolbar.style.clear = "both";
    this.content = document.createElement("div");
    this.content.className = "fm-popup fm-panel fm-toolbar-ui fm-ui";
    this.content.appendChild(contentPanel);
    contentPanel.appendChild(titleBar);
    titleBar.appendChild(titleLabel);

    this.setTitle = function (title) {
        FlexmonsterToolbar.prototype.setText(titleLabel, title);
    }
    this.setContent = function (content) {
        contentPanel.insertBefore(content, titleBar.nextSibling);
    }
    var _this = this;
    this.setToolbar = function (buttons, toHeader) {
        toolbar.innerHTML = "";
        for (var i = buttons.length - 1; i >= 0; i--) {
            var button = document.createElement("a");
            button.setAttribute("href", "javascript:void(0)");
            button.className = "fm-ui-btn" + (buttons[i].isPositive ? " fm-ui-btn-dark" : "");
            if (buttons[i].id) button.id = buttons[i].id;
            FlexmonsterToolbar.prototype.setText(button, buttons[i].label);
            button.onclick =
                function (handler) {
                    return function () {
                        if (handler != null) {
                            handler.call();
                        }
                        _this.popupManager.removePopup();
                    }
                }(buttons[i].handler);
            if (buttons[i].disabled === true) {
                FlexmonsterToolbar.prototype.addClass(button, "fm-ui-disabled");
            } else {
                FlexmonsterToolbar.prototype.removeClass(button, "fm-ui-disabled");
            }
            if (buttons[i].isPositive && (FlexmonsterToolbar.prototype.osUtils.isMac || FlexmonsterToolbar.prototype.osUtils.isIOS)) {
                toolbar.appendChild(button);
            } else {
                toolbar.insertBefore(button, toolbar.firstChild);
            }
        }
        if (toHeader) {
            toolbar.classList.add("fm-ui-col");
            titleBar.appendChild(toolbar);
            titleBar.classList.add("fm-ui-row");
            titleLabel.classList.add("fm-ui-col");
        } else {
            contentPanel.appendChild(toolbar);
        }
    }
    this.toolbar = toolbar;
    this.titleBar = titleBar;
    this.title = titleLabel;
    return this;
};
FlexmonsterToolbar.ColorPicker = function (toolbar, popupContainer) {
    this.toolbar = toolbar;

    this.element = document.createElement("div");
    this.element.classList.add("fm-colorpick-wrap");
    this.element.classList.add("fm-width40");

    this.colorPickerButton = document.createElement("div");
    this.colorPickerButton.classList.add("fm-colorpick-btn");
    this.element.appendChild(this.colorPickerButton);
    this.colorPickerIcon = document.createElement("span");
    this.colorPickerIcon.classList.add("fm-icon");
    this.colorPickerIcon.classList.add("fm-icon-act_font");
    this.colorPickerButton.appendChild(this.colorPickerIcon);

    this.popup = document.createElement('div');
    this.popup.classList.add("fm-colorpick-popup");
    this.popup.onclick = function (event) {
        event.stopPropagation();
    };
    popupContainer.appendChild(this.popup);

    var colorSwitch = document.createElement("div");
    colorSwitch.classList.add("fm-color-targ-switch");
    this.popup.appendChild(colorSwitch);

    var colorBtn = document.createElement("a");
    colorBtn.classList.add("fm-cts-item");
    colorBtn.classList.add("fm-current");
    colorBtn.href = "javascript:void(0);";
    colorBtn.innerHTML = toolbar.Labels.cp_text;
    colorBtn.onclick = function () { onSwitchChange('font'); };
    colorSwitch.appendChild(colorBtn);

    var bgColorBtn = document.createElement("a");
    bgColorBtn.classList.add("fm-cts-item");
    bgColorBtn.innerHTML = toolbar.Labels.cp_highlight;
    bgColorBtn.href = "javascript:void(0);";
    bgColorBtn.onclick = function () { onSwitchChange('bg'); };
    colorSwitch.appendChild(bgColorBtn);

    var row = document.createElement("div");
    row.classList.add("fm-cp-sett-row");
    this.popup.appendChild(row);

    this.colorInput = document.createElement("input");
    this.colorInput.type = "text";
    this.colorInput.classList.add("fm-inp");
    this.colorInput.classList.add("fm-width140");
    this.colorInput.classList.add("fm-tac");
    this.colorInput.onchange = onColorInputChanged;
    row.appendChild(this.colorInput);

    this.colorPreview = document.createElement("div");
    this.colorPreview.classList.add("fm-cp-curr-color");
    this.colorPreview.classList.add("fm-width140");
    row.appendChild(this.colorPreview);

    this.mainColors = document.createElement("div");
    this.mainColors.classList.add("fm-row-9colors");
    this.popup.appendChild(this.mainColors);
    for (var color in this.colors) {
        var item = document.createElement("div");
        item.classList.add("fm-r9c-item");
        item.style.backgroundColor = color;
        item.setAttribute('data-c', color);
        item.addEventListener('click', onMainColorClick);
        this.mainColors.appendChild(item);

        var check = document.createElement("span");
        check.classList.add("fm-cp-currentmark");
        check.classList.add("fm-icon");
        check.classList.add("fm-icon-act_check");
        item.appendChild(check);

        var arrow = document.createElement("span");
        arrow.classList.add("fm-r9c-arrow");
        arrow.style.borderTopColor = color;
        item.appendChild(arrow);
    }

    this.shadeColors = document.createElement("div");
    this.shadeColors.classList.add("fm-row-4colors");
    this.popup.appendChild(this.shadeColors);
    for (var i = 0; i < 8; i++) {
        var item = document.createElement("div");
        item.classList.add("fm-r4c-item");
        item.addEventListener('click', onColorClick);
        this.shadeColors.appendChild(item);

        var check = document.createElement("span");
        check.classList.add("fm-cp-currentmark");
        check.classList.add("fm-icon");
        check.classList.add("fm-icon-act_check");
        item.appendChild(check);
    }
    this.drawShades(this.colors['#000000']);

    var row = document.createElement("div");
    row.classList.add("fm-cp-btns-row");
    this.popup.appendChild(row);

    var applyBtn = document.createElement("a");
    applyBtn.innerHTML = toolbar.Labels.apply;
    applyBtn.classList.add("fm-ui-btn");
    applyBtn.classList.add("fm-ui-btn-dark");
    applyBtn.addEventListener("click", onApplyClick);

    var cancelBtn = document.createElement("a");
    cancelBtn.innerHTML = toolbar.Labels.cancel;
    cancelBtn.classList.add("fm-ui-btn");
    cancelBtn.addEventListener("click", onCancelClick);

    if (FlexmonsterToolbar.prototype.osUtils.isMac || FlexmonsterToolbar.prototype.osUtils.isIOS) {
        row.appendChild(cancelBtn);
        row.appendChild(applyBtn);
    } else {
        row.appendChild(applyBtn);
        row.appendChild(cancelBtn);
    }

    this.currentType = "font";

    this.colorPickerButton.addEventListener('click', onColorButtonClick);
    document.body.addEventListener('click', onBodyClick);

    var _this = this;

    function onBodyClick(event) {
        onCancelClick();
    }

    function onColorButtonClick(event) {
        event.stopPropagation();
        if (_this.isOpened()) {
            _this.closePopup();
        } else {
            _this.openPopup();
        }
    }

    function onMainColorClick(event) {
        var color = event.target.getAttribute('data-c');
        _this.drawShades(_this.colors[color]);
        _this.setColor(color, _this.currentType, true);
    }

    function onColorClick(event) {
        var color = event.target.getAttribute('data-c');
        _this.setColor(color, _this.currentType, true);
    }

    function onSwitchChange(type) {
        _this.currentType = type;
        colorBtn.classList.remove("fm-current");
        bgColorBtn.classList.remove("fm-current");
        if (type == "bg") {
            bgColorBtn.classList.add("fm-current");
            _this.setColor(_this.backgroundColor, type, false);
        } else {
            colorBtn.classList.add("fm-current");
            _this.setColor(_this.fontColor, type, false);
        }
    }

    function onColorInputChanged() {
        var color = _this.colorInput.value;
        if (_this.isColor(color)) {
            _this.setColor(color, _this.currentType, true);
        }
    }

    function onApplyClick() {
        _this.closePopup();
        if (_this.applyHandler) {
            _this.applyHandler();
        }
    }

    function onCancelClick() {
        _this.closePopup();
        if (_this.cancelHandler) {
            _this.cancelHandler();
        }
    }
}
FlexmonsterToolbar.ColorPicker.prototype.colors = {
    '#000000': ["#000000", "#212121", "#424242", "#616161", "#757575", "#9E9E9E", "#BDBDBD", "#FFFFFF"],
    '#F44336': ["#D32F2F", "#E53935", "#F44336", "#EF5350", "#E57373", "#EF9A9A", "#FFCDD2", "#FFEBEE"],
    '#FF9800': ["#F57C00", "#FB8C00", "#FF9800", "#FFA726", "#FFB74D", "#FFCC80", "#FFE0B2", "#FFF3E0"],
    '#FFEB3B': ["#FBC02D", "#FDD835", "#FFEB3B", "#FFEE58", "#FFF176", "#FFF59D", "#FFF9C4", "#FFFDE7"],
    '#8BC34A': ["#689F38", "#7CB342", "#8BC34A", "#9CCC65", "#AED581", "#C5E1A5", "#DCEDC8", "#F1F8E9"],
    '#009688': ["#00796B", "#00897B", "#009688", "#26A69A", "#4DB6AC", "#80CBC4", "#B2DFDB", "#E0F2F1"],
    '#03A9F4': ["#0288D1", "#039BE5", "#03A9F4", "#29B6F6", "#4FC3F7", "#81D4FA", "#B3E5FC", "#E1F5FE"],
    '#3F51B5': ["#303F9F", "#3949AB", "#3F51B5", "#5C6BC0", "#7986CB", "#9FA8DA", "#C5CAE9", "#E8EAF6"],
    '#9C27B0': ["#7B1FA2", "#8E24AA", "#9C27B0", "#AB47BC", "#BA68C8", "#CE93D8", "#E1BEE7", "#F3E5F5"],
};
FlexmonsterToolbar.ColorPicker.prototype.isOpened = function () {
    return this.popup.parentElement && this.popup.parentElement.classList.contains("fm-popup-opened");
};
FlexmonsterToolbar.ColorPicker.prototype.drawShades = function (colors) {
    if (!colors) {
        return;
    }
    var children = this.shadeColors.children;
    for (var i = 0; i < children.length; i++) {
        var item = children[i];
        item.setAttribute('data-c', colors[i]);
        item.style.backgroundColor = colors[i];
        item.style.borderRight = colors[i] == "#FFFFFF" ? "1px solid #d5d5d5" : 'none';
        item.style.borderBottom = colors[i] == "#FFFFFF" ? "1px solid #d5d5d5" : 'none';
    }
};
FlexmonsterToolbar.ColorPicker.prototype.setColor = function (colorValue, type, dispatch) {
    if (typeof colorValue === "string" && colorValue.indexOf("0x") == 0) {
        colorValue = "#" + colorValue.substr(2);
    }
    if (type == "bg") {
        this.backgroundColor = colorValue;
        this.colorPickerButton.style.backgroundColor = colorValue;
    } else {
        this.fontColor = colorValue;
        this.colorPickerIcon.style.color = colorValue;
    }
    this.colorInput.value = colorValue;
    this.colorPreview.style.backgroundColor = colorValue;
    this.drawSelected();

    if (dispatch && this.changeHandler) {
        this.changeHandler();
    }
};
FlexmonsterToolbar.ColorPicker.prototype.drawSelected = function () {
    var color = this.currentType == "bg" ? this.backgroundColor : this.fontColor;
    var mainColor = this.findMain(color);

    this.drawShades(this.colors[mainColor]);

    var children = this.mainColors.children;
    for (var i = 0; i < children.length; i++) {
        children[i].classList.remove("fm-current");
    }
    var mainSelected = this.mainColors.querySelector("[data-c='" + mainColor + "']");
    if (mainSelected) {
        mainSelected.classList.add("fm-current");
    }

    children = this.shadeColors.children;
    for (var i = 0; i < children.length; i++) {
        children[i].classList.remove("fm-current");
    }
    var shadeSelected = this.shadeColors.querySelector("[data-c='" + color + "']");
    if (shadeSelected) {
        shadeSelected.classList.add("fm-current");
    }
};
FlexmonsterToolbar.ColorPicker.prototype.findMain = function (color) {
    if (typeof color === "string" && color.indexOf("0x") == 0) {
        color = "#" + color.substr(2);
    }
    for (var mainColor in this.colors) {
        var colors = this.colors[mainColor];
        if (colors.indexOf(color) >= 0) {
            return mainColor;
        }
    }
};
FlexmonsterToolbar.ColorPicker.prototype.isColor = function (value) {
    return value.match(/^#?[0-9A-Fa-f]{6}$/g);
}
FlexmonsterToolbar.ColorPicker.prototype.closePopup = function () {
    if (!this.popup.parentElement) {
        return;
    }
    this.popup.parentElement.classList.remove("fm-popup-opened");
}
FlexmonsterToolbar.ColorPicker.prototype.openPopup = function () {
    // close others
    var openedPopups = this.toolbar.toolbarWrapper.querySelectorAll('.fm-colorpick-popup');
    for (var i = 0; i < openedPopups.length; i++) {
        openedPopups[i].parentElement.classList.remove("fm-popup-opened");
    }
    if (!this.popup.parentElement) {
        return;
    }
    // open current
    this.popup.parentElement.classList.add("fm-popup-opened");
    var parent = this.toolbar.toolbarWrapper.querySelector("#fm-popup-conditional .fm-panel-content");
    var pos = this.getWhere(this.colorPickerButton, parent);
    var posAbs = this.getWhere(this.colorPickerButton, document.body);
    if (posAbs.top - this.popup.clientHeight < 0) {
        this.popup.classList.remove("fm-arrow-down");
        this.popup.classList.add("fm-arrow-up");
        this.popup.style.top = (this.colorPickerButton.clientHeight + pos.top + 11) + 'px';
        this.popup.style.bottom = "";
    } else {
        this.popup.classList.add("fm-arrow-down");
        this.popup.classList.remove("fm-arrow-up");
        this.popup.style.bottom = (parent.clientHeight - pos.top + 5) + 'px';
        this.popup.style.top = "";
    }
    this.popup.style.left = (pos.left + (this.colorPickerButton.clientWidth / 2) + 2) + 'px';
}
FlexmonsterToolbar.ColorPicker.prototype.getWhere = function (el, parent) {
    var curleft = 0;
    var curtop = 0;
    var curtopscroll = 0;
    var curleftscroll = 0;
    if (el.offsetParent) {
        curleft = el.offsetLeft;
        curtop = el.offsetTop;
        var elScroll = el;
        while (elScroll = elScroll.parentNode) {
            if (elScroll == parent) {
                break;
            }
            curtopscroll = elScroll.scrollTop ? elScroll.scrollTop : 0;
            curleftscroll = 0;
            curleft -= curleftscroll;
            curtop -= curtopscroll;
        }
        while (el = el.offsetParent) {
            if (el == parent) {
                break;
            }
            curleft += el.offsetLeft;
            curtop += el.offsetTop;
        }
    }
    var isMSIE = /*@cc_on!@*/ 0;
    var offsetX = 0;// isMSIE ? document.body.scrollLeft : window.pageXOffset;
    var offsetY = 0;// isMSIE ? document.body.scrollTop : window.pageYOffset;
    return {
        top: curtop + offsetY,
        left: curleft + offsetX
    };
}
