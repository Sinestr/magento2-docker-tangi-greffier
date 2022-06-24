require.config({"config": {
        "jsbuild":{"Vertex_AddressValidation/js/model/address-difference-template-renderer.js":"/*\n * @copyright  Vertex. All rights reserved.  https://www.vertexinc.com/\n * @author     Mediotype                     https://www.mediotype.com/\n */\n\ndefine(['underscore', 'uiClass'], function (_, Component) {\n    'use strict';\n\n    /**\n     * @typedef {Object} vertexDifferenceRendererObject\n     * @property {vertexDifferenceObject_Message} message\n     */\n\n    /**\n     * @typedef {Object} vertexDifferenceObject_Message\n     * @property {string} text - Informative message to end user\n     * @property {vertexDifferenceObject_Difference[]} differences - Array of differences\n     */\n\n    /**\n     * @typedef {Object} vertexDifferenceObject_Difference\n     * @property {string} name - Human readable name of field that has a difference\n     * @property {string} value - New value for the field\n     */\n\n    /**\n     * @api\n     */\n    return Component.extend({\n        /**\n         * @var {string} template - Location of file to render\n         */\n        template: 'Vertex_AddressValidation/template/validation-result.html',\n\n        /**\n         * @var {*} renderer - Underscore.js template object\n         */\n        renderer: null,\n\n        /**\n         * @constructor\n         * @param {string} template - File to render\n         * @returns {*}\n         */\n        initialize: function (template) {\n            if (typeof this.template !== 'undefined') {\n                this.template = template;\n            }\n\n            require(['text!' + this.template], function (templateContents) {\n                this.renderer = _.template(templateContents);\n            }.bind(this));\n\n            return this;\n        },\n\n        /**\n         * @param {vertexDifferenceRendererObject} message\n         * @returns {string} HTML\n         */\n        render: function (message) {\n            return this.renderer(message);\n        }\n    });\n});\n","Vertex_AddressValidation/js/model/difference-determiner.js":"/*\n * @copyright  Vertex. All rights reserved.  https://www.vertexinc.com/\n * @author     Mediotype                     https://www.mediotype.com/\n */\n\ndefine(['mage/translate'], function ($t) {\n    'use strict';\n\n    /**\n     * @typedef VertexAddressReadableDifference\n     * @property {string} type - Type of difference (used for code)\n     * @property {string} name - Human readable name of the item that has changed\n     * @property {(string|string[])} value - Human readable value of the item that has changed\n     * @property {(string|string[])} rawValue - Script usable value of the item that has changed\n     */\n\n    /**\n     * @param {UncleanAddress} uncleanAddress\n     * @param {CleanAddress} cleanAddress\n     * @returns {boolean}\n     */\n    function streetAddressesAreDifferent(uncleanAddress, cleanAddress) {\n        uncleanAddress.street_address.filter(function (val) {\n            // Filter out empty strings\n            return val.length > 0;\n        });\n\n        if (uncleanAddress.street_address.length !== cleanAddress.street_address.length) {\n            return true;\n        }\n        for(let index = 0,length = uncleanAddress.street_address.length;index < length;++index) {\n            if (uncleanAddress.street_address[index] !== cleanAddress.street_address[index]) {\n                return true;\n            }\n        }\n        return false;\n    }\n\n    /**\n     * @param {UncleanAddress} uncleanAddress\n     * @param {CleanAddress} cleanAddress\n     * @returns {VertexAddressReadableDifference[]}\n     */\n    return function (uncleanAddress, cleanAddress) {\n        const listedDifferences = [];\n        if (streetAddressesAreDifferent(uncleanAddress, cleanAddress)) {\n            listedDifferences.push({type: 'street', name: $t('Street Address'), value: cleanAddress.street_address, rawValue: cleanAddress.street_address});\n        }\n        if (uncleanAddress.city !== cleanAddress.city) {\n            listedDifferences.push({type: 'city', name: $t('City'), value: cleanAddress.city, rawValue: cleanAddress.city});\n        }\n        if (uncleanAddress.main_division !== cleanAddress.region_name) {\n            listedDifferences.push({type: 'region', name: $t('State/Province'), value: cleanAddress.region_name, rawValue: cleanAddress.region_id});\n        }\n        if (uncleanAddress.postal_code !== cleanAddress.postal_code) {\n            listedDifferences.push({type: 'postcode', name: $t('Zip/Postal Code'), value: cleanAddress.postal_code, rawValue: cleanAddress.postal_code});\n        }\n        if (uncleanAddress.country !== cleanAddress.country_code) {\n            listedDifferences.push({type: 'country', name: $t('Country'), value: cleanAddress.country_name, rawValue: cleanAddress.country_code});\n        }\n        return listedDifferences;\n    };\n});\n","Vertex_AddressValidation/js/view/cleanse-address-button.js":"/*\n * @copyright  Vertex. All rights reserved.  https://www.vertexinc.com/\n * @author     Mediotype                     https://www.mediotype.com/\n */\n\ndefine([\n    'jquery',\n    'uiElement',\n    'ko',\n    'mage/translate',\n    'Vertex_AddressValidation/js/model/address-difference-template-renderer',\n    'Vertex_AddressValidation/js/model/difference-determiner',\n    'Vertex_AddressValidation/js/action/cleanse-address',\n    'Vertex_AddressValidation/js/validation-messages'\n], function ($, Component, ko, $t, differenceRenderer, differenceDeterminer, addressCleaner, validationMessages) {\n    'use strict';\n\n    return Component.extend({\n        defaults: {\n            /** @var {string} */\n            prefix: '',\n\n            /** @var {string[]} */\n            validCountryList: ['US'],\n\n            /**\n             * @var {?int} - Milliseconds for how long an animation should run. Null is default, 0 is no animations\n             */\n            animationDuration: null,\n\n            /**\n             * @var {string} - Template to use for rendering differences between clean and unclean addresses\n             */\n            cleanseAddressTemplate: 'Vertex_AddressValidation/template/validation-result.html',\n\n            /**\n             * @var {string} - Selector for the element that will have its HTML replaced by our messages\n             */\n            messageContainerSelector: '[data-role=\"vertex-message_container\"]',\n\n            /**\n             * @var {string} - Selector for the element that, when clicked, will trigger address cleansing\n             */\n            cleanseAddressButtonSelector: '[data-role=\"vertex-cleanse_address\"]',\n\n            /**\n             * @var {string} - Selector for the element that, when clicked, will update address form fields\n             */\n            updateAddressButtonSelector: '[data-role=\"vertex-update_address\"]',\n        },\n\n        /**\n         * @function\n         * @param {boolean} enabled - Whether or not the button should be enabled\n         * @returns {boolean} Whether or not the button is enabled\n         */\n        cleanseAddressButtonEnabled: null,\n\n        /**\n         * @function\n         * @param {boolean} inProgress - Whether or not we're currently cleansing an address\n         * @returns {boolean} Whether or not we're currently cleansing an address\n         */\n        inProgress: null,\n\n        /**\n         * @function\n         * @param {boolean} validCountry - Whether or not the currently selected country is valid\n         * @returns {boolean} Whether or not the currently selected country is valid\n         */\n        validatableAddress: null,\n\n        /**\n         * @var {jQuery}\n         */\n        node: null,\n\n        /**\n         * @var {jQuery}\n         */\n        cleanseAddressButton: null,\n\n        /**\n         * @var {jQuery}\n         */\n        updateAddressButton: null,\n\n        /**\n         * @var {jQuery}\n         */\n        countryInput: null,\n\n        /**\n         * @var {jQuery}\n         */\n        streetInputs: null,\n\n        /**\n         * @var {jQuery}\n         */\n        regionInput: null,\n\n        /**\n         * @var {jQuery}\n         */\n        postalCodeInput: null,\n\n        /**\n         * @var {jQuery}\n         */\n        cityInput: null,\n\n        /**\n         * @var {jQuery}\n         */\n        form: null,\n\n        /**\n         * @var {jQuery}\n         */\n        messageContainer: null,\n\n        /**\n         * @var {function}\n         */\n        templateRenderer: null,\n\n        /**\n         * @var {?CleanAddress}\n         */\n        cleanAddress: null,\n\n        /**\n         * @param {Object} config\n         * @param {Element} node\n         * @returns {*}\n         */\n        initialize: function (config, node) {\n            this.node = $(node);\n            this._super();\n\n            addressCleaner.setApiUrl(config.apiUrl);\n            this.updateValidatableAddress();\n            this.updateCleanseAddressButtonEnabled();\n\n            this.templateRenderer = new differenceRenderer(this.cleanseAddressTemplate);\n\n            return this;\n        },\n\n        initConfig: function () {\n            this._super();\n\n            this.cleanseAddressButton = this.node.find(this.cleanseAddressButtonSelector);\n            this.updateAddressButton = this.node.find(this.updateAddressButtonSelector);\n            this.messageContainer = this.node.find(this.messageContainerSelector);\n\n            this.form = $('#' + window.order[this.prefix + 'Container']);\n\n            this.streetInputs = this.form.find('input[name*=\"[street]\"]');\n            this.cityInput = this.form.find('input[name*=\"[city]\"]');\n            this.countryInput = this.form.find('select[name*=\"[country_id]\"]');\n            this.regionInput = this.form.find('select[name*=\"[region_id]\"]');\n            this.postalCodeInput = this.form.find('input[name*=\"[postcode]\"]');\n\n            this.animationDuration = this.animationDuration !== null\n                ? parseInt(this.animationDuration, 10)\n                : null;\n\n            return this;\n        },\n\n        initObservable: function () {\n            this._super();\n\n            this.cleanseAddressButtonEnabled = ko.observable(null);\n            this.inProgress = ko.observable(false);\n            this.validatableAddress = ko.observable(false);\n\n            this.countryInput.on('change', this.updateValidatableAddress.bind(this));\n            this.regionInput.on('change', this.updateValidatableAddress.bind(this));\n            this.streetInputs.on('keyup', this.updateValidatableAddress.bind(this));\n            this.postalCodeInput.on('keyup', this.updateValidatableAddress.bind(this));\n\n            this.inProgress.subscribe(this.updateCleanseAddressButtonEnabled.bind(this));\n            this.cleanseAddressButtonEnabled.subscribe(this.triggerButtonUpdate.bind(this));\n            this.cleanseAddressButton.on('click', this.cleanseAddress.bind(this));\n            this.updateAddressButton.on('click', this.updateAddress.bind(this));\n\n            return this;\n        },\n\n        getStreetLines: function () {\n            return this.streetInputs\n                .map(function (index, element) {\n                    return $(element).val();\n                })\n                .toArray()\n                .filter(function (v) {\n                    return v.length > 0\n                });\n        },\n\n        /**\n         * Check if the currently selected country for the address is a country we support cleansing in\n         *\n         * This updates the value of {@link this.validatableAddress} and then calls {@link this.cleanseAddressButtonEnabled}\n         */\n        updateValidatableAddress: function () {\n            /*\n             * In order for our address to be worth cleansing, it must:\n             * - be in a country we support cleansing for\n             * - have a street address\n             * - have either a postcode or a region\n             */\n            const validAddress = this.validCountryList.indexOf(this.countryInput.val()) >= 0\n                && this.getStreetLines().length > 0\n                && (this.postalCodeInput.val() !== '' || this.regionInput.val() !== '');\n\n            this.validatableAddress(validAddress);\n            this.updateCleanseAddressButtonEnabled();\n        },\n\n        /**\n         * Update the address input fields with the differences found by the API\n         */\n        updateAddress: function () {\n            const differences = differenceDeterminer(this.retrieveAddress(), this.cleanAddress);\n            for (let index = 0, length = differences.length; index < length; ++index) {\n                let difference = differences[index];\n                switch (difference.type) {\n                    case 'street':\n                        this.streetInputs.val('');\n                        for (\n                            let streetIndex = 0, streetLength = difference.rawValue.length;\n                            streetIndex < streetLength;\n                            ++streetIndex\n                        ) {\n                            $(this.streetInputs[streetIndex]).val(difference.rawValue[streetIndex])\n                                .trigger('change')\n                                .trigger('blur');\n                        }\n                        break;\n                    case 'city':\n                        this.cityInput.val(difference.rawValue).trigger('change').trigger('blur');\n                        break;\n                    case 'region':\n                        this.regionInput.val(difference.rawValue).trigger('change').trigger('blur');\n                        break;\n                    case 'postcode':\n                        this.postalCodeInput.val(difference.rawValue).trigger('change').trigger('blur');\n                        break;\n                    case 'country':\n                        this.countryInput.val(difference.rawValue).trigger('change').trigger('blur');\n                        break;\n                }\n            }\n            this.hideMessage();\n        },\n\n        /**\n         * Determine whether or not the button should be enabled\n         *\n         * This updates the value of {@link this.buttonEnabled}\n         *\n         * @param {boolean} [inProgressValue]\n         */\n        updateCleanseAddressButtonEnabled: function (inProgressValue) {\n            if (typeof inProgressValue === 'undefined') {\n                inProgressValue = this.inProgress();\n            }\n            this.cleanseAddressButtonEnabled(this.validatableAddress() && !inProgressValue);\n        },\n\n        /**\n         * Update the button to be enabled or disabled\n         *\n         * @param {boolean} enabled\n         */\n        triggerButtonUpdate: function (enabled) {\n            $(this.cleanseAddressButton).attr('disabled', !enabled);\n        },\n\n        /**\n         * Trigger Address Cleansing\n         */\n        cleanseAddress: function () {\n            this.cleanAddress = null;\n            this.inProgress(true);\n            this.hideMessage();\n\n            addressCleaner\n                .cleanseAddress(this.retrieveAddress())\n                .fail(this.showErrorMessage.bind(this))\n                .done(this.suggestCleansedAddress.bind(this))\n                .always(function () {\n                    this.inProgress(false);\n                }.bind(this));\n        },\n\n        /**\n         * @param {?CleanAddress} address\n         */\n        suggestCleansedAddress: function (address) {\n            if (address !== null && typeof address.ajaxRedirect !== 'undefined') {\n                // We're about to get redirected.  So let's just.. stop\n                return;\n            }\n\n            if (address !== null && (typeof address !== 'object' || typeof address.postal_code === 'undefined')) {\n                // When things go weird wrong but we get a 200 (it happens!)\n                this.showErrorMessage();\n                return;\n            }\n\n            const differences = address === null ? [] : differenceDeterminer(this.retrieveAddress(), address);\n            let messageText, containerClass = 'message-info';\n\n            switch (true) {\n                case address === null:\n                    messageText = validationMessages.noAddressFound;\n                    break;\n                case differences.length === 0:\n                    containerClass = 'message-success';\n                    messageText = validationMessages.noChangesNecessary;\n                    break;\n                default:\n                    messageText = validationMessages.adminChangesFound;\n            }\n\n            /** @var {vertexDifferenceRendererObject} */\n            const templateVariables = {\n                message: {\n                    text: messageText,\n                    differences: differences\n                },\n                address: address\n            };\n\n            for (let index = 0, length = differences.length; index < length; ++index) {\n                if (differences[index].type === 'street') {\n                    templateVariables.warning = validationMessages.streetAddressUpdateWarning;\n                    break;\n                }\n            }\n\n            this.messageContainer\n                .stop(true, true)\n                .addClass(containerClass)\n                .html(this.templateRenderer.render(templateVariables));\n\n            this.cleanAddress = address;\n\n            if (differences.length > 0) {\n                this.updateAddressButton.show();\n            }\n\n            if (this.animationDuration !== 0) {\n                const options = this.animationDuration !== null ? {duration: this.animationDuration} : {};\n                this.messageContainer.slideDown(options);\n            } else {\n                this.messageContainer.show();\n            }\n        },\n\n        /**\n         * @returns {UncleanAddress}\n         */\n        retrieveAddress: function () {\n            /** @var {UncleanAddress} uncleanAddress */\n            const uncleanAddress = {},\n                city = this.form.find('input[name*=\"[city]\"]').val(),\n                mainDivisionValue = this.regionInput.val(),\n                postalCodeValue = this.postalCodeInput.val();\n\n            uncleanAddress.street_address = this.getStreetLines();\n            if (city.length > 0) {\n                uncleanAddress.city = city;\n            }\n            if (mainDivisionValue.length > 0) {\n                uncleanAddress.main_division = this.regionInput.find('option[value=\"' + mainDivisionValue + '\"]').text();\n            }\n            if (postalCodeValue.length > 0) {\n                uncleanAddress.postal_code = postalCodeValue;\n            }\n            uncleanAddress.country = this.countryInput.val();\n            return uncleanAddress;\n        },\n\n        /**\n         * Show an error message (for various failures)\n         *\n         * @param {int=500} errorCode\n         */\n        showErrorMessage: function (errorCode) {\n            if (typeof errorCode === 'undefined') {\n                errorCode = 500;\n            }\n            if (this.animationDuration !== 0) {\n                this.messageContainer.stop(true, true);\n            }\n\n            let message = '';\n            switch (errorCode) {\n                case '403':\n                    message = $t('Your session has expired. Please reload the page and try again.');\n                    break;\n                default:\n                    message = $t('There was an error cleansing the address. Please try again.');\n                    break;\n            }\n\n            this.messageContainer\n                .addClass('message-error')\n                .text(message);\n\n            if (this.animationDuration !== 0) {\n                const options = this.animationDuration !== null ? {duration: this.animationDuration} : {};\n                this.messageContainer.slideDown(options);\n            } else {\n                this.messageContainer.show();\n            }\n        },\n\n        /**\n         * Hide the message container and remove its classes\n         */\n        hideMessage: function () {\n            const updateContainer = function () {\n                this.messageContainer.text('')\n                    .removeClass('message-error')\n                    .removeClass('message-notice')\n                    .removeClass('message-success');\n            }.bind(this);\n\n            this.updateAddressButton.hide();\n            if (this.animationDuration === 0) {\n                updateContainer();\n                this.messageContainer.hide();\n            } else {\n                const options = {\n                    done: updateContainer\n                };\n                if (this.animationDuration !== null) {\n                    options.duration = this.animationDuration;\n                }\n                this.messageContainer.slideUp(options);\n            }\n        }\n    });\n})\n","Vertex_Tax/js/allowed-countries.js":"/**\n * @copyright  Vertex. All rights reserved.  https://www.vertexinc.com/\n * @author     Mediotype                     https://www.mediotype.com/\n */\n\ndefine(['jquery', 'jquery/ui'], function ($) {\n    'use strict';\n\n    $.widget('vertex.allowedCountries', {\n        /**\n         * Bind all optgroups under the attached element to mass-select/mass-deselect their children on click\n         *\n         * @private\n         */\n        _create: function () {\n            $(this.element).on('click', 'optgroup', this.filterClick.bind(this));\n        },\n\n        /**\n         * Filter out any clicks where the target was not explicitly the optgroup\n         *\n         * @param {Event} event\n         * @return void\n         */\n        filterClick: function (event) {\n            if (!$(event.target).is('optgroup')) {\n                return;\n            }\n\n            this._processClick(event);\n        },\n\n        /**\n         * Decide to select or unselect all child elements and execute the chosen task\n         *\n         * @private\n         * @param {Event} event\n         * @return void\n         */\n        _processClick: function (event) {\n            var optgroup = $(event.target),\n                select = optgroup.closest('select'),\n                scrollTop = select.scrollTop();\n\n            if (optgroup.children('option:not(:selected)').length === 0) {\n                optgroup.children('option').prop('selected', false);\n            } else {\n                optgroup.children('option').prop('selected', true);\n            }\n\n            //  Maintain current scroll position\n            // Default behavior, in chrome at least, is to jump to some other selected option\n            setTimeout(function () {\n                select.scrollTop(scrollTop);\n            }, 0);\n        }\n    });\n\n    return $.vertex.allowedCountries;\n});\n","Vertex_Tax/js/form/caption-formatter.js":"/*\n * @copyright  Vertex. All rights reserved.  https://www.vertexinc.com/\n * @author     Mediotype                     https://www.mediotype.com/\n */\n\ndefine(function () {\n    'use strict';\n\n    return {\n        /**\n         * Return formatted selected option value\n         * @param {Object} selected\n         * @returns {String}\n         */\n        getFormattedValue: function (selected) {\n            var label = '';\n\n            if (selected.parent) {\n                label = selected.parent + ' - ';\n            }\n            label += selected.label;\n            return label;\n        }\n    };\n});\n","Vertex_Tax/js/form/depend-field-checker.js":"/**\n * @copyright  Vertex. All rights reserved.  https://www.vertexinc.com/\n * @author     Mediotype                     https://www.mediotype.com/\n */\n\ndefine([\n    'jquery',\n], function ($) {\n    'use strict';\n\n    return {\n        /**\n         * Makes sure a value is set if its depending field is also set.\n         *\n         * @param dependField\n         * @param valueCheck\n         * @returns {boolean}\n         */\n        validateValues : function (dependField, valueCheck) {\n            if ($(dependField).length) {\n                let dependValue = $(dependField).val();\n\n                return !(dependValue && !valueCheck);\n            }\n\n            return true;\n        }\n    };\n});\n","Vertex_Tax/js/form/flex-field-select.js":"/*\n * @copyright  Vertex. All rights reserved.  https://www.vertexinc.com/\n * @author     Mediotype                     https://www.mediotype.com/\n */\n\ndefine([\n    'underscore',\n    'Magento_Ui/js/form/element/ui-select',\n    'Vertex_Tax/js/form/caption-formatter'\n], function (_, Component, captionFormatter) {\n    'use strict';\n\n    return Component.extend({\n        defaults: {\n            presets: {\n                optgroup: {\n                    openLevelsAction: true,\n                    showOpenLevelsActionIcon: true\n                }\n            }\n        },\n\n        /**\n         * Set Caption\n         */\n        setCaption: function () {\n            var length, label;\n\n            if (!_.isArray(this.value()) && this.value()) {\n                length = 1;\n            } else if (this.value()) {\n                length = this.value().length;\n            } else {\n                this.value([]);\n                length = 0;\n            }\n\n            if (length && this.getSelected().length) {\n                label = captionFormatter.getFormattedValue(this.getSelected()[0]);\n                this.placeholder(label);\n            } else {\n                this.placeholder(this.selectedPlaceholders.defaultPlaceholder);\n            }\n\n            return this.placeholder();\n        }\n    });\n});\n","Vertex_Tax/js/form/element/custom-option-flex-field-select.js":"/*\n * @copyright  Vertex. All rights reserved.  https://www.vertexinc.com/\n * @author     Mediotype                     https://www.mediotype.com/\n */\n\ndefine(['underscore', 'Magento_Ui/js/form/element/select'], function (_, Select) {\n    'use strict';\n\n    return Select.extend({\n        /**\n         * Overwrites the parent's filter to allow for checking if a value is\n         * in an array and for allowing the value of \"unmapped\" through all\n         * filters\n         *\n         * @param {String} value\n         * @param {String} field\n         */\n        filter: function (value, field) {\n            var source = this.initialOptions,\n                result;\n\n            field = field || this.filterBy.field;\n\n            result = _.filter(source, function (item) {\n                return Array.isArray(item[field]) && item[field].includes(value) ||\n                    item[field] === value ||\n                    item.value === '' ||\n                    item.value === 'unmapped';\n            });\n\n            this.setOptions(result);\n        }\n    });\n});\n","Vertex_Tax/js/form/element/customer-country-validation.js":"/*\n * @copyright  Vertex. All rights reserved.  https://www.vertexinc.com/\n * @author     Mediotype                     https://www.mediotype.com/\n */\n\ndefine([\n    'jquery',\n    'ko',\n    'Magento_Ui/js/form/element/select',\n    'Magento_Ui/js/lib/validation/validator',\n    'Vertex_Tax/js/form/depend-field-checker',\n    'mage/translate'\n], function ($, ko, Select, validator, dependFieldChecker) {\n    'use strict';\n\n    return Select.extend({\n        defaults: {\n            imports: {\n                'taxvat': '${ $.provider }:data.customer.taxvat'\n            },\n            listens: {\n                '${ $.provider }:data.customer.taxvat': '_taxVatUpdated',\n            }\n        },\n\n        initialize: function () {\n            this._super();\n\n            this.required(!!this.taxvat().length);\n        },\n\n        setLinks: function () {\n            return this._super();\n        },\n\n        initObservable: function () {\n            this._super();\n            this.taxvat = ko.observable('');\n\n            return this;\n        },\n\n        initConfig: function (config) {\n            /**\n             * Validates if a customer VAT number is set, then selecting a Country is required.\n             */\n            validator.addRule(\n                'vertex-customer-country',\n                function (value) {\n                    let dependField = 'input[name=\"customer['+ config.dependField +']\"]';\n\n                    return dependFieldChecker.validateValues(dependField, value);\n                },\n                $.mage.__(\"Please select a Country.\")\n            );\n\n            this._super();\n            return this;\n        },\n\n        _taxVatUpdated: function (newValue) {\n            this.required(!!newValue.length);\n        }\n    });\n});\n","Vertex_Tax/js/model/flex-field-table.js":"/**\n * @copyright  Vertex. All rights reserved.  https://www.vertexinc.com/\n * @author     Mediotype                     https://www.mediotype.com/\n */\n\ndefine([\n    'uiComponent',\n    'ko',\n    'uiLayout',\n    'Vertex_Tax/js/form/caption-formatter'\n], function (Component, ko, layout, captionFormatter) {\n    'use strict';\n\n    return Component.extend({\n        defaults: {\n            elementName: '', // Prefix to use for input elements\n            fieldType: '', // One of code, numeric, or date\n            tableId: '',\n            template: 'Vertex_Tax/flex-field-table',\n            defaultPlaceholder: 'No Data',\n            selectOptions: [\n                {\n                    label: 'No Data',\n                    value: 'none'\n                }\n            ]\n        },\n        retrieveFields: [],\n\n        /**\n         * Initializes the table\n         * @returns {FlexFieldTable} Chainable.\n         */\n        initialize: function () {\n            this._super();\n\n            this.retrieveFields = ko.observableArray();\n            this.initializeFields();\n\n            return this;\n        },\n\n        /**\n         * Initialize the select components and link them to the form values\n         */\n        initializeFields: function () {\n            var i, name, fieldId, fieldSource, toLayOut = [];\n\n            for (i in this.values) {\n                if (this.values.hasOwnProperty(i)) {\n                    fieldSource = this.values[i]['field_source'];\n                    fieldId = this.values[i]['field_id'];\n                    name = this.fieldType + 'FlexField' + fieldId;\n\n                    this.retrieveFields.push({\n                        fieldId: fieldId,\n                        fieldSource: fieldSource,\n                        fieldLabel: this.getFieldLabelFromSource(fieldSource),\n                        editMode: ko.observable(false),\n                        childName: name\n                    });\n                }\n            }\n\n            layout(toLayOut);\n        },\n\n        /**\n         * Replace the label value with a dropdown\n         * @param {Object} child\n         */\n        enableEditMode: function (child) {\n            child.editMode(true);\n\n            layout([{\n                component: 'Vertex_Tax/js/form/flex-field-select',\n                template: 'ui/grid/filters/elements/ui-select',\n                parent: this.name,\n                name: child.childName,\n                dataScope: '',\n                multiple: false,\n                selectType: 'optgroup',\n                selectedPlaceholders: {\n                    defaultPlaceholder: this.defaultPlaceholder\n                },\n                showOpenLevelsActionIcon: true,\n                presets: {\n                    optgroup: {\n                        showOpenLevelsActionIcon: true\n                    }\n                },\n                filterOptions: true,\n                isDisplayMissingValuePlaceholder: true,\n                options: this.selectOptions,\n                value: child.fieldSource\n            }]);\n        },\n\n        /**\n         * Retrieve the name for a Field ID input\n         *\n         * @param {String} fieldId\n         * @returns {String}\n         */\n        getFieldIdInputName: function (fieldId) {\n            return this.elementName + '[' + fieldId + '][field_id]';\n        },\n\n        /**\n         * Retrieve the label for the selected source\n         * @param {String} source\n         * @returns {String}\n         */\n        getFieldLabelFromSource: function (source) {\n            var i, j, selected;\n\n            for (i in this.selectOptions) {\n                if (this.selectOptions[i].optgroup === undefined) {\n                    continue;\n                }\n                for (j in this.selectOptions[i].optgroup) {\n                    selected = this.selectOptions[i].optgroup[j];\n\n                    if (selected.value === source) {\n                        return captionFormatter.getFormattedValue(selected);\n                    }\n                }\n            }\n            return this.defaultPlaceholder;\n        },\n\n        /**\n         * Retrieve the name for a Field Value input\n         * @param {String} fieldId\n         * @returns {String}\n         */\n        getFieldValueInputName: function (fieldId) {\n            return this.elementName + '[' + fieldId + '][field_source]';\n        },\n\n        /**\n         * Retrieve the name for the empty input\n         * @returns {String}\n         */\n        getEmptyName: function () {\n            return this.elementName + '[__empty]';\n        }\n    });\n});\n"}
}});