var Core =
(function($, Vue) {

    Core = {};

    // if (CKEDITOR) {
    //     CKEDITOR_BASEPATH = '/assets/vendor/ckeditor/';
    // }

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

                    Object.assign(this.model, JSON.parse(JSON.stringify(model)), {
                        _action: this.model._action
                            ? this.model._action
                            : 'update'
                    });

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

            this.randomId = Vue.service('palette').generateId('widget-');

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

        data: function() {
            return {
                stackId: this.stackId,
            }
        },

        created: function() {
             this.stackId = Vue.service('palette').generateId('stack-');
        }
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

(function ($, window, pluginName, undefined) {

    var defaults = {

        drag: true,
        drop: true,
        vertical: true,

        containerSelector: "ol, ul",
        itemSelector: "li",
        excludeSelector: "",

        bodyClass: "dragging",
        activeClass: "active",
        draggedClass: "dragged",
        verticalClass: "vertical",
        horisontalClass: "horisontal",
        placeholderClass: "placeholder",

        placeholder: '<li class="placeholder"></li>',

        onDragStart: function(context, event, _super) {

            var size = {
                height: context.$item.outerHeight(),
                width: context.$item.outerWidth(),
            };

            context.$originalItem = context.$item;

            context.$item = context.$originalItem
                .clone()
                .addClass(context.sortable.options.draggedClass)
                .css({
                    position: 'fixed',
                    left: event.pageX - context.adjustment.left,
                    top: event.pageY - context.adjustment.top,
                    width: size.sidth,
                    height: size.height,
                })
                .appendTo(context.$parent)
            ;
        },

        onDrag: function(context, event, _super) {

            context.$item.css({
                left: event.pageX - context.adjustment.left,
                top: event.pageY - context.adjustment.top,
            })
        },

        onDrop: function(context, event, _super) {

            context.$item.remove();
            if (context.location) {

                context.$item = context.location.before
                    ? context.$item.insertBefore(context.location.$item)
                    : context.$item.insertAfter(context.location.$item)
                ;

                context.$item.css({
                    position: '',
                    left: '',
                    top: '',
                    width: '',
                    height: '',
                })
            }

        },
    };

    var context = null;
    var sortables = [];

    function Sortable($element, options) {

        this.$element = $element;
        this.options = $.extend({}, defaults, options);

        $element.on('mousedown.sortable', this.options.itemSelector, (e) => { this.handleStart(e); });

        this.draggable = null;

        sortables.push(this);
    }

    $(document).ready(function() {
        $(document)
            .on('mouseup.sortable', (e) => { context && context.sortable.handleEnd(e, context); })
            .on('mousemove.sortable', (e) => { context && context.sortable.handleDrag(e, context); })
        ;
    });

    Sortable.prototype = {

        dropLocation: function(e) {

            var $item;
            var sortable;

            if (context) {

                var display = context.$item.css('display');
                context.$item.css({ display: 'none', });

                for (var i = 0; i < sortables.length; i++) {
                    var s = sortables[i];
                    if (s.options.drop) {
                        $result = $(document.elementFromPoint(e.pageX, e.pageY)).closest(s.options.itemSelector);
                        if ($result.length && $result.closest(s.$element).length) {
                            $item = $result;
                            sortable = s;
                            break;
                        }
                    }
                }

                context.$item.css({ display: display, });

            } else {

                for (var i = 0; i < sortables.length; i++) {
                    var s = sortables[i];
                    if (s.options.drop) {
                        $result = $(document.elementFromPoint(e.pageX, e.pageY)).closest(s.options.itemSelector);
                        if ($result.length && $result.closest(s.$element).length) {
                            $item = $result;
                            sortable = s;
                            break;
                        }
                    }
                }
            }

            if (sortable && $item && $item.length) {

                var $container = $item.closest(sortable.options.containerSelector);

                var offset = $item.offset();
                var size = {
                    width: $item.outerWidth(),
                    height: $item.outerHeight(),
                };

                var orientation = this.options.vertical
                    ? $container.hasClass(sortable.options.horisontalClass) ? 'h' : 'v'
                    : $container.hasClass(sortable.options.verticalClass) ? 'v' : 'h'
                ;

                var before = (orientation == 'h')
                    ? e.pageX - offset.left < size.width / 2
                    : e.pageY - offset.top < size.height / 2
                ;

                return {
                    $item: $item,
                    $container: $container,
                    sortable: sortable,
                    before: before,
                };
            }

            return null;
        },

        handleStart: function(e) {

            if (this.options.excludeSelector && $(e.target).closest(this.options.excludeSelector).length) {
                return true;
            }

            // console.log(e);
            //
            e.preventDefault();
            e.stopPropagation();

            if (!context) {

                var $item = $(e.target).closest(this.options.itemSelector);
                var $parent = $item.parent();

                var offset = $item.offset();
                // if (!offset) {
                //     console.log($item, );
                // }

                context = {
                    sortable: this,
                    index: $item.index(),
                    $container: $item.closest(this.options.containerSelector),
                    $parent: $item.parent(),
                    $item: $item,
                    $originalItem: $item,
                    $targetItem: null,
                    $targetContainer: null,
                    location: this.dropLocation(e),
                    adjustment: {
                        left: e.clientX - offset.left,
                        top: e.clientY - offset.top,
                    },
                };

                this.options.onDragStart(context, e, defaults.onDragStart);
            }
        },

        handleEnd: function(e) {

            if (context) {

                for (var i = 0; i < sortables.length; i++) {
                    var sortable = sortables[i];
                    $(sortable.options.containerSelector, sortable.$element).removeClass(sortable.options.activeClass);
                }

                if (context.$placeholder) {
                    context.$placeholder.remove();
                }

                context.location = this.dropLocation(e);
                if (context.location) {
                    context.location.sortable.options.onDrop(context, e, defaults.onDrop);
                } else {
                    context.$item.remove();
                }

                context = null;
            }
        },

        handleDrag: function(e) {

            if (context) {

                for (var i = 0; i < sortables.length; i++) {
                    var sortable = sortables[i];
                    $(this.options.containerSelector, sortable.$element).removeClass(this.options.activeClass);
                }

                if (context.$placeholder) {
                    context.$placeholder.remove();
                }

                context.location = this.dropLocation(e);
                if (context.location) {
                    context.location.$container.addClass(context.location.sortable.options.activeClass);
                    context.$placeholder = context.location.before
                        ? $(context.location.sortable.options.placeholder).insertBefore(context.location.$item)
                        : $(context.location.sortable.options.placeholder).insertAfter(context.location.$item)
                    ;
                }

                context.sortable.options.onDrag(context, e, defaults.onDrag);
            }
        },
    };

    var API = $.extend(Sortable.prototype, {

        enable: function() {
        },
        disable: function () {
        },
        destroy: function () {
        }
    });

    $.fn[pluginName] = function(methodOrOptions) {

        var args = Array.prototype.slice.call(arguments, 1);

        return this.map(function() {

            var $t = $(this),
                object = $t.data(pluginName)
            ;

            if (object && API[methodOrOptions]) {
                return API[methodOrOptions].apply(object, args) || this;
            } else if (!object && (methodOrOptions === undefined || typeof methodOrOptions === "object")) {
                $t.data(pluginName, new Sortable($t, methodOrOptions));
            }

            return this;
        });
    };

})(jQuery, window, 'sortable');

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

(function($, Core) {

    Vue.validator('email', function (val) {
      return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val)
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

    var ParamVariable =
    Vue.component('params-variable', {
        template: '#params-variable',
        props: {
            id: String,
            item: Object,
            globals: Object,
        }
    });

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

    var ParamObject =
    Vue.component('params-object', {
        template: '#params-object',
        props: {
            id: String,
            item: Object,
            globals: Object,
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
                    // var param = binding.params[prop.name] = binding.params[prop.name] || {};
                    // console.log(prop.name, JSON.parse(JSON.stringify(this.current)));
                    var param = this.current.value[prop.name] = this.current.value[prop.name] || {};

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

            console.log(items);

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

            // console.log('created', ParamMultipleModalEditor);

            // console.log(this.context.prop);

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

                // console.log(item);

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
                    param: param,
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

                    var vv;

                    if (b && b.expression) {

                        value[n] = vv;

                    } else {

                        var res = this.evaluateParams(self, item.prop.props, v);
                        vv = r ? { value: res } : res;
                        value[n] = vv;
                    }

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
                    value[n] = vv || '';
                }
            }

            return value;
        }
    });

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
                    children.push(JSON.parse(JSON.stringify(this.placeholder())));
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

        methods: {

            // find: function(children, item) {
            //
            //     var index = 0;
            //     for (var i = 0; i < children.length && index < domIndex; i++) {
            //
            //         var child = children[i];
            //
            //         if (child._action != 'remove') {
            //             index++;
            //         }
            //     }
            //
            //     return index;
            // }
        },
    };

    var SortableMixin = function (selector) {

        return {

            data: function() {

                return {
                    selected: this.selected,
                };
            },

            attached: function() {

                if (this.$route.private) {

                    var shell = Vue.service('shell');

                    // this.$watch('selected', function(selected) {
                    //
                    //     if (this.sortable) {
                    //         if (selected) {
                    //             this.sortable.sortable("disable");
                    //         } else {
                    //             this.sortable.sortable("enable");
                    //         }
                    //     }
                    // });
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
            placeholder: function() {
                return Vue.service('palette').placeholder(`
                    <small>Horisontal Stack</small>
                    <div>Drop Here</div>
                `);
            }
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
            placeholder: function() {
                return Vue.service('palette').placeholder(`
                    <small>Vertical Stack</small>
                    <div>Drop Here</div>
                `);
            }
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
        attached: function() {

            var dragged;

            this.sortable = $(this.$el).sortable({

                vertical: true,
                drop: true,

                containerSelector: '.wg.wg-sortable-container.wg-sortable-editable',
                itemSelector: '.wg.wg-sortable-item.wg-sortable-editable',
                excludeSelector: '.ge.ge-overlay',

                verticalClass: "wg-sortable-vertical",
                horisontalClass: "wg-sortable-horisontal",
                placeholder: `
                    <div class="wg wg-sortable-placeholder">
                        <div class="wg wg-placeholder-container">
                            <div class="wg wg-placeholder-inner"></div>
                        </div>
                    </div>
                `,
                onDragStart: function(context, event, _super) {

                    _super(context, event);

                    var stack = $(context.$container).closest('.ge.ge-widget').get(0).__vue__;
                    var vue = context.$originalItem.find('.ge.ge-widget:first').get(0).__vue__;

                    // console.log(vue.model);
                    dragged = {
                        stack: stack,
                        // index: stack.find(stack.items, context.$originalItem.index()),
                        index: stack.items.indexOf(vue.model),
                        vue: vue,
                    };
                },
                onDrop: function(context, event, _super) {

                    _super(context, event);

                    var vue = context.location.$item.find('.ge.ge-widget:first').get(0).__vue__

                    var newStack = context.location.$container.closest('.ge.ge-widget').get(0).__vue__;

                    var newIndex = newStack.items.indexOf(vue.model) + (context.location.before ? 0 : 1);

                    var w = context.$item.data('widget');

                    if (w) {

                        var newItem = Vue.service('palette').item(w);
                        newStack.items.splice(newIndex, 0, newItem);

                    } else if (dragged) {

                        var oldStack = dragged.stack;
                        var oldIndex = dragged.index;
                        var oldItem = dragged.vue.model;

                        var newItem = Object.assign(JSON.parse(JSON.stringify(dragged.vue.model)));

                        if (oldStack != newStack) {

                            delete newItem.resource.id;
                            delete newItem.id;
                            newItem._action = 'create';

                            if (oldItem._action == 'create') {
                                oldStack.items.splice(oldIndex, 1);
                            } else {
                                oldItem._action = 'remove';
                            }

                            newStack.items.splice(newIndex, 0, newItem);

                        } else if (newIndex != oldIndex && newIndex != oldIndex + 1) {

                            newItem._action = oldItem._action == 'create'
                                ? 'create'
                                : 'update'
                            ;

                            if (newIndex < oldIndex) {

                                oldStack.items.splice(oldIndex, 1);
                                newStack.items.splice(newIndex, 0, newItem);

                            } else if (newIndex > oldIndex) {

                                newStack.items.splice(newIndex, 0, newItem);
                                oldStack.items.splice(oldIndex, 1);
                            }
                        }

                        oldStack.items = oldStack.items.slice();
                        newStack.items = newStack.items.slice();
                    }

                    context.$item.remove();
                }
            });
        },
        created: function() {
            this.selected = true;
        },
        methods: {
            placeholder: function() {
                return Vue.service('palette').placeholder(`
                    <small>Vertical Stack</small>
                    <div>Drop Here</div>
                `);
            }
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
        attached: function() {

            this.sortable = $(this.$el).sortable({
                group: 'widgets',
                containerSelector: '.wg-sortable-container',
                itemSelector: '.wg-sortable-item',
                drop: false,
            });
        },
        methods: {
            trigger: function(event, item, context) {
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

            this.scale = 1;

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
        events: {
            zoomIn: function(data) {
                this.scale += 0.1;
                $('.ge.ge-page', this.$el).css('transform', 'scale(' + this.scale + ')');
                $('.ge.ge-container', this.$el).perfectScrollbar('update');
            },
            zoomOut: function(data) {
                this.scale -= 0.1;
                $('.ge.ge-page', this.$el).css('transform', 'scale(' + this.scale + ')');
                $('.ge.ge-container', this.$el).perfectScrollbar('update');
            },
            pull: function(data) {
                $.ajax({
                    url: `/ws/portals/${this.model.id}`,
                    method: 'GET',
                    dataType: "json"
                })
                .done((d) => {

                        console.log(d);
                    this.$set('model', d.portal);
                })
            },
            push: function(data) {
                $.ajax({
                    url: `/ws/portals/${this.model.id}`,
                    method: 'PUT',
                    dataType: "json",
                    data: JSON.stringify(this.model),
                    contentType: "application/json",
                })
                .done((d) => {
                    console.log(d);
                    this.$set('model', d.portal);
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
                    'default-stack-horisontal': 'shell-decorator-horisontal',
                    'default-stack-vertical': 'shell-decorator-vertical',
                    'default-stub': 'shell-decorator-stub',
                },
                fallback: 'shell-decorator-widget',
            };
        },
        created: function() {

            var palette = Vue.service('palette');
            this.widget = palette.widget(this.model.name);
            this.decorator = this.decorators.alternatives[this.widget.tag] || this.decorators.fallback;
        },
        data: function() {

            return {
                widget: this.widget,
                decorator: this.decorator,
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

        var widgets = {};

        var categories = function() { return arr; }
        var category = function(n, category) {

            if (n in map) {
                return map[n];
            } else {
                category.name = n;
                map[n] = category;
                arr.push(category);
            }

            return this;
        }

        var widget = function(path) {
            var segments = path.split('/');
            return this.category(segments[0]).group(segments[1]).widget(segments[2]);
        }

        var item = function(path) {
            var segments = path.split('/');
            return $.extend(true, {}, this.category(segments[0]).group(segments[1]).item(segments[2]).widget, {
                _action: 'create',
                resource: {
                    params: [],
                    _action: 'create'
                },
            });
        }

        function generateId(prefix) {

            var ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var ID_LENGTH = 8;

            var rtn = '';
            for (var i = 0; i < ID_LENGTH; i++) {
                rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
            }
            return prefix ? prefix + rtn : rtn;
        }

        return {
            categories: categories,
            category: category,
            widget: widget,
            item: item,
            placeholder: function(content) { return Widgets.StubWidgetFactory(content) },
            generateId: generateId,
        };
    })();

    Widgets.Category = function(name, title, ignore) {

        var map = {};
        var arr = [];

        var groups = function() { return arr; }
        var group = function(n, group) {

            if (n in map) {
                return map[n];
            } else {
                group.name = `${name}/${n}`;
                map[n] = group;
                arr.push(group);
            }

            return this;
        }

        Widgets.Palette.category(name, {
            title: title,
            groups: groups,
            group: group,
            ignore: ignore,
        });

        return Widgets.Palette.category(name);
    };

    Widgets.Group = function(category, name, title) {

        var map = {};
        var arr = [];

        var items = function() { return arr; }
        var item = function(n, item) {

            if (n in map) {
                return map[n];
            } else {
                item.name = `${this.name}/${n}`;
                map[n] = item;
                arr.push(item);
            }

            return this;
        }

        var w_map = {};
        var w_arr = [];

        var widgets = function() { return w_arr; }
        var widget = function(n, widget) {

            if (n in w_map) {
                return w_map[n];
            } else {
                widget.name = `${this.name}/${n}`;
                w_map[n] = widget;
                w_arr.push(widget);
            }

            return this;
        }

        category.group(name, {
            title: title,
            items: items,
            item: item,
            widgets: widgets,
            widget: widget,
        });

        return category.group(name);
    };

    Widgets.Widget = function(group, config) {

        var name = config.name;

        group.widget(config.name, config);

        return group.widget(name);
    }

    Widgets.clone = function(original) {
        return JSON.parse(JSON.stringify(original));
    }

    Widgets.create = function(config) {

        var result = {
            name: config.name,
            tag: config.tag,
            widgets: config.widgets,
            tabs: [],
            props: [],
            params: {},
        };

        if ('_action' in config) result._action = config._action;

        function visit(w, m) {

            if ('props' in m) {

                if (m.override) {

                    w.tabs = JSON.parse(JSON.stringify(m.tabs));
                    w.props = JSON.parse(JSON.stringify(m.props));

                } else {

                    if (m.tabs) w.tabs = w.tabs.concat(m.tabs);
                    if (m.props) w.props = w.props.concat(m.props);
                }
            }

        }

        if (config.mixins) {

            for (var i = 0; i < config.mixins.length; i++) {
                var m = config.mixins[i];
                visit(result, m);
            }
        }

        visit(result, config);

        return result;
    };

    Widgets.build = function(widget, params) {

        var w = Object.assign(JSON.parse(JSON.stringify(widget)), {
            params: params || {}
        });

        function initParams(props, params) {

            for (var i = 0; i < props.length; i++) {

                var prop = props[i];
                var param = params[prop.name] = params[prop.name] || { value: null }; // TODO Set a type-dependent initial value

                if (prop.props) {
                    if (prop.type == 'multiple') {
                        param.value = param.value == null ? [] : param.value;
                        for (var j = 0; j < param.value.length; j++) {
                            initParams(prop.props, param.value[j]);
                        }
                    } else if (prop.type == 'object') {
                        param.value = param.value == null ? {} : param.value;
                        initParams(prop.props, param.value);
                    }
                }
            }
        }

        initParams(w.props, w.params);

        return w;
    }

    Widgets.Item = function(group, config) {

        var name = config.name;

        group.item(config.name, config);

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

    Widgets.CompositeCategory = Widgets.Category('default-composites', 'Composite Elements');
    Widgets.FormCategory = Widgets.Category('default-form', 'Form Elements');
    Widgets.TextCategory = Widgets.Category('default-text', 'Text Elements');
    Widgets.ContainerCategory = Widgets.Category('default-container', 'Container Elements');

    Widgets.UtilCategory = Widgets.Category('default-util', 'Util Elements', true);


})(jQuery, Vue, Core, Widgets);

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

    Widgets.GalleryGroup = Widgets.Group(Widgets.CompositeCategory, 'default-composite-gallery', 'Galleries');

})(jQuery, Vue, Core, Widgets);

(function($, Vue, Core, Widgets) {

    Widgets.StackGroup = Widgets.Group(Widgets.ContainerCategory, 'default-container-stack', 'Stacked');

})(jQuery, Vue, Core, Widgets);

(function($, Vue, Core, Widgets) {

    Widgets.ButtonsGroup = Widgets.Group(Widgets.FormCategory, 'default-form-buttons', 'Buttons');
    Widgets.InputsGroup = Widgets.Group(Widgets.FormCategory, 'default-form-inputs', 'Inputs');
    Widgets.RadiosGroup = Widgets.Group(Widgets.FormCategory, 'default-form-radios', 'Radios');
    Widgets.ChecksGroup = Widgets.Group(Widgets.FormCategory, 'default-form-checks', 'Checkboxes');

})(jQuery, Vue, Core, Widgets);

(function($, Vue, Core, Widgets) {

    Widgets.HeadingsGroup = Widgets.Group(Widgets.TextCategory, 'default-text-headings', 'Headings');
    Widgets.BlocksGroup = Widgets.Group(Widgets.TextCategory, 'default-text-blocks', 'Blocks');

})(jQuery, Vue, Core, Widgets);

(function($, Vue, Core, Widgets) {

    Widgets.UtilGroup = Widgets.Group(Widgets.UtilCategory, 'default-util-group', 'Util Elements');

})(jQuery, Vue, Core, Widgets);

(function($, Vue, Core) {

    Vue.component('default-gallery', {
        template: '#default-gallery',
        mixins: [ Core.WidgetMixin ],

        data: function() {
            return {
                matrix: this.matrix,
            }
        },

        created: function() {

            this.$watch('bindings', updateMatrix.bind(this), { immediate: true, deep: true });

            function updateMatrix(bindings) {

                var items = bindings.items.collection || [];

                var rows = parseInt(bindings.rows);
                rows = rows > 0 ? rows : 1;

                var cols = parseInt(bindings.cols);
                cols = cols > 0 ? cols : 3;

                var cells = rows * cols;

                var div = parseInt(items.length / cells);
                var mod = items.length % cells;

                var count = (mod > 0 || div == 0)
                    ? div + 1
                    : div
                ;

                var matrix = [];

                for (var p = 0; p < count; p++) {

                    var pd = [];
                    for (var r = 0; r < rows; r++) {
                        var rd = [];
                        for (var c = 0; c < cols; c++) {
                            var index = (p * rows + r) * cols + c;
                            if (index < items.length) {
                                rd.push(items[index]);
                            }
                        }
                        pd.push(rd);
                    }
                    matrix.push(pd);
                }

                this.matrix = matrix;
            };
        }
    });

})(jQuery, Vue, Core);

(function($, Vue, Core, Widgets) {

    Widgets.GalleryWidget =
    Widgets.Widget(Widgets.GalleryGroup, Widgets.create({
        name: 'default-gallery',
        tag: 'default-gallery',
        mixins: [ Widgets.WidgetMixin, Widgets.BoxMixin, Widgets.SizeMixin ],
        props: [
            { name: 'cols', title: 'Columns', type: 'string', tab: 'appearance' },
            { name: 'rows', title: 'Rows', type: 'string', tab: 'appearance' },
            { name: 'border', title: 'Border', type: 'object', tab: 'appearance',
                tabs: [
                    { name: 'appearance', title: 'Appearance' },
                ],
                props: [
                    { name: 'spacing', title: 'Border Spacing', type: 'string', tab: 'appearance' },
                    { name: 'collapse', title: 'Border Collapse', type: 'string', tab: 'appearance' },
                ]
            },
            {
                name: 'items', title: 'Items', type: 'object', tab: 'data',
                tabs: [
                    { name: 'data', title: 'Data' },
                    { name: 'appearance', title: 'Appearance' },
                ],
                props: [
                    { name: 'collection', title: 'Collection', type: 'multiple', tab: 'data',
                        tabs: [
                            { name: 'appearance', title: 'Appearance' },
                            { name: 'content', title: 'Content' },
                        ],
                        props: [
                            { name: 'width', title: 'Width', type: 'string', tab: 'appearance' },
                            { name: 'height', title: 'Height', type: 'string', tab: 'appearance' },
                            { name: 'background', title: 'Background', type: 'string', tab: 'appearance' },
                            { name: 'content', title: 'Content', type: 'rich', tab: 'content' },
                        ]
                    },
                    { name: 'style', title: 'Style', type: 'object', tab: 'appearance',
                        tabs: [
                            { name: 'appearance', title: 'Appearance' },
                        ],
                        props: [
                            { name: 'width', title: 'Width', type: 'string', tab: 'appearance' },
                            { name: 'height', title: 'Height', type: 'string', tab: 'appearance' },
                            { name: 'background', title: 'Background', type: 'string', tab: 'appearance' },
                        ],
                    }
                ]
            },
        ],
    }));

    Widgets.GalleryWidgetFactory = function(rows, cols, collection) {

        var w = Widgets.build(Widgets.GalleryWidget, {
            rows: { value: rows },
            cols: { value: cols },
            items: {
                value: {
                    style: {
                        value: {
                            background: { value: 'red' },
                            width: { value: '300px' },
                            height: { value: '100px' },
                        }
                    },
                    collection: {
                        value: [
                            { content: { value: '<h3>First Item</h3><p>You can change item data using settings editor</p>' } },
                            { content: { value: '<h3>Second Item</h3><p>You can change item data using settings editor</p>' } },
                            { content: { value: '<h3>Third Item</h3><p>You can change item data using settings editor</p>' } },
                            { content: { value: '<h3>Fourth Item</h3><p>You can change item data using settings editor</p>' } },
                            { content: { value: '<h3>Fifth Item</h3><p>You can change item data using settings editor</p>' } },
                            { content: { value: '<h3>Sixth Item</h3><p>You can change item data using settings editor</p>' } },
                        ]
                    }
                }
            },
        });

        // console.log(w);

        return w;
    }

    Widgets.Item(Widgets.GalleryGroup, {
        name: 'gallery-r1c1f',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/composites/gallery/gallery-r1c1f.png',
        widget: Widgets.GalleryWidgetFactory(1, 1, [
            { content: '<h3>First Item</h3><p>You can change item data using settings editor</p>' },
            { content: '<h3>Second Item</h3><p>You can change item data using settings editor</p>' },
            { content: '<h3>Third Item</h3><p>You can change item data using settings editor</p>' },
        ]),
    });

    // Widgets.Item(Widgets.GalleryGroup, {
    //     name: 'gallery-r1c1r',
    //     thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/composites/gallery/gallery-r1c1r.png',
    //     widget: Widgets.GalleryWidgetFactory(1, 1, [
    //         { caption: '<h3>First Item</h3><p>You can change item data using settings editor</p>', background: '#FF3500' },
    //         { caption: '<h3>Second Item</h3><p>You can change item data using settings editor</p>', background: '#DC0055' },
    //         { caption: '<h3>Third Item</h3><p>You can change item data using settings editor</p>', background: '#BF0037' },
    //     ]),
    // });
    //
    // Widgets.Item(Widgets.GalleryGroup, {
    //     name: 'gallery-r1c3f',
    //     thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/composites/gallery/gallery-r1c3f.png',
    //     widget: Widgets.GalleryWidgetFactory(1, 3, [
    //         { caption: '<h3>First Item</h3><p>You can change item data using settings editor</p>', background: '#FF3500' },
    //         { caption: '<h3>Second Item</h3><p>You can change item data using settings editor</p>', background: '#DC0055' },
    //         { caption: '<h3>Third Item</h3><p>You can change item data using settings editor</p>', background: '#BF0037' },
    //         { caption: '<h3>Fourth Item</h3><p>You can change item data using settings editor</p>', background: '#A52939' },
    //         { caption: '<h3>Fifth Item</h3><p>You can change item data using settings editor</p>', background: '#EE3B80' },
    //         { caption: '<h3>Sixth Item</h3><p>You can change item data using settings editor</p>', background: '#EE6B9E' },
    //     ]),
    // });
    //
    // Widgets.Item(Widgets.GalleryGroup, {
    //     name: 'gallery-r1c3b',
    //     thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/composites/gallery/gallery-r1c3b.png',
    //     widget: Widgets.GalleryWidgetFactory(1, 3, [
    //         { caption: '<h3>First Item</h3><p>You can change item data using settings editor</p>', background: '#FF3500' },
    //         { caption: '<h3>Second Item</h3><p>You can change item data using settings editor</p>', background: '#DC0055' },
    //         { caption: '<h3>Third Item</h3><p>You can change item data using settings editor</p>', background: '#BF0037' },
    //         { caption: '<h3>Fourth Item</h3><p>You can change item data using settings editor</p>', background: '#A52939' },
    //         { caption: '<h3>Fifth Item</h3><p>You can change item data using settings editor</p>', background: '#EE3B80' },
    //         { caption: '<h3>Sixth Item</h3><p>You can change item data using settings editor</p>', background: '#EE6B9E' },
    //     ]),
    // });
    //
    // Widgets.Item(Widgets.GalleryGroup, {
    //     name: 'gallery-r2c4f',
    //     thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/composites/gallery/gallery-r2c4f.png',
    //     widget: Widgets.GalleryWidgetFactory(2, 4, [
    //         { caption: '<h3>First Item</h3><p>You can change item data using settings editor</p>', background: '#FF3500' },
    //         { caption: '<h3>Second Item</h3><p>You can change item data using settings editor</p>', background: '#DC0055' },
    //         { caption: '<h3>Third Item</h3><p>You can change item data using settings editor</p>', background: '#BF0037' },
    //         { caption: '<h3>Fourth Item</h3><p>You can change item data using settings editor</p>', background: '#A52939' },
    //         { caption: '<h3>Fifth Item</h3><p>You can change item data using settings editor</p>', background: '#EE3B80' },
    //         { caption: '<h3>Sixth Item</h3><p>You can change item data using settings editor</p>', background: '#EE6B9E' },
    //     ]),
    // });
    //
    // Widgets.Item(Widgets.GalleryGroup, {
    //     name: 'gallery-r2c4b',
    //     thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/composites/gallery/gallery-r2c4b.png',
    //     widget: Widgets.GalleryWidgetFactory(2, 4, [
    //         { caption: '<h3>First Item</h3><p>You can change item data using settings editor</p>', background: '#FF3500' },
    //         { caption: '<h3>Second Item</h3><p>You can change item data using settings editor</p>', background: '#DC0055' },
    //         { caption: '<h3>Third Item</h3><p>You can change item data using settings editor</p>', background: '#BF0037' },
    //         { caption: '<h3>Fourth Item</h3><p>You can change item data using settings editor</p>', background: '#A52939' },
    //         { caption: '<h3>Fifth Item</h3><p>You can change item data using settings editor</p>', background: '#EE3B80' },
    //         { caption: '<h3>Sixth Item</h3><p>You can change item data using settings editor</p>', background: '#EE6B9E' },
    //     ]),
    // });
    //
    // Widgets.Item(Widgets.GalleryGroup, {
    //     name: 'gallery-r2c3f',
    //     thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/composites/gallery/gallery-r2c3f.png',
    //     widget: Widgets.GalleryWidgetFactory(2, 3, [
    //         { caption: '<h3>First Item</h3><p>You can change item data using settings editor</p>', background: '#FF3500' },
    //         { caption: '<h3>Second Item</h3><p>You can change item data using settings editor</p>', background: '#DC0055' },
    //         { caption: '<h3>Third Item</h3><p>You can change item data using settings editor</p>', background: '#BF0037' },
    //         { caption: '<h3>Fourth Item</h3><p>You can change item data using settings editor</p>', background: '#A52939' },
    //         { caption: '<h3>Fifth Item</h3><p>You can change item data using settings editor</p>', background: '#EE3B80' },
    //         { caption: '<h3>Sixth Item</h3><p>You can change item data using settings editor</p>', background: '#EE6B9E' },
    //     ]),
    // });
    //
    // Widgets.Item(Widgets.GalleryGroup, {
    //     name: 'gallery-r3c2r',
    //     thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/composites/gallery/gallery-r3c2r.png',
    //     widget: Widgets.GalleryWidgetFactory(3, 2, [
    //         { caption: '<h3>First Item</h3><p>You can change item data using settings editor</p>', background: '#FF3500' },
    //         { caption: '<h3>Second Item</h3><p>You can change item data using settings editor</p>', background: '#DC0055' },
    //         { caption: '<h3>Third Item</h3><p>You can change item data using settings editor</p>', background: '#BF0037' },
    //         { caption: '<h3>Fourth Item</h3><p>You can change item data using settings editor</p>', background: '#A52939' },
    //         { caption: '<h3>Fifth Item</h3><p>You can change item data using settings editor</p>', background: '#EE3B80' },
    //         { caption: '<h3>Sixth Item</h3><p>You can change item data using settings editor</p>', background: '#EE6B9E' },
    //     ]),
    // });

})(jQuery, Vue, Core, Widgets);

(function($, Vue, Core) {

    Vue.component('default-carousel', {
        template: '#default-carousel',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core, Widgets) {

    Widgets.StackHorisontalWidget =
    Widgets.Widget(Widgets.StackGroup, Widgets.create({
        name: 'default-stack-horisontal',
        tag: 'default-stack-horisontal',
        mixins: [ Widgets.WidgetMixin, Widgets.BoxMixin ],
        widgets: [],
    }));

    Widgets.Item(Widgets.StackGroup, {
        name: 'stack-horisontal',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/container/stack/stack-horisontal.png',
        widget: Widgets.build(Widgets.StackHorisontalWidget),
    });

    Widgets.StackVerticalWidget =
    Widgets.Widget(Widgets.StackGroup, Widgets.create({
        name: 'default-stack-vertical',
        tag: 'default-stack-vertical',
        mixins: [ Widgets.WidgetMixin, Widgets.BoxMixin ],
        widgets: [],
    }));

    Widgets.Item(Widgets.StackGroup, {
        name: 'stack-vertical',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/container/stack/stack-vertical.png',
        widget: Widgets.build(Widgets.StackVerticalWidget, {}),
    });

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

(function($, Vue, Core, Widgets) {

    Widgets.ButtonWidget =
    Widgets.Widget(Widgets.ButtonsGroup, Widgets.create({
        name: 'default-button',
        tag: 'default-button',
        mixins: [ Widgets.WidgetMixin, Widgets.BoxMixin, Widgets.SizeMixin ],
        props: [
            { name: 'title', title: 'Title', type: 'string', tab: 'content' },
            { name: 'type', title: 'Type', type: 'string', tab: 'data' },
            { name: 'stereotype', title: 'Stereotype', type: 'string', tab: 'data' },
        ],
    }));

    Widgets.ButtonWidgetFactory = function(title, stereotype) {

        var w = Widgets.build(Widgets.ButtonWidget, {
            margin: { value: '15px 15px' },
            type: { value: 'button' },
            title: { value: title },
            stereotype: { value: stereotype },
        });

        console.log(w);

        return w;
    }

    Widgets.Item(Widgets.ButtonsGroup, {
        name: 'button-default',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/button/button-default.png',
        widget: Widgets.ButtonWidgetFactory('Default', 'default'),
    });

    Widgets.Item(Widgets.ButtonsGroup, {
        name: 'button-primary',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/button/button-primary.png',
        widget: Widgets.ButtonWidgetFactory('Primary', 'primary'),
    });

    Widgets.Item(Widgets.ButtonsGroup, {
        name: 'button-success',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/button/button-success.png',
        widget: Widgets.ButtonWidgetFactory('Success', 'success'),
    });

    Widgets.Item(Widgets.ButtonsGroup, {
        name: 'button-info',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/button/button-info.png',
        widget: Widgets.ButtonWidgetFactory('Info', 'info'),
    });

    Widgets.Item(Widgets.ButtonsGroup, {
        name: 'button-warning',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/button/button-warning.png',
        widget: Widgets.ButtonWidgetFactory('Warning', 'warning'),
    });

    Widgets.Item(Widgets.ButtonsGroup, {
        name: 'button-danger',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/button/button-danger.png',
        widget: Widgets.ButtonWidgetFactory('Danger', 'danger'),
    });

})(jQuery, Vue, Core, Widgets);

(function($, Vue, Core) {

    Vue.component('default-input-text', {
        template: '#default-input-text',
        mixins: [ Core.WidgetMixin ],
        created: function() {
            // console.log('model', this.bindings);
            // console.log('storage', this.storage.one);
        }
    });

    Vue.component('default-input-textarea', {
        template: '#default-input-textarea',
        mixins: [ Core.WidgetMixin ],
    });

    Vue.component('default-input-checkbox', {
        template: '#default-input-checkbox',
        mixins: [ Core.WidgetMixin ],
    });

    Vue.component('default-input-radio', {
        template: '#default-input-radio',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core, Widgets) {

    Widgets.InputWidget =
    Widgets.Widget(Widgets.InputsGroup, Widgets.create({
        name: 'default-input-text',
        tag: 'default-input-text',
        mixins: [ Widgets.WidgetMixin, Widgets.BoxMixin, Widgets.SizeMixin ],
        props: [
            { name: 'model', title: 'Model', type: 'var', tab: 'data', variable: true },
            { name: 'type', title: 'Type', type: 'string', tab: 'content' },
            { name: 'label', title: 'Label', type: 'string', tab: 'content' },
            { name: 'placeholder', title: 'Placeholder', type: 'string', tab: 'content' },
        ],
    }));

    Widgets.InputWidgetFactory = function(label, type) {

        return Widgets.build(Widgets.InputWidget, {
            model: {
                value: { value: '' }
            },
            margin: { value: '15px 15px' },
            label: { value: label },
            type: { value: type },
        });
    };

    Widgets.Item(Widgets.InputsGroup, {
        name: 'input-text',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/input/text.png',
        widget: Widgets.InputWidgetFactory('Input', 'text'),
    });

    Widgets.TextareaWidget =
    Widgets.Widget(Widgets.InputsGroup, Widgets.create({
        name: 'default-input-textarea',
        tag: 'default-input-textarea',
        mixins: [ Widgets.WidgetMixin, Widgets.BoxMixin, Widgets.SizeMixin ],
        props: [
            { name: 'model', title: 'Model', type: 'var', tab: 'data', variable: true },
            { name: 'label', title: 'Label', type: 'string', tab: 'data' },
            { name: 'placeholder', title: 'Placeholder', type: 'string', tab: 'data' },
        ],
    }));

    Widgets.TextareaWidgetFactory = function(label, placeholder) {

        return Widgets.build(Widgets.TextareaWidget, {
            model: {
                value: { value: '' }
            },
            placeholder: { value: placeholder },
            margin: { value: '15px 15px' },
            label: { value: label },
        });
    };

    Widgets.Item(Widgets.InputsGroup, {
        name: 'input-textarea',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/input/textarea.png',
        widget: Widgets.TextareaWidgetFactory('Textarea', 'Type message here'),
    });

    Widgets.RadioInputWidget =
    Widgets.Widget(Widgets.InputsGroup, Widgets.create({
        name: 'default-input-radio',
        tag: 'default-input-radio',
        mixins: [ Widgets.WidgetMixin, Widgets.BoxMixin, Widgets.SizeMixin ],
        props: [
            { name: 'model', title: 'Model', type: 'var', tab: 'data', variable: true },
            { name: 'stereotype', title: 'Stereotype', type: 'string', tab: 'data' },
            {
                name: 'items', type: 'multiple', title: 'Items', tab: 'data',
                tabs: [
                    { name: 'data', title: 'Data' },
                ],
                props: [
                    { name: 'value', title: 'Value', type: 'string', tab: 'data' },
                    { name: 'label', title: 'Label', type: 'string', tab: 'data' },
                ]
            },
        ],
    }));

    Widgets.RadioInputWidgetFactory = function(value, options) {

        return Widgets.build(Widgets.RadioInputWidget, {
            model: {
                value: { value: value }
            },
            margin: { value: '15px 15px' },
            items: {
                value: options.map(function(option) {
                    return {
                        value: Widgets.Param(option.value),
                        label: Widgets.Param(option.label),
                    };
                })
            }
        });
    };

    Widgets.Item(Widgets.InputsGroup, {
        name: 'input-radio',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/input/radio.png',
        widget: Widgets.RadioInputWidgetFactory('1', [
            { value: '1', label: 'First' },
            { value: '2', label: 'Second' },
        ]),
    });

    Widgets.CheckInputWidget =
    Widgets.Widget(Widgets.InputsGroup, Widgets.create({
        name: 'default-input-checkbox',
        tag: 'default-input-checkbox',
        mixins: [ Widgets.WidgetMixin, Widgets.BoxMixin, Widgets.SizeMixin ],
        props: [
            { name: 'model', title: 'Model', type: 'var', tab: 'data', variable: true },
            { name: 'stereotype', title: 'Stereotype', type: 'string', tab: 'data' },
            {
                name: 'items', type: 'multiple', title: 'Items', tab: 'data',
                tabs: [
                    { name: 'data', title: 'Data' },
                ],
                props: [
                    { name: 'value', title: 'Value', type: 'string', tab: 'data' },
                    { name: 'label', title: 'Label', type: 'string', tab: 'data' },
                ]
            },
        ],
    }));

    Widgets.CheckInputWidgetFactory = function(value, options) {

        return Widgets.build(Widgets.CheckInputWidget, {
            model: {
                value: { value: value }
            },
            margin: { value: '15px 15px' },
            items: {
                value: options.map(function(option) {
                    return {
                        value: Widgets.Param(option.value),
                        label: Widgets.Param(option.label),
                    };
                })
            }
        });
    };

    Widgets.Item(Widgets.InputsGroup, {
        name: 'input-check',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/input/checkbox.png',
        widget: Widgets.CheckInputWidgetFactory([ '1' ], [
            { value: '1', label: 'First' },
            { value: '2', label: 'Second' },
        ]),
    });

})(jQuery, Vue, Core, Widgets);

(function($, Vue, Core) {

    Vue.component('default-check', {
        template: '#default-check',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core, Widgets) {

    Widgets.CheckWidget =
    Widgets.Widget(Widgets.ChecksGroup, Widgets.create({
        name: 'default-check',
        tag: 'default-check',
        mixins: [ Widgets.WidgetMixin, Widgets.BoxMixin, Widgets.SizeMixin ],
        props: [
            { name: 'model', title: 'Model', type: 'var', tab: 'data', variable: true },
            { name: 'stereotype', title: 'Stereotype', type: 'string', tab: 'data' },
            {
                name: 'items', type: 'multiple', title: 'Items', tab: 'data',
                tabs: [
                    { name: 'data', title: 'Data' },
                ],
                props: [
                    { name: 'value', title: 'Value', type: 'string', tab: 'data' },
                    { name: 'label', title: 'Label', type: 'string', tab: 'data' },
                ]
            },
        ],
    }));

    Widgets.CheckWidgetFactory = function(stereotype, value, options) {

        return Widgets.build(Widgets.CheckWidget, {
            model: {
                value: { value: value }
            },
            margin: { value: '15px 15px' },
            stereotype: { value: stereotype },
            items: {
                value: options.map(function(option) {
                    return {
                        value: { value: option.value },
                        label: { value: option.label },
                    };
                })
            }
        });
    }

    Widgets.Item(Widgets.ChecksGroup, {
        name: 'check-default',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/check/check-default.png',
        widget: Widgets.CheckWidgetFactory('default', [ 'A', 'B' ], [
            { value: 'A', label: 'A' },
            { value: 'B', label: 'B' },
            { value: 'C', label: 'C' },
        ]),
    });

    Widgets.Item(Widgets.ChecksGroup, {
        name: 'check-primary',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/check/check-primary.png',
        widget: Widgets.CheckWidgetFactory('primary', [ 'A', 'B' ], [
            { value: 'A', label: 'A' },
            { value: 'B', label: 'B' },
            { value: 'C', label: 'C' },
        ]),
    });

    Widgets.Item(Widgets.ChecksGroup, {
        name: 'check-success',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/check/check-success.png',
        widget: Widgets.CheckWidgetFactory('success', [ 'A', 'B' ], [
            { value: 'A', label: 'A' },
            { value: 'B', label: 'B' },
            { value: 'C', label: 'C' },
        ]),
    });

    Widgets.Item(Widgets.ChecksGroup, {
        name: 'check-info',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/check/check-info.png',
        widget: Widgets.CheckWidgetFactory('info', [ 'A', 'B' ], [
            { value: 'A', label: 'A' },
            { value: 'B', label: 'B' },
            { value: 'C', label: 'C' },
        ]),
    });

    Widgets.Item(Widgets.ChecksGroup, {
        name: 'check-warning',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/check/check-warning.png',
        widget: Widgets.CheckWidgetFactory('warning', [ 'A', 'B' ], [
            { value: 'A', label: 'A' },
            { value: 'B', label: 'B' },
            { value: 'C', label: 'C' },
        ]),
    });

    Widgets.Item(Widgets.ChecksGroup, {
        name: 'check-danger',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/check/check-danger.png',
        widget: Widgets.CheckWidgetFactory('danger', [ 'A', 'B' ], [
            { value: 'A', label: 'A' },
            { value: 'B', label: 'B' },
            { value: 'C', label: 'C' },
        ]),
    });

})(jQuery, Vue, Core, Widgets);

(function($, Vue, Core, Widgets) {

    Widgets.RadioWidget =
    Widgets.Widget(Widgets.RadiosGroup, Widgets.create({
        name: 'default-radio',
        tag: 'default-radio',
        mixins: [ Widgets.WidgetMixin, Widgets.BoxMixin, Widgets.SizeMixin ],
        props: [
            { name: 'model', title: 'Model', type: 'var', tab: 'data', variable: true },
            { name: 'stereotype', title: 'Stereotype', type: 'string', tab: 'data' },
            {
                name: 'items', type: 'multiple', title: 'Items', tab: 'data',
                tabs: [
                    { name: 'data', title: 'Data' },
                ],
                props: [
                    { name: 'value', title: 'Value', type: 'string', tab: 'data' },
                    { name: 'label', title: 'Label', type: 'string', tab: 'data' },
                ]
            },
        ],
    }));

    Widgets.RadioWidgetFactory = function(stereotype, value, options) {

        return Widgets.build(Widgets.RadioWidget, {
            model: {
                value: { value: value }
            },
            margin: { value: '15px 15px' },
            stereotype: { value: stereotype },
            items: {
                value: options.map(function(option) {
                    return {
                        value: { value: option.value },
                        label: { value: option.label },
                    };
                })
            }
        });
    };

    Widgets.Item(Widgets.RadiosGroup, {
        name: 'radio-default',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/radio/radio-default.png',
        widget: Widgets.RadioWidgetFactory('default', '1', [
            { value: '1', label: 'On' },
            { value: '0', label: 'Off' },
        ]),
    });

    Widgets.Item(Widgets.RadiosGroup, {
        name: 'radio-primary',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/radio/radio-primary.png',
        widget: Widgets.RadioWidgetFactory('primary', '1', [
            { value: '1', label: 'On' },
            { value: '0', label: 'Off' },
        ]),
    });

    Widgets.Item(Widgets.RadiosGroup, {
        name: 'radio-success',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/radio/radio-success.png',
        widget: Widgets.RadioWidgetFactory('success', '1', [
            { value: '1', label: 'On' },
            { value: '0', label: 'Off' },
        ]),
    });

    Widgets.Item(Widgets.RadiosGroup, {
        name: 'radio-info',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/radio/radio-info.png',
        widget: Widgets.RadioWidgetFactory('info', '1', [
            { value: '1', label: 'On' },
            { value: '0', label: 'Off' },
        ]),
    });

    Widgets.Item(Widgets.RadiosGroup, {
        name: 'radio-warning',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/radio/radio-warning.png',
        widget: Widgets.RadioWidgetFactory('warning', '1', [
            { value: '1', label: 'On' },
            { value: '0', label: 'Off' },
        ]),
    });

    Widgets.Item(Widgets.RadiosGroup, {
        name: 'radio-danger',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/radio/radio-danger.png',
        widget: Widgets.RadioWidgetFactory('danger', '1', [
            { value: '1', label: 'On' },
            { value: '0', label: 'Off' },
        ]),
    });

})(jQuery, Vue, Core, Widgets);

(function($, Vue, Core) {

    Vue.component('default-radio', {
        template: '#default-radio',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core, Widgets) {

    Widgets.TextWidget =
    Widgets.Widget(Widgets.BlocksGroup, Widgets.create({
        name: 'default-text',
        tag: 'default-text',
        mixins: [ Widgets.WidgetMixin, Widgets.BoxMixin, Widgets.SizeMixin ],
        props: [
            { name: 'stereotype', title: 'Stereotype', type: 'string', tab: 'data' },
            { name: 'content', title: 'Content', type: 'rich', tab: 'content' },
        ],
    }));

    Widgets.TextWidgetFactory = function(stereotype, content) {

        return Widgets.build(Widgets.TextWidget, {
            content: { value: content },
            margin: { value: '15px 15px' },
            stereotype: { value: stereotype },
        });
    }

    Widgets.Item(Widgets.HeadingsGroup, {
        name: 'text-h1',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/text-h1.png',
        widget: Widgets.TextWidgetFactory('default', `
            <h1>Heading 1</h1>
        `),
    });

    Widgets.Item(Widgets.HeadingsGroup, {
        name: 'text-h2',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/text-h2.png',
        widget: Widgets.TextWidgetFactory('default', `
            <h2>Heading 2</h2>
        `),
    });

    Widgets.Item(Widgets.HeadingsGroup, {
        name: 'text-h3',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/text-h3.png',
        widget: Widgets.TextWidgetFactory('default', `
            <h3>Heading 3</h3>
        `),
    });

    Widgets.Item(Widgets.HeadingsGroup, {
        name: 'text-h4',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/text-h4.png',
        widget: Widgets.TextWidgetFactory('default', `
            <h4>Heading 4</h4>
        `),
    });

    Widgets.Item(Widgets.HeadingsGroup, {
        name: 'text-h5',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/text-h5.png',
        widget: Widgets.TextWidgetFactory('default', `
            <h5>Heading 5</h5>
        `),
    });

    Widgets.Item(Widgets.HeadingsGroup, {
        name: 'text-h6',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/text-h6.png',
        widget: Widgets.TextWidgetFactory('default', `
            <h6>Heading 6</h6>
        `),
    });

    Widgets.Item(Widgets.BlocksGroup, {
        name: 'block-default',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/block-default.png',
        widget: Widgets.TextWidgetFactory('default', `
            <h3>Lorem ipsum</h3>
            <p>Etiam porta sem malesuada magna mollis euismod.</p>
        `),
    });

    Widgets.Item(Widgets.BlocksGroup, {
        name: 'block-primary',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/block-primary.png',
        widget: Widgets.TextWidgetFactory('primary', `
            <h3>Lorem ipsum</h3>
            <p>Etiam porta sem malesuada magna mollis euismod.</p>
        `),
    });

    Widgets.Item(Widgets.BlocksGroup, {
        name: 'block-success',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/block-success.png',
        widget: Widgets.TextWidgetFactory('success', `
            <h3>Lorem ipsum</h3>
            <p>Etiam porta sem malesuada magna mollis euismod.</p>
        `),
    });

    Widgets.Item(Widgets.BlocksGroup, {
        name: 'block-info',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/block-info.png',
        widget: Widgets.TextWidgetFactory('info', `
            <h3>Lorem ipsum</h3>
            <p>Etiam porta sem malesuada magna mollis euismod.</p>
        `),
    });

    Widgets.Item(Widgets.BlocksGroup, {
        name: 'block-warning',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/block-warning.png',
        widget: Widgets.TextWidgetFactory('warning', `
            <h3>Lorem ipsum</h3>
            <p>Etiam porta sem malesuada magna mollis euismod.</p>
        `),
    });

    Widgets.Item(Widgets.BlocksGroup, {
        name: 'block-danger',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/block-danger.png',
        widget: Widgets.TextWidgetFactory('danger', `
            <h3>Lorem ipsum</h3>
            <p>Etiam porta sem malesuada magna mollis euismod.</p>
        `),
    });

})(jQuery, Vue, Core, Widgets);

(function($, Vue, Core) {

    Vue.component('default-text', {
        template: '#default-text',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-placeholder', {
        template: '#default-placeholder',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-box', {
        template: '#default-box',
        props: {
            bindings: Object,
            class: String,
        }
    });

})(jQuery, Vue, Core);

(function($, Vue, Core, Widgets) {

    Widgets.StubWidget =
    Widgets.Widget(Widgets.UtilGroup, Widgets.create({
        name: 'default-stub',
        tag: 'default-stub',
        _action: 'ignore',
        props: [
            { name: 'content', type: 'string' }
        ],
    }));

    Widgets.StubWidgetFactory = function(content) {

        return Widgets.build(Widgets.StubWidget, {
            params: {
                content: { value: content },
            },
        });
    }

})(jQuery, Vue, Core, Widgets);

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiY29tcG9uZW50cy9lZGl0b3IuanMiLCJjb21wb25lbnRzL2Zvcm0uanMiLCJjb21wb25lbnRzL2lubGluZS5qcyIsImNvbXBvbmVudHMvbWl4aW5zLmpzIiwiY29tcG9uZW50cy9tb2RhbC5qcyIsImNvbXBvbmVudHMvc29ydGFibGUuanMiLCJmaWx0ZXJzL2luZGV4LmpzIiwiZGlyZWN0aXZlcy9hZmZpeC5qcyIsImRpcmVjdGl2ZXMvY29tYm8uanMiLCJkaXJlY3RpdmVzL2RhdGUuanMiLCJkaXJlY3RpdmVzL3JpY2guanMiLCJkaXJlY3RpdmVzL3Njcm9sbGFibGUuanMiLCJkaXJlY3RpdmVzL3RhZ3MuanMiLCJob29rcy9tb2RhbC5qcyIsInZhbGlkYXRvcnMvZW1haWwuanMiLCJwbHVnaW5zL2NvbnRhaW5lci5qcyIsImVkaXRvci9iaW5kaW5ncy9iaW5kaW5ncy5qcyIsImVkaXRvci9kb21haW5zL2RvbWFpbnMuanMiLCJlZGl0b3IvcGFnZXMvcGFnZXMuanMiLCJlZGl0b3Ivc2NoZW1lcy9zY2hlbWVzLmpzIiwiZWRpdG9yL3BhcmFtcy9wYXJhbXMuanMiLCJlZGl0b3Ivc2V0dGluZ3Mvc2V0dGluZ3MuanMiLCJlZGl0b3Ivc3RvcmFnZXMvc3RvcmFnZXMuanMiLCJlZGl0b3Ivd2lkZ2V0cy93aWRnZXRzLmpzIiwic2hlbGwvYWN0aW9ucy9hY3Rpb25zLmpzIiwic2hlbGwvYnJhbmQvYnJhbmQuanMiLCJzaGVsbC9jYXRlZ29yaWVzL2NhdGVnb3JpZXMuanMiLCJzaGVsbC9jb250YWluZXIvY29udGFpbmVyLmpzIiwic2hlbGwvZGVjb3JhdG9yL2RlY29yYXRvci5qcyIsInNoZWxsL2RvbWFpbnMvZG9tYWlucy5qcyIsInNoZWxsL2xvYWRlci9sb2FkZXIuanMiLCJzaGVsbC9wYWdlL3BhZ2UuanMiLCJzaGVsbC9wYWdlcy9wYWdlcy5qcyIsInNoZWxsL3BhbGV0dGUvcGFsZXR0ZS5qcyIsInNoZWxsL3NoZWxsL3NoZWxsLmpzIiwic2hlbGwvc291cmNlcy9zb3VyY2VzLmpzIiwic2hlbGwvc3RvcmFnZXMvc3RvcmFnZXMuanMiLCJzaGVsbC90YXJnZXQvdGFyZ2V0LmpzIiwic2hlbGwvd2lkZ2V0L3dpZGdldC5qcyIsImVkaXRvci9wYWdlcy9zb3VyY2VzL3NvdXJjZXMuanMiLCJlZGl0b3IvcGFnZXMvd2lkZ2V0cy93aWRnZXRzLmpzIiwid2lkZ2V0cy5qcyIsIndpZGdldHMvcGFsZXR0ZS5qcyIsIndpZGdldHMvd2lkZ2V0cy5qcyIsIndpZGdldHMvY29tcG9zaXRlcy9wYWxldHRlLmpzIiwid2lkZ2V0cy9jb250YWluZXIvcGFsZXR0ZS5qcyIsIndpZGdldHMvZm9ybS9wYWxldHRlLmpzIiwid2lkZ2V0cy90ZXh0L3BhbGV0dGUuanMiLCJ3aWRnZXRzL3V0aWxzL3BhbGV0dGUuanMiLCJ3aWRnZXRzL2NvbXBvc2l0ZXMvZ2FsbGVyeS9nYWxsZXJ5LmpzIiwid2lkZ2V0cy9jb21wb3NpdGVzL2dhbGxlcnkvcGFsZXR0ZS5qcyIsIndpZGdldHMvY29tcG9zaXRlcy9jYXJvdXNlbC9jYXJvdXNlbC5qcyIsIndpZGdldHMvY29udGFpbmVyL3N0YWNrL3BhbGV0dGUuanMiLCJ3aWRnZXRzL2NvbnRhaW5lci9zdGFjay9zdGFjay5qcyIsIndpZGdldHMvZm9ybS9idXR0b24vYnV0dG9uLmpzIiwid2lkZ2V0cy9mb3JtL2J1dHRvbi9wYWxldHRlLmpzIiwid2lkZ2V0cy9mb3JtL2lucHV0L2lucHV0LmpzIiwid2lkZ2V0cy9mb3JtL2lucHV0L3BhbGV0dGUuanMiLCJ3aWRnZXRzL2Zvcm0vY2hlY2svY2hlY2suanMiLCJ3aWRnZXRzL2Zvcm0vY2hlY2svcGFsZXR0ZS5qcyIsIndpZGdldHMvZm9ybS9yYWRpby9wYWxldHRlLmpzIiwid2lkZ2V0cy9mb3JtL3JhZGlvL3JhZGlvLmpzIiwid2lkZ2V0cy90ZXh0L3RleHQvcGFsZXR0ZS5qcyIsIndpZGdldHMvdGV4dC90ZXh0L3RleHQuanMiLCJ3aWRnZXRzL3V0aWxzL3BsYWNlaG9sZGVyL3BsYWNlaG9sZGVyLmpzIiwid2lkZ2V0cy91dGlscy9ib3gvYm94LmpzIiwid2lkZ2V0cy91dGlscy9zdHViL3BhbGV0dGUuanMiLCJ3aWRnZXRzL3V0aWxzL3N0dWIvc3R1Yi5qcyIsImxhbmRpbmcvbGFuZGluZy5qcyIsInNlcnZpY2VzL3BvcnRhbHMuanMiLCJzZXJ2aWNlcy9zZWN1cml0eS5qcyIsImxhbmRpbmcvYWNjb3VudC9hY2NvdW50LmpzIiwibGFuZGluZy9iZW5lZml0cy9iZW5lZml0cy5qcyIsImxhbmRpbmcvY29udGFjdHMvY29udGFjdHMuanMiLCJsYW5kaW5nL2ZlZWRiYWNrL2ZlZWRiYWNrLmpzIiwibGFuZGluZy9mb290ZXIvZm9vdGVyLmpzIiwibGFuZGluZy9nYWxsZXJ5L2dhbGxlcnkuanMiLCJsYW5kaW5nL2hlYWRlci9oZWFkZXIuanMiLCJsYW5kaW5nL21hbmFnZS9tYW5hZ2UuanMiLCJsYW5kaW5nL3ByaWNpbmcvcHJpY2luZy5qcyIsImxhbmRpbmcvc3RvcmFnZS9zdG9yYWdlLmpzIiwibGFuZGluZy9zdXBlci9zdXBlci5qcyIsImxhbmRpbmcvdXNlY2FzZXMvdXNlY2FzZXMuanMiLCJsYW5kaW5nL3ZpZGVvL3ZpZGVvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDblNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FoQmZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QWlCVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDek9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMWhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QXBFUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QXFFNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0RUE7QUNBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgTGFuZGluZyA9XHJcbihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XHJcblxyXG4gICAgTGFuZGluZyA9IHt9O1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAkKCdbZGF0YS12dWUtYXBwXScpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gJChlbGVtZW50KS5kYXRhKCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgQXBwID0gVnVlLmV4dGVuZCh7XHJcbiAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3NlY3VyaXR5JywgQ29yZS5TZWN1cml0eUZhY3RvcnkodGhpcykpO1xyXG4gICAgICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdwb3J0YWxzJywgQ29yZS5Qb3J0YWxzRmFjdG9yeSh0aGlzKSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHZhciByb3V0ZXIgPSBuZXcgVnVlUm91dGVyKHtcclxuICAgICAgICAgICAgICAgIGhpc3Rvcnk6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcm91dGVyLmJlZm9yZUVhY2goZnVuY3Rpb24odHJhbnNpdGlvbikge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uLnRvLmF1dGggJiYgIXJvdXRlci5hcHAucHJpbmNpcGFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbi5hYm9ydCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0cmFuc2l0aW9uLnRvLmFub24gJiYgcm91dGVyLmFwcC5wcmluY2lwYWwpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uLmFib3J0KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb24ubmV4dCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHZhciByb3V0ZXMgPSB7XHJcbiAgICAgICAgICAgICAgICAnLyc6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IExhbmRpbmcuTGFuZGluZ1BhZ2UsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgJy9nYWxsZXJ5Jzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nR2FsbGVyeVBhZ2UsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgJy9zdG9yYWdlJzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nU3RvcmFnZVBhZ2UsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgJy9zaWduaW4nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBMYW5kaW5nLkxhbmRpbmdTaWduaW5QYWdlLFxyXG4gICAgICAgICAgICAgICAgICAgIGFub246IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgJy9zaWdudXAnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBMYW5kaW5nLkxhbmRpbmdTaWdudXBQYWdlLFxyXG4gICAgICAgICAgICAgICAgICAgIGFub246IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgJy9tYW5hZ2UnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBMYW5kaW5nLkxhbmRpbmdNYW5hZ2VQYWdlLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgJy9tYW5hZ2UtY3JlYXRlJzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nTWFuYWdlQ3JlYXRlUGFnZSxcclxuICAgICAgICAgICAgICAgICAgICBhdXRoOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICcvc2l0ZS86cG9ydGFsLzpwYWdlJzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogU2hlbGwuU2hlbGxQdWJsaWMsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAnL21hbmFnZS86cG9ydGFsJzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogU2hlbGwuTG9hZGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJpdmF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAnL21hbmFnZS86cG9ydGFsLzpwYWdlJzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogU2hlbGwuTG9hZGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJpdmF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjcmVhdGVSb3V0ZShwYWdlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogU2hlbGwuU2hlbGxQdWJsaWMuZXh0ZW5kKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2U6IHBhZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZGF0YS5tb2RlbCkge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLm1vZGVsLnBhZ2VzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYWdlID0gZGF0YS5tb2RlbC5wYWdlc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICByb3V0ZXNbcGFnZS5uYW1lXSA9IGNyZWF0ZVJvdXRlKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByb3V0ZXIubWFwKHJvdXRlcyk7XHJcblxyXG4gICAgICAgICAgICByb3V0ZXIuc3RhcnQoQXBwLCAkKCdbZGF0YS12dWUtYm9keV0nLCBlbGVtZW50KS5nZXQoMCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIExhbmRpbmc7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgQ29yZS5UYWJzTWl4aW4gPSBmdW5jdGlvbihhY3RpdmUpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB0YWJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZTogYWN0aXZlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbWV0aG9kczoge1xyXG5cclxuICAgICAgICAgICAgICAgIGFjdGl2YXRlOiBmdW5jdGlvbih0YWIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnMuYWN0aXZlID0gdGFiO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBpc0FjdGl2ZTogZnVuY3Rpb24odGFiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFicy5hY3RpdmUgPT0gdGFiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIENvcmUuQWN0aW9uTWl4aW4gPSBmdW5jdGlvbihNb2RhbEVkaXRvcikge1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG5cclxuICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXHJcbiAgICAgICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0OiBPYmplY3QsXHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBtZXRob2RzOiB7XHJcblxyXG4gICAgICAgICAgICAgICAgb3BlbjogZnVuY3Rpb24oY29udGV4dCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGlhbG9nID0gbmV3IE1vZGFsRWRpdG9yKHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dCB8fCB0aGlzLmNvbnRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbDogdGhpcy5tb2RlbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3duZXIuZG9BcHBseSh0aGlzLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSkuJG1vdW50KCkuJGFwcGVuZFRvKCQoJ2JvZHknKS5nZXQoMCkpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBkb0FwcGx5OiBmdW5jdGlvbihtb2RlbCkge1xuXHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG1vZGVsKSksIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogdGhpcy5tb2RlbC5fYWN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMubW9kZWwuX2FjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICBDb3JlLkVkaXRvck1peGluID0gZnVuY3Rpb24oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgICAgICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgaXRlbSwgY29udGV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGlhbG9nID0gbmV3IE1vZGFsRWRpdG9yKHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudDogaXRlbSA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpIDoge31cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vd25lci5kb0NyZWF0ZSh0aGlzLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSkuJG1vdW50KCkuJGFwcGVuZFRvKCQoJ2JvZHknKS5nZXQoMCkpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvUmVtb3ZlKGl0ZW0sIGNvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBpdGVtO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBuZXcgTW9kYWxFZGl0b3Ioe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsczogdGhpcy5nbG9iYWxzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3duZXI6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IGl0ZW0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW0pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm93bmVyLmRvVXBkYXRlKHRoaXMuY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0OiAgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pLiRtb3VudCgpLiRhcHBlbmRUbygkKCdib2R5JykuZ2V0KDApKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgZG9DcmVhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKE9iamVjdC5hc3NpZ24oe30sIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpLCB7IF9hY3Rpb246ICdjcmVhdGUnIH0pKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdpdGVtcycsICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIGRvVXBkYXRlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLmFjdGl2ZSwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShpdGVtKSksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hY3Rpb246IHRoaXMuYWN0aXZlLl9hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMuYWN0aXZlLl9hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuaXRlbXMgPSAkLmV4dGVuZCh0cnVlLCBbXSwgdGhpcy5pdGVtcyk7Ly90aGlzLml0ZW1zLnNsaWNlKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMgPSB0aGlzLml0ZW1zLnNsaWNlKCk7XG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd1cGRhdGUnLCBpdGVtLCBjb250ZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuJHNldCgnYWN0aXZlJywgT2JqZWN0LmFzc2lnbihKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW0pKSwge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBfYWN0aW9uOiB0aGlzLmFjdGl2ZS5fYWN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICA/IHRoaXMuYWN0aXZlLl9hY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIDogJ3VwZGF0ZSdcclxuICAgICAgICAgICAgICAgICAgICAvLyB9KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgICAgICAvLyAvLyB0aGlzLml0ZW1zID0gJC5leHRlbmQodHJ1ZSwgW10sIHRoaXMuaXRlbXMpOy8vdGhpcy5pdGVtcy5zbGljZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy4kc2V0KCdpdGVtcycsICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgICAgICAvLyAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5hY3RpdmUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBkb1JlbW92ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLml0ZW1zLmluZGV4T2YoaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMuaXRlbXNbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5fYWN0aW9uID09ICdjcmVhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLiRyZW1vdmUoaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLl9hY3Rpb24gPSAncmVtb3ZlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5pdGVtcyA9ICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2l0ZW1zJywgJC5leHRlbmQodHJ1ZSwgW10sIHRoaXMuaXRlbXMpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ3Jlc2l6ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGV2ZW50czoge1xyXG4gICAgICAgICAgICAgICAgY3JlYXRlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMuY3JlYXRlKGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcclxuICAgICAgICAgICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oZGF0YSkgeyB0aGlzLnVwZGF0ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXHJcbiAgICAgICAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy5yZW1vdmUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxyXG4gICAgICAgICAgICAgICAgZG9DcmVhdGU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy5kb0NyZWF0ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXHJcbiAgICAgICAgICAgICAgICBkb1VwZGF0ZTogZnVuY3Rpb24oZGF0YSkgeyB0aGlzLmRvVXBkYXRlKGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcclxuICAgICAgICAgICAgICAgIGRvUmVtb3ZlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMuZG9SZW1vdmUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcblxyXG4gICAgQ29yZS5MaXN0Vmlld2VyTWl4aW4gPSB7XHJcblxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgZGF0YSkgeyB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pOyB9LFxyXG4gICAgICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHsgdGhpcy4kZGlzcGF0Y2goJ2NyZWF0ZScsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dH0gKTsgfSxcclxuICAgICAgICAgICAgdXBkYXRlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7IHRoaXMuJGRpc3BhdGNoKCd1cGRhdGUnLCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHR9ICk7IH0sXHJcbiAgICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkgeyB0aGlzLiRkaXNwYXRjaCgncmVtb3ZlJywgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0fSApOyB9LFxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgQ29yZS5Nb2RhbEVkaXRvck1peGluID0ge1xyXG5cclxuICAgICAgICBhdHRhY2hlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAkKHRoaXMuJGVsKS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgICAkKHRoaXMuJGVsKS5vbignaGlkZS5icy5tb2RhbCcsIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBkZXRhY2hlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQodGhpcy4kZWwpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKCkge30sXHJcbiAgICAgICAgICAgIHJlc2V0OiBmdW5jdGlvbigpIHt9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlKTtcclxuIiwiLy8gVnVlLmNvbXBvbmVudCgndi1mb3JtJywge1xyXG4vL1xyXG4vLyBcdHByb3BzOiB7XHJcbi8vIFx0XHRhY3Rpb246IFN0cmluZyxcclxuLy8gXHRcdG1ldGhvZDogU3RyaW5nLFxyXG4vLyBcdFx0aW5pdDogT2JqZWN0LFxyXG4vLyBcdFx0ZG9uZTogRnVuY3Rpb24sXHJcbi8vIFx0XHRmYWlsOiBGdW5jdGlvbixcclxuLy8gXHRcdG1vZGVsOiBPYmplY3QsXHJcbi8vIFx0fSxcclxuLy9cclxuLy8gXHQvLyByZXBsYWNlOiBmYWxzZSxcclxuLy9cclxuLy8gXHQvLyB0ZW1wbGF0ZTogYFxyXG4vLyBcdC8vIFx0PGZvcm0+XHJcbi8vIFx0Ly8gXHRcdDxzbG90Pjwvc2xvdD5cclxuLy8gXHQvLyBcdDwvZm9ybT5cclxuLy8gXHQvLyBgLFxyXG4vL1xyXG4vLyBcdGFjdGl2YXRlOiBmdW5jdGlvbihkb25lKSB7XHJcbi8vXHJcbi8vIFx0XHR0aGlzLm9yaWdpbmFsID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKSk7XHJcbi8vXHJcbi8vIFx0XHQkKHRoaXMuJGVsKVxyXG4vL1xyXG4vLyBcdFx0XHQub24oJ3N1Ym1pdCcsIChlKSA9PiB7XHJcbi8vIFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4vLyBcdFx0XHRcdHRoaXMuc3VibWl0KCk7XHJcbi8vIFx0XHRcdH0pXHJcbi8vIFx0XHRcdC5vbigncmVzZXQnLCAoZSkgPT4ge1xyXG4vLyBcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuLy8gXHRcdFx0XHR0aGlzLnJlc2V0KCk7XHJcbi8vIFx0XHRcdH0pXHJcbi8vXHJcbi8vIFx0XHRkb25lKCk7XHJcbi8vIFx0fSxcclxuLy9cclxuLy8gXHRkYXRhOiBmdW5jdGlvbigpIHtcclxuLy9cclxuLy8gXHRcdHJldHVybiB7XHJcbi8vIFx0XHRcdG1vZGVsOiB0aGlzLm1vZGVsXHJcbi8vIFx0XHR9O1xyXG4vLyBcdH0sXHJcbi8vXHJcbi8vIFx0bWV0aG9kczoge1xyXG4vL1xyXG4vLyBcdFx0c3VibWl0OiBmdW5jdGlvbigpIHtcclxuLy9cclxuLy8gXHRcdFx0Ly8gZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4vL1xyXG4vLyBcdFx0XHQvLyBjb25zb2xlLmxvZyh0aGlzLm1vZGVsKTtcclxuLy9cclxuLy8gXHRcdFx0JC5hamF4KHtcclxuLy8gXHRcdFx0XHR1cmw6IHRoaXMuYWN0aW9uLFxyXG4vLyBcdFx0XHRcdG1ldGhvZDogdGhpcy5tZXRob2QsXHJcbi8vIFx0XHRcdFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4vLyBcdFx0XHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpXHJcbi8vIFx0XHRcdH0pXHJcbi8vIFx0XHRcdC5kb25lKChkKSA9PiB7XHJcbi8vIFx0XHRcdFx0aWYgKGRvbmUgaW4gdGhpcykgdGhpcy5kb25lKGQpO1xyXG4vLyBcdFx0XHR9KVxyXG4vLyBcdFx0XHQuZmFpbChmdW5jdGlvbihlKSB7IGlmIChmYWlsIGluIHRoaXMpIHRoaXMuZmFpbChlKTsgfS5iaW5kKHRoaXMpKVxyXG4vLyBcdFx0fSxcclxuLy9cclxuLy8gXHRcdHJlc2V0OiBmdW5jdGlvbigpIHtcclxuLy8gXHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCB0aGlzLm9yaWdpbmFsKTtcclxuLy8gXHRcdH1cclxuLy8gXHR9LFxyXG4vLyB9KTtcclxuIiwiLy8gVnVlLmNvbXBvbmVudCgnaW5saW5lLXRleHQnLFxyXG4vLyBcdFZ1ZS5leHRlbmQoe1xyXG4vLyBcdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnIF0sXHJcbi8vIFx0XHR0ZW1wbGF0ZTogYFxyXG4vLyBcdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxyXG4vLyBcdFx0XHRcdDxpbnB1dCBjbGFzcz1cImlubGluZS1jb250cm9sXCIgdHlwZT1cInRleHRcIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiIC8+XHJcbi8vIFx0XHRcdDwvZGl2PlxyXG4vLyBcdFx0YFxyXG4vLyBcdH0pXHJcbi8vICk7XHJcbi8vXHJcbi8vIFZ1ZS5jb21wb25lbnQoJ2lubGluZS1jaGVja2JveCcsXHJcbi8vIFx0VnVlLmV4dGVuZCh7XHJcbi8vIFx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScgXSxcclxuLy8gXHRcdHRlbXBsYXRlOiBgXHJcbi8vIFx0XHRcdDxkaXYgY2xhc3M9XCJpbmxpbmUtY29udGFpbmVyXCI+XHJcbi8vIFx0XHRcdFx0PGlucHV0IGNsYXNzPVwiaW5saW5lLWNoZWNrYm94XCIgdHlwZT1cImNoZWNrYm94XCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIiAvPlxyXG4vLyBcdFx0XHQ8L2Rpdj5cclxuLy8gXHRcdGBcclxuLy8gXHR9KVxyXG4vLyApO1xyXG4vL1xyXG4vLyBWdWUuY29tcG9uZW50KCdpbmxpbmUtc2VsZWN0JyxcclxuLy8gXHRWdWUuZXh0ZW5kKHtcclxuLy8gXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJywgJ29wdGlvbnMnIF0sXHJcbi8vIFx0XHR0ZW1wbGF0ZTogYFxyXG4vLyBcdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxyXG4vLyBcdFx0XHRcdDxzZWxlY3QgY2xhc3M9XCJpbmxpbmUtY29udHJvbDFcIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiPlxyXG4vLyBcdFx0XHRcdFx0PG9wdGlvbiB2LWZvcj1cIm9wdGlvbiBpbiBvcHRpb25zXCIgdmFsdWU9XCJ7eyBvcHRpb24ua2V5IH19XCI+e3sgb3B0aW9uLnZhbHVlIH19PC9vcHRpb24+XHJcbi8vIFx0XHRcdFx0PC9zZWxlY3Q+XHJcbi8vIFx0XHRcdDwvZGl2PlxyXG4vLyBcdFx0YFxyXG4vLyBcdH0pXHJcbi8vICk7XHJcbi8vXHJcbi8vIFZ1ZS5jb21wb25lbnQoJ2lubGluZS12YWx1ZScsXHJcbi8vIFx0VnVlLmV4dGVuZCh7XHJcbi8vIFx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScsICdjbGFzcycgXSxcclxuLy8gXHRcdHRlbXBsYXRlOiBgXHJcbi8vIFx0XHRcdDxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIiAvPlxyXG4vLyBcdFx0XHQ8c3BhbiA6Y2xhc3M9XCJjbGFzc1wiPnt7IHZhbHVlIH19PC9zcGFuPlxyXG4vLyBcdFx0YFxyXG4vLyBcdH0pXHJcbi8vICk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuXHJcbiAgICBDb3JlLldpZGdldE1peGluID0ge1xyXG5cclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxyXG4gICAgICAgICAgICBiaW5kaW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBjaGlsZHJlbjogQXJyYXksXHJcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGRhdGE6ICBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHN5c3RlbUlkOiB0aGlzLnN5c3RlbUlkLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJhbmRvbUlkID0gVnVlLnNlcnZpY2UoJ3BhbGV0dGUnKS5nZW5lcmF0ZUlkKCd3aWRnZXQtJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBUT0RPINCj0YHRgtCw0L3QvtCy0LjRgtGMINGA0LDQt9C80LXRgNGLINGA0L7QtNC40YLQtdC70YzRgdC60L7QuSDRj9GH0LXQudC60LhcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdiaW5kaW5ncy5pZCcsIGZ1bmN0aW9uKHZhbHVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zeXN0ZW1JZCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN5c3RlbUlkID0gdGhpcy5yYW5kb21JZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGl0ZW0sIGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBDb3JlLlN0YWNrZWRNaXhpbiA9IHtcclxuXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcclxuICAgICAgICAgICAgY2hpbGRyZW46IEFycmF5LFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgc3RhY2tJZDogdGhpcy5zdGFja0lkLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICB0aGlzLnN0YWNrSWQgPSBWdWUuc2VydmljZSgncGFsZXR0ZScpLmdlbmVyYXRlSWQoJ3N0YWNrLScpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIi8vIFZ1ZS5jb21wb25lbnQoJ21vZGFsJywge1xyXG4vL1xyXG4vLyAgICAgcHJvcHM6IHtcclxuLy8gICAgICAgICBpZDogU3RyaW5nLFxyXG4vLyAgICAgICAgIGN1cnJlbnQ6IE9iamVjdCxcclxuLy8gICAgICAgICBvcmlnaW5hbDogT2JqZWN0LFxyXG4vLyAgICAgfSxcclxuLy9cclxuLy8gICAgIG1ldGhvZHM6IHtcclxuLy9cclxuLy8gICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcclxuLy8gICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goJ3N1Ym1pdCcsIHRoaXMuY3VycmVudCk7XHJcbi8vICAgICAgICAgICAgIC8vIE9iamVjdC5hc3NpZ24odGhpcy5vcmlnaW5hbCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmN1cnJlbnQpKSk7XHJcbi8vICAgICAgICAgICAgICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbi8vICAgICAgICAgfSxcclxuLy9cclxuLy8gICAgICAgICByZXNldDogZnVuY3Rpb24oZSkge1xyXG4vLyAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaCgncmVzZXQnLCB0aGlzLmN1cnJlbnQpO1xyXG4vLyAgICAgICAgICAgICAvLyBPYmplY3QuYXNzaWduKHRoaXMuY3VycmVudCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLm9yaWdpbmFsKSkpO1xyXG4vLyAgICAgICAgICAgICAkKGUudGFyZ2V0KS5jbG9zZXN0KCcubW9kYWwnKS5tb2RhbCgnaGlkZScpO1xyXG4vLyAgICAgICAgIH1cclxuLy8gICAgIH1cclxuLy8gfSk7XHJcbiIsIihmdW5jdGlvbiAoJCwgd2luZG93LCBwbHVnaW5OYW1lLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICB2YXIgZGVmYXVsdHMgPSB7XHJcblxyXG4gICAgICAgIGRyYWc6IHRydWUsXHJcbiAgICAgICAgZHJvcDogdHJ1ZSxcclxuICAgICAgICB2ZXJ0aWNhbDogdHJ1ZSxcclxuXHJcbiAgICAgICAgY29udGFpbmVyU2VsZWN0b3I6IFwib2wsIHVsXCIsXHJcbiAgICAgICAgaXRlbVNlbGVjdG9yOiBcImxpXCIsXHJcbiAgICAgICAgZXhjbHVkZVNlbGVjdG9yOiBcIlwiLFxyXG5cclxuICAgICAgICBib2R5Q2xhc3M6IFwiZHJhZ2dpbmdcIixcclxuICAgICAgICBhY3RpdmVDbGFzczogXCJhY3RpdmVcIixcclxuICAgICAgICBkcmFnZ2VkQ2xhc3M6IFwiZHJhZ2dlZFwiLFxyXG4gICAgICAgIHZlcnRpY2FsQ2xhc3M6IFwidmVydGljYWxcIixcclxuICAgICAgICBob3Jpc29udGFsQ2xhc3M6IFwiaG9yaXNvbnRhbFwiLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyQ2xhc3M6IFwicGxhY2Vob2xkZXJcIixcclxuXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6ICc8bGkgY2xhc3M9XCJwbGFjZWhvbGRlclwiPjwvbGk+JyxcclxuXHJcbiAgICAgICAgb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKGNvbnRleHQsIGV2ZW50LCBfc3VwZXIpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBzaXplID0ge1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBjb250ZXh0LiRpdGVtLm91dGVySGVpZ2h0KCksXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogY29udGV4dC4kaXRlbS5vdXRlcldpZHRoKCksXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBjb250ZXh0LiRvcmlnaW5hbEl0ZW0gPSBjb250ZXh0LiRpdGVtO1xyXG5cclxuICAgICAgICAgICAgY29udGV4dC4kaXRlbSA9IGNvbnRleHQuJG9yaWdpbmFsSXRlbVxyXG4gICAgICAgICAgICAgICAgLmNsb25lKClcclxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhjb250ZXh0LnNvcnRhYmxlLm9wdGlvbnMuZHJhZ2dlZENsYXNzKVxyXG4gICAgICAgICAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdmaXhlZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogZXZlbnQucGFnZVggLSBjb250ZXh0LmFkanVzdG1lbnQubGVmdCxcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IGV2ZW50LnBhZ2VZIC0gY29udGV4dC5hZGp1c3RtZW50LnRvcCxcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogc2l6ZS5zaWR0aCxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHNpemUuaGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5hcHBlbmRUbyhjb250ZXh0LiRwYXJlbnQpXHJcbiAgICAgICAgICAgIDtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvbkRyYWc6IGZ1bmN0aW9uKGNvbnRleHQsIGV2ZW50LCBfc3VwZXIpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnRleHQuJGl0ZW0uY3NzKHtcclxuICAgICAgICAgICAgICAgIGxlZnQ6IGV2ZW50LnBhZ2VYIC0gY29udGV4dC5hZGp1c3RtZW50LmxlZnQsXHJcbiAgICAgICAgICAgICAgICB0b3A6IGV2ZW50LnBhZ2VZIC0gY29udGV4dC5hZGp1c3RtZW50LnRvcCxcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBvbkRyb3A6IGZ1bmN0aW9uKGNvbnRleHQsIGV2ZW50LCBfc3VwZXIpIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnRleHQuJGl0ZW0ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIGlmIChjb250ZXh0LmxvY2F0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29udGV4dC4kaXRlbSA9IGNvbnRleHQubG9jYXRpb24uYmVmb3JlXHJcbiAgICAgICAgICAgICAgICAgICAgPyBjb250ZXh0LiRpdGVtLmluc2VydEJlZm9yZShjb250ZXh0LmxvY2F0aW9uLiRpdGVtKVxyXG4gICAgICAgICAgICAgICAgICAgIDogY29udGV4dC4kaXRlbS5pbnNlcnRBZnRlcihjb250ZXh0LmxvY2F0aW9uLiRpdGVtKVxyXG4gICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnRleHQuJGl0ZW0uY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnJyxcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcblxyXG4gICAgdmFyIGNvbnRleHQgPSBudWxsO1xyXG4gICAgdmFyIHNvcnRhYmxlcyA9IFtdO1xyXG5cclxuICAgIGZ1bmN0aW9uIFNvcnRhYmxlKCRlbGVtZW50LCBvcHRpb25zKSB7XHJcblxyXG4gICAgICAgIHRoaXMuJGVsZW1lbnQgPSAkZWxlbWVudDtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICAkZWxlbWVudC5vbignbW91c2Vkb3duLnNvcnRhYmxlJywgdGhpcy5vcHRpb25zLml0ZW1TZWxlY3RvciwgKGUpID0+IHsgdGhpcy5oYW5kbGVTdGFydChlKTsgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZHJhZ2dhYmxlID0gbnVsbDtcclxuXHJcbiAgICAgICAgc29ydGFibGVzLnB1c2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJChkb2N1bWVudClcclxuICAgICAgICAgICAgLm9uKCdtb3VzZXVwLnNvcnRhYmxlJywgKGUpID0+IHsgY29udGV4dCAmJiBjb250ZXh0LnNvcnRhYmxlLmhhbmRsZUVuZChlLCBjb250ZXh0KTsgfSlcclxuICAgICAgICAgICAgLm9uKCdtb3VzZW1vdmUuc29ydGFibGUnLCAoZSkgPT4geyBjb250ZXh0ICYmIGNvbnRleHQuc29ydGFibGUuaGFuZGxlRHJhZyhlLCBjb250ZXh0KTsgfSlcclxuICAgICAgICA7XHJcbiAgICB9KTtcclxuXHJcbiAgICBTb3J0YWJsZS5wcm90b3R5cGUgPSB7XHJcblxyXG4gICAgICAgIGRyb3BMb2NhdGlvbjogZnVuY3Rpb24oZSkge1xyXG5cclxuICAgICAgICAgICAgdmFyICRpdGVtO1xyXG4gICAgICAgICAgICB2YXIgc29ydGFibGU7XHJcblxyXG4gICAgICAgICAgICBpZiAoY29udGV4dCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBkaXNwbGF5ID0gY29udGV4dC4kaXRlbS5jc3MoJ2Rpc3BsYXknKTtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQuJGl0ZW0uY3NzKHsgZGlzcGxheTogJ25vbmUnLCB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvcnRhYmxlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzID0gc29ydGFibGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzLm9wdGlvbnMuZHJvcCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkcmVzdWx0ID0gJChkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KGUucGFnZVgsIGUucGFnZVkpKS5jbG9zZXN0KHMub3B0aW9ucy5pdGVtU2VsZWN0b3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHJlc3VsdC5sZW5ndGggJiYgJHJlc3VsdC5jbG9zZXN0KHMuJGVsZW1lbnQpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGl0ZW0gPSAkcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGUgPSBzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29udGV4dC4kaXRlbS5jc3MoeyBkaXNwbGF5OiBkaXNwbGF5LCB9KTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzb3J0YWJsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcyA9IHNvcnRhYmxlc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocy5vcHRpb25zLmRyb3ApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHJlc3VsdCA9ICQoZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChlLnBhZ2VYLCBlLnBhZ2VZKSkuY2xvc2VzdChzLm9wdGlvbnMuaXRlbVNlbGVjdG9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRyZXN1bHQubGVuZ3RoICYmICRyZXN1bHQuY2xvc2VzdChzLiRlbGVtZW50KS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtID0gJHJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlID0gcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoc29ydGFibGUgJiYgJGl0ZW0gJiYgJGl0ZW0ubGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyICRjb250YWluZXIgPSAkaXRlbS5jbG9zZXN0KHNvcnRhYmxlLm9wdGlvbnMuY29udGFpbmVyU2VsZWN0b3IpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkaXRlbS5vZmZzZXQoKTtcclxuICAgICAgICAgICAgICAgIHZhciBzaXplID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAkaXRlbS5vdXRlcldpZHRoKCksXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAkaXRlbS5vdXRlckhlaWdodCgpLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgb3JpZW50YXRpb24gPSB0aGlzLm9wdGlvbnMudmVydGljYWxcclxuICAgICAgICAgICAgICAgICAgICA/ICRjb250YWluZXIuaGFzQ2xhc3Moc29ydGFibGUub3B0aW9ucy5ob3Jpc29udGFsQ2xhc3MpID8gJ2gnIDogJ3YnXHJcbiAgICAgICAgICAgICAgICAgICAgOiAkY29udGFpbmVyLmhhc0NsYXNzKHNvcnRhYmxlLm9wdGlvbnMudmVydGljYWxDbGFzcykgPyAndicgOiAnaCdcclxuICAgICAgICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgYmVmb3JlID0gKG9yaWVudGF0aW9uID09ICdoJylcclxuICAgICAgICAgICAgICAgICAgICA/IGUucGFnZVggLSBvZmZzZXQubGVmdCA8IHNpemUud2lkdGggLyAyXHJcbiAgICAgICAgICAgICAgICAgICAgOiBlLnBhZ2VZIC0gb2Zmc2V0LnRvcCA8IHNpemUuaGVpZ2h0IC8gMlxyXG4gICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW06ICRpdGVtLFxyXG4gICAgICAgICAgICAgICAgICAgICRjb250YWluZXI6ICRjb250YWluZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGU6IHNvcnRhYmxlLFxyXG4gICAgICAgICAgICAgICAgICAgIGJlZm9yZTogYmVmb3JlLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgaGFuZGxlU3RhcnQ6IGZ1bmN0aW9uKGUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXhjbHVkZVNlbGVjdG9yICYmICQoZS50YXJnZXQpLmNsb3Nlc3QodGhpcy5vcHRpb25zLmV4Y2x1ZGVTZWxlY3RvcikubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghY29udGV4dCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciAkaXRlbSA9ICQoZS50YXJnZXQpLmNsb3Nlc3QodGhpcy5vcHRpb25zLml0ZW1TZWxlY3Rvcik7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHBhcmVudCA9ICRpdGVtLnBhcmVudCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkaXRlbS5vZmZzZXQoKTtcclxuICAgICAgICAgICAgICAgIC8vIGlmICghb2Zmc2V0KSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coJGl0ZW0sICk7XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZTogdGhpcyxcclxuICAgICAgICAgICAgICAgICAgICBpbmRleDogJGl0ZW0uaW5kZXgoKSxcclxuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyOiAkaXRlbS5jbG9zZXN0KHRoaXMub3B0aW9ucy5jb250YWluZXJTZWxlY3RvciksXHJcbiAgICAgICAgICAgICAgICAgICAgJHBhcmVudDogJGl0ZW0ucGFyZW50KCksXHJcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW06ICRpdGVtLFxyXG4gICAgICAgICAgICAgICAgICAgICRvcmlnaW5hbEl0ZW06ICRpdGVtLFxyXG4gICAgICAgICAgICAgICAgICAgICR0YXJnZXRJdGVtOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICR0YXJnZXRDb250YWluZXI6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb246IHRoaXMuZHJvcExvY2F0aW9uKGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIGFkanVzdG1lbnQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogZS5jbGllbnRYIC0gb2Zmc2V0LmxlZnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogZS5jbGllbnRZIC0gb2Zmc2V0LnRvcCxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMub25EcmFnU3RhcnQoY29udGV4dCwgZSwgZGVmYXVsdHMub25EcmFnU3RhcnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgaGFuZGxlRW5kOiBmdW5jdGlvbihlKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoY29udGV4dCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc29ydGFibGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNvcnRhYmxlID0gc29ydGFibGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICQoc29ydGFibGUub3B0aW9ucy5jb250YWluZXJTZWxlY3Rvciwgc29ydGFibGUuJGVsZW1lbnQpLnJlbW92ZUNsYXNzKHNvcnRhYmxlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0LiRwbGFjZWhvbGRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuJHBsYWNlaG9sZGVyLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnRleHQubG9jYXRpb24gPSB0aGlzLmRyb3BMb2NhdGlvbihlKTtcclxuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0LmxvY2F0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5sb2NhdGlvbi5zb3J0YWJsZS5vcHRpb25zLm9uRHJvcChjb250ZXh0LCBlLCBkZWZhdWx0cy5vbkRyb3ApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LiRpdGVtLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgaGFuZGxlRHJhZzogZnVuY3Rpb24oZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKGNvbnRleHQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvcnRhYmxlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3J0YWJsZSA9IHNvcnRhYmxlc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMub3B0aW9ucy5jb250YWluZXJTZWxlY3Rvciwgc29ydGFibGUuJGVsZW1lbnQpLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHQuJHBsYWNlaG9sZGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC4kcGxhY2Vob2xkZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29udGV4dC5sb2NhdGlvbiA9IHRoaXMuZHJvcExvY2F0aW9uKGUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHQubG9jYXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxvY2F0aW9uLiRjb250YWluZXIuYWRkQ2xhc3MoY29udGV4dC5sb2NhdGlvbi5zb3J0YWJsZS5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LiRwbGFjZWhvbGRlciA9IGNvbnRleHQubG9jYXRpb24uYmVmb3JlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gJChjb250ZXh0LmxvY2F0aW9uLnNvcnRhYmxlLm9wdGlvbnMucGxhY2Vob2xkZXIpLmluc2VydEJlZm9yZShjb250ZXh0LmxvY2F0aW9uLiRpdGVtKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6ICQoY29udGV4dC5sb2NhdGlvbi5zb3J0YWJsZS5vcHRpb25zLnBsYWNlaG9sZGVyKS5pbnNlcnRBZnRlcihjb250ZXh0LmxvY2F0aW9uLiRpdGVtKVxyXG4gICAgICAgICAgICAgICAgICAgIDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LnNvcnRhYmxlLm9wdGlvbnMub25EcmFnKGNvbnRleHQsIGUsIGRlZmF1bHRzLm9uRHJhZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgQVBJID0gJC5leHRlbmQoU29ydGFibGUucHJvdG90eXBlLCB7XHJcblxyXG4gICAgICAgIGVuYWJsZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgJC5mbltwbHVnaW5OYW1lXSA9IGZ1bmN0aW9uKG1ldGhvZE9yT3B0aW9ucykge1xyXG5cclxuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciAkdCA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBvYmplY3QgPSAkdC5kYXRhKHBsdWdpbk5hbWUpXHJcbiAgICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgICAgIGlmIChvYmplY3QgJiYgQVBJW21ldGhvZE9yT3B0aW9uc10pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBBUElbbWV0aG9kT3JPcHRpb25zXS5hcHBseShvYmplY3QsIGFyZ3MpIHx8IHRoaXM7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIW9iamVjdCAmJiAobWV0aG9kT3JPcHRpb25zID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIG1ldGhvZE9yT3B0aW9ucyA9PT0gXCJvYmplY3RcIikpIHtcclxuICAgICAgICAgICAgICAgICR0LmRhdGEocGx1Z2luTmFtZSwgbmV3IFNvcnRhYmxlKCR0LCBtZXRob2RPck9wdGlvbnMpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxufSkoalF1ZXJ5LCB3aW5kb3csICdzb3J0YWJsZScpO1xyXG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5maWx0ZXIoJ2pzb25QYXRoJywgZnVuY3Rpb24gKGNvbnRleHQsIHN0cikge1xyXG4gICAgICAgIGlmIChzdHIgPT09IHVuZGVmaW5lZCB8fCBjb250ZXh0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHJlID0gL3soW159XSspfS9nO1xyXG5cclxuICAgICAgICByZXN1bHQgPSBzdHIucmVwbGFjZShyZSwgZnVuY3Rpb24obWF0Y2gsIGV4cHIpIHtcclxuICAgICAgICAgICAganNvbiA9IEpTT05QYXRoKHtcclxuICAgICAgICAgICAgICAgIGpzb246IGNvbnRleHQsXHJcbiAgICAgICAgICAgICAgICBwYXRoOiBleHByXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoanNvbi5oYXNPd25Qcm9wZXJ0eSgxKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdhcnJheSc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ganNvbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAocmVzdWx0ID09ICdhcnJheScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEpTT05QYXRoKHtcclxuICAgICAgICAgICAgICAgIGpzb246IGNvbnRleHQsXHJcbiAgICAgICAgICAgICAgICBwYXRoOiBzdHIucmVwbGFjZShyZSwgXCIkMVwiKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5maWx0ZXIoJ3RlbXBsYXRlJywgZnVuY3Rpb24gKHN0cmluZywgZGF0YSkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciByZSA9IC8keyhbXn1dKyl9L2c7XHJcbiAgICAgICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKHJlLCBmdW5jdGlvbihtYXRjaCwga2V5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhW2tleV07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBWdWUuZmlsdGVyKCdhc3NpZ24nLCBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UxLCBzb3VyY2UyLCBzb3VyY2UzKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlMSwgc291cmNlMiwgc291cmNlMyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBWdWUuZmlsdGVyKCdjb3B5JywgZnVuY3Rpb24gKHNvdXJjZSkge1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFZ1ZSh7XHJcbiAgICAgICAgICAgIGRhdGE6IHNvdXJjZSAhPSBudWxsXHJcbiAgICAgICAgICAgICAgICA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc291cmNlKSlcclxuICAgICAgICAgICAgICAgIDogbnVsbFxyXG4gICAgICAgIH0pLiRkYXRhO1xyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmZpbHRlcignY2xvbmUnLCBmdW5jdGlvbiAoc291cmNlKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgVnVlKHtcclxuICAgICAgICAgICAgZGF0YTogc291cmNlICE9IG51bGxcclxuICAgICAgICAgICAgICAgID8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzb3VyY2UpKVxyXG4gICAgICAgICAgICAgICAgOiBudWxsXHJcbiAgICAgICAgfSkuJGRhdGE7XHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBDb3JlKSB7XHJcblxyXG4gICAgVnVlLmRpcmVjdGl2ZSgnYWZmaXgnLCB7XHJcblxyXG4gICAgICAgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICgkLmZuLmFmZml4KSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMuZWwpLmFmZml4KHRoaXMudm0uJGdldCh0aGlzLmV4cHJlc3Npb24pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBDb3JlKSB7XHJcblxyXG4gICAgVnVlLmRpcmVjdGl2ZSgnY29tYm8nLCB7XHJcblxyXG4gICAgICAgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICgkLmZuLnRhZ3NpbnB1dCkge1xyXG5cclxuICAgICAgICAgICAgICAgICQodGhpcy5lbCkuc2VsZWN0Mih7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFnczogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBtdWx0aXBsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlVGFnOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogcGFyYW1zLnRlcm0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBwYXJhbXMudGVybSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld09wdGlvbjogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVuYmluZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuZGlyZWN0aXZlKCdkYXRlJywge1xyXG5cclxuICAgICAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoJC5mbi5kYXRlcGlja2VyKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgJCh0aGlzLmVsKS5kYXRlcGlja2VyKHtcclxuICAgICAgICAgICAgICAgICAgICBhdXRvY2xvc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9kYXlIaWdobGlnaHQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiBcInl5eXktbW0tZGRcIlxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5kaXJlY3RpdmUoJ3JpY2gnLCB7XHJcblxyXG4gICAgICAgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh3aW5kb3cuQ0tFRElUT1IpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVkaXRvciA9IENLRURJVE9SLmlubGluZSh0aGlzLmVsLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVzU2V0OiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ0JvbGRlcicsIGVsZW1lbnQ6ICdzcGFuJywgYXR0cmlidXRlczogeyAnY2xhc3MnOiAnZXh0cmFib2xkJ30gfVxyXG4gICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgdG9vbGJhckdyb3VwczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB7IG5hbWU6ICdjbGlwYm9hcmQnLCAgIGdyb3VwczogWyAnY2xpcGJvYXJkJywgJ3VuZG8nIF0gfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8geyBuYW1lOiAnZWRpdGluZycsICAgICBncm91cHM6IFsgJ2ZpbmQnLCAnc2VsZWN0aW9uJywgJ3NwZWxsY2hlY2tlcicgXSB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdsaW5rcycgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8geyBuYW1lOiAnZm9ybXMnIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiAndG9vbHMnfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6ICdkb2N1bWVudCcsIGdyb3VwczogWydtb2RlJywgJ2RvY3VtZW50JywgJ2RvY3Rvb2xzJ119LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ290aGVycyd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ3BhcmFncmFwaCcsIGdyb3VwczogWydsaXN0JywgJ2luZGVudCcsICdibG9ja3MnLCAnYWxpZ24nXX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnY29sb3JzJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICcvJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6ICdiYXNpY3N0eWxlcycsIGdyb3VwczogWydiYXNpY3N0eWxlcycsICdjbGVhbnVwJ119LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ3N0eWxlcyd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnLycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2luc2VydCcsIGdyb3VwczogWyAnSW1hZ2VCdXR0b24nIF0gIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy97bmFtZTogJ2Fib3V0J31cclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVkaXRvci5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lZGl0b3IudXBkYXRlRWxlbWVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudm0uJHNldCh0aGlzLmV4cHJlc3Npb24sICQodGhpcy5lbCkudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVkaXRvci5zZXREYXRhKHRoaXMudm0uJGdldCh0aGlzLmV4cHJlc3Npb24pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygndXBkYXRlJywgbmV3VmFsdWUsIG9sZFZhbHVlKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5lZGl0b3IuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB0aGlzLmVkaXRvciA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dGFyZWEgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0ID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBDb3JlKSB7XHJcblxyXG4gICAgVnVlLmRpcmVjdGl2ZSgnc2Nyb2xsYWJsZScsIHtcclxuXHJcbiAgICAgICAgYmluZDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgLy8gJCh0aGlzLmVsKS5jc3Moe1xyXG4gICAgICAgICAgICAvLyAgICAgJ292ZXJmbG93JzogJ2F1dG8nLFxyXG4gICAgICAgICAgICAvLyB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmICgkLmZuLnBlcmZlY3RTY3JvbGxiYXIpIHtcclxuICAgICAgICAgICAgICAgIFZ1ZS5uZXh0VGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMuZWwpLnBlcmZlY3RTY3JvbGxiYXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBheGlzOiB0aGlzLmV4cHJlc3Npb25cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVuYmluZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuZGlyZWN0aXZlKCd0YWdzJywge1xyXG5cclxuICAgICAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoJC5mbi50YWdzaW5wdXQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAkKHRoaXMuZWwpLnRhZ3NpbnB1dCh7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBDb3JlKSB7XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcG9zaXRpb24oZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIG1vZGFsID0gJChlbGVtZW50KSxcclxuICAgICAgICAgICAgICAgIGRpYWxvZyA9ICQoJy5tb2RhbC1kaWFsb2cnLCBtb2RhbCk7XHJcblxyXG4gICAgICAgICAgICBtb2RhbC5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgZGlhbG9nLmNzcyhcIm1hcmdpbi10b3BcIiwgTWF0aC5tYXgoMCwgKCQod2luZG93KS5oZWlnaHQoKSAtIGRpYWxvZy5oZWlnaHQoKSkgLyAyKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkKCQoZG9jdW1lbnQpLCAnLm1vZGFsLm1vZGFsLWNlbnRlcicpLm9uKCdzaG93LmJzLm1vZGFsJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICByZXBvc2l0aW9uKGUudGFyZ2V0KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICQoJy5tb2RhbC5tb2RhbC1jZW50ZXI6dmlzaWJsZScpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHJlcG9zaXRpb24oZWxlbWVudCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS52YWxpZGF0b3IoJ2VtYWlsJywgZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgICByZXR1cm4gL14oKFtePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSsoXFwuW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKykqKXwoXFxcIi4rXFxcIikpQCgoXFxbWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcXSl8KChbYS16QS1aXFwtMC05XStcXC4pK1thLXpBLVpdezIsfSkpJC8udGVzdCh2YWwpXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuXHJcbiAgICBWdWUudXNlKHtcclxuXHJcbiAgICAgICAgaW5zdGFsbDogZnVuY3Rpb24oVnVlLCBvcHRpb25zKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgc2VydmljZXMgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlID0gZnVuY3Rpb24obmFtZSwgc2VydmljZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBzZXJ2aWNlc1tuYW1lXSA9IHNlcnZpY2VzW25hbWVdIHx8IHNlcnZpY2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIHZhciBNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdiaW5kaW5ncy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjYmluZGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgc2V0U3RyYXRlZ3k6IGZ1bmN0aW9uKHN0cmF0ZWd5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2N1cnJlbnQuYmluZGluZy5zdHJhdGVneScsIHN0cmF0ZWd5KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ2V0U3RyYXRlZ3k6IGZ1bmN0aW9uKHN0cmF0ZWd5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy4kZ2V0KCdjdXJyZW50LmJpbmRpbmcuc3RyYXRlZ3knKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuY3VycmVudC5iaW5kaW5nKSB0aGlzLmN1cnJlbnQuYmluZGluZyA9IHt9O1xyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2JpbmRpbmdzJywge1xyXG5cclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkFjdGlvbk1peGluKE1vZGFsRWRpdG9yKV0sXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsKSB7XHJcblxyXG4gICAgdmFyIExpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJyldLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdkb21haW5zJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zJyxcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICB2YXIgU2V0dGluZ3NMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLXNldHRpbmdzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTZXR0aW5nc01vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtc2V0dGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNldHRpbmdzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTZXR0aW5nc0xpc3RWaWV3ZXIsIFNldHRpbmdzTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLXNldHRpbmdzJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIFNoZWxsKTtcclxuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcclxuXHJcbiAgICB2YXIgTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJyldLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMnLFxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBTZXR0aW5nc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc2V0dGluZ3MtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zZXR0aW5ncy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU2V0dGluZ3NNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zZXR0aW5ncy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc2V0dGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNldHRpbmdzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNldHRpbmdzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU2V0dGluZ3NMaXN0Vmlld2VyLCBTZXR0aW5nc01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc2V0dGluZ3MnLFxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBNZXRhc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtbWV0YXMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1tZXRhcy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgTWV0YXNNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1tZXRhcy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtbWV0YXMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIE1ldGFzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLW1ldGFzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTWV0YXNMaXN0Vmlld2VyLCBNZXRhc01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtbWV0YXMnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIHZhciBMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignbWFpbicpXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcycsXHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgdmFyIFNldHRpbmdzTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLXNldHRpbmdzLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1zZXR0aW5ncy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU2V0dGluZ3NNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLXNldHRpbmdzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLXNldHRpbmdzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTZXR0aW5nc0VkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLXNldHRpbmdzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU2V0dGluZ3NMaXN0Vmlld2VyLCBTZXR0aW5nc01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1zZXR0aW5ncycsXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsKSB7XHJcblxyXG4gICAgdmFyIFBhcmFtVmFyaWFibGUgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLXZhcmlhYmxlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy12YXJpYWJsZScsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgaWQ6IFN0cmluZyxcclxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtU3RyaW5nID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1zdHJpbmcnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLXN0cmluZycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgaWQ6IFN0cmluZyxcclxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtUmljaCA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtcmljaCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtcmljaCcsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgaWQ6IFN0cmluZyxcclxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtU291cmNlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1zb3VyY2UnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLXNvdXJjZScsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgaWQ6IFN0cmluZyxcclxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtTXVsdGlwbGUgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLW11bHRpcGxlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1tdWx0aXBsZScsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgaWQ6IFN0cmluZyxcclxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLml0ZW0uaXRlbXNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgUGFyYW1PYmplY3QgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLW9iamVjdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtb2JqZWN0JyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBpZDogU3RyaW5nLFxyXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtcyA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBvd25lcjogT2JqZWN0LFxyXG4gICAgICAgICAgICB0YWI6IFN0cmluZyxcclxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgdmFyIFBhcmFtTXVsdGlwbGVMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1tdWx0aXBsZS1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1tdWx0aXBsZS1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgcHJvcDogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYXJhbTogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBnZXRMYWJlbDogZnVuY3Rpb24oaXRlbSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3AuZGlzcGxheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB2bSA9IG5ldyBWdWUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2bS4kaW50ZXJwb2xhdGUodGhpcy5wcm9wLmRpc3BsYXkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICc8aXRlbT4nO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBQYXJhbUJpbmRpbmdzTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLWJpbmRpbmdzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtYmluZGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignYmluZGluZycpIF0sXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtcyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcblxyXG4gICAgICAgICAgICB2YXIgYmluZGluZyA9IHRoaXMuY3VycmVudC5iaW5kaW5nIHx8IHt9O1xyXG4gICAgICAgICAgICBpZiAoIWJpbmRpbmcuc3RyYXRlZ3kpIGJpbmRpbmcuc3RyYXRlZ3kgPSAnaW50ZXJwb2xhdGUnO1xyXG5cclxuICAgICAgICAgICAgYmluZGluZy5wYXJhbXMgPSBiaW5kaW5nLnBhcmFtcyB8fCB7fTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbnRleHQucHJvcC5wcm9wcykge1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZXh0LnByb3AucHJvcHMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb3AgPSB0aGlzLmNvbnRleHQucHJvcC5wcm9wc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAvLyB2YXIgcGFyYW0gPSBiaW5kaW5nLnBhcmFtc1twcm9wLm5hbWVdID0gYmluZGluZy5wYXJhbXNbcHJvcC5uYW1lXSB8fCB7fTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhwcm9wLm5hbWUsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5jdXJyZW50KSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHRoaXMuY3VycmVudC52YWx1ZVtwcm9wLm5hbWVdID0gdGhpcy5jdXJyZW50LnZhbHVlW3Byb3AubmFtZV0gfHwge307XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtLl9hY3Rpb24gPSBwYXJhbS5fYWN0aW9uID09ICd1cGRhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gJ3VwZGF0ZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiAnY3JlYXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3A6IHByb3AsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtOiBwYXJhbSxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhpdGVtcyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2N1cnJlbnQuYmluZGluZycsIGJpbmRpbmcpO1xyXG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2l0ZW1zJywgaXRlbXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBzZXRTdHJhdGVneTogZnVuY3Rpb24oc3RyYXRlZ3kpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnY3VycmVudC5iaW5kaW5nLnN0cmF0ZWd5Jywgc3RyYXRlZ3kpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBnZXRTdHJhdGVneTogZnVuY3Rpb24oc3RyYXRlZ3kpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLiRnZXQoJ2N1cnJlbnQuYmluZGluZy5zdHJhdGVneScpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1iaW5kaW5ncycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkFjdGlvbk1peGluKFBhcmFtQmluZGluZ3NNb2RhbEVkaXRvcildLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtTXVsdGlwbGVNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtbXVsdGlwbGUtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1tdWx0aXBsZS1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2RhdGEnKV0sXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtcyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcblxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnY3JlYXRlZCcsIFBhcmFtTXVsdGlwbGVNb2RhbEVkaXRvcik7XHJcblxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLmNvbnRleHQucHJvcCk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGV4dC5wcm9wLnByb3BzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHByb3AgPSB0aGlzLmNvbnRleHQucHJvcC5wcm9wc1tpXTtcclxuICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHRoaXMuY3VycmVudFtwcm9wLm5hbWVdID0gdGhpcy5jdXJyZW50W3Byb3AubmFtZV0gfHwgeyB2YWx1ZTogbnVsbCB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHBhcmFtLl9hY3Rpb24gPSBwYXJhbS5fYWN0aW9uID09ICd1cGRhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgPyAndXBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgIDogJ2NyZWF0ZSdcclxuICAgICAgICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wOiBwcm9wLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtOiBwYXJhbSxcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coaXRlbSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy4kc2V0KCdpdGVtcycsIGl0ZW1zKTtcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtTXVsdGlwbGVFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLW11bHRpcGxlLWVkaXRvcicsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFBhcmFtTXVsdGlwbGVMaXN0Vmlld2VyLCBQYXJhbU11bHRpcGxlTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtbXVsdGlwbGUtZWRpdG9yJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBwcm9wOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhcmFtOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBQYXJhbXNMaXN0ID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1saXN0JyxcclxuICAgICAgICBjb21wb25lbnRzOiB7XHJcbiAgICAgICAgICAgICdwYXJhbXMtc3RyaW5nJzogUGFyYW1TdHJpbmcsXHJcbiAgICAgICAgICAgICdwYXJhbXMtcmljaCc6IFBhcmFtUmljaCxcclxuICAgICAgICAgICAgJ3BhcmFtcy1zb3VyY2UnOiBQYXJhbVNvdXJjZSxcclxuICAgICAgICAgICAgJ3BhcmFtcy1tdWx0aXBsZSc6IFBhcmFtTXVsdGlwbGUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBvd25lcjogT2JqZWN0LFxyXG4gICAgICAgICAgICB0YWI6IFN0cmluZyxcclxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsKSB7XHJcblxyXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NldHRpbmdzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzZXR0aW5ncy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2RvbWFpbnMnKV0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NldHRpbmdzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuQWN0aW9uTWl4aW4oTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgcHVzaDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9zZXR0aW5ncy9kby11cGRhdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKSxcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmRvbmUoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIGQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcHVsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9zZXR0aW5ncycsXHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZG9uZSgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgZCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIHZhciBTdG9yYWdlc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc3RvcmFnZXMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzdG9yYWdlcy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU3RvcmFnZXNNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzdG9yYWdlcy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc3RvcmFnZXMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgY2hlY2s6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2NoZWNrJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU3RvcmFnZXNFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc3RvcmFnZXMnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTdG9yYWdlc0xpc3RWaWV3ZXIsIFN0b3JhZ2VzTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzdG9yYWdlcycsXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU3RvcmFnZXNWYXJpYWJsZXNMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3N0b3JhZ2VzLXZhcmlhYmxlcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3N0b3JhZ2VzLXZhcmlhYmxlcy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU3RvcmFnZXNWYXJpYWJsZXNNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzdG9yYWdlcy12YXJpYWJsZXMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3N0b3JhZ2VzLXZhcmlhYmxlcy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU3RvcmFnZXNWYXJpYWJsZXNFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc3RvcmFnZXMtdmFyaWFibGVzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU3RvcmFnZXNWYXJpYWJsZXNMaXN0Vmlld2VyLCBTdG9yYWdlc1ZhcmlhYmxlc01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc3RvcmFnZXMtdmFyaWFibGVzJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIFNoZWxsKTtcclxuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcclxuXHJcbiAgICB2YXIgTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCd3aWRnZXRzLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjd2lkZ2V0cy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnd2lkZ2V0cy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjd2lkZ2V0cy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3dpZGdldHMnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihMaXN0Vmlld2VyLCBNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3dpZGdldHMnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWFjdGlvbnMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtYWN0aW9ucycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcclxuICAgICAgICAgICAgY2F0ZWdvcnk6IE9iamVjdCxcclxuICAgICAgICAgICAgZG9tYWluOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgaXRlbSwgY29udGV4dCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtYnJhbmQnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtYnJhbmQnLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWNhdGVnb3JpZXMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtY2F0ZWdvcmllcycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgY2F0ZWdvcmllczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGl0ZW0sIGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWNvbnRhaW5lcicsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1jb250YWluZXInLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XHJcblxyXG4gICAgdmFyIHJ1bnRpbWUgPSBWdWUuc2VydmljZSgncnVudGltZScsIHtcclxuXHJcbiAgICAgICAgZXZhbHVhdGU6IGZ1bmN0aW9uKHNlbGYsIGIsIHYpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChiICYmIGIuZXhwcmVzc2lvbikge1xyXG5cclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGIuc3RyYXRlZ3kgPT0gJ2V2YWwnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHNlbGYuJGV2YWwoYi5leHByZXNzaW9uKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYi5zdHJhdGVneSA9PSAnd2lyZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gc2VsZi4kZ2V0KGIuZXhwcmVzc2lvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi4kaW50ZXJwb2xhdGUoYi5leHByZXNzaW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Nhbm5vdCBldmFsdWF0ZSBleHByZXNzaW9uJywgYi5leHByZXNzaW9uKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHY7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZXZhbHVhdGVQYXJhbXM6IGZ1bmN0aW9uKHNlbGYsIHByb3BzLCBwYXJhbXMpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHByb3BzW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gcGFyYW1zICYmIHBhcmFtc1twcm9wLm5hbWVdO1xyXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogcHJvcCxcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbTogcGFyYW0sXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHZhbHVlID0ge307XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IGl0ZW1zW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBuID0gaXRlbS5wcm9wLm5hbWU7XHJcbiAgICAgICAgICAgICAgICB2YXIgciA9IGl0ZW0ucHJvcC52YXJpYWJsZTtcclxuICAgICAgICAgICAgICAgIHZhciBiID0gaXRlbS5wYXJhbS5iaW5kaW5nO1xyXG4gICAgICAgICAgICAgICAgdmFyIHYgPSBpdGVtLnBhcmFtLnZhbHVlO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLnByb3AudHlwZSA9PSAnb2JqZWN0Jykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgdnY7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChiICYmIGIuZXhwcmVzc2lvbikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVbbl0gPSB2djtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXMgPSB0aGlzLmV2YWx1YXRlUGFyYW1zKHNlbGYsIGl0ZW0ucHJvcC5wcm9wcywgdik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZ2ID0gciA/IHsgdmFsdWU6IHJlcyB9IDogcmVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVtuXSA9IHZ2O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0ucHJvcC50eXBlID09ICdtdWx0aXBsZScpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGIgJiYgYi5leHByZXNzaW9uKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdnYgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFycmF5ID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBydW50aW1lLmV2YWx1YXRlKHNlbGYsIGIsIHYpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZ2ID0gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkLmlzQXJyYXkocmVzdWx0KSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJlc3VsdC5sZW5ndGg7IGorKykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZtID0gbmV3IFZ1ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBPYmplY3QuYXNzaWduKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc2VsZi4kZGF0YSkpLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogaixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdFtqXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5LnB1c2godGhpcy5ldmFsdWF0ZVBhcmFtcyh2bSwgaXRlbS5wcm9wLnByb3BzLCBiLnBhcmFtcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdnYgPSBhcnJheTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFycmF5ID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgdi5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZpID0gdltqXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2aS5fYWN0aW9uICE9ICdyZW1vdmUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyYXlbaW5kZXgrK10gPSB0aGlzLmV2YWx1YXRlUGFyYW1zKHNlbGYsIGl0ZW0ucHJvcC5wcm9wcywgdmkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2diA9IHIgPyB7IHZhbHVlOiBhcnJheSB9IDogYXJyYXk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZVtuXSA9IHZ2O1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciB2diA9IHJ1bnRpbWUuZXZhbHVhdGUoc2VsZiwgYiwgdik7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVbbl0gPSB2diB8fCAnJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBEZWNvcmF0b3JNaXhpbiA9IHtcclxuXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgICAgIHJlbW92ZVdpZGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaCgncmVtb3ZlQ2hpbGRXaWRnZXQnLCB7IGl0ZW06IHRoaXMubW9kZWwgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBkb0FwcGx5OiBmdW5jdGlvbihtb2RlbCkge1xyXG5cclxuICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShtb2RlbCkpLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogdGhpcy5tb2RlbC5fYWN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy5tb2RlbC5fYWN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogJ3VwZGF0ZSdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIHNob3dTZXR0aW5nczogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGRpYWxvZyA9IG5ldyBTaGVsbC5XaWRnZXRzLk1vZGFsRWRpdG9yKHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxzOiB0aGlzLmdsb2JhbHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQ6IHRoaXMud2lkZ2V0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiB0aGlzLm1vZGVsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpKVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3duZXIuZG9BcHBseSh0aGlzLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSkuJG1vdW50KCkuJGFwcGVuZFRvKCQoJ2JvZHknKS5nZXQoMCkpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBCaW5kaW5nc01peGluID0ge1xyXG5cclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGJpbmRpbmdzOiB0aGlzLmJpbmRpbmdzLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ2RhdGEnLCAoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdmFyIGJpbmRpbmdzID0gcnVudGltZS5ldmFsdWF0ZVBhcmFtcyh0aGlzLCB0aGlzLndpZGdldC5wcm9wcywgdGhpcy5tb2RlbC5wYXJhbXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdiaW5kaW5ncycsIGJpbmRpbmdzKTtcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnc3RvcmFnZScsIChzdG9yYWdlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYmluZGluZ3MgPSBydW50aW1lLmV2YWx1YXRlUGFyYW1zKHRoaXMsIHRoaXMud2lkZ2V0LnByb3BzLCB0aGlzLm1vZGVsLnBhcmFtcyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2JpbmRpbmdzJywgYmluZGluZ3MpO1xyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBkZWVwOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdtb2RlbCcsIChtb2RlbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdmFyIGJpbmRpbmdzID0gcnVudGltZS5ldmFsdWF0ZVBhcmFtcyh0aGlzLCB0aGlzLndpZGdldC5wcm9wcywgbW9kZWwucGFyYW1zKVxyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdiaW5kaW5ncycsIGJpbmRpbmdzKTtcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgQ29tcG9zaXRlTWl4aW4gPSB7XHJcblxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IHRoaXMuY2hpbGRyZW4sXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnaXRlbXMnLCAoaXRlbXMpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBbXTtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBpdGVtc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uX2FjdGlvbiAhPSAncmVtb3ZlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnBsYWNlaG9sZGVyKCkpKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBkZWVwOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBldmVudHM6IHtcclxuXHJcbiAgICAgICAgICAgIHJlbW92ZUNoaWxkV2lkZ2V0OiBmdW5jdGlvbihkYXRhKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBkYXRhLml0ZW07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uX2FjdGlvbiA9PSAnY3JlYXRlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMuJHJlbW92ZShpdGVtKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5fYWN0aW9uID0gJ3JlbW92ZSc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtcyA9IHRoaXMuaXRlbXMuc2xpY2UoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBtZXRob2RzOiB7XHJcblxyXG4gICAgICAgICAgICAvLyBmaW5kOiBmdW5jdGlvbihjaGlsZHJlbiwgaXRlbSkge1xyXG4gICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAvLyAgICAgdmFyIGluZGV4ID0gMDtcclxuICAgICAgICAgICAgLy8gICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoICYmIGluZGV4IDwgZG9tSW5kZXg7IGkrKykge1xyXG4gICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAvLyAgICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAvLyAgICAgICAgIGlmIChjaGlsZC5fYWN0aW9uICE9ICdyZW1vdmUnKSB7XHJcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgIC8vICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAvLyAgICAgcmV0dXJuIGluZGV4O1xyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcblxyXG4gICAgdmFyIFNvcnRhYmxlTWl4aW4gPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IHRoaXMuc2VsZWN0ZWQsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgYXR0YWNoZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRyb3V0ZS5wcml2YXRlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzaGVsbCA9IFZ1ZS5zZXJ2aWNlKCdzaGVsbCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLiR3YXRjaCgnc2VsZWN0ZWQnLCBmdW5jdGlvbihzZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGlmICh0aGlzLnNvcnRhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICB0aGlzLnNvcnRhYmxlLnNvcnRhYmxlKFwiZGlzYWJsZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgdGhpcy5zb3J0YWJsZS5zb3J0YWJsZShcImVuYWJsZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0VGFyZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgdW5zZWxlY3RUYXJnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1kZWNvcmF0b3Itc3R1YicsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kZWNvcmF0b3Itc3R1YicsXHJcbiAgICAgICAgbWl4aW5zOiBbIERlY29yYXRvck1peGluLCBCaW5kaW5nc01peGluIF0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxyXG4gICAgICAgICAgICB3aWRnZXQ6IE9iamVjdCxcclxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXHJcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtZGVjb3JhdG9yLXdpZGdldCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kZWNvcmF0b3Itd2lkZ2V0JyxcclxuICAgICAgICBtaXhpbnM6IFsgRGVjb3JhdG9yTWl4aW4sIEJpbmRpbmdzTWl4aW4gXSxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdG9yYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0LFxyXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcclxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1kZWNvcmF0b3ItaG9yaXNvbnRhbCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kZWNvcmF0b3ItaG9yaXNvbnRhbCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIERlY29yYXRvck1peGluLCBDb21wb3NpdGVNaXhpbiwgU29ydGFibGVNaXhpbignPi5nZS5nZS1jb250ZW50ID4ud2cud2ctZGVmYXVsdC1zdGFjayA+LndnLndnLWNvbnRlbnQgPi53Zy53Zy10YWJsZSA+LndnLndnLXJvdycpLCBCaW5kaW5nc01peGluIF0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxyXG4gICAgICAgICAgICB3aWRnZXQ6IE9iamVjdCxcclxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXHJcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFZ1ZS5zZXJ2aWNlKCdwYWxldHRlJykucGxhY2Vob2xkZXIoYFxyXG4gICAgICAgICAgICAgICAgICAgIDxzbWFsbD5Ib3Jpc29udGFsIFN0YWNrPC9zbWFsbD5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2PkRyb3AgSGVyZTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtZGVjb3JhdG9yLXZlcnRpY2FsJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWRlY29yYXRvci12ZXJ0aWNhbCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIERlY29yYXRvck1peGluLCBDb21wb3NpdGVNaXhpbiwgU29ydGFibGVNaXhpbignPi5nZS5nZS1jb250ZW50ID4ud2cud2ctZGVmYXVsdC1zdGFjayA+LndnLndnLWNvbnRlbnQgPi53Zy53Zy10YWJsZScpLCBCaW5kaW5nc01peGluIF0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxyXG4gICAgICAgICAgICB3aWRnZXQ6IE9iamVjdCxcclxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXHJcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFZ1ZS5zZXJ2aWNlKCdwYWxldHRlJykucGxhY2Vob2xkZXIoYFxyXG4gICAgICAgICAgICAgICAgICAgIDxzbWFsbD5WZXJ0aWNhbCBTdGFjazwvc21hbGw+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdj5Ecm9wIEhlcmU8L2Rpdj5cclxuICAgICAgICAgICAgICAgIGApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci1jYW52YXMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZGVjb3JhdG9yLWNhbnZhcycsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvbXBvc2l0ZU1peGluLCBTb3J0YWJsZU1peGluKCc+LmdlLmdlLWNvbnRlbnQgPi53Zy53Zy1kZWZhdWx0LXN0YWNrID4ud2cud2ctY29udGVudCA+LndnLndnLXRhYmxlJykgXSxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdG9yYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxyXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhdHRhY2hlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgZHJhZ2dlZDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc29ydGFibGUgPSAkKHRoaXMuJGVsKS5zb3J0YWJsZSh7XHJcblxyXG4gICAgICAgICAgICAgICAgdmVydGljYWw6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBkcm9wOiB0cnVlLFxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lclNlbGVjdG9yOiAnLndnLndnLXNvcnRhYmxlLWNvbnRhaW5lci53Zy1zb3J0YWJsZS1lZGl0YWJsZScsXHJcbiAgICAgICAgICAgICAgICBpdGVtU2VsZWN0b3I6ICcud2cud2ctc29ydGFibGUtaXRlbS53Zy1zb3J0YWJsZS1lZGl0YWJsZScsXHJcbiAgICAgICAgICAgICAgICBleGNsdWRlU2VsZWN0b3I6ICcuZ2UuZ2Utb3ZlcmxheScsXHJcblxyXG4gICAgICAgICAgICAgICAgdmVydGljYWxDbGFzczogXCJ3Zy1zb3J0YWJsZS12ZXJ0aWNhbFwiLFxyXG4gICAgICAgICAgICAgICAgaG9yaXNvbnRhbENsYXNzOiBcIndnLXNvcnRhYmxlLWhvcmlzb250YWxcIixcclxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBgXHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIndnIHdnLXNvcnRhYmxlLXBsYWNlaG9sZGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3ZyB3Zy1wbGFjZWhvbGRlci1jb250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3ZyB3Zy1wbGFjZWhvbGRlci1pbm5lclwiPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIGAsXHJcbiAgICAgICAgICAgICAgICBvbkRyYWdTdGFydDogZnVuY3Rpb24oY29udGV4dCwgZXZlbnQsIF9zdXBlcikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBfc3VwZXIoY29udGV4dCwgZXZlbnQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhY2sgPSAkKGNvbnRleHQuJGNvbnRhaW5lcikuY2xvc2VzdCgnLmdlLmdlLXdpZGdldCcpLmdldCgwKS5fX3Z1ZV9fO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB2dWUgPSBjb250ZXh0LiRvcmlnaW5hbEl0ZW0uZmluZCgnLmdlLmdlLXdpZGdldDpmaXJzdCcpLmdldCgwKS5fX3Z1ZV9fO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh2dWUubW9kZWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnZWQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrOiBzdGFjayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW5kZXg6IHN0YWNrLmZpbmQoc3RhY2suaXRlbXMsIGNvbnRleHQuJG9yaWdpbmFsSXRlbS5pbmRleCgpKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXg6IHN0YWNrLml0ZW1zLmluZGV4T2YodnVlLm1vZGVsKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdnVlOiB2dWUsXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbkRyb3A6IGZ1bmN0aW9uKGNvbnRleHQsIGV2ZW50LCBfc3VwZXIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgX3N1cGVyKGNvbnRleHQsIGV2ZW50KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZ1ZSA9IGNvbnRleHQubG9jYXRpb24uJGl0ZW0uZmluZCgnLmdlLmdlLXdpZGdldDpmaXJzdCcpLmdldCgwKS5fX3Z1ZV9fXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdTdGFjayA9IGNvbnRleHQubG9jYXRpb24uJGNvbnRhaW5lci5jbG9zZXN0KCcuZ2UuZ2Utd2lkZ2V0JykuZ2V0KDApLl9fdnVlX187XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdJbmRleCA9IG5ld1N0YWNrLml0ZW1zLmluZGV4T2YodnVlLm1vZGVsKSArIChjb250ZXh0LmxvY2F0aW9uLmJlZm9yZSA/IDAgOiAxKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHcgPSBjb250ZXh0LiRpdGVtLmRhdGEoJ3dpZGdldCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAodykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0l0ZW0gPSBWdWUuc2VydmljZSgncGFsZXR0ZScpLml0ZW0odyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0YWNrLml0ZW1zLnNwbGljZShuZXdJbmRleCwgMCwgbmV3SXRlbSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZHJhZ2dlZCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9sZFN0YWNrID0gZHJhZ2dlZC5zdGFjaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9sZEluZGV4ID0gZHJhZ2dlZC5pbmRleDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9sZEl0ZW0gPSBkcmFnZ2VkLnZ1ZS5tb2RlbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdJdGVtID0gT2JqZWN0LmFzc2lnbihKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRyYWdnZWQudnVlLm1vZGVsKSkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9sZFN0YWNrICE9IG5ld1N0YWNrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG5ld0l0ZW0ucmVzb3VyY2UuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgbmV3SXRlbS5pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0l0ZW0uX2FjdGlvbiA9ICdjcmVhdGUnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvbGRJdGVtLl9hY3Rpb24gPT0gJ2NyZWF0ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRTdGFjay5pdGVtcy5zcGxpY2Uob2xkSW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRJdGVtLl9hY3Rpb24gPSAncmVtb3ZlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdTdGFjay5pdGVtcy5zcGxpY2UobmV3SW5kZXgsIDAsIG5ld0l0ZW0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdJbmRleCAhPSBvbGRJbmRleCAmJiBuZXdJbmRleCAhPSBvbGRJbmRleCArIDEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdJdGVtLl9hY3Rpb24gPSBvbGRJdGVtLl9hY3Rpb24gPT0gJ2NyZWF0ZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdjcmVhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdJbmRleCA8IG9sZEluZGV4KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZFN0YWNrLml0ZW1zLnNwbGljZShvbGRJbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RhY2suaXRlbXMuc3BsaWNlKG5ld0luZGV4LCAwLCBuZXdJdGVtKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0luZGV4ID4gb2xkSW5kZXgpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RhY2suaXRlbXMuc3BsaWNlKG5ld0luZGV4LCAwLCBuZXdJdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRTdGFjay5pdGVtcy5zcGxpY2Uob2xkSW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbGRTdGFjay5pdGVtcyA9IG9sZFN0YWNrLml0ZW1zLnNsaWNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0YWNrLml0ZW1zID0gbmV3U3RhY2suaXRlbXMuc2xpY2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuJGl0ZW0ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gVnVlLnNlcnZpY2UoJ3BhbGV0dGUnKS5wbGFjZWhvbGRlcihgXHJcbiAgICAgICAgICAgICAgICAgICAgPHNtYWxsPlZlcnRpY2FsIFN0YWNrPC9zbWFsbD5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2PkRyb3AgSGVyZTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRvbWFpbnMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZG9tYWlucycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZG9tYWluczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIFNoZWxsLkxvYWRlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1sb2FkZXInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtbG9hZGVyJyxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHBvcnRhbDogbnVsbCxcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiBudWxsLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3BvcnRhbHMnKS5nZXQoeyBpZDogdGhpcy4kcm91dGUucGFyYW1zLnBvcnRhbCB9KS50aGVuKFxyXG4gICAgICAgICAgICAgICAgKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ3BvcnRhbCcsIGQuZGF0YS5wb3J0YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnc2V0dGluZ3MnLCBkLmRhdGEuc2V0dGluZ3MpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXBhZ2UnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcGFnZScsXHJcbiAgICAgICAgbWl4aW5zOiBbIC8qQ29yZS5Db250YWluZXJNaXhpbiwgQ29yZS5Tb3J0YWJsZU1peGluKi8gXSxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZGVjb3JhdG9yOiB0aGlzLmRlY29yYXRvcixcclxuICAgICAgICAgICAgICAgIGRhdGE6IHRoaXMuZGF0YSxcclxuICAgICAgICAgICAgICAgIHN0b3JhZ2U6IHRoaXMuc3RvcmFnZSxcclxuICAgICAgICAgICAgICAgIHBhZ2VTZXR0aW5nczoge30sXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBydW50aW1lID0gVnVlLnNlcnZpY2UoJ3J1bnRpbWUnKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZGVjb3JhdG9yID0gJ3NoZWxsLWRlY29yYXRvci1jYW52YXMnO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSB7fTtcclxuICAgICAgICAgICAgdGhpcy5zdG9yYWdlID0ge307XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgncGFnZS5yZXNvdXJjZScsIChyZXNvdXJjZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdwYWdlU2V0dGluZ3Mud2lkdGgnLCAnOTYwcHgnKTsgLy8gZGVmYXVsdFxyXG4gICAgICAgICAgICAgICAgaWYgKHJlc291cmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChwYXJhbSBpbiByZXNvdXJjZS5wYXJhbXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdwYWdlU2V0dGluZ3MuJyArIHJlc291cmNlLnBhcmFtc1twYXJhbV0ubmFtZSwgcmVzb3VyY2UucGFyYW1zW3BhcmFtXS52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBkZWVwOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdwYWdlLnN0b3JhZ2VzJywgKHN0b3JhZ2VzKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHN0b3JhZ2VzKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdG9yYWdlID0ge307XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RvcmFnZXMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdCA9IHN0b3JhZ2VzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdG9yYWdlW3N0Lm5hbWVdID0ge307XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN0LnZhcmlhYmxlcy5sZW5ndGg7IGorKykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YXJpYWJsZSA9IHN0LnZhcmlhYmxlc1tqXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JhZ2Vbc3QubmFtZV1bdmFyaWFibGUubmFtZV0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJ1bnRpbWUuZXZhbHVhdGUodGhpcywgdmFyaWFibGUuYmluZGluZywgdmFyaWFibGUudmFsdWUpIHx8IG51bGxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnc3RvcmFnZScsIHN0b3JhZ2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBkZWVwOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdwYWdlLnNvdXJjZXMnLCAoc291cmNlcykgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzb3VyY2VzKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc291cmNlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5wdXNoKHRoaXMuZG9SZXF1ZXN0KHNvdXJjZXNbaV0pKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWZlcnJlZC5sZW5ndGggPiAxKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkLndoZW4uYXBwbHkodGhpcywgZGVmZXJyZWQpLmRvbmUoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW3NvdXJjZXNbaV0ubmFtZV0gPSBhcmd1bWVudHNbaV1bMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2RhdGEnLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkZWZlcnJlZC5sZW5ndGggPT0gMSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWRbMF0uZG9uZShmdW5jdGlvbihkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtzb3VyY2VzWzBdLm5hbWVdID0gZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnZGF0YScsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBkb1JlcXVlc3Q6IGZ1bmN0aW9uKHMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBxdWVyeSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzLnBhcmFtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHMucGFyYW1zW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbS5pbiA9PSAncXVlcnknICYmIHBhcmFtLnNwZWNpZmllZCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gcGFyYW0uYmluZGluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy4kaW50ZXJwb2xhdGUocGFyYW0uYmluZGluZykgLy8gVE9ETyBJbnRlcnBvbGF0ZSBpbiBwYWdlIGNvbnRleHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHBhcmFtLnZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVyeVtwYXJhbS5uYW1lXSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IHMubWV0aG9kLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybDogcy51cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHF1ZXJ5LFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXBhZ2VzJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXBhZ2VzJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBwYWdlczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIHZhciBQYWxldHRlSXRlbSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wYWxldHRlLWl0ZW0nLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcGFsZXR0ZS1pdGVtJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBjYXRlZ29yeTogT2JqZWN0LFxyXG4gICAgICAgICAgICBncm91cDogT2JqZWN0LFxyXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcGFsZXR0ZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wYWxldHRlJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3JpZXM6IHRoaXMuY2F0ZWdvcmllc1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29tcG9uZW50czoge1xyXG4gICAgICAgICAgICAncGFsZXR0ZS1pdGVtJzogUGFsZXR0ZUl0ZW1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmNhdGVnb3JpZXMgPSBXaWRnZXRzLlBhbGV0dGUuY2F0ZWdvcmllcygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYXR0YWNoZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zb3J0YWJsZSA9ICQodGhpcy4kZWwpLnNvcnRhYmxlKHtcclxuICAgICAgICAgICAgICAgIGdyb3VwOiAnd2lkZ2V0cycsXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXJTZWxlY3RvcjogJy53Zy1zb3J0YWJsZS1jb250YWluZXInLFxyXG4gICAgICAgICAgICAgICAgaXRlbVNlbGVjdG9yOiAnLndnLXNvcnRhYmxlLWl0ZW0nLFxyXG4gICAgICAgICAgICAgICAgZHJvcDogZmFsc2UsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgaXRlbSwgY29udGV4dCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIFNoZWxsLlNoZWxsID0ge1xyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nbG9iYWxzID0ge1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFnZTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RvcmFnZTogbnVsbCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5ncyxcclxuICAgICAgICAgICAgICAgIG1vZGVsOiB0aGlzLm1vZGVsLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICB9O1xyXG5cclxuICAgIFNoZWxsLlNoZWxsUHVibGljID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXB1YmxpYycsIHtcclxuICAgICAgICBtaXhpbnM6IFsgU2hlbGwuU2hlbGwgXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wdWJsaWMnLFxyXG4gICAgfSk7XHJcblxyXG4gICAgU2hlbGwuU2hlbGxQcml2YXRlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXByaXZhdGUnLCB7XHJcblxyXG4gICAgICAgIG1peGluczogWyBTaGVsbC5TaGVsbCBdLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXByaXZhdGUnLFxyXG5cclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUgPSAxO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcmVsZXZhbnQoY3VycmVudCwgY29sbGVjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghY3VycmVudCB8fCBjdXJyZW50Ll9hY3Rpb24gPT0gJ3JlbW92ZScgfHwgKGNvbGxlY3Rpb24gJiYgY29sbGVjdGlvbi5pbmRleE9mKGN1cnJlbnQpIDwgMCkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2xsZWN0aW9uLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYyA9IGNvbGxlY3Rpb25baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYy5fYWN0aW9uICE9ICdyZW1vdmUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50ICYmIGN1cnJlbnQuX2FjdGlvbiA9PSAncmVtb3ZlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLmNhdGVnb3J5ID0gVnVlLnNlcnZpY2UoJ3BhbGV0dGUnKS5jYXRlZ29yaWVzKClbMF07XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnbW9kZWwuZG9tYWlucycsIChkb21haW5zKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLmRvbWFpbiA9IHJlbGV2YW50KHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uZG9tYWluLCBkb21haW5zKTtcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdtb2RlbC5wYWdlcycsIChwYWdlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5wYWdlID0gcmVsZXZhbnQodGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5wYWdlLCBwYWdlcyk7XHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnZ2xvYmFscy5zZWxlY3Rpb24ucGFnZS5zb3VyY2VzJywgKHNvdXJjZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uc291cmNlID0gcmVsZXZhbnQodGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5zb3VyY2UsIHNvdXJjZXMpO1xyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ2dsb2JhbHMuc2VsZWN0aW9uLnBhZ2Uuc3RvcmFnZXMnLCAoc3RvcmFnZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uc3RvcmFnZSA9IHJlbGV2YW50KHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uc3RvcmFnZSwgc3RvcmFnZXMpO1xyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9LFxyXG4gICAgICAgIGV2ZW50czoge1xyXG4gICAgICAgICAgICB6b29tSW46IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2NhbGUgKz0gMC4xO1xyXG4gICAgICAgICAgICAgICAgJCgnLmdlLmdlLXBhZ2UnLCB0aGlzLiRlbCkuY3NzKCd0cmFuc2Zvcm0nLCAnc2NhbGUoJyArIHRoaXMuc2NhbGUgKyAnKScpO1xyXG4gICAgICAgICAgICAgICAgJCgnLmdlLmdlLWNvbnRhaW5lcicsIHRoaXMuJGVsKS5wZXJmZWN0U2Nyb2xsYmFyKCd1cGRhdGUnKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgem9vbU91dDogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zY2FsZSAtPSAwLjE7XHJcbiAgICAgICAgICAgICAgICAkKCcuZ2UuZ2UtcGFnZScsIHRoaXMuJGVsKS5jc3MoJ3RyYW5zZm9ybScsICdzY2FsZSgnICsgdGhpcy5zY2FsZSArICcpJyk7XHJcbiAgICAgICAgICAgICAgICAkKCcuZ2UuZ2UtY29udGFpbmVyJywgdGhpcy4kZWwpLnBlcmZlY3RTY3JvbGxiYXIoJ3VwZGF0ZScpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwdWxsOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogYC93cy9wb3J0YWxzLyR7dGhpcy5tb2RlbC5pZH1gLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmRvbmUoKGQpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnbW9kZWwnLCBkLnBvcnRhbCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwdXNoOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogYC93cy9wb3J0YWxzLyR7dGhpcy5tb2RlbC5pZH1gLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZG9uZSgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnbW9kZWwnLCBkLnBvcnRhbCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZWxlY3RDYXRlZ29yeTogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5jYXRlZ29yeSA9IGRhdGEuaXRlbTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2VsZWN0RG9tYWluOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLmRvbWFpbiA9IGRhdGEuaXRlbTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2VsZWN0UGFnZTogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5wYWdlID0gZGF0YS5pdGVtO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZWxlY3RTb3VyY2U6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uc291cmNlID0gZGF0YS5pdGVtO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZWxlY3RTdG9yYWdlOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnN0b3JhZ2UgPSBkYXRhLml0ZW07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXNvdXJjZXMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtc291cmNlcycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgc291cmNlczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXN0b3JhZ2VzJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXN0b3JhZ2VzJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBzdG9yYWdlczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXRhcmdldCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC10YXJnZXQnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcclxuXHJcbiAgICBTaGVsbC5XaWRnZXQgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtd2lkZ2V0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXdpZGdldCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIC8qIENvcmUuRGVjb3JhdG9yTWl4aW4sIENvcmUuQ29udGFpbmVyTWl4aW4sIENvcmUuU29ydGFibGVNaXhpbiwgQ29yZS5CaW5kaW5nc01peGluICovIF0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXHJcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmRlY29yYXRvcnMgPSB7XHJcbiAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAnZGVmYXVsdC1zdGFjay1ob3Jpc29udGFsJzogJ3NoZWxsLWRlY29yYXRvci1ob3Jpc29udGFsJyxcclxuICAgICAgICAgICAgICAgICAgICAnZGVmYXVsdC1zdGFjay12ZXJ0aWNhbCc6ICdzaGVsbC1kZWNvcmF0b3ItdmVydGljYWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICdkZWZhdWx0LXN0dWInOiAnc2hlbGwtZGVjb3JhdG9yLXN0dWInLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGZhbGxiYWNrOiAnc2hlbGwtZGVjb3JhdG9yLXdpZGdldCcsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBwYWxldHRlID0gVnVlLnNlcnZpY2UoJ3BhbGV0dGUnKTtcclxuICAgICAgICAgICAgdGhpcy53aWRnZXQgPSBwYWxldHRlLndpZGdldCh0aGlzLm1vZGVsLm5hbWUpO1xyXG4gICAgICAgICAgICB0aGlzLmRlY29yYXRvciA9IHRoaXMuZGVjb3JhdG9ycy5hbHRlcm5hdGl2ZXNbdGhpcy53aWRnZXQudGFnXSB8fCB0aGlzLmRlY29yYXRvcnMuZmFsbGJhY2s7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB3aWRnZXQ6IHRoaXMud2lkZ2V0LFxyXG4gICAgICAgICAgICAgICAgZGVjb3JhdG9yOiB0aGlzLmRlY29yYXRvcixcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIHZhciBTb3VyY2VzTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU291cmNlc01vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgY2hlY2s6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2NoZWNrJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU291cmNlc0VkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU291cmNlc0xpc3RWaWV3ZXIsIFNvdXJjZXNNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMnLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNvdXJjZXNQYXJhbXNMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcy1wYXJhbXMtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNvdXJjZXNQYXJhbXNNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLXBhcmFtcy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcy1wYXJhbXMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNvdXJjZXNQYXJhbXNFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1wYXJhbXMnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTb3VyY2VzUGFyYW1zTGlzdFZpZXdlciwgU291cmNlc1BhcmFtc01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcy1wYXJhbXMnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIHZhciBXaWRnZXRzTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBnZXRXaWRnZXQ6IGZ1bmN0aW9uKHcpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5nbG9iYWxzLndpZGdldHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgd2lkZ2V0ID0gdGhpcy5nbG9iYWxzLndpZGdldHNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHcudHlwZSA9PSB3aWRnZXQuaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdpZGdldDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBXaWRnZXRzTW9kYWxFZGl0b3IgPSBTaGVsbC5XaWRnZXRzLk1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdkYXRhJyldLFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETyBNb3ZlIHRvIHNlcnZpY2UgbGF5ZXJcclxuICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHRoaXMuY3VycmVudC5wYXJhbXNbcHJvcC5uYW1lXSA9IHRoaXMuY3VycmVudC5wYXJhbXNbcHJvcC5uYW1lXSB8fCB7XHJcbiAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogJ2NyZWF0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IChwcm9wLnR5cGUgPT0gJ211bHRpcGxlJyA/IFtdIDogbnVsbCksXHJcbiAgICAgICAgICAgICAgICAgICAgYmluZGluZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJhdGVneTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbjogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiAocHJvcC50eXBlID09ICdtdWx0aXBsZScgPyBudWxsIDogdW5kZWZpbmVkKSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBwYXJhbS5fYWN0aW9uID0gcGFyYW0uX2FjdGlvbiA9PSAndXBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgID8gJ3VwZGF0ZSdcclxuICAgICAgICAgICAgICAgICAgICA6ICdjcmVhdGUnXHJcbiAgICAgICAgICAgICAgICA7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogcHJvcCxcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbTogcGFyYW0sXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXRlbXMgPSBpdGVtcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dDogdGhpcy5jb250ZXh0LFxyXG4gICAgICAgICAgICAgICAgaXRlbXM6IHRoaXMuaXRlbXMsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcblxyXG4gICAgICAgICAgICBoYXNQcm9wczogZnVuY3Rpb24odGFiKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb250ZXh0LndpZGdldCAmJiB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcm9wID0gdGhpcy5jb250ZXh0LndpZGdldC5wcm9wc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3AudGFiID09IHRhYikgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFdpZGdldHNFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFdpZGdldHNMaXN0Vmlld2VyLCBXaWRnZXRzTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICB3aWRnZXQ6IE9iamVjdFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG5cclxuICAgICAgICAgICAgcHJvdG86IGZ1bmN0aW9uKHdpZGdldCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHdpZGdldC5pZCxcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW1zID0ge307XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB3aWRnZXQucHJvcHMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb3AgPSB3aWRnZXQucHJvcHNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyBNb3ZlIHRvIHNlcnZpY2UgbGF5ZXJcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbXNbcHJvcC5uYW1lXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogJ2NyZWF0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAocHJvcC50eXBlID09ICdtdWx0aXBsZScgPyBbXSA6IG51bGwpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5kaW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJhdGVneTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb246IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IChwcm9wLnR5cGUgPT0gJ211bHRpcGxlJyA/IG51bGwgOiB1bmRlZmluZWQpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZGF0YS5wYXJhbXMgPSBwYXJhbXM7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xyXG4iLCJ2YXIgV2lkZ2V0cyA9XHJcbihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuXHJcbiAgICBXaWRnZXRzID0ge307XHJcblxyXG4gICAgV2lkZ2V0cy5QYWxldHRlID0gKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB2YXIgbWFwID0ge307XHJcbiAgICAgICAgdmFyIGFyciA9IFtdO1xyXG5cclxuICAgICAgICB2YXIgd2lkZ2V0cyA9IHt9O1xyXG5cclxuICAgICAgICB2YXIgY2F0ZWdvcmllcyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJyOyB9XHJcbiAgICAgICAgdmFyIGNhdGVnb3J5ID0gZnVuY3Rpb24obiwgY2F0ZWdvcnkpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChuIGluIG1hcCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hcFtuXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5Lm5hbWUgPSBuO1xyXG4gICAgICAgICAgICAgICAgbWFwW25dID0gY2F0ZWdvcnk7XHJcbiAgICAgICAgICAgICAgICBhcnIucHVzaChjYXRlZ29yeSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHdpZGdldCA9IGZ1bmN0aW9uKHBhdGgpIHtcclxuICAgICAgICAgICAgdmFyIHNlZ21lbnRzID0gcGF0aC5zcGxpdCgnLycpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYXRlZ29yeShzZWdtZW50c1swXSkuZ3JvdXAoc2VnbWVudHNbMV0pLndpZGdldChzZWdtZW50c1syXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgaXRlbSA9IGZ1bmN0aW9uKHBhdGgpIHtcclxuICAgICAgICAgICAgdmFyIHNlZ21lbnRzID0gcGF0aC5zcGxpdCgnLycpO1xyXG4gICAgICAgICAgICByZXR1cm4gJC5leHRlbmQodHJ1ZSwge30sIHRoaXMuY2F0ZWdvcnkoc2VnbWVudHNbMF0pLmdyb3VwKHNlZ21lbnRzWzFdKS5pdGVtKHNlZ21lbnRzWzJdKS53aWRnZXQsIHtcclxuICAgICAgICAgICAgICAgIF9hY3Rpb246ICdjcmVhdGUnLFxyXG4gICAgICAgICAgICAgICAgcmVzb3VyY2U6IHtcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIF9hY3Rpb246ICdjcmVhdGUnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlSWQocHJlZml4KSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgQUxQSEFCRVQgPSAnMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVonO1xyXG4gICAgICAgICAgICB2YXIgSURfTEVOR1RIID0gODtcclxuXHJcbiAgICAgICAgICAgIHZhciBydG4gPSAnJztcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBJRF9MRU5HVEg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgcnRuICs9IEFMUEhBQkVULmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBBTFBIQUJFVC5sZW5ndGgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcHJlZml4ID8gcHJlZml4ICsgcnRuIDogcnRuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY2F0ZWdvcmllczogY2F0ZWdvcmllcyxcclxuICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5LFxyXG4gICAgICAgICAgICB3aWRnZXQ6IHdpZGdldCxcclxuICAgICAgICAgICAgaXRlbTogaXRlbSxcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IGZ1bmN0aW9uKGNvbnRlbnQpIHsgcmV0dXJuIFdpZGdldHMuU3R1YldpZGdldEZhY3RvcnkoY29udGVudCkgfSxcclxuICAgICAgICAgICAgZ2VuZXJhdGVJZDogZ2VuZXJhdGVJZCxcclxuICAgICAgICB9O1xyXG4gICAgfSkoKTtcclxuXHJcbiAgICBXaWRnZXRzLkNhdGVnb3J5ID0gZnVuY3Rpb24obmFtZSwgdGl0bGUsIGlnbm9yZSkge1xyXG5cclxuICAgICAgICB2YXIgbWFwID0ge307XHJcbiAgICAgICAgdmFyIGFyciA9IFtdO1xyXG5cclxuICAgICAgICB2YXIgZ3JvdXBzID0gZnVuY3Rpb24oKSB7IHJldHVybiBhcnI7IH1cclxuICAgICAgICB2YXIgZ3JvdXAgPSBmdW5jdGlvbihuLCBncm91cCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKG4gaW4gbWFwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWFwW25dO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZ3JvdXAubmFtZSA9IGAke25hbWV9LyR7bn1gO1xyXG4gICAgICAgICAgICAgICAgbWFwW25dID0gZ3JvdXA7XHJcbiAgICAgICAgICAgICAgICBhcnIucHVzaChncm91cCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgV2lkZ2V0cy5QYWxldHRlLmNhdGVnb3J5KG5hbWUsIHtcclxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgICAgICBncm91cHM6IGdyb3VwcyxcclxuICAgICAgICAgICAgZ3JvdXA6IGdyb3VwLFxyXG4gICAgICAgICAgICBpZ25vcmU6IGlnbm9yZSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIFdpZGdldHMuUGFsZXR0ZS5jYXRlZ29yeShuYW1lKTtcclxuICAgIH07XHJcblxyXG4gICAgV2lkZ2V0cy5Hcm91cCA9IGZ1bmN0aW9uKGNhdGVnb3J5LCBuYW1lLCB0aXRsZSkge1xyXG5cclxuICAgICAgICB2YXIgbWFwID0ge307XHJcbiAgICAgICAgdmFyIGFyciA9IFtdO1xyXG5cclxuICAgICAgICB2YXIgaXRlbXMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGFycjsgfVxyXG4gICAgICAgIHZhciBpdGVtID0gZnVuY3Rpb24obiwgaXRlbSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKG4gaW4gbWFwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWFwW25dO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5uYW1lID0gYCR7dGhpcy5uYW1lfS8ke259YDtcclxuICAgICAgICAgICAgICAgIG1hcFtuXSA9IGl0ZW07XHJcbiAgICAgICAgICAgICAgICBhcnIucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgd19tYXAgPSB7fTtcclxuICAgICAgICB2YXIgd19hcnIgPSBbXTtcclxuXHJcbiAgICAgICAgdmFyIHdpZGdldHMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHdfYXJyOyB9XHJcbiAgICAgICAgdmFyIHdpZGdldCA9IGZ1bmN0aW9uKG4sIHdpZGdldCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKG4gaW4gd19tYXApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB3X21hcFtuXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHdpZGdldC5uYW1lID0gYCR7dGhpcy5uYW1lfS8ke259YDtcclxuICAgICAgICAgICAgICAgIHdfbWFwW25dID0gd2lkZ2V0O1xyXG4gICAgICAgICAgICAgICAgd19hcnIucHVzaCh3aWRnZXQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhdGVnb3J5Lmdyb3VwKG5hbWUsIHtcclxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgICAgICBpdGVtczogaXRlbXMsXHJcbiAgICAgICAgICAgIGl0ZW06IGl0ZW0sXHJcbiAgICAgICAgICAgIHdpZGdldHM6IHdpZGdldHMsXHJcbiAgICAgICAgICAgIHdpZGdldDogd2lkZ2V0LFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gY2F0ZWdvcnkuZ3JvdXAobmFtZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIFdpZGdldHMuV2lkZ2V0ID0gZnVuY3Rpb24oZ3JvdXAsIGNvbmZpZykge1xyXG5cclxuICAgICAgICB2YXIgbmFtZSA9IGNvbmZpZy5uYW1lO1xyXG5cclxuICAgICAgICBncm91cC53aWRnZXQoY29uZmlnLm5hbWUsIGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHJldHVybiBncm91cC53aWRnZXQobmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgV2lkZ2V0cy5jbG9uZSA9IGZ1bmN0aW9uKG9yaWdpbmFsKSB7XHJcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3JpZ2luYWwpKTtcclxuICAgIH1cclxuXHJcbiAgICBXaWRnZXRzLmNyZWF0ZSA9IGZ1bmN0aW9uKGNvbmZpZykge1xyXG5cclxuICAgICAgICB2YXIgcmVzdWx0ID0ge1xyXG4gICAgICAgICAgICBuYW1lOiBjb25maWcubmFtZSxcclxuICAgICAgICAgICAgdGFnOiBjb25maWcudGFnLFxyXG4gICAgICAgICAgICB3aWRnZXRzOiBjb25maWcud2lkZ2V0cyxcclxuICAgICAgICAgICAgdGFiczogW10sXHJcbiAgICAgICAgICAgIHByb3BzOiBbXSxcclxuICAgICAgICAgICAgcGFyYW1zOiB7fSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAoJ19hY3Rpb24nIGluIGNvbmZpZykgcmVzdWx0Ll9hY3Rpb24gPSBjb25maWcuX2FjdGlvbjtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdmlzaXQodywgbSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKCdwcm9wcycgaW4gbSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtLm92ZXJyaWRlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHcudGFicyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobS50YWJzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdy5wcm9wcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobS5wcm9wcykpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtLnRhYnMpIHcudGFicyA9IHcudGFicy5jb25jYXQobS50YWJzKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobS5wcm9wcykgdy5wcm9wcyA9IHcucHJvcHMuY29uY2F0KG0ucHJvcHMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZy5taXhpbnMpIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29uZmlnLm1peGlucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG0gPSBjb25maWcubWl4aW5zW2ldO1xyXG4gICAgICAgICAgICAgICAgdmlzaXQocmVzdWx0LCBtKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmlzaXQocmVzdWx0LCBjb25maWcpO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuXHJcbiAgICBXaWRnZXRzLmJ1aWxkID0gZnVuY3Rpb24od2lkZ2V0LCBwYXJhbXMpIHtcclxuXHJcbiAgICAgICAgdmFyIHcgPSBPYmplY3QuYXNzaWduKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkod2lkZ2V0KSksIHtcclxuICAgICAgICAgICAgcGFyYW1zOiBwYXJhbXMgfHwge31cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdFBhcmFtcyhwcm9wcywgcGFyYW1zKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHByb3AgPSBwcm9wc1tpXTtcclxuICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHBhcmFtc1twcm9wLm5hbWVdID0gcGFyYW1zW3Byb3AubmFtZV0gfHwgeyB2YWx1ZTogbnVsbCB9OyAvLyBUT0RPIFNldCBhIHR5cGUtZGVwZW5kZW50IGluaXRpYWwgdmFsdWVcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocHJvcC5wcm9wcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wLnR5cGUgPT0gJ211bHRpcGxlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbS52YWx1ZSA9IHBhcmFtLnZhbHVlID09IG51bGwgPyBbXSA6IHBhcmFtLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBhcmFtLnZhbHVlLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0UGFyYW1zKHByb3AucHJvcHMsIHBhcmFtLnZhbHVlW2pdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcC50eXBlID09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtLnZhbHVlID0gcGFyYW0udmFsdWUgPT0gbnVsbCA/IHt9IDogcGFyYW0udmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRQYXJhbXMocHJvcC5wcm9wcywgcGFyYW0udmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaW5pdFBhcmFtcyh3LnByb3BzLCB3LnBhcmFtcyk7XHJcblxyXG4gICAgICAgIHJldHVybiB3O1xyXG4gICAgfVxyXG5cclxuICAgIFdpZGdldHMuSXRlbSA9IGZ1bmN0aW9uKGdyb3VwLCBjb25maWcpIHtcclxuXHJcbiAgICAgICAgdmFyIG5hbWUgPSBjb25maWcubmFtZTtcclxuXHJcbiAgICAgICAgZ3JvdXAuaXRlbShjb25maWcubmFtZSwgY29uZmlnKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdyb3VwLml0ZW0obmFtZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIFdpZGdldHMuUHJvcCA9IGZ1bmN0aW9uKG5hbWUsIHRpdGxlLCB0eXBlLCB0YWIsIHBsYWNlaG9sZGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbmFtZTogbmFtZSxcclxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgICAgICB0YWI6IHRhYixcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IHBsYWNlaG9sZGVyLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgV2lkZ2V0cy5QYXJhbSA9IGZ1bmN0aW9uKHZhbHVlLCBiaW5kaW5nLCBzdHJhdGVneSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSB8fCB1bmRlZmluZWQsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIFZ1ZS5zZXJ2aWNlKCdwYWxldHRlJywgV2lkZ2V0cy5QYWxldHRlKTtcclxuXHJcbiAgICByZXR1cm4gV2lkZ2V0cztcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xyXG5cclxuICAgIFdpZGdldHMuQ29tcG9zaXRlQ2F0ZWdvcnkgPSBXaWRnZXRzLkNhdGVnb3J5KCdkZWZhdWx0LWNvbXBvc2l0ZXMnLCAnQ29tcG9zaXRlIEVsZW1lbnRzJyk7XHJcbiAgICBXaWRnZXRzLkZvcm1DYXRlZ29yeSA9IFdpZGdldHMuQ2F0ZWdvcnkoJ2RlZmF1bHQtZm9ybScsICdGb3JtIEVsZW1lbnRzJyk7XHJcbiAgICBXaWRnZXRzLlRleHRDYXRlZ29yeSA9IFdpZGdldHMuQ2F0ZWdvcnkoJ2RlZmF1bHQtdGV4dCcsICdUZXh0IEVsZW1lbnRzJyk7XHJcbiAgICBXaWRnZXRzLkNvbnRhaW5lckNhdGVnb3J5ID0gV2lkZ2V0cy5DYXRlZ29yeSgnZGVmYXVsdC1jb250YWluZXInLCAnQ29udGFpbmVyIEVsZW1lbnRzJyk7XHJcblxyXG4gICAgV2lkZ2V0cy5VdGlsQ2F0ZWdvcnkgPSBXaWRnZXRzLkNhdGVnb3J5KCdkZWZhdWx0LXV0aWwnLCAnVXRpbCBFbGVtZW50cycsIHRydWUpO1xyXG5cclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xyXG5cclxuICAgIFdpZGdldHMuV2lkZ2V0TWl4aW4gPSB7XHJcbiAgICAgICAgdGFiczogW1xyXG4gICAgICAgICAgICB7IG5hbWU6ICdkYXRhJywgdGl0bGU6ICdEYXRhJyB9LFxyXG4gICAgICAgICAgICB7IG5hbWU6ICdhcHBlYXJhbmNlJywgdGl0bGU6ICdBcHBlYXJhbmNlJyB9LFxyXG4gICAgICAgICAgICB7IG5hbWU6ICdjb250ZW50JywgdGl0bGU6ICdDb250ZW50JyB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgcHJvcHM6IFtcclxuICAgICAgICAgICAgeyBuYW1lOiAnaWQnLCB0aXRsZTogJ0lEJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnLCBwbGFjZWhvbGRlcjogJ1VuaXF1ZSBJRCcgfSxcclxuICAgICAgICBdLFxyXG4gICAgfTtcclxuXHJcbiAgICBXaWRnZXRzLkJveE1peGluID0ge1xyXG4gICAgICAgIHByb3BzOiBbXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ21hcmdpbicsIHRpdGxlOiAnTWFyZ2luJywgdHlwZTogJ3N0cmluZycsIHBsYWNlaG9sZGVyOiAnMHB4IDBweCcsIHRhYjogJ2FwcGVhcmFuY2UnIH0sXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ3BhZGRpbmcnLCB0aXRsZTogJ1BhZGRpbmcnLCB0eXBlOiAnc3RyaW5nJywgcGxhY2Vob2xkZXI6ICcwcHggMHB4JywgdGFiOiAnYXBwZWFyYW5jZScgfSxcclxuICAgICAgICAgICAgeyBuYW1lOiAnaW5uZXJCb3JkZXInLCB0aXRsZTogJ0lubmVyIEJvcmRlcicsIHR5cGU6ICdzdHJpbmcnLCBwbGFjZWhvbGRlcjogJ3NvbGlkIDFweCAjMDAwMDAwJywgdGFiOiAnYXBwZWFyYW5jZScgfSxcclxuICAgICAgICAgICAgeyBuYW1lOiAnaW5uZXJCYWNrZ3JvdW5kJywgdGl0bGU6ICdJbm5lciBCYWNrZ3JvdW5kJywgdHlwZTogJ3N0cmluZycsIHBsYWNlaG9sZGVyOiAnI0ZGRkZGRicsIHRhYjogJ2FwcGVhcmFuY2UnIH0sXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ2lubmVyQmFja2dyb3VuZFNpemUnLCB0aXRsZTogJ0lubmVyIEJhY2tncm91bmQgU2l6ZScsIHR5cGU6ICdzdHJpbmcnLCBwbGFjZWhvbGRlcjogJ2NvdmVyJywgdGFiOiAnYXBwZWFyYW5jZScgfSxcclxuICAgICAgICAgICAgeyBuYW1lOiAnb3V0ZXJCb3JkZXInLCB0aXRsZTogJ091dGVyIEJvcmRlcicsIHR5cGU6ICdzdHJpbmcnLCBwbGFjZWhvbGRlcjogJ3NvbGlkIDFweCAjMDAwMDAwJywgdGFiOiAnYXBwZWFyYW5jZScgfSxcclxuICAgICAgICAgICAgeyBuYW1lOiAnb3V0ZXJCYWNrZ3JvdW5kJywgdGl0bGU6ICdPdXRlciBCYWNrZ3JvdW5kJywgdHlwZTogJ3N0cmluZycsIHBsYWNlaG9sZGVyOiAnI0ZGRkZGRicsIHRhYjogJ2FwcGVhcmFuY2UnIH0sXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ291dGVyQmFja2dyb3VuZFNpemUnLCB0aXRsZTogJ091dGVyIEJhY2tncm91bmQgU2l6ZScsIHR5cGU6ICdzdHJpbmcnLCBwbGFjZWhvbGRlcjogJ2NvdmVyJywgdGFiOiAnYXBwZWFyYW5jZScgfSxcclxuICAgICAgICBdLFxyXG4gICAgfTtcclxuXHJcbiAgICBXaWRnZXRzLlNpemVNaXhpbiA9IHtcclxuICAgICAgICBwcm9wczogW1xyXG4gICAgICAgICAgICB7IG5hbWU6ICd3aWR0aCcsIHRpdGxlOiAnV2lkdGgnLCB0eXBlOiAnc3RyaW5nJywgcGxhY2Vob2xkZXI6ICcxMDBweCcsIHRhYjogJ2FwcGVhcmFuY2UnIH0sXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ2hlaWdodCcsIHRpdGxlOiAnSGVpZ2h0JywgdHlwZTogJ3N0cmluZycsIHBsYWNlaG9sZGVyOiAnMTAwcHgnLCB0YWI6ICdhcHBlYXJhbmNlJyB9LFxyXG4gICAgICAgIF1cclxuICAgIH1cclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xyXG5cclxuICAgIFdpZGdldHMuR2FsbGVyeUdyb3VwID0gV2lkZ2V0cy5Hcm91cChXaWRnZXRzLkNvbXBvc2l0ZUNhdGVnb3J5LCAnZGVmYXVsdC1jb21wb3NpdGUtZ2FsbGVyeScsICdHYWxsZXJpZXMnKTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xyXG5cclxuICAgIFdpZGdldHMuU3RhY2tHcm91cCA9IFdpZGdldHMuR3JvdXAoV2lkZ2V0cy5Db250YWluZXJDYXRlZ29yeSwgJ2RlZmF1bHQtY29udGFpbmVyLXN0YWNrJywgJ1N0YWNrZWQnKTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xyXG5cclxuICAgIFdpZGdldHMuQnV0dG9uc0dyb3VwID0gV2lkZ2V0cy5Hcm91cChXaWRnZXRzLkZvcm1DYXRlZ29yeSwgJ2RlZmF1bHQtZm9ybS1idXR0b25zJywgJ0J1dHRvbnMnKTtcclxuICAgIFdpZGdldHMuSW5wdXRzR3JvdXAgPSBXaWRnZXRzLkdyb3VwKFdpZGdldHMuRm9ybUNhdGVnb3J5LCAnZGVmYXVsdC1mb3JtLWlucHV0cycsICdJbnB1dHMnKTtcclxuICAgIFdpZGdldHMuUmFkaW9zR3JvdXAgPSBXaWRnZXRzLkdyb3VwKFdpZGdldHMuRm9ybUNhdGVnb3J5LCAnZGVmYXVsdC1mb3JtLXJhZGlvcycsICdSYWRpb3MnKTtcclxuICAgIFdpZGdldHMuQ2hlY2tzR3JvdXAgPSBXaWRnZXRzLkdyb3VwKFdpZGdldHMuRm9ybUNhdGVnb3J5LCAnZGVmYXVsdC1mb3JtLWNoZWNrcycsICdDaGVja2JveGVzJyk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcclxuXHJcbiAgICBXaWRnZXRzLkhlYWRpbmdzR3JvdXAgPSBXaWRnZXRzLkdyb3VwKFdpZGdldHMuVGV4dENhdGVnb3J5LCAnZGVmYXVsdC10ZXh0LWhlYWRpbmdzJywgJ0hlYWRpbmdzJyk7XHJcbiAgICBXaWRnZXRzLkJsb2Nrc0dyb3VwID0gV2lkZ2V0cy5Hcm91cChXaWRnZXRzLlRleHRDYXRlZ29yeSwgJ2RlZmF1bHQtdGV4dC1ibG9ja3MnLCAnQmxvY2tzJyk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcclxuXHJcbiAgICBXaWRnZXRzLlV0aWxHcm91cCA9IFdpZGdldHMuR3JvdXAoV2lkZ2V0cy5VdGlsQ2F0ZWdvcnksICdkZWZhdWx0LXV0aWwtZ3JvdXAnLCAnVXRpbCBFbGVtZW50cycpO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFdpZGdldHMpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1nYWxsZXJ5Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtZ2FsbGVyeScsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcclxuXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBtYXRyaXg6IHRoaXMubWF0cml4LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnYmluZGluZ3MnLCB1cGRhdGVNYXRyaXguYmluZCh0aGlzKSwgeyBpbW1lZGlhdGU6IHRydWUsIGRlZXA6IHRydWUgfSk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiB1cGRhdGVNYXRyaXgoYmluZGluZ3MpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlbXMgPSBiaW5kaW5ncy5pdGVtcy5jb2xsZWN0aW9uIHx8IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciByb3dzID0gcGFyc2VJbnQoYmluZGluZ3Mucm93cyk7XHJcbiAgICAgICAgICAgICAgICByb3dzID0gcm93cyA+IDAgPyByb3dzIDogMTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgY29scyA9IHBhcnNlSW50KGJpbmRpbmdzLmNvbHMpO1xyXG4gICAgICAgICAgICAgICAgY29scyA9IGNvbHMgPiAwID8gY29scyA6IDM7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGNlbGxzID0gcm93cyAqIGNvbHM7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGRpdiA9IHBhcnNlSW50KGl0ZW1zLmxlbmd0aCAvIGNlbGxzKTtcclxuICAgICAgICAgICAgICAgIHZhciBtb2QgPSBpdGVtcy5sZW5ndGggJSBjZWxscztcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgY291bnQgPSAobW9kID4gMCB8fCBkaXYgPT0gMClcclxuICAgICAgICAgICAgICAgICAgICA/IGRpdiArIDFcclxuICAgICAgICAgICAgICAgICAgICA6IGRpdlxyXG4gICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBtYXRyaXggPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IGNvdW50OyBwKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBkID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCByb3dzOyByKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJkID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGMgPSAwOyBjIDwgY29sczsgYysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAocCAqIHJvd3MgKyByKSAqIGNvbHMgKyBjO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4IDwgaXRlbXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmQucHVzaChpdGVtc1tpbmRleF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBkLnB1c2gocmQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBtYXRyaXgucHVzaChwZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRyaXggPSBtYXRyaXg7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcclxuXHJcbiAgICBXaWRnZXRzLkdhbGxlcnlXaWRnZXQgPVxyXG4gICAgV2lkZ2V0cy5XaWRnZXQoV2lkZ2V0cy5HYWxsZXJ5R3JvdXAsIFdpZGdldHMuY3JlYXRlKHtcclxuICAgICAgICBuYW1lOiAnZGVmYXVsdC1nYWxsZXJ5JyxcclxuICAgICAgICB0YWc6ICdkZWZhdWx0LWdhbGxlcnknLFxyXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluLCBXaWRnZXRzLlNpemVNaXhpbiBdLFxyXG4gICAgICAgIHByb3BzOiBbXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ2NvbHMnLCB0aXRsZTogJ0NvbHVtbnMnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnYXBwZWFyYW5jZScgfSxcclxuICAgICAgICAgICAgeyBuYW1lOiAncm93cycsIHRpdGxlOiAnUm93cycsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdhcHBlYXJhbmNlJyB9LFxyXG4gICAgICAgICAgICB7IG5hbWU6ICdib3JkZXInLCB0aXRsZTogJ0JvcmRlcicsIHR5cGU6ICdvYmplY3QnLCB0YWI6ICdhcHBlYXJhbmNlJyxcclxuICAgICAgICAgICAgICAgIHRhYnM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdhcHBlYXJhbmNlJywgdGl0bGU6ICdBcHBlYXJhbmNlJyB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIHByb3BzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnc3BhY2luZycsIHRpdGxlOiAnQm9yZGVyIFNwYWNpbmcnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnYXBwZWFyYW5jZScgfSxcclxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdjb2xsYXBzZScsIHRpdGxlOiAnQm9yZGVyIENvbGxhcHNlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2FwcGVhcmFuY2UnIH0sXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdpdGVtcycsIHRpdGxlOiAnSXRlbXMnLCB0eXBlOiAnb2JqZWN0JywgdGFiOiAnZGF0YScsXHJcbiAgICAgICAgICAgICAgICB0YWJzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnZGF0YScsIHRpdGxlOiAnRGF0YScgfSxcclxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdhcHBlYXJhbmNlJywgdGl0bGU6ICdBcHBlYXJhbmNlJyB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIHByb3BzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnY29sbGVjdGlvbicsIHRpdGxlOiAnQ29sbGVjdGlvbicsIHR5cGU6ICdtdWx0aXBsZScsIHRhYjogJ2RhdGEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWJzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdhcHBlYXJhbmNlJywgdGl0bGU6ICdBcHBlYXJhbmNlJyB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnY29udGVudCcsIHRpdGxlOiAnQ29udGVudCcgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ3dpZHRoJywgdGl0bGU6ICdXaWR0aCcsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdhcHBlYXJhbmNlJyB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnaGVpZ2h0JywgdGl0bGU6ICdIZWlnaHQnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnYXBwZWFyYW5jZScgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2JhY2tncm91bmQnLCB0aXRsZTogJ0JhY2tncm91bmQnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnYXBwZWFyYW5jZScgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2NvbnRlbnQnLCB0aXRsZTogJ0NvbnRlbnQnLCB0eXBlOiAncmljaCcsIHRhYjogJ2NvbnRlbnQnIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ3N0eWxlJywgdGl0bGU6ICdTdHlsZScsIHR5cGU6ICdvYmplY3QnLCB0YWI6ICdhcHBlYXJhbmNlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFiczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnYXBwZWFyYW5jZScsIHRpdGxlOiAnQXBwZWFyYW5jZScgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ3dpZHRoJywgdGl0bGU6ICdXaWR0aCcsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdhcHBlYXJhbmNlJyB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnaGVpZ2h0JywgdGl0bGU6ICdIZWlnaHQnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnYXBwZWFyYW5jZScgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2JhY2tncm91bmQnLCB0aXRsZTogJ0JhY2tncm91bmQnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnYXBwZWFyYW5jZScgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgIH0pKTtcclxuXHJcbiAgICBXaWRnZXRzLkdhbGxlcnlXaWRnZXRGYWN0b3J5ID0gZnVuY3Rpb24ocm93cywgY29scywgY29sbGVjdGlvbikge1xyXG5cclxuICAgICAgICB2YXIgdyA9IFdpZGdldHMuYnVpbGQoV2lkZ2V0cy5HYWxsZXJ5V2lkZ2V0LCB7XHJcbiAgICAgICAgICAgIHJvd3M6IHsgdmFsdWU6IHJvd3MgfSxcclxuICAgICAgICAgICAgY29sczogeyB2YWx1ZTogY29scyB9LFxyXG4gICAgICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogeyB2YWx1ZTogJ3JlZCcgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiB7IHZhbHVlOiAnMzAwcHgnIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHsgdmFsdWU6ICcxMDBweCcgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjb250ZW50OiB7IHZhbHVlOiAnPGgzPkZpcnN0IEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JyB9IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNvbnRlbnQ6IHsgdmFsdWU6ICc8aDM+U2Vjb25kIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JyB9IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGNvbnRlbnQ6IHsgdmFsdWU6ICc8aDM+VGhpcmQgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nIH0gfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY29udGVudDogeyB2YWx1ZTogJzxoMz5Gb3VydGggSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nIH0gfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgY29udGVudDogeyB2YWx1ZTogJzxoMz5GaWZ0aCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicgfSB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjb250ZW50OiB7IHZhbHVlOiAnPGgzPlNpeHRoIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JyB9IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHcpO1xyXG5cclxuICAgICAgICByZXR1cm4gdztcclxuICAgIH1cclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5HYWxsZXJ5R3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnZ2FsbGVyeS1yMWMxZicsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2NvbXBvc2l0ZXMvZ2FsbGVyeS9nYWxsZXJ5LXIxYzFmLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkdhbGxlcnlXaWRnZXRGYWN0b3J5KDEsIDEsIFtcclxuICAgICAgICAgICAgeyBjb250ZW50OiAnPGgzPkZpcnN0IEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JyB9LFxyXG4gICAgICAgICAgICB7IGNvbnRlbnQ6ICc8aDM+U2Vjb25kIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JyB9LFxyXG4gICAgICAgICAgICB7IGNvbnRlbnQ6ICc8aDM+VGhpcmQgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nIH0sXHJcbiAgICAgICAgXSksXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5HYWxsZXJ5R3JvdXAsIHtcclxuICAgIC8vICAgICBuYW1lOiAnZ2FsbGVyeS1yMWMxcicsXHJcbiAgICAvLyAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2NvbXBvc2l0ZXMvZ2FsbGVyeS9nYWxsZXJ5LXIxYzFyLnBuZycsXHJcbiAgICAvLyAgICAgd2lkZ2V0OiBXaWRnZXRzLkdhbGxlcnlXaWRnZXRGYWN0b3J5KDEsIDEsIFtcclxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZpcnN0IEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNGRjM1MDAnIH0sXHJcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5TZWNvbmQgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0RDMDA1NScgfSxcclxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPlRoaXJkIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNCRjAwMzcnIH0sXHJcbiAgICAvLyAgICAgXSksXHJcbiAgICAvLyB9KTtcclxuICAgIC8vXHJcbiAgICAvLyBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5HYWxsZXJ5R3JvdXAsIHtcclxuICAgIC8vICAgICBuYW1lOiAnZ2FsbGVyeS1yMWMzZicsXHJcbiAgICAvLyAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2NvbXBvc2l0ZXMvZ2FsbGVyeS9nYWxsZXJ5LXIxYzNmLnBuZycsXHJcbiAgICAvLyAgICAgd2lkZ2V0OiBXaWRnZXRzLkdhbGxlcnlXaWRnZXRGYWN0b3J5KDEsIDMsIFtcclxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZpcnN0IEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNGRjM1MDAnIH0sXHJcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5TZWNvbmQgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0RDMDA1NScgfSxcclxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPlRoaXJkIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNCRjAwMzcnIH0sXHJcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5Gb3VydGggSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0E1MjkzOScgfSxcclxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZpZnRoIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNFRTNCODAnIH0sXHJcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5TaXh0aCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjRUU2QjlFJyB9LFxyXG4gICAgLy8gICAgIF0pLFxyXG4gICAgLy8gfSk7XHJcbiAgICAvL1xyXG4gICAgLy8gV2lkZ2V0cy5JdGVtKFdpZGdldHMuR2FsbGVyeUdyb3VwLCB7XHJcbiAgICAvLyAgICAgbmFtZTogJ2dhbGxlcnktcjFjM2InLFxyXG4gICAgLy8gICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9jb21wb3NpdGVzL2dhbGxlcnkvZ2FsbGVyeS1yMWMzYi5wbmcnLFxyXG4gICAgLy8gICAgIHdpZGdldDogV2lkZ2V0cy5HYWxsZXJ5V2lkZ2V0RmFjdG9yeSgxLCAzLCBbXHJcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5GaXJzdCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjRkYzNTAwJyB9LFxyXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+U2Vjb25kIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNEQzAwNTUnIH0sXHJcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5UaGlyZCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjQkYwMDM3JyB9LFxyXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+Rm91cnRoIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNBNTI5MzknIH0sXHJcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5GaWZ0aCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjRUUzQjgwJyB9LFxyXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+U2l4dGggSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0VFNkI5RScgfSxcclxuICAgIC8vICAgICBdKSxcclxuICAgIC8vIH0pO1xyXG4gICAgLy9cclxuICAgIC8vIFdpZGdldHMuSXRlbShXaWRnZXRzLkdhbGxlcnlHcm91cCwge1xyXG4gICAgLy8gICAgIG5hbWU6ICdnYWxsZXJ5LXIyYzRmJyxcclxuICAgIC8vICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvY29tcG9zaXRlcy9nYWxsZXJ5L2dhbGxlcnktcjJjNGYucG5nJyxcclxuICAgIC8vICAgICB3aWRnZXQ6IFdpZGdldHMuR2FsbGVyeVdpZGdldEZhY3RvcnkoMiwgNCwgW1xyXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+Rmlyc3QgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0ZGMzUwMCcgfSxcclxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPlNlY29uZCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjREMwMDU1JyB9LFxyXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+VGhpcmQgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0JGMDAzNycgfSxcclxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZvdXJ0aCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjQTUyOTM5JyB9LFxyXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+RmlmdGggSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0VFM0I4MCcgfSxcclxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPlNpeHRoIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNFRTZCOUUnIH0sXHJcbiAgICAvLyAgICAgXSksXHJcbiAgICAvLyB9KTtcclxuICAgIC8vXHJcbiAgICAvLyBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5HYWxsZXJ5R3JvdXAsIHtcclxuICAgIC8vICAgICBuYW1lOiAnZ2FsbGVyeS1yMmM0YicsXHJcbiAgICAvLyAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2NvbXBvc2l0ZXMvZ2FsbGVyeS9nYWxsZXJ5LXIyYzRiLnBuZycsXHJcbiAgICAvLyAgICAgd2lkZ2V0OiBXaWRnZXRzLkdhbGxlcnlXaWRnZXRGYWN0b3J5KDIsIDQsIFtcclxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZpcnN0IEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNGRjM1MDAnIH0sXHJcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5TZWNvbmQgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0RDMDA1NScgfSxcclxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPlRoaXJkIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNCRjAwMzcnIH0sXHJcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5Gb3VydGggSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0E1MjkzOScgfSxcclxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZpZnRoIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNFRTNCODAnIH0sXHJcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5TaXh0aCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjRUU2QjlFJyB9LFxyXG4gICAgLy8gICAgIF0pLFxyXG4gICAgLy8gfSk7XHJcbiAgICAvL1xyXG4gICAgLy8gV2lkZ2V0cy5JdGVtKFdpZGdldHMuR2FsbGVyeUdyb3VwLCB7XHJcbiAgICAvLyAgICAgbmFtZTogJ2dhbGxlcnktcjJjM2YnLFxyXG4gICAgLy8gICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9jb21wb3NpdGVzL2dhbGxlcnkvZ2FsbGVyeS1yMmMzZi5wbmcnLFxyXG4gICAgLy8gICAgIHdpZGdldDogV2lkZ2V0cy5HYWxsZXJ5V2lkZ2V0RmFjdG9yeSgyLCAzLCBbXHJcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5GaXJzdCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjRkYzNTAwJyB9LFxyXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+U2Vjb25kIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNEQzAwNTUnIH0sXHJcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5UaGlyZCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjQkYwMDM3JyB9LFxyXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+Rm91cnRoIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNBNTI5MzknIH0sXHJcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5GaWZ0aCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjRUUzQjgwJyB9LFxyXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+U2l4dGggSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0VFNkI5RScgfSxcclxuICAgIC8vICAgICBdKSxcclxuICAgIC8vIH0pO1xyXG4gICAgLy9cclxuICAgIC8vIFdpZGdldHMuSXRlbShXaWRnZXRzLkdhbGxlcnlHcm91cCwge1xyXG4gICAgLy8gICAgIG5hbWU6ICdnYWxsZXJ5LXIzYzJyJyxcclxuICAgIC8vICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvY29tcG9zaXRlcy9nYWxsZXJ5L2dhbGxlcnktcjNjMnIucG5nJyxcclxuICAgIC8vICAgICB3aWRnZXQ6IFdpZGdldHMuR2FsbGVyeVdpZGdldEZhY3RvcnkoMywgMiwgW1xyXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+Rmlyc3QgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0ZGMzUwMCcgfSxcclxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPlNlY29uZCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjREMwMDU1JyB9LFxyXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+VGhpcmQgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0JGMDAzNycgfSxcclxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZvdXJ0aCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjQTUyOTM5JyB9LFxyXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+RmlmdGggSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0VFM0I4MCcgfSxcclxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPlNpeHRoIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNFRTZCOUUnIH0sXHJcbiAgICAvLyAgICAgXSksXHJcbiAgICAvLyB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtY2Fyb3VzZWwnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1jYXJvdXNlbCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XHJcblxyXG4gICAgV2lkZ2V0cy5TdGFja0hvcmlzb250YWxXaWRnZXQgPVxyXG4gICAgV2lkZ2V0cy5XaWRnZXQoV2lkZ2V0cy5TdGFja0dyb3VwLCBXaWRnZXRzLmNyZWF0ZSh7XHJcbiAgICAgICAgbmFtZTogJ2RlZmF1bHQtc3RhY2staG9yaXNvbnRhbCcsXHJcbiAgICAgICAgdGFnOiAnZGVmYXVsdC1zdGFjay1ob3Jpc29udGFsJyxcclxuICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiBdLFxyXG4gICAgICAgIHdpZGdldHM6IFtdLFxyXG4gICAgfSkpO1xyXG5cclxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLlN0YWNrR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnc3RhY2staG9yaXNvbnRhbCcsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2NvbnRhaW5lci9zdGFjay9zdGFjay1ob3Jpc29udGFsLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLmJ1aWxkKFdpZGdldHMuU3RhY2tIb3Jpc29udGFsV2lkZ2V0KSxcclxuICAgIH0pO1xyXG5cclxuICAgIFdpZGdldHMuU3RhY2tWZXJ0aWNhbFdpZGdldCA9XHJcbiAgICBXaWRnZXRzLldpZGdldChXaWRnZXRzLlN0YWNrR3JvdXAsIFdpZGdldHMuY3JlYXRlKHtcclxuICAgICAgICBuYW1lOiAnZGVmYXVsdC1zdGFjay12ZXJ0aWNhbCcsXHJcbiAgICAgICAgdGFnOiAnZGVmYXVsdC1zdGFjay12ZXJ0aWNhbCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIFdpZGdldHMuV2lkZ2V0TWl4aW4sIFdpZGdldHMuQm94TWl4aW4gXSxcclxuICAgICAgICB3aWRnZXRzOiBbXSxcclxuICAgIH0pKTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5TdGFja0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ3N0YWNrLXZlcnRpY2FsJyxcclxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvY29udGFpbmVyL3N0YWNrL3N0YWNrLXZlcnRpY2FsLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLmJ1aWxkKFdpZGdldHMuU3RhY2tWZXJ0aWNhbFdpZGdldCwge30pLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XHJcbiIsIlNoZWxsID0gd2luZG93LlNoZWxsIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3RhY2stY2FudmFzJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtc3RhY2stY2FudmFzJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5TdGFja2VkTWl4aW4gXSxcclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3RhY2staG9yaXNvbnRhbCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXN0YWNrLWhvcmlzb250YWwnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluLCBDb3JlLlN0YWNrZWRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1zdGFjay12ZXJ0aWNhbCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiwgQ29yZS5TdGFja2VkTWl4aW4gXSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtYnV0dG9uJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtYnV0dG9uJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcclxuXHJcbiAgICBXaWRnZXRzLkJ1dHRvbldpZGdldCA9XHJcbiAgICBXaWRnZXRzLldpZGdldChXaWRnZXRzLkJ1dHRvbnNHcm91cCwgV2lkZ2V0cy5jcmVhdGUoe1xyXG4gICAgICAgIG5hbWU6ICdkZWZhdWx0LWJ1dHRvbicsXHJcbiAgICAgICAgdGFnOiAnZGVmYXVsdC1idXR0b24nLFxyXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluLCBXaWRnZXRzLlNpemVNaXhpbiBdLFxyXG4gICAgICAgIHByb3BzOiBbXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ3RpdGxlJywgdGl0bGU6ICdUaXRsZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdjb250ZW50JyB9LFxyXG4gICAgICAgICAgICB7IG5hbWU6ICd0eXBlJywgdGl0bGU6ICdUeXBlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ3N0ZXJlb3R5cGUnLCB0aXRsZTogJ1N0ZXJlb3R5cGUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICBdLFxyXG4gICAgfSkpO1xyXG5cclxuICAgIFdpZGdldHMuQnV0dG9uV2lkZ2V0RmFjdG9yeSA9IGZ1bmN0aW9uKHRpdGxlLCBzdGVyZW90eXBlKSB7XHJcblxyXG4gICAgICAgIHZhciB3ID0gV2lkZ2V0cy5idWlsZChXaWRnZXRzLkJ1dHRvbldpZGdldCwge1xyXG4gICAgICAgICAgICBtYXJnaW46IHsgdmFsdWU6ICcxNXB4IDE1cHgnIH0sXHJcbiAgICAgICAgICAgIHR5cGU6IHsgdmFsdWU6ICdidXR0b24nIH0sXHJcbiAgICAgICAgICAgIHRpdGxlOiB7IHZhbHVlOiB0aXRsZSB9LFxyXG4gICAgICAgICAgICBzdGVyZW90eXBlOiB7IHZhbHVlOiBzdGVyZW90eXBlIH0sXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKHcpO1xyXG5cclxuICAgICAgICByZXR1cm4gdztcclxuICAgIH1cclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CdXR0b25zR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnYnV0dG9uLWRlZmF1bHQnLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2J1dHRvbi9idXR0b24tZGVmYXVsdC5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5CdXR0b25XaWRnZXRGYWN0b3J5KCdEZWZhdWx0JywgJ2RlZmF1bHQnKSxcclxuICAgIH0pO1xyXG5cclxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJ1dHRvbnNHcm91cCwge1xyXG4gICAgICAgIG5hbWU6ICdidXR0b24tcHJpbWFyeScsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vYnV0dG9uL2J1dHRvbi1wcmltYXJ5LnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkJ1dHRvbldpZGdldEZhY3RvcnkoJ1ByaW1hcnknLCAncHJpbWFyeScpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQnV0dG9uc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ2J1dHRvbi1zdWNjZXNzJyxcclxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9idXR0b24vYnV0dG9uLXN1Y2Nlc3MucG5nJyxcclxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuQnV0dG9uV2lkZ2V0RmFjdG9yeSgnU3VjY2VzcycsICdzdWNjZXNzJyksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CdXR0b25zR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnYnV0dG9uLWluZm8nLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2J1dHRvbi9idXR0b24taW5mby5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5CdXR0b25XaWRnZXRGYWN0b3J5KCdJbmZvJywgJ2luZm8nKSxcclxuICAgIH0pO1xyXG5cclxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJ1dHRvbnNHcm91cCwge1xyXG4gICAgICAgIG5hbWU6ICdidXR0b24td2FybmluZycsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vYnV0dG9uL2J1dHRvbi13YXJuaW5nLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkJ1dHRvbldpZGdldEZhY3RvcnkoJ1dhcm5pbmcnLCAnd2FybmluZycpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQnV0dG9uc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ2J1dHRvbi1kYW5nZXInLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2J1dHRvbi9idXR0b24tZGFuZ2VyLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkJ1dHRvbldpZGdldEZhY3RvcnkoJ0RhbmdlcicsICdkYW5nZXInKSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFdpZGdldHMpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1pbnB1dC10ZXh0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtaW5wdXQtdGV4dCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ21vZGVsJywgdGhpcy5iaW5kaW5ncyk7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdzdG9yYWdlJywgdGhpcy5zdG9yYWdlLm9uZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1pbnB1dC10ZXh0YXJlYScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWlucHV0LXRleHRhcmVhJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1pbnB1dC1jaGVja2JveCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWlucHV0LWNoZWNrYm94JyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1pbnB1dC1yYWRpbycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWlucHV0LXJhZGlvJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcclxuXHJcbiAgICBXaWRnZXRzLklucHV0V2lkZ2V0ID1cclxuICAgIFdpZGdldHMuV2lkZ2V0KFdpZGdldHMuSW5wdXRzR3JvdXAsIFdpZGdldHMuY3JlYXRlKHtcclxuICAgICAgICBuYW1lOiAnZGVmYXVsdC1pbnB1dC10ZXh0JyxcclxuICAgICAgICB0YWc6ICdkZWZhdWx0LWlucHV0LXRleHQnLFxyXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluLCBXaWRnZXRzLlNpemVNaXhpbiBdLFxyXG4gICAgICAgIHByb3BzOiBbXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ21vZGVsJywgdGl0bGU6ICdNb2RlbCcsIHR5cGU6ICd2YXInLCB0YWI6ICdkYXRhJywgdmFyaWFibGU6IHRydWUgfSxcclxuICAgICAgICAgICAgeyBuYW1lOiAndHlwZScsIHRpdGxlOiAnVHlwZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdjb250ZW50JyB9LFxyXG4gICAgICAgICAgICB7IG5hbWU6ICdsYWJlbCcsIHRpdGxlOiAnTGFiZWwnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnY29udGVudCcgfSxcclxuICAgICAgICAgICAgeyBuYW1lOiAncGxhY2Vob2xkZXInLCB0aXRsZTogJ1BsYWNlaG9sZGVyJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2NvbnRlbnQnIH0sXHJcbiAgICAgICAgXSxcclxuICAgIH0pKTtcclxuXHJcbiAgICBXaWRnZXRzLklucHV0V2lkZ2V0RmFjdG9yeSA9IGZ1bmN0aW9uKGxhYmVsLCB0eXBlKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBXaWRnZXRzLmJ1aWxkKFdpZGdldHMuSW5wdXRXaWRnZXQsIHtcclxuICAgICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7IHZhbHVlOiAnJyB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1hcmdpbjogeyB2YWx1ZTogJzE1cHggMTVweCcgfSxcclxuICAgICAgICAgICAgbGFiZWw6IHsgdmFsdWU6IGxhYmVsIH0sXHJcbiAgICAgICAgICAgIHR5cGU6IHsgdmFsdWU6IHR5cGUgfSxcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuSW5wdXRzR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnaW5wdXQtdGV4dCcsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vaW5wdXQvdGV4dC5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5JbnB1dFdpZGdldEZhY3RvcnkoJ0lucHV0JywgJ3RleHQnKSxcclxuICAgIH0pO1xyXG5cclxuICAgIFdpZGdldHMuVGV4dGFyZWFXaWRnZXQgPVxyXG4gICAgV2lkZ2V0cy5XaWRnZXQoV2lkZ2V0cy5JbnB1dHNHcm91cCwgV2lkZ2V0cy5jcmVhdGUoe1xyXG4gICAgICAgIG5hbWU6ICdkZWZhdWx0LWlucHV0LXRleHRhcmVhJyxcclxuICAgICAgICB0YWc6ICdkZWZhdWx0LWlucHV0LXRleHRhcmVhJyxcclxuICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcclxuICAgICAgICBwcm9wczogW1xyXG4gICAgICAgICAgICB7IG5hbWU6ICdtb2RlbCcsIHRpdGxlOiAnTW9kZWwnLCB0eXBlOiAndmFyJywgdGFiOiAnZGF0YScsIHZhcmlhYmxlOiB0cnVlIH0sXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ2xhYmVsJywgdGl0bGU6ICdMYWJlbCcsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxyXG4gICAgICAgICAgICB7IG5hbWU6ICdwbGFjZWhvbGRlcicsIHRpdGxlOiAnUGxhY2Vob2xkZXInLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICBdLFxyXG4gICAgfSkpO1xyXG5cclxuICAgIFdpZGdldHMuVGV4dGFyZWFXaWRnZXRGYWN0b3J5ID0gZnVuY3Rpb24obGFiZWwsIHBsYWNlaG9sZGVyKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBXaWRnZXRzLmJ1aWxkKFdpZGdldHMuVGV4dGFyZWFXaWRnZXQsIHtcclxuICAgICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7IHZhbHVlOiAnJyB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiB7IHZhbHVlOiBwbGFjZWhvbGRlciB9LFxyXG4gICAgICAgICAgICBtYXJnaW46IHsgdmFsdWU6ICcxNXB4IDE1cHgnIH0sXHJcbiAgICAgICAgICAgIGxhYmVsOiB7IHZhbHVlOiBsYWJlbCB9LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5JbnB1dHNHcm91cCwge1xyXG4gICAgICAgIG5hbWU6ICdpbnB1dC10ZXh0YXJlYScsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vaW5wdXQvdGV4dGFyZWEucG5nJyxcclxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuVGV4dGFyZWFXaWRnZXRGYWN0b3J5KCdUZXh0YXJlYScsICdUeXBlIG1lc3NhZ2UgaGVyZScpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5SYWRpb0lucHV0V2lkZ2V0ID1cclxuICAgIFdpZGdldHMuV2lkZ2V0KFdpZGdldHMuSW5wdXRzR3JvdXAsIFdpZGdldHMuY3JlYXRlKHtcclxuICAgICAgICBuYW1lOiAnZGVmYXVsdC1pbnB1dC1yYWRpbycsXHJcbiAgICAgICAgdGFnOiAnZGVmYXVsdC1pbnB1dC1yYWRpbycsXHJcbiAgICAgICAgbWl4aW5zOiBbIFdpZGdldHMuV2lkZ2V0TWl4aW4sIFdpZGdldHMuQm94TWl4aW4sIFdpZGdldHMuU2l6ZU1peGluIF0sXHJcbiAgICAgICAgcHJvcHM6IFtcclxuICAgICAgICAgICAgeyBuYW1lOiAnbW9kZWwnLCB0aXRsZTogJ01vZGVsJywgdHlwZTogJ3ZhcicsIHRhYjogJ2RhdGEnLCB2YXJpYWJsZTogdHJ1ZSB9LFxyXG4gICAgICAgICAgICB7IG5hbWU6ICdzdGVyZW90eXBlJywgdGl0bGU6ICdTdGVyZW90eXBlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdpdGVtcycsIHR5cGU6ICdtdWx0aXBsZScsIHRpdGxlOiAnSXRlbXMnLCB0YWI6ICdkYXRhJyxcclxuICAgICAgICAgICAgICAgIHRhYnM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdkYXRhJywgdGl0bGU6ICdEYXRhJyB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIHByb3BzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAndmFsdWUnLCB0aXRsZTogJ1ZhbHVlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnbGFiZWwnLCB0aXRsZTogJ0xhYmVsJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgIH0pKTtcclxuXHJcbiAgICBXaWRnZXRzLlJhZGlvSW5wdXRXaWRnZXRGYWN0b3J5ID0gZnVuY3Rpb24odmFsdWUsIG9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFdpZGdldHMuYnVpbGQoV2lkZ2V0cy5SYWRpb0lucHV0V2lkZ2V0LCB7XHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogeyB2YWx1ZTogdmFsdWUgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtYXJnaW46IHsgdmFsdWU6ICcxNXB4IDE1cHgnIH0sXHJcbiAgICAgICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogb3B0aW9ucy5tYXAoZnVuY3Rpb24ob3B0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFdpZGdldHMuUGFyYW0ob3B0aW9uLnZhbHVlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFdpZGdldHMuUGFyYW0ob3B0aW9uLmxhYmVsKSxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5JbnB1dHNHcm91cCwge1xyXG4gICAgICAgIG5hbWU6ICdpbnB1dC1yYWRpbycsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vaW5wdXQvcmFkaW8ucG5nJyxcclxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuUmFkaW9JbnB1dFdpZGdldEZhY3RvcnkoJzEnLCBbXHJcbiAgICAgICAgICAgIHsgdmFsdWU6ICcxJywgbGFiZWw6ICdGaXJzdCcgfSxcclxuICAgICAgICAgICAgeyB2YWx1ZTogJzInLCBsYWJlbDogJ1NlY29uZCcgfSxcclxuICAgICAgICBdKSxcclxuICAgIH0pO1xyXG5cclxuICAgIFdpZGdldHMuQ2hlY2tJbnB1dFdpZGdldCA9XHJcbiAgICBXaWRnZXRzLldpZGdldChXaWRnZXRzLklucHV0c0dyb3VwLCBXaWRnZXRzLmNyZWF0ZSh7XHJcbiAgICAgICAgbmFtZTogJ2RlZmF1bHQtaW5wdXQtY2hlY2tib3gnLFxyXG4gICAgICAgIHRhZzogJ2RlZmF1bHQtaW5wdXQtY2hlY2tib3gnLFxyXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluLCBXaWRnZXRzLlNpemVNaXhpbiBdLFxyXG4gICAgICAgIHByb3BzOiBbXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ21vZGVsJywgdGl0bGU6ICdNb2RlbCcsIHR5cGU6ICd2YXInLCB0YWI6ICdkYXRhJywgdmFyaWFibGU6IHRydWUgfSxcclxuICAgICAgICAgICAgeyBuYW1lOiAnc3RlcmVvdHlwZScsIHRpdGxlOiAnU3RlcmVvdHlwZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnaXRlbXMnLCB0eXBlOiAnbXVsdGlwbGUnLCB0aXRsZTogJ0l0ZW1zJywgdGFiOiAnZGF0YScsXHJcbiAgICAgICAgICAgICAgICB0YWJzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnZGF0YScsIHRpdGxlOiAnRGF0YScgfSxcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBwcm9wczogW1xyXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ3ZhbHVlJywgdGl0bGU6ICdWYWx1ZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2xhYmVsJywgdGl0bGU6ICdMYWJlbCcsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICB9KSk7XHJcblxyXG4gICAgV2lkZ2V0cy5DaGVja0lucHV0V2lkZ2V0RmFjdG9yeSA9IGZ1bmN0aW9uKHZhbHVlLCBvcHRpb25zKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBXaWRnZXRzLmJ1aWxkKFdpZGdldHMuQ2hlY2tJbnB1dFdpZGdldCwge1xyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHsgdmFsdWU6IHZhbHVlIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbWFyZ2luOiB7IHZhbHVlOiAnMTVweCAxNXB4JyB9LFxyXG4gICAgICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IG9wdGlvbnMubWFwKGZ1bmN0aW9uKG9wdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBXaWRnZXRzLlBhcmFtKG9wdGlvbi52YWx1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBXaWRnZXRzLlBhcmFtKG9wdGlvbi5sYWJlbCksXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuSW5wdXRzR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnaW5wdXQtY2hlY2snLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2lucHV0L2NoZWNrYm94LnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkNoZWNrSW5wdXRXaWRnZXRGYWN0b3J5KFsgJzEnIF0sIFtcclxuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ0ZpcnN0JyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnMicsIGxhYmVsOiAnU2Vjb25kJyB9LFxyXG4gICAgICAgIF0pLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWNoZWNrJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtY2hlY2snLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xyXG5cclxuICAgIFdpZGdldHMuQ2hlY2tXaWRnZXQgPVxyXG4gICAgV2lkZ2V0cy5XaWRnZXQoV2lkZ2V0cy5DaGVja3NHcm91cCwgV2lkZ2V0cy5jcmVhdGUoe1xyXG4gICAgICAgIG5hbWU6ICdkZWZhdWx0LWNoZWNrJyxcclxuICAgICAgICB0YWc6ICdkZWZhdWx0LWNoZWNrJyxcclxuICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcclxuICAgICAgICBwcm9wczogW1xyXG4gICAgICAgICAgICB7IG5hbWU6ICdtb2RlbCcsIHRpdGxlOiAnTW9kZWwnLCB0eXBlOiAndmFyJywgdGFiOiAnZGF0YScsIHZhcmlhYmxlOiB0cnVlIH0sXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ3N0ZXJlb3R5cGUnLCB0aXRsZTogJ1N0ZXJlb3R5cGUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ2l0ZW1zJywgdHlwZTogJ211bHRpcGxlJywgdGl0bGU6ICdJdGVtcycsIHRhYjogJ2RhdGEnLFxyXG4gICAgICAgICAgICAgICAgdGFiczogW1xyXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2RhdGEnLCB0aXRsZTogJ0RhdGEnIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgcHJvcHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICd2YWx1ZScsIHRpdGxlOiAnVmFsdWUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdsYWJlbCcsIHRpdGxlOiAnTGFiZWwnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgfSkpO1xyXG5cclxuICAgIFdpZGdldHMuQ2hlY2tXaWRnZXRGYWN0b3J5ID0gZnVuY3Rpb24oc3RlcmVvdHlwZSwgdmFsdWUsIG9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFdpZGdldHMuYnVpbGQoV2lkZ2V0cy5DaGVja1dpZGdldCwge1xyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHsgdmFsdWU6IHZhbHVlIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbWFyZ2luOiB7IHZhbHVlOiAnMTVweCAxNXB4JyB9LFxyXG4gICAgICAgICAgICBzdGVyZW90eXBlOiB7IHZhbHVlOiBzdGVyZW90eXBlIH0sXHJcbiAgICAgICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogb3B0aW9ucy5tYXAoZnVuY3Rpb24ob3B0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHsgdmFsdWU6IG9wdGlvbi52YWx1ZSB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogeyB2YWx1ZTogb3B0aW9uLmxhYmVsIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5DaGVja3NHcm91cCwge1xyXG4gICAgICAgIG5hbWU6ICdjaGVjay1kZWZhdWx0JyxcclxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9jaGVjay9jaGVjay1kZWZhdWx0LnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkNoZWNrV2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsIFsgJ0EnLCAnQicgXSwgW1xyXG4gICAgICAgICAgICB7IHZhbHVlOiAnQScsIGxhYmVsOiAnQScgfSxcclxuICAgICAgICAgICAgeyB2YWx1ZTogJ0InLCBsYWJlbDogJ0InIH0sXHJcbiAgICAgICAgICAgIHsgdmFsdWU6ICdDJywgbGFiZWw6ICdDJyB9LFxyXG4gICAgICAgIF0pLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQ2hlY2tzR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnY2hlY2stcHJpbWFyeScsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vY2hlY2svY2hlY2stcHJpbWFyeS5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5DaGVja1dpZGdldEZhY3RvcnkoJ3ByaW1hcnknLCBbICdBJywgJ0InIF0sIFtcclxuICAgICAgICAgICAgeyB2YWx1ZTogJ0EnLCBsYWJlbDogJ0EnIH0sXHJcbiAgICAgICAgICAgIHsgdmFsdWU6ICdCJywgbGFiZWw6ICdCJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnQycsIGxhYmVsOiAnQycgfSxcclxuICAgICAgICBdKSxcclxuICAgIH0pO1xyXG5cclxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkNoZWNrc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ2NoZWNrLXN1Y2Nlc3MnLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2NoZWNrL2NoZWNrLXN1Y2Nlc3MucG5nJyxcclxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuQ2hlY2tXaWRnZXRGYWN0b3J5KCdzdWNjZXNzJywgWyAnQScsICdCJyBdLCBbXHJcbiAgICAgICAgICAgIHsgdmFsdWU6ICdBJywgbGFiZWw6ICdBJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnQicsIGxhYmVsOiAnQicgfSxcclxuICAgICAgICAgICAgeyB2YWx1ZTogJ0MnLCBsYWJlbDogJ0MnIH0sXHJcbiAgICAgICAgXSksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5DaGVja3NHcm91cCwge1xyXG4gICAgICAgIG5hbWU6ICdjaGVjay1pbmZvJyxcclxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9jaGVjay9jaGVjay1pbmZvLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkNoZWNrV2lkZ2V0RmFjdG9yeSgnaW5mbycsIFsgJ0EnLCAnQicgXSwgW1xyXG4gICAgICAgICAgICB7IHZhbHVlOiAnQScsIGxhYmVsOiAnQScgfSxcclxuICAgICAgICAgICAgeyB2YWx1ZTogJ0InLCBsYWJlbDogJ0InIH0sXHJcbiAgICAgICAgICAgIHsgdmFsdWU6ICdDJywgbGFiZWw6ICdDJyB9LFxyXG4gICAgICAgIF0pLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQ2hlY2tzR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnY2hlY2std2FybmluZycsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vY2hlY2svY2hlY2std2FybmluZy5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5DaGVja1dpZGdldEZhY3RvcnkoJ3dhcm5pbmcnLCBbICdBJywgJ0InIF0sIFtcclxuICAgICAgICAgICAgeyB2YWx1ZTogJ0EnLCBsYWJlbDogJ0EnIH0sXHJcbiAgICAgICAgICAgIHsgdmFsdWU6ICdCJywgbGFiZWw6ICdCJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnQycsIGxhYmVsOiAnQycgfSxcclxuICAgICAgICBdKSxcclxuICAgIH0pO1xyXG5cclxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkNoZWNrc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ2NoZWNrLWRhbmdlcicsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vY2hlY2svY2hlY2stZGFuZ2VyLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkNoZWNrV2lkZ2V0RmFjdG9yeSgnZGFuZ2VyJywgWyAnQScsICdCJyBdLCBbXHJcbiAgICAgICAgICAgIHsgdmFsdWU6ICdBJywgbGFiZWw6ICdBJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnQicsIGxhYmVsOiAnQicgfSxcclxuICAgICAgICAgICAgeyB2YWx1ZTogJ0MnLCBsYWJlbDogJ0MnIH0sXHJcbiAgICAgICAgXSksXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xyXG5cclxuICAgIFdpZGdldHMuUmFkaW9XaWRnZXQgPVxyXG4gICAgV2lkZ2V0cy5XaWRnZXQoV2lkZ2V0cy5SYWRpb3NHcm91cCwgV2lkZ2V0cy5jcmVhdGUoe1xyXG4gICAgICAgIG5hbWU6ICdkZWZhdWx0LXJhZGlvJyxcclxuICAgICAgICB0YWc6ICdkZWZhdWx0LXJhZGlvJyxcclxuICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcclxuICAgICAgICBwcm9wczogW1xyXG4gICAgICAgICAgICB7IG5hbWU6ICdtb2RlbCcsIHRpdGxlOiAnTW9kZWwnLCB0eXBlOiAndmFyJywgdGFiOiAnZGF0YScsIHZhcmlhYmxlOiB0cnVlIH0sXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ3N0ZXJlb3R5cGUnLCB0aXRsZTogJ1N0ZXJlb3R5cGUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ2l0ZW1zJywgdHlwZTogJ211bHRpcGxlJywgdGl0bGU6ICdJdGVtcycsIHRhYjogJ2RhdGEnLFxyXG4gICAgICAgICAgICAgICAgdGFiczogW1xyXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2RhdGEnLCB0aXRsZTogJ0RhdGEnIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgcHJvcHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICd2YWx1ZScsIHRpdGxlOiAnVmFsdWUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdsYWJlbCcsIHRpdGxlOiAnTGFiZWwnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgfSkpO1xyXG5cclxuICAgIFdpZGdldHMuUmFkaW9XaWRnZXRGYWN0b3J5ID0gZnVuY3Rpb24oc3RlcmVvdHlwZSwgdmFsdWUsIG9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFdpZGdldHMuYnVpbGQoV2lkZ2V0cy5SYWRpb1dpZGdldCwge1xyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHsgdmFsdWU6IHZhbHVlIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbWFyZ2luOiB7IHZhbHVlOiAnMTVweCAxNXB4JyB9LFxyXG4gICAgICAgICAgICBzdGVyZW90eXBlOiB7IHZhbHVlOiBzdGVyZW90eXBlIH0sXHJcbiAgICAgICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogb3B0aW9ucy5tYXAoZnVuY3Rpb24ob3B0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHsgdmFsdWU6IG9wdGlvbi52YWx1ZSB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogeyB2YWx1ZTogb3B0aW9uLmxhYmVsIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAncmFkaW8tZGVmYXVsdCcsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vcmFkaW8vcmFkaW8tZGVmYXVsdC5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5SYWRpb1dpZGdldEZhY3RvcnkoJ2RlZmF1bHQnLCAnMScsIFtcclxuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnMCcsIGxhYmVsOiAnT2ZmJyB9LFxyXG4gICAgICAgIF0pLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAncmFkaW8tcHJpbWFyeScsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vcmFkaW8vcmFkaW8tcHJpbWFyeS5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5SYWRpb1dpZGdldEZhY3RvcnkoJ3ByaW1hcnknLCAnMScsIFtcclxuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnMCcsIGxhYmVsOiAnT2ZmJyB9LFxyXG4gICAgICAgIF0pLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAncmFkaW8tc3VjY2VzcycsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vcmFkaW8vcmFkaW8tc3VjY2Vzcy5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5SYWRpb1dpZGdldEZhY3RvcnkoJ3N1Y2Nlc3MnLCAnMScsIFtcclxuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnMCcsIGxhYmVsOiAnT2ZmJyB9LFxyXG4gICAgICAgIF0pLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAncmFkaW8taW5mbycsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vcmFkaW8vcmFkaW8taW5mby5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5SYWRpb1dpZGdldEZhY3RvcnkoJ2luZm8nLCAnMScsIFtcclxuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnMCcsIGxhYmVsOiAnT2ZmJyB9LFxyXG4gICAgICAgIF0pLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAncmFkaW8td2FybmluZycsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vcmFkaW8vcmFkaW8td2FybmluZy5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5SYWRpb1dpZGdldEZhY3RvcnkoJ3dhcm5pbmcnLCAnMScsIFtcclxuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnMCcsIGxhYmVsOiAnT2ZmJyB9LFxyXG4gICAgICAgIF0pLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAncmFkaW8tZGFuZ2VyJyxcclxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9yYWRpby9yYWRpby1kYW5nZXIucG5nJyxcclxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuUmFkaW9XaWRnZXRGYWN0b3J5KCdkYW5nZXInLCAnMScsIFtcclxuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnMCcsIGxhYmVsOiAnT2ZmJyB9LFxyXG4gICAgICAgIF0pLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXJhZGlvJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtcmFkaW8nLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xyXG5cclxuICAgIFdpZGdldHMuVGV4dFdpZGdldCA9XHJcbiAgICBXaWRnZXRzLldpZGdldChXaWRnZXRzLkJsb2Nrc0dyb3VwLCBXaWRnZXRzLmNyZWF0ZSh7XHJcbiAgICAgICAgbmFtZTogJ2RlZmF1bHQtdGV4dCcsXHJcbiAgICAgICAgdGFnOiAnZGVmYXVsdC10ZXh0JyxcclxuICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcclxuICAgICAgICBwcm9wczogW1xyXG4gICAgICAgICAgICB7IG5hbWU6ICdzdGVyZW90eXBlJywgdGl0bGU6ICdTdGVyZW90eXBlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ2NvbnRlbnQnLCB0aXRsZTogJ0NvbnRlbnQnLCB0eXBlOiAncmljaCcsIHRhYjogJ2NvbnRlbnQnIH0sXHJcbiAgICAgICAgXSxcclxuICAgIH0pKTtcclxuXHJcbiAgICBXaWRnZXRzLlRleHRXaWRnZXRGYWN0b3J5ID0gZnVuY3Rpb24oc3RlcmVvdHlwZSwgY29udGVudCkge1xyXG5cclxuICAgICAgICByZXR1cm4gV2lkZ2V0cy5idWlsZChXaWRnZXRzLlRleHRXaWRnZXQsIHtcclxuICAgICAgICAgICAgY29udGVudDogeyB2YWx1ZTogY29udGVudCB9LFxyXG4gICAgICAgICAgICBtYXJnaW46IHsgdmFsdWU6ICcxNXB4IDE1cHgnIH0sXHJcbiAgICAgICAgICAgIHN0ZXJlb3R5cGU6IHsgdmFsdWU6IHN0ZXJlb3R5cGUgfSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5IZWFkaW5nc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ3RleHQtaDEnLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvdGV4dC1oMS5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsIGBcclxuICAgICAgICAgICAgPGgxPkhlYWRpbmcgMTwvaDE+XHJcbiAgICAgICAgYCksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5IZWFkaW5nc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ3RleHQtaDInLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvdGV4dC1oMi5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsIGBcclxuICAgICAgICAgICAgPGgyPkhlYWRpbmcgMjwvaDI+XHJcbiAgICAgICAgYCksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5IZWFkaW5nc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ3RleHQtaDMnLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvdGV4dC1oMy5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsIGBcclxuICAgICAgICAgICAgPGgzPkhlYWRpbmcgMzwvaDM+XHJcbiAgICAgICAgYCksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5IZWFkaW5nc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ3RleHQtaDQnLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvdGV4dC1oNC5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsIGBcclxuICAgICAgICAgICAgPGg0PkhlYWRpbmcgNDwvaDQ+XHJcbiAgICAgICAgYCksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5IZWFkaW5nc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ3RleHQtaDUnLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvdGV4dC1oNS5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsIGBcclxuICAgICAgICAgICAgPGg1PkhlYWRpbmcgNTwvaDU+XHJcbiAgICAgICAgYCksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5IZWFkaW5nc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ3RleHQtaDYnLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvdGV4dC1oNi5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsIGBcclxuICAgICAgICAgICAgPGg2PkhlYWRpbmcgNjwvaDY+XHJcbiAgICAgICAgYCksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CbG9ja3NHcm91cCwge1xyXG4gICAgICAgIG5hbWU6ICdibG9jay1kZWZhdWx0JyxcclxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L2Jsb2NrLWRlZmF1bHQucG5nJyxcclxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuVGV4dFdpZGdldEZhY3RvcnkoJ2RlZmF1bHQnLCBgXHJcbiAgICAgICAgICAgIDxoMz5Mb3JlbSBpcHN1bTwvaDM+XHJcbiAgICAgICAgICAgIDxwPkV0aWFtIHBvcnRhIHNlbSBtYWxlc3VhZGEgbWFnbmEgbW9sbGlzIGV1aXNtb2QuPC9wPlxyXG4gICAgICAgIGApLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQmxvY2tzR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnYmxvY2stcHJpbWFyeScsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL3RleHQvdGV4dC9ibG9jay1wcmltYXJ5LnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXRGYWN0b3J5KCdwcmltYXJ5JywgYFxyXG4gICAgICAgICAgICA8aDM+TG9yZW0gaXBzdW08L2gzPlxyXG4gICAgICAgICAgICA8cD5FdGlhbSBwb3J0YSBzZW0gbWFsZXN1YWRhIG1hZ25hIG1vbGxpcyBldWlzbW9kLjwvcD5cclxuICAgICAgICBgKSxcclxuICAgIH0pO1xyXG5cclxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJsb2Nrc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ2Jsb2NrLXN1Y2Nlc3MnLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvYmxvY2stc3VjY2Vzcy5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnc3VjY2VzcycsIGBcclxuICAgICAgICAgICAgPGgzPkxvcmVtIGlwc3VtPC9oMz5cclxuICAgICAgICAgICAgPHA+RXRpYW0gcG9ydGEgc2VtIG1hbGVzdWFkYSBtYWduYSBtb2xsaXMgZXVpc21vZC48L3A+XHJcbiAgICAgICAgYCksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CbG9ja3NHcm91cCwge1xyXG4gICAgICAgIG5hbWU6ICdibG9jay1pbmZvJyxcclxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L2Jsb2NrLWluZm8ucG5nJyxcclxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuVGV4dFdpZGdldEZhY3RvcnkoJ2luZm8nLCBgXHJcbiAgICAgICAgICAgIDxoMz5Mb3JlbSBpcHN1bTwvaDM+XHJcbiAgICAgICAgICAgIDxwPkV0aWFtIHBvcnRhIHNlbSBtYWxlc3VhZGEgbWFnbmEgbW9sbGlzIGV1aXNtb2QuPC9wPlxyXG4gICAgICAgIGApLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQmxvY2tzR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnYmxvY2std2FybmluZycsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL3RleHQvdGV4dC9ibG9jay13YXJuaW5nLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXRGYWN0b3J5KCd3YXJuaW5nJywgYFxyXG4gICAgICAgICAgICA8aDM+TG9yZW0gaXBzdW08L2gzPlxyXG4gICAgICAgICAgICA8cD5FdGlhbSBwb3J0YSBzZW0gbWFsZXN1YWRhIG1hZ25hIG1vbGxpcyBldWlzbW9kLjwvcD5cclxuICAgICAgICBgKSxcclxuICAgIH0pO1xyXG5cclxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJsb2Nrc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ2Jsb2NrLWRhbmdlcicsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL3RleHQvdGV4dC9ibG9jay1kYW5nZXIucG5nJyxcclxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuVGV4dFdpZGdldEZhY3RvcnkoJ2RhbmdlcicsIGBcclxuICAgICAgICAgICAgPGgzPkxvcmVtIGlwc3VtPC9oMz5cclxuICAgICAgICAgICAgPHA+RXRpYW0gcG9ydGEgc2VtIG1hbGVzdWFkYSBtYWduYSBtb2xsaXMgZXVpc21vZC48L3A+XHJcbiAgICAgICAgYCksXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtdGV4dCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXRleHQnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtcGxhY2Vob2xkZXInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1wbGFjZWhvbGRlcicsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1ib3gnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1ib3gnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGJpbmRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGNsYXNzOiBTdHJpbmcsXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcclxuXHJcbiAgICBXaWRnZXRzLlN0dWJXaWRnZXQgPVxyXG4gICAgV2lkZ2V0cy5XaWRnZXQoV2lkZ2V0cy5VdGlsR3JvdXAsIFdpZGdldHMuY3JlYXRlKHtcclxuICAgICAgICBuYW1lOiAnZGVmYXVsdC1zdHViJyxcclxuICAgICAgICB0YWc6ICdkZWZhdWx0LXN0dWInLFxyXG4gICAgICAgIF9hY3Rpb246ICdpZ25vcmUnLFxyXG4gICAgICAgIHByb3BzOiBbXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ2NvbnRlbnQnLCB0eXBlOiAnc3RyaW5nJyB9XHJcbiAgICAgICAgXSxcclxuICAgIH0pKTtcclxuXHJcbiAgICBXaWRnZXRzLlN0dWJXaWRnZXRGYWN0b3J5ID0gZnVuY3Rpb24oY29udGVudCkge1xyXG5cclxuICAgICAgICByZXR1cm4gV2lkZ2V0cy5idWlsZChXaWRnZXRzLlN0dWJXaWRnZXQsIHtcclxuICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50OiB7IHZhbHVlOiBjb250ZW50IH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXN0dWInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zdHViJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XHJcblxyXG4gICAgTGFuZGluZy5MYW5kaW5nUGFnZSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXBhZ2UnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ0dhbGxlcnlQYWdlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctZ2FsbGVyeS1wYWdlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctZ2FsbGVyeS1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ1N0b3JhZ2VQYWdlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctc3RvcmFnZS1wYWdlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctc3RvcmFnZS1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ1NpZ25pblBhZ2UgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1zaWduaW4tcGFnZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXNpZ25pbi1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ1NpZ251cFBhZ2UgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1zaWdudXAtcGFnZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXNpZ251cC1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ1Byb2ZpbGVQYWdlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctcHJvZmlsZS1wYWdlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctcHJvZmlsZS1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ01hbmFnZVBhZ2UgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1tYW5hZ2UtcGFnZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLW1hbmFnZS1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ01hbmFnZUNyZWF0ZVBhZ2UgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1tYW5hZ2UtY3JlYXRlLXBhZ2UnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1tYW5hZ2UtY3JlYXRlLXBhZ2UnLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xyXG5cclxuICAgIENvcmUuUG9ydGFsc0ZhY3RvcnkgPSBmdW5jdGlvbihvd25lcikge1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG5cclxuICAgICAgICAgICAgbG9hZDogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5nZXQoJy93cy9wb3J0YWxzJywgZGF0YSkudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyByZXNvbHZlKGQpOyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IHJlamVjdChlKTsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSksXHJcblxyXG4gICAgICAgICAgICBjcmVhdGU6IChkYXRhKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgb3duZXIuJGh0dHAucG9zdCgnL3dzL3BvcnRhbHMnLCBkYXRhKS50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHJlc29sdmUoZCk7IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgcmVqZWN0KGUpOyB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KSxcclxuXHJcbiAgICAgICAgICAgIHJlbW92ZTogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5kZWxldGUoJy93cy9wb3J0YWxzJywgZGF0YSkudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyByZXNvbHZlKGQpOyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IHJlamVjdChlKTsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSksXHJcblxyXG4gICAgICAgICAgICBnZXQ6IChkYXRhKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgb3duZXIuJGh0dHAuZ2V0KGAvd3MvcG9ydGFscy8ke2RhdGEuaWR9YCkudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyByZXNvbHZlKGQpOyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IHJlamVjdChlKTsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XHJcblxyXG4gICAgQ29yZS5TZWN1cml0eUZhY3RvcnkgPSBmdW5jdGlvbihvd25lcikge1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG5cclxuICAgICAgICAgICAgc2lnbnVwOiAoZGF0YSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLnBvc3QoJy93cy9zaWdudXAnLCBkYXRhKS50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IG93bmVyLnByaW5jaXBhbCA9IGQuZGF0YS5wcmluY2lwYWw7IHJlc29sdmUoZCk7IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgb3duZXIucHJpbmNpcGFsID0gbnVsbDsgcmVqZWN0KGUpOyB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KSxcclxuXHJcbiAgICAgICAgICAgIHNpZ25pbjogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5wb3N0KCcvd3Mvc2lnbmluJywgZGF0YSkudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyBvd25lci5wcmluY2lwYWwgPSBkLmRhdGEucHJpbmNpcGFsOyByZXNvbHZlKGQpOyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IG93bmVyLnByaW5jaXBhbCA9IG51bGw7IHJlamVjdChlKTsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSksXHJcblxyXG4gICAgICAgICAgICBzaWdub3V0OiAoKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgb3duZXIuJGh0dHAucG9zdCgnL3dzL3NpZ25vdXQnKS50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IG93bmVyLnByaW5jaXBhbCA9IG51bGw7IHJlc29sdmUoZCk7IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgcmVqZWN0KGUpOyB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcclxuXHJcbiAgICB2YXIgdmFsaWRhdGlvbiA9IHtcclxuICAgICAgICBlbWFpbDogXCIvXihbYS16QS1aMC05X1xcXFwuXFxcXC1dKylAKFthLXpBLVowLTlfXFxcXC5cXFxcLV0rKVxcXFwuKFthLXpBLVowLTldezIsfSkkL2dcIixcclxuICAgIH07XHJcblxyXG4gICAgTGFuZGluZy5TaWduaW4gPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1hY2NvdW50LXNpZ25pbicsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLWFjY291bnQtc2lnbmluJyxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGZvcm06IHRoaXMuZm9ybSxcclxuICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IHZhbGlkYXRpb24sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2Zvcm0nLCB7XHJcbiAgICAgICAgICAgICAgICBlbWFpbDogbnVsbCxcclxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBudWxsLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgc2lnbmluOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBWdWUuc2VydmljZSgnc2VjdXJpdHknKS5zaWduaW4oe1xyXG4gICAgICAgICAgICAgICAgICAgIGVtYWlsOiB0aGlzLmZvcm0uZW1haWwsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHRoaXMuZm9ybS5wYXNzd29yZCxcclxuICAgICAgICAgICAgICAgIH0pLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgdGhpcy4kcm91dGVyLmdvKCcvJyk7IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBMYW5kaW5nLlNpZ251cCA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWFjY291bnQtc2lnbnVwJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctYWNjb3VudC1zaWdudXAnLFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZm9ybTogdGhpcy5mb3JtLFxyXG4gICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogdmFsaWRhdGlvbixcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJHNldCgnZm9ybScsIHtcclxuICAgICAgICAgICAgICAgIGVtYWlsOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IG51bGwsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBzaWdudXA6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdzZWN1cml0eScpLnNpZ251cCh7XHJcbiAgICAgICAgICAgICAgICAgICAgZW1haWw6IHRoaXMuZm9ybS5lbWFpbCxcclxuICAgICAgICAgICAgICAgICAgICBwYXNzd29yZDogdGhpcy5mb3JtLnBhc3N3b3JkLFxyXG4gICAgICAgICAgICAgICAgfSkudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyB0aGlzLiRyb3V0ZXIuZ28oJy8nKTsgfSxcclxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuUHJvZmlsZSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWFjY291bnQtcHJvZmlsZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLWFjY291bnQtcHJvZmlsZScsXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XHJcbiIsIiIsIiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XHJcblxyXG4gICAgTGFuZGluZy5GZWVkYmFjayA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWZlZWRiYWNrJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctZmVlZGJhY2snLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xyXG5cclxuICAgIExhbmRpbmcuRm9vdGVyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctZm9vdGVyJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctZm9vdGVyJyxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcclxuXHJcbiAgICBMYW5kaW5nLkdhbGxlcnkgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1nYWxsZXJ5Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctZ2FsbGVyeScsXHJcbiAgICB9KTtcclxuXHJcbiAgICBMYW5kaW5nLkdhbGxlcnlGdWxsID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctZ2FsbGVyeS1mdWxsJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctZ2FsbGVyeS1mdWxsJyxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcclxuXHJcbiAgICBMYW5kaW5nLkhlYWRlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWhlYWRlcicsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLWhlYWRlcicsXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBzaWdub3V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdzZWN1cml0eScpLnNpZ25vdXQoKS50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHRoaXMuJHJvdXRlci5nbygnLycpOyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xyXG5cclxuICAgIExhbmRpbmcuTWFuYWdlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctbWFuYWdlJywge1xyXG5cclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLW1hbmFnZScsXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB1cmw6IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCArICcvLycgKyB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgKyAod2luZG93LmxvY2F0aW9uLnBvcnQgPyAnOicgKyB3aW5kb3cubG9jYXRpb24ucG9ydDogJycpLFxyXG4gICAgICAgICAgICAgICAgcG9ydGFsczogdGhpcy5wb3J0YWxzLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG5cclxuICAgICAgICAgICAgcmVmcmVzaDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBWdWUuc2VydmljZSgncG9ydGFscycpLmxvYWQoKS50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHRoaXMuJHNldCgncG9ydGFscycsIGQuZGF0YS5wb3J0YWxzKTsgfSxcclxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyB0aGlzLiRzZXQoJ3BvcnRhbHMnLCBbXSk7IH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgICAgICAgICAgICBWdWUuc2VydmljZSgncG9ydGFscycpLnJlbW92ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHRoaXMucmVmcmVzaCgpOyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgTGFuZGluZy5NYW5hZ2VDcmVhdGUgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1tYW5hZ2UtY3JlYXRlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctbWFuYWdlLWNyZWF0ZScsXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBmb3JtOiB0aGlzLmZvcm0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2Zvcm0nLCB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogbnVsbCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcblxyXG4gICAgICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3BvcnRhbHMnKS5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiB0aGlzLmZvcm0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgdGhpcy4kcm91dGVyLmdvKCcvbWFuYWdlJyl9LFxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xyXG5cclxuICAgIExhbmRpbmcuU3RvcmFnZSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXByaWNpbmcnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1wcmljaW5nJyxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcclxuXHJcbiAgICBMYW5kaW5nLlN0b3JhZ2UgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1zdG9yYWdlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctc3RvcmFnZScsXHJcbiAgICB9KTtcclxuXHJcbiAgICBMYW5kaW5nLlN0b3JhZ2VGdWxsID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctc3RvcmFnZS1mdWxsJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctc3RvcmFnZS1mdWxsJyxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcclxuXHJcbiAgICBMYW5kaW5nLlN1cGVyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctc3VwZXInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1zdXBlcicsXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XHJcblxyXG4gICAgTGFuZGluZy5Vc2VjYXNlcyA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXVzZWNhc2VzJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctdXNlY2FzZXMnLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xyXG5cclxuICAgIExhbmRpbmcuVmlkZW8gPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy12aWRlbycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXZpZGVvJyxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
