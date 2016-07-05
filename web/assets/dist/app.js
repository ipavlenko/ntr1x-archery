var Core =
(function($, Vue) {

    Core = {};

    return Core;

})(jQuery, Vue);

(function(Vue, $, Core) {

    Core.TabsMixin = function(active) {

        return {

            data: function() {
                return {
                    tabs: {
                        active: active
                    }
                }
            },

            methods: {

                activate: function(tab) {
                    this.tabs.active = tab;
                },

                isActive: function(tab) {
                    return this.tabs.active == tab;
                }
            }
        }
    }

    Core.ActionMixin = function(ModalEditor) {

        return {

            props: {
                model: Object,
                globals: Object,
                context: Object,
            },

            methods: {

                open: function(context) {

                    var dialog = new ModalEditor({

                        data: {
                            globals: this.globals,
                            owner: this,
                            context: context || this.context,
                            original: this.model,
                            current: JSON.parse(JSON.stringify(this.model))
                        },

                        methods: {
                            submit: function() {
                                this.owner.doApply(this.current);
                                this.$remove();
                                this.$destroy();
                            },
                            reset: function() {
                                this.$remove();
                                this.$destroy();
                            }
                        }
                    }).$mount().$appendTo($('body').get(0));
                },

                doApply: function(model) {

                    console.log('apply', model);

                    this.$set('model', Object.assign(JSON.parse(JSON.stringify(model)), {
                        _action: this.model._action
                            ? this.model._action
                            : 'update'
                    }));

                    $(window).trigger('resize');
                }
            }
        };
    };

    Core.EditorMixin = function(ListViewer, ModalEditor) {

        return {

            props: {
                items: Array,
                globals: Object
            },

            methods: {

                trigger: function(event, item, context) {
                    this.$dispatch(event, { item: item, context: context });
                },

                create: function(item, context) {

                    var dialog = new ModalEditor({

                        data: {
                            globals: this.globals,
                            owner: this,
                            context: context,
                            original: null,
                            current: item ? JSON.parse(JSON.stringify(item)) : {}
                        },

                        methods: {
                            submit: function() {
                                this.owner.doCreate(this.current);
                                this.$remove();
                                this.$destroy();
                            },
                            reset: function() {
                                this.$remove();
                                this.$destroy();
                            }
                        }
                    }).$mount().$appendTo($('body').get(0));
                },

                remove: function(item, context) {
                    this.doRemove(item, context);
                },

                update: function(item, context) {

                    this.active = item;

                    new ModalEditor({

                        data: {
                            globals: this.globals,
                            owner: this,
                            context: context,
                            original: item,
                            current: JSON.parse(JSON.stringify(item))
                        },

                        methods: {
                            submit: function() {
                                this.owner.doUpdate(this.current);
                                this.$remove();
                                this.$destroy();
                            },
                            reset:  function() {
                                this.$remove();
                                this.$destroy();
                            },
                        }
                    }).$mount().$appendTo($('body').get(0));
                },

                doCreate: function(item, context) {

                    this.items.push(Object.assign({}, JSON.parse(JSON.stringify(item)), { _action: 'create' }));

                    this.$set('items', $.extend(true, [], this.items));

                    $(window).trigger('resize');
                    this.active = null;
                },

                doUpdate: function(item, context) {

                    Object.assign(this.active, JSON.parse(JSON.stringify(item)), {
                        _action: this.active._action
                            ? this.active._action
                            : 'update'
                    });

                    // this.items = $.extend(true, [], this.items);//this.items.slice();
                    this.items = this.items.slice();
                    $(window).trigger('resize');
                    this.active = null;

                    // console.log('update', item, context);
                    //
                    // this.$set('active', Object.assign(JSON.parse(JSON.stringify(item)), {
                    //     _action: this.active._action
                    //         ? this.active._action
                    //         : 'update'
                    // }));
                    //
                    // // this.items = $.extend(true, [], this.items);//this.items.slice();
                    //
                    // this.$set('items', $.extend(true, [], this.items));
                    //
                    // $(window).trigger('resize');
                    // this.active = null;
                },

                doRemove: function(item, context) {

                    var index = this.items.indexOf(item);
                    if (index !== -1) {
                        var item = this.items[index];
                        if (item._action == 'create') {
                            this.items.$remove(item);
                        } else {
                            item._action = 'remove';
                        }
                    }

                    // this.items = $.extend(true, [], this.items);
                    this.$set('items', $.extend(true, [], this.items));

                    $(window).trigger('resize');
                    this.active = null;
                }
            },

            events: {
                create: function(data) { this.create(data.item, data.context); },
                update: function(data) { this.update(data.item, data.context); },
                remove: function(data) { this.remove(data.item, data.context); },
                doCreate: function(data) { this.doCreate(data.item, data.context); },
                doUpdate: function(data) { this.doUpdate(data.item, data.context); },
                doRemove: function(data) { this.doRemove(data.item, data.context); },
            }
        };
    };

    Core.ListViewerMixin = {

        props: {
            items: Array,
            globals: Object
        },

        methods: {
            trigger: function(event, data) { this.$dispatch(event, { item: item, context: context }); },
            create: function(item, context) { this.$dispatch('create', { item: item, context: context} ); },
            update: function(item, context) { this.$dispatch('update', { item: item, context: context} ); },
            remove: function(item, context) { this.$dispatch('remove', { item: item, context: context} ); },
        }
    };

    Core.ModalEditorMixin = {

        attached: function() {

            $(this.$el).modal('show');
            $(this.$el).on('hide.bs.modal', (e) => {
                e.stopPropagation();
                this.reset();
            });
        },

        detached: function() {
            $(this.$el).modal('hide');
        },

        methods: {
            submit: function() {},
            reset: function() {}
        }
    };

})(Vue, jQuery, Core);

// Vue.component('v-form', {
//
// 	props: {
// 		action: String,
// 		method: String,
// 		init: Object,
// 		done: Function,
// 		fail: Function,
// 		model: Object,
// 	},
//
// 	// replace: false,
//
// 	// template: `
// 	// 	<form>
// 	// 		<slot></slot>
// 	// 	</form>
// 	// `,
//
// 	activate: function(done) {
//
// 		this.original = JSON.parse(JSON.stringify(this.model));
//
// 		$(this.$el)
//
// 			.on('submit', (e) => {
// 				e.preventDefault();
// 				this.submit();
// 			})
// 			.on('reset', (e) => {
// 				e.preventDefault();
// 				this.reset();
// 			})
//
// 		done();
// 	},
//
// 	data: function() {
//
// 		return {
// 			model: this.model
// 		};
// 	},
//
// 	methods: {
//
// 		submit: function() {
//
// 			// e.preventDefault();
//
// 			// console.log(this.model);
//
// 			$.ajax({
// 				url: this.action,
// 				method: this.method,
// 				contentType: "application/json",
// 				data: JSON.stringify(this.model)
// 			})
// 			.done((d) => {
// 				if (done in this) this.done(d);
// 			})
// 			.fail(function(e) { if (fail in this) this.fail(e); }.bind(this))
// 		},
//
// 		reset: function() {
// 			Object.assign(this.model, this.original);
// 		}
// 	},
// });

// (function($, Vue, undefined) {
//
// 	// var model = {
// 	// 	list: []
// 	// };
// 	//
// 	// var body = Vue.extend({
// 	// 	created: function()  { this.$dispatch('register-body', this) },
// 	// });
//
// 	Vue.component('grid-table', {
//
// 		replace: false,
//
// 		props: {
// 			d: Array
// 		},
//
// 		// data: function() {
// 		// 	return {
// 		// 		items: this.d.slice(0)
// 		// 	}
// 		// },
//
// 		methods: {
//
// 			add: function() {
// 				console.log('asdasd');
// 				this.items.push({});
// 				console.log(this.items);
// 			},
//
// 			remove: function(index) {
// 				this.items.splice(index, 1);
// 			}
// 		},
// 	});
//
// })(jQuery, Vue);

// Vue.component('inline-text',
// 	Vue.extend({
// 		props: [ 'name', 'value' ],
// 		template: `
// 			<div class="inline-container">
// 				<input class="inline-control" type="text" name="{{ name }}" v-model="value" />
// 			</div>
// 		`
// 	})
// );
//
// Vue.component('inline-checkbox',
// 	Vue.extend({
// 		props: [ 'name', 'value' ],
// 		template: `
// 			<div class="inline-container">
// 				<input class="inline-checkbox" type="checkbox" name="{{ name }}" v-model="value" />
// 			</div>
// 		`
// 	})
// );
//
// Vue.component('inline-select',
// 	Vue.extend({
// 		props: [ 'name', 'value', 'options' ],
// 		template: `
// 			<div class="inline-container">
// 				<select class="inline-control1" name="{{ name }}" v-model="value">
// 					<option v-for="option in options" value="{{ option.key }}">{{ option.value }}</option>
// 				</select>
// 			</div>
// 		`
// 	})
// );
//
// Vue.component('inline-value',
// 	Vue.extend({
// 		props: [ 'name', 'value', 'class' ],
// 		template: `
// 			<input type="hidden" name="{{ name }}" v-model="value" />
// 			<span :class="class">{{ value }}</span>
// 		`
// 	})
// );

(function($, Vue, Core) {

    function generateId() {

        var ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var ID_LENGTH = 8;

        var rtn = '';
        for (var i = 0; i < ID_LENGTH; i++) {
            rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
        }
        return rtn;
    }

    Core.WidgetMixin = {

        props: {
            page: Object,
            data: Object,
            storage: Object,
            stack: Object,
            bindings: Object,
            children: Array,
            editable: Boolean,
        },

        data:  function() {
            return {
                systemId: this.systemId,
            }
        },

        created: function() {

            this.randomId = generateId();

            // TODO Установить размеры родительской ячейки

            this.$watch('bindings.id', function(value) {

                if (value) {
                    this.systemId = value;
                } else {
                    this.systemId = this.randomId;
                }
            }, {
                immediate: true
            });
        },

        methods: {
            trigger: function(event, item, context) {
                this.$dispatch(event, { item: item, context: context });
            },
        }
    };

    Core.StackedMixin = {

        props: {
            globals: Object,
            settings: Object,
            page: Object,
            data: Object,
            storage: Object,
            editable: Boolean,
            children: Array,
        },
    };

})(jQuery, Vue, Core);

// Vue.component('modal', {
//
//     props: {
//         id: String,
//         current: Object,
//         original: Object,
//     },
//
//     methods: {
//
//         submit: function(e) {
//             this.$dispatch('submit', this.current);
//             // Object.assign(this.original, JSON.parse(JSON.stringify(this.current)));
//             $(e.target).closest('.modal').modal('hide');
//         },
//
//         reset: function(e) {
//             this.$dispatch('reset', this.current);
//             // Object.assign(this.current, JSON.parse(JSON.stringify(this.original)));
//             $(e.target).closest('.modal').modal('hide');
//         }
//     }
// });

(function($, Core) {

    Vue.directive('affix', {

        bind: function () {

            if ($.fn.affix) {
                $(this.el).affix(this.vm.$get(this.expression));
            }
        },
        update: function (newValue, oldValue) {
        },
        unbind: function () {
        }
    });

})(jQuery, Core);

(function($, Core) {

    Vue.directive('combo', {

        bind: function () {

            if ($.fn.tagsinput) {

                $(this.el).select2({
                    tags: true,
                    multiple: false,
                    createTag: function (params) {
                        return {
                            id: params.term,
                            text: params.term,
                            newOption: true
                        }
                    },
                });
            }
        },
        update: function (newValue, oldValue) {
        },
        unbind: function () {
        }
    });

})(jQuery, Core);

(function($, Core) {

    Vue.directive('date', {

        bind: function () {

            if ($.fn.datepicker) {

                $(this.el).datepicker({
                    autoclose: true,
                    todayHighlight: true,
                    format: "yyyy-mm-dd"
                });
            }
        },
        update: function (newValue, oldValue) {
        },
        unbind: function () {
        }
    });

})(jQuery, Core);

(function($, Core) {

    Vue.directive('rich', {

        bind: function () {

            if (window.CKEDITOR) {

                this.editor = CKEDITOR.inline(this.el, {
                    stylesSet: [
                        { name: 'Bolder', element: 'span', attributes: { 'class': 'extrabold'} }
                    ],
                    toolbarGroups: [
                        // { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
                        // { name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
                        { name: 'links' },
                        // { name: 'forms' },
                        {name: 'tools'},
                        {name: 'document', groups: ['mode', 'document', 'doctools']},
                        {name: 'others'},
                        {name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align']},
                        {name: 'colors'},
                        '/',
                        {name: 'basicstyles', groups: ['basicstyles', 'cleanup']},
                        {name: 'styles'},
                        '/',
                        { name: 'insert', groups: [ 'ImageButton' ]  }
                        //{name: 'about'}
                    ]
                });

                this.editor.on('change', function() {
                    this.editor.updateElement();
                    this.vm.$set(this.expression, $(this.el).val());
                }.bind(this));

                this.editor.setData(this.vm.$get(this.expression));
            }
        },

        update: function (newValue, oldValue) {
            // console.log('update', newValue, oldValue);
        },

        unbind: function () {
            this.editor.destroy();
            this.editor = null;
            this.textarea = null;
            this.input = null;
        }
    });

})(jQuery, Core);

(function($, Core) {

    Vue.directive('scrollable', {

        bind: function () {

            // $(this.el).css({
            //     'overflow': 'auto',
            // });

            if ($.fn.perfectScrollbar) {
                Vue.nextTick(function() {
                    $(this.el).perfectScrollbar({
                        // axis: this.expression
                    });
                }.bind(this));
            }

        },
        update: function (newValue, oldValue) {
        },
        unbind: function () {
        }
    });

})(jQuery, Core);

(function($, Core) {

    Vue.directive('tags', {

        bind: function () {

            if ($.fn.tagsinput) {

                $(this.el).tagsinput({
                });
            }
        },
        update: function (newValue, oldValue) {
        },
        unbind: function () {
        }
    });

})(jQuery, Core);

(function($, Core) {

    Vue.filter('jsonPath', function (context, str) {
        if (str === undefined || context === undefined) {
            return;
        }

        var re = /{([^}]+)}/g;

        result = str.replace(re, function(match, expr) {
            json = JSONPath({
                json: context,
                path: expr
            });
            if (json.hasOwnProperty(1)) {
                return 'array';
            } else {
                return json;
            }
        });

        if (result == 'array') {
            return JSONPath({
                json: context,
                path: str.replace(re, "$1")
            });
        } else {
            return result;
        }
    });

    Vue.filter('template', function (string, data) {
        
        var re = /${([^}]+)}/g;
        return string.replace(re, function(match, key) {
            return data[key];
        });
    });

    Vue.filter('assign', function (target, source1, source2, source3) {

        return Object.assign(target, source1, source2, source3);
    });

    Vue.filter('copy', function (source) {

        return new Vue({
            data: source != null
                ? JSON.parse(JSON.stringify(source))
                : null
        }).$data;
    });

    Vue.filter('clone', function (source) {

        return new Vue({
            data: source != null
                ? JSON.parse(JSON.stringify(source))
                : null
        }).$data;
    });

})(jQuery, Core);

(function($, Core) {

    $(document).ready(function() {

        function reposition(element) {

            var modal = $(element),
                dialog = $('.modal-dialog', modal);

            modal.css('display', 'block');
            dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2));
        }

        $($(document), '.modal.modal-center').on('show.bs.modal', function(e) {
            reposition(e.target);
        });

        $(window).on('resize', () => {
            $('.modal.modal-center:visible').each(function(index, element) {
                reposition(element);
            });
        });
    });

})(jQuery, Core);

(function($, Vue, Core) {

    Vue.use({

        install: function(Vue, options) {

            var services = {};

            Vue.service = function(name, service) {

                return services[name] = services[name] || service;
            }
        }
    });
})(jQuery, Vue, Core);

(function($, Core) {

    Vue.validator('email', function (val) {
      return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val)
    });

})(jQuery, Core);

var Shell =
(function($, Vue, Core) {

    Shell = {
        Widgets: {},
    };

    return Shell;

})(jQuery, Vue, Core);

(function(Vue, $, Core, Shell) {

    var ModalEditor =
    Vue.component('bindings-dialog', {
        template: '#bindings-dialog',
        mixins: [Core.ModalEditorMixin],
        methods: {
            setStrategy: function(strategy) {
                this.$set('current.binding.strategy', strategy);
            },
            getStrategy: function(strategy) {
                return this.$get('current.binding.strategy');
            },
        },
        created: function() {
            if (!this.current.binding) this.current.binding = {};
        },
    });

    var Editor =
    Vue.component('bindings', {

        mixins: [Core.ActionMixin(ModalEditor)],
    });

})(Vue, jQuery, Core, Shell);

(function(Vue, $, Core, Shell) {

    var ListViewer =
    Vue.component('domains-list', {
        template: '#domains-list',
        mixins: [Core.ListViewerMixin],
    });

    var ModalEditor =
    Vue.component('domains-dialog', {
        template: '#domains-dialog',
        mixins: [Core.ModalEditorMixin, Core.TabsMixin('main')],
    });

    var Editor =
    Vue.component('domains', {
        mixins: [Core.EditorMixin(ListViewer, ModalEditor)],
        template: '#domains',
    });


    var SettingsListViewer =
    Vue.component('domains-settings-list', {
        template: '#domains-settings-list',
        mixins: [Core.ListViewerMixin],
    });

    var SettingsModalEditor =
    Vue.component('domains-settings-dialog', {
        template: '#domains-settings-dialog',
        mixins: [Core.ModalEditorMixin],
    });

    var SettingsEditor =
    Vue.component('domains-settings', {
        mixins: [Core.EditorMixin(SettingsListViewer, SettingsModalEditor)],
        template: '#domains-settings',
    });

})(Vue, jQuery, Core, Shell);

(function(Vue, $, Core, Shell) {

    var ListViewer =
    Vue.component('pages-list', {
        template: '#pages-list',
        mixins: [Core.ListViewerMixin],
    });

    var ModalEditor =
    Vue.component('pages-dialog', {
        template: '#pages-dialog',
        mixins: [Core.ModalEditorMixin, Core.TabsMixin('main')],
    });

    var Editor =
    Vue.component('pages', {
        mixins: [Core.EditorMixin(ListViewer, ModalEditor)],
        template: '#pages',
    });


    var SettingsListViewer =
    Vue.component('pages-settings-list', {
        template: '#pages-settings-list',
        mixins: [Core.ListViewerMixin],
    });

    var SettingsModalEditor =
    Vue.component('pages-settings-dialog', {
        template: '#pages-settings-dialog',
        mixins: [Core.ModalEditorMixin],
    });

    var SettingsEditor =
    Vue.component('pages-settings', {
        mixins: [Core.EditorMixin(SettingsListViewer, SettingsModalEditor)],
        template: '#pages-settings',
    });


    var MetasListViewer =
    Vue.component('pages-metas-list', {
        template: '#pages-metas-list',
        mixins: [Core.ListViewerMixin],
    });

    var MetasModalEditor =
    Vue.component('pages-metas-dialog', {
        template: '#pages-metas-dialog',
        mixins: [Core.ModalEditorMixin],
    });

    var MetasEditor =
    Vue.component('pages-metas', {
        mixins: [Core.EditorMixin(MetasListViewer, MetasModalEditor)],
        template: '#pages-metas',
    });

})(Vue, jQuery, Core, Shell);

(function(Vue, $, Core, Shell) {

    var ParamString =
    Vue.component('params-string', {
        template: '#params-string',
        props: {
            id: String,
            item: Object,
            globals: Object,
        }
    });

    var ParamRich =
    Vue.component('params-rich', {
        template: '#params-rich',
        props: {
            id: String,
            item: Object,
            globals: Object,
        }
    });

    var ParamSource =
    Vue.component('params-source', {
        template: '#params-source',
        props: {
            id: String,
            item: Object,
            globals: Object,
        }
    });

    var ParamMultiple =
    Vue.component('params-multiple', {
        template: '#params-multiple',
        props: {
            id: String,
            item: Object,
            globals: Object,
        },
        data: function() {
            return {
                items: this.item.items
            }
        },
    });

    var Params =
    Vue.component('params', {
        template: '#params',
        props: {
            owner: Object,
            tab: String,
            items: Array,
            globals: Object
        }
    });


    var ParamMultipleListViewer =
    Vue.component('params-multiple-list', {
        template: '#params-multiple-list',
        mixins: [Core.ListViewerMixin],
        props: {
            prop: Object,
            param: Object,
        },
        methods: {
            getLabel: function(item) {

                if (this.prop.display) {
                    var vm = new Vue({
                        item: item,
                    });
                    return vm.$interpolate(this.prop.display);
                }
                return '<item>';
            },
        }
    });

    var ParamBindingsModalEditor =
    Vue.component('params-bindings-dialog', {
        template: '#params-bindings-dialog',
        mixins: [ Core.ModalEditorMixin, Core.TabsMixin('binding') ],
        data: function() {
            return {
                items: this.items,
            };
        },
        created: function() {

            var items = [];

            var binding = this.current.binding || {};
            if (!binding.strategy) binding.strategy = 'interpolate';

            binding.params = binding.params || {};

            if (this.context.prop.props) {
                for (var i = 0; i < this.context.prop.props.length; i++) {

                    var prop = this.context.prop.props[i];
                    var param = binding.params[prop.name] = binding.params[prop.name] || {};

                    param._action = param._action == 'update'
                        ? 'update'
                        : 'create'
                    ;

                    var item = {
                        prop: prop,
                        param: param,
                    };

                    items.push(item);
                }
            }

            this.$set('current.binding', binding);
            this.$set('items', items);
        },
        methods: {
            setStrategy: function(strategy) {
                this.$set('current.binding.strategy', strategy);
            },
            getStrategy: function(strategy) {
                return this.$get('current.binding.strategy');
            },
        },
    });

    var Editor =
    Vue.component('params-bindings', {
        mixins: [Core.ActionMixin(ParamBindingsModalEditor)],
    });

    var ParamMultipleModalEditor =
    Vue.component('params-multiple-dialog', {
        template: '#params-multiple-dialog',
        mixins: [Core.ModalEditorMixin, Core.TabsMixin('data')],
        data: function() {
            return {
                items: this.items,
            };
        },
        created: function() {

            var items = [];

            console.log('created', ParamMultipleModalEditor);

            for (var i = 0; i < this.context.prop.props.length; i++) {

                var prop = this.context.prop.props[i];
                var param = this.current[prop.name] = this.current[prop.name] || { value: null };

                param._action = param._action == 'update'
                    ? 'update'
                    : 'create'
                ;

                var item = {
                    prop: prop,
                    param: param,
                };

                items.push(item);
            }

            this.$set('items', items);
        },
    });

    var ParamMultipleEditor =
    Vue.component('params-multiple-editor', {
        mixins: [Core.EditorMixin(ParamMultipleListViewer, ParamMultipleModalEditor)],
        template: '#params-multiple-editor',
        props: {
            prop: Object,
            param: Object,
            items: Array,
        },
    });


    var ParamsList =
    Vue.component('params-list', {
        template: '#params-list',
        components: {
            'params-string': ParamString,
            'params-rich': ParamRich,
            'params-source': ParamSource,
            'params-multiple': ParamMultiple,
        },
        props: {
            owner: Object,
            tab: String,
            items: Array,
            globals: Object
        }
    });

})(Vue, jQuery, Core, Shell);

(function(Vue, $, Core, Shell) {

    var ListViewer =
    Vue.component('schemes-list', {
        template: '#schemes-list',
        mixins: [Core.ListViewerMixin],
    });

    var ModalEditor =
    Vue.component('schemes-dialog', {
        template: '#schemes-dialog',
        mixins: [Core.ModalEditorMixin, Core.TabsMixin('main')],
    });

    var Editor =
    Vue.component('schemes', {
        mixins: [Core.EditorMixin(ListViewer, ModalEditor)],
        template: '#schemes',
    });


    var SettingsListViewer =
    Vue.component('schemes-settings-list', {
        template: '#schemes-settings-list',
        mixins: [Core.ListViewerMixin],
    });

    var SettingsModalEditor =
    Vue.component('schemes-settings-dialog', {
        template: '#schemes-settings-dialog',
        mixins: [Core.ModalEditorMixin],
    });

    var SettingsEditor =
    Vue.component('schemes-settings', {
        mixins: [Core.EditorMixin(SettingsListViewer, SettingsModalEditor)],
        template: '#schemes-settings',
    });

})(Vue, jQuery, Core, Shell);

(function(Vue, $, Core, Shell) {

    var ModalEditor =
    Vue.component('settings-dialog', {
        template: '#settings-dialog',
        mixins: [Core.ModalEditorMixin, Core.TabsMixin('domains')],
    });

    var Editor =
    Vue.component('settings', {
        mixins: [Core.ActionMixin(ModalEditor)],
        props: {
            globals: Object
        },
        methods: {
            push: function() {
                $.ajax({
                    url: '/settings/do-update',
                    method: 'POST',
                    dataType: "json",
                    data: JSON.stringify(this.model),
                    contentType: "application/json",
                })
                .done((d) => {
                    Object.assign(this.model, d);
                })
            },
            pull: function() {
                $.ajax({
                    url: '/settings',
                    method: 'GET',
                    dataType: "json"
                })
                .done((d) => {
                    Object.assign(this.model, d);
                })
            }
        }
    });

})(Vue, jQuery, Core, Shell);

(function(Vue, $, Core, Shell) {

    var StoragesListViewer =
    Vue.component('storages-list', {
        template: '#storages-list',
        mixins: [Core.ListViewerMixin],
    });

    var StoragesModalEditor =
    Vue.component('storages-dialog', {
        template: '#storages-dialog',
        mixins: [Core.ModalEditorMixin],
        methods: {
            check: function() {
                console.log('check');
            }
        }
    });

    var StoragesEditor =
    Vue.component('storages', {
        mixins: [Core.EditorMixin(StoragesListViewer, StoragesModalEditor)],
        template: '#storages',
    });

    var StoragesVariablesListViewer =
    Vue.component('storages-variables-list', {
        template: '#storages-variables-list',
        mixins: [Core.ListViewerMixin],
    });

    var StoragesVariablesModalEditor =
    Vue.component('storages-variables-dialog', {
        template: '#storages-variables-dialog',
        mixins: [Core.ModalEditorMixin],
    });

    var StoragesVariablesEditor =
    Vue.component('storages-variables', {
        mixins: [Core.EditorMixin(StoragesVariablesListViewer, StoragesVariablesModalEditor)],
        template: '#storages-variables',
    });

})(Vue, jQuery, Core, Shell);

(function(Vue, $, Core, Shell) {

    var ListViewer =
    Vue.component('widgets-list', {
        template: '#widgets-list',
        mixins: [Core.ListViewerMixin],
    });

    var ModalEditor =
    Vue.component('widgets-dialog', {
        template: '#widgets-dialog',
        mixins: [Core.ModalEditorMixin],
    });

    var Editor =
    Vue.component('widgets', {
        mixins: [Core.EditorMixin(ListViewer, ModalEditor)],
        template: '#widgets',
    });

})(Vue, jQuery, Core, Shell);

(function($, Vue, Core, Shell) {

    var scale = 1;

    Vue.component('shell-actions', {
        template: '#shell-actions',
        props: {
            model: Object,
            category: Object,
            domain: Object,
            page: Object
        },
        methods: {
            trigger: function(event, item, context) {
                this.$dispatch(event, { item: item, context: context });
            },
            zoom: function(event) {
                scale += (event == 'in') ? 0.1 : -0.1;
                $('.ge.ge-page').css('transform', 'scale(' + scale + ')');
            },
        }
    });

})(jQuery, Vue, Core, Shell);

(function($, Vue, Core, Shell) {

    Vue.component('shell-brand', {
        template: '#shell-brand',
    });

})(jQuery, Vue, Core, Shell);

(function($, Vue, Core, Shell) {

    Vue.component('shell-categories', {
        template: '#shell-categories',
        props: {
            categories: Array,
            globals: Object,
        },
        methods: {
            trigger: function(event, item, context) {
                this.$dispatch(event, { item: item, context: context });
            },
        }
    });

})(jQuery, Vue, Core, Shell);

(function($, Vue, Core, Shell) {

    Vue.component('shell-container', {
        template: '#shell-container',
        props: {
            globals: Object,
            settings: Object,
            page: Object,
        },
    });

})(jQuery, Vue, Core, Shell);

(function($, Vue, Core, Shell) {

    var runtime = Vue.service('runtime', {

        evaluate: function(self, b, v) {

            if (b && b.expression) {

                try {
                    if (b.strategy == 'eval') {
                        var value = self.$eval(b.expression);
                        return value;
                    } else if (b.strategy == 'wire') {
                        var value = self.$get(b.expression);
                        // console.log('value', value, b);
                        return value;
                    } else {
                        return self.$interpolate(b.expression);
                    }
                } catch (e) {
                    console.log('Cannot evaluate expression', b.expression);
                    return v;
                }
            }

            return v;
        },

        evaluateParams: function(self, props, params) {

            var items = [];
            for (var i = 0; i < props.length; i++) {
                var prop = props[i];
                var param = params && params[prop.name];
                items.push({
                    prop: prop,
                    param: param || {},
                });
            }

            var value = {};
            for (var i = 0; i < items.length; i++) {

                var item = items[i];

                var n = item.prop.name;
                var r = item.prop.variable;
                var b = item.param.binding;
                var v = item.param.value;

                if (item.prop.type == 'object') {
                    // TODO Implement
                } else if (item.prop.type == 'multiple') {

                    if (b && b.expression) {

                        var vv = null;

                        var array = [];
                        var result = runtime.evaluate(self, b, v);

                        if (r) {
                            vv = result;
                        } else {

                            if ($.isArray(result)) {

                                for (var j = 0; j < result.length; j++) {

                                    var vm = new Vue({
                                        data: Object.assign(JSON.parse(JSON.stringify(self.$data)), {
                                            item: {
                                                index: j,
                                                value: result[j],
                                            }
                                        })
                                    });

                                    array.push(this.evaluateParams(vm, item.prop.props, b.params));
                                }

                                vv = array;
                            }
                        }

                    } else {

                        var array = [];

                        var index = 0;
                        for(var j = 0; j < v.length; j++) {
                            var vi = v[j];
                            if (vi._action != 'remove') {
                                array[index++] = this.evaluateParams(self, item.prop.props, vi);
                            }
                        }

                        vv = r ? { value: array } : array;
                    }

                    value[n] = vv;

                } else {

                    var vv = runtime.evaluate(self, b, v);
                    value[n] = vv;
                }
            }

            // console.log(value);
            return value;
        }
    });

    function stub(title, subtitle) {
        return Vue.service('palette').stub();
        // return {
        //     type: 'NTR1XDefaultBundle/Stub',
        //     _action: 'ignore',
        //     params: {
        //         title: { value: title },
        //         subtitle: { value: subtitle }
        //     }
        // }
    }

    var DecoratorMixin = {

        props: {
            items: Array,
        },

        methods: {

            removeWidget: function() {
                this.$dispatch('removeChildWidget', { item: this.model });
            },

            doApply: function(model) {

                Object.assign(this.model, JSON.parse(JSON.stringify(model)), {
                    _action: this.model._action
                        ? this.model._action
                        : 'update'
                });

                $(window).trigger('resize');
            },

            showSettings: function() {

                var dialog = new Shell.Widgets.ModalEditor({

                    data: {
                        globals: this.globals,
                        owner: this,
                        context: {
                            widget: this.widget
                        },
                        original: this.model,
                        current: JSON.parse(JSON.stringify(this.model))
                    },

                    methods: {
                        submit: function() {
                            this.owner.doApply(this.current);
                            this.$remove();
                            this.$destroy();
                        },
                        reset: function() {
                            this.$remove();
                            this.$destroy();
                        }
                    }
                }).$mount().$appendTo($('body').get(0));
            },
        },
    };

    var BindingsMixin = {

        data: function() {
            return {
                bindings: this.bindings,
            };
        },

        created: function() {

            this.$watch('data', (data) => {
                var bindings = runtime.evaluateParams(this, this.widget.props, this.model.params);
                this.$set('bindings', bindings);
            }, {
                deep: true,
                immediate: true,
            });

            this.$watch('storage', (storage) => {
                var bindings = runtime.evaluateParams(this, this.widget.props, this.model.params);
                this.$set('bindings', bindings);
            }, {
                deep: true,
                immediate: true,
            });

            this.$watch('model', (model) => {
                var bindings = runtime.evaluateParams(this, this.widget.props, model.params)
                this.$set('bindings', bindings);
            }, {
                deep: true,
                immediate: true,
            });
        }
    };

    var CompositeMixin = {

        data: function() {
            return {
                children: this.children,
            };
        },

        created: function() {

            this.$watch('items', (items) => {

                var children = [];
                if (items) {
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        if (item._action != 'remove') {
                            children.push(item);
                        }
                    }
                }

                if (children.length < 1) {
                    children.push(JSON.parse(JSON.stringify(this.stub())));
                }

                this.children = children;
            }, {
                immediate: true,
                deep: true,
            });
        },

        events: {

            removeChildWidget: function(data) {

                var item = data.item;

                if (item._action == 'create') {
                    this.items.$remove(item);
                } else {
                    item._action = 'remove';
                }

                this.items = this.items.slice();
            },
        },
    };

    var SortableMixin = function (selector) {

        function find(children, domIndex) {

            var index = 0;
            for (var i = 0; i < children.length && index < domIndex; i++) {

                var child = children[i];

                if (child._action != 'remove') {
                    index++;
                }
            }

            return index;
        }

        return {

            data: function() {

                return {
                    selected: this.selected,
                };
            },

            created: function() {

                if (this.$route.private) {

                    var shell = Vue.service('shell');

                    var self = this;
                    this.$watch('selected', function(selected) {

                        if (selected) {

                            console.log(selector, self.$el);
                            self.sortable =
                            Sortable.create($(selector, self.$el).get(0), {

                                group: {
                                    name: 'widgets',
                                    pull: 'clone',
                                },
                                animation: 150,

                                onAdd: function (evt) {

                                    var palette = $(evt.item).closest('.ge.ge-palette');

                                    var w = $(evt.item).data('widget');

                                    if (w) {

                                        if (!palette.length) {

                                            $(evt.item).remove();

                                            var ni = find(self.items, evt.newIndex);

                                            // TODO Initialize params in service layer

                                            self.items.splice(ni, 0, Vue.service('palette').widget(w));
                                        }

                                    } else {

                                        var dragged = {
                                            vue: evt.from.__dragged__,
                                            item: $('.ge.ge-widget', evt.item),
                                            clone: $('.ge.ge-widget', evt.clone),
                                        };

                                        var container = $(evt.to).closest('.ge.ge-widget').get(0).__vue__;

                                        var ni = find(self.items, evt.newIndex);

                                        var newItem = JSON.parse(JSON.stringify(dragged.vue.model));
                                        newItem._action = 'create';
                                        delete newItem.resource.id;
                                        delete newItem.id;

                                        dragged.item.remove();

                                        container.items.splice(ni, 0, newItem);
                                        container.items = container.items.slice();
                                    }
                                },

                                onStart: function (evt) {
                                    evt.from.__dragged__ = $('.ge.ge-widget', evt.item).get(0).__vue__;
                                },

                                onRemove: function(evt) {

                                    var dragged = {
                                        vue: evt.from.__dragged__,
                                        item: $('.ge.ge-widget', evt.item),
                                        clone: $('.ge.ge-widget', evt.clone),
                                    };

                                    var stack =  dragged.vue.$parent.$parent.$parent;

                                    dragged.clone.remove();

                                    if (dragged.vue.model._action == 'create') {
                                        stack.items.$remove(dragged.vue.model);
                                    } else {
                                        dragged.vue.model._action = 'remove';
                                    }

                                    stack.items = stack.items.slice();
                                },

                                onUpdate: function (evt) {

                                    var oi = self.items.indexOf(evt.from.__dragged__.model);
                                    var ni = find(self.items, evt.newIndex);

                                    if (oi != ni) {
                                        self.items.splice(ni, 0, self.items.splice(oi, 1)[0]);
                                        self.items = self.items.slice();
                                    }
                                },

                                onEnd: function (evt) {

                                    delete evt.from.__dragged__;
                                }
                            });

                        } else {

                            if (self.sortable) {
                                self.sortable.destroy();
                                self.sortable = null;
                            }
                        }
                    }, {
                        immediate: true
                    });
                }
            },

            methods: {
                selectTarget: function() {
                    this.selected = true;
                },

                unselectTarget: function() {
                    this.selected = false;
                },
            }
        };
    };

    Vue.component('shell-decorator-stub', {
        template: '#shell-decorator-stub',
        mixins: [ DecoratorMixin, BindingsMixin ],
        props: {
            globals: Object,
            settings: Object,
            stack: Object,
            page: Object,
            data: Object,
            storage: Object,
            model: Object,
            widget: Object,
            editable: Boolean,
            items: Array,
        },
    });

    Vue.component('shell-decorator-widget', {
        template: '#shell-decorator-widget',
        mixins: [ DecoratorMixin, BindingsMixin ],
        props: {
            globals: Object,
            settings: Object,
            stack: Object,
            page: Object,
            data: Object,
            storage: Object,
            model: Object,
            widget: Object,
            editable: Boolean,
            items: Array,
        },
    });

    Vue.component('shell-decorator-horisontal', {
        template: '#shell-decorator-horisontal',
        mixins: [ DecoratorMixin, CompositeMixin, SortableMixin('>.ge.ge-content >.wg.wg-default-stack >.wg.wg-content >.wg.wg-table >.wg.wg-row'), BindingsMixin ],
        props: {
            globals: Object,
            settings: Object,
            stack: Object,
            page: Object,
            data: Object,
            storage: Object,
            model: Object,
            widget: Object,
            editable: Boolean,
            items: Array,
        },
        methods: {
            stub: function() { return stub('Horisontal Stack', 'Drop Here'); }
        },
    });

    Vue.component('shell-decorator-vertical', {
        template: '#shell-decorator-vertical',
        mixins: [ DecoratorMixin, CompositeMixin, SortableMixin('>.ge.ge-content >.wg.wg-default-stack >.wg.wg-content >.wg.wg-table'), BindingsMixin ],
        props: {
            globals: Object,
            settings: Object,
            stack: Object,
            page: Object,
            data: Object,
            storage: Object,
            model: Object,
            widget: Object,
            editable: Boolean,
            items: Array,
        },
        methods: {
            stub: function() { return stub('Vertical Stack', 'Drop Here'); }
        },
    });

    Vue.component('shell-decorator-canvas', {
        template: '#shell-decorator-canvas',
        mixins: [ CompositeMixin, SortableMixin('>.ge.ge-content >.wg.wg-default-stack >.wg.wg-content >.wg.wg-table') ],
        props: {
            globals: Object,
            settings: Object,
            stack: Object,
            page: Object,
            data: Object,
            storage: Object,
            editable: Boolean,
            items: Array,
        },
        created: function() {
            this.selected = true;
        },
        methods: {
            stub: function() { return stub('Vertical Stack', 'Drop Here'); }
        },
    });

})(jQuery, Vue, Core, Shell);

(function($, Vue, Core, Shell) {

    Vue.component('shell-domains', {
        template: '#shell-domains',
        props: {
            domains: Array,
            globals: Object,
        },
    });

})(jQuery, Vue, Core, Shell);

(function($, Vue, Core, Shell) {

    Shell.Loader =
    Vue.component('shell-loader', {
        template: '#shell-loader',
        data: function() {
            return {
                portal: null,
                settings: null,
            }
        },
        created: function() {
            Vue.service('portals').get({ id: this.$route.params.portal }).then(
                (d) => {
                    this.$set('portal', d.data.portal);
                    this.$set('settings', d.data.settings);
                },
                (e) => {
                    console.log(e);
                }
            );
        }
    });

})(jQuery, Vue, Core, Shell);

(function($, Vue, Core, Shell) {

    Vue.component('shell-page', {
        template: '#shell-page',
        mixins: [ /*Core.ContainerMixin, Core.SortableMixin*/ ],
        props: {
            globals: Object,
            settings: Object,
            page: Object,
        },
        data: function() {
            return {
                decorator: this.decorator,
                data: this.data,
                storage: this.storage,
                pageSettings: {},
            };
        },
        created: function() {

            var runtime = Vue.service('runtime');

            this.decorator = 'shell-decorator-canvas';
            this.data = {};
            this.storage = {};

            this.$watch('page.resource', (resource) => {
                this.$set('pageSettings.width', '960px'); // default
                if (resource) {
                    for (param in resource.params) {
                        this.$set('pageSettings.' + resource.params[param].name, resource.params[param].value);
                    }
                }
            }, {
                immediate: true,
                deep: true,
            });

            this.$watch('page.storages', (storages) => {

                if (storages) {

                    var storage = {};

                    for (var i = 0; i < storages.length; i++) {

                        var st = storages[i];
                        storage[st.name] = {};

                        for (var j = 0; j < st.variables.length; j++) {

                            var variable = st.variables[j];
                            storage[st.name][variable.name] = {
                                value: runtime.evaluate(this, variable.binding, variable.value) || null
                            };
                        }
                    }

                    this.$set('storage', storage);
                }
            }, {
                immediate: true,
                deep: true,
            });

            this.$watch('page.sources', (sources) => {

                if (sources) {

                    var deferred = [];
                    for (var i = 0; i < sources.length; i++) {
                        deferred.push(this.doRequest(sources[i]));
                    }

                    if (deferred.length > 1) {

                        $.when.apply(this, deferred).done(function() {
                            var data = {};
                            for (var i = 0; i < arguments.length; i++) {
                                data[sources[i].name] = arguments[i][0];
                            }
                            this.$set('data', data);
                        }.bind(this));

                    } else if (deferred.length == 1) {

                        deferred[0].done(function(d) {
                            var data = {};
                            data[sources[0].name] = d;
                            this.$set('data', data);
                        }.bind(this));
                    }
                }

            }, {
                immediate: true,
                deep: true,
            });
        },
        methods: {
            doRequest: function(s) {
                var query = {};
                for (var i = 0; i < s.params.length; i++) {
                    var param = s.params[i];
                    if (param.in == 'query' && param.specified) {

                        var value = param.binding
                                ? this.$interpolate(param.binding) // TODO Interpolate in page context
                                : param.value
                            ;

                        query[param.name] = value;
                    }
                }

                return $.ajax({
                    method: s.method,
                    url: s.url,
                    dataType: "json",
                    data: query,
                });
            }
        },
    });

})(jQuery, Vue, Core, Shell);

(function($, Vue, Core, Shell) {

    Vue.component('shell-pages', {
        template: '#shell-pages',
        props: {
            pages: Array,
            globals: Object,
        },
    });

})(jQuery, Vue, Core, Shell);

(function($, Vue, Core, Shell) {

    var PaletteItem =
    Vue.component('shell-palette-item', {
        template: '#shell-palette-item',
        props: {
            category: Object,
            group: Object,
            item: Object,
            globals: Object,
        },
        ready: function() {
            Sortable.create(this.$el, {
                group: {
                    name: 'widgets',
                    pull: 'clone',
                    put: false
                },
                animation: 150,
                sort: false,
            });
        }
    });

    Vue.component('shell-palette', {
        template: '#shell-palette',
        props: {
            globals: Object,
            category: Object,
        },
        data: function() {
            return {
                categories: this.categories
            };
        },
        components: {
            'palette-item': PaletteItem
        },
        created: function() {
            this.categories = Widgets.Palette.categories();
        },
        methods: {
            // groups: function(category) {
            //     return Widgets.Palette.category(category).groups();
            // },
            // items: function(category, group) {
            //     return Widgets.Palette.category(category).groups();
            // },
            trigger: function(event, item, context) {
                console.log(event, item, context);
                this.$dispatch(event, { item: item, context: context });
            },
        },
    });

})(jQuery, Vue, Core, Shell);

(function($, Vue, Core, Shell) {

    Shell.Shell = {
        props: {
            settings: Object,
            model: Object,
        },
        data: function() {
            return {
                globals: this.globals,
            };
        },
        created: function() {

            // Vue.service('shell', {
            //
            //     getWidget: (id) => {
            //
            //         console.log(id);
            //
            //         // for (var i = 0; i < this.settings.widgets.length; i++) {
            //         //     var w = this.settings.widgets[i];
            //         //     if (w.id == id) {
            //         //         return w;
            //         //     }
            //         // }
            //
            //         return null;
            //     },
            // });

            this.globals = {
                selection: {
                    category: null,
                    page: null,
                    source: null,
                    storage: null,
                },
                settings: this.settings,
                model: this.model,
            };
        },
    };

    Shell.ShellPublic =
    Vue.component('shell-public', {
        mixins: [ Shell.Shell ],
        template: '#shell-public',
    });

    Shell.ShellPrivate =
    Vue.component('shell-private', {

        mixins: [ Shell.Shell ],
        template: '#shell-private',

        created: function() {

            function relevant(current, collection) {

                if (!current || current._action == 'remove' || (collection && collection.indexOf(current) < 0)) {

                    if (collection) {
                        for (var i = 0; i < collection.length; i++) {
                            var c = collection[i];
                            if (c._action != 'remove') {
                                return c;
                            }
                        }
                    }

                    return null;
                }

                if (current && current._action == 'remove') {
                    return null;
                }

                return current;
            }

            // this.$watch('settings.categories', (categories) => {
            //
            //     var category = null;
            //     if (categories.length > 0) {
            //         category = categories[0];
            //         // var sub = categories[0];
            //         // if (categories.length > 0) {
            //         //     category = sub.categories[0];
            //         // }
            //     }
            //     this.globals.selection.category = category;
            // }, {
            //     immediate: true,
            // });

            this.globals.selection.category = Vue.service('palette').categories()[0];

            this.$watch('model.domains', (domains) => {
                this.globals.selection.domain = relevant(this.globals.selection.domain, domains);
            }, {
                immediate: true,
            });

            this.$watch('model.pages', (pages) => {
                this.globals.selection.page = relevant(this.globals.selection.page, pages);
            }, {
                immediate: true,
            });

            this.$watch('globals.selection.page.sources', (sources) => {
                this.globals.selection.source = relevant(this.globals.selection.source, sources);
            }, {
                immediate: true,
            });

            this.$watch('globals.selection.page.storages', (storages) => {
                this.globals.selection.storage = relevant(this.globals.selection.storage, storages);
            }, {
                immediate: true,
            });

        },
        methods: {

            // getWidget: function(id) {
            //
            //     for (var i = 0; i < this.settings.widgets.length; i++) {
            //         var w = this.settings.widgets[i];
            //         if (w.id == id) {
            //             return w;
            //         }
            //     }
            //
            //     return null;
            // },
        },
        events: {
            pull: function(data) {
                $.ajax({
                    url: '/settings',
                    method: 'GET',
                    dataType: "json"
                })
                .done((d) => {
                    Object.assign(this.model, d);
                })
            },
            push: function(data) {
                $.ajax({
                    url: '/settings/do-update',
                    method: 'POST',
                    dataType: "json",
                    data: JSON.stringify(this.model),
                    contentType: "application/json",
                })
                .done((d) => {
                    Object.assign(this.model, d);
                })
            },
            selectCategory: function(data) {
                this.globals.selection.category = data.item;
            },
            selectDomain: function(data) {
                this.globals.selection.domain = data.item;
            },
            selectPage: function(data) {
                this.globals.selection.page = data.item;
            },
            selectSource: function(data) {
                this.globals.selection.source = data.item;
            },
            selectStorage: function(data) {
                this.globals.selection.storage = data.item;
            },
        }
    });

})(jQuery, Vue, Core, Shell);

