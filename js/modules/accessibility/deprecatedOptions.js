/* *
 *
 *  (c) 2009-2019 Øystein Moseng
 *
 *  Default options for accessibility.
 *
 *  License: www.highcharts.com/license
 *
 * */

/* eslint-disable max-len */
/*
 *  List of deprecated options:
 *
 *  chart.description -> accessibility.description
 *  chart.typeDescription -> accessibility.typeDescription
 *  series.description -> series.accessibility.description
 *  series.exposeElementToA11y -> series.accessibility.exposeAsGroupOnly
 *  series.pointDescriptionFormatter ->
 *      series.accessibility.pointDescriptionFormatter
 *  series.skipKeyboardNavigation ->
 *      series.accessibility.keyboardNavigation.enabled
 *  point.description -> point.accessibility.description
 *  axis.description -> axis.accessibility.description
 *
 *  accessibility.pointDateFormat -> accessibility.point.dateFormat
 *  accessibility.addTableShortcut -> Handled by screenReaderSection.beforeChartFormat
 *  accessibility.pointDateFormatter -> accessibility.point.dateFormatter
 *  accessibility.pointDescriptionFormatter -> accessibility.point.descriptionFormatter
 *  accessibility.pointDescriptionThreshold -> accessibility.series.pointDescriptionEnabledThreshold
 *  accessibility.pointNavigationThreshold -> accessibility.keyboardNavigation.seriesNavigation.pointNavigationEnabledThreshold
 *  accessibility.pointValueDecimals -> accessibility.point.valueDecimals
 *  accessibility.pointValuePrefix -> accessibility.point.valuePrefix
 *  accessibility.pointValueSuffix -> accessibility.point.valueSuffix
 *  accessibility.screenReaderSectionFormatter -> accessibility.screenReaderSection.beforeChartFormatter
 *  accessibility.describeSingleSeries -> accessibility.series.describeSingleSeries
 *  accessibility.seriesDescriptionFormatter -> accessibility.series.descriptionFormatter
 *  accessibility.onTableAnchorClick -> accessibility.screenReaderSection.onViewDataTableClick
 *  accessibility.axisRangeDateFormat -> accessibility.screenReaderSection.axisRangeDateFormat
 *  accessibility.keyboardNavigation.skipNullPoints -> accessibility.keyboardNavigation.seriesNavigation.skipNullPoints
 *  accessibility.keyboardNavigation.mode -> accessibility.keyboardNavigation.seriesNavigation.mode
 *
 *  lang.accessibility.chartHeading -> no longer used, remove
 *  lang.accessibility.legendItem -> lang.accessibility.legend.legendItem
 *  lang.accessibility.legendLabel -> lang.accessibility.legend.legendLabel
 *  lang.accessibility.mapZoomIn -> lang.accessibility.zoom.mapZoomIn
 *  lang.accessibility.mapZoomOut -> lang.accessibility.zoom.mapZoomOut
 *  lang.accessibility.resetZoomButton -> lang.accessibility.zoom.resetZoomButton
 *  lang.accessibility.screenReaderRegionLabel -> lang.accessibility.screenReaderSection.beforeRegionLabel
 *  lang.accessibility.rangeSelectorButton -> lang.accessibility.rangeSelector.buttonText
 *  lang.accessibility.rangeSelectorMaxInput -> lang.accessibility.rangeSelector.maxInputLabel
 *  lang.accessibility.rangeSelectorMinInput -> lang.accessibility.rangeSelector.minInputLabel
 *  lang.accessibility.svgContainerEnd -> lang.accessibility.screenReaderSection.endOfChartMarker
 *  lang.accessibility.viewAsDataTable -> lang.accessibility.table.viewAsDataTableButtonText
 *  lang.accessibility.tableSummary -> lang.accessibility.table.tableSummary
 *
 */
/* eslint-enable max-len */

'use strict';

import H from '../../parts/Globals.js';
import U from '../../parts/Utilities.js';
var pick = U.pick;

var error = H.error;

// Warn user that a deprecated option was used
function warn(chart, oldOption, newOption) {
    error(
        'Highcharts: Deprecated option ' + oldOption +
        ' used. This will be removed from future versions of Highcharts. Use ' +
        newOption + ' instead.', false, chart
    );
}

// Set a new option on a root prop, where the option is defined as
// an array of suboptions.
function traverseSetOption(root, optionAsArray, val) {
    var opt = root,
        prop,
        i = 0;
    for (;i < optionAsArray.length - 1; ++i) {
        prop = optionAsArray[i];
        opt = opt[prop] = pick(opt[prop], {});
    }
    opt[optionAsArray[optionAsArray.length - 1]] = val;
}

// If we have a clear root option node for old and new options and a mapping
// between, we can use this generic function for the copy and warn logic.
function deprecateFromOptionsMap(
    chart, rootOldAsArray, rootNewAsArray, mapToNewOptions
) {
    function getChildProp(root, propAsArray) {
        return propAsArray.reduce(function (acc, cur) {
            return acc[cur];
        }, root);
    }

    var rootOld = getChildProp(chart.options, rootOldAsArray),
        rootNew = getChildProp(chart.options, rootNewAsArray);

    Object.keys(mapToNewOptions).forEach(function (oldOptionKey) {
        var val = rootOld[oldOptionKey];
        if (val !== undefined) {
            traverseSetOption(
                rootNew,
                mapToNewOptions[oldOptionKey],
                val
            );
            warn(
                chart,
                rootOldAsArray.join('.') + '.' + oldOptionKey,
                rootNewAsArray.join('.') + '.' +
                mapToNewOptions[oldOptionKey].join('.')
            );
        }
    });
}


function copyDeprecatedChartOptions(chart) {
    var chartOptions = chart.options.chart || {},
        a11yOptions = chart.options.accessibility || {};
    ['description', 'typeDescription'].forEach(function (prop) {
        if (chartOptions[prop]) {
            a11yOptions[prop] = chartOptions[prop];
            warn(chart, 'chart.' + prop, 'accessibility.' + prop);
        }
    });
}

function copyDeprecatedAxisOptions(chart) {
    chart.axes.forEach(function (axis) {
        var opts = axis.options;
        if (opts && opts.description) {
            opts.accessibility = opts.accessibility || {};
            opts.accessibility.description = opts.description;
            warn(chart, 'axis.description', 'axis.accessibility.description');
        }
    });
}

function copyDeprecatedSeriesOptions(chart) {
    // Map of deprecated series options. New options are defined as
    // arrays of paths under series.options.
    var oldToNewSeriesOptions = {
        description: ['accessibility', 'description'],
        exposeElementToA11y: ['accessibility', 'exposeAsGroupOnly'],
        pointDescriptionFormatter: [
            'accessibility', 'pointDescriptionFormatter'
        ],
        skipKeyboardNavigation: [
            'accessibility', 'keyboardNavigation', 'enabled'
        ]
    };
    chart.series.forEach(function (series) {
        // Handle series wide options
        Object.keys(oldToNewSeriesOptions).forEach(function (oldOption) {
            var optionVal = series.options[oldOption];
            if (optionVal !== undefined) {
                // Set the new option
                traverseSetOption(
                    series.options,
                    oldToNewSeriesOptions[oldOption],
                    // Note that skipKeyboardNavigation has inverted option
                    // value, since we set enabled rather than disabled
                    oldOption === 'skipKeyboardNavigation' ?
                        !optionVal : optionVal
                );
                warn(
                    chart,
                    'series.' + oldOption, 'series.' +
                    oldToNewSeriesOptions[oldOption].join('.')
                );
            }
        });

        // Loop through the points and handle point.description
        if (series.points) {
            series.points.forEach(function (point) {
                if (point.options && point.options.description) {
                    point.options.accessibility =
                        point.options.accessibility || {};
                    point.options.accessibility.description =
                        point.options.description;
                    warn(chart, 'point.description',
                        'point.accessibility.description');
                }
            });
        }
    });
}

function copyDeprecatedTopLevelAccessibilityOptions(chart) {
    deprecateFromOptionsMap(
        chart,
        ['accessibility'],
        ['accessibility'],
        {
            pointDateFormat: ['point', 'dateFormat'],
            pointDateFormatter: ['point', 'dateFormatter'],
            pointDescriptionFormatter: ['point', 'descriptionFormatter'],
            pointDescriptionThreshold: ['series',
                'pointDescriptionEnabledThreshold'],
            pointNavigationThreshold: ['keyboardNavigation', 'seriesNavigation',
                'pointNavigationEnabledThreshold'],
            pointValueDecimals: ['point', 'valueDecimals'],
            pointValuePrefix: ['point', 'valuePrefix'],
            pointValueSuffix: ['point', 'valueSuffix'],
            screenReaderSectionFormatter: ['screenReaderSection',
                'beforeChartFormatter'],
            describeSingleSeries: ['series', 'describeSingleSeries'],
            seriesDescriptionFormatter: ['series', 'descriptionFormatter'],
            onTableAnchorClick: ['screenReaderSection', 'onViewDataTableClick'],
            axisRangeDateFormat: ['screenReaderSection', 'axisRangeDateFormat']
        }
    );
}

function copyDeprecatedKeyboardNavigationOptions(chart) {
    deprecateFromOptionsMap(
        chart,
        ['accessibility', 'keyboardNavigation'],
        ['accessibility', 'keyboardNavigation', 'seriesNavigation'],
        {
            skipNullPoints: ['skipNullPoints'],
            mode: ['mode']
        }
    );
}

function copyDeprecatedLangOptions(chart) {
    deprecateFromOptionsMap(
        chart,
        ['lang', 'accessibility'],
        ['lang', 'accessibility'],
        {
            legendItem: ['legend', 'legendItem'],
            legendLabel: ['legend', 'legendLabel'],
            mapZoomIn: ['zoom', 'mapZoomIn'],
            mapZoomOut: ['zoom', 'mapZoomOut'],
            resetZoomButton: ['zoom', 'resetZoomButton'],
            screenReaderRegionLabel: ['screenReaderSection',
                'beforeRegionLabel'],
            rangeSelectorButton: ['rangeSelector', 'buttonText'],
            rangeSelectorMaxInput: ['rangeSelector', 'maxInputLabel'],
            rangeSelectorMinInput: ['rangeSelector', 'minInputLabel'],
            svgContainerEnd: ['screenReaderSection', 'endOfChartMarker'],
            viewAsDataTable: ['table', 'viewAsDataTableButtonText'],
            tableSummary: ['table', 'tableSummary']
        }
    );
}


/**
 * Copy options that are deprecated over to new options. Logs warnings to
 * console if deprecated options are used.
 *
 * @private
 */
function copyDeprecatedOptions(chart) {
    copyDeprecatedChartOptions(chart);
    copyDeprecatedAxisOptions(chart);
    if (chart.series) {
        copyDeprecatedSeriesOptions(chart);
    }
    copyDeprecatedTopLevelAccessibilityOptions(chart);
    copyDeprecatedKeyboardNavigationOptions(chart);
    copyDeprecatedLangOptions(chart);
}

export default copyDeprecatedOptions;