(function($, Vue, Core, Shell) {

    Vue.component('shell-sources', {
        template: '#shell-sources',
        props: {
            sources: Array,
            globals: Object,
        },
    });

})(jQuery, Vue, Core, Shell);

// (function($, Vue, Core, Shell) {
//
//     Vue.component('shell-stacked', {
//         template: '#shell-stacked',
//         mixins: [ Core.Stacked ]
//     });
//
// })(jQuery, Vue, Core, Shell);

(function($, Vue, Core, Shell) {

    Vue.component('shell-storages', {
        template: '#shell-storages',
        props: {
            storages: Array,
            globals: Object,
        },
    });

})(jQuery, Vue, Core, Shell);

(function($, Vue, Core, Shell) {

    Vue.component('shell-stub', {
        template: '#shell-stub',
        props: {
        },
    });

})(jQuery, Vue, Core, Shell);

(function($, Vue, Core, Shell) {

    Vue.component('shell-target', {
        template: '#shell-target',
        props: {
        },
    });

})(jQuery, Vue, Core, Shell);

(function($, Vue, Core, Shell) {

    Shell.Widget =
    Vue.component('shell-widget', {
        template: '#shell-widget',
        mixins: [ /* Core.DecoratorMixin, Core.ContainerMixin, Core.SortableMixin, Core.BindingsMixin */ ],
        props: {
            globals: Object,
            settings: Object,
            page: Object,
            stack: Object,
            model: Object,
            data: Object,
            storage: Object,
            editable: Boolean,
        },
        init: function() {
            this.decorators = {
                alternatives: {
                    // 'default-stack-page': function() { Object.assign(this, { selector: '.wg.wg-table', stub: stub('Vertical Stack', 'Drop Here') }) },
                    // 'default-stack-horisontal': function() { Object.assign(this, { selector: '.wg.wg-row', stub: stub('Horisontal Stack', 'Drop Here') }) },
                    // 'default-stack-vertical': function() { Object.assign(this, { selector: '.wg.wg-table', stub: stub('Vertical Stack', 'Drop Here') }) },
                    'default-stack-horisontal': 'shell-decorator-horisontal',
                    'default-stack-vertical': 'shell-decorator-vertical',
                    'default-stub': 'shell-decorator-stub',
                },
                fallback: 'shell-decorator-widget',
            };
        },
        created: function() {

            // console.log('widget');

            var shell = Vue.service('shell');

            console.log(this.model);
            // this.widget = shell.getWidget(this.model.type);
            this.widget = this.model;
            this.decorator = this.decorators.alternatives[this.model.tag] || this.decorators.fallback;

            // console.log(this.$route);
            // this.decorator = 'shell-decorator-stub';
        },
        data: function() {

            return {
                widget: this.widget,
                decorator: this.decorator,
                // items: this.widgets,
            };
        },
    });

})(jQuery, Vue, Core, Shell);

(function(Vue, $, Core, Shell) {

    var SourcesListViewer =
    Vue.component('pages-sources-list', {
        template: '#pages-sources-list',
        mixins: [Core.ListViewerMixin],
    });

    var SourcesModalEditor =
    Vue.component('pages-sources-dialog', {
        template: '#pages-sources-dialog',
        mixins: [Core.ModalEditorMixin],
        methods: {
            check: function() {
                console.log('check');
            }
        }
    });

    var SourcesEditor =
    Vue.component('pages-sources', {
        mixins: [Core.EditorMixin(SourcesListViewer, SourcesModalEditor)],
        template: '#pages-sources',
    });

    var SourcesParamsListViewer =
    Vue.component('pages-sources-params-list', {
        template: '#pages-sources-params-list',
        mixins: [Core.ListViewerMixin],
    });

    var SourcesParamsModalEditor =
    Vue.component('pages-sources-params-dialog', {
        template: '#pages-sources-params-dialog',
        mixins: [Core.ModalEditorMixin],
    });

    var SourcesParamsEditor =
    Vue.component('pages-sources-params', {
        mixins: [Core.EditorMixin(SourcesParamsListViewer, SourcesParamsModalEditor)],
        template: '#pages-sources-params',
    });

})(Vue, jQuery, Core, Shell);

(function(Vue, $, Core, Shell) {

    var WidgetsListViewer =
    Vue.component('pages-widgets-list', {
        template: '#pages-widgets-list',
        mixins: [Core.ListViewerMixin],
        methods: {
            getWidget: function(w) {
                for (var i = 0; i < this.globals.widgets.length; i++) {
                    var widget = this.globals.widgets[i];
                    if (w.type == widget.id) {
                        return widget;
                    }
                }
                return null;
            }
        }
    });

    var WidgetsModalEditor = Shell.Widgets.ModalEditor =
    Vue.component('pages-widgets-dialog', {
        template: '#pages-widgets-dialog',
        mixins: [Core.ModalEditorMixin, Core.TabsMixin('data')],
        created: function() {

            var items = [];

            for (var i = 0; i < this.context.widget.props.length; i++) {

                var prop = this.context.widget.props[i];

                // TODO Move to service layer
                var param = this.current.params[prop.name] = this.current.params[prop.name] || {
                    _action: 'create',
                    value: (prop.type == 'multiple' ? [] : null),
                    binding: {
                        strategy: null,
                        expression: null,
                        params: (prop.type == 'multiple' ? null : undefined),
                    },
                };

                param._action = param._action == 'update'
                    ? 'update'
                    : 'create'
                ;

                var item = {
                    prop: prop,
                    param: param,
                };

                items.push(item);
            }

            this.items = items;
        },
        data: function() {
            return {
                context: this.context,
                items: this.items,
            };
        },
        methods: {

            hasProps: function(tab) {
                if (this.context.widget && this.context.widget.props) {
                    for (var i = 0; i < this.context.widget.props.length; i++) {
                        var prop = this.context.widget.props[i];
                        if (prop.tab == tab) return true;
                    }
                }
                return false;
            }
        }
    });

    var WidgetsEditor =
    Vue.component('pages-widgets', {
        mixins: [Core.EditorMixin(WidgetsListViewer, WidgetsModalEditor)],
        template: '#pages-widgets',
        props: {
            widget: Object
        },
        methods: {

            proto: function(widget) {

                var data = {
                    type: widget.id,
                    params: {},
                    resource: {
                        params: [],
                    }
                };

                var params = {};

                for (var i = 0; i < widget.props.length; i++) {

                    var prop = widget.props[i];
                    // TODO Move to service layer
                    params[prop.name] = {
                        _action: 'create',
                        value: (prop.type == 'multiple' ? [] : null),
                        binding: {
                            strategy: null,
                            expression: null,
                            params: (prop.type == 'multiple' ? null : undefined),
                        },
                    };
                }

                data.params = params;

                return data;
            },
        }
    });

})(Vue, jQuery, Core, Shell);

var Widgets =
(function($, Vue, Core) {

    Widgets = {};

    Widgets.Palette = (function() {

        var map = {};
        var arr = [];

        var categories = function() { return arr; }
        var category = function(name, category) {

            if (name in map) {
                return map[name];
            } else {
                map[name] = category;
                arr.push(category);
            }

            return this;
        }

        var widget = function(path) {
            var segments = path.split('/');
            return $.extend(true, {}, this.category(segments[0]).group(segments[1]).item(segments[2]).widget, {
                _action: 'create',
                resource: {
                    params: [],
                    _action: 'create'
                },
            });
        }

        var stub = function() {
            return {
                tag: 'default-stub',
                _action: 'ignore',
                props: [
                    { name: 'title', type: 'string' }
                ],
                params: {
                    title: { value: 'Drop here' },
                }
            };
        }

        return {
            categories: categories,
            category: category,
            widget: widget,
            stub: stub,
        };
    })();

    Widgets.Category = function(name, title) {

        var map = {};
        var arr = [];

        var groups = function() { return arr; }
        var group = function(name, group) {

            if (name in map) {
                return map[name];
            } else {
                map[name] = group;
                arr.push(group);
            }

            return this;
        }

        Widgets.Palette.category(name, {
            name: name,
            title: title,
            groups: groups,
            group: group,
        });

        return Widgets.Palette.category(name);
    };

    Widgets.Group = function(category, name, title) {

        var map = {};
        var arr = [];

        var items = function() { return arr; }
        var item = function(name, item) {

            if (name in map) {
                return map[name];
            } else {
                map[name] = item;
                arr.push(item);
            }

            return this;
        }

        category.group(name, {
            name: name,
            title: title,
            items: items,
            item: item,
        });

        return category.group(name);
    };

    Widgets.extend = function(config) {

        var result = {
            tag: config.tag,
            tabs: [],
            props: [],
            params: {},
        };

        if (config.mixins) {

            for (var i = 0; i < config.mixins.length; i++) {
                var m = config.mixins[i];
                if ('tabs' in m) result.tabs = result.tabs.concat(m.tabs);
                if ('props' in m) result.props = result.props.concat(m.props);
                if ('params' in m) result.params = $.extend(true, result.params, m.params);
            }
        }

        if ('tabs' in config) result.tabs = result.tabs.concat(config.tabs);
        if ('props' in config) result.props = result.props.concat(config.props);
        if ('params' in config) result.params = $.extend(true, result.params, config.params);

        console.log(config, result);

        return result;
    };

    Widgets.Item = function(group, name, config) {

        group.item(name, {
            name: name,
            thumbnail: config.thumbnail,
            widget: config.widget,
        });

        return group.item(name);
    };

    Widgets.Prop = function(name, title, type, tab, placeholder) {
        return {
            name: name,
            title: title,
            type: type,
            tab: tab,
            placeholder: placeholder,
        };
    }

    Widgets.Param = function(value, binding, strategy) {
        return {
            value: value || undefined,
        }
    }

    Vue.service('palette', Widgets.Palette);

    return Widgets;

})(jQuery, Vue, Core);

(function($, Vue, Core, Widgets) {

    Widgets.WidgetMixin = {
        tabs: [
            { name: 'data', title: 'Data' },
            { name: 'appearance', title: 'Appearance' },
            { name: 'content', title: 'Content' },
        ],
        props: [
            { name: 'id', title: 'ID', type: 'string', tab: 'data', placeholder: 'Unique ID' },
        ],
    };

    Widgets.BoxMixin = {
        props: [
            { name: 'margin', title: 'Margin', type: 'string', placeholder: '0px 0px', tab: 'appearance' },
            { name: 'padding', title: 'Padding', type: 'string', placeholder: '0px 0px', tab: 'appearance' },
            { name: 'innerBorder', title: 'Inner Border', type: 'string', placeholder: 'solid 1px #000000', tab: 'appearance' },
            { name: 'innerBackground', title: 'Inner Background', type: 'string', placeholder: '#FFFFFF', tab: 'appearance' },
            { name: 'innerBackgroundSize', title: 'Inner Background Size', type: 'string', placeholder: 'cover', tab: 'appearance' },
            { name: 'outerBorder', title: 'Outer Border', type: 'string', placeholder: 'solid 1px #000000', tab: 'appearance' },
            { name: 'outerBackground', title: 'Outer Background', type: 'string', placeholder: '#FFFFFF', tab: 'appearance' },
            { name: 'outerBackgroundSize', title: 'Outer Background Size', type: 'string', placeholder: 'cover', tab: 'appearance' },
        ],
    };

    Widgets.SizeMixin = {
        props: [
            { name: 'width', title: 'Width', type: 'string', placeholder: '100px', tab: 'appearance' },
            { name: 'height', title: 'Height', type: 'string', placeholder: '100px', tab: 'appearance' },
        ]
    }

})(jQuery, Vue, Core, Widgets);

(function($, Vue, Core, Widgets) {

    Widgets.FormCategory = Widgets.Category('default-form', 'Form Elements');
    Widgets.ButtonsGroup = Widgets.Group(Widgets.FormCategory, 'default-form-buttons', 'Buttons');
    Widgets.InputsGroup = Widgets.Group(Widgets.FormCategory, 'default-form-inputs', 'Inputs');

    Widgets.ButtonWidget = function(title, stereotype) {

        return Widgets.extend({
            tag: 'default-button',
            mixins: [ Widgets.WidgetMixin, Widgets.BoxMixin, Widgets.SizeMixin ],
            props: [
                { name: 'title', title: 'Title', type: 'string', tab: 'content' },
                { name: 'type', title: 'Type', type: 'string', tab: 'data' },
                { name: 'stereotype', title: 'Stereotype', type: 'string', tab: 'data' },
            ],
            params: {
                margin:     Widgets.Param('15px'),
                type:       Widgets.Param('button'),
                title:      Widgets.Param(title),
                stereotype: Widgets.Param(stereotype),
            },
        });
    };

    Widgets.Item(Widgets.ButtonsGroup, 'button-default', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/button/button-default.png',
        widget: Widgets.ButtonWidget('Default', 'default'),
    });

    Widgets.Item(Widgets.ButtonsGroup, 'button-primary', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/button/button-primary.png',
        widget: Widgets.ButtonWidget('Primary', 'primary'),
    });

    Widgets.Item(Widgets.ButtonsGroup, 'button-success', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/button/button-success.png',
        widget: Widgets.ButtonWidget('Success', 'success'),
    });

    Widgets.Item(Widgets.ButtonsGroup, 'button-info', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/button/button-info.png',
        widget: Widgets.ButtonWidget('Info', 'info'),
    });

    Widgets.Item(Widgets.ButtonsGroup, 'button-warning', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/button/button-warning.png',
        widget: Widgets.ButtonWidget('Warning', 'warning'),
    });

    Widgets.Item(Widgets.ButtonsGroup, 'button-danger', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/button/button-danger.png',
        widget: Widgets.ButtonWidget('Danger', 'danger'),
    });

    Widgets.Item(Widgets.ButtonsGroup, 'button-link', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/button/button-link.png',
        widget: Widgets.ButtonWidget('Link', 'link'),
    });

})(jQuery, Vue, Core, Widgets);

(function($, Vue, Core, Widgets) {

    Widgets.TextCategory = Widgets.Category('default-text', 'Text Elements');
    Widgets.HeadingsGroup = Widgets.Group(Widgets.TextCategory, 'default-text-headings', 'Headings');
    Widgets.BlocksGroup = Widgets.Group(Widgets.TextCategory, 'default-text-blocks', 'Blocks');

})(jQuery, Vue, Core, Widgets);


Shell = window.Shell || {};

(function($, Vue, Core, Shell, undefined) {
    
    Vue.component('default-stack-canvas', {
        template: '#default-stack-canvas',
        mixins: [ Core.StackedMixin ],
    });

    Vue.component('default-stack-horisontal', {
        template: '#default-stack-horisontal',
        mixins: [ Core.WidgetMixin, Core.StackedMixin ],
    });

    Vue.component('default-stack-vertical', {
        template: '#default-stack-vertical',
        mixins: [ Core.WidgetMixin, Core.StackedMixin ],
    });

})(jQuery, Vue, Core, Shell);

(function($, Vue, Core, Widgets) {

    Vue.component('default-button', {
        template: '#default-button',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core, Widgets);

(function($, Vue, Core) {

    Vue.component('default-box', {
        template: '#default-box',
        props: {
            bindings: Object,
            class: String,
        }
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-placeholder', {
        template: '#default-placeholder',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-stub', {
        template: '#default-stub',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

var Landing =
(function($, Vue, Core, Shell) {

    Landing = {};

    $(document).ready(function() {

        $('[data-vue-app]').each(function(index, element) {

            var data = $(element).data();

            var App = Vue.extend({
                data: function() {
                    return data;
                },
                created: function() {

                    Vue.service('security', Core.SecurityFactory(this));
                    Vue.service('portals', Core.PortalsFactory(this));
                },
            });

            var router = new VueRouter({
                history: true,
            });

            router.beforeEach(function(transition) {

                if (transition.to.auth && !router.app.principal) {
                    transition.abort();
                } else if (transition.to.anon && router.app.principal) {
                    transition.abort();
                } else {
                    transition.next();
                }
            });

            var routes = {
                '/': {
                    component: Landing.LandingPage,
                },
                '/gallery': {
                    component: Landing.LandingGalleryPage,
                },
                '/storage': {
                    component: Landing.LandingStoragePage,
                },
                '/signin': {
                    component: Landing.LandingSigninPage,
                    anon: true,
                },
                '/signup': {
                    component: Landing.LandingSignupPage,
                    anon: true,
                },
                '/manage': {
                    component: Landing.LandingManagePage,
                    auth: true,
                },
                '/manage-create': {
                    component: Landing.LandingManageCreatePage,
                    auth: true,
                },
                '/site/:portal/:page': {
                    component: Shell.ShellPublic,
                    auth: true,
                },
                '/manage/:portal': {
                    component: Shell.Loader,
                    auth: true,
                    private: true,
                },
                '/manage/:portal/:page': {
                    component: Shell.Loader,
                    auth: true,
                    private: true,
                },
            };

            function createRoute(page) {
                return {
                    component: Shell.ShellPublic.extend({
                        data: function() {
                            return {
                                page: page,
                            };
                        }
                    }),
                };
            }

            if (data.model) {
                for (var i = 0; i < data.model.pages.length; i++) {

                    var page = data.model.pages[i];
                    routes[page.name] = createRoute(page);
                }
            }

            router.map(routes);

            router.start(App, $('[data-vue-body]', element).get(0));
        });
    });

    return Landing;

})(jQuery, Vue, Core, Shell);

(function($, Vue, Core, Shell, Landing) {

    Landing.LandingPage =
    Vue.component('landing-page', {
        template: '#landing-page',
    });

    Landing.LandingGalleryPage =
    Vue.component('landing-gallery-page', {
        template: '#landing-gallery-page',
    });

    Landing.LandingStoragePage =
    Vue.component('landing-storage-page', {
        template: '#landing-storage-page',
    });

    Landing.LandingSigninPage =
    Vue.component('landing-signin-page', {
        template: '#landing-signin-page',
    });

    Landing.LandingSignupPage =
    Vue.component('landing-signup-page', {
        template: '#landing-signup-page',
    });

    Landing.LandingProfilePage =
    Vue.component('landing-profile-page', {
        template: '#landing-profile-page',
    });

    Landing.LandingManagePage =
    Vue.component('landing-manage-page', {
        template: '#landing-manage-page',
    });

    Landing.LandingManageCreatePage =
    Vue.component('landing-manage-create-page', {
        template: '#landing-manage-create-page',
    });

})(jQuery, Vue, Core, Shell, Landing);

(function($, Vue, Core, Shell, Landing) {

    Core.PortalsFactory = function(owner) {

        return {

            load: (data) => new Promise((resolve, reject) => {

                owner.$http.get('/ws/portals', data).then(
                    (d) => { resolve(d); },
                    (e) => { reject(e); }
                );
            }),

            create: (data) => new Promise((resolve, reject) => {

                owner.$http.post('/ws/portals', data).then(
                    (d) => { resolve(d); },
                    (e) => { reject(e); }
                );
            }),

            remove: (data) => new Promise((resolve, reject) => {

                owner.$http.delete('/ws/portals', data).then(
                    (d) => { resolve(d); },
                    (e) => { reject(e); }
                );
            }),

            get: (data) => new Promise((resolve, reject) => {

                owner.$http.get(`/ws/portals/${data.id}`).then(
                    (d) => { resolve(d); },
                    (e) => { reject(e); }
                );
            }),
        };
    }

})(jQuery, Vue, Core, Shell, Landing);

(function($, Vue, Core, Shell, Landing) {

    Core.SecurityFactory = function(owner) {

        return {

            signup: (data) => new Promise((resolve, reject) => {

                owner.$http.post('/ws/signup', data).then(
                    (d) => { owner.principal = d.data.principal; resolve(d); },
                    (e) => { owner.principal = null; reject(e); }
                );
            }),

            signin: (data) => new Promise((resolve, reject) => {

                owner.$http.post('/ws/signin', data).then(
                    (d) => { owner.principal = d.data.principal; resolve(d); },
                    (e) => { owner.principal = null; reject(e); }
                );
            }),

            signout: () => new Promise((resolve, reject) => {

                owner.$http.post('/ws/signout').then(
                    (d) => { owner.principal = null; resolve(d); },
                    (e) => { reject(e); }
                );
            }),
        };
    }

})(jQuery, Vue, Core, Shell, Landing);

(function($, Vue, Core, Shell, Landing) {

    var validation = {
        email: "/^([a-zA-Z0-9_\\.\\-]+)@([a-zA-Z0-9_\\.\\-]+)\\.([a-zA-Z0-9]{2,})$/g",
    };

    Landing.Signin =
    Vue.component('landing-account-signin', {
        template: '#landing-account-signin',
        data: function() {
            return {
                form: this.form,
                validation: validation,
            }
        },
        created: function() {
            this.$set('form', {
                email: null,
                password: null,
            });
        },
        methods: {
            signin: function() {

                Vue.service('security').signin({
                    email: this.form.email,
                    password: this.form.password,
                }).then(
                    (d) => { this.$router.go('/'); },
                    (e) => { }
                );
            }
        },
    });

    Landing.Signup =
    Vue.component('landing-account-signup', {
        template: '#landing-account-signup',
        data: function() {
            return {
                form: this.form,
                validation: validation,
            }
        },
        created: function() {
            this.$set('form', {
                email: null,
                password: null,
            });
        },
        methods: {
            signup: function() {

                Vue.service('security').signup({
                    email: this.form.email,
                    password: this.form.password,
                }).then(
                    (d) => { this.$router.go('/'); },
                    (e) => { }
                );
            }
        },
    });

    Landing.Profile =
    Vue.component('landing-account-profile', {
        template: '#landing-account-profile',
    });

})(jQuery, Vue, Core, Shell, Landing);



(function($, Vue, Core, Shell, Landing) {

    Landing.Feedback =
    Vue.component('landing-feedback', {
        template: '#landing-feedback',
    });

})(jQuery, Vue, Core, Shell, Landing);

(function($, Vue, Core, Shell, Landing) {

    Landing.Footer =
    Vue.component('landing-footer', {
        template: '#landing-footer',
    });

})(jQuery, Vue, Core, Shell, Landing);

(function($, Vue, Core, Shell, Landing) {

    Landing.Gallery =
    Vue.component('landing-gallery', {
        template: '#landing-gallery',
    });

    Landing.GalleryFull =
    Vue.component('landing-gallery-full', {
        template: '#landing-gallery-full',
    });

})(jQuery, Vue, Core, Shell, Landing);

(function($, Vue, Core, Shell, Landing) {

    Landing.Header =
    Vue.component('landing-header', {
        template: '#landing-header',
        methods: {
            signout: function() {
                Vue.service('security').signout().then(
                    (d) => { this.$router.go('/'); },
                    (e) => { }
                );
            }
        },
    });

})(jQuery, Vue, Core, Shell, Landing);

(function($, Vue, Core, Shell, Landing) {

    Landing.Manage =
    Vue.component('landing-manage', {

        template: '#landing-manage',
        data: function() {
            return {
                url: window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: ''),
                portals: this.portals,
            };
        },
        created: function() {
            this.refresh();
        },
        methods: {

            refresh: function() {
                Vue.service('portals').load().then(
                    (d) => { this.$set('portals', d.data.portals); },
                    (e) => { this.$set('portals', []); }
                );
            },

            remove: function(id) {
                Vue.service('portals').remove({
                    id: id,
                })
                .then(
                    (d) => { this.refresh(); },
                    (e) => { }
                );
            },
        }
    });

    Landing.ManageCreate =
    Vue.component('landing-manage-create', {
        template: '#landing-manage-create',
        data: function() {
            return {
                form: this.form,
            }
        },
        created: function() {
            this.$set('form', {
                title: null,
            });
        },
        methods: {

            create: function() {
                Vue.service('portals').create({
                    title: this.form.title,
                })
                .then(
                    (d) => { this.$router.go('/manage')},
                    (e) => { }
                );
            },
        }
    });

})(jQuery, Vue, Core, Shell, Landing);

(function($, Vue, Core, Shell, Landing) {

    Landing.Storage =
    Vue.component('landing-pricing', {
        template: '#landing-pricing',
    });

})(jQuery, Vue, Core, Shell, Landing);

(function($, Vue, Core, Shell, Landing) {

    Landing.Storage =
    Vue.component('landing-storage', {
        template: '#landing-storage',
    });

    Landing.StorageFull =
    Vue.component('landing-storage-full', {
        template: '#landing-storage-full',
    });

})(jQuery, Vue, Core, Shell, Landing);

(function($, Vue, Core, Shell, Landing) {

    Landing.Super =
    Vue.component('landing-super', {
        template: '#landing-super',
    });

})(jQuery, Vue, Core, Shell, Landing);

(function($, Vue, Core, Shell, Landing) {

    Landing.Usecases =
    Vue.component('landing-usecases', {
        template: '#landing-usecases',
    });

})(jQuery, Vue, Core, Shell, Landing);

(function($, Vue, Core, Shell, Landing) {

    Landing.Video =
    Vue.component('landing-video', {
        template: '#landing-video',
    });

})(jQuery, Vue, Core, Shell, Landing);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiY29tcG9uZW50cy9lZGl0b3IuanMiLCJjb21wb25lbnRzL2Zvcm0uanMiLCJjb21wb25lbnRzL2dyaWQuanMiLCJjb21wb25lbnRzL2lubGluZS5qcyIsImNvbXBvbmVudHMvbWl4aW5zLmpzIiwiY29tcG9uZW50cy9tb2RhbC5qcyIsImRpcmVjdGl2ZXMvYWZmaXguanMiLCJkaXJlY3RpdmVzL2NvbWJvLmpzIiwiZGlyZWN0aXZlcy9kYXRlLmpzIiwiZGlyZWN0aXZlcy9yaWNoLmpzIiwiZGlyZWN0aXZlcy9zY3JvbGxhYmxlLmpzIiwiZGlyZWN0aXZlcy90YWdzLmpzIiwiZmlsdGVycy9pbmRleC5qcyIsImhvb2tzL21vZGFsLmpzIiwicGx1Z2lucy9jb250YWluZXIuanMiLCJ2YWxpZGF0b3JzL2VtYWlsLmpzIiwiZWRpdG9yL2JpbmRpbmdzL2JpbmRpbmdzLmpzIiwiZWRpdG9yL2RvbWFpbnMvZG9tYWlucy5qcyIsImVkaXRvci9wYWdlcy9wYWdlcy5qcyIsImVkaXRvci9wYXJhbXMvcGFyYW1zLmpzIiwiZWRpdG9yL3NjaGVtZXMvc2NoZW1lcy5qcyIsImVkaXRvci9zZXR0aW5ncy9zZXR0aW5ncy5qcyIsImVkaXRvci9zdG9yYWdlcy9zdG9yYWdlcy5qcyIsImVkaXRvci93aWRnZXRzL3dpZGdldHMuanMiLCJzaGVsbC9hY3Rpb25zL2FjdGlvbnMuanMiLCJzaGVsbC9icmFuZC9icmFuZC5qcyIsInNoZWxsL2NhdGVnb3JpZXMvY2F0ZWdvcmllcy5qcyIsInNoZWxsL2NvbnRhaW5lci9jb250YWluZXIuanMiLCJzaGVsbC9kZWNvcmF0b3IvZGVjb3JhdG9yLmpzIiwic2hlbGwvZG9tYWlucy9kb21haW5zLmpzIiwic2hlbGwvbG9hZGVyL2xvYWRlci5qcyIsInNoZWxsL3BhZ2UvcGFnZS5qcyIsInNoZWxsL3BhZ2VzL3BhZ2VzLmpzIiwic2hlbGwvcGFsZXR0ZS9wYWxldHRlLmpzIiwic2hlbGwvc2hlbGwvc2hlbGwuanMiLCJzaGVsbC9zb3VyY2VzL3NvdXJjZXMuanMiLCJzaGVsbC9zdGFja2VkL3N0YWNrZWQuanMiLCJzaGVsbC9zdG9yYWdlcy9zdG9yYWdlcy5qcyIsInNoZWxsL3N0dWIvc3R1Yi5qcyIsInNoZWxsL3RhcmdldC90YXJnZXQuanMiLCJzaGVsbC93aWRnZXQvd2lkZ2V0LmpzIiwiZWRpdG9yL3BhZ2VzL3NvdXJjZXMvc291cmNlcy5qcyIsImVkaXRvci9wYWdlcy93aWRnZXRzL3dpZGdldHMuanMiLCJ3aWRnZXRzLmpzIiwid2lkZ2V0cy93aWRnZXRzLmpzIiwid2lkZ2V0cy9mb3JtL2Zvcm0uanMiLCJ3aWRnZXRzL3RleHQvdGV4dC5qcyIsIndpZGdldHMvdXRpbHMvdXRpbHMuanMiLCJ3aWRnZXRzL2NvbnRhaW5lci9zdGFjay9zdGFjay5qcyIsIndpZGdldHMvZm9ybS9idXR0b24vYnV0dG9uLmpzIiwid2lkZ2V0cy91dGlscy9ib3gvYm94LmpzIiwid2lkZ2V0cy91dGlscy9wbGFjZWhvbGRlci9wbGFjZWhvbGRlci5qcyIsIndpZGdldHMvdXRpbHMvc3R1Yi9zdHViLmpzIiwibGFuZGluZy9sYW5kaW5nLmpzIiwic2VydmljZXMvcG9ydGFscy5qcyIsInNlcnZpY2VzL3NlY3VyaXR5LmpzIiwibGFuZGluZy9hY2NvdW50L2FjY291bnQuanMiLCJsYW5kaW5nL2JlbmVmaXRzL2JlbmVmaXRzLmpzIiwibGFuZGluZy9jb250YWN0cy9jb250YWN0cy5qcyIsImxhbmRpbmcvZmVlZGJhY2svZmVlZGJhY2suanMiLCJsYW5kaW5nL2Zvb3Rlci9mb290ZXIuanMiLCJsYW5kaW5nL2dhbGxlcnkvZ2FsbGVyeS5qcyIsImxhbmRpbmcvaGVhZGVyL2hlYWRlci5qcyIsImxhbmRpbmcvbWFuYWdlL21hbmFnZS5qcyIsImxhbmRpbmcvcHJpY2luZy9wcmljaW5nLmpzIiwibGFuZGluZy9zdG9yYWdlL3N0b3JhZ2UuanMiLCJsYW5kaW5nL3N1cGVyL3N1cGVyLmpzIiwibGFuZGluZy91c2VjYXNlcy91c2VjYXNlcy5qcyIsImxhbmRpbmcvdmlkZW8vdmlkZW8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QWhCUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBaUJWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdGdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUEE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FyRFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FzRDVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEVBO0FDQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIExhbmRpbmcgPVxuKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIExhbmRpbmcgPSB7fTtcblxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICQoJ1tkYXRhLXZ1ZS1hcHBdJykuZWFjaChmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xuXG4gICAgICAgICAgICB2YXIgZGF0YSA9ICQoZWxlbWVudCkuZGF0YSgpO1xuXG4gICAgICAgICAgICB2YXIgQXBwID0gVnVlLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3NlY3VyaXR5JywgQ29yZS5TZWN1cml0eUZhY3RvcnkodGhpcykpO1xuICAgICAgICAgICAgICAgICAgICBWdWUuc2VydmljZSgncG9ydGFscycsIENvcmUuUG9ydGFsc0ZhY3RvcnkodGhpcykpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFyIHJvdXRlciA9IG5ldyBWdWVSb3V0ZXIoe1xuICAgICAgICAgICAgICAgIGhpc3Rvcnk6IHRydWUsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcm91dGVyLmJlZm9yZUVhY2goZnVuY3Rpb24odHJhbnNpdGlvbikge1xuXG4gICAgICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24udG8uYXV0aCAmJiAhcm91dGVyLmFwcC5wcmluY2lwYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbi5hYm9ydCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHJhbnNpdGlvbi50by5hbm9uICYmIHJvdXRlci5hcHAucHJpbmNpcGFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb24uYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uLm5leHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFyIHJvdXRlcyA9IHtcbiAgICAgICAgICAgICAgICAnLyc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBMYW5kaW5nLkxhbmRpbmdQYWdlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJy9nYWxsZXJ5Jzoge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IExhbmRpbmcuTGFuZGluZ0dhbGxlcnlQYWdlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJy9zdG9yYWdlJzoge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IExhbmRpbmcuTGFuZGluZ1N0b3JhZ2VQYWdlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJy9zaWduaW4nOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nU2lnbmluUGFnZSxcbiAgICAgICAgICAgICAgICAgICAgYW5vbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICcvc2lnbnVwJzoge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IExhbmRpbmcuTGFuZGluZ1NpZ251cFBhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGFub246IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnL21hbmFnZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBMYW5kaW5nLkxhbmRpbmdNYW5hZ2VQYWdlLFxuICAgICAgICAgICAgICAgICAgICBhdXRoOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJy9tYW5hZ2UtY3JlYXRlJzoge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IExhbmRpbmcuTGFuZGluZ01hbmFnZUNyZWF0ZVBhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGF1dGg6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnL3NpdGUvOnBvcnRhbC86cGFnZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBTaGVsbC5TaGVsbFB1YmxpYyxcbiAgICAgICAgICAgICAgICAgICAgYXV0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICcvbWFuYWdlLzpwb3J0YWwnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogU2hlbGwuTG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICBhdXRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBwcml2YXRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJy9tYW5hZ2UvOnBvcnRhbC86cGFnZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBTaGVsbC5Mb2FkZXIsXG4gICAgICAgICAgICAgICAgICAgIGF1dGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHByaXZhdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNyZWF0ZVJvdXRlKHBhZ2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IFNoZWxsLlNoZWxsUHVibGljLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlOiBwYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkYXRhLm1vZGVsKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLm1vZGVsLnBhZ2VzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhZ2UgPSBkYXRhLm1vZGVsLnBhZ2VzW2ldO1xuICAgICAgICAgICAgICAgICAgICByb3V0ZXNbcGFnZS5uYW1lXSA9IGNyZWF0ZVJvdXRlKHBhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcm91dGVyLm1hcChyb3V0ZXMpO1xuXG4gICAgICAgICAgICByb3V0ZXIuc3RhcnQoQXBwLCAkKCdbZGF0YS12dWUtYm9keV0nLCBlbGVtZW50KS5nZXQoMCkpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBMYW5kaW5nO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSkge1xuXG4gICAgQ29yZS5UYWJzTWl4aW4gPSBmdW5jdGlvbihhY3RpdmUpIHtcblxuICAgICAgICByZXR1cm4ge1xuXG4gICAgICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0YWJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmU6IGFjdGl2ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgbWV0aG9kczoge1xuXG4gICAgICAgICAgICAgICAgYWN0aXZhdGU6IGZ1bmN0aW9uKHRhYikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnMuYWN0aXZlID0gdGFiO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBpc0FjdGl2ZTogZnVuY3Rpb24odGFiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRhYnMuYWN0aXZlID09IHRhYjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBDb3JlLkFjdGlvbk1peGluID0gZnVuY3Rpb24oTW9kYWxFZGl0b3IpIHtcblxuICAgICAgICByZXR1cm4ge1xuXG4gICAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXG4gICAgICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IE9iamVjdCxcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG1ldGhvZHM6IHtcblxuICAgICAgICAgICAgICAgIG9wZW46IGZ1bmN0aW9uKGNvbnRleHQpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgZGlhbG9nID0gbmV3IE1vZGFsRWRpdG9yKHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvd25lcjogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0IHx8IHRoaXMuY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbDogdGhpcy5tb2RlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3duZXIuZG9BcHBseSh0aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkuJG1vdW50KCkuJGFwcGVuZFRvKCQoJ2JvZHknKS5nZXQoMCkpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBkb0FwcGx5OiBmdW5jdGlvbihtb2RlbCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhcHBseScsIG1vZGVsKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ21vZGVsJywgT2JqZWN0LmFzc2lnbihKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG1vZGVsKSksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hY3Rpb246IHRoaXMubW9kZWwuX2FjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy5tb2RlbC5fYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ3Jlc2l6ZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgQ29yZS5FZGl0b3JNaXhpbiA9IGZ1bmN0aW9uKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcblxuICAgICAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgaXRlbSwgY29udGV4dCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgZGlhbG9nID0gbmV3IE1vZGFsRWRpdG9yKHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvd25lcjogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IGl0ZW0gPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW0pKSA6IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vd25lci5kb0NyZWF0ZSh0aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkuJG1vdW50KCkuJGFwcGVuZFRvKCQoJ2JvZHknKS5nZXQoMCkpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kb1JlbW92ZShpdGVtLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgdXBkYXRlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBpdGVtO1xuXG4gICAgICAgICAgICAgICAgICAgIG5ldyBNb2RhbEVkaXRvcih7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxzOiB0aGlzLmdsb2JhbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3duZXI6IHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbDogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3duZXIuZG9VcGRhdGUodGhpcy5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0OiAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkuJG1vdW50KCkuJGFwcGVuZFRvKCQoJ2JvZHknKS5nZXQoMCkpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBkb0NyZWF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaChPYmplY3QuYXNzaWduKHt9LCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW0pKSwgeyBfYWN0aW9uOiAnY3JlYXRlJyB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdpdGVtcycsICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ3Jlc2l6ZScpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGRvVXBkYXRlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLmFjdGl2ZSwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShpdGVtKSksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hY3Rpb246IHRoaXMuYWN0aXZlLl9hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMuYWN0aXZlLl9hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuaXRlbXMgPSAkLmV4dGVuZCh0cnVlLCBbXSwgdGhpcy5pdGVtcyk7Ly90aGlzLml0ZW1zLnNsaWNlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMgPSB0aGlzLml0ZW1zLnNsaWNlKCk7XG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd1cGRhdGUnLCBpdGVtLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy4kc2V0KCdhY3RpdmUnLCBPYmplY3QuYXNzaWduKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpLCB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBfYWN0aW9uOiB0aGlzLmFjdGl2ZS5fYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgPyB0aGlzLmFjdGl2ZS5fYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgOiAndXBkYXRlJ1xuICAgICAgICAgICAgICAgICAgICAvLyB9KSk7XG4gICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vIC8vIHRoaXMuaXRlbXMgPSAkLmV4dGVuZCh0cnVlLCBbXSwgdGhpcy5pdGVtcyk7Ly90aGlzLml0ZW1zLnNsaWNlKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuJHNldCgnaXRlbXMnLCAkLmV4dGVuZCh0cnVlLCBbXSwgdGhpcy5pdGVtcykpO1xuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuYWN0aXZlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgZG9SZW1vdmU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLml0ZW1zLmluZGV4T2YoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5pdGVtc1tpbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5fYWN0aW9uID09ICdjcmVhdGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcy4kcmVtb3ZlKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLl9hY3Rpb24gPSAncmVtb3ZlJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuaXRlbXMgPSAkLmV4dGVuZCh0cnVlLCBbXSwgdGhpcy5pdGVtcyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnaXRlbXMnLCAkLmV4dGVuZCh0cnVlLCBbXSwgdGhpcy5pdGVtcykpO1xuXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24oZGF0YSkgeyB0aGlzLmNyZWF0ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXG4gICAgICAgICAgICAgICAgdXBkYXRlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMudXBkYXRlKGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcbiAgICAgICAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy5yZW1vdmUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxuICAgICAgICAgICAgICAgIGRvQ3JlYXRlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMuZG9DcmVhdGUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxuICAgICAgICAgICAgICAgIGRvVXBkYXRlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMuZG9VcGRhdGUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxuICAgICAgICAgICAgICAgIGRvUmVtb3ZlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMuZG9SZW1vdmUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBDb3JlLkxpc3RWaWV3ZXJNaXhpbiA9IHtcblxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHsgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTsgfSxcbiAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkgeyB0aGlzLiRkaXNwYXRjaCgnY3JlYXRlJywgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0fSApOyB9LFxuICAgICAgICAgICAgdXBkYXRlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7IHRoaXMuJGRpc3BhdGNoKCd1cGRhdGUnLCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHR9ICk7IH0sXG4gICAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHsgdGhpcy4kZGlzcGF0Y2goJ3JlbW92ZScsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dH0gKTsgfSxcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBDb3JlLk1vZGFsRWRpdG9yTWl4aW4gPSB7XG5cbiAgICAgICAgYXR0YWNoZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAkKHRoaXMuJGVsKS5tb2RhbCgnc2hvdycpO1xuICAgICAgICAgICAgJCh0aGlzLiRlbCkub24oJ2hpZGUuYnMubW9kYWwnLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGV0YWNoZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCh0aGlzLiRlbCkubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKCkge30sXG4gICAgICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7fVxuICAgICAgICB9XG4gICAgfTtcblxufSkoVnVlLCBqUXVlcnksIENvcmUpO1xuIiwiLy8gVnVlLmNvbXBvbmVudCgndi1mb3JtJywge1xuLy9cbi8vIFx0cHJvcHM6IHtcbi8vIFx0XHRhY3Rpb246IFN0cmluZyxcbi8vIFx0XHRtZXRob2Q6IFN0cmluZyxcbi8vIFx0XHRpbml0OiBPYmplY3QsXG4vLyBcdFx0ZG9uZTogRnVuY3Rpb24sXG4vLyBcdFx0ZmFpbDogRnVuY3Rpb24sXG4vLyBcdFx0bW9kZWw6IE9iamVjdCxcbi8vIFx0fSxcbi8vXG4vLyBcdC8vIHJlcGxhY2U6IGZhbHNlLFxuLy9cbi8vIFx0Ly8gdGVtcGxhdGU6IGBcbi8vIFx0Ly8gXHQ8Zm9ybT5cbi8vIFx0Ly8gXHRcdDxzbG90Pjwvc2xvdD5cbi8vIFx0Ly8gXHQ8L2Zvcm0+XG4vLyBcdC8vIGAsXG4vL1xuLy8gXHRhY3RpdmF0ZTogZnVuY3Rpb24oZG9uZSkge1xuLy9cbi8vIFx0XHR0aGlzLm9yaWdpbmFsID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKSk7XG4vL1xuLy8gXHRcdCQodGhpcy4kZWwpXG4vL1xuLy8gXHRcdFx0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuLy8gXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG4vLyBcdFx0XHRcdHRoaXMuc3VibWl0KCk7XG4vLyBcdFx0XHR9KVxuLy8gXHRcdFx0Lm9uKCdyZXNldCcsIChlKSA9PiB7XG4vLyBcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcbi8vIFx0XHRcdFx0dGhpcy5yZXNldCgpO1xuLy8gXHRcdFx0fSlcbi8vXG4vLyBcdFx0ZG9uZSgpO1xuLy8gXHR9LFxuLy9cbi8vIFx0ZGF0YTogZnVuY3Rpb24oKSB7XG4vL1xuLy8gXHRcdHJldHVybiB7XG4vLyBcdFx0XHRtb2RlbDogdGhpcy5tb2RlbFxuLy8gXHRcdH07XG4vLyBcdH0sXG4vL1xuLy8gXHRtZXRob2RzOiB7XG4vL1xuLy8gXHRcdHN1Ym1pdDogZnVuY3Rpb24oKSB7XG4vL1xuLy8gXHRcdFx0Ly8gZS5wcmV2ZW50RGVmYXVsdCgpO1xuLy9cbi8vIFx0XHRcdC8vIGNvbnNvbGUubG9nKHRoaXMubW9kZWwpO1xuLy9cbi8vIFx0XHRcdCQuYWpheCh7XG4vLyBcdFx0XHRcdHVybDogdGhpcy5hY3Rpb24sXG4vLyBcdFx0XHRcdG1ldGhvZDogdGhpcy5tZXRob2QsXG4vLyBcdFx0XHRcdGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbi8vIFx0XHRcdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbClcbi8vIFx0XHRcdH0pXG4vLyBcdFx0XHQuZG9uZSgoZCkgPT4ge1xuLy8gXHRcdFx0XHRpZiAoZG9uZSBpbiB0aGlzKSB0aGlzLmRvbmUoZCk7XG4vLyBcdFx0XHR9KVxuLy8gXHRcdFx0LmZhaWwoZnVuY3Rpb24oZSkgeyBpZiAoZmFpbCBpbiB0aGlzKSB0aGlzLmZhaWwoZSk7IH0uYmluZCh0aGlzKSlcbi8vIFx0XHR9LFxuLy9cbi8vIFx0XHRyZXNldDogZnVuY3Rpb24oKSB7XG4vLyBcdFx0XHRPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIHRoaXMub3JpZ2luYWwpO1xuLy8gXHRcdH1cbi8vIFx0fSxcbi8vIH0pO1xuIiwiLy8gKGZ1bmN0aW9uKCQsIFZ1ZSwgdW5kZWZpbmVkKSB7XG4vL1xuLy8gXHQvLyB2YXIgbW9kZWwgPSB7XG4vLyBcdC8vIFx0bGlzdDogW11cbi8vIFx0Ly8gfTtcbi8vIFx0Ly9cbi8vIFx0Ly8gdmFyIGJvZHkgPSBWdWUuZXh0ZW5kKHtcbi8vIFx0Ly8gXHRjcmVhdGVkOiBmdW5jdGlvbigpICB7IHRoaXMuJGRpc3BhdGNoKCdyZWdpc3Rlci1ib2R5JywgdGhpcykgfSxcbi8vIFx0Ly8gfSk7XG4vL1xuLy8gXHRWdWUuY29tcG9uZW50KCdncmlkLXRhYmxlJywge1xuLy9cbi8vIFx0XHRyZXBsYWNlOiBmYWxzZSxcbi8vXG4vLyBcdFx0cHJvcHM6IHtcbi8vIFx0XHRcdGQ6IEFycmF5XG4vLyBcdFx0fSxcbi8vXG4vLyBcdFx0Ly8gZGF0YTogZnVuY3Rpb24oKSB7XG4vLyBcdFx0Ly8gXHRyZXR1cm4ge1xuLy8gXHRcdC8vIFx0XHRpdGVtczogdGhpcy5kLnNsaWNlKDApXG4vLyBcdFx0Ly8gXHR9XG4vLyBcdFx0Ly8gfSxcbi8vXG4vLyBcdFx0bWV0aG9kczoge1xuLy9cbi8vIFx0XHRcdGFkZDogZnVuY3Rpb24oKSB7XG4vLyBcdFx0XHRcdGNvbnNvbGUubG9nKCdhc2Rhc2QnKTtcbi8vIFx0XHRcdFx0dGhpcy5pdGVtcy5wdXNoKHt9KTtcbi8vIFx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5pdGVtcyk7XG4vLyBcdFx0XHR9LFxuLy9cbi8vIFx0XHRcdHJlbW92ZTogZnVuY3Rpb24oaW5kZXgpIHtcbi8vIFx0XHRcdFx0dGhpcy5pdGVtcy5zcGxpY2UoaW5kZXgsIDEpO1xuLy8gXHRcdFx0fVxuLy8gXHRcdH0sXG4vLyBcdH0pO1xuLy9cbi8vIH0pKGpRdWVyeSwgVnVlKTtcbiIsIi8vIFZ1ZS5jb21wb25lbnQoJ2lubGluZS10ZXh0Jyxcbi8vIFx0VnVlLmV4dGVuZCh7XG4vLyBcdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnIF0sXG4vLyBcdFx0dGVtcGxhdGU6IGBcbi8vIFx0XHRcdDxkaXYgY2xhc3M9XCJpbmxpbmUtY29udGFpbmVyXCI+XG4vLyBcdFx0XHRcdDxpbnB1dCBjbGFzcz1cImlubGluZS1jb250cm9sXCIgdHlwZT1cInRleHRcIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiIC8+XG4vLyBcdFx0XHQ8L2Rpdj5cbi8vIFx0XHRgXG4vLyBcdH0pXG4vLyApO1xuLy9cbi8vIFZ1ZS5jb21wb25lbnQoJ2lubGluZS1jaGVja2JveCcsXG4vLyBcdFZ1ZS5leHRlbmQoe1xuLy8gXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJyBdLFxuLy8gXHRcdHRlbXBsYXRlOiBgXG4vLyBcdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxuLy8gXHRcdFx0XHQ8aW5wdXQgY2xhc3M9XCJpbmxpbmUtY2hlY2tib3hcIiB0eXBlPVwiY2hlY2tib3hcIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiIC8+XG4vLyBcdFx0XHQ8L2Rpdj5cbi8vIFx0XHRgXG4vLyBcdH0pXG4vLyApO1xuLy9cbi8vIFZ1ZS5jb21wb25lbnQoJ2lubGluZS1zZWxlY3QnLFxuLy8gXHRWdWUuZXh0ZW5kKHtcbi8vIFx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScsICdvcHRpb25zJyBdLFxuLy8gXHRcdHRlbXBsYXRlOiBgXG4vLyBcdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxuLy8gXHRcdFx0XHQ8c2VsZWN0IGNsYXNzPVwiaW5saW5lLWNvbnRyb2wxXCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIj5cbi8vIFx0XHRcdFx0XHQ8b3B0aW9uIHYtZm9yPVwib3B0aW9uIGluIG9wdGlvbnNcIiB2YWx1ZT1cInt7IG9wdGlvbi5rZXkgfX1cIj57eyBvcHRpb24udmFsdWUgfX08L29wdGlvbj5cbi8vIFx0XHRcdFx0PC9zZWxlY3Q+XG4vLyBcdFx0XHQ8L2Rpdj5cbi8vIFx0XHRgXG4vLyBcdH0pXG4vLyApO1xuLy9cbi8vIFZ1ZS5jb21wb25lbnQoJ2lubGluZS12YWx1ZScsXG4vLyBcdFZ1ZS5leHRlbmQoe1xuLy8gXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJywgJ2NsYXNzJyBdLFxuLy8gXHRcdHRlbXBsYXRlOiBgXG4vLyBcdFx0XHQ8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCIgLz5cbi8vIFx0XHRcdDxzcGFuIDpjbGFzcz1cImNsYXNzXCI+e3sgdmFsdWUgfX08L3NwYW4+XG4vLyBcdFx0YFxuLy8gXHR9KVxuLy8gKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIGZ1bmN0aW9uIGdlbmVyYXRlSWQoKSB7XG5cbiAgICAgICAgdmFyIEFMUEhBQkVUID0gJzAxMjM0NTY3ODlhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJztcbiAgICAgICAgdmFyIElEX0xFTkdUSCA9IDg7XG5cbiAgICAgICAgdmFyIHJ0biA9ICcnO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IElEX0xFTkdUSDsgaSsrKSB7XG4gICAgICAgICAgICBydG4gKz0gQUxQSEFCRVQuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIEFMUEhBQkVULmxlbmd0aCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBydG47XG4gICAgfVxuXG4gICAgQ29yZS5XaWRnZXRNaXhpbiA9IHtcblxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxuICAgICAgICAgICAgc3RhY2s6IE9iamVjdCxcbiAgICAgICAgICAgIGJpbmRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBjaGlsZHJlbjogQXJyYXksXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcbiAgICAgICAgfSxcblxuICAgICAgICBkYXRhOiAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN5c3RlbUlkOiB0aGlzLnN5c3RlbUlkLFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB0aGlzLnJhbmRvbUlkID0gZ2VuZXJhdGVJZCgpO1xuXG4gICAgICAgICAgICAvLyBUT0RPINCj0YHRgtCw0L3QvtCy0LjRgtGMINGA0LDQt9C80LXRgNGLINGA0L7QtNC40YLQtdC70YzRgdC60L7QuSDRj9GH0LXQudC60LhcblxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ2JpbmRpbmdzLmlkJywgZnVuY3Rpb24odmFsdWUpIHtcblxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN5c3RlbUlkID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zeXN0ZW1JZCA9IHRoaXMucmFuZG9tSWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGl0ZW0sIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBDb3JlLlN0YWNrZWRNaXhpbiA9IHtcblxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcbiAgICAgICAgICAgIHN0b3JhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxuICAgICAgICAgICAgY2hpbGRyZW46IEFycmF5LFxuICAgICAgICB9LFxuICAgIH07XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIi8vIFZ1ZS5jb21wb25lbnQoJ21vZGFsJywge1xuLy9cbi8vICAgICBwcm9wczoge1xuLy8gICAgICAgICBpZDogU3RyaW5nLFxuLy8gICAgICAgICBjdXJyZW50OiBPYmplY3QsXG4vLyAgICAgICAgIG9yaWdpbmFsOiBPYmplY3QsXG4vLyAgICAgfSxcbi8vXG4vLyAgICAgbWV0aG9kczoge1xuLy9cbi8vICAgICAgICAgc3VibWl0OiBmdW5jdGlvbihlKSB7XG4vLyAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaCgnc3VibWl0JywgdGhpcy5jdXJyZW50KTtcbi8vICAgICAgICAgICAgIC8vIE9iamVjdC5hc3NpZ24odGhpcy5vcmlnaW5hbCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmN1cnJlbnQpKSk7XG4vLyAgICAgICAgICAgICAkKGUudGFyZ2V0KS5jbG9zZXN0KCcubW9kYWwnKS5tb2RhbCgnaGlkZScpO1xuLy8gICAgICAgICB9LFxuLy9cbi8vICAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKGUpIHtcbi8vICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKCdyZXNldCcsIHRoaXMuY3VycmVudCk7XG4vLyAgICAgICAgICAgICAvLyBPYmplY3QuYXNzaWduKHRoaXMuY3VycmVudCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLm9yaWdpbmFsKSkpO1xuLy8gICAgICAgICAgICAgJChlLnRhcmdldCkuY2xvc2VzdCgnLm1vZGFsJykubW9kYWwoJ2hpZGUnKTtcbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vIH0pO1xuIiwiKGZ1bmN0aW9uKCQsIENvcmUpIHtcblxuICAgIFZ1ZS5kaXJlY3RpdmUoJ2FmZml4Jywge1xuXG4gICAgICAgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgaWYgKCQuZm4uYWZmaXgpIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMuZWwpLmFmZml4KHRoaXMudm0uJGdldCh0aGlzLmV4cHJlc3Npb24pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgIH0sXG4gICAgICAgIHVuYmluZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xuXG4gICAgVnVlLmRpcmVjdGl2ZSgnY29tYm8nLCB7XG5cbiAgICAgICAgYmluZDogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBpZiAoJC5mbi50YWdzaW5wdXQpIHtcblxuICAgICAgICAgICAgICAgICQodGhpcy5lbCkuc2VsZWN0Mih7XG4gICAgICAgICAgICAgICAgICAgIHRhZ3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG11bHRpcGxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlVGFnOiBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBwYXJhbXMudGVybSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBwYXJhbXMudGVybSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdPcHRpb246IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgIH0sXG4gICAgICAgIHVuYmluZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xuXG4gICAgVnVlLmRpcmVjdGl2ZSgnZGF0ZScsIHtcblxuICAgICAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIGlmICgkLmZuLmRhdGVwaWNrZXIpIHtcblxuICAgICAgICAgICAgICAgICQodGhpcy5lbCkuZGF0ZXBpY2tlcih7XG4gICAgICAgICAgICAgICAgICAgIGF1dG9jbG9zZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgdG9kYXlIaWdobGlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdDogXCJ5eXl5LW1tLWRkXCJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgIH0sXG4gICAgICAgIHVuYmluZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xuXG4gICAgVnVlLmRpcmVjdGl2ZSgncmljaCcsIHtcblxuICAgICAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIGlmICh3aW5kb3cuQ0tFRElUT1IpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuZWRpdG9yID0gQ0tFRElUT1IuaW5saW5lKHRoaXMuZWwsIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVzU2V0OiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdCb2xkZXInLCBlbGVtZW50OiAnc3BhbicsIGF0dHJpYnV0ZXM6IHsgJ2NsYXNzJzogJ2V4dHJhYm9sZCd9IH1cbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgdG9vbGJhckdyb3VwczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8geyBuYW1lOiAnY2xpcGJvYXJkJywgICBncm91cHM6IFsgJ2NsaXBib2FyZCcsICd1bmRvJyBdIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB7IG5hbWU6ICdlZGl0aW5nJywgICAgIGdyb3VwczogWyAnZmluZCcsICdzZWxlY3Rpb24nLCAnc3BlbGxjaGVja2VyJyBdIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdsaW5rcycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHsgbmFtZTogJ2Zvcm1zJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6ICd0b29scyd9LFxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6ICdkb2N1bWVudCcsIGdyb3VwczogWydtb2RlJywgJ2RvY3VtZW50JywgJ2RvY3Rvb2xzJ119LFxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6ICdvdGhlcnMnfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiAncGFyYWdyYXBoJywgZ3JvdXBzOiBbJ2xpc3QnLCAnaW5kZW50JywgJ2Jsb2NrcycsICdhbGlnbiddfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnY29sb3JzJ30sXG4gICAgICAgICAgICAgICAgICAgICAgICAnLycsXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ2Jhc2ljc3R5bGVzJywgZ3JvdXBzOiBbJ2Jhc2ljc3R5bGVzJywgJ2NsZWFudXAnXX0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ3N0eWxlcyd9LFxuICAgICAgICAgICAgICAgICAgICAgICAgJy8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnaW5zZXJ0JywgZ3JvdXBzOiBbICdJbWFnZUJ1dHRvbicgXSAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy97bmFtZTogJ2Fib3V0J31cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0b3Iub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVkaXRvci51cGRhdGVFbGVtZW50KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudm0uJHNldCh0aGlzLmV4cHJlc3Npb24sICQodGhpcy5lbCkudmFsKCkpO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmVkaXRvci5zZXREYXRhKHRoaXMudm0uJGdldCh0aGlzLmV4cHJlc3Npb24pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd1cGRhdGUnLCBuZXdWYWx1ZSwgb2xkVmFsdWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVuYmluZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3IuZGVzdHJveSgpO1xuICAgICAgICAgICAgdGhpcy5lZGl0b3IgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy50ZXh0YXJlYSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmlucHV0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIENvcmUpIHtcblxuICAgIFZ1ZS5kaXJlY3RpdmUoJ3Njcm9sbGFibGUnLCB7XG5cbiAgICAgICAgYmluZDogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAvLyAkKHRoaXMuZWwpLmNzcyh7XG4gICAgICAgICAgICAvLyAgICAgJ292ZXJmbG93JzogJ2F1dG8nLFxuICAgICAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgICAgIGlmICgkLmZuLnBlcmZlY3RTY3JvbGxiYXIpIHtcbiAgICAgICAgICAgICAgICBWdWUubmV4dFRpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcy5lbCkucGVyZmVjdFNjcm9sbGJhcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBheGlzOiB0aGlzLmV4cHJlc3Npb25cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgfSxcbiAgICAgICAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBDb3JlKSB7XG5cbiAgICBWdWUuZGlyZWN0aXZlKCd0YWdzJywge1xuXG4gICAgICAgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgaWYgKCQuZm4udGFnc2lucHV0KSB7XG5cbiAgICAgICAgICAgICAgICAkKHRoaXMuZWwpLnRhZ3NpbnB1dCh7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICB9LFxuICAgICAgICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIENvcmUpIHtcblxuICAgIFZ1ZS5maWx0ZXIoJ2pzb25QYXRoJywgZnVuY3Rpb24gKGNvbnRleHQsIHN0cikge1xuICAgICAgICBpZiAoc3RyID09PSB1bmRlZmluZWQgfHwgY29udGV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmUgPSAveyhbXn1dKyl9L2c7XG5cbiAgICAgICAgcmVzdWx0ID0gc3RyLnJlcGxhY2UocmUsIGZ1bmN0aW9uKG1hdGNoLCBleHByKSB7XG4gICAgICAgICAgICBqc29uID0gSlNPTlBhdGgoe1xuICAgICAgICAgICAgICAgIGpzb246IGNvbnRleHQsXG4gICAgICAgICAgICAgICAgcGF0aDogZXhwclxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoanNvbi5oYXNPd25Qcm9wZXJ0eSgxKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnYXJyYXknO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ganNvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHJlc3VsdCA9PSAnYXJyYXknKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTlBhdGgoe1xuICAgICAgICAgICAgICAgIGpzb246IGNvbnRleHQsXG4gICAgICAgICAgICAgICAgcGF0aDogc3RyLnJlcGxhY2UocmUsIFwiJDFcIilcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgVnVlLmZpbHRlcigndGVtcGxhdGUnLCBmdW5jdGlvbiAoc3RyaW5nLCBkYXRhKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgcmUgPSAvJHsoW159XSspfS9nO1xuICAgICAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UocmUsIGZ1bmN0aW9uKG1hdGNoLCBrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhW2tleV07XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgVnVlLmZpbHRlcignYXNzaWduJywgZnVuY3Rpb24gKHRhcmdldCwgc291cmNlMSwgc291cmNlMiwgc291cmNlMykge1xuXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlMSwgc291cmNlMiwgc291cmNlMyk7XG4gICAgfSk7XG5cbiAgICBWdWUuZmlsdGVyKCdjb3B5JywgZnVuY3Rpb24gKHNvdXJjZSkge1xuXG4gICAgICAgIHJldHVybiBuZXcgVnVlKHtcbiAgICAgICAgICAgIGRhdGE6IHNvdXJjZSAhPSBudWxsXG4gICAgICAgICAgICAgICAgPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNvdXJjZSkpXG4gICAgICAgICAgICAgICAgOiBudWxsXG4gICAgICAgIH0pLiRkYXRhO1xuICAgIH0pO1xuXG4gICAgVnVlLmZpbHRlcignY2xvbmUnLCBmdW5jdGlvbiAoc291cmNlKSB7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBWdWUoe1xuICAgICAgICAgICAgZGF0YTogc291cmNlICE9IG51bGxcbiAgICAgICAgICAgICAgICA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc291cmNlKSlcbiAgICAgICAgICAgICAgICA6IG51bGxcbiAgICAgICAgfSkuJGRhdGE7XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xuXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgZnVuY3Rpb24gcmVwb3NpdGlvbihlbGVtZW50KSB7XG5cbiAgICAgICAgICAgIHZhciBtb2RhbCA9ICQoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgZGlhbG9nID0gJCgnLm1vZGFsLWRpYWxvZycsIG1vZGFsKTtcblxuICAgICAgICAgICAgbW9kYWwuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgICAgICAgICBkaWFsb2cuY3NzKFwibWFyZ2luLXRvcFwiLCBNYXRoLm1heCgwLCAoJCh3aW5kb3cpLmhlaWdodCgpIC0gZGlhbG9nLmhlaWdodCgpKSAvIDIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQoJChkb2N1bWVudCksICcubW9kYWwubW9kYWwtY2VudGVyJykub24oJ3Nob3cuYnMubW9kYWwnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZXBvc2l0aW9uKGUudGFyZ2V0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICAgICAgICAkKCcubW9kYWwubW9kYWwtY2VudGVyOnZpc2libGUnKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgcmVwb3NpdGlvbihlbGVtZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS51c2Uoe1xuXG4gICAgICAgIGluc3RhbGw6IGZ1bmN0aW9uKFZ1ZSwgb3B0aW9ucykge1xuXG4gICAgICAgICAgICB2YXIgc2VydmljZXMgPSB7fTtcblxuICAgICAgICAgICAgVnVlLnNlcnZpY2UgPSBmdW5jdGlvbihuYW1lLCBzZXJ2aWNlKSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc2VydmljZXNbbmFtZV0gPSBzZXJ2aWNlc1tuYW1lXSB8fCBzZXJ2aWNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xuXG4gICAgVnVlLnZhbGlkYXRvcignZW1haWwnLCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICByZXR1cm4gL14oKFtePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSsoXFwuW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKykqKXwoXFxcIi4rXFxcIikpQCgoXFxbWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcXSl8KChbYS16QS1aXFwtMC05XStcXC4pK1thLXpBLVpdezIsfSkpJC8udGVzdCh2YWwpXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdiaW5kaW5ncy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2JpbmRpbmdzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHNldFN0cmF0ZWd5OiBmdW5jdGlvbihzdHJhdGVneSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnY3VycmVudC5iaW5kaW5nLnN0cmF0ZWd5Jywgc3RyYXRlZ3kpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldFN0cmF0ZWd5OiBmdW5jdGlvbihzdHJhdGVneSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLiRnZXQoJ2N1cnJlbnQuYmluZGluZy5zdHJhdGVneScpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuY3VycmVudC5iaW5kaW5nKSB0aGlzLmN1cnJlbnQuYmluZGluZyA9IHt9O1xuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgdmFyIEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnYmluZGluZ3MnLCB7XG5cbiAgICAgICAgbWl4aW5zOiBbQ29yZS5BY3Rpb25NaXhpbihNb2RhbEVkaXRvcildLFxuICAgIH0pO1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdkb21haW5zLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignbWFpbicpXSxcbiAgICB9KTtcblxuICAgIHZhciBFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjZG9tYWlucycsXG4gICAgfSk7XG5cblxuICAgIHZhciBTZXR0aW5nc0xpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZG9tYWlucy1zZXR0aW5ncy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIFNldHRpbmdzTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLXNldHRpbmdzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU2V0dGluZ3NFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU2V0dGluZ3NMaXN0Vmlld2VyLCBTZXR0aW5nc01vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtc2V0dGluZ3MnLFxuICAgIH0pO1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ21haW4nKV0sXG4gICAgfSk7XG5cbiAgICB2YXIgRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihMaXN0Vmlld2VyLCBNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcycsXG4gICAgfSk7XG5cblxuICAgIHZhciBTZXR0aW5nc0xpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNldHRpbmdzLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNldHRpbmdzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU2V0dGluZ3NNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc2V0dGluZ3MtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zZXR0aW5ncy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIFNldHRpbmdzRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zZXR0aW5ncycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTZXR0aW5nc0xpc3RWaWV3ZXIsIFNldHRpbmdzTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc2V0dGluZ3MnLFxuICAgIH0pO1xuXG5cbiAgICB2YXIgTWV0YXNMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1tZXRhcy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1tZXRhcy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIE1ldGFzTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLW1ldGFzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtbWV0YXMtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBNZXRhc0VkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtbWV0YXMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTWV0YXNMaXN0Vmlld2VyLCBNZXRhc01vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLW1ldGFzJyxcbiAgICB9KTtcblxufSkoVnVlLCBqUXVlcnksIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsKSB7XG5cbiAgICB2YXIgUGFyYW1TdHJpbmcgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1zdHJpbmcnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1zdHJpbmcnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgaWQ6IFN0cmluZyxcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIFBhcmFtUmljaCA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLXJpY2gnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1yaWNoJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGlkOiBTdHJpbmcsXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBQYXJhbVNvdXJjZSA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLXNvdXJjZScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLXNvdXJjZScsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBpZDogU3RyaW5nLFxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgUGFyYW1NdWx0aXBsZSA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLW11bHRpcGxlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtbXVsdGlwbGUnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgaWQ6IFN0cmluZyxcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLml0ZW0uaXRlbXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIHZhciBQYXJhbXMgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIG93bmVyOiBPYmplY3QsXG4gICAgICAgICAgICB0YWI6IFN0cmluZyxcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxuICAgICAgICB9XG4gICAgfSk7XG5cblxuICAgIHZhciBQYXJhbU11bHRpcGxlTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLW11bHRpcGxlLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1tdWx0aXBsZS1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgcHJvcDogT2JqZWN0LFxuICAgICAgICAgICAgcGFyYW06IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgZ2V0TGFiZWw6IGZ1bmN0aW9uKGl0ZW0pIHtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3AuZGlzcGxheSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdm0gPSBuZXcgVnVlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdm0uJGludGVycG9sYXRlKHRoaXMucHJvcC5kaXNwbGF5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICc8aXRlbT4nO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIFBhcmFtQmluZGluZ3NNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLWJpbmRpbmdzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLWJpbmRpbmdzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogWyBDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdiaW5kaW5nJykgXSxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLml0ZW1zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xuXG4gICAgICAgICAgICB2YXIgYmluZGluZyA9IHRoaXMuY3VycmVudC5iaW5kaW5nIHx8IHt9O1xuICAgICAgICAgICAgaWYgKCFiaW5kaW5nLnN0cmF0ZWd5KSBiaW5kaW5nLnN0cmF0ZWd5ID0gJ2ludGVycG9sYXRlJztcblxuICAgICAgICAgICAgYmluZGluZy5wYXJhbXMgPSBiaW5kaW5nLnBhcmFtcyB8fCB7fTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuY29udGV4dC5wcm9wLnByb3BzKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRleHQucHJvcC5wcm9wcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9wID0gdGhpcy5jb250ZXh0LnByb3AucHJvcHNbaV07XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IGJpbmRpbmcucGFyYW1zW3Byb3AubmFtZV0gPSBiaW5kaW5nLnBhcmFtc1twcm9wLm5hbWVdIHx8IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtLl9hY3Rpb24gPSBwYXJhbS5fYWN0aW9uID09ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgICAgICA/ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgICAgICA6ICdjcmVhdGUnXG4gICAgICAgICAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3A6IHByb3AsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbTogcGFyYW0sXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJHNldCgnY3VycmVudC5iaW5kaW5nJywgYmluZGluZyk7XG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2l0ZW1zJywgaXRlbXMpO1xuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBzZXRTdHJhdGVneTogZnVuY3Rpb24oc3RyYXRlZ3kpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2N1cnJlbnQuYmluZGluZy5zdHJhdGVneScsIHN0cmF0ZWd5KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXRTdHJhdGVneTogZnVuY3Rpb24oc3RyYXRlZ3kpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy4kZ2V0KCdjdXJyZW50LmJpbmRpbmcuc3RyYXRlZ3knKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB2YXIgRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtYmluZGluZ3MnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuQWN0aW9uTWl4aW4oUGFyYW1CaW5kaW5nc01vZGFsRWRpdG9yKV0sXG4gICAgfSk7XG5cbiAgICB2YXIgUGFyYW1NdWx0aXBsZU1vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtbXVsdGlwbGUtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtbXVsdGlwbGUtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignZGF0YScpXSxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLml0ZW1zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY3JlYXRlZCcsIFBhcmFtTXVsdGlwbGVNb2RhbEVkaXRvcik7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZXh0LnByb3AucHJvcHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgICAgIHZhciBwcm9wID0gdGhpcy5jb250ZXh0LnByb3AucHJvcHNbaV07XG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gdGhpcy5jdXJyZW50W3Byb3AubmFtZV0gPSB0aGlzLmN1cnJlbnRbcHJvcC5uYW1lXSB8fCB7IHZhbHVlOiBudWxsIH07XG5cbiAgICAgICAgICAgICAgICBwYXJhbS5fYWN0aW9uID0gcGFyYW0uX2FjdGlvbiA9PSAndXBkYXRlJ1xuICAgICAgICAgICAgICAgICAgICA/ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgIDogJ2NyZWF0ZSdcbiAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogcHJvcCxcbiAgICAgICAgICAgICAgICAgICAgcGFyYW06IHBhcmFtLFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2l0ZW1zJywgaXRlbXMpO1xuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgdmFyIFBhcmFtTXVsdGlwbGVFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1tdWx0aXBsZS1lZGl0b3InLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oUGFyYW1NdWx0aXBsZUxpc3RWaWV3ZXIsIFBhcmFtTXVsdGlwbGVNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtbXVsdGlwbGUtZWRpdG9yJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIHByb3A6IE9iamVjdCxcbiAgICAgICAgICAgIHBhcmFtOiBPYmplY3QsXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgIH0sXG4gICAgfSk7XG5cblxuICAgIHZhciBQYXJhbXNMaXN0ID1cbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLWxpc3QnLFxuICAgICAgICBjb21wb25lbnRzOiB7XG4gICAgICAgICAgICAncGFyYW1zLXN0cmluZyc6IFBhcmFtU3RyaW5nLFxuICAgICAgICAgICAgJ3BhcmFtcy1yaWNoJzogUGFyYW1SaWNoLFxuICAgICAgICAgICAgJ3BhcmFtcy1zb3VyY2UnOiBQYXJhbVNvdXJjZSxcbiAgICAgICAgICAgICdwYXJhbXMtbXVsdGlwbGUnOiBQYXJhbU11bHRpcGxlLFxuICAgICAgICB9LFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgb3duZXI6IE9iamVjdCxcbiAgICAgICAgICAgIHRhYjogU3RyaW5nLFxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0XG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoVnVlLCBqUXVlcnksIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsKSB7XG5cbiAgICB2YXIgTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ21haW4nKV0sXG4gICAgfSk7XG5cbiAgICB2YXIgRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMnLFxuICAgIH0pO1xuXG5cbiAgICB2YXIgU2V0dGluZ3NMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLXNldHRpbmdzLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMtc2V0dGluZ3MtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTZXR0aW5nc01vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLXNldHRpbmdzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1zZXR0aW5ncy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIFNldHRpbmdzRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLXNldHRpbmdzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFNldHRpbmdzTGlzdFZpZXdlciwgU2V0dGluZ3NNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLXNldHRpbmdzJyxcbiAgICB9KTtcblxufSkoVnVlLCBqUXVlcnksIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsKSB7XG5cbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NldHRpbmdzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2V0dGluZ3MtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignZG9tYWlucycpXSxcbiAgICB9KTtcblxuICAgIHZhciBFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NldHRpbmdzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkFjdGlvbk1peGluKE1vZGFsRWRpdG9yKV0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgcHVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL3NldHRpbmdzL2RvLXVwZGF0ZScsXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZG9uZSgoZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIGQpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHVsbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL3NldHRpbmdzJyxcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZG9uZSgoZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIGQpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoVnVlLCBqUXVlcnksIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsKSB7XG5cbiAgICB2YXIgU3RvcmFnZXNMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdzdG9yYWdlcy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzdG9yYWdlcy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIFN0b3JhZ2VzTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3N0b3JhZ2VzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc3RvcmFnZXMtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgY2hlY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjaGVjaycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgU3RvcmFnZXNFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3N0b3JhZ2VzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFN0b3JhZ2VzTGlzdFZpZXdlciwgU3RvcmFnZXNNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNzdG9yYWdlcycsXG4gICAgfSk7XG5cbiAgICB2YXIgU3RvcmFnZXNWYXJpYWJsZXNMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdzdG9yYWdlcy12YXJpYWJsZXMtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc3RvcmFnZXMtdmFyaWFibGVzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU3RvcmFnZXNWYXJpYWJsZXNNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc3RvcmFnZXMtdmFyaWFibGVzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc3RvcmFnZXMtdmFyaWFibGVzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU3RvcmFnZXNWYXJpYWJsZXNFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3N0b3JhZ2VzLXZhcmlhYmxlcycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTdG9yYWdlc1ZhcmlhYmxlc0xpc3RWaWV3ZXIsIFN0b3JhZ2VzVmFyaWFibGVzTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjc3RvcmFnZXMtdmFyaWFibGVzJyxcbiAgICB9KTtcblxufSkoVnVlLCBqUXVlcnksIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsKSB7XG5cbiAgICB2YXIgTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgnd2lkZ2V0cy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyN3aWRnZXRzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3dpZGdldHMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyN3aWRnZXRzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCd3aWRnZXRzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3dpZGdldHMnLFxuICAgIH0pO1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBzY2FsZSA9IDE7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1hY3Rpb25zJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1hY3Rpb25zJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXG4gICAgICAgICAgICBjYXRlZ29yeTogT2JqZWN0LFxuICAgICAgICAgICAgZG9tYWluOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3RcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGl0ZW0sIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHpvb206IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgc2NhbGUgKz0gKGV2ZW50ID09ICdpbicpID8gMC4xIDogLTAuMTtcbiAgICAgICAgICAgICAgICAkKCcuZ2UuZ2UtcGFnZScpLmNzcygndHJhbnNmb3JtJywgJ3NjYWxlKCcgKyBzY2FsZSArICcpJyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtYnJhbmQnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWJyYW5kJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1jYXRlZ29yaWVzJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1jYXRlZ29yaWVzJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IEFycmF5LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgaXRlbSwgY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtY29udGFpbmVyJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1jb250YWluZXInLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG5cbiAgICB2YXIgcnVudGltZSA9IFZ1ZS5zZXJ2aWNlKCdydW50aW1lJywge1xuXG4gICAgICAgIGV2YWx1YXRlOiBmdW5jdGlvbihzZWxmLCBiLCB2KSB7XG5cbiAgICAgICAgICAgIGlmIChiICYmIGIuZXhwcmVzc2lvbikge1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGIuc3RyYXRlZ3kgPT0gJ2V2YWwnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBzZWxmLiRldmFsKGIuZXhwcmVzc2lvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYi5zdHJhdGVneSA9PSAnd2lyZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHNlbGYuJGdldChiLmV4cHJlc3Npb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3ZhbHVlJywgdmFsdWUsIGIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuJGludGVycG9sYXRlKGIuZXhwcmVzc2lvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYW5ub3QgZXZhbHVhdGUgZXhwcmVzc2lvbicsIGIuZXhwcmVzc2lvbik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZXZhbHVhdGVQYXJhbXM6IGZ1bmN0aW9uKHNlbGYsIHByb3BzLCBwYXJhbXMpIHtcblxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHByb3AgPSBwcm9wc1tpXTtcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW0gPSBwYXJhbXMgJiYgcGFyYW1zW3Byb3AubmFtZV07XG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHByb3A6IHByb3AsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtOiBwYXJhbSB8fCB7fSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHZhbHVlID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IGl0ZW1zW2ldO1xuXG4gICAgICAgICAgICAgICAgdmFyIG4gPSBpdGVtLnByb3AubmFtZTtcbiAgICAgICAgICAgICAgICB2YXIgciA9IGl0ZW0ucHJvcC52YXJpYWJsZTtcbiAgICAgICAgICAgICAgICB2YXIgYiA9IGl0ZW0ucGFyYW0uYmluZGluZztcbiAgICAgICAgICAgICAgICB2YXIgdiA9IGl0ZW0ucGFyYW0udmFsdWU7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5wcm9wLnR5cGUgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyBJbXBsZW1lbnRcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0ucHJvcC50eXBlID09ICdtdWx0aXBsZScpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoYiAmJiBiLmV4cHJlc3Npb24pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZ2ID0gbnVsbDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFycmF5ID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gcnVudGltZS5ldmFsdWF0ZShzZWxmLCBiLCB2KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2diA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoJC5pc0FycmF5KHJlc3VsdCkpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJlc3VsdC5sZW5ndGg7IGorKykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdm0gPSBuZXcgVnVlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBPYmplY3QuYXNzaWduKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc2VsZi4kZGF0YSkpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiBqLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdFtqXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyYXkucHVzaCh0aGlzLmV2YWx1YXRlUGFyYW1zKHZtLCBpdGVtLnByb3AucHJvcHMsIGIucGFyYW1zKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2diA9IGFycmF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXJyYXkgPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCB2Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZpID0gdltqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmkuX2FjdGlvbiAhPSAncmVtb3ZlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJheVtpbmRleCsrXSA9IHRoaXMuZXZhbHVhdGVQYXJhbXMoc2VsZiwgaXRlbS5wcm9wLnByb3BzLCB2aSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB2diA9IHIgPyB7IHZhbHVlOiBhcnJheSB9IDogYXJyYXk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YWx1ZVtuXSA9IHZ2O1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgdnYgPSBydW50aW1lLmV2YWx1YXRlKHNlbGYsIGIsIHYpO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZVtuXSA9IHZ2O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBzdHViKHRpdGxlLCBzdWJ0aXRsZSkge1xuICAgICAgICByZXR1cm4gVnVlLnNlcnZpY2UoJ3BhbGV0dGUnKS5zdHViKCk7XG4gICAgICAgIC8vIHJldHVybiB7XG4gICAgICAgIC8vICAgICB0eXBlOiAnTlRSMVhEZWZhdWx0QnVuZGxlL1N0dWInLFxuICAgICAgICAvLyAgICAgX2FjdGlvbjogJ2lnbm9yZScsXG4gICAgICAgIC8vICAgICBwYXJhbXM6IHtcbiAgICAgICAgLy8gICAgICAgICB0aXRsZTogeyB2YWx1ZTogdGl0bGUgfSxcbiAgICAgICAgLy8gICAgICAgICBzdWJ0aXRsZTogeyB2YWx1ZTogc3VidGl0bGUgfVxuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyB9XG4gICAgfVxuXG4gICAgdmFyIERlY29yYXRvck1peGluID0ge1xuXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgIH0sXG5cbiAgICAgICAgbWV0aG9kczoge1xuXG4gICAgICAgICAgICByZW1vdmVXaWRnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKCdyZW1vdmVDaGlsZFdpZGdldCcsIHsgaXRlbTogdGhpcy5tb2RlbCB9KTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGRvQXBwbHk6IGZ1bmN0aW9uKG1vZGVsKSB7XG5cbiAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobW9kZWwpKSwge1xuICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiB0aGlzLm1vZGVsLl9hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy5tb2RlbC5fYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICA6ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBzaG93U2V0dGluZ3M6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGRpYWxvZyA9IG5ldyBTaGVsbC5XaWRnZXRzLk1vZGFsRWRpdG9yKHtcblxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxzOiB0aGlzLmdsb2JhbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBvd25lcjogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQ6IHRoaXMud2lkZ2V0XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IHRoaXMubW9kZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpKVxuICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vd25lci5kb0FwcGx5KHRoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS4kbW91bnQoKS4kYXBwZW5kVG8oJCgnYm9keScpLmdldCgwKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgIH07XG5cbiAgICB2YXIgQmluZGluZ3NNaXhpbiA9IHtcblxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYmluZGluZ3M6IHRoaXMuYmluZGluZ3MsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGJpbmRpbmdzID0gcnVudGltZS5ldmFsdWF0ZVBhcmFtcyh0aGlzLCB0aGlzLndpZGdldC5wcm9wcywgdGhpcy5tb2RlbC5wYXJhbXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnYmluZGluZ3MnLCBiaW5kaW5ncyk7XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ3N0b3JhZ2UnLCAoc3RvcmFnZSkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBiaW5kaW5ncyA9IHJ1bnRpbWUuZXZhbHVhdGVQYXJhbXModGhpcywgdGhpcy53aWRnZXQucHJvcHMsIHRoaXMubW9kZWwucGFyYW1zKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2JpbmRpbmdzJywgYmluZGluZ3MpO1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdtb2RlbCcsIChtb2RlbCkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBiaW5kaW5ncyA9IHJ1bnRpbWUuZXZhbHVhdGVQYXJhbXModGhpcywgdGhpcy53aWRnZXQucHJvcHMsIG1vZGVsLnBhcmFtcylcbiAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2JpbmRpbmdzJywgYmluZGluZ3MpO1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIENvbXBvc2l0ZU1peGluID0ge1xuXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogdGhpcy5jaGlsZHJlbixcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdpdGVtcycsIChpdGVtcykgPT4ge1xuXG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gW107XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1zKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gaXRlbXNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5fYWN0aW9uICE9ICdyZW1vdmUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnN0dWIoKSkpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBldmVudHM6IHtcblxuICAgICAgICAgICAgcmVtb3ZlQ2hpbGRXaWRnZXQ6IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gZGF0YS5pdGVtO1xuXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uX2FjdGlvbiA9PSAnY3JlYXRlJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLiRyZW1vdmUoaXRlbSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5fYWN0aW9uID0gJ3JlbW92ZSc7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtcyA9IHRoaXMuaXRlbXMuc2xpY2UoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIHZhciBTb3J0YWJsZU1peGluID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG5cbiAgICAgICAgZnVuY3Rpb24gZmluZChjaGlsZHJlbiwgZG9tSW5kZXgpIHtcblxuICAgICAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoICYmIGluZGV4IDwgZG9tSW5kZXg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV07XG5cbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQuX2FjdGlvbiAhPSAncmVtb3ZlJykge1xuICAgICAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcblxuICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZDogdGhpcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy4kcm91dGUucHJpdmF0ZSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBzaGVsbCA9IFZ1ZS5zZXJ2aWNlKCdzaGVsbCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ3NlbGVjdGVkJywgZnVuY3Rpb24oc2VsZWN0ZWQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzZWxlY3Rvciwgc2VsZi4kZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc29ydGFibGUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNvcnRhYmxlLmNyZWF0ZSgkKHNlbGVjdG9yLCBzZWxmLiRlbCkuZ2V0KDApLCB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICd3aWRnZXRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1bGw6ICdjbG9uZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogMTUwLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQWRkOiBmdW5jdGlvbiAoZXZ0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYWxldHRlID0gJChldnQuaXRlbSkuY2xvc2VzdCgnLmdlLmdlLXBhbGV0dGUnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHcgPSAkKGV2dC5pdGVtKS5kYXRhKCd3aWRnZXQnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHcpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcGFsZXR0ZS5sZW5ndGgpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGV2dC5pdGVtKS5yZW1vdmUoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmkgPSBmaW5kKHNlbGYuaXRlbXMsIGV2dC5uZXdJbmRleCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyBJbml0aWFsaXplIHBhcmFtcyBpbiBzZXJ2aWNlIGxheWVyXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pdGVtcy5zcGxpY2UobmksIDAsIFZ1ZS5zZXJ2aWNlKCdwYWxldHRlJykud2lkZ2V0KHcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZHJhZ2dlZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdnVlOiBldnQuZnJvbS5fX2RyYWdnZWRfXyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogJCgnLmdlLmdlLXdpZGdldCcsIGV2dC5pdGVtKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvbmU6ICQoJy5nZS5nZS13aWRnZXQnLCBldnQuY2xvbmUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29udGFpbmVyID0gJChldnQudG8pLmNsb3Nlc3QoJy5nZS5nZS13aWRnZXQnKS5nZXQoMCkuX192dWVfXztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuaSA9IGZpbmQoc2VsZi5pdGVtcywgZXZ0Lm5ld0luZGV4KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdJdGVtID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkcmFnZ2VkLnZ1ZS5tb2RlbCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0l0ZW0uX2FjdGlvbiA9ICdjcmVhdGUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBuZXdJdGVtLnJlc291cmNlLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBuZXdJdGVtLmlkO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dlZC5pdGVtLnJlbW92ZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLml0ZW1zLnNwbGljZShuaSwgMCwgbmV3SXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLml0ZW1zID0gY29udGFpbmVyLml0ZW1zLnNsaWNlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25TdGFydDogZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZ0LmZyb20uX19kcmFnZ2VkX18gPSAkKCcuZ2UuZ2Utd2lkZ2V0JywgZXZ0Lml0ZW0pLmdldCgwKS5fX3Z1ZV9fO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVtb3ZlOiBmdW5jdGlvbihldnQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRyYWdnZWQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdnVlOiBldnQuZnJvbS5fX2RyYWdnZWRfXyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiAkKCcuZ2UuZ2Utd2lkZ2V0JywgZXZ0Lml0ZW0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lOiAkKCcuZ2UuZ2Utd2lkZ2V0JywgZXZ0LmNsb25lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGFjayA9ICBkcmFnZ2VkLnZ1ZS4kcGFyZW50LiRwYXJlbnQuJHBhcmVudDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dlZC5jbG9uZS5yZW1vdmUoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdnZWQudnVlLm1vZGVsLl9hY3Rpb24gPT0gJ2NyZWF0ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjay5pdGVtcy4kcmVtb3ZlKGRyYWdnZWQudnVlLm1vZGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dlZC52dWUubW9kZWwuX2FjdGlvbiA9ICdyZW1vdmUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjay5pdGVtcyA9IHN0YWNrLml0ZW1zLnNsaWNlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VcGRhdGU6IGZ1bmN0aW9uIChldnQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9pID0gc2VsZi5pdGVtcy5pbmRleE9mKGV2dC5mcm9tLl9fZHJhZ2dlZF9fLm1vZGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuaSA9IGZpbmQoc2VsZi5pdGVtcywgZXZ0Lm5ld0luZGV4KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9pICE9IG5pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pdGVtcy5zcGxpY2UobmksIDAsIHNlbGYuaXRlbXMuc3BsaWNlKG9pLCAxKVswXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pdGVtcyA9IHNlbGYuaXRlbXMuc2xpY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkVuZDogZnVuY3Rpb24gKGV2dCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZXZ0LmZyb20uX19kcmFnZ2VkX187XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLnNvcnRhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc29ydGFibGUuZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNvcnRhYmxlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICAgICAgc2VsZWN0VGFyZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHVuc2VsZWN0VGFyZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci1zdHViJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kZWNvcmF0b3Itc3R1YicsXG4gICAgICAgIG1peGluczogWyBEZWNvcmF0b3JNaXhpbiwgQmluZGluZ3NNaXhpbiBdLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXG4gICAgICAgICAgICBzdG9yYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3QsXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci13aWRnZXQnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWRlY29yYXRvci13aWRnZXQnLFxuICAgICAgICBtaXhpbnM6IFsgRGVjb3JhdG9yTWl4aW4sIEJpbmRpbmdzTWl4aW4gXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0LFxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1kZWNvcmF0b3ItaG9yaXNvbnRhbCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZGVjb3JhdG9yLWhvcmlzb250YWwnLFxuICAgICAgICBtaXhpbnM6IFsgRGVjb3JhdG9yTWl4aW4sIENvbXBvc2l0ZU1peGluLCBTb3J0YWJsZU1peGluKCc+LmdlLmdlLWNvbnRlbnQgPi53Zy53Zy1kZWZhdWx0LXN0YWNrID4ud2cud2ctY29udGVudCA+LndnLndnLXRhYmxlID4ud2cud2ctcm93JyksIEJpbmRpbmdzTWl4aW4gXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0LFxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHN0dWI6IGZ1bmN0aW9uKCkgeyByZXR1cm4gc3R1YignSG9yaXNvbnRhbCBTdGFjaycsICdEcm9wIEhlcmUnKTsgfVxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtZGVjb3JhdG9yLXZlcnRpY2FsJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kZWNvcmF0b3ItdmVydGljYWwnLFxuICAgICAgICBtaXhpbnM6IFsgRGVjb3JhdG9yTWl4aW4sIENvbXBvc2l0ZU1peGluLCBTb3J0YWJsZU1peGluKCc+LmdlLmdlLWNvbnRlbnQgPi53Zy53Zy1kZWZhdWx0LXN0YWNrID4ud2cud2ctY29udGVudCA+LndnLndnLXRhYmxlJyksIEJpbmRpbmdzTWl4aW4gXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0LFxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHN0dWI6IGZ1bmN0aW9uKCkgeyByZXR1cm4gc3R1YignVmVydGljYWwgU3RhY2snLCAnRHJvcCBIZXJlJyk7IH1cbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci1jYW52YXMnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWRlY29yYXRvci1jYW52YXMnLFxuICAgICAgICBtaXhpbnM6IFsgQ29tcG9zaXRlTWl4aW4sIFNvcnRhYmxlTWl4aW4oJz4uZ2UuZ2UtY29udGVudCA+LndnLndnLWRlZmF1bHQtc3RhY2sgPi53Zy53Zy1jb250ZW50ID4ud2cud2ctdGFibGUnKSBdLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXG4gICAgICAgICAgICBzdG9yYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgc3R1YjogZnVuY3Rpb24oKSB7IHJldHVybiBzdHViKCdWZXJ0aWNhbCBTdGFjaycsICdEcm9wIEhlcmUnKTsgfVxuICAgICAgICB9LFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRvbWFpbnMnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWRvbWFpbnMnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZG9tYWluczogQXJyYXksXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgU2hlbGwuTG9hZGVyID1cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1sb2FkZXInLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWxvYWRlcicsXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwb3J0YWw6IG51bGwsXG4gICAgICAgICAgICAgICAgc2V0dGluZ3M6IG51bGwsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3BvcnRhbHMnKS5nZXQoeyBpZDogdGhpcy4kcm91dGUucGFyYW1zLnBvcnRhbCB9KS50aGVuKFxuICAgICAgICAgICAgICAgIChkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgncG9ydGFsJywgZC5kYXRhLnBvcnRhbCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnc2V0dGluZ3MnLCBkLmRhdGEuc2V0dGluZ3MpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXBhZ2UnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXBhZ2UnLFxuICAgICAgICBtaXhpbnM6IFsgLypDb3JlLkNvbnRhaW5lck1peGluLCBDb3JlLlNvcnRhYmxlTWl4aW4qLyBdLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRlY29yYXRvcjogdGhpcy5kZWNvcmF0b3IsXG4gICAgICAgICAgICAgICAgZGF0YTogdGhpcy5kYXRhLFxuICAgICAgICAgICAgICAgIHN0b3JhZ2U6IHRoaXMuc3RvcmFnZSxcbiAgICAgICAgICAgICAgICBwYWdlU2V0dGluZ3M6IHt9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBydW50aW1lID0gVnVlLnNlcnZpY2UoJ3J1bnRpbWUnKTtcblxuICAgICAgICAgICAgdGhpcy5kZWNvcmF0b3IgPSAnc2hlbGwtZGVjb3JhdG9yLWNhbnZhcyc7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuc3RvcmFnZSA9IHt9O1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgncGFnZS5yZXNvdXJjZScsIChyZXNvdXJjZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNldCgncGFnZVNldHRpbmdzLndpZHRoJywgJzk2MHB4Jyk7IC8vIGRlZmF1bHRcbiAgICAgICAgICAgICAgICBpZiAocmVzb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChwYXJhbSBpbiByZXNvdXJjZS5wYXJhbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgncGFnZVNldHRpbmdzLicgKyByZXNvdXJjZS5wYXJhbXNbcGFyYW1dLm5hbWUsIHJlc291cmNlLnBhcmFtc1twYXJhbV0udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkZWVwOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdwYWdlLnN0b3JhZ2VzJywgKHN0b3JhZ2VzKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAoc3RvcmFnZXMpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcmFnZSA9IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RvcmFnZXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0ID0gc3RvcmFnZXNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBzdG9yYWdlW3N0Lm5hbWVdID0ge307XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3QudmFyaWFibGVzLmxlbmd0aDsgaisrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFyaWFibGUgPSBzdC52YXJpYWJsZXNbal07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmFnZVtzdC5uYW1lXVt2YXJpYWJsZS5uYW1lXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJ1bnRpbWUuZXZhbHVhdGUodGhpcywgdmFyaWFibGUuYmluZGluZywgdmFyaWFibGUudmFsdWUpIHx8IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdzdG9yYWdlJywgc3RvcmFnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkZWVwOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdwYWdlLnNvdXJjZXMnLCAoc291cmNlcykgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZXMpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzb3VyY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5wdXNoKHRoaXMuZG9SZXF1ZXN0KHNvdXJjZXNbaV0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWZlcnJlZC5sZW5ndGggPiAxKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICQud2hlbi5hcHBseSh0aGlzLCBkZWZlcnJlZCkuZG9uZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbc291cmNlc1tpXS5uYW1lXSA9IGFyZ3VtZW50c1tpXVswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdkYXRhJywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGVmZXJyZWQubGVuZ3RoID09IDEpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWRbMF0uZG9uZShmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW3NvdXJjZXNbMF0ubmFtZV0gPSBkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnZGF0YScsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkZWVwOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIGRvUmVxdWVzdDogZnVuY3Rpb24ocykge1xuICAgICAgICAgICAgICAgIHZhciBxdWVyeSA9IHt9O1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcy5wYXJhbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gcy5wYXJhbXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbS5pbiA9PSAncXVlcnknICYmIHBhcmFtLnNwZWNpZmllZCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBwYXJhbS5iaW5kaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy4kaW50ZXJwb2xhdGUocGFyYW0uYmluZGluZykgLy8gVE9ETyBJbnRlcnBvbGF0ZSBpbiBwYWdlIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBwYXJhbS52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlbcGFyYW0ubmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IHMubWV0aG9kLFxuICAgICAgICAgICAgICAgICAgICB1cmw6IHMudXJsLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHF1ZXJ5LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXBhZ2VzJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wYWdlcycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBwYWdlczogQXJyYXksXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgdmFyIFBhbGV0dGVJdGVtID1cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wYWxldHRlLWl0ZW0nLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXBhbGV0dGUtaXRlbScsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBjYXRlZ29yeTogT2JqZWN0LFxuICAgICAgICAgICAgZ3JvdXA6IE9iamVjdCxcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgU29ydGFibGUuY3JlYXRlKHRoaXMuJGVsLCB7XG4gICAgICAgICAgICAgICAgZ3JvdXA6IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3dpZGdldHMnLFxuICAgICAgICAgICAgICAgICAgICBwdWxsOiAnY2xvbmUnLFxuICAgICAgICAgICAgICAgICAgICBwdXQ6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IDE1MCxcbiAgICAgICAgICAgICAgICBzb3J0OiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wYWxldHRlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wYWxldHRlJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIGNhdGVnb3J5OiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjYXRlZ29yaWVzOiB0aGlzLmNhdGVnb3JpZXNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIGNvbXBvbmVudHM6IHtcbiAgICAgICAgICAgICdwYWxldHRlLWl0ZW0nOiBQYWxldHRlSXRlbVxuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuY2F0ZWdvcmllcyA9IFdpZGdldHMuUGFsZXR0ZS5jYXRlZ29yaWVzKCk7XG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIC8vIGdyb3VwczogZnVuY3Rpb24oY2F0ZWdvcnkpIHtcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gV2lkZ2V0cy5QYWxldHRlLmNhdGVnb3J5KGNhdGVnb3J5KS5ncm91cHMoKTtcbiAgICAgICAgICAgIC8vIH0sXG4gICAgICAgICAgICAvLyBpdGVtczogZnVuY3Rpb24oY2F0ZWdvcnksIGdyb3VwKSB7XG4gICAgICAgICAgICAvLyAgICAgcmV0dXJuIFdpZGdldHMuUGFsZXR0ZS5jYXRlZ29yeShjYXRlZ29yeSkuZ3JvdXBzKCk7XG4gICAgICAgICAgICAvLyB9LFxuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGl0ZW0sIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhldmVudCwgaXRlbSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgU2hlbGwuU2hlbGwgPSB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAvLyBWdWUuc2VydmljZSgnc2hlbGwnLCB7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgIGdldFdpZGdldDogKGlkKSA9PiB7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgICAgICBjb25zb2xlLmxvZyhpZCk7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgICAgICAvLyBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2V0dGluZ3Mud2lkZ2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgLy8gICAgICAgICAvLyAgICAgdmFyIHcgPSB0aGlzLnNldHRpbmdzLndpZGdldHNbaV07XG4gICAgICAgICAgICAvLyAgICAgICAgIC8vICAgICBpZiAody5pZCA9PSBpZCkge1xuICAgICAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIHJldHVybiB3O1xuICAgICAgICAgICAgLy8gICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gICAgICAgICAvLyB9XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIC8vICAgICB9LFxuICAgICAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgICAgIHRoaXMuZ2xvYmFscyA9IHtcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb246IHtcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2U6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgc3RvcmFnZTogbnVsbCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzLFxuICAgICAgICAgICAgICAgIG1vZGVsOiB0aGlzLm1vZGVsLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgU2hlbGwuU2hlbGxQdWJsaWMgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXB1YmxpYycsIHtcbiAgICAgICAgbWl4aW5zOiBbIFNoZWxsLlNoZWxsIF0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXB1YmxpYycsXG4gICAgfSk7XG5cbiAgICBTaGVsbC5TaGVsbFByaXZhdGUgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXByaXZhdGUnLCB7XG5cbiAgICAgICAgbWl4aW5zOiBbIFNoZWxsLlNoZWxsIF0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXByaXZhdGUnLFxuXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICBmdW5jdGlvbiByZWxldmFudChjdXJyZW50LCBjb2xsZWN0aW9uKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWN1cnJlbnQgfHwgY3VycmVudC5fYWN0aW9uID09ICdyZW1vdmUnIHx8IChjb2xsZWN0aW9uICYmIGNvbGxlY3Rpb24uaW5kZXhPZihjdXJyZW50KSA8IDApKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29sbGVjdGlvbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjID0gY29sbGVjdGlvbltpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYy5fYWN0aW9uICE9ICdyZW1vdmUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50ICYmIGN1cnJlbnQuX2FjdGlvbiA9PSAncmVtb3ZlJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdGhpcy4kd2F0Y2goJ3NldHRpbmdzLmNhdGVnb3JpZXMnLCAoY2F0ZWdvcmllcykgPT4ge1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vICAgICB2YXIgY2F0ZWdvcnkgPSBudWxsO1xuICAgICAgICAgICAgLy8gICAgIGlmIChjYXRlZ29yaWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgY2F0ZWdvcnkgPSBjYXRlZ29yaWVzWzBdO1xuICAgICAgICAgICAgLy8gICAgICAgICAvLyB2YXIgc3ViID0gY2F0ZWdvcmllc1swXTtcbiAgICAgICAgICAgIC8vICAgICAgICAgLy8gaWYgKGNhdGVnb3JpZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gICAgICAgICAvLyAgICAgY2F0ZWdvcnkgPSBzdWIuY2F0ZWdvcmllc1swXTtcbiAgICAgICAgICAgIC8vICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgIC8vICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLmNhdGVnb3J5ID0gY2F0ZWdvcnk7XG4gICAgICAgICAgICAvLyB9LCB7XG4gICAgICAgICAgICAvLyAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgICAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uY2F0ZWdvcnkgPSBWdWUuc2VydmljZSgncGFsZXR0ZScpLmNhdGVnb3JpZXMoKVswXTtcblxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ21vZGVsLmRvbWFpbnMnLCAoZG9tYWlucykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uZG9tYWluID0gcmVsZXZhbnQodGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5kb21haW4sIGRvbWFpbnMpO1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnbW9kZWwucGFnZXMnLCAocGFnZXMpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnBhZ2UgPSByZWxldmFudCh0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnBhZ2UsIHBhZ2VzKTtcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ2dsb2JhbHMuc2VsZWN0aW9uLnBhZ2Uuc291cmNlcycsIChzb3VyY2VzKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5zb3VyY2UgPSByZWxldmFudCh0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnNvdXJjZSwgc291cmNlcyk7XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdnbG9iYWxzLnNlbGVjdGlvbi5wYWdlLnN0b3JhZ2VzJywgKHN0b3JhZ2VzKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5zdG9yYWdlID0gcmVsZXZhbnQodGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5zdG9yYWdlLCBzdG9yYWdlcyk7XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuXG4gICAgICAgICAgICAvLyBnZXRXaWRnZXQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zZXR0aW5ncy53aWRnZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIHZhciB3ID0gdGhpcy5zZXR0aW5ncy53aWRnZXRzW2ldO1xuICAgICAgICAgICAgLy8gICAgICAgICBpZiAody5pZCA9PSBpZCkge1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgcmV0dXJuIHc7XG4gICAgICAgICAgICAvLyAgICAgICAgIH1cbiAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgLy8gfSxcbiAgICAgICAgfSxcbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICBwdWxsOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL3NldHRpbmdzJyxcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZG9uZSgoZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIGQpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHVzaDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9zZXR0aW5ncy9kby11cGRhdGUnLFxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKSxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmRvbmUoKGQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBkKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlbGVjdENhdGVnb3J5OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5jYXRlZ29yeSA9IGRhdGEuaXRlbTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZWxlY3REb21haW46IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLmRvbWFpbiA9IGRhdGEuaXRlbTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZWxlY3RQYWdlOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5wYWdlID0gZGF0YS5pdGVtO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlbGVjdFNvdXJjZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uc291cmNlID0gZGF0YS5pdGVtO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlbGVjdFN0b3JhZ2U6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnN0b3JhZ2UgPSBkYXRhLml0ZW07XG4gICAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtc291cmNlcycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtc291cmNlcycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBzb3VyY2VzOiBBcnJheSxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIi8vIChmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG4vL1xuLy8gICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXN0YWNrZWQnLCB7XG4vLyAgICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXN0YWNrZWQnLFxuLy8gICAgICAgICBtaXhpbnM6IFsgQ29yZS5TdGFja2VkIF1cbi8vICAgICB9KTtcbi8vXG4vLyB9KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXN0b3JhZ2VzJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1zdG9yYWdlcycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBzdG9yYWdlczogQXJyYXksXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtc3R1YicsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtc3R1YicsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtdGFyZ2V0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC10YXJnZXQnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICB9LFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIFNoZWxsLldpZGdldCA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtd2lkZ2V0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC13aWRnZXQnLFxuICAgICAgICBtaXhpbnM6IFsgLyogQ29yZS5EZWNvcmF0b3JNaXhpbiwgQ29yZS5Db250YWluZXJNaXhpbiwgQ29yZS5Tb3J0YWJsZU1peGluLCBDb3JlLkJpbmRpbmdzTWl4aW4gKi8gXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcbiAgICAgICAgICAgIHN0b3JhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxuICAgICAgICB9LFxuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZGVjb3JhdG9ycyA9IHtcbiAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gJ2RlZmF1bHQtc3RhY2stcGFnZSc6IGZ1bmN0aW9uKCkgeyBPYmplY3QuYXNzaWduKHRoaXMsIHsgc2VsZWN0b3I6ICcud2cud2ctdGFibGUnLCBzdHViOiBzdHViKCdWZXJ0aWNhbCBTdGFjaycsICdEcm9wIEhlcmUnKSB9KSB9LFxuICAgICAgICAgICAgICAgICAgICAvLyAnZGVmYXVsdC1zdGFjay1ob3Jpc29udGFsJzogZnVuY3Rpb24oKSB7IE9iamVjdC5hc3NpZ24odGhpcywgeyBzZWxlY3RvcjogJy53Zy53Zy1yb3cnLCBzdHViOiBzdHViKCdIb3Jpc29udGFsIFN0YWNrJywgJ0Ryb3AgSGVyZScpIH0pIH0sXG4gICAgICAgICAgICAgICAgICAgIC8vICdkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJzogZnVuY3Rpb24oKSB7IE9iamVjdC5hc3NpZ24odGhpcywgeyBzZWxlY3RvcjogJy53Zy53Zy10YWJsZScsIHN0dWI6IHN0dWIoJ1ZlcnRpY2FsIFN0YWNrJywgJ0Ryb3AgSGVyZScpIH0pIH0sXG4gICAgICAgICAgICAgICAgICAgICdkZWZhdWx0LXN0YWNrLWhvcmlzb250YWwnOiAnc2hlbGwtZGVjb3JhdG9yLWhvcmlzb250YWwnLFxuICAgICAgICAgICAgICAgICAgICAnZGVmYXVsdC1zdGFjay12ZXJ0aWNhbCc6ICdzaGVsbC1kZWNvcmF0b3ItdmVydGljYWwnLFxuICAgICAgICAgICAgICAgICAgICAnZGVmYXVsdC1zdHViJzogJ3NoZWxsLWRlY29yYXRvci1zdHViJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZhbGxiYWNrOiAnc2hlbGwtZGVjb3JhdG9yLXdpZGdldCcsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3dpZGdldCcpO1xuXG4gICAgICAgICAgICB2YXIgc2hlbGwgPSBWdWUuc2VydmljZSgnc2hlbGwnKTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5tb2RlbCk7XG4gICAgICAgICAgICAvLyB0aGlzLndpZGdldCA9IHNoZWxsLmdldFdpZGdldCh0aGlzLm1vZGVsLnR5cGUpO1xuICAgICAgICAgICAgdGhpcy53aWRnZXQgPSB0aGlzLm1vZGVsO1xuICAgICAgICAgICAgdGhpcy5kZWNvcmF0b3IgPSB0aGlzLmRlY29yYXRvcnMuYWx0ZXJuYXRpdmVzW3RoaXMubW9kZWwudGFnXSB8fCB0aGlzLmRlY29yYXRvcnMuZmFsbGJhY2s7XG5cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuJHJvdXRlKTtcbiAgICAgICAgICAgIC8vIHRoaXMuZGVjb3JhdG9yID0gJ3NoZWxsLWRlY29yYXRvci1zdHViJztcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgd2lkZ2V0OiB0aGlzLndpZGdldCxcbiAgICAgICAgICAgICAgICBkZWNvcmF0b3I6IHRoaXMuZGVjb3JhdG9yLFxuICAgICAgICAgICAgICAgIC8vIGl0ZW1zOiB0aGlzLndpZGdldHMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBTb3VyY2VzTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU291cmNlc01vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBjaGVjazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2NoZWNrJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBTb3VyY2VzRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFNvdXJjZXNMaXN0Vmlld2VyLCBTb3VyY2VzTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcycsXG4gICAgfSk7XG5cbiAgICB2YXIgU291cmNlc1BhcmFtc0xpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU291cmNlc1BhcmFtc01vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLXBhcmFtcy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU291cmNlc1BhcmFtc0VkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1wYXJhbXMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU291cmNlc1BhcmFtc0xpc3RWaWV3ZXIsIFNvdXJjZXNQYXJhbXNNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLXBhcmFtcycsXG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgdmFyIFdpZGdldHNMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgZ2V0V2lkZ2V0OiBmdW5jdGlvbih3KSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdsb2JhbHMud2lkZ2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgd2lkZ2V0ID0gdGhpcy5nbG9iYWxzLndpZGdldHNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmICh3LnR5cGUgPT0gd2lkZ2V0LmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gd2lkZ2V0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgV2lkZ2V0c01vZGFsRWRpdG9yID0gU2hlbGwuV2lkZ2V0cy5Nb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignZGF0YScpXSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgICAgIHZhciBwcm9wID0gdGhpcy5jb250ZXh0LndpZGdldC5wcm9wc1tpXTtcblxuICAgICAgICAgICAgICAgIC8vIFRPRE8gTW92ZSB0byBzZXJ2aWNlIGxheWVyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gdGhpcy5jdXJyZW50LnBhcmFtc1twcm9wLm5hbWVdID0gdGhpcy5jdXJyZW50LnBhcmFtc1twcm9wLm5hbWVdIHx8IHtcbiAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogJ2NyZWF0ZScsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAocHJvcC50eXBlID09ICdtdWx0aXBsZScgPyBbXSA6IG51bGwpLFxuICAgICAgICAgICAgICAgICAgICBiaW5kaW5nOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJhdGVneTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb246IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IChwcm9wLnR5cGUgPT0gJ211bHRpcGxlJyA/IG51bGwgOiB1bmRlZmluZWQpLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBwYXJhbS5fYWN0aW9uID0gcGFyYW0uX2FjdGlvbiA9PSAndXBkYXRlJ1xuICAgICAgICAgICAgICAgICAgICA/ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgIDogJ2NyZWF0ZSdcbiAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogcHJvcCxcbiAgICAgICAgICAgICAgICAgICAgcGFyYW06IHBhcmFtLFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLml0ZW1zID0gaXRlbXM7XG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0OiB0aGlzLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgaXRlbXM6IHRoaXMuaXRlbXMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgIGhhc1Byb3BzOiBmdW5jdGlvbih0YWIpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb250ZXh0LndpZGdldCAmJiB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZXh0LndpZGdldC5wcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByb3AgPSB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3AudGFiID09IHRhYikgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgV2lkZ2V0c0VkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihXaWRnZXRzTGlzdFZpZXdlciwgV2lkZ2V0c01vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3RcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuXG4gICAgICAgICAgICBwcm90bzogZnVuY3Rpb24od2lkZ2V0KSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogd2lkZ2V0LmlkLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHt9LFxuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB2YXIgcGFyYW1zID0ge307XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHdpZGdldC5wcm9wcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9wID0gd2lkZ2V0LnByb3BzW2ldO1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIE1vdmUgdG8gc2VydmljZSBsYXllclxuICAgICAgICAgICAgICAgICAgICBwYXJhbXNbcHJvcC5uYW1lXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hY3Rpb246ICdjcmVhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IChwcm9wLnR5cGUgPT0gJ211bHRpcGxlJyA/IFtdIDogbnVsbCksXG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5kaW5nOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyYXRlZ3k6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IChwcm9wLnR5cGUgPT0gJ211bHRpcGxlJyA/IG51bGwgOiB1bmRlZmluZWQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBkYXRhLnBhcmFtcyA9IHBhcmFtcztcblxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xuIiwidmFyIFdpZGdldHMgPVxuKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgV2lkZ2V0cyA9IHt9O1xuXG4gICAgV2lkZ2V0cy5QYWxldHRlID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBtYXAgPSB7fTtcbiAgICAgICAgdmFyIGFyciA9IFtdO1xuXG4gICAgICAgIHZhciBjYXRlZ29yaWVzID0gZnVuY3Rpb24oKSB7IHJldHVybiBhcnI7IH1cbiAgICAgICAgdmFyIGNhdGVnb3J5ID0gZnVuY3Rpb24obmFtZSwgY2F0ZWdvcnkpIHtcblxuICAgICAgICAgICAgaWYgKG5hbWUgaW4gbWFwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hcFtuYW1lXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWFwW25hbWVdID0gY2F0ZWdvcnk7XG4gICAgICAgICAgICAgICAgYXJyLnB1c2goY2F0ZWdvcnkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB3aWRnZXQgPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICB2YXIgc2VnbWVudHMgPSBwYXRoLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICByZXR1cm4gJC5leHRlbmQodHJ1ZSwge30sIHRoaXMuY2F0ZWdvcnkoc2VnbWVudHNbMF0pLmdyb3VwKHNlZ21lbnRzWzFdKS5pdGVtKHNlZ21lbnRzWzJdKS53aWRnZXQsIHtcbiAgICAgICAgICAgICAgICBfYWN0aW9uOiAnY3JlYXRlJyxcbiAgICAgICAgICAgICAgICByZXNvdXJjZToge1xuICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiAnY3JlYXRlJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdHViID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRhZzogJ2RlZmF1bHQtc3R1YicsXG4gICAgICAgICAgICAgICAgX2FjdGlvbjogJ2lnbm9yZScsXG4gICAgICAgICAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAndGl0bGUnLCB0eXBlOiAnc3RyaW5nJyB9XG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHsgdmFsdWU6ICdEcm9wIGhlcmUnIH0sXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBjYXRlZ29yaWVzLFxuICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5LFxuICAgICAgICAgICAgd2lkZ2V0OiB3aWRnZXQsXG4gICAgICAgICAgICBzdHViOiBzdHViLFxuICAgICAgICB9O1xuICAgIH0pKCk7XG5cbiAgICBXaWRnZXRzLkNhdGVnb3J5ID0gZnVuY3Rpb24obmFtZSwgdGl0bGUpIHtcblxuICAgICAgICB2YXIgbWFwID0ge307XG4gICAgICAgIHZhciBhcnIgPSBbXTtcblxuICAgICAgICB2YXIgZ3JvdXBzID0gZnVuY3Rpb24oKSB7IHJldHVybiBhcnI7IH1cbiAgICAgICAgdmFyIGdyb3VwID0gZnVuY3Rpb24obmFtZSwgZ3JvdXApIHtcblxuICAgICAgICAgICAgaWYgKG5hbWUgaW4gbWFwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hcFtuYW1lXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWFwW25hbWVdID0gZ3JvdXA7XG4gICAgICAgICAgICAgICAgYXJyLnB1c2goZ3JvdXApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIFdpZGdldHMuUGFsZXR0ZS5jYXRlZ29yeShuYW1lLCB7XG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICAgICAgZ3JvdXBzOiBncm91cHMsXG4gICAgICAgICAgICBncm91cDogZ3JvdXAsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBXaWRnZXRzLlBhbGV0dGUuY2F0ZWdvcnkobmFtZSk7XG4gICAgfTtcblxuICAgIFdpZGdldHMuR3JvdXAgPSBmdW5jdGlvbihjYXRlZ29yeSwgbmFtZSwgdGl0bGUpIHtcblxuICAgICAgICB2YXIgbWFwID0ge307XG4gICAgICAgIHZhciBhcnIgPSBbXTtcblxuICAgICAgICB2YXIgaXRlbXMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGFycjsgfVxuICAgICAgICB2YXIgaXRlbSA9IGZ1bmN0aW9uKG5hbWUsIGl0ZW0pIHtcblxuICAgICAgICAgICAgaWYgKG5hbWUgaW4gbWFwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hcFtuYW1lXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWFwW25hbWVdID0gaXRlbTtcbiAgICAgICAgICAgICAgICBhcnIucHVzaChpdGVtKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBjYXRlZ29yeS5ncm91cChuYW1lLCB7XG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zLFxuICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNhdGVnb3J5Lmdyb3VwKG5hbWUpO1xuICAgIH07XG5cbiAgICBXaWRnZXRzLmV4dGVuZCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuXG4gICAgICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgICAgICB0YWc6IGNvbmZpZy50YWcsXG4gICAgICAgICAgICB0YWJzOiBbXSxcbiAgICAgICAgICAgIHByb3BzOiBbXSxcbiAgICAgICAgICAgIHBhcmFtczoge30sXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGNvbmZpZy5taXhpbnMpIHtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb25maWcubWl4aW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG0gPSBjb25maWcubWl4aW5zW2ldO1xuICAgICAgICAgICAgICAgIGlmICgndGFicycgaW4gbSkgcmVzdWx0LnRhYnMgPSByZXN1bHQudGFicy5jb25jYXQobS50YWJzKTtcbiAgICAgICAgICAgICAgICBpZiAoJ3Byb3BzJyBpbiBtKSByZXN1bHQucHJvcHMgPSByZXN1bHQucHJvcHMuY29uY2F0KG0ucHJvcHMpO1xuICAgICAgICAgICAgICAgIGlmICgncGFyYW1zJyBpbiBtKSByZXN1bHQucGFyYW1zID0gJC5leHRlbmQodHJ1ZSwgcmVzdWx0LnBhcmFtcywgbS5wYXJhbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCd0YWJzJyBpbiBjb25maWcpIHJlc3VsdC50YWJzID0gcmVzdWx0LnRhYnMuY29uY2F0KGNvbmZpZy50YWJzKTtcbiAgICAgICAgaWYgKCdwcm9wcycgaW4gY29uZmlnKSByZXN1bHQucHJvcHMgPSByZXN1bHQucHJvcHMuY29uY2F0KGNvbmZpZy5wcm9wcyk7XG4gICAgICAgIGlmICgncGFyYW1zJyBpbiBjb25maWcpIHJlc3VsdC5wYXJhbXMgPSAkLmV4dGVuZCh0cnVlLCByZXN1bHQucGFyYW1zLCBjb25maWcucGFyYW1zKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhjb25maWcsIHJlc3VsdCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgV2lkZ2V0cy5JdGVtID0gZnVuY3Rpb24oZ3JvdXAsIG5hbWUsIGNvbmZpZykge1xuXG4gICAgICAgIGdyb3VwLml0ZW0obmFtZSwge1xuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIHRodW1ibmFpbDogY29uZmlnLnRodW1ibmFpbCxcbiAgICAgICAgICAgIHdpZGdldDogY29uZmlnLndpZGdldCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGdyb3VwLml0ZW0obmFtZSk7XG4gICAgfTtcblxuICAgIFdpZGdldHMuUHJvcCA9IGZ1bmN0aW9uKG5hbWUsIHRpdGxlLCB0eXBlLCB0YWIsIHBsYWNlaG9sZGVyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgIHRhYjogdGFiLFxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IHBsYWNlaG9sZGVyLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIFdpZGdldHMuUGFyYW0gPSBmdW5jdGlvbih2YWx1ZSwgYmluZGluZywgc3RyYXRlZ3kpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSB8fCB1bmRlZmluZWQsXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBWdWUuc2VydmljZSgncGFsZXR0ZScsIFdpZGdldHMuUGFsZXR0ZSk7XG5cbiAgICByZXR1cm4gV2lkZ2V0cztcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xuXG4gICAgV2lkZ2V0cy5XaWRnZXRNaXhpbiA9IHtcbiAgICAgICAgdGFiczogW1xuICAgICAgICAgICAgeyBuYW1lOiAnZGF0YScsIHRpdGxlOiAnRGF0YScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ2FwcGVhcmFuY2UnLCB0aXRsZTogJ0FwcGVhcmFuY2UnIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdjb250ZW50JywgdGl0bGU6ICdDb250ZW50JyB9LFxuICAgICAgICBdLFxuICAgICAgICBwcm9wczogW1xuICAgICAgICAgICAgeyBuYW1lOiAnaWQnLCB0aXRsZTogJ0lEJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnLCBwbGFjZWhvbGRlcjogJ1VuaXF1ZSBJRCcgfSxcbiAgICAgICAgXSxcbiAgICB9O1xuXG4gICAgV2lkZ2V0cy5Cb3hNaXhpbiA9IHtcbiAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ21hcmdpbicsIHRpdGxlOiAnTWFyZ2luJywgdHlwZTogJ3N0cmluZycsIHBsYWNlaG9sZGVyOiAnMHB4IDBweCcsIHRhYjogJ2FwcGVhcmFuY2UnIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdwYWRkaW5nJywgdGl0bGU6ICdQYWRkaW5nJywgdHlwZTogJ3N0cmluZycsIHBsYWNlaG9sZGVyOiAnMHB4IDBweCcsIHRhYjogJ2FwcGVhcmFuY2UnIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdpbm5lckJvcmRlcicsIHRpdGxlOiAnSW5uZXIgQm9yZGVyJywgdHlwZTogJ3N0cmluZycsIHBsYWNlaG9sZGVyOiAnc29saWQgMXB4ICMwMDAwMDAnLCB0YWI6ICdhcHBlYXJhbmNlJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnaW5uZXJCYWNrZ3JvdW5kJywgdGl0bGU6ICdJbm5lciBCYWNrZ3JvdW5kJywgdHlwZTogJ3N0cmluZycsIHBsYWNlaG9sZGVyOiAnI0ZGRkZGRicsIHRhYjogJ2FwcGVhcmFuY2UnIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdpbm5lckJhY2tncm91bmRTaXplJywgdGl0bGU6ICdJbm5lciBCYWNrZ3JvdW5kIFNpemUnLCB0eXBlOiAnc3RyaW5nJywgcGxhY2Vob2xkZXI6ICdjb3ZlcicsIHRhYjogJ2FwcGVhcmFuY2UnIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdvdXRlckJvcmRlcicsIHRpdGxlOiAnT3V0ZXIgQm9yZGVyJywgdHlwZTogJ3N0cmluZycsIHBsYWNlaG9sZGVyOiAnc29saWQgMXB4ICMwMDAwMDAnLCB0YWI6ICdhcHBlYXJhbmNlJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnb3V0ZXJCYWNrZ3JvdW5kJywgdGl0bGU6ICdPdXRlciBCYWNrZ3JvdW5kJywgdHlwZTogJ3N0cmluZycsIHBsYWNlaG9sZGVyOiAnI0ZGRkZGRicsIHRhYjogJ2FwcGVhcmFuY2UnIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdvdXRlckJhY2tncm91bmRTaXplJywgdGl0bGU6ICdPdXRlciBCYWNrZ3JvdW5kIFNpemUnLCB0eXBlOiAnc3RyaW5nJywgcGxhY2Vob2xkZXI6ICdjb3ZlcicsIHRhYjogJ2FwcGVhcmFuY2UnIH0sXG4gICAgICAgIF0sXG4gICAgfTtcblxuICAgIFdpZGdldHMuU2l6ZU1peGluID0ge1xuICAgICAgICBwcm9wczogW1xuICAgICAgICAgICAgeyBuYW1lOiAnd2lkdGgnLCB0aXRsZTogJ1dpZHRoJywgdHlwZTogJ3N0cmluZycsIHBsYWNlaG9sZGVyOiAnMTAwcHgnLCB0YWI6ICdhcHBlYXJhbmNlJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnaGVpZ2h0JywgdGl0bGU6ICdIZWlnaHQnLCB0eXBlOiAnc3RyaW5nJywgcGxhY2Vob2xkZXI6ICcxMDBweCcsIHRhYjogJ2FwcGVhcmFuY2UnIH0sXG4gICAgICAgIF1cbiAgICB9XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcblxuICAgIFdpZGdldHMuRm9ybUNhdGVnb3J5ID0gV2lkZ2V0cy5DYXRlZ29yeSgnZGVmYXVsdC1mb3JtJywgJ0Zvcm0gRWxlbWVudHMnKTtcbiAgICBXaWRnZXRzLkJ1dHRvbnNHcm91cCA9IFdpZGdldHMuR3JvdXAoV2lkZ2V0cy5Gb3JtQ2F0ZWdvcnksICdkZWZhdWx0LWZvcm0tYnV0dG9ucycsICdCdXR0b25zJyk7XG4gICAgV2lkZ2V0cy5JbnB1dHNHcm91cCA9IFdpZGdldHMuR3JvdXAoV2lkZ2V0cy5Gb3JtQ2F0ZWdvcnksICdkZWZhdWx0LWZvcm0taW5wdXRzJywgJ0lucHV0cycpO1xuXG4gICAgV2lkZ2V0cy5CdXR0b25XaWRnZXQgPSBmdW5jdGlvbih0aXRsZSwgc3RlcmVvdHlwZSkge1xuXG4gICAgICAgIHJldHVybiBXaWRnZXRzLmV4dGVuZCh7XG4gICAgICAgICAgICB0YWc6ICdkZWZhdWx0LWJ1dHRvbicsXG4gICAgICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcbiAgICAgICAgICAgIHByb3BzOiBbXG4gICAgICAgICAgICAgICAgeyBuYW1lOiAndGl0bGUnLCB0aXRsZTogJ1RpdGxlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2NvbnRlbnQnIH0sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiAndHlwZScsIHRpdGxlOiAnVHlwZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogJ3N0ZXJlb3R5cGUnLCB0aXRsZTogJ1N0ZXJlb3R5cGUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICBtYXJnaW46ICAgICBXaWRnZXRzLlBhcmFtKCcxNXB4JyksXG4gICAgICAgICAgICAgICAgdHlwZTogICAgICAgV2lkZ2V0cy5QYXJhbSgnYnV0dG9uJyksXG4gICAgICAgICAgICAgICAgdGl0bGU6ICAgICAgV2lkZ2V0cy5QYXJhbSh0aXRsZSksXG4gICAgICAgICAgICAgICAgc3RlcmVvdHlwZTogV2lkZ2V0cy5QYXJhbShzdGVyZW90eXBlKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CdXR0b25zR3JvdXAsICdidXR0b24tZGVmYXVsdCcsIHtcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vYnV0dG9uL2J1dHRvbi1kZWZhdWx0LnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5CdXR0b25XaWRnZXQoJ0RlZmF1bHQnLCAnZGVmYXVsdCcpLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQnV0dG9uc0dyb3VwLCAnYnV0dG9uLXByaW1hcnknLCB7XG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2J1dHRvbi9idXR0b24tcHJpbWFyeS5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuQnV0dG9uV2lkZ2V0KCdQcmltYXJ5JywgJ3ByaW1hcnknKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJ1dHRvbnNHcm91cCwgJ2J1dHRvbi1zdWNjZXNzJywge1xuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9idXR0b24vYnV0dG9uLXN1Y2Nlc3MucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkJ1dHRvbldpZGdldCgnU3VjY2VzcycsICdzdWNjZXNzJyksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CdXR0b25zR3JvdXAsICdidXR0b24taW5mbycsIHtcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vYnV0dG9uL2J1dHRvbi1pbmZvLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5CdXR0b25XaWRnZXQoJ0luZm8nLCAnaW5mbycpLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQnV0dG9uc0dyb3VwLCAnYnV0dG9uLXdhcm5pbmcnLCB7XG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2J1dHRvbi9idXR0b24td2FybmluZy5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuQnV0dG9uV2lkZ2V0KCdXYXJuaW5nJywgJ3dhcm5pbmcnKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJ1dHRvbnNHcm91cCwgJ2J1dHRvbi1kYW5nZXInLCB7XG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2J1dHRvbi9idXR0b24tZGFuZ2VyLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5CdXR0b25XaWRnZXQoJ0RhbmdlcicsICdkYW5nZXInKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJ1dHRvbnNHcm91cCwgJ2J1dHRvbi1saW5rJywge1xuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9idXR0b24vYnV0dG9uLWxpbmsucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkJ1dHRvbldpZGdldCgnTGluaycsICdsaW5rJyksXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcblxuICAgIFdpZGdldHMuVGV4dENhdGVnb3J5ID0gV2lkZ2V0cy5DYXRlZ29yeSgnZGVmYXVsdC10ZXh0JywgJ1RleHQgRWxlbWVudHMnKTtcbiAgICBXaWRnZXRzLkhlYWRpbmdzR3JvdXAgPSBXaWRnZXRzLkdyb3VwKFdpZGdldHMuVGV4dENhdGVnb3J5LCAnZGVmYXVsdC10ZXh0LWhlYWRpbmdzJywgJ0hlYWRpbmdzJyk7XG4gICAgV2lkZ2V0cy5CbG9ja3NHcm91cCA9IFdpZGdldHMuR3JvdXAoV2lkZ2V0cy5UZXh0Q2F0ZWdvcnksICdkZWZhdWx0LXRleHQtYmxvY2tzJywgJ0Jsb2NrcycpO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XG4iLCIiLCJTaGVsbCA9IHdpbmRvdy5TaGVsbCB8fCB7fTtcblxuKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIHVuZGVmaW5lZCkge1xuICAgIFxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3RhY2stY2FudmFzJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXN0YWNrLWNhbnZhcycsXG4gICAgICAgIG1peGluczogWyBDb3JlLlN0YWNrZWRNaXhpbiBdLFxuICAgIH0pO1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1zdGFjay1ob3Jpc29udGFsJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXN0YWNrLWhvcmlzb250YWwnLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiwgQ29yZS5TdGFja2VkTWl4aW4gXSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3RhY2stdmVydGljYWwnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtc3RhY2stdmVydGljYWwnLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiwgQ29yZS5TdGFja2VkTWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtYnV0dG9uJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWJ1dHRvbicsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtYm94Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWJveCcsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBiaW5kaW5nczogT2JqZWN0LFxuICAgICAgICAgICAgY2xhc3M6IFN0cmluZyxcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXBsYWNlaG9sZGVyJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXBsYWNlaG9sZGVyJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1zdHViJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXN0dWInLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xuXG4gICAgTGFuZGluZy5MYW5kaW5nUGFnZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1wYWdlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXBhZ2UnLFxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5MYW5kaW5nR2FsbGVyeVBhZ2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctZ2FsbGVyeS1wYWdlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLWdhbGxlcnktcGFnZScsXG4gICAgfSk7XG5cbiAgICBMYW5kaW5nLkxhbmRpbmdTdG9yYWdlUGFnZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1zdG9yYWdlLXBhZ2UnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctc3RvcmFnZS1wYWdlJyxcbiAgICB9KTtcblxuICAgIExhbmRpbmcuTGFuZGluZ1NpZ25pblBhZ2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctc2lnbmluLXBhZ2UnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctc2lnbmluLXBhZ2UnLFxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5MYW5kaW5nU2lnbnVwUGFnZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1zaWdudXAtcGFnZScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1zaWdudXAtcGFnZScsXG4gICAgfSk7XG5cbiAgICBMYW5kaW5nLkxhbmRpbmdQcm9maWxlUGFnZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1wcm9maWxlLXBhZ2UnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctcHJvZmlsZS1wYWdlJyxcbiAgICB9KTtcblxuICAgIExhbmRpbmcuTGFuZGluZ01hbmFnZVBhZ2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctbWFuYWdlLXBhZ2UnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctbWFuYWdlLXBhZ2UnLFxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5MYW5kaW5nTWFuYWdlQ3JlYXRlUGFnZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1tYW5hZ2UtY3JlYXRlLXBhZ2UnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctbWFuYWdlLWNyZWF0ZS1wYWdlJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICBDb3JlLlBvcnRhbHNGYWN0b3J5ID0gZnVuY3Rpb24ob3duZXIpIHtcblxuICAgICAgICByZXR1cm4ge1xuXG4gICAgICAgICAgICBsb2FkOiAoZGF0YSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgb3duZXIuJGh0dHAuZ2V0KCcvd3MvcG9ydGFscycsIGRhdGEpLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHJlc29sdmUoZCk7IH0sXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IHJlamVjdChlKTsgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KSxcblxuICAgICAgICAgICAgY3JlYXRlOiAoZGF0YSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgb3duZXIuJGh0dHAucG9zdCgnL3dzL3BvcnRhbHMnLCBkYXRhKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyByZXNvbHZlKGQpOyB9LFxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyByZWplY3QoZSk7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgIHJlbW92ZTogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLmRlbGV0ZSgnL3dzL3BvcnRhbHMnLCBkYXRhKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyByZXNvbHZlKGQpOyB9LFxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyByZWplY3QoZSk7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgIGdldDogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLmdldChgL3dzL3BvcnRhbHMvJHtkYXRhLmlkfWApLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHJlc29sdmUoZCk7IH0sXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IHJlamVjdChlKTsgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgfTtcbiAgICB9XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xuXG4gICAgQ29yZS5TZWN1cml0eUZhY3RvcnkgPSBmdW5jdGlvbihvd25lcikge1xuXG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIHNpZ251cDogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLnBvc3QoJy93cy9zaWdudXAnLCBkYXRhKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyBvd25lci5wcmluY2lwYWwgPSBkLmRhdGEucHJpbmNpcGFsOyByZXNvbHZlKGQpOyB9LFxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyBvd25lci5wcmluY2lwYWwgPSBudWxsOyByZWplY3QoZSk7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgIHNpZ25pbjogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLnBvc3QoJy93cy9zaWduaW4nLCBkYXRhKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyBvd25lci5wcmluY2lwYWwgPSBkLmRhdGEucHJpbmNpcGFsOyByZXNvbHZlKGQpOyB9LFxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyBvd25lci5wcmluY2lwYWwgPSBudWxsOyByZWplY3QoZSk7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgIHNpZ25vdXQ6ICgpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLnBvc3QoJy93cy9zaWdub3V0JykudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgb3duZXIucHJpbmNpcGFsID0gbnVsbDsgcmVzb2x2ZShkKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgcmVqZWN0KGUpOyB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICB9O1xuICAgIH1cblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICB2YXIgdmFsaWRhdGlvbiA9IHtcbiAgICAgICAgZW1haWw6IFwiL14oW2EtekEtWjAtOV9cXFxcLlxcXFwtXSspQChbYS16QS1aMC05X1xcXFwuXFxcXC1dKylcXFxcLihbYS16QS1aMC05XXsyLH0pJC9nXCIsXG4gICAgfTtcblxuICAgIExhbmRpbmcuU2lnbmluID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWFjY291bnQtc2lnbmluJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLWFjY291bnQtc2lnbmluJyxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZvcm06IHRoaXMuZm9ybSxcbiAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiB2YWxpZGF0aW9uLFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJHNldCgnZm9ybScsIHtcbiAgICAgICAgICAgICAgICBlbWFpbDogbnVsbCxcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBzaWduaW46IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3NlY3VyaXR5Jykuc2lnbmluKHtcbiAgICAgICAgICAgICAgICAgICAgZW1haWw6IHRoaXMuZm9ybS5lbWFpbCxcbiAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHRoaXMuZm9ybS5wYXNzd29yZCxcbiAgICAgICAgICAgICAgICB9KS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyB0aGlzLiRyb3V0ZXIuZ28oJy8nKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBMYW5kaW5nLlNpZ251cCA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1hY2NvdW50LXNpZ251cCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1hY2NvdW50LXNpZ251cCcsXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBmb3JtOiB0aGlzLmZvcm0sXG4gICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogdmFsaWRhdGlvbixcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2Zvcm0nLCB7XG4gICAgICAgICAgICAgICAgZW1haWw6IG51bGwsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgc2lnbnVwOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdzZWN1cml0eScpLnNpZ251cCh7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsOiB0aGlzLmZvcm0uZW1haWwsXG4gICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkOiB0aGlzLmZvcm0ucGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgfSkudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgdGhpcy4kcm91dGVyLmdvKCcvJyk7IH0sXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5Qcm9maWxlID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWFjY291bnQtcHJvZmlsZScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1hY2NvdW50LXByb2ZpbGUnLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIiwiIiwiIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIExhbmRpbmcuRmVlZGJhY2sgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctZmVlZGJhY2snLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctZmVlZGJhY2snLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIExhbmRpbmcuRm9vdGVyID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWZvb3RlcicsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1mb290ZXInLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIExhbmRpbmcuR2FsbGVyeSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1nYWxsZXJ5Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLWdhbGxlcnknLFxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5HYWxsZXJ5RnVsbCA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1nYWxsZXJ5LWZ1bGwnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctZ2FsbGVyeS1mdWxsJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICBMYW5kaW5nLkhlYWRlciA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1oZWFkZXInLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctaGVhZGVyJyxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgc2lnbm91dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3NlY3VyaXR5Jykuc2lnbm91dCgpLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHRoaXMuJHJvdXRlci5nbygnLycpOyB9LFxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICBMYW5kaW5nLk1hbmFnZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1tYW5hZ2UnLCB7XG5cbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1tYW5hZ2UnLFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nICsgd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lICsgKHdpbmRvdy5sb2NhdGlvbi5wb3J0ID8gJzonICsgd2luZG93LmxvY2F0aW9uLnBvcnQ6ICcnKSxcbiAgICAgICAgICAgICAgICBwb3J0YWxzOiB0aGlzLnBvcnRhbHMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgIHJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdwb3J0YWxzJykubG9hZCgpLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHRoaXMuJHNldCgncG9ydGFscycsIGQuZGF0YS5wb3J0YWxzKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgdGhpcy4kc2V0KCdwb3J0YWxzJywgW10pOyB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgICAgICBWdWUuc2VydmljZSgncG9ydGFscycpLnJlbW92ZSh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyB0aGlzLnJlZnJlc2goKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBMYW5kaW5nLk1hbmFnZUNyZWF0ZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1tYW5hZ2UtY3JlYXRlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLW1hbmFnZS1jcmVhdGUnLFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZm9ybTogdGhpcy5mb3JtLFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJHNldCgnZm9ybScsIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3BvcnRhbHMnKS5jcmVhdGUoe1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy5mb3JtLnRpdGxlLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHRoaXMuJHJvdXRlci5nbygnL21hbmFnZScpfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xuXG4gICAgTGFuZGluZy5TdG9yYWdlID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXByaWNpbmcnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctcHJpY2luZycsXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xuXG4gICAgTGFuZGluZy5TdG9yYWdlID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXN0b3JhZ2UnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctc3RvcmFnZScsXG4gICAgfSk7XG5cbiAgICBMYW5kaW5nLlN0b3JhZ2VGdWxsID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXN0b3JhZ2UtZnVsbCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1zdG9yYWdlLWZ1bGwnLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIExhbmRpbmcuU3VwZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctc3VwZXInLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctc3VwZXInLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIExhbmRpbmcuVXNlY2FzZXMgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctdXNlY2FzZXMnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctdXNlY2FzZXMnLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIExhbmRpbmcuVmlkZW8gPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctdmlkZW8nLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctdmlkZW8nLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
