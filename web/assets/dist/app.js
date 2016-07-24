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

    var ParamSelect =
    Vue.component('params-select', {
        template: '#params-select',
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

    var P = Widgets.Props = {};
    var T = Widgets.Tabs = {};

    T.Data = { name: 'data', title: 'Data' };
    T.Appearance = { name: 'appearance', title: 'Appearance' };
    T.Content = { name: 'content', title: 'Content' };

    P.Id = { name: 'id', title: 'ID', type: 'string', tab: 'data', placeholder: 'Unique ID' };

    P.Width = { name: 'width', title: 'Width', type: 'string', tab: 'appearance' };
    P.Height = { name: 'height', title: 'Height', type: 'string', tab: 'appearance' };
    P.Padding = { name: 'padding', title: 'Padding', type: 'string', tab: 'appearance' };
    P.Margin = { name: 'margin', title: 'Margin', type: 'string', tab: 'appearance' };
    P.Border = { name: 'border', title: 'Border', type: 'string', placeholder: '1px solid #000000', tab: 'appearance' };
    P.Background = { name: 'background', title: 'Background', type: 'string', tab: 'appearance' };

    P.Cols = { name: 'cols', title: 'Columns', type: 'string', tab: 'appearance' };
    P.Rows = { name: 'rows', title: 'Rows', type: 'string', tab: 'appearance' };
    P.Color = { name: 'color', title: 'Color', type: 'string', tab: 'appearance' };
    P.Content = { name: 'content', title: 'Content', type: 'string', tab: 'content' };

    P.Spacing = { name: 'spacing', title: 'Border Spacing', type: 'string', tab: 'appearance' };
    P.Collapse = { name: 'collapse', title: 'Border Collapse', type: 'string', tab: 'appearance' };

    P.Align = { name: 'align', title: 'Text Align', type: 'select', tab: 'appearance', options: [
        { value: 'left', text: 'Left' },
        { value: 'right', text: 'Right' },
        { value: 'center', text: 'Ceneter' },
        { value: 'justify', text: 'Justify' },
    ] };

    P.Dock = { name: 'dock', title: 'Dock', type: 'select', tab: 'appearance', options: [
        { value: 'above', text: 'Above' },
        { value: 'top', text: 'Top' },
        { value: 'right', text: 'Right' },
        { value: 'bottom', text: 'Bottom' },
        { value: 'left', text: 'Left' },
    ]};

    Widgets.WidgetMixin = {
        tabs: [ T.Data, T.Appearance, T.Content ],
        props: [ P.Id ],
    };

    Widgets.BoxMixin = {
        props: [
            { name: 'inner', title: 'Inner Container', type: 'object', tab: 'appearance',
                tabs: [ T.Appearance ],
                props: [ P.Border, P.Background ]
            },
            { name: 'outer', title: 'Outer Container', type: 'object', tab: 'appearance',
                tabs: [ T.Appearance ],
                props: [ P.Margin, P.Padding, P.Border, P.Background ]
            },
        ],
    };

    Widgets.SizeMixin = {
        props: [ P.Width, P.Height ],
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

    Vue.component('default-carousel', {
        template: '#default-carousel',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

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

    var P = Widgets.Props;
    var T = Widgets.Tabs;

    Widgets.GalleryWidget =
    Widgets.Widget(Widgets.GalleryGroup, Widgets.create({
        name: 'default-gallery',
        tag: 'default-gallery',
        mixins: [ Widgets.WidgetMixin, Widgets.BoxMixin, Widgets.SizeMixin ],
        props: [ P.Cols, P.Rows, P.Dock, P.Color, P.Align,
            {
                name: 'border', title: 'Border', type: 'object', tab: 'appearance',
                tabs: [ T.Appearance ],
                props: [ P.Spacing, P.Collapse ]
            },
            {
                name: 'items', title: 'Items', type: 'object', tab: 'data',
                tabs: [ T.Data, T.Appearance ],
                props: [
                    {
                        name: 'collection', title: 'Collection', type: 'multiple', tab: 'data',
                        tabs: [ T.Appearance, T.Content ],
                        props: [ P.Width, P.Height, P.Margin, P.Padding, P.Background,
                            {
                                name: 'drawing', title: 'Drawing', type: 'object', tab: 'appearance',
                                tabs: [ T.Appearance ],
                                props: [ P.Width, P.Height, P.Margin, P.Padding, P.Background, ],
                            },
                            {
                                name: 'description', title: 'Description', type: 'object', tab: 'appearance',
                                tabs: [ T.Appearance, T.Content ],
                                props: [ P.Width, P.Height, P.Margin, P.Padding, P.Background, P.Color, P.Align, P.Content, ]
                            },
                        ]
                    },
                    {
                        name: 'style', title: 'Style', type: 'object', tab: 'appearance',
                        tabs: [ T.Appearance ],
                        props: [ P.Width, P.Height, P.Margin, P.Padding, P.Background,
                            {
                                name: 'drawing', title: 'Drawing', type: 'object', tab: 'appearance',
                                tabs: [ T.Appearance ],
                                props: [
                                    P.Width, P.Height, P.Margin, P.Padding, P.Background,
                                ]
                            },
                            {
                                name: 'description', title: 'Description', type: 'object', tab: 'appearance',
                                tabs: [ T.Appearance ],
                                props: [ P.Width, P.Height, P.Margin, P.Padding, P.Background, P.Color, P.Align, ]
                            },
                        ],
                    }
                ]
            },
        ],
    }));

    Widgets.GalleryWidgetFactory = function(defaults) {

        var w = Widgets.build(Widgets.GalleryWidget, {
            rows: { value: defaults.rows },
            cols: { value: defaults.cols },
            dock: { value: defaults.dock },
            align: { value: defaults.align },
            color: { value: defaults.color },
            background: { value: defaults.background },
            border: {
                value: {
                    spacing: { value: defaults.border.spacing }
                }
            },
            items: {
                value: {
                    style: {
                        value: {
                            width: { value: defaults.items.style.width },
                            height: { value: defaults.items.style.height },
                            description: {
                                value: {
                                    padding: { value: defaults.padding },
                                }
                            }
                        }
                    },
                    collection: {
                        value: defaults.items.collection.map(function(item) {
                            return {
                                drawing: {
                                    value: {
                                        background: { value: item.drawing.background },
                                    }
                                },
                                description: {
                                    value: {
                                        content: { value: item.description.content },
                                    }
                                },
                            };
                        })
                    }
                }
            },
        });

        return w;
    }

    Widgets.Item(Widgets.GalleryGroup, {
        name: 'gallery-r1c1f',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/composites/gallery/gallery-r1c1f.png',
        widget: Widgets.GalleryWidgetFactory({
            rows: 1, cols: 1, dock: 'above', padding: '30px', align: 'center', color: '#FFFFFF',
            border: {
                spacing: '0px',
            },
            items: {
                style: {
                    width: '100%',
                    height: '250px',
                },
                collection: [
                    {
                        drawing: {
                            background: '#FF6466'
                        },
                        description: {
                            content: `
                                <h3><span style="font-size:48px">First Item</span></h3>
                                <p><span style="font-size: 28px">You can change item data using settings editor</span></p>
                            `,
                        },
                    },
                    {
                        drawing: {
                            background: '#605BE8'
                        },
                        description: {
                            content: `
                                <h3><span style="font-size:48px">Second Item</span></h3>
                                <p><span style="font-size: 28px">You can change item data using settings editor</span></p>
                            `,
                        },
                    },
                    {
                        drawing: {
                            background: '#70FFBF'
                        },
                        description: {
                            content: `
                                <h3><span style="font-size:48px">Third Item</span></h3>
                                <p><span style="font-size: 28px">You can change item data using settings editor</span></p>
                            `,
                        },
                    },
                ]
            }
        }),
    });

    Widgets.Item(Widgets.GalleryGroup, {
        name: 'gallery-r1c1r',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/composites/gallery/gallery-r1c1r.png',
        widget: Widgets.GalleryWidgetFactory({
            rows: 1, cols: 1, dock: 'right', padding: '30px', align: 'left', color: '#333333',
            border: {
                spacing: '20px',
            },
            items: {
                style: {
                    width: '100%',
                    height: '240px',
                },
                collection: [
                    {
                        drawing: {
                            background: '#FF6466'
                        },
                        description: {
                            content: `
                                <h3><span style="font-size:48px">First Item</span></h3>
                                <p><span style="font-size: 28px">You can change item data using settings editor</span></p>
                            `,
                        },
                    },
                    {
                        drawing: {
                            background: '#605BE8'
                        },
                        description: {
                            content: `
                                <h3><span style="font-size:48px">Second Item</span></h3>
                                <p><span style="font-size: 28px">You can change item data using settings editor</span></p>
                            `,
                        },
                    },
                    {
                        drawing: {
                            background: '#70FFBF'
                        },
                        description: {
                            content: `
                                <h3><span style="font-size:48px">Third Item</span></h3>
                                <p><span style="font-size: 28px">You can change item data using settings editor</span></p>
                            `,
                        },
                    },
                ]
            }
        }),
    });

    Widgets.Item(Widgets.GalleryGroup, {
        name: 'gallery-r1c3f',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/composites/gallery/gallery-r1c3f.png',
        widget: Widgets.GalleryWidgetFactory({
            rows: 1, cols: 3, dock: 'above', padding: '30px', align: 'center', color: '#FFFFFF',
            border: {
                spacing: '20px',
            },
            items: {
                style: {
                    width: '100%',
                    height: '180px',
                },
                collection: [
                    {
                        drawing: {
                            background: '#FF6466'
                        },
                        description: {
                            content: `
                                <h3><span>First Item</span></h3>
                                <p><span>You can change item data using settings editor</span></p>
                            `,
                        },
                    },
                    {
                        drawing: {
                            background: '#605BE8'
                        },
                        description: {
                            content: `
                                <h3><span>Second Item</span></h3>
                                <p><span>You can change item data using settings editor</span></p>
                            `,
                        },
                    },
                    {
                        drawing: {
                            background: '#70FFBF'
                        },
                        description: {
                            content: `
                                <h3><span>Third Item</span></h3>
                                <p><span>You can change item data using settings editor</span></p>
                            `,
                        },
                    },
                    {
                        drawing: {
                            background: '#A52939'
                        },
                        description: {
                            content: `
                                <h3><span>Fourth Item</span></h3>
                                <p><span>You can change item data using settings editor</span></p>
                            `,
                        },
                    },
                    {
                        drawing: {
                            background: '#EE3B80'
                        },
                        description: {
                            content: `
                                <h3><span>Fifth Item</span></h3>
                                <p><span>You can change item data using settings editor</span></p>
                            `,
                        },
                    },
                    {
                        drawing: {
                            background: '#EE6B9E'
                        },
                        description: {
                            content: `
                                <h3><span>Sixth Item</span></h3>
                                <p><span>You can change item data using settings editor</span></p>
                            `,
                        },
                    },
                ]
            }
        }),
    });

    // Widgets.Item(Widgets.GalleryGroup, {
    //     name: 'gallery-r1c3b',
    //     thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/composites/gallery/gallery-r1c3b.png',
    //     widget: Widgets.GalleryWidgetFactory(1, 3, 'bottom', '100%', '400px', '30px', [
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
    //     widget: Widgets.GalleryWidgetFactory(2, 4, 'above', '100%', '400px', '30px', [
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
    //     widget: Widgets.GalleryWidgetFactory(2, 4, 'bottom', '100%', '400px', '30px', [
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
    //     widget: Widgets.GalleryWidgetFactory(2, 3, 'above', '100%', '400px', '30px', [
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
    //     widget: Widgets.GalleryWidgetFactory(3, 2, 'right', '100%', '400px', '30px', [
    //         { caption: '<h3>First Item</h3><p>You can change item data using settings editor</p>', background: '#FF3500' },
    //         { caption: '<h3>Second Item</h3><p>You can change item data using settings editor</p>', background: '#DC0055' },
    //         { caption: '<h3>Third Item</h3><p>You can change item data using settings editor</p>', background: '#BF0037' },
    //         { caption: '<h3>Fourth Item</h3><p>You can change item data using settings editor</p>', background: '#A52939' },
    //         { caption: '<h3>Fifth Item</h3><p>You can change item data using settings editor</p>', background: '#EE3B80' },
    //         { caption: '<h3>Sixth Item</h3><p>You can change item data using settings editor</p>', background: '#EE6B9E' },
    //     ]),
    // });

})(jQuery, Vue, Core, Widgets);

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
            inner: {
                value:  {
                    margin: { value: '15px 15px' },
                }
            },
            type: { value: 'button' },
            title: { value: title },
            stereotype: { value: stereotype },
        });
        
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

(function($, Vue, Core, Widgets) {

    Widgets.StubWidget =
    Widgets.Widget(Widgets.UtilGroup, Widgets.create({
        _action: 'ignore',
        name: 'default-stub',
        tag: 'default-stub',
        mixins: [ Widgets.BoxMixin ],
        props: [
            { name: 'content', type: 'rich' }
        ],
    }));

    Widgets.StubWidgetFactory = function(content) {

        return Widgets.build(Widgets.StubWidget, {
            content: { value: content },
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiY29tcG9uZW50cy9lZGl0b3IuanMiLCJjb21wb25lbnRzL2Zvcm0uanMiLCJjb21wb25lbnRzL2lubGluZS5qcyIsImNvbXBvbmVudHMvbWl4aW5zLmpzIiwiY29tcG9uZW50cy9tb2RhbC5qcyIsImNvbXBvbmVudHMvc29ydGFibGUuanMiLCJkaXJlY3RpdmVzL2FmZml4LmpzIiwiZGlyZWN0aXZlcy9jb21iby5qcyIsImRpcmVjdGl2ZXMvZGF0ZS5qcyIsImRpcmVjdGl2ZXMvcmljaC5qcyIsImRpcmVjdGl2ZXMvc2Nyb2xsYWJsZS5qcyIsImRpcmVjdGl2ZXMvdGFncy5qcyIsImZpbHRlcnMvaW5kZXguanMiLCJob29rcy9tb2RhbC5qcyIsInBsdWdpbnMvY29udGFpbmVyLmpzIiwidmFsaWRhdG9ycy9lbWFpbC5qcyIsImVkaXRvci9iaW5kaW5ncy9iaW5kaW5ncy5qcyIsImVkaXRvci9kb21haW5zL2RvbWFpbnMuanMiLCJlZGl0b3IvcGFnZXMvcGFnZXMuanMiLCJlZGl0b3IvcGFyYW1zL3BhcmFtcy5qcyIsImVkaXRvci9zY2hlbWVzL3NjaGVtZXMuanMiLCJlZGl0b3Ivc2V0dGluZ3Mvc2V0dGluZ3MuanMiLCJlZGl0b3Ivc3RvcmFnZXMvc3RvcmFnZXMuanMiLCJlZGl0b3Ivd2lkZ2V0cy93aWRnZXRzLmpzIiwic2hlbGwvYWN0aW9ucy9hY3Rpb25zLmpzIiwic2hlbGwvYnJhbmQvYnJhbmQuanMiLCJzaGVsbC9jYXRlZ29yaWVzL2NhdGVnb3JpZXMuanMiLCJzaGVsbC9jb250YWluZXIvY29udGFpbmVyLmpzIiwic2hlbGwvZGVjb3JhdG9yL2RlY29yYXRvci5qcyIsInNoZWxsL2RvbWFpbnMvZG9tYWlucy5qcyIsInNoZWxsL2xvYWRlci9sb2FkZXIuanMiLCJzaGVsbC9wYWdlL3BhZ2UuanMiLCJzaGVsbC9wYWdlcy9wYWdlcy5qcyIsInNoZWxsL3BhbGV0dGUvcGFsZXR0ZS5qcyIsInNoZWxsL3NoZWxsL3NoZWxsLmpzIiwic2hlbGwvc291cmNlcy9zb3VyY2VzLmpzIiwic2hlbGwvc3RvcmFnZXMvc3RvcmFnZXMuanMiLCJzaGVsbC90YXJnZXQvdGFyZ2V0LmpzIiwic2hlbGwvd2lkZ2V0L3dpZGdldC5qcyIsImVkaXRvci9wYWdlcy9zb3VyY2VzL3NvdXJjZXMuanMiLCJlZGl0b3IvcGFnZXMvd2lkZ2V0cy93aWRnZXRzLmpzIiwid2lkZ2V0cy5qcyIsIndpZGdldHMvcGFsZXR0ZS5qcyIsIndpZGdldHMvd2lkZ2V0cy5qcyIsIndpZGdldHMvY29tcG9zaXRlcy9wYWxldHRlLmpzIiwid2lkZ2V0cy9jb250YWluZXIvcGFsZXR0ZS5qcyIsIndpZGdldHMvZm9ybS9wYWxldHRlLmpzIiwid2lkZ2V0cy90ZXh0L3BhbGV0dGUuanMiLCJ3aWRnZXRzL3V0aWxzL3BhbGV0dGUuanMiLCJ3aWRnZXRzL2NvbXBvc2l0ZXMvY2Fyb3VzZWwvY2Fyb3VzZWwuanMiLCJ3aWRnZXRzL2NvbXBvc2l0ZXMvZ2FsbGVyeS9nYWxsZXJ5LmpzIiwid2lkZ2V0cy9jb21wb3NpdGVzL2dhbGxlcnkvcGFsZXR0ZS5qcyIsIndpZGdldHMvY29udGFpbmVyL3N0YWNrL3BhbGV0dGUuanMiLCJ3aWRnZXRzL2NvbnRhaW5lci9zdGFjay9zdGFjay5qcyIsIndpZGdldHMvZm9ybS9idXR0b24vYnV0dG9uLmpzIiwid2lkZ2V0cy9mb3JtL2J1dHRvbi9wYWxldHRlLmpzIiwid2lkZ2V0cy9mb3JtL2NoZWNrL2NoZWNrLmpzIiwid2lkZ2V0cy9mb3JtL2NoZWNrL3BhbGV0dGUuanMiLCJ3aWRnZXRzL2Zvcm0vaW5wdXQvaW5wdXQuanMiLCJ3aWRnZXRzL2Zvcm0vaW5wdXQvcGFsZXR0ZS5qcyIsIndpZGdldHMvZm9ybS9yYWRpby9wYWxldHRlLmpzIiwid2lkZ2V0cy9mb3JtL3JhZGlvL3JhZGlvLmpzIiwid2lkZ2V0cy90ZXh0L3RleHQvcGFsZXR0ZS5qcyIsIndpZGdldHMvdGV4dC90ZXh0L3RleHQuanMiLCJ3aWRnZXRzL3V0aWxzL2JveC9ib3guanMiLCJ3aWRnZXRzL3V0aWxzL3BsYWNlaG9sZGVyL3BsYWNlaG9sZGVyLmpzIiwid2lkZ2V0cy91dGlscy9zdHViL3BhbGV0dGUuanMiLCJ3aWRnZXRzL3V0aWxzL3N0dWIvc3R1Yi5qcyIsImxhbmRpbmcvbGFuZGluZy5qcyIsInNlcnZpY2VzL3BvcnRhbHMuanMiLCJzZXJ2aWNlcy9zZWN1cml0eS5qcyIsImxhbmRpbmcvYWNjb3VudC9hY2NvdW50LmpzIiwibGFuZGluZy9iZW5lZml0cy9iZW5lZml0cy5qcyIsImxhbmRpbmcvY29udGFjdHMvY29udGFjdHMuanMiLCJsYW5kaW5nL2ZlZWRiYWNrL2ZlZWRiYWNrLmpzIiwibGFuZGluZy9mb290ZXIvZm9vdGVyLmpzIiwibGFuZGluZy9nYWxsZXJ5L2dhbGxlcnkuanMiLCJsYW5kaW5nL2hlYWRlci9oZWFkZXIuanMiLCJsYW5kaW5nL21hbmFnZS9tYW5hZ2UuanMiLCJsYW5kaW5nL3ByaWNpbmcvcHJpY2luZy5qcyIsImxhbmRpbmcvc3RvcmFnZS9zdG9yYWdlLmpzIiwibGFuZGluZy9zdXBlci9zdXBlci5qcyIsImxhbmRpbmcvdXNlY2FzZXMvdXNlY2FzZXMuanMiLCJsYW5kaW5nL3ZpZGVvL3ZpZGVvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDblNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FoQlBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QWlCVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9PQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMWhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QXBFUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QXFFNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0RUE7QUNBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgTGFuZGluZyA9XG4oZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgTGFuZGluZyA9IHt9O1xuXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgJCgnW2RhdGEtdnVlLWFwcF0nKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG5cbiAgICAgICAgICAgIHZhciBkYXRhID0gJChlbGVtZW50KS5kYXRhKCk7XG5cbiAgICAgICAgICAgIHZhciBBcHAgPSBWdWUuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICBWdWUuc2VydmljZSgnc2VjdXJpdHknLCBDb3JlLlNlY3VyaXR5RmFjdG9yeSh0aGlzKSk7XG4gICAgICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdwb3J0YWxzJywgQ29yZS5Qb3J0YWxzRmFjdG9yeSh0aGlzKSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgcm91dGVyID0gbmV3IFZ1ZVJvdXRlcih7XG4gICAgICAgICAgICAgICAgaGlzdG9yeTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByb3V0ZXIuYmVmb3JlRWFjaChmdW5jdGlvbih0cmFuc2l0aW9uKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAodHJhbnNpdGlvbi50by5hdXRoICYmICFyb3V0ZXIuYXBwLnByaW5jaXBhbCkge1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0cmFuc2l0aW9uLnRvLmFub24gJiYgcm91dGVyLmFwcC5wcmluY2lwYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbi5hYm9ydCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb24ubmV4dCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgcm91dGVzID0ge1xuICAgICAgICAgICAgICAgICcvJzoge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IExhbmRpbmcuTGFuZGluZ1BhZ2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnL2dhbGxlcnknOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nR2FsbGVyeVBhZ2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnL3N0b3JhZ2UnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nU3RvcmFnZVBhZ2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnL3NpZ25pbic6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBMYW5kaW5nLkxhbmRpbmdTaWduaW5QYWdlLFxuICAgICAgICAgICAgICAgICAgICBhbm9uOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJy9zaWdudXAnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nU2lnbnVwUGFnZSxcbiAgICAgICAgICAgICAgICAgICAgYW5vbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICcvbWFuYWdlJzoge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IExhbmRpbmcuTGFuZGluZ01hbmFnZVBhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGF1dGg6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnL21hbmFnZS1jcmVhdGUnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nTWFuYWdlQ3JlYXRlUGFnZSxcbiAgICAgICAgICAgICAgICAgICAgYXV0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICcvc2l0ZS86cG9ydGFsLzpwYWdlJzoge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IFNoZWxsLlNoZWxsUHVibGljLFxuICAgICAgICAgICAgICAgICAgICBhdXRoOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJy9tYW5hZ2UvOnBvcnRhbCc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBTaGVsbC5Mb2FkZXIsXG4gICAgICAgICAgICAgICAgICAgIGF1dGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHByaXZhdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnL21hbmFnZS86cG9ydGFsLzpwYWdlJzoge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IFNoZWxsLkxvYWRlcixcbiAgICAgICAgICAgICAgICAgICAgYXV0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcHJpdmF0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gY3JlYXRlUm91dGUocGFnZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogU2hlbGwuU2hlbGxQdWJsaWMuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2U6IHBhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRhdGEubW9kZWwpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubW9kZWwucGFnZXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFnZSA9IGRhdGEubW9kZWwucGFnZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIHJvdXRlc1twYWdlLm5hbWVdID0gY3JlYXRlUm91dGUocGFnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByb3V0ZXIubWFwKHJvdXRlcyk7XG5cbiAgICAgICAgICAgIHJvdXRlci5zdGFydChBcHAsICQoJ1tkYXRhLXZ1ZS1ib2R5XScsIGVsZW1lbnQpLmdldCgwKSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIExhbmRpbmc7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XG5cbiAgICBDb3JlLlRhYnNNaXhpbiA9IGZ1bmN0aW9uKGFjdGl2ZSkge1xuXG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHRhYnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZTogYWN0aXZlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgICAgICBhY3RpdmF0ZTogZnVuY3Rpb24odGFiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFicy5hY3RpdmUgPSB0YWI7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGlzQWN0aXZlOiBmdW5jdGlvbih0YWIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFicy5hY3RpdmUgPT0gdGFiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIENvcmUuQWN0aW9uTWl4aW4gPSBmdW5jdGlvbihNb2RhbEVkaXRvcikge1xuXG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcbiAgICAgICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgICAgICAgICAgY29udGV4dDogT2JqZWN0LFxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgbWV0aG9kczoge1xuXG4gICAgICAgICAgICAgICAgb3BlbjogZnVuY3Rpb24oY29udGV4dCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBkaWFsb2cgPSBuZXcgTW9kYWxFZGl0b3Ioe1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsczogdGhpcy5nbG9iYWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQgfHwgdGhpcy5jb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiB0aGlzLm1vZGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCkpXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vd25lci5kb0FwcGx5KHRoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KS4kbW91bnQoKS4kYXBwZW5kVG8oJCgnYm9keScpLmdldCgwKSk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGRvQXBwbHk6IGZ1bmN0aW9uKG1vZGVsKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG1vZGVsKSksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hY3Rpb246IHRoaXMubW9kZWwuX2FjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy5tb2RlbC5fYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBDb3JlLkVkaXRvck1peGluID0gZnVuY3Rpb24oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpIHtcblxuICAgICAgICByZXR1cm4ge1xuXG4gICAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG1ldGhvZHM6IHtcblxuICAgICAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBkaWFsb2cgPSBuZXcgTW9kYWxFZGl0b3Ioe1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsczogdGhpcy5nbG9iYWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudDogaXRlbSA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpIDoge31cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm93bmVyLmRvQ3JlYXRlKHRoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KS4kbW91bnQoKS4kYXBwZW5kVG8oJCgnYm9keScpLmdldCgwKSk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvUmVtb3ZlKGl0ZW0sIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IGl0ZW07XG5cbiAgICAgICAgICAgICAgICAgICAgbmV3IE1vZGFsRWRpdG9yKHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvd25lcjogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vd25lci5kb1VwZGF0ZSh0aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXQ6ICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KS4kbW91bnQoKS4kYXBwZW5kVG8oJCgnYm9keScpLmdldCgwKSk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGRvQ3JlYXRlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKE9iamVjdC5hc3NpZ24oe30sIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpLCB7IF9hY3Rpb246ICdjcmVhdGUnIH0pKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2l0ZW1zJywgJC5leHRlbmQodHJ1ZSwgW10sIHRoaXMuaXRlbXMpKTtcblxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgZG9VcGRhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcblxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMuYWN0aXZlLCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW0pKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogdGhpcy5hY3RpdmUuX2FjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy5hY3RpdmUuX2FjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ3VwZGF0ZSdcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5pdGVtcyA9ICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKTsvL3RoaXMuaXRlbXMuc2xpY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcyA9IHRoaXMuaXRlbXMuc2xpY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ3Jlc2l6ZScpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3VwZGF0ZScsIGl0ZW0sIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLiRzZXQoJ2FjdGl2ZScsIE9iamVjdC5hc3NpZ24oSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShpdGVtKSksIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIF9hY3Rpb246IHRoaXMuYWN0aXZlLl9hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICA/IHRoaXMuYWN0aXZlLl9hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICA6ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgIC8vIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gLy8gdGhpcy5pdGVtcyA9ICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKTsvL3RoaXMuaXRlbXMuc2xpY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy4kc2V0KCdpdGVtcycsICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKSk7XG4gICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5hY3RpdmUgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBkb1JlbW92ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMuaXRlbXMuaW5kZXhPZihpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLml0ZW1zW2luZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLl9hY3Rpb24gPT0gJ2NyZWF0ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLiRyZW1vdmUoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uX2FjdGlvbiA9ICdyZW1vdmUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5pdGVtcyA9ICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdpdGVtcycsICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ3Jlc2l6ZScpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAgICAgY3JlYXRlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMuY3JlYXRlKGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcbiAgICAgICAgICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy51cGRhdGUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxuICAgICAgICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24oZGF0YSkgeyB0aGlzLnJlbW92ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXG4gICAgICAgICAgICAgICAgZG9DcmVhdGU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy5kb0NyZWF0ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXG4gICAgICAgICAgICAgICAgZG9VcGRhdGU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy5kb1VwZGF0ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXG4gICAgICAgICAgICAgICAgZG9SZW1vdmU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy5kb1JlbW92ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIENvcmUuTGlzdFZpZXdlck1peGluID0ge1xuXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcbiAgICAgICAgfSxcblxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgZGF0YSkgeyB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pOyB9LFxuICAgICAgICAgICAgY3JlYXRlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7IHRoaXMuJGRpc3BhdGNoKCdjcmVhdGUnLCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHR9ICk7IH0sXG4gICAgICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHsgdGhpcy4kZGlzcGF0Y2goJ3VwZGF0ZScsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dH0gKTsgfSxcbiAgICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkgeyB0aGlzLiRkaXNwYXRjaCgncmVtb3ZlJywgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0fSApOyB9LFxuICAgICAgICB9XG4gICAgfTtcblxuICAgIENvcmUuTW9kYWxFZGl0b3JNaXhpbiA9IHtcblxuICAgICAgICBhdHRhY2hlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICQodGhpcy4kZWwpLm1vZGFsKCdzaG93Jyk7XG4gICAgICAgICAgICAkKHRoaXMuJGVsKS5vbignaGlkZS5icy5tb2RhbCcsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBkZXRhY2hlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKHRoaXMuJGVsKS5tb2RhbCgnaGlkZScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHN1Ym1pdDogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgICAgIHJlc2V0OiBmdW5jdGlvbigpIHt9XG4gICAgICAgIH1cbiAgICB9O1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSk7XG4iLCIvLyBWdWUuY29tcG9uZW50KCd2LWZvcm0nLCB7XG4vL1xuLy8gXHRwcm9wczoge1xuLy8gXHRcdGFjdGlvbjogU3RyaW5nLFxuLy8gXHRcdG1ldGhvZDogU3RyaW5nLFxuLy8gXHRcdGluaXQ6IE9iamVjdCxcbi8vIFx0XHRkb25lOiBGdW5jdGlvbixcbi8vIFx0XHRmYWlsOiBGdW5jdGlvbixcbi8vIFx0XHRtb2RlbDogT2JqZWN0LFxuLy8gXHR9LFxuLy9cbi8vIFx0Ly8gcmVwbGFjZTogZmFsc2UsXG4vL1xuLy8gXHQvLyB0ZW1wbGF0ZTogYFxuLy8gXHQvLyBcdDxmb3JtPlxuLy8gXHQvLyBcdFx0PHNsb3Q+PC9zbG90PlxuLy8gXHQvLyBcdDwvZm9ybT5cbi8vIFx0Ly8gYCxcbi8vXG4vLyBcdGFjdGl2YXRlOiBmdW5jdGlvbihkb25lKSB7XG4vL1xuLy8gXHRcdHRoaXMub3JpZ2luYWwgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpKTtcbi8vXG4vLyBcdFx0JCh0aGlzLiRlbClcbi8vXG4vLyBcdFx0XHQub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG4vLyBcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcbi8vIFx0XHRcdFx0dGhpcy5zdWJtaXQoKTtcbi8vIFx0XHRcdH0pXG4vLyBcdFx0XHQub24oJ3Jlc2V0JywgKGUpID0+IHtcbi8vIFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuLy8gXHRcdFx0XHR0aGlzLnJlc2V0KCk7XG4vLyBcdFx0XHR9KVxuLy9cbi8vIFx0XHRkb25lKCk7XG4vLyBcdH0sXG4vL1xuLy8gXHRkYXRhOiBmdW5jdGlvbigpIHtcbi8vXG4vLyBcdFx0cmV0dXJuIHtcbi8vIFx0XHRcdG1vZGVsOiB0aGlzLm1vZGVsXG4vLyBcdFx0fTtcbi8vIFx0fSxcbi8vXG4vLyBcdG1ldGhvZHM6IHtcbi8vXG4vLyBcdFx0c3VibWl0OiBmdW5jdGlvbigpIHtcbi8vXG4vLyBcdFx0XHQvLyBlLnByZXZlbnREZWZhdWx0KCk7XG4vL1xuLy8gXHRcdFx0Ly8gY29uc29sZS5sb2codGhpcy5tb2RlbCk7XG4vL1xuLy8gXHRcdFx0JC5hamF4KHtcbi8vIFx0XHRcdFx0dXJsOiB0aGlzLmFjdGlvbixcbi8vIFx0XHRcdFx0bWV0aG9kOiB0aGlzLm1ldGhvZCxcbi8vIFx0XHRcdFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuLy8gXHRcdFx0XHRkYXRhOiBKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKVxuLy8gXHRcdFx0fSlcbi8vIFx0XHRcdC5kb25lKChkKSA9PiB7XG4vLyBcdFx0XHRcdGlmIChkb25lIGluIHRoaXMpIHRoaXMuZG9uZShkKTtcbi8vIFx0XHRcdH0pXG4vLyBcdFx0XHQuZmFpbChmdW5jdGlvbihlKSB7IGlmIChmYWlsIGluIHRoaXMpIHRoaXMuZmFpbChlKTsgfS5iaW5kKHRoaXMpKVxuLy8gXHRcdH0sXG4vL1xuLy8gXHRcdHJlc2V0OiBmdW5jdGlvbigpIHtcbi8vIFx0XHRcdE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgdGhpcy5vcmlnaW5hbCk7XG4vLyBcdFx0fVxuLy8gXHR9LFxuLy8gfSk7XG4iLCIvLyBWdWUuY29tcG9uZW50KCdpbmxpbmUtdGV4dCcsXG4vLyBcdFZ1ZS5leHRlbmQoe1xuLy8gXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJyBdLFxuLy8gXHRcdHRlbXBsYXRlOiBgXG4vLyBcdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxuLy8gXHRcdFx0XHQ8aW5wdXQgY2xhc3M9XCJpbmxpbmUtY29udHJvbFwiIHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIiAvPlxuLy8gXHRcdFx0PC9kaXY+XG4vLyBcdFx0YFxuLy8gXHR9KVxuLy8gKTtcbi8vXG4vLyBWdWUuY29tcG9uZW50KCdpbmxpbmUtY2hlY2tib3gnLFxuLy8gXHRWdWUuZXh0ZW5kKHtcbi8vIFx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScgXSxcbi8vIFx0XHR0ZW1wbGF0ZTogYFxuLy8gXHRcdFx0PGRpdiBjbGFzcz1cImlubGluZS1jb250YWluZXJcIj5cbi8vIFx0XHRcdFx0PGlucHV0IGNsYXNzPVwiaW5saW5lLWNoZWNrYm94XCIgdHlwZT1cImNoZWNrYm94XCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIiAvPlxuLy8gXHRcdFx0PC9kaXY+XG4vLyBcdFx0YFxuLy8gXHR9KVxuLy8gKTtcbi8vXG4vLyBWdWUuY29tcG9uZW50KCdpbmxpbmUtc2VsZWN0Jyxcbi8vIFx0VnVlLmV4dGVuZCh7XG4vLyBcdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnLCAnb3B0aW9ucycgXSxcbi8vIFx0XHR0ZW1wbGF0ZTogYFxuLy8gXHRcdFx0PGRpdiBjbGFzcz1cImlubGluZS1jb250YWluZXJcIj5cbi8vIFx0XHRcdFx0PHNlbGVjdCBjbGFzcz1cImlubGluZS1jb250cm9sMVwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCI+XG4vLyBcdFx0XHRcdFx0PG9wdGlvbiB2LWZvcj1cIm9wdGlvbiBpbiBvcHRpb25zXCIgdmFsdWU9XCJ7eyBvcHRpb24ua2V5IH19XCI+e3sgb3B0aW9uLnZhbHVlIH19PC9vcHRpb24+XG4vLyBcdFx0XHRcdDwvc2VsZWN0PlxuLy8gXHRcdFx0PC9kaXY+XG4vLyBcdFx0YFxuLy8gXHR9KVxuLy8gKTtcbi8vXG4vLyBWdWUuY29tcG9uZW50KCdpbmxpbmUtdmFsdWUnLFxuLy8gXHRWdWUuZXh0ZW5kKHtcbi8vIFx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScsICdjbGFzcycgXSxcbi8vIFx0XHR0ZW1wbGF0ZTogYFxuLy8gXHRcdFx0PGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiIC8+XG4vLyBcdFx0XHQ8c3BhbiA6Y2xhc3M9XCJjbGFzc1wiPnt7IHZhbHVlIH19PC9zcGFuPlxuLy8gXHRcdGBcbi8vIFx0fSlcbi8vICk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBDb3JlLldpZGdldE1peGluID0ge1xuXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXG4gICAgICAgICAgICBzdG9yYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxuICAgICAgICAgICAgYmluZGluZ3M6IE9iamVjdCxcbiAgICAgICAgICAgIGNoaWxkcmVuOiBBcnJheSxcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxuICAgICAgICB9LFxuXG4gICAgICAgIGRhdGE6ICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3lzdGVtSWQ6IHRoaXMuc3lzdGVtSWQsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHRoaXMucmFuZG9tSWQgPSBWdWUuc2VydmljZSgncGFsZXR0ZScpLmdlbmVyYXRlSWQoJ3dpZGdldC0nKTtcblxuICAgICAgICAgICAgLy8gVE9ETyDQo9GB0YLQsNC90L7QstC40YLRjCDRgNCw0LfQvNC10YDRiyDRgNC+0LTQuNGC0LXQu9GM0YHQutC+0Lkg0Y/Rh9C10LnQutC4XG5cbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdiaW5kaW5ncy5pZCcsIGZ1bmN0aW9uKHZhbHVlKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zeXN0ZW1JZCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3lzdGVtSWQgPSB0aGlzLnJhbmRvbUlkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQ29yZS5TdGFja2VkTWl4aW4gPSB7XG5cbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXG4gICAgICAgICAgICBzdG9yYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcbiAgICAgICAgICAgIGNoaWxkcmVuOiBBcnJheSxcbiAgICAgICAgfSxcblxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3RhY2tJZDogdGhpcy5zdGFja0lkLFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgIHRoaXMuc3RhY2tJZCA9IFZ1ZS5zZXJ2aWNlKCdwYWxldHRlJykuZ2VuZXJhdGVJZCgnc3RhY2stJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIvLyBWdWUuY29tcG9uZW50KCdtb2RhbCcsIHtcbi8vXG4vLyAgICAgcHJvcHM6IHtcbi8vICAgICAgICAgaWQ6IFN0cmluZyxcbi8vICAgICAgICAgY3VycmVudDogT2JqZWN0LFxuLy8gICAgICAgICBvcmlnaW5hbDogT2JqZWN0LFxuLy8gICAgIH0sXG4vL1xuLy8gICAgIG1ldGhvZHM6IHtcbi8vXG4vLyAgICAgICAgIHN1Ym1pdDogZnVuY3Rpb24oZSkge1xuLy8gICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goJ3N1Ym1pdCcsIHRoaXMuY3VycmVudCk7XG4vLyAgICAgICAgICAgICAvLyBPYmplY3QuYXNzaWduKHRoaXMub3JpZ2luYWwsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5jdXJyZW50KSkpO1xuLy8gICAgICAgICAgICAgJChlLnRhcmdldCkuY2xvc2VzdCgnLm1vZGFsJykubW9kYWwoJ2hpZGUnKTtcbi8vICAgICAgICAgfSxcbi8vXG4vLyAgICAgICAgIHJlc2V0OiBmdW5jdGlvbihlKSB7XG4vLyAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaCgncmVzZXQnLCB0aGlzLmN1cnJlbnQpO1xuLy8gICAgICAgICAgICAgLy8gT2JqZWN0LmFzc2lnbih0aGlzLmN1cnJlbnQsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5vcmlnaW5hbCkpKTtcbi8vICAgICAgICAgICAgICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XG4vLyAgICAgICAgIH1cbi8vICAgICB9XG4vLyB9KTtcbiIsIihmdW5jdGlvbiAoJCwgd2luZG93LCBwbHVnaW5OYW1lLCB1bmRlZmluZWQpIHtcblxuICAgIHZhciBkZWZhdWx0cyA9IHtcblxuICAgICAgICBkcmFnOiB0cnVlLFxuICAgICAgICBkcm9wOiB0cnVlLFxuICAgICAgICB2ZXJ0aWNhbDogdHJ1ZSxcblxuICAgICAgICBjb250YWluZXJTZWxlY3RvcjogXCJvbCwgdWxcIixcbiAgICAgICAgaXRlbVNlbGVjdG9yOiBcImxpXCIsXG4gICAgICAgIGV4Y2x1ZGVTZWxlY3RvcjogXCJcIixcblxuICAgICAgICBib2R5Q2xhc3M6IFwiZHJhZ2dpbmdcIixcbiAgICAgICAgYWN0aXZlQ2xhc3M6IFwiYWN0aXZlXCIsXG4gICAgICAgIGRyYWdnZWRDbGFzczogXCJkcmFnZ2VkXCIsXG4gICAgICAgIHZlcnRpY2FsQ2xhc3M6IFwidmVydGljYWxcIixcbiAgICAgICAgaG9yaXNvbnRhbENsYXNzOiBcImhvcmlzb250YWxcIixcbiAgICAgICAgcGxhY2Vob2xkZXJDbGFzczogXCJwbGFjZWhvbGRlclwiLFxuXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnPGxpIGNsYXNzPVwicGxhY2Vob2xkZXJcIj48L2xpPicsXG5cbiAgICAgICAgb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKGNvbnRleHQsIGV2ZW50LCBfc3VwZXIpIHtcblxuICAgICAgICAgICAgdmFyIHNpemUgPSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBjb250ZXh0LiRpdGVtLm91dGVySGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgd2lkdGg6IGNvbnRleHQuJGl0ZW0ub3V0ZXJXaWR0aCgpLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29udGV4dC4kb3JpZ2luYWxJdGVtID0gY29udGV4dC4kaXRlbTtcblxuICAgICAgICAgICAgY29udGV4dC4kaXRlbSA9IGNvbnRleHQuJG9yaWdpbmFsSXRlbVxuICAgICAgICAgICAgICAgIC5jbG9uZSgpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKGNvbnRleHQuc29ydGFibGUub3B0aW9ucy5kcmFnZ2VkQ2xhc3MpXG4gICAgICAgICAgICAgICAgLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBldmVudC5wYWdlWCAtIGNvbnRleHQuYWRqdXN0bWVudC5sZWZ0LFxuICAgICAgICAgICAgICAgICAgICB0b3A6IGV2ZW50LnBhZ2VZIC0gY29udGV4dC5hZGp1c3RtZW50LnRvcCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHNpemUuc2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogc2l6ZS5oZWlnaHQsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuYXBwZW5kVG8oY29udGV4dC4kcGFyZW50KVxuICAgICAgICAgICAgO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJhZzogZnVuY3Rpb24oY29udGV4dCwgZXZlbnQsIF9zdXBlcikge1xuXG4gICAgICAgICAgICBjb250ZXh0LiRpdGVtLmNzcyh7XG4gICAgICAgICAgICAgICAgbGVmdDogZXZlbnQucGFnZVggLSBjb250ZXh0LmFkanVzdG1lbnQubGVmdCxcbiAgICAgICAgICAgICAgICB0b3A6IGV2ZW50LnBhZ2VZIC0gY29udGV4dC5hZGp1c3RtZW50LnRvcCxcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgb25Ecm9wOiBmdW5jdGlvbihjb250ZXh0LCBldmVudCwgX3N1cGVyKSB7XG5cbiAgICAgICAgICAgIGNvbnRleHQuJGl0ZW0ucmVtb3ZlKCk7XG4gICAgICAgICAgICBpZiAoY29udGV4dC5sb2NhdGlvbikge1xuXG4gICAgICAgICAgICAgICAgY29udGV4dC4kaXRlbSA9IGNvbnRleHQubG9jYXRpb24uYmVmb3JlXG4gICAgICAgICAgICAgICAgICAgID8gY29udGV4dC4kaXRlbS5pbnNlcnRCZWZvcmUoY29udGV4dC5sb2NhdGlvbi4kaXRlbSlcbiAgICAgICAgICAgICAgICAgICAgOiBjb250ZXh0LiRpdGVtLmluc2VydEFmdGVyKGNvbnRleHQubG9jYXRpb24uJGl0ZW0pXG4gICAgICAgICAgICAgICAgO1xuXG4gICAgICAgICAgICAgICAgY29udGV4dC4kaXRlbS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJycsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6ICcnLFxuICAgICAgICAgICAgICAgICAgICB0b3A6ICcnLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogJycsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJycsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuICAgIH07XG5cbiAgICB2YXIgY29udGV4dCA9IG51bGw7XG4gICAgdmFyIHNvcnRhYmxlcyA9IFtdO1xuXG4gICAgZnVuY3Rpb24gU29ydGFibGUoJGVsZW1lbnQsIG9wdGlvbnMpIHtcblxuICAgICAgICB0aGlzLiRlbGVtZW50ID0gJGVsZW1lbnQ7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgICAgICAgJGVsZW1lbnQub24oJ21vdXNlZG93bi5zb3J0YWJsZScsIHRoaXMub3B0aW9ucy5pdGVtU2VsZWN0b3IsIChlKSA9PiB7IHRoaXMuaGFuZGxlU3RhcnQoZSk7IH0pO1xuXG4gICAgICAgIHRoaXMuZHJhZ2dhYmxlID0gbnVsbDtcblxuICAgICAgICBzb3J0YWJsZXMucHVzaCh0aGlzKTtcbiAgICB9XG5cbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAgICAgJChkb2N1bWVudClcbiAgICAgICAgICAgIC5vbignbW91c2V1cC5zb3J0YWJsZScsIChlKSA9PiB7IGNvbnRleHQgJiYgY29udGV4dC5zb3J0YWJsZS5oYW5kbGVFbmQoZSwgY29udGV4dCk7IH0pXG4gICAgICAgICAgICAub24oJ21vdXNlbW92ZS5zb3J0YWJsZScsIChlKSA9PiB7IGNvbnRleHQgJiYgY29udGV4dC5zb3J0YWJsZS5oYW5kbGVEcmFnKGUsIGNvbnRleHQpOyB9KVxuICAgICAgICA7XG4gICAgfSk7XG5cbiAgICBTb3J0YWJsZS5wcm90b3R5cGUgPSB7XG5cbiAgICAgICAgZHJvcExvY2F0aW9uOiBmdW5jdGlvbihlKSB7XG5cbiAgICAgICAgICAgIHZhciAkaXRlbTtcbiAgICAgICAgICAgIHZhciBzb3J0YWJsZTtcblxuICAgICAgICAgICAgaWYgKGNvbnRleHQpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkaXNwbGF5ID0gY29udGV4dC4kaXRlbS5jc3MoJ2Rpc3BsYXknKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0LiRpdGVtLmNzcyh7IGRpc3BsYXk6ICdub25lJywgfSk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvcnRhYmxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcyA9IHNvcnRhYmxlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHMub3B0aW9ucy5kcm9wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkcmVzdWx0ID0gJChkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KGUucGFnZVgsIGUucGFnZVkpKS5jbG9zZXN0KHMub3B0aW9ucy5pdGVtU2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRyZXN1bHQubGVuZ3RoICYmICRyZXN1bHQuY2xvc2VzdChzLiRlbGVtZW50KS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaXRlbSA9ICRyZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGUgPSBzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29udGV4dC4kaXRlbS5jc3MoeyBkaXNwbGF5OiBkaXNwbGF5LCB9KTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc29ydGFibGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzID0gc29ydGFibGVzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAocy5vcHRpb25zLmRyb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRyZXN1bHQgPSAkKGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZS5wYWdlWCwgZS5wYWdlWSkpLmNsb3Nlc3Qocy5vcHRpb25zLml0ZW1TZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHJlc3VsdC5sZW5ndGggJiYgJHJlc3VsdC5jbG9zZXN0KHMuJGVsZW1lbnQpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtID0gJHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZSA9IHM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzb3J0YWJsZSAmJiAkaXRlbSAmJiAkaXRlbS5sZW5ndGgpIHtcblxuICAgICAgICAgICAgICAgIHZhciAkY29udGFpbmVyID0gJGl0ZW0uY2xvc2VzdChzb3J0YWJsZS5vcHRpb25zLmNvbnRhaW5lclNlbGVjdG9yKTtcblxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkaXRlbS5vZmZzZXQoKTtcbiAgICAgICAgICAgICAgICB2YXIgc2l6ZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICRpdGVtLm91dGVyV2lkdGgoKSxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAkaXRlbS5vdXRlckhlaWdodCgpLFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB2YXIgb3JpZW50YXRpb24gPSB0aGlzLm9wdGlvbnMudmVydGljYWxcbiAgICAgICAgICAgICAgICAgICAgPyAkY29udGFpbmVyLmhhc0NsYXNzKHNvcnRhYmxlLm9wdGlvbnMuaG9yaXNvbnRhbENsYXNzKSA/ICdoJyA6ICd2J1xuICAgICAgICAgICAgICAgICAgICA6ICRjb250YWluZXIuaGFzQ2xhc3Moc29ydGFibGUub3B0aW9ucy52ZXJ0aWNhbENsYXNzKSA/ICd2JyA6ICdoJ1xuICAgICAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgICAgIHZhciBiZWZvcmUgPSAob3JpZW50YXRpb24gPT0gJ2gnKVxuICAgICAgICAgICAgICAgICAgICA/IGUucGFnZVggLSBvZmZzZXQubGVmdCA8IHNpemUud2lkdGggLyAyXG4gICAgICAgICAgICAgICAgICAgIDogZS5wYWdlWSAtIG9mZnNldC50b3AgPCBzaXplLmhlaWdodCAvIDJcbiAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAkaXRlbTogJGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICRjb250YWluZXI6ICRjb250YWluZXIsXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlOiBzb3J0YWJsZSxcbiAgICAgICAgICAgICAgICAgICAgYmVmb3JlOiBiZWZvcmUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGFuZGxlU3RhcnQ6IGZ1bmN0aW9uKGUpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5leGNsdWRlU2VsZWN0b3IgJiYgJChlLnRhcmdldCkuY2xvc2VzdCh0aGlzLm9wdGlvbnMuZXhjbHVkZVNlbGVjdG9yKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgaWYgKCFjb250ZXh0KSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgJGl0ZW0gPSAkKGUudGFyZ2V0KS5jbG9zZXN0KHRoaXMub3B0aW9ucy5pdGVtU2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgIHZhciAkcGFyZW50ID0gJGl0ZW0ucGFyZW50KCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gJGl0ZW0ub2Zmc2V0KCk7XG4gICAgICAgICAgICAgICAgLy8gaWYgKCFvZmZzZXQpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coJGl0ZW0sICk7XG4gICAgICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGU6IHRoaXMsXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiAkaXRlbS5pbmRleCgpLFxuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyOiAkaXRlbS5jbG9zZXN0KHRoaXMub3B0aW9ucy5jb250YWluZXJTZWxlY3RvciksXG4gICAgICAgICAgICAgICAgICAgICRwYXJlbnQ6ICRpdGVtLnBhcmVudCgpLFxuICAgICAgICAgICAgICAgICAgICAkaXRlbTogJGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICRvcmlnaW5hbEl0ZW06ICRpdGVtLFxuICAgICAgICAgICAgICAgICAgICAkdGFyZ2V0SXRlbTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgJHRhcmdldENvbnRhaW5lcjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb246IHRoaXMuZHJvcExvY2F0aW9uKGUpLFxuICAgICAgICAgICAgICAgICAgICBhZGp1c3RtZW50OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiBlLmNsaWVudFggLSBvZmZzZXQubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogZS5jbGllbnRZIC0gb2Zmc2V0LnRvcCxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uRHJhZ1N0YXJ0KGNvbnRleHQsIGUsIGRlZmF1bHRzLm9uRHJhZ1N0YXJ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBoYW5kbGVFbmQ6IGZ1bmN0aW9uKGUpIHtcblxuICAgICAgICAgICAgaWYgKGNvbnRleHQpIHtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc29ydGFibGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3J0YWJsZSA9IHNvcnRhYmxlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgJChzb3J0YWJsZS5vcHRpb25zLmNvbnRhaW5lclNlbGVjdG9yLCBzb3J0YWJsZS4kZWxlbWVudCkucmVtb3ZlQ2xhc3Moc29ydGFibGUub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHQuJHBsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuJHBsYWNlaG9sZGVyLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnRleHQubG9jYXRpb24gPSB0aGlzLmRyb3BMb2NhdGlvbihlKTtcbiAgICAgICAgICAgICAgICBpZiAoY29udGV4dC5sb2NhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxvY2F0aW9uLnNvcnRhYmxlLm9wdGlvbnMub25Ecm9wKGNvbnRleHQsIGUsIGRlZmF1bHRzLm9uRHJvcCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC4kaXRlbS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBoYW5kbGVEcmFnOiBmdW5jdGlvbihlKSB7XG5cbiAgICAgICAgICAgIGlmIChjb250ZXh0KSB7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvcnRhYmxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc29ydGFibGUgPSBzb3J0YWJsZXNbaV07XG4gICAgICAgICAgICAgICAgICAgICQodGhpcy5vcHRpb25zLmNvbnRhaW5lclNlbGVjdG9yLCBzb3J0YWJsZS4kZWxlbWVudCkucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY29udGV4dC4kcGxhY2Vob2xkZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC4kcGxhY2Vob2xkZXIucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29udGV4dC5sb2NhdGlvbiA9IHRoaXMuZHJvcExvY2F0aW9uKGUpO1xuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0LmxvY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubG9jYXRpb24uJGNvbnRhaW5lci5hZGRDbGFzcyhjb250ZXh0LmxvY2F0aW9uLnNvcnRhYmxlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LiRwbGFjZWhvbGRlciA9IGNvbnRleHQubG9jYXRpb24uYmVmb3JlXG4gICAgICAgICAgICAgICAgICAgICAgICA/ICQoY29udGV4dC5sb2NhdGlvbi5zb3J0YWJsZS5vcHRpb25zLnBsYWNlaG9sZGVyKS5pbnNlcnRCZWZvcmUoY29udGV4dC5sb2NhdGlvbi4kaXRlbSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogJChjb250ZXh0LmxvY2F0aW9uLnNvcnRhYmxlLm9wdGlvbnMucGxhY2Vob2xkZXIpLmluc2VydEFmdGVyKGNvbnRleHQubG9jYXRpb24uJGl0ZW0pXG4gICAgICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb250ZXh0LnNvcnRhYmxlLm9wdGlvbnMub25EcmFnKGNvbnRleHQsIGUsIGRlZmF1bHRzLm9uRHJhZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIHZhciBBUEkgPSAkLmV4dGVuZChTb3J0YWJsZS5wcm90b3R5cGUsIHtcblxuICAgICAgICBlbmFibGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB9LFxuICAgICAgICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIH0sXG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJC5mbltwbHVnaW5OYW1lXSA9IGZ1bmN0aW9uKG1ldGhvZE9yT3B0aW9ucykge1xuXG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciAkdCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgb2JqZWN0ID0gJHQuZGF0YShwbHVnaW5OYW1lKVxuICAgICAgICAgICAgO1xuXG4gICAgICAgICAgICBpZiAob2JqZWN0ICYmIEFQSVttZXRob2RPck9wdGlvbnNdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEFQSVttZXRob2RPck9wdGlvbnNdLmFwcGx5KG9iamVjdCwgYXJncykgfHwgdGhpcztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIW9iamVjdCAmJiAobWV0aG9kT3JPcHRpb25zID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIG1ldGhvZE9yT3B0aW9ucyA9PT0gXCJvYmplY3RcIikpIHtcbiAgICAgICAgICAgICAgICAkdC5kYXRhKHBsdWdpbk5hbWUsIG5ldyBTb3J0YWJsZSgkdCwgbWV0aG9kT3JPcHRpb25zKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG59KShqUXVlcnksIHdpbmRvdywgJ3NvcnRhYmxlJyk7XG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xuXG4gICAgVnVlLmRpcmVjdGl2ZSgnYWZmaXgnLCB7XG5cbiAgICAgICAgYmluZDogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBpZiAoJC5mbi5hZmZpeCkge1xuICAgICAgICAgICAgICAgICQodGhpcy5lbCkuYWZmaXgodGhpcy52bS4kZ2V0KHRoaXMuZXhwcmVzc2lvbikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgfSxcbiAgICAgICAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBDb3JlKSB7XG5cbiAgICBWdWUuZGlyZWN0aXZlKCdjb21ibycsIHtcblxuICAgICAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIGlmICgkLmZuLnRhZ3NpbnB1dCkge1xuXG4gICAgICAgICAgICAgICAgJCh0aGlzLmVsKS5zZWxlY3QyKHtcbiAgICAgICAgICAgICAgICAgICAgdGFnczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbXVsdGlwbGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVUYWc6IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHBhcmFtcy50ZXJtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IHBhcmFtcy50ZXJtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld09wdGlvbjogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgfSxcbiAgICAgICAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBDb3JlKSB7XG5cbiAgICBWdWUuZGlyZWN0aXZlKCdkYXRlJywge1xuXG4gICAgICAgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgaWYgKCQuZm4uZGF0ZXBpY2tlcikge1xuXG4gICAgICAgICAgICAgICAgJCh0aGlzLmVsKS5kYXRlcGlja2VyKHtcbiAgICAgICAgICAgICAgICAgICAgYXV0b2Nsb3NlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB0b2RheUhpZ2hsaWdodDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiBcInl5eXktbW0tZGRcIlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgfSxcbiAgICAgICAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBDb3JlKSB7XG5cbiAgICBWdWUuZGlyZWN0aXZlKCdyaWNoJywge1xuXG4gICAgICAgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgaWYgKHdpbmRvdy5DS0VESVRPUikge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0b3IgPSBDS0VESVRPUi5pbmxpbmUodGhpcy5lbCwge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZXNTZXQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ0JvbGRlcicsIGVsZW1lbnQ6ICdzcGFuJywgYXR0cmlidXRlczogeyAnY2xhc3MnOiAnZXh0cmFib2xkJ30gfVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICB0b29sYmFyR3JvdXBzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB7IG5hbWU6ICdjbGlwYm9hcmQnLCAgIGdyb3VwczogWyAnY2xpcGJvYXJkJywgJ3VuZG8nIF0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHsgbmFtZTogJ2VkaXRpbmcnLCAgICAgZ3JvdXBzOiBbICdmaW5kJywgJ3NlbGVjdGlvbicsICdzcGVsbGNoZWNrZXInIF0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2xpbmtzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8geyBuYW1lOiAnZm9ybXMnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ3Rvb2xzJ30sXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ2RvY3VtZW50JywgZ3JvdXBzOiBbJ21vZGUnLCAnZG9jdW1lbnQnLCAnZG9jdG9vbHMnXX0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ290aGVycyd9LFxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6ICdwYXJhZ3JhcGgnLCBncm91cHM6IFsnbGlzdCcsICdpbmRlbnQnLCAnYmxvY2tzJywgJ2FsaWduJ119LFxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6ICdjb2xvcnMnfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnYmFzaWNzdHlsZXMnLCBncm91cHM6IFsnYmFzaWNzdHlsZXMnLCAnY2xlYW51cCddfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnc3R5bGVzJ30sXG4gICAgICAgICAgICAgICAgICAgICAgICAnLycsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdpbnNlcnQnLCBncm91cHM6IFsgJ0ltYWdlQnV0dG9uJyBdICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3tuYW1lOiAnYWJvdXQnfVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmVkaXRvci5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWRpdG9yLnVwZGF0ZUVsZW1lbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52bS4kc2V0KHRoaXMuZXhwcmVzc2lvbiwgJCh0aGlzLmVsKS52YWwoKSk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNldERhdGEodGhpcy52bS4kZ2V0KHRoaXMuZXhwcmVzc2lvbikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3VwZGF0ZScsIG5ld1ZhbHVlLCBvbGRWYWx1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5kZXN0cm95KCk7XG4gICAgICAgICAgICB0aGlzLmVkaXRvciA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnRleHRhcmVhID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQgPSBudWxsO1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xuXG4gICAgVnVlLmRpcmVjdGl2ZSgnc2Nyb2xsYWJsZScsIHtcblxuICAgICAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIC8vICQodGhpcy5lbCkuY3NzKHtcbiAgICAgICAgICAgIC8vICAgICAnb3ZlcmZsb3cnOiAnYXV0bycsXG4gICAgICAgICAgICAvLyB9KTtcblxuICAgICAgICAgICAgaWYgKCQuZm4ucGVyZmVjdFNjcm9sbGJhcikge1xuICAgICAgICAgICAgICAgIFZ1ZS5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzLmVsKS5wZXJmZWN0U2Nyb2xsYmFyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGF4aXM6IHRoaXMuZXhwcmVzc2lvblxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICB9LFxuICAgICAgICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIENvcmUpIHtcblxuICAgIFZ1ZS5kaXJlY3RpdmUoJ3RhZ3MnLCB7XG5cbiAgICAgICAgYmluZDogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBpZiAoJC5mbi50YWdzaW5wdXQpIHtcblxuICAgICAgICAgICAgICAgICQodGhpcy5lbCkudGFnc2lucHV0KHtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgIH0sXG4gICAgICAgIHVuYmluZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xuXG4gICAgVnVlLmZpbHRlcignanNvblBhdGgnLCBmdW5jdGlvbiAoY29udGV4dCwgc3RyKSB7XG4gICAgICAgIGlmIChzdHIgPT09IHVuZGVmaW5lZCB8fCBjb250ZXh0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZSA9IC97KFtefV0rKX0vZztcblxuICAgICAgICByZXN1bHQgPSBzdHIucmVwbGFjZShyZSwgZnVuY3Rpb24obWF0Y2gsIGV4cHIpIHtcbiAgICAgICAgICAgIGpzb24gPSBKU09OUGF0aCh7XG4gICAgICAgICAgICAgICAganNvbjogY29udGV4dCxcbiAgICAgICAgICAgICAgICBwYXRoOiBleHByXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChqc29uLmhhc093blByb3BlcnR5KDEpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdhcnJheSc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBqc29uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocmVzdWx0ID09ICdhcnJheScpIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OUGF0aCh7XG4gICAgICAgICAgICAgICAganNvbjogY29udGV4dCxcbiAgICAgICAgICAgICAgICBwYXRoOiBzdHIucmVwbGFjZShyZSwgXCIkMVwiKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBWdWUuZmlsdGVyKCd0ZW1wbGF0ZScsIGZ1bmN0aW9uIChzdHJpbmcsIGRhdGEpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciByZSA9IC8keyhbXn1dKyl9L2c7XG4gICAgICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShyZSwgZnVuY3Rpb24obWF0Y2gsIGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGFba2V5XTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBWdWUuZmlsdGVyKCdhc3NpZ24nLCBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UxLCBzb3VyY2UyLCBzb3VyY2UzKSB7XG5cbiAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UxLCBzb3VyY2UyLCBzb3VyY2UzKTtcbiAgICB9KTtcblxuICAgIFZ1ZS5maWx0ZXIoJ2NvcHknLCBmdW5jdGlvbiAoc291cmNlKSB7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBWdWUoe1xuICAgICAgICAgICAgZGF0YTogc291cmNlICE9IG51bGxcbiAgICAgICAgICAgICAgICA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc291cmNlKSlcbiAgICAgICAgICAgICAgICA6IG51bGxcbiAgICAgICAgfSkuJGRhdGE7XG4gICAgfSk7XG5cbiAgICBWdWUuZmlsdGVyKCdjbG9uZScsIGZ1bmN0aW9uIChzb3VyY2UpIHtcblxuICAgICAgICByZXR1cm4gbmV3IFZ1ZSh7XG4gICAgICAgICAgICBkYXRhOiBzb3VyY2UgIT0gbnVsbFxuICAgICAgICAgICAgICAgID8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzb3VyY2UpKVxuICAgICAgICAgICAgICAgIDogbnVsbFxuICAgICAgICB9KS4kZGF0YTtcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBDb3JlKSB7XG5cbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblxuICAgICAgICBmdW5jdGlvbiByZXBvc2l0aW9uKGVsZW1lbnQpIHtcblxuICAgICAgICAgICAgdmFyIG1vZGFsID0gJChlbGVtZW50KSxcbiAgICAgICAgICAgICAgICBkaWFsb2cgPSAkKCcubW9kYWwtZGlhbG9nJywgbW9kYWwpO1xuXG4gICAgICAgICAgICBtb2RhbC5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgICAgICAgICAgIGRpYWxvZy5jc3MoXCJtYXJnaW4tdG9wXCIsIE1hdGgubWF4KDAsICgkKHdpbmRvdykuaGVpZ2h0KCkgLSBkaWFsb2cuaGVpZ2h0KCkpIC8gMikpO1xuICAgICAgICB9XG5cbiAgICAgICAgJCgkKGRvY3VtZW50KSwgJy5tb2RhbC5tb2RhbC1jZW50ZXInKS5vbignc2hvdy5icy5tb2RhbCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHJlcG9zaXRpb24oZS50YXJnZXQpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsICgpID0+IHtcbiAgICAgICAgICAgICQoJy5tb2RhbC5tb2RhbC1jZW50ZXI6dmlzaWJsZScpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICByZXBvc2l0aW9uKGVsZW1lbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG59KShqUXVlcnksIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLnVzZSh7XG5cbiAgICAgICAgaW5zdGFsbDogZnVuY3Rpb24oVnVlLCBvcHRpb25zKSB7XG5cbiAgICAgICAgICAgIHZhciBzZXJ2aWNlcyA9IHt9O1xuXG4gICAgICAgICAgICBWdWUuc2VydmljZSA9IGZ1bmN0aW9uKG5hbWUsIHNlcnZpY2UpIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiBzZXJ2aWNlc1tuYW1lXSA9IHNlcnZpY2VzW25hbWVdIHx8IHNlcnZpY2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBDb3JlKSB7XG5cbiAgICBWdWUudmFsaWRhdG9yKCdlbWFpbCcsIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgIHJldHVybiAvXigoW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKyhcXC5bXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKSopfChcXFwiLitcXFwiKSlAKChcXFtbMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFxdKXwoKFthLXpBLVpcXC0wLTldK1xcLikrW2EtekEtWl17Mix9KSkkLy50ZXN0KHZhbClcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBDb3JlKTtcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsKSB7XG5cbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2JpbmRpbmdzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjYmluZGluZ3MtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgc2V0U3RyYXRlZ3k6IGZ1bmN0aW9uKHN0cmF0ZWd5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdjdXJyZW50LmJpbmRpbmcuc3RyYXRlZ3knLCBzdHJhdGVneSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0U3RyYXRlZ3k6IGZ1bmN0aW9uKHN0cmF0ZWd5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGdldCgnY3VycmVudC5iaW5kaW5nLnN0cmF0ZWd5Jyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5jdXJyZW50LmJpbmRpbmcpIHRoaXMuY3VycmVudC5iaW5kaW5nID0ge307XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB2YXIgRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdiaW5kaW5ncycsIHtcblxuICAgICAgICBtaXhpbnM6IFtDb3JlLkFjdGlvbk1peGluKE1vZGFsRWRpdG9yKV0sXG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgdmFyIExpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZG9tYWlucy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdkb21haW5zLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZG9tYWlucy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJyldLFxuICAgIH0pO1xuXG4gICAgdmFyIEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihMaXN0Vmlld2VyLCBNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zJyxcbiAgICB9KTtcblxuXG4gICAgdmFyIFNldHRpbmdzTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1zZXR0aW5ncy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLXNldHRpbmdzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU2V0dGluZ3NNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1zZXR0aW5ncy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtc2V0dGluZ3MtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTZXR0aW5nc0VkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1zZXR0aW5ncycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTZXR0aW5nc0xpc3RWaWV3ZXIsIFNldHRpbmdzTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjZG9tYWlucy1zZXR0aW5ncycsXG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgdmFyIExpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignbWFpbicpXSxcbiAgICB9KTtcblxuICAgIHZhciBFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzJyxcbiAgICB9KTtcblxuXG4gICAgdmFyIFNldHRpbmdzTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc2V0dGluZ3MtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc2V0dGluZ3MtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTZXR0aW5nc01vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zZXR0aW5ncy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNldHRpbmdzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU2V0dGluZ3NFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNldHRpbmdzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFNldHRpbmdzTGlzdFZpZXdlciwgU2V0dGluZ3NNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zZXR0aW5ncycsXG4gICAgfSk7XG5cblxuICAgIHZhciBNZXRhc0xpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLW1ldGFzLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLW1ldGFzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgTWV0YXNNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtbWV0YXMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1tZXRhcy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIE1ldGFzRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1tZXRhcycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihNZXRhc0xpc3RWaWV3ZXIsIE1ldGFzTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtbWV0YXMnLFxuICAgIH0pO1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBQYXJhbVZhcmlhYmxlID1cbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtdmFyaWFibGUnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy12YXJpYWJsZScsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBpZDogU3RyaW5nLFxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgUGFyYW1TdHJpbmcgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1zdHJpbmcnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1zdHJpbmcnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgaWQ6IFN0cmluZyxcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIFBhcmFtU2VsZWN0ID1cbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtc2VsZWN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtc2VsZWN0JyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGlkOiBTdHJpbmcsXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBQYXJhbVJpY2ggPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1yaWNoJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtcmljaCcsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBpZDogU3RyaW5nLFxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgUGFyYW1Tb3VyY2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1zb3VyY2UnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1zb3VyY2UnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgaWQ6IFN0cmluZyxcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIFBhcmFtTXVsdGlwbGUgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1tdWx0aXBsZScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLW11bHRpcGxlJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGlkOiBTdHJpbmcsXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtLml0ZW1zXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB2YXIgUGFyYW1PYmplY3QgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1vYmplY3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1vYmplY3QnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgaWQ6IFN0cmluZyxcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIHZhciBQYXJhbXMgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIG93bmVyOiBPYmplY3QsXG4gICAgICAgICAgICB0YWI6IFN0cmluZyxcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxuICAgICAgICB9XG4gICAgfSk7XG5cblxuICAgIHZhciBQYXJhbU11bHRpcGxlTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLW11bHRpcGxlLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1tdWx0aXBsZS1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgcHJvcDogT2JqZWN0LFxuICAgICAgICAgICAgcGFyYW06IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgZ2V0TGFiZWw6IGZ1bmN0aW9uKGl0ZW0pIHtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3AuZGlzcGxheSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdm0gPSBuZXcgVnVlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdm0uJGludGVycG9sYXRlKHRoaXMucHJvcC5kaXNwbGF5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICc8aXRlbT4nO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIFBhcmFtQmluZGluZ3NNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLWJpbmRpbmdzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLWJpbmRpbmdzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogWyBDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdiaW5kaW5nJykgXSxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLml0ZW1zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xuXG4gICAgICAgICAgICB2YXIgYmluZGluZyA9IHRoaXMuY3VycmVudC5iaW5kaW5nIHx8IHt9O1xuICAgICAgICAgICAgaWYgKCFiaW5kaW5nLnN0cmF0ZWd5KSBiaW5kaW5nLnN0cmF0ZWd5ID0gJ2ludGVycG9sYXRlJztcblxuICAgICAgICAgICAgYmluZGluZy5wYXJhbXMgPSBiaW5kaW5nLnBhcmFtcyB8fCB7fTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuY29udGV4dC5wcm9wLnByb3BzKSB7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGV4dC5wcm9wLnByb3BzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb3AgPSB0aGlzLmNvbnRleHQucHJvcC5wcm9wc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gdGhpcy5jdXJyZW50LnZhbHVlW3Byb3AubmFtZV0gPSB0aGlzLmN1cnJlbnQudmFsdWVbcHJvcC5uYW1lXSB8fCB7fTtcblxuICAgICAgICAgICAgICAgICAgICBwYXJhbS5fYWN0aW9uID0gcGFyYW0uX2FjdGlvbiA9PSAndXBkYXRlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgPyAndXBkYXRlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgOiAnY3JlYXRlJ1xuICAgICAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBwcm9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW06IHBhcmFtLFxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2N1cnJlbnQuYmluZGluZycsIGJpbmRpbmcpO1xuICAgICAgICAgICAgdGhpcy4kc2V0KCdpdGVtcycsIGl0ZW1zKTtcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgc2V0U3RyYXRlZ3k6IGZ1bmN0aW9uKHN0cmF0ZWd5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdjdXJyZW50LmJpbmRpbmcuc3RyYXRlZ3knLCBzdHJhdGVneSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0U3RyYXRlZ3k6IGZ1bmN0aW9uKHN0cmF0ZWd5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGdldCgnY3VycmVudC5iaW5kaW5nLnN0cmF0ZWd5Jyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgdmFyIEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLWJpbmRpbmdzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkFjdGlvbk1peGluKFBhcmFtQmluZGluZ3NNb2RhbEVkaXRvcildLFxuICAgIH0pO1xuXG4gICAgdmFyIFBhcmFtTXVsdGlwbGVNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLW11bHRpcGxlLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLW11bHRpcGxlLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2RhdGEnKV0sXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtcyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2NyZWF0ZWQnLCBQYXJhbU11bHRpcGxlTW9kYWxFZGl0b3IpO1xuXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLmNvbnRleHQucHJvcCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZXh0LnByb3AucHJvcHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgICAgIHZhciBwcm9wID0gdGhpcy5jb250ZXh0LnByb3AucHJvcHNbaV07XG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gdGhpcy5jdXJyZW50W3Byb3AubmFtZV0gPSB0aGlzLmN1cnJlbnRbcHJvcC5uYW1lXSB8fCB7IHZhbHVlOiBudWxsIH07XG5cbiAgICAgICAgICAgICAgICBwYXJhbS5fYWN0aW9uID0gcGFyYW0uX2FjdGlvbiA9PSAndXBkYXRlJ1xuICAgICAgICAgICAgICAgICAgICA/ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgIDogJ2NyZWF0ZSdcbiAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogcHJvcCxcbiAgICAgICAgICAgICAgICAgICAgcGFyYW06IHBhcmFtLFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhpdGVtKTtcblxuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJHNldCgnaXRlbXMnLCBpdGVtcyk7XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB2YXIgUGFyYW1NdWx0aXBsZUVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLW11bHRpcGxlLWVkaXRvcicsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihQYXJhbU11bHRpcGxlTGlzdFZpZXdlciwgUGFyYW1NdWx0aXBsZU1vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1tdWx0aXBsZS1lZGl0b3InLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgcHJvcDogT2JqZWN0LFxuICAgICAgICAgICAgcGFyYW06IE9iamVjdCxcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgfSxcbiAgICB9KTtcblxuXG4gICAgdmFyIFBhcmFtc0xpc3QgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtbGlzdCcsXG4gICAgICAgIGNvbXBvbmVudHM6IHtcbiAgICAgICAgICAgICdwYXJhbXMtc3RyaW5nJzogUGFyYW1TdHJpbmcsXG4gICAgICAgICAgICAncGFyYW1zLXJpY2gnOiBQYXJhbVJpY2gsXG4gICAgICAgICAgICAncGFyYW1zLXNvdXJjZSc6IFBhcmFtU291cmNlLFxuICAgICAgICAgICAgJ3BhcmFtcy1tdWx0aXBsZSc6IFBhcmFtTXVsdGlwbGUsXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBvd25lcjogT2JqZWN0LFxuICAgICAgICAgICAgdGFiOiBTdHJpbmcsXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignbWFpbicpXSxcbiAgICB9KTtcblxuICAgIHZhciBFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcycsXG4gICAgfSk7XG5cblxuICAgIHZhciBTZXR0aW5nc0xpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMtc2V0dGluZ3MtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1zZXR0aW5ncy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIFNldHRpbmdzTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMtc2V0dGluZ3MtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLXNldHRpbmdzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU2V0dGluZ3NFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMtc2V0dGluZ3MnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU2V0dGluZ3NMaXN0Vmlld2VyLCBTZXR0aW5nc01vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMtc2V0dGluZ3MnLFxuICAgIH0pO1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2V0dGluZ3MtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzZXR0aW5ncy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdkb21haW5zJyldLFxuICAgIH0pO1xuXG4gICAgdmFyIEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2V0dGluZ3MnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuQWN0aW9uTWl4aW4oTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBwdXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvc2V0dGluZ3MvZG8tdXBkYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5kb25lKChkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgZCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwdWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvc2V0dGluZ3MnLFxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5kb25lKChkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgZCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBTdG9yYWdlc0xpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3N0b3JhZ2VzLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3N0b3JhZ2VzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU3RvcmFnZXNNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc3RvcmFnZXMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzdG9yYWdlcy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBjaGVjazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2NoZWNrJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBTdG9yYWdlc0VkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc3RvcmFnZXMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU3RvcmFnZXNMaXN0Vmlld2VyLCBTdG9yYWdlc01vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3N0b3JhZ2VzJyxcbiAgICB9KTtcblxuICAgIHZhciBTdG9yYWdlc1ZhcmlhYmxlc0xpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3N0b3JhZ2VzLXZhcmlhYmxlcy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzdG9yYWdlcy12YXJpYWJsZXMtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTdG9yYWdlc1ZhcmlhYmxlc01vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdzdG9yYWdlcy12YXJpYWJsZXMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzdG9yYWdlcy12YXJpYWJsZXMtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTdG9yYWdlc1ZhcmlhYmxlc0VkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc3RvcmFnZXMtdmFyaWFibGVzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFN0b3JhZ2VzVmFyaWFibGVzTGlzdFZpZXdlciwgU3RvcmFnZXNWYXJpYWJsZXNNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNzdG9yYWdlcy12YXJpYWJsZXMnLFxuICAgIH0pO1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCd3aWRnZXRzLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3dpZGdldHMtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnd2lkZ2V0cy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3dpZGdldHMtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3dpZGdldHMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjd2lkZ2V0cycsXG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtYWN0aW9ucycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtYWN0aW9ucycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxuICAgICAgICAgICAgY2F0ZWdvcnk6IE9iamVjdCxcbiAgICAgICAgICAgIGRvbWFpbjogT2JqZWN0LFxuICAgICAgICAgICAgcGFnZTogT2JqZWN0XG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1icmFuZCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtYnJhbmQnLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWNhdGVnb3JpZXMnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWNhdGVnb3JpZXMnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogQXJyYXksXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1jb250YWluZXInLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWNvbnRhaW5lcicsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBydW50aW1lID0gVnVlLnNlcnZpY2UoJ3J1bnRpbWUnLCB7XG5cbiAgICAgICAgZXZhbHVhdGU6IGZ1bmN0aW9uKHNlbGYsIGIsIHYpIHtcblxuICAgICAgICAgICAgaWYgKGIgJiYgYi5leHByZXNzaW9uKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYi5zdHJhdGVneSA9PSAnZXZhbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHNlbGYuJGV2YWwoYi5leHByZXNzaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChiLnN0cmF0ZWd5ID09ICd3aXJlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gc2VsZi4kZ2V0KGIuZXhwcmVzc2lvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi4kaW50ZXJwb2xhdGUoYi5leHByZXNzaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Nhbm5vdCBldmFsdWF0ZSBleHByZXNzaW9uJywgYi5leHByZXNzaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgfSxcblxuICAgICAgICBldmFsdWF0ZVBhcmFtczogZnVuY3Rpb24oc2VsZiwgcHJvcHMsIHBhcmFtcykge1xuXG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHByb3BzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHBhcmFtcyAmJiBwYXJhbXNbcHJvcC5uYW1lXTtcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogcHJvcCxcbiAgICAgICAgICAgICAgICAgICAgcGFyYW06IHBhcmFtLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gaXRlbXNbaV07XG5cbiAgICAgICAgICAgICAgICB2YXIgbiA9IGl0ZW0ucHJvcC5uYW1lO1xuICAgICAgICAgICAgICAgIHZhciByID0gaXRlbS5wcm9wLnZhcmlhYmxlO1xuICAgICAgICAgICAgICAgIHZhciBiID0gaXRlbS5wYXJhbS5iaW5kaW5nO1xuICAgICAgICAgICAgICAgIHZhciB2ID0gaXRlbS5wYXJhbS52YWx1ZTtcblxuICAgICAgICAgICAgICAgIGlmIChpdGVtLnByb3AudHlwZSA9PSAnb2JqZWN0Jykge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB2djtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoYiAmJiBiLmV4cHJlc3Npb24pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVbbl0gPSB2djtcblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzID0gdGhpcy5ldmFsdWF0ZVBhcmFtcyhzZWxmLCBpdGVtLnByb3AucHJvcHMsIHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdnYgPSByID8geyB2YWx1ZTogcmVzIH0gOiByZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVtuXSA9IHZ2O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0ucHJvcC50eXBlID09ICdtdWx0aXBsZScpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoYiAmJiBiLmV4cHJlc3Npb24pIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZ2ID0gbnVsbDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFycmF5ID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gcnVudGltZS5ldmFsdWF0ZShzZWxmLCBiLCB2KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2diA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoJC5pc0FycmF5KHJlc3VsdCkpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJlc3VsdC5sZW5ndGg7IGorKykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdm0gPSBuZXcgVnVlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBPYmplY3QuYXNzaWduKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc2VsZi4kZGF0YSkpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiBqLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdFtqXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyYXkucHVzaCh0aGlzLmV2YWx1YXRlUGFyYW1zKHZtLCBpdGVtLnByb3AucHJvcHMsIGIucGFyYW1zKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2diA9IGFycmF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXJyYXkgPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCB2Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZpID0gdltqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmkuX2FjdGlvbiAhPSAncmVtb3ZlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJheVtpbmRleCsrXSA9IHRoaXMuZXZhbHVhdGVQYXJhbXMoc2VsZiwgaXRlbS5wcm9wLnByb3BzLCB2aSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB2diA9IHIgPyB7IHZhbHVlOiBhcnJheSB9IDogYXJyYXk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YWx1ZVtuXSA9IHZ2O1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgdnYgPSBydW50aW1lLmV2YWx1YXRlKHNlbGYsIGIsIHYpO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZVtuXSA9IHZ2IHx8ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgRGVjb3JhdG9yTWl4aW4gPSB7XG5cbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgfSxcblxuICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgIHJlbW92ZVdpZGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goJ3JlbW92ZUNoaWxkV2lkZ2V0JywgeyBpdGVtOiB0aGlzLm1vZGVsIH0pO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZG9BcHBseTogZnVuY3Rpb24obW9kZWwpIHtcblxuICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShtb2RlbCkpLCB7XG4gICAgICAgICAgICAgICAgICAgIF9hY3Rpb246IHRoaXMubW9kZWwuX2FjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgPyB0aGlzLm1vZGVsLl9hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIDogJ3VwZGF0ZSdcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHNob3dTZXR0aW5nczogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGlhbG9nID0gbmV3IFNoZWxsLldpZGdldHMuTW9kYWxFZGl0b3Ioe1xuXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogdGhpcy53aWRnZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbDogdGhpcy5tb2RlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCkpXG4gICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm93bmVyLmRvQXBwbHkodGhpcy5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLiRtb3VudCgpLiRhcHBlbmRUbygkKCdib2R5JykuZ2V0KDApKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIHZhciBCaW5kaW5nc01peGluID0ge1xuXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBiaW5kaW5nczogdGhpcy5iaW5kaW5ncyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgYmluZGluZ3MgPSBydW50aW1lLmV2YWx1YXRlUGFyYW1zKHRoaXMsIHRoaXMud2lkZ2V0LnByb3BzLCB0aGlzLm1vZGVsLnBhcmFtcyk7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdiaW5kaW5ncycsIGJpbmRpbmdzKTtcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBkZWVwOiB0cnVlLFxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnc3RvcmFnZScsIChzdG9yYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGJpbmRpbmdzID0gcnVudGltZS5ldmFsdWF0ZVBhcmFtcyh0aGlzLCB0aGlzLndpZGdldC5wcm9wcywgdGhpcy5tb2RlbC5wYXJhbXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnYmluZGluZ3MnLCBiaW5kaW5ncyk7XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ21vZGVsJywgKG1vZGVsKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGJpbmRpbmdzID0gcnVudGltZS5ldmFsdWF0ZVBhcmFtcyh0aGlzLCB0aGlzLndpZGdldC5wcm9wcywgbW9kZWwucGFyYW1zKVxuICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnYmluZGluZ3MnLCBiaW5kaW5ncyk7XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgQ29tcG9zaXRlTWl4aW4gPSB7XG5cbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiB0aGlzLmNoaWxkcmVuLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ2l0ZW1zJywgKGl0ZW1zKSA9PiB7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBbXTtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBpdGVtc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLl9hY3Rpb24gIT0gJ3JlbW92ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMucGxhY2Vob2xkZXIoKSkpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBldmVudHM6IHtcblxuICAgICAgICAgICAgcmVtb3ZlQ2hpbGRXaWRnZXQ6IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gZGF0YS5pdGVtO1xuXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uX2FjdGlvbiA9PSAnY3JlYXRlJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLiRyZW1vdmUoaXRlbSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5fYWN0aW9uID0gJ3JlbW92ZSc7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtcyA9IHRoaXMuaXRlbXMuc2xpY2UoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG5cbiAgICAgICAgbWV0aG9kczoge1xuXG4gICAgICAgICAgICAvLyBmaW5kOiBmdW5jdGlvbihjaGlsZHJlbiwgaXRlbSkge1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICAgICAgLy8gICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoICYmIGluZGV4IDwgZG9tSW5kZXg7IGkrKykge1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vICAgICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgICAgICBpZiAoY2hpbGQuX2FjdGlvbiAhPSAncmVtb3ZlJykge1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyAgICAgcmV0dXJuIGluZGV4O1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICB9LFxuICAgIH07XG5cbiAgICB2YXIgU29ydGFibGVNaXhpbiA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuXG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IHRoaXMuc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGF0dGFjaGVkOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRyb3V0ZS5wcml2YXRlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHNoZWxsID0gVnVlLnNlcnZpY2UoJ3NoZWxsJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy4kd2F0Y2goJ3NlbGVjdGVkJywgZnVuY3Rpb24oc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGlmICh0aGlzLnNvcnRhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgaWYgKHNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIHRoaXMuc29ydGFibGUuc29ydGFibGUoXCJkaXNhYmxlXCIpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIHRoaXMuc29ydGFibGUuc29ydGFibGUoXCJlbmFibGVcIik7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICAgICAgc2VsZWN0VGFyZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHVuc2VsZWN0VGFyZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci1zdHViJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kZWNvcmF0b3Itc3R1YicsXG4gICAgICAgIG1peGluczogWyBEZWNvcmF0b3JNaXhpbiwgQmluZGluZ3NNaXhpbiBdLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXG4gICAgICAgICAgICBzdG9yYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3QsXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci13aWRnZXQnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWRlY29yYXRvci13aWRnZXQnLFxuICAgICAgICBtaXhpbnM6IFsgRGVjb3JhdG9yTWl4aW4sIEJpbmRpbmdzTWl4aW4gXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0LFxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1kZWNvcmF0b3ItaG9yaXNvbnRhbCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZGVjb3JhdG9yLWhvcmlzb250YWwnLFxuICAgICAgICBtaXhpbnM6IFsgRGVjb3JhdG9yTWl4aW4sIENvbXBvc2l0ZU1peGluLCBTb3J0YWJsZU1peGluKCc+LmdlLmdlLWNvbnRlbnQgPi53Zy53Zy1kZWZhdWx0LXN0YWNrID4ud2cud2ctY29udGVudCA+LndnLndnLXRhYmxlID4ud2cud2ctcm93JyksIEJpbmRpbmdzTWl4aW4gXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0LFxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVnVlLnNlcnZpY2UoJ3BhbGV0dGUnKS5wbGFjZWhvbGRlcihgXG4gICAgICAgICAgICAgICAgICAgIDxzbWFsbD5Ib3Jpc29udGFsIFN0YWNrPC9zbWFsbD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5Ecm9wIEhlcmU8L2Rpdj5cbiAgICAgICAgICAgICAgICBgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci12ZXJ0aWNhbCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZGVjb3JhdG9yLXZlcnRpY2FsJyxcbiAgICAgICAgbWl4aW5zOiBbIERlY29yYXRvck1peGluLCBDb21wb3NpdGVNaXhpbiwgU29ydGFibGVNaXhpbignPi5nZS5nZS1jb250ZW50ID4ud2cud2ctZGVmYXVsdC1zdGFjayA+LndnLndnLWNvbnRlbnQgPi53Zy53Zy10YWJsZScpLCBCaW5kaW5nc01peGluIF0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxuICAgICAgICAgICAgc3RhY2s6IE9iamVjdCxcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcbiAgICAgICAgICAgIHN0b3JhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXG4gICAgICAgICAgICB3aWRnZXQ6IE9iamVjdCxcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFZ1ZS5zZXJ2aWNlKCdwYWxldHRlJykucGxhY2Vob2xkZXIoYFxuICAgICAgICAgICAgICAgICAgICA8c21hbGw+VmVydGljYWwgU3RhY2s8L3NtYWxsPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PkRyb3AgSGVyZTwvZGl2PlxuICAgICAgICAgICAgICAgIGApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtZGVjb3JhdG9yLWNhbnZhcycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZGVjb3JhdG9yLWNhbnZhcycsXG4gICAgICAgIG1peGluczogWyBDb21wb3NpdGVNaXhpbiwgU29ydGFibGVNaXhpbignPi5nZS5nZS1jb250ZW50ID4ud2cud2ctZGVmYXVsdC1zdGFjayA+LndnLndnLWNvbnRlbnQgPi53Zy53Zy10YWJsZScpIF0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxuICAgICAgICAgICAgc3RhY2s6IE9iamVjdCxcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcbiAgICAgICAgICAgIHN0b3JhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxuICAgICAgICB9LFxuICAgICAgICBhdHRhY2hlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBkcmFnZ2VkO1xuXG4gICAgICAgICAgICB0aGlzLnNvcnRhYmxlID0gJCh0aGlzLiRlbCkuc29ydGFibGUoe1xuXG4gICAgICAgICAgICAgICAgdmVydGljYWw6IHRydWUsXG4gICAgICAgICAgICAgICAgZHJvcDogdHJ1ZSxcblxuICAgICAgICAgICAgICAgIGNvbnRhaW5lclNlbGVjdG9yOiAnLndnLndnLXNvcnRhYmxlLWNvbnRhaW5lci53Zy1zb3J0YWJsZS1lZGl0YWJsZScsXG4gICAgICAgICAgICAgICAgaXRlbVNlbGVjdG9yOiAnLndnLndnLXNvcnRhYmxlLWl0ZW0ud2ctc29ydGFibGUtZWRpdGFibGUnLFxuICAgICAgICAgICAgICAgIGV4Y2x1ZGVTZWxlY3RvcjogJy5nZS5nZS1vdmVybGF5JyxcblxuICAgICAgICAgICAgICAgIHZlcnRpY2FsQ2xhc3M6IFwid2ctc29ydGFibGUtdmVydGljYWxcIixcbiAgICAgICAgICAgICAgICBob3Jpc29udGFsQ2xhc3M6IFwid2ctc29ydGFibGUtaG9yaXNvbnRhbFwiLFxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBgXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3ZyB3Zy1zb3J0YWJsZS1wbGFjZWhvbGRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIndnIHdnLXBsYWNlaG9sZGVyLWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3ZyB3Zy1wbGFjZWhvbGRlci1pbm5lclwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIGAsXG4gICAgICAgICAgICAgICAgb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKGNvbnRleHQsIGV2ZW50LCBfc3VwZXIpIHtcblxuICAgICAgICAgICAgICAgICAgICBfc3VwZXIoY29udGV4dCwgZXZlbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGFjayA9ICQoY29udGV4dC4kY29udGFpbmVyKS5jbG9zZXN0KCcuZ2UuZ2Utd2lkZ2V0JykuZ2V0KDApLl9fdnVlX187XG4gICAgICAgICAgICAgICAgICAgIHZhciB2dWUgPSBjb250ZXh0LiRvcmlnaW5hbEl0ZW0uZmluZCgnLmdlLmdlLXdpZGdldDpmaXJzdCcpLmdldCgwKS5fX3Z1ZV9fO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHZ1ZS5tb2RlbCk7XG4gICAgICAgICAgICAgICAgICAgIGRyYWdnZWQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFjazogc3RhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpbmRleDogc3RhY2suZmluZChzdGFjay5pdGVtcywgY29udGV4dC4kb3JpZ2luYWxJdGVtLmluZGV4KCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXg6IHN0YWNrLml0ZW1zLmluZGV4T2YodnVlLm1vZGVsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZ1ZTogdnVlLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25Ecm9wOiBmdW5jdGlvbihjb250ZXh0LCBldmVudCwgX3N1cGVyKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgX3N1cGVyKGNvbnRleHQsIGV2ZW50KTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgdnVlID0gY29udGV4dC5sb2NhdGlvbi4kaXRlbS5maW5kKCcuZ2UuZ2Utd2lkZ2V0OmZpcnN0JykuZ2V0KDApLl9fdnVlX19cblxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3U3RhY2sgPSBjb250ZXh0LmxvY2F0aW9uLiRjb250YWluZXIuY2xvc2VzdCgnLmdlLmdlLXdpZGdldCcpLmdldCgwKS5fX3Z1ZV9fO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdJbmRleCA9IG5ld1N0YWNrLml0ZW1zLmluZGV4T2YodnVlLm1vZGVsKSArIChjb250ZXh0LmxvY2F0aW9uLmJlZm9yZSA/IDAgOiAxKTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgdyA9IGNvbnRleHQuJGl0ZW0uZGF0YSgnd2lkZ2V0Jyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHcpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0l0ZW0gPSBWdWUuc2VydmljZSgncGFsZXR0ZScpLml0ZW0odyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdTdGFjay5pdGVtcy5zcGxpY2UobmV3SW5kZXgsIDAsIG5ld0l0ZW0pO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZHJhZ2dlZCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2xkU3RhY2sgPSBkcmFnZ2VkLnN0YWNrO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9sZEluZGV4ID0gZHJhZ2dlZC5pbmRleDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvbGRJdGVtID0gZHJhZ2dlZC52dWUubW9kZWw7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdJdGVtID0gT2JqZWN0LmFzc2lnbihKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRyYWdnZWQudnVlLm1vZGVsKSkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob2xkU3RhY2sgIT0gbmV3U3RhY2spIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBuZXdJdGVtLnJlc291cmNlLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBuZXdJdGVtLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0l0ZW0uX2FjdGlvbiA9ICdjcmVhdGUnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9sZEl0ZW0uX2FjdGlvbiA9PSAnY3JlYXRlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRTdGFjay5pdGVtcy5zcGxpY2Uob2xkSW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZEl0ZW0uX2FjdGlvbiA9ICdyZW1vdmUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0YWNrLml0ZW1zLnNwbGljZShuZXdJbmRleCwgMCwgbmV3SXRlbSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3SW5kZXggIT0gb2xkSW5kZXggJiYgbmV3SW5kZXggIT0gb2xkSW5kZXggKyAxKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdJdGVtLl9hY3Rpb24gPSBvbGRJdGVtLl9hY3Rpb24gPT0gJ2NyZWF0ZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnY3JlYXRlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0luZGV4IDwgb2xkSW5kZXgpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRTdGFjay5pdGVtcy5zcGxpY2Uob2xkSW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdTdGFjay5pdGVtcy5zcGxpY2UobmV3SW5kZXgsIDAsIG5ld0l0ZW0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdJbmRleCA+IG9sZEluZGV4KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RhY2suaXRlbXMuc3BsaWNlKG5ld0luZGV4LCAwLCBuZXdJdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkU3RhY2suaXRlbXMuc3BsaWNlKG9sZEluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG9sZFN0YWNrLml0ZW1zID0gb2xkU3RhY2suaXRlbXMuc2xpY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0YWNrLml0ZW1zID0gbmV3U3RhY2suaXRlbXMuc2xpY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuJGl0ZW0ucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVnVlLnNlcnZpY2UoJ3BhbGV0dGUnKS5wbGFjZWhvbGRlcihgXG4gICAgICAgICAgICAgICAgICAgIDxzbWFsbD5WZXJ0aWNhbCBTdGFjazwvc21hbGw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+RHJvcCBIZXJlPC9kaXY+XG4gICAgICAgICAgICAgICAgYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtZG9tYWlucycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZG9tYWlucycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBkb21haW5zOiBBcnJheSxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG5cbiAgICBTaGVsbC5Mb2FkZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWxvYWRlcicsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtbG9hZGVyJyxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHBvcnRhbDogbnVsbCxcbiAgICAgICAgICAgICAgICBzZXR0aW5nczogbnVsbCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBWdWUuc2VydmljZSgncG9ydGFscycpLmdldCh7IGlkOiB0aGlzLiRyb3V0ZS5wYXJhbXMucG9ydGFsIH0pLnRoZW4oXG4gICAgICAgICAgICAgICAgKGQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdwb3J0YWwnLCBkLmRhdGEucG9ydGFsKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdzZXR0aW5ncycsIGQuZGF0YS5zZXR0aW5ncyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcGFnZScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcGFnZScsXG4gICAgICAgIG1peGluczogWyAvKkNvcmUuQ29udGFpbmVyTWl4aW4sIENvcmUuU29ydGFibGVNaXhpbiovIF0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxuICAgICAgICB9LFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGVjb3JhdG9yOiB0aGlzLmRlY29yYXRvcixcbiAgICAgICAgICAgICAgICBkYXRhOiB0aGlzLmRhdGEsXG4gICAgICAgICAgICAgICAgc3RvcmFnZTogdGhpcy5zdG9yYWdlLFxuICAgICAgICAgICAgICAgIHBhZ2VTZXR0aW5nczoge30sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIHJ1bnRpbWUgPSBWdWUuc2VydmljZSgncnVudGltZScpO1xuXG4gICAgICAgICAgICB0aGlzLmRlY29yYXRvciA9ICdzaGVsbC1kZWNvcmF0b3ItY2FudmFzJztcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IHt9O1xuICAgICAgICAgICAgdGhpcy5zdG9yYWdlID0ge307XG5cbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdwYWdlLnJlc291cmNlJywgKHJlc291cmNlKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdwYWdlU2V0dGluZ3Mud2lkdGgnLCAnOTYwcHgnKTsgLy8gZGVmYXVsdFxuICAgICAgICAgICAgICAgIGlmIChyZXNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHBhcmFtIGluIHJlc291cmNlLnBhcmFtcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdwYWdlU2V0dGluZ3MuJyArIHJlc291cmNlLnBhcmFtc1twYXJhbV0ubmFtZSwgcmVzb3VyY2UucGFyYW1zW3BhcmFtXS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ3BhZ2Uuc3RvcmFnZXMnLCAoc3RvcmFnZXMpID0+IHtcblxuICAgICAgICAgICAgICAgIGlmIChzdG9yYWdlcykge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdG9yYWdlID0ge307XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdG9yYWdlcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3QgPSBzdG9yYWdlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JhZ2Vbc3QubmFtZV0gPSB7fTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzdC52YXJpYWJsZXMubGVuZ3RoOyBqKyspIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YXJpYWJsZSA9IHN0LnZhcmlhYmxlc1tqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG9yYWdlW3N0Lm5hbWVdW3ZhcmlhYmxlLm5hbWVdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcnVudGltZS5ldmFsdWF0ZSh0aGlzLCB2YXJpYWJsZS5iaW5kaW5nLCB2YXJpYWJsZS52YWx1ZSkgfHwgbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ3N0b3JhZ2UnLCBzdG9yYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ3BhZ2Uuc291cmNlcycsIChzb3VyY2VzKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAoc291cmNlcykge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnB1c2godGhpcy5kb1JlcXVlc3Qoc291cmNlc1tpXSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlZmVycmVkLmxlbmd0aCA+IDEpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJC53aGVuLmFwcGx5KHRoaXMsIGRlZmVycmVkKS5kb25lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtzb3VyY2VzW2ldLm5hbWVdID0gYXJndW1lbnRzW2ldWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2RhdGEnLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkZWZlcnJlZC5sZW5ndGggPT0gMSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZFswXS5kb25lKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbc291cmNlc1swXS5uYW1lXSA9IGQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdkYXRhJywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgZG9SZXF1ZXN0OiBmdW5jdGlvbihzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHF1ZXJ5ID0ge307XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzLnBhcmFtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyYW0gPSBzLnBhcmFtc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmFtLmluID09ICdxdWVyeScgJiYgcGFyYW0uc3BlY2lmaWVkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHBhcmFtLmJpbmRpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyB0aGlzLiRpbnRlcnBvbGF0ZShwYXJhbS5iaW5kaW5nKSAvLyBUT0RPIEludGVycG9sYXRlIGluIHBhZ2UgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHBhcmFtLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVyeVtwYXJhbS5uYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogcy5tZXRob2QsXG4gICAgICAgICAgICAgICAgICAgIHVybDogcy51cmwsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcXVlcnksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcGFnZXMnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXBhZ2VzJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIHBhZ2VzOiBBcnJheSxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG5cbiAgICB2YXIgUGFsZXR0ZUl0ZW0gPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXBhbGV0dGUtaXRlbScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcGFsZXR0ZS1pdGVtJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGNhdGVnb3J5OiBPYmplY3QsXG4gICAgICAgICAgICBncm91cDogT2JqZWN0LFxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcGFsZXR0ZScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcGFsZXR0ZScsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgICAgICBjYXRlZ29yeTogT2JqZWN0LFxuICAgICAgICB9LFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY2F0ZWdvcmllczogdGhpcy5jYXRlZ29yaWVzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBjb21wb25lbnRzOiB7XG4gICAgICAgICAgICAncGFsZXR0ZS1pdGVtJzogUGFsZXR0ZUl0ZW1cbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmNhdGVnb3JpZXMgPSBXaWRnZXRzLlBhbGV0dGUuY2F0ZWdvcmllcygpO1xuICAgICAgICB9LFxuICAgICAgICBhdHRhY2hlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHRoaXMuc29ydGFibGUgPSAkKHRoaXMuJGVsKS5zb3J0YWJsZSh7XG4gICAgICAgICAgICAgICAgZ3JvdXA6ICd3aWRnZXRzJyxcbiAgICAgICAgICAgICAgICBjb250YWluZXJTZWxlY3RvcjogJy53Zy1zb3J0YWJsZS1jb250YWluZXInLFxuICAgICAgICAgICAgICAgIGl0ZW1TZWxlY3RvcjogJy53Zy1zb3J0YWJsZS1pdGVtJyxcbiAgICAgICAgICAgICAgICBkcm9wOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgaXRlbSwgY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIFNoZWxsLlNoZWxsID0ge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBnbG9iYWxzOiB0aGlzLmdsb2JhbHMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdGhpcy5nbG9iYWxzID0ge1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgcGFnZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBzdG9yYWdlOiBudWxsLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3MsXG4gICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWwsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgIH07XG5cbiAgICBTaGVsbC5TaGVsbFB1YmxpYyA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcHVibGljJywge1xuICAgICAgICBtaXhpbnM6IFsgU2hlbGwuU2hlbGwgXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcHVibGljJyxcbiAgICB9KTtcblxuICAgIFNoZWxsLlNoZWxsUHJpdmF0ZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcHJpdmF0ZScsIHtcblxuICAgICAgICBtaXhpbnM6IFsgU2hlbGwuU2hlbGwgXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcHJpdmF0ZScsXG5cbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHRoaXMuc2NhbGUgPSAxO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiByZWxldmFudChjdXJyZW50LCBjb2xsZWN0aW9uKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWN1cnJlbnQgfHwgY3VycmVudC5fYWN0aW9uID09ICdyZW1vdmUnIHx8IChjb2xsZWN0aW9uICYmIGNvbGxlY3Rpb24uaW5kZXhPZihjdXJyZW50KSA8IDApKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29sbGVjdGlvbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjID0gY29sbGVjdGlvbltpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYy5fYWN0aW9uICE9ICdyZW1vdmUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50ICYmIGN1cnJlbnQuX2FjdGlvbiA9PSAncmVtb3ZlJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5jYXRlZ29yeSA9IFZ1ZS5zZXJ2aWNlKCdwYWxldHRlJykuY2F0ZWdvcmllcygpWzBdO1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnbW9kZWwuZG9tYWlucycsIChkb21haW5zKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5kb21haW4gPSByZWxldmFudCh0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLmRvbWFpbiwgZG9tYWlucyk7XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdtb2RlbC5wYWdlcycsIChwYWdlcykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24ucGFnZSA9IHJlbGV2YW50KHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24ucGFnZSwgcGFnZXMpO1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnZ2xvYmFscy5zZWxlY3Rpb24ucGFnZS5zb3VyY2VzJywgKHNvdXJjZXMpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnNvdXJjZSA9IHJlbGV2YW50KHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uc291cmNlLCBzb3VyY2VzKTtcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ2dsb2JhbHMuc2VsZWN0aW9uLnBhZ2Uuc3RvcmFnZXMnLCAoc3RvcmFnZXMpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnN0b3JhZ2UgPSByZWxldmFudCh0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnN0b3JhZ2UsIHN0b3JhZ2VzKTtcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgIHpvb21JbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2NhbGUgKz0gMC4xO1xuICAgICAgICAgICAgICAgICQoJy5nZS5nZS1wYWdlJywgdGhpcy4kZWwpLmNzcygndHJhbnNmb3JtJywgJ3NjYWxlKCcgKyB0aGlzLnNjYWxlICsgJyknKTtcbiAgICAgICAgICAgICAgICAkKCcuZ2UuZ2UtY29udGFpbmVyJywgdGhpcy4kZWwpLnBlcmZlY3RTY3JvbGxiYXIoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHpvb21PdXQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNjYWxlIC09IDAuMTtcbiAgICAgICAgICAgICAgICAkKCcuZ2UuZ2UtcGFnZScsIHRoaXMuJGVsKS5jc3MoJ3RyYW5zZm9ybScsICdzY2FsZSgnICsgdGhpcy5zY2FsZSArICcpJyk7XG4gICAgICAgICAgICAgICAgJCgnLmdlLmdlLWNvbnRhaW5lcicsIHRoaXMuJGVsKS5wZXJmZWN0U2Nyb2xsYmFyKCd1cGRhdGUnKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwdWxsOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBgL3dzL3BvcnRhbHMvJHt0aGlzLm1vZGVsLmlkfWAsXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmRvbmUoKGQpID0+IHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnbW9kZWwnLCBkLnBvcnRhbCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwdXNoOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBgL3dzL3BvcnRhbHMvJHt0aGlzLm1vZGVsLmlkfWAsXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5kb25lKChkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ21vZGVsJywgZC5wb3J0YWwpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VsZWN0Q2F0ZWdvcnk6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLmNhdGVnb3J5ID0gZGF0YS5pdGVtO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlbGVjdERvbWFpbjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uZG9tYWluID0gZGF0YS5pdGVtO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlbGVjdFBhZ2U6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnBhZ2UgPSBkYXRhLml0ZW07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VsZWN0U291cmNlOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5zb3VyY2UgPSBkYXRhLml0ZW07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VsZWN0U3RvcmFnZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uc3RvcmFnZSA9IGRhdGEuaXRlbTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1zb3VyY2VzJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1zb3VyY2VzJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIHNvdXJjZXM6IEFycmF5LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXN0b3JhZ2VzJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1zdG9yYWdlcycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBzdG9yYWdlczogQXJyYXksXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtdGFyZ2V0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC10YXJnZXQnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICB9LFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIFNoZWxsLldpZGdldCA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtd2lkZ2V0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC13aWRnZXQnLFxuICAgICAgICBtaXhpbnM6IFsgLyogQ29yZS5EZWNvcmF0b3JNaXhpbiwgQ29yZS5Db250YWluZXJNaXhpbiwgQ29yZS5Tb3J0YWJsZU1peGluLCBDb3JlLkJpbmRpbmdzTWl4aW4gKi8gXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcbiAgICAgICAgICAgIHN0b3JhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxuICAgICAgICB9LFxuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZGVjb3JhdG9ycyA9IHtcbiAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2RlZmF1bHQtc3RhY2staG9yaXNvbnRhbCc6ICdzaGVsbC1kZWNvcmF0b3ItaG9yaXNvbnRhbCcsXG4gICAgICAgICAgICAgICAgICAgICdkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJzogJ3NoZWxsLWRlY29yYXRvci12ZXJ0aWNhbCcsXG4gICAgICAgICAgICAgICAgICAgICdkZWZhdWx0LXN0dWInOiAnc2hlbGwtZGVjb3JhdG9yLXN0dWInLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZmFsbGJhY2s6ICdzaGVsbC1kZWNvcmF0b3Itd2lkZ2V0JyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgcGFsZXR0ZSA9IFZ1ZS5zZXJ2aWNlKCdwYWxldHRlJyk7XG4gICAgICAgICAgICB0aGlzLndpZGdldCA9IHBhbGV0dGUud2lkZ2V0KHRoaXMubW9kZWwubmFtZSk7XG4gICAgICAgICAgICB0aGlzLmRlY29yYXRvciA9IHRoaXMuZGVjb3JhdG9ycy5hbHRlcm5hdGl2ZXNbdGhpcy53aWRnZXQudGFnXSB8fCB0aGlzLmRlY29yYXRvcnMuZmFsbGJhY2s7XG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHdpZGdldDogdGhpcy53aWRnZXQsXG4gICAgICAgICAgICAgICAgZGVjb3JhdG9yOiB0aGlzLmRlY29yYXRvcixcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgdmFyIFNvdXJjZXNMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTb3VyY2VzTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIGNoZWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY2hlY2snKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIFNvdXJjZXNFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU291cmNlc0xpc3RWaWV3ZXIsIFNvdXJjZXNNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzJyxcbiAgICB9KTtcblxuICAgIHZhciBTb3VyY2VzUGFyYW1zTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1wYXJhbXMtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcy1wYXJhbXMtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTb3VyY2VzUGFyYW1zTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcy1wYXJhbXMtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTb3VyY2VzUGFyYW1zRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLXBhcmFtcycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTb3VyY2VzUGFyYW1zTGlzdFZpZXdlciwgU291cmNlc1BhcmFtc01vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zJyxcbiAgICB9KTtcblxufSkoVnVlLCBqUXVlcnksIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsKSB7XG5cbiAgICB2YXIgV2lkZ2V0c0xpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBnZXRXaWRnZXQ6IGZ1bmN0aW9uKHcpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2xvYmFscy53aWRnZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3aWRnZXQgPSB0aGlzLmdsb2JhbHMud2lkZ2V0c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHcudHlwZSA9PSB3aWRnZXQuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB3aWRnZXQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBXaWRnZXRzTW9kYWxFZGl0b3IgPSBTaGVsbC5XaWRnZXRzLk1vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdkYXRhJyldLFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZXh0LndpZGdldC5wcm9wcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHByb3AgPSB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzW2ldO1xuXG4gICAgICAgICAgICAgICAgLy8gVE9ETyBNb3ZlIHRvIHNlcnZpY2UgbGF5ZXJcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW0gPSB0aGlzLmN1cnJlbnQucGFyYW1zW3Byb3AubmFtZV0gPSB0aGlzLmN1cnJlbnQucGFyYW1zW3Byb3AubmFtZV0gfHwge1xuICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiAnY3JlYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IChwcm9wLnR5cGUgPT0gJ211bHRpcGxlJyA/IFtdIDogbnVsbCksXG4gICAgICAgICAgICAgICAgICAgIGJpbmRpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmF0ZWd5OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogKHByb3AudHlwZSA9PSAnbXVsdGlwbGUnID8gbnVsbCA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHBhcmFtLl9hY3Rpb24gPSBwYXJhbS5fYWN0aW9uID09ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgID8gJ3VwZGF0ZSdcbiAgICAgICAgICAgICAgICAgICAgOiAnY3JlYXRlJ1xuICAgICAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICBwcm9wOiBwcm9wLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbTogcGFyYW0sXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuaXRlbXMgPSBpdGVtcztcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuY29udGV4dCxcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtcyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcblxuICAgICAgICAgICAgaGFzUHJvcHM6IGZ1bmN0aW9uKHRhYikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbnRleHQud2lkZ2V0ICYmIHRoaXMuY29udGV4dC53aWRnZXQucHJvcHMpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvcC50YWIgPT0gdGFiKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBXaWRnZXRzRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFdpZGdldHNMaXN0Vmlld2VyLCBXaWRnZXRzTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICB3aWRnZXQ6IE9iamVjdFxuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgIHByb3RvOiBmdW5jdGlvbih3aWRnZXQpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiB3aWRnZXQuaWQsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtczoge30sXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHZhciBwYXJhbXMgPSB7fTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgd2lkZ2V0LnByb3BzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb3AgPSB3aWRnZXQucHJvcHNbaV07XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gTW92ZSB0byBzZXJ2aWNlIGxheWVyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtc1twcm9wLm5hbWVdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogJ2NyZWF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogKHByb3AudHlwZSA9PSAnbXVsdGlwbGUnID8gW10gOiBudWxsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJhdGVneTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogKHByb3AudHlwZSA9PSAnbXVsdGlwbGUnID8gbnVsbCA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRhdGEucGFyYW1zID0gcGFyYW1zO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCk7XG4iLCJ2YXIgV2lkZ2V0cyA9XG4oZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBXaWRnZXRzID0ge307XG5cbiAgICBXaWRnZXRzLlBhbGV0dGUgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIG1hcCA9IHt9O1xuICAgICAgICB2YXIgYXJyID0gW107XG5cbiAgICAgICAgdmFyIHdpZGdldHMgPSB7fTtcblxuICAgICAgICB2YXIgY2F0ZWdvcmllcyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJyOyB9XG4gICAgICAgIHZhciBjYXRlZ29yeSA9IGZ1bmN0aW9uKG4sIGNhdGVnb3J5KSB7XG5cbiAgICAgICAgICAgIGlmIChuIGluIG1hcCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtYXBbbl07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5Lm5hbWUgPSBuO1xuICAgICAgICAgICAgICAgIG1hcFtuXSA9IGNhdGVnb3J5O1xuICAgICAgICAgICAgICAgIGFyci5wdXNoKGNhdGVnb3J5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgd2lkZ2V0ID0gZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgdmFyIHNlZ21lbnRzID0gcGF0aC5zcGxpdCgnLycpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2F0ZWdvcnkoc2VnbWVudHNbMF0pLmdyb3VwKHNlZ21lbnRzWzFdKS53aWRnZXQoc2VnbWVudHNbMl0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGl0ZW0gPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICB2YXIgc2VnbWVudHMgPSBwYXRoLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICByZXR1cm4gJC5leHRlbmQodHJ1ZSwge30sIHRoaXMuY2F0ZWdvcnkoc2VnbWVudHNbMF0pLmdyb3VwKHNlZ21lbnRzWzFdKS5pdGVtKHNlZ21lbnRzWzJdKS53aWRnZXQsIHtcbiAgICAgICAgICAgICAgICBfYWN0aW9uOiAnY3JlYXRlJyxcbiAgICAgICAgICAgICAgICByZXNvdXJjZToge1xuICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiAnY3JlYXRlJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlSWQocHJlZml4KSB7XG5cbiAgICAgICAgICAgIHZhciBBTFBIQUJFVCA9ICcwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWic7XG4gICAgICAgICAgICB2YXIgSURfTEVOR1RIID0gODtcblxuICAgICAgICAgICAgdmFyIHJ0biA9ICcnO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBJRF9MRU5HVEg7IGkrKykge1xuICAgICAgICAgICAgICAgIHJ0biArPSBBTFBIQUJFVC5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogQUxQSEFCRVQubGVuZ3RoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJlZml4ID8gcHJlZml4ICsgcnRuIDogcnRuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IGNhdGVnb3JpZXMsXG4gICAgICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnksXG4gICAgICAgICAgICB3aWRnZXQ6IHdpZGdldCxcbiAgICAgICAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogZnVuY3Rpb24oY29udGVudCkgeyByZXR1cm4gV2lkZ2V0cy5TdHViV2lkZ2V0RmFjdG9yeShjb250ZW50KSB9LFxuICAgICAgICAgICAgZ2VuZXJhdGVJZDogZ2VuZXJhdGVJZCxcbiAgICAgICAgfTtcbiAgICB9KSgpO1xuXG4gICAgV2lkZ2V0cy5DYXRlZ29yeSA9IGZ1bmN0aW9uKG5hbWUsIHRpdGxlLCBpZ25vcmUpIHtcblxuICAgICAgICB2YXIgbWFwID0ge307XG4gICAgICAgIHZhciBhcnIgPSBbXTtcblxuICAgICAgICB2YXIgZ3JvdXBzID0gZnVuY3Rpb24oKSB7IHJldHVybiBhcnI7IH1cbiAgICAgICAgdmFyIGdyb3VwID0gZnVuY3Rpb24obiwgZ3JvdXApIHtcblxuICAgICAgICAgICAgaWYgKG4gaW4gbWFwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hcFtuXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ3JvdXAubmFtZSA9IGAke25hbWV9LyR7bn1gO1xuICAgICAgICAgICAgICAgIG1hcFtuXSA9IGdyb3VwO1xuICAgICAgICAgICAgICAgIGFyci5wdXNoKGdyb3VwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBXaWRnZXRzLlBhbGV0dGUuY2F0ZWdvcnkobmFtZSwge1xuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICAgICAgZ3JvdXBzOiBncm91cHMsXG4gICAgICAgICAgICBncm91cDogZ3JvdXAsXG4gICAgICAgICAgICBpZ25vcmU6IGlnbm9yZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIFdpZGdldHMuUGFsZXR0ZS5jYXRlZ29yeShuYW1lKTtcbiAgICB9O1xuXG4gICAgV2lkZ2V0cy5Hcm91cCA9IGZ1bmN0aW9uKGNhdGVnb3J5LCBuYW1lLCB0aXRsZSkge1xuXG4gICAgICAgIHZhciBtYXAgPSB7fTtcbiAgICAgICAgdmFyIGFyciA9IFtdO1xuXG4gICAgICAgIHZhciBpdGVtcyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJyOyB9XG4gICAgICAgIHZhciBpdGVtID0gZnVuY3Rpb24obiwgaXRlbSkge1xuXG4gICAgICAgICAgICBpZiAobiBpbiBtYXApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWFwW25dO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpdGVtLm5hbWUgPSBgJHt0aGlzLm5hbWV9LyR7bn1gO1xuICAgICAgICAgICAgICAgIG1hcFtuXSA9IGl0ZW07XG4gICAgICAgICAgICAgICAgYXJyLnB1c2goaXRlbSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHdfbWFwID0ge307XG4gICAgICAgIHZhciB3X2FyciA9IFtdO1xuXG4gICAgICAgIHZhciB3aWRnZXRzID0gZnVuY3Rpb24oKSB7IHJldHVybiB3X2FycjsgfVxuICAgICAgICB2YXIgd2lkZ2V0ID0gZnVuY3Rpb24obiwgd2lkZ2V0KSB7XG5cbiAgICAgICAgICAgIGlmIChuIGluIHdfbWFwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdfbWFwW25dO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aWRnZXQubmFtZSA9IGAke3RoaXMubmFtZX0vJHtufWA7XG4gICAgICAgICAgICAgICAgd19tYXBbbl0gPSB3aWRnZXQ7XG4gICAgICAgICAgICAgICAgd19hcnIucHVzaCh3aWRnZXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIGNhdGVnb3J5Lmdyb3VwKG5hbWUsIHtcbiAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgICAgIGl0ZW1zOiBpdGVtcyxcbiAgICAgICAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICAgICAgICB3aWRnZXRzOiB3aWRnZXRzLFxuICAgICAgICAgICAgd2lkZ2V0OiB3aWRnZXQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBjYXRlZ29yeS5ncm91cChuYW1lKTtcbiAgICB9O1xuXG4gICAgV2lkZ2V0cy5XaWRnZXQgPSBmdW5jdGlvbihncm91cCwgY29uZmlnKSB7XG5cbiAgICAgICAgdmFyIG5hbWUgPSBjb25maWcubmFtZTtcblxuICAgICAgICBncm91cC53aWRnZXQoY29uZmlnLm5hbWUsIGNvbmZpZyk7XG5cbiAgICAgICAgcmV0dXJuIGdyb3VwLndpZGdldChuYW1lKTtcbiAgICB9XG5cbiAgICBXaWRnZXRzLmNsb25lID0gZnVuY3Rpb24ob3JpZ2luYWwpIHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3JpZ2luYWwpKTtcbiAgICB9XG5cbiAgICBXaWRnZXRzLmNyZWF0ZSA9IGZ1bmN0aW9uKGNvbmZpZykge1xuXG4gICAgICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgICAgICBuYW1lOiBjb25maWcubmFtZSxcbiAgICAgICAgICAgIHRhZzogY29uZmlnLnRhZyxcbiAgICAgICAgICAgIHdpZGdldHM6IGNvbmZpZy53aWRnZXRzLFxuICAgICAgICAgICAgdGFiczogW10sXG4gICAgICAgICAgICBwcm9wczogW10sXG4gICAgICAgICAgICBwYXJhbXM6IHt9LFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICgnX2FjdGlvbicgaW4gY29uZmlnKSByZXN1bHQuX2FjdGlvbiA9IGNvbmZpZy5fYWN0aW9uO1xuXG4gICAgICAgIGZ1bmN0aW9uIHZpc2l0KHcsIG0pIHtcblxuICAgICAgICAgICAgaWYgKCdwcm9wcycgaW4gbSkge1xuXG4gICAgICAgICAgICAgICAgaWYgKG0ub3ZlcnJpZGUpIHtcblxuICAgICAgICAgICAgICAgICAgICB3LnRhYnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG0udGFicykpO1xuICAgICAgICAgICAgICAgICAgICB3LnByb3BzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShtLnByb3BzKSk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChtLnRhYnMpIHcudGFicyA9IHcudGFicy5jb25jYXQobS50YWJzKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG0ucHJvcHMpIHcucHJvcHMgPSB3LnByb3BzLmNvbmNhdChtLnByb3BzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb25maWcubWl4aW5zKSB7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29uZmlnLm1peGlucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBtID0gY29uZmlnLm1peGluc1tpXTtcbiAgICAgICAgICAgICAgICB2aXNpdChyZXN1bHQsIG0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmlzaXQocmVzdWx0LCBjb25maWcpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIFdpZGdldHMuYnVpbGQgPSBmdW5jdGlvbih3aWRnZXQsIHBhcmFtcykge1xuXG4gICAgICAgIHZhciB3ID0gT2JqZWN0LmFzc2lnbihKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHdpZGdldCkpLCB7XG4gICAgICAgICAgICBwYXJhbXM6IHBhcmFtcyB8fCB7fVxuICAgICAgICB9KTtcblxuICAgICAgICBmdW5jdGlvbiBpbml0UGFyYW1zKHByb3BzLCBwYXJhbXMpIHtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHByb3AgPSBwcm9wc1tpXTtcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW0gPSBwYXJhbXNbcHJvcC5uYW1lXSA9IHBhcmFtc1twcm9wLm5hbWVdIHx8IHsgdmFsdWU6IG51bGwgfTsgLy8gVE9ETyBTZXQgYSB0eXBlLWRlcGVuZGVudCBpbml0aWFsIHZhbHVlXG5cbiAgICAgICAgICAgICAgICBpZiAocHJvcC5wcm9wcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcC50eXBlID09ICdtdWx0aXBsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtLnZhbHVlID0gcGFyYW0udmFsdWUgPT0gbnVsbCA/IFtdIDogcGFyYW0udmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBhcmFtLnZhbHVlLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdFBhcmFtcyhwcm9wLnByb3BzLCBwYXJhbS52YWx1ZVtqXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcC50eXBlID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbS52YWx1ZSA9IHBhcmFtLnZhbHVlID09IG51bGwgPyB7fSA6IHBhcmFtLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdFBhcmFtcyhwcm9wLnByb3BzLCBwYXJhbS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpbml0UGFyYW1zKHcucHJvcHMsIHcucGFyYW1zKTtcblxuICAgICAgICByZXR1cm4gdztcbiAgICB9XG5cbiAgICBXaWRnZXRzLkl0ZW0gPSBmdW5jdGlvbihncm91cCwgY29uZmlnKSB7XG5cbiAgICAgICAgdmFyIG5hbWUgPSBjb25maWcubmFtZTtcblxuICAgICAgICBncm91cC5pdGVtKGNvbmZpZy5uYW1lLCBjb25maWcpO1xuXG4gICAgICAgIHJldHVybiBncm91cC5pdGVtKG5hbWUpO1xuICAgIH07XG5cbiAgICBXaWRnZXRzLlByb3AgPSBmdW5jdGlvbihuYW1lLCB0aXRsZSwgdHlwZSwgdGFiLCBwbGFjZWhvbGRlcikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICB0YWI6IHRhYixcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBwbGFjZWhvbGRlcixcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBXaWRnZXRzLlBhcmFtID0gZnVuY3Rpb24odmFsdWUsIGJpbmRpbmcsIHN0cmF0ZWd5KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUgfHwgdW5kZWZpbmVkLFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgVnVlLnNlcnZpY2UoJ3BhbGV0dGUnLCBXaWRnZXRzLlBhbGV0dGUpO1xuXG4gICAgcmV0dXJuIFdpZGdldHM7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcblxuICAgIFdpZGdldHMuQ29tcG9zaXRlQ2F0ZWdvcnkgPSBXaWRnZXRzLkNhdGVnb3J5KCdkZWZhdWx0LWNvbXBvc2l0ZXMnLCAnQ29tcG9zaXRlIEVsZW1lbnRzJyk7XG4gICAgV2lkZ2V0cy5Gb3JtQ2F0ZWdvcnkgPSBXaWRnZXRzLkNhdGVnb3J5KCdkZWZhdWx0LWZvcm0nLCAnRm9ybSBFbGVtZW50cycpO1xuICAgIFdpZGdldHMuVGV4dENhdGVnb3J5ID0gV2lkZ2V0cy5DYXRlZ29yeSgnZGVmYXVsdC10ZXh0JywgJ1RleHQgRWxlbWVudHMnKTtcbiAgICBXaWRnZXRzLkNvbnRhaW5lckNhdGVnb3J5ID0gV2lkZ2V0cy5DYXRlZ29yeSgnZGVmYXVsdC1jb250YWluZXInLCAnQ29udGFpbmVyIEVsZW1lbnRzJyk7XG5cbiAgICBXaWRnZXRzLlV0aWxDYXRlZ29yeSA9IFdpZGdldHMuQ2F0ZWdvcnkoJ2RlZmF1bHQtdXRpbCcsICdVdGlsIEVsZW1lbnRzJywgdHJ1ZSk7XG5cblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFdpZGdldHMpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xuXG4gICAgdmFyIFAgPSBXaWRnZXRzLlByb3BzID0ge307XG4gICAgdmFyIFQgPSBXaWRnZXRzLlRhYnMgPSB7fTtcblxuICAgIFQuRGF0YSA9IHsgbmFtZTogJ2RhdGEnLCB0aXRsZTogJ0RhdGEnIH07XG4gICAgVC5BcHBlYXJhbmNlID0geyBuYW1lOiAnYXBwZWFyYW5jZScsIHRpdGxlOiAnQXBwZWFyYW5jZScgfTtcbiAgICBULkNvbnRlbnQgPSB7IG5hbWU6ICdjb250ZW50JywgdGl0bGU6ICdDb250ZW50JyB9O1xuXG4gICAgUC5JZCA9IHsgbmFtZTogJ2lkJywgdGl0bGU6ICdJRCcsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJywgcGxhY2Vob2xkZXI6ICdVbmlxdWUgSUQnIH07XG5cbiAgICBQLldpZHRoID0geyBuYW1lOiAnd2lkdGgnLCB0aXRsZTogJ1dpZHRoJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2FwcGVhcmFuY2UnIH07XG4gICAgUC5IZWlnaHQgPSB7IG5hbWU6ICdoZWlnaHQnLCB0aXRsZTogJ0hlaWdodCcsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdhcHBlYXJhbmNlJyB9O1xuICAgIFAuUGFkZGluZyA9IHsgbmFtZTogJ3BhZGRpbmcnLCB0aXRsZTogJ1BhZGRpbmcnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnYXBwZWFyYW5jZScgfTtcbiAgICBQLk1hcmdpbiA9IHsgbmFtZTogJ21hcmdpbicsIHRpdGxlOiAnTWFyZ2luJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2FwcGVhcmFuY2UnIH07XG4gICAgUC5Cb3JkZXIgPSB7IG5hbWU6ICdib3JkZXInLCB0aXRsZTogJ0JvcmRlcicsIHR5cGU6ICdzdHJpbmcnLCBwbGFjZWhvbGRlcjogJzFweCBzb2xpZCAjMDAwMDAwJywgdGFiOiAnYXBwZWFyYW5jZScgfTtcbiAgICBQLkJhY2tncm91bmQgPSB7IG5hbWU6ICdiYWNrZ3JvdW5kJywgdGl0bGU6ICdCYWNrZ3JvdW5kJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2FwcGVhcmFuY2UnIH07XG5cbiAgICBQLkNvbHMgPSB7IG5hbWU6ICdjb2xzJywgdGl0bGU6ICdDb2x1bW5zJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2FwcGVhcmFuY2UnIH07XG4gICAgUC5Sb3dzID0geyBuYW1lOiAncm93cycsIHRpdGxlOiAnUm93cycsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdhcHBlYXJhbmNlJyB9O1xuICAgIFAuQ29sb3IgPSB7IG5hbWU6ICdjb2xvcicsIHRpdGxlOiAnQ29sb3InLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnYXBwZWFyYW5jZScgfTtcbiAgICBQLkNvbnRlbnQgPSB7IG5hbWU6ICdjb250ZW50JywgdGl0bGU6ICdDb250ZW50JywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2NvbnRlbnQnIH07XG5cbiAgICBQLlNwYWNpbmcgPSB7IG5hbWU6ICdzcGFjaW5nJywgdGl0bGU6ICdCb3JkZXIgU3BhY2luZycsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdhcHBlYXJhbmNlJyB9O1xuICAgIFAuQ29sbGFwc2UgPSB7IG5hbWU6ICdjb2xsYXBzZScsIHRpdGxlOiAnQm9yZGVyIENvbGxhcHNlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2FwcGVhcmFuY2UnIH07XG5cbiAgICBQLkFsaWduID0geyBuYW1lOiAnYWxpZ24nLCB0aXRsZTogJ1RleHQgQWxpZ24nLCB0eXBlOiAnc2VsZWN0JywgdGFiOiAnYXBwZWFyYW5jZScsIG9wdGlvbnM6IFtcbiAgICAgICAgeyB2YWx1ZTogJ2xlZnQnLCB0ZXh0OiAnTGVmdCcgfSxcbiAgICAgICAgeyB2YWx1ZTogJ3JpZ2h0JywgdGV4dDogJ1JpZ2h0JyB9LFxuICAgICAgICB7IHZhbHVlOiAnY2VudGVyJywgdGV4dDogJ0NlbmV0ZXInIH0sXG4gICAgICAgIHsgdmFsdWU6ICdqdXN0aWZ5JywgdGV4dDogJ0p1c3RpZnknIH0sXG4gICAgXSB9O1xuXG4gICAgUC5Eb2NrID0geyBuYW1lOiAnZG9jaycsIHRpdGxlOiAnRG9jaycsIHR5cGU6ICdzZWxlY3QnLCB0YWI6ICdhcHBlYXJhbmNlJywgb3B0aW9uczogW1xuICAgICAgICB7IHZhbHVlOiAnYWJvdmUnLCB0ZXh0OiAnQWJvdmUnIH0sXG4gICAgICAgIHsgdmFsdWU6ICd0b3AnLCB0ZXh0OiAnVG9wJyB9LFxuICAgICAgICB7IHZhbHVlOiAncmlnaHQnLCB0ZXh0OiAnUmlnaHQnIH0sXG4gICAgICAgIHsgdmFsdWU6ICdib3R0b20nLCB0ZXh0OiAnQm90dG9tJyB9LFxuICAgICAgICB7IHZhbHVlOiAnbGVmdCcsIHRleHQ6ICdMZWZ0JyB9LFxuICAgIF19O1xuXG4gICAgV2lkZ2V0cy5XaWRnZXRNaXhpbiA9IHtcbiAgICAgICAgdGFiczogWyBULkRhdGEsIFQuQXBwZWFyYW5jZSwgVC5Db250ZW50IF0sXG4gICAgICAgIHByb3BzOiBbIFAuSWQgXSxcbiAgICB9O1xuXG4gICAgV2lkZ2V0cy5Cb3hNaXhpbiA9IHtcbiAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ2lubmVyJywgdGl0bGU6ICdJbm5lciBDb250YWluZXInLCB0eXBlOiAnb2JqZWN0JywgdGFiOiAnYXBwZWFyYW5jZScsXG4gICAgICAgICAgICAgICAgdGFiczogWyBULkFwcGVhcmFuY2UgXSxcbiAgICAgICAgICAgICAgICBwcm9wczogWyBQLkJvcmRlciwgUC5CYWNrZ3JvdW5kIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdvdXRlcicsIHRpdGxlOiAnT3V0ZXIgQ29udGFpbmVyJywgdHlwZTogJ29iamVjdCcsIHRhYjogJ2FwcGVhcmFuY2UnLFxuICAgICAgICAgICAgICAgIHRhYnM6IFsgVC5BcHBlYXJhbmNlIF0sXG4gICAgICAgICAgICAgICAgcHJvcHM6IFsgUC5NYXJnaW4sIFAuUGFkZGluZywgUC5Cb3JkZXIsIFAuQmFja2dyb3VuZCBdXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH07XG5cbiAgICBXaWRnZXRzLlNpemVNaXhpbiA9IHtcbiAgICAgICAgcHJvcHM6IFsgUC5XaWR0aCwgUC5IZWlnaHQgXSxcbiAgICB9XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcblxuICAgIFdpZGdldHMuR2FsbGVyeUdyb3VwID0gV2lkZ2V0cy5Hcm91cChXaWRnZXRzLkNvbXBvc2l0ZUNhdGVnb3J5LCAnZGVmYXVsdC1jb21wb3NpdGUtZ2FsbGVyeScsICdHYWxsZXJpZXMnKTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFdpZGdldHMpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xuXG4gICAgV2lkZ2V0cy5TdGFja0dyb3VwID0gV2lkZ2V0cy5Hcm91cChXaWRnZXRzLkNvbnRhaW5lckNhdGVnb3J5LCAnZGVmYXVsdC1jb250YWluZXItc3RhY2snLCAnU3RhY2tlZCcpO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XG5cbiAgICBXaWRnZXRzLkJ1dHRvbnNHcm91cCA9IFdpZGdldHMuR3JvdXAoV2lkZ2V0cy5Gb3JtQ2F0ZWdvcnksICdkZWZhdWx0LWZvcm0tYnV0dG9ucycsICdCdXR0b25zJyk7XG4gICAgV2lkZ2V0cy5JbnB1dHNHcm91cCA9IFdpZGdldHMuR3JvdXAoV2lkZ2V0cy5Gb3JtQ2F0ZWdvcnksICdkZWZhdWx0LWZvcm0taW5wdXRzJywgJ0lucHV0cycpO1xuICAgIFdpZGdldHMuUmFkaW9zR3JvdXAgPSBXaWRnZXRzLkdyb3VwKFdpZGdldHMuRm9ybUNhdGVnb3J5LCAnZGVmYXVsdC1mb3JtLXJhZGlvcycsICdSYWRpb3MnKTtcbiAgICBXaWRnZXRzLkNoZWNrc0dyb3VwID0gV2lkZ2V0cy5Hcm91cChXaWRnZXRzLkZvcm1DYXRlZ29yeSwgJ2RlZmF1bHQtZm9ybS1jaGVja3MnLCAnQ2hlY2tib3hlcycpO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XG5cbiAgICBXaWRnZXRzLkhlYWRpbmdzR3JvdXAgPSBXaWRnZXRzLkdyb3VwKFdpZGdldHMuVGV4dENhdGVnb3J5LCAnZGVmYXVsdC10ZXh0LWhlYWRpbmdzJywgJ0hlYWRpbmdzJyk7XG4gICAgV2lkZ2V0cy5CbG9ja3NHcm91cCA9IFdpZGdldHMuR3JvdXAoV2lkZ2V0cy5UZXh0Q2F0ZWdvcnksICdkZWZhdWx0LXRleHQtYmxvY2tzJywgJ0Jsb2NrcycpO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XG5cbiAgICBXaWRnZXRzLlV0aWxHcm91cCA9IFdpZGdldHMuR3JvdXAoV2lkZ2V0cy5VdGlsQ2F0ZWdvcnksICdkZWZhdWx0LXV0aWwtZ3JvdXAnLCAnVXRpbCBFbGVtZW50cycpO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWNhcm91c2VsJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWNhcm91c2VsJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1nYWxsZXJ5Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWdhbGxlcnknLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBtYXRyaXg6IHRoaXMubWF0cml4LFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnYmluZGluZ3MnLCB1cGRhdGVNYXRyaXguYmluZCh0aGlzKSwgeyBpbW1lZGlhdGU6IHRydWUsIGRlZXA6IHRydWUgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHVwZGF0ZU1hdHJpeChiaW5kaW5ncykge1xuXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gYmluZGluZ3MuaXRlbXMuY29sbGVjdGlvbiB8fCBbXTtcblxuICAgICAgICAgICAgICAgIHZhciByb3dzID0gcGFyc2VJbnQoYmluZGluZ3Mucm93cyk7XG4gICAgICAgICAgICAgICAgcm93cyA9IHJvd3MgPiAwID8gcm93cyA6IDE7XG5cbiAgICAgICAgICAgICAgICB2YXIgY29scyA9IHBhcnNlSW50KGJpbmRpbmdzLmNvbHMpO1xuICAgICAgICAgICAgICAgIGNvbHMgPSBjb2xzID4gMCA/IGNvbHMgOiAzO1xuXG4gICAgICAgICAgICAgICAgdmFyIGNlbGxzID0gcm93cyAqIGNvbHM7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGl2ID0gcGFyc2VJbnQoaXRlbXMubGVuZ3RoIC8gY2VsbHMpO1xuICAgICAgICAgICAgICAgIHZhciBtb2QgPSBpdGVtcy5sZW5ndGggJSBjZWxscztcblxuICAgICAgICAgICAgICAgIHZhciBjb3VudCA9IChtb2QgPiAwIHx8IGRpdiA9PSAwKVxuICAgICAgICAgICAgICAgICAgICA/IGRpdiArIDFcbiAgICAgICAgICAgICAgICAgICAgOiBkaXZcbiAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgICAgICAgICB2YXIgbWF0cml4ID0gW107XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IGNvdW50OyBwKyspIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcGQgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCByb3dzOyByKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgYyA9IDA7IGMgPCBjb2xzOyBjKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAocCAqIHJvd3MgKyByKSAqIGNvbHMgKyBjO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA8IGl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZC5wdXNoKGl0ZW1zW2luZGV4XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGQucHVzaChyZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbWF0cml4LnB1c2gocGQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMubWF0cml4ID0gbWF0cml4O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XG5cbiAgICB2YXIgUCA9IFdpZGdldHMuUHJvcHM7XG4gICAgdmFyIFQgPSBXaWRnZXRzLlRhYnM7XG5cbiAgICBXaWRnZXRzLkdhbGxlcnlXaWRnZXQgPVxuICAgIFdpZGdldHMuV2lkZ2V0KFdpZGdldHMuR2FsbGVyeUdyb3VwLCBXaWRnZXRzLmNyZWF0ZSh7XG4gICAgICAgIG5hbWU6ICdkZWZhdWx0LWdhbGxlcnknLFxuICAgICAgICB0YWc6ICdkZWZhdWx0LWdhbGxlcnknLFxuICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcbiAgICAgICAgcHJvcHM6IFsgUC5Db2xzLCBQLlJvd3MsIFAuRG9jaywgUC5Db2xvciwgUC5BbGlnbixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnYm9yZGVyJywgdGl0bGU6ICdCb3JkZXInLCB0eXBlOiAnb2JqZWN0JywgdGFiOiAnYXBwZWFyYW5jZScsXG4gICAgICAgICAgICAgICAgdGFiczogWyBULkFwcGVhcmFuY2UgXSxcbiAgICAgICAgICAgICAgICBwcm9wczogWyBQLlNwYWNpbmcsIFAuQ29sbGFwc2UgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnaXRlbXMnLCB0aXRsZTogJ0l0ZW1zJywgdHlwZTogJ29iamVjdCcsIHRhYjogJ2RhdGEnLFxuICAgICAgICAgICAgICAgIHRhYnM6IFsgVC5EYXRhLCBULkFwcGVhcmFuY2UgXSxcbiAgICAgICAgICAgICAgICBwcm9wczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnY29sbGVjdGlvbicsIHRpdGxlOiAnQ29sbGVjdGlvbicsIHR5cGU6ICdtdWx0aXBsZScsIHRhYjogJ2RhdGEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFiczogWyBULkFwcGVhcmFuY2UsIFQuQ29udGVudCBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHM6IFsgUC5XaWR0aCwgUC5IZWlnaHQsIFAuTWFyZ2luLCBQLlBhZGRpbmcsIFAuQmFja2dyb3VuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdkcmF3aW5nJywgdGl0bGU6ICdEcmF3aW5nJywgdHlwZTogJ29iamVjdCcsIHRhYjogJ2FwcGVhcmFuY2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJzOiBbIFQuQXBwZWFyYW5jZSBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wczogWyBQLldpZHRoLCBQLkhlaWdodCwgUC5NYXJnaW4sIFAuUGFkZGluZywgUC5CYWNrZ3JvdW5kLCBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZGVzY3JpcHRpb24nLCB0aXRsZTogJ0Rlc2NyaXB0aW9uJywgdHlwZTogJ29iamVjdCcsIHRhYjogJ2FwcGVhcmFuY2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJzOiBbIFQuQXBwZWFyYW5jZSwgVC5Db250ZW50IF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzOiBbIFAuV2lkdGgsIFAuSGVpZ2h0LCBQLk1hcmdpbiwgUC5QYWRkaW5nLCBQLkJhY2tncm91bmQsIFAuQ29sb3IsIFAuQWxpZ24sIFAuQ29udGVudCwgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdzdHlsZScsIHRpdGxlOiAnU3R5bGUnLCB0eXBlOiAnb2JqZWN0JywgdGFiOiAnYXBwZWFyYW5jZScsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWJzOiBbIFQuQXBwZWFyYW5jZSBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHM6IFsgUC5XaWR0aCwgUC5IZWlnaHQsIFAuTWFyZ2luLCBQLlBhZGRpbmcsIFAuQmFja2dyb3VuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdkcmF3aW5nJywgdGl0bGU6ICdEcmF3aW5nJywgdHlwZTogJ29iamVjdCcsIHRhYjogJ2FwcGVhcmFuY2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJzOiBbIFQuQXBwZWFyYW5jZSBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUC5XaWR0aCwgUC5IZWlnaHQsIFAuTWFyZ2luLCBQLlBhZGRpbmcsIFAuQmFja2dyb3VuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZGVzY3JpcHRpb24nLCB0aXRsZTogJ0Rlc2NyaXB0aW9uJywgdHlwZTogJ29iamVjdCcsIHRhYjogJ2FwcGVhcmFuY2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJzOiBbIFQuQXBwZWFyYW5jZSBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wczogWyBQLldpZHRoLCBQLkhlaWdodCwgUC5NYXJnaW4sIFAuUGFkZGluZywgUC5CYWNrZ3JvdW5kLCBQLkNvbG9yLCBQLkFsaWduLCBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH0pKTtcblxuICAgIFdpZGdldHMuR2FsbGVyeVdpZGdldEZhY3RvcnkgPSBmdW5jdGlvbihkZWZhdWx0cykge1xuXG4gICAgICAgIHZhciB3ID0gV2lkZ2V0cy5idWlsZChXaWRnZXRzLkdhbGxlcnlXaWRnZXQsIHtcbiAgICAgICAgICAgIHJvd3M6IHsgdmFsdWU6IGRlZmF1bHRzLnJvd3MgfSxcbiAgICAgICAgICAgIGNvbHM6IHsgdmFsdWU6IGRlZmF1bHRzLmNvbHMgfSxcbiAgICAgICAgICAgIGRvY2s6IHsgdmFsdWU6IGRlZmF1bHRzLmRvY2sgfSxcbiAgICAgICAgICAgIGFsaWduOiB7IHZhbHVlOiBkZWZhdWx0cy5hbGlnbiB9LFxuICAgICAgICAgICAgY29sb3I6IHsgdmFsdWU6IGRlZmF1bHRzLmNvbG9yIH0sXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiB7IHZhbHVlOiBkZWZhdWx0cy5iYWNrZ3JvdW5kIH0sXG4gICAgICAgICAgICBib3JkZXI6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICAgICAgICBzcGFjaW5nOiB7IHZhbHVlOiBkZWZhdWx0cy5ib3JkZXIuc3BhY2luZyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHsgdmFsdWU6IGRlZmF1bHRzLml0ZW1zLnN0eWxlLndpZHRoIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB7IHZhbHVlOiBkZWZhdWx0cy5pdGVtcy5zdHlsZS5oZWlnaHQgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogeyB2YWx1ZTogZGVmYXVsdHMucGFkZGluZyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZGVmYXVsdHMuaXRlbXMuY29sbGVjdGlvbi5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogeyB2YWx1ZTogaXRlbS5kcmF3aW5nLmJhY2tncm91bmQgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogeyB2YWx1ZTogaXRlbS5kZXNjcmlwdGlvbi5jb250ZW50IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdztcbiAgICB9XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5HYWxsZXJ5R3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ2dhbGxlcnktcjFjMWYnLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvY29tcG9zaXRlcy9nYWxsZXJ5L2dhbGxlcnktcjFjMWYucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkdhbGxlcnlXaWRnZXRGYWN0b3J5KHtcbiAgICAgICAgICAgIHJvd3M6IDEsIGNvbHM6IDEsIGRvY2s6ICdhYm92ZScsIHBhZGRpbmc6ICczMHB4JywgYWxpZ246ICdjZW50ZXInLCBjb2xvcjogJyNGRkZGRkYnLFxuICAgICAgICAgICAgYm9yZGVyOiB7XG4gICAgICAgICAgICAgICAgc3BhY2luZzogJzBweCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcyNTBweCcsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI0ZGNjQ2NidcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjQ4cHhcIj5GaXJzdCBJdGVtPC9zcGFuPjwvaDM+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAyOHB4XCI+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzYwNUJFOCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjQ4cHhcIj5TZWNvbmQgSXRlbTwvc3Bhbj48L2gzPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMjhweFwiPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM3MEZGQkYnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTo0OHB4XCI+VGhpcmQgSXRlbTwvc3Bhbj48L2gzPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMjhweFwiPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5HYWxsZXJ5R3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ2dhbGxlcnktcjFjMXInLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvY29tcG9zaXRlcy9nYWxsZXJ5L2dhbGxlcnktcjFjMXIucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkdhbGxlcnlXaWRnZXRGYWN0b3J5KHtcbiAgICAgICAgICAgIHJvd3M6IDEsIGNvbHM6IDEsIGRvY2s6ICdyaWdodCcsIHBhZGRpbmc6ICczMHB4JywgYWxpZ246ICdsZWZ0JywgY29sb3I6ICcjMzMzMzMzJyxcbiAgICAgICAgICAgIGJvcmRlcjoge1xuICAgICAgICAgICAgICAgIHNwYWNpbmc6ICcyMHB4JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzI0MHB4JyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd2luZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjRkY2NDY2J1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4gc3R5bGU9XCJmb250LXNpemU6NDhweFwiPkZpcnN0IEl0ZW08L3NwYW4+PC9oMz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+PHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDI4cHhcIj5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9zcGFuPjwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd2luZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNjA1QkU4J1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4gc3R5bGU9XCJmb250LXNpemU6NDhweFwiPlNlY29uZCBJdGVtPC9zcGFuPjwvaDM+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAyOHB4XCI+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzcwRkZCRidcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjQ4cHhcIj5UaGlyZCBJdGVtPC9zcGFuPjwvaDM+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAyOHB4XCI+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkdhbGxlcnlHcm91cCwge1xuICAgICAgICBuYW1lOiAnZ2FsbGVyeS1yMWMzZicsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9jb21wb3NpdGVzL2dhbGxlcnkvZ2FsbGVyeS1yMWMzZi5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuR2FsbGVyeVdpZGdldEZhY3Rvcnkoe1xuICAgICAgICAgICAgcm93czogMSwgY29sczogMywgZG9jazogJ2Fib3ZlJywgcGFkZGluZzogJzMwcHgnLCBhbGlnbjogJ2NlbnRlcicsIGNvbG9yOiAnI0ZGRkZGRicsXG4gICAgICAgICAgICBib3JkZXI6IHtcbiAgICAgICAgICAgICAgICBzcGFjaW5nOiAnMjBweCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxODBweCcsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI0ZGNjQ2NidcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuPkZpcnN0IEl0ZW08L3NwYW4+PC9oMz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+PHNwYW4+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzYwNUJFOCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuPlNlY29uZCBJdGVtPC9zcGFuPjwvaDM+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM3MEZGQkYnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz48c3Bhbj5UaGlyZCBJdGVtPC9zcGFuPjwvaDM+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNBNTI5MzknXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz48c3Bhbj5Gb3VydGggSXRlbTwvc3Bhbj48L2gzPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3Bhbj5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9zcGFuPjwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd2luZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjRUUzQjgwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4+RmlmdGggSXRlbTwvc3Bhbj48L2gzPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3Bhbj5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9zcGFuPjwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd2luZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjRUU2QjlFJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4+U2l4dGggSXRlbTwvc3Bhbj48L2gzPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3Bhbj5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9zcGFuPjwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgIH0pO1xuXG4gICAgLy8gV2lkZ2V0cy5JdGVtKFdpZGdldHMuR2FsbGVyeUdyb3VwLCB7XG4gICAgLy8gICAgIG5hbWU6ICdnYWxsZXJ5LXIxYzNiJyxcbiAgICAvLyAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2NvbXBvc2l0ZXMvZ2FsbGVyeS9nYWxsZXJ5LXIxYzNiLnBuZycsXG4gICAgLy8gICAgIHdpZGdldDogV2lkZ2V0cy5HYWxsZXJ5V2lkZ2V0RmFjdG9yeSgxLCAzLCAnYm90dG9tJywgJzEwMCUnLCAnNDAwcHgnLCAnMzBweCcsIFtcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5GaXJzdCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjRkYzNTAwJyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPlNlY29uZCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjREMwMDU1JyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPlRoaXJkIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNCRjAwMzcnIH0sXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+Rm91cnRoIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNBNTI5MzknIH0sXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+RmlmdGggSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0VFM0I4MCcgfSxcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5TaXh0aCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjRUU2QjlFJyB9LFxuICAgIC8vICAgICBdKSxcbiAgICAvLyB9KTtcbiAgICAvL1xuICAgIC8vIFdpZGdldHMuSXRlbShXaWRnZXRzLkdhbGxlcnlHcm91cCwge1xuICAgIC8vICAgICBuYW1lOiAnZ2FsbGVyeS1yMmM0ZicsXG4gICAgLy8gICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9jb21wb3NpdGVzL2dhbGxlcnkvZ2FsbGVyeS1yMmM0Zi5wbmcnLFxuICAgIC8vICAgICB3aWRnZXQ6IFdpZGdldHMuR2FsbGVyeVdpZGdldEZhY3RvcnkoMiwgNCwgJ2Fib3ZlJywgJzEwMCUnLCAnNDAwcHgnLCAnMzBweCcsIFtcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5GaXJzdCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjRkYzNTAwJyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPlNlY29uZCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjREMwMDU1JyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPlRoaXJkIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNCRjAwMzcnIH0sXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+Rm91cnRoIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNBNTI5MzknIH0sXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+RmlmdGggSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0VFM0I4MCcgfSxcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5TaXh0aCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjRUU2QjlFJyB9LFxuICAgIC8vICAgICBdKSxcbiAgICAvLyB9KTtcbiAgICAvL1xuICAgIC8vIFdpZGdldHMuSXRlbShXaWRnZXRzLkdhbGxlcnlHcm91cCwge1xuICAgIC8vICAgICBuYW1lOiAnZ2FsbGVyeS1yMmM0YicsXG4gICAgLy8gICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9jb21wb3NpdGVzL2dhbGxlcnkvZ2FsbGVyeS1yMmM0Yi5wbmcnLFxuICAgIC8vICAgICB3aWRnZXQ6IFdpZGdldHMuR2FsbGVyeVdpZGdldEZhY3RvcnkoMiwgNCwgJ2JvdHRvbScsICcxMDAlJywgJzQwMHB4JywgJzMwcHgnLCBbXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+Rmlyc3QgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0ZGMzUwMCcgfSxcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5TZWNvbmQgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0RDMDA1NScgfSxcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5UaGlyZCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjQkYwMDM3JyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZvdXJ0aCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjQTUyOTM5JyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZpZnRoIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNFRTNCODAnIH0sXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+U2l4dGggSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0VFNkI5RScgfSxcbiAgICAvLyAgICAgXSksXG4gICAgLy8gfSk7XG4gICAgLy9cbiAgICAvLyBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5HYWxsZXJ5R3JvdXAsIHtcbiAgICAvLyAgICAgbmFtZTogJ2dhbGxlcnktcjJjM2YnLFxuICAgIC8vICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvY29tcG9zaXRlcy9nYWxsZXJ5L2dhbGxlcnktcjJjM2YucG5nJyxcbiAgICAvLyAgICAgd2lkZ2V0OiBXaWRnZXRzLkdhbGxlcnlXaWRnZXRGYWN0b3J5KDIsIDMsICdhYm92ZScsICcxMDAlJywgJzQwMHB4JywgJzMwcHgnLCBbXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+Rmlyc3QgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0ZGMzUwMCcgfSxcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5TZWNvbmQgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0RDMDA1NScgfSxcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5UaGlyZCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjQkYwMDM3JyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZvdXJ0aCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjQTUyOTM5JyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZpZnRoIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNFRTNCODAnIH0sXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+U2l4dGggSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0VFNkI5RScgfSxcbiAgICAvLyAgICAgXSksXG4gICAgLy8gfSk7XG4gICAgLy9cbiAgICAvLyBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5HYWxsZXJ5R3JvdXAsIHtcbiAgICAvLyAgICAgbmFtZTogJ2dhbGxlcnktcjNjMnInLFxuICAgIC8vICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvY29tcG9zaXRlcy9nYWxsZXJ5L2dhbGxlcnktcjNjMnIucG5nJyxcbiAgICAvLyAgICAgd2lkZ2V0OiBXaWRnZXRzLkdhbGxlcnlXaWRnZXRGYWN0b3J5KDMsIDIsICdyaWdodCcsICcxMDAlJywgJzQwMHB4JywgJzMwcHgnLCBbXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+Rmlyc3QgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0ZGMzUwMCcgfSxcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5TZWNvbmQgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0RDMDA1NScgfSxcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5UaGlyZCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjQkYwMDM3JyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZvdXJ0aCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjQTUyOTM5JyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZpZnRoIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNFRTNCODAnIH0sXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+U2l4dGggSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0VFNkI5RScgfSxcbiAgICAvLyAgICAgXSksXG4gICAgLy8gfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcblxuICAgIFdpZGdldHMuU3RhY2tIb3Jpc29udGFsV2lkZ2V0ID1cbiAgICBXaWRnZXRzLldpZGdldChXaWRnZXRzLlN0YWNrR3JvdXAsIFdpZGdldHMuY3JlYXRlKHtcbiAgICAgICAgbmFtZTogJ2RlZmF1bHQtc3RhY2staG9yaXNvbnRhbCcsXG4gICAgICAgIHRhZzogJ2RlZmF1bHQtc3RhY2staG9yaXNvbnRhbCcsXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluIF0sXG4gICAgICAgIHdpZGdldHM6IFtdLFxuICAgIH0pKTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLlN0YWNrR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ3N0YWNrLWhvcmlzb250YWwnLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvY29udGFpbmVyL3N0YWNrL3N0YWNrLWhvcmlzb250YWwucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLmJ1aWxkKFdpZGdldHMuU3RhY2tIb3Jpc29udGFsV2lkZ2V0KSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuU3RhY2tWZXJ0aWNhbFdpZGdldCA9XG4gICAgV2lkZ2V0cy5XaWRnZXQoV2lkZ2V0cy5TdGFja0dyb3VwLCBXaWRnZXRzLmNyZWF0ZSh7XG4gICAgICAgIG5hbWU6ICdkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJyxcbiAgICAgICAgdGFnOiAnZGVmYXVsdC1zdGFjay12ZXJ0aWNhbCcsXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluIF0sXG4gICAgICAgIHdpZGdldHM6IFtdLFxuICAgIH0pKTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLlN0YWNrR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ3N0YWNrLXZlcnRpY2FsJyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2NvbnRhaW5lci9zdGFjay9zdGFjay12ZXJ0aWNhbC5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuYnVpbGQoV2lkZ2V0cy5TdGFja1ZlcnRpY2FsV2lkZ2V0LCB7fSksXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIlNoZWxsID0gd2luZG93LlNoZWxsIHx8IHt9O1xuXG4oZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgdW5kZWZpbmVkKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXN0YWNrLWNhbnZhcycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zdGFjay1jYW52YXMnLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5TdGFja2VkTWl4aW4gXSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3RhY2staG9yaXNvbnRhbCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zdGFjay1ob3Jpc29udGFsJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4sIENvcmUuU3RhY2tlZE1peGluIF0sXG4gICAgfSk7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4sIENvcmUuU3RhY2tlZE1peGluIF0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWJ1dHRvbicsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1idXR0b24nLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XG5cbiAgICBXaWRnZXRzLkJ1dHRvbldpZGdldCA9XG4gICAgV2lkZ2V0cy5XaWRnZXQoV2lkZ2V0cy5CdXR0b25zR3JvdXAsIFdpZGdldHMuY3JlYXRlKHtcbiAgICAgICAgbmFtZTogJ2RlZmF1bHQtYnV0dG9uJyxcbiAgICAgICAgdGFnOiAnZGVmYXVsdC1idXR0b24nLFxuICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcbiAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ3RpdGxlJywgdGl0bGU6ICdUaXRsZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdjb250ZW50JyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAndHlwZScsIHRpdGxlOiAnVHlwZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnc3RlcmVvdHlwZScsIHRpdGxlOiAnU3RlcmVvdHlwZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICBdLFxuICAgIH0pKTtcblxuICAgIFdpZGdldHMuQnV0dG9uV2lkZ2V0RmFjdG9yeSA9IGZ1bmN0aW9uKHRpdGxlLCBzdGVyZW90eXBlKSB7XG5cbiAgICAgICAgdmFyIHcgPSBXaWRnZXRzLmJ1aWxkKFdpZGdldHMuQnV0dG9uV2lkZ2V0LCB7XG4gICAgICAgICAgICBpbm5lcjoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiAge1xuICAgICAgICAgICAgICAgICAgICBtYXJnaW46IHsgdmFsdWU6ICcxNXB4IDE1cHgnIH0sXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHR5cGU6IHsgdmFsdWU6ICdidXR0b24nIH0sXG4gICAgICAgICAgICB0aXRsZTogeyB2YWx1ZTogdGl0bGUgfSxcbiAgICAgICAgICAgIHN0ZXJlb3R5cGU6IHsgdmFsdWU6IHN0ZXJlb3R5cGUgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdztcbiAgICB9XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CdXR0b25zR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ2J1dHRvbi1kZWZhdWx0JyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vYnV0dG9uL2J1dHRvbi1kZWZhdWx0LnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5CdXR0b25XaWRnZXRGYWN0b3J5KCdEZWZhdWx0JywgJ2RlZmF1bHQnKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJ1dHRvbnNHcm91cCwge1xuICAgICAgICBuYW1lOiAnYnV0dG9uLXByaW1hcnknLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9idXR0b24vYnV0dG9uLXByaW1hcnkucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkJ1dHRvbldpZGdldEZhY3RvcnkoJ1ByaW1hcnknLCAncHJpbWFyeScpLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQnV0dG9uc0dyb3VwLCB7XG4gICAgICAgIG5hbWU6ICdidXR0b24tc3VjY2VzcycsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2J1dHRvbi9idXR0b24tc3VjY2Vzcy5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuQnV0dG9uV2lkZ2V0RmFjdG9yeSgnU3VjY2VzcycsICdzdWNjZXNzJyksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CdXR0b25zR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ2J1dHRvbi1pbmZvJyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vYnV0dG9uL2J1dHRvbi1pbmZvLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5CdXR0b25XaWRnZXRGYWN0b3J5KCdJbmZvJywgJ2luZm8nKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJ1dHRvbnNHcm91cCwge1xuICAgICAgICBuYW1lOiAnYnV0dG9uLXdhcm5pbmcnLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9idXR0b24vYnV0dG9uLXdhcm5pbmcucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkJ1dHRvbldpZGdldEZhY3RvcnkoJ1dhcm5pbmcnLCAnd2FybmluZycpLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQnV0dG9uc0dyb3VwLCB7XG4gICAgICAgIG5hbWU6ICdidXR0b24tZGFuZ2VyJyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vYnV0dG9uL2J1dHRvbi1kYW5nZXIucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkJ1dHRvbldpZGdldEZhY3RvcnkoJ0RhbmdlcicsICdkYW5nZXInKSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFdpZGdldHMpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1jaGVjaycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1jaGVjaycsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcblxuICAgIFdpZGdldHMuQ2hlY2tXaWRnZXQgPVxuICAgIFdpZGdldHMuV2lkZ2V0KFdpZGdldHMuQ2hlY2tzR3JvdXAsIFdpZGdldHMuY3JlYXRlKHtcbiAgICAgICAgbmFtZTogJ2RlZmF1bHQtY2hlY2snLFxuICAgICAgICB0YWc6ICdkZWZhdWx0LWNoZWNrJyxcbiAgICAgICAgbWl4aW5zOiBbIFdpZGdldHMuV2lkZ2V0TWl4aW4sIFdpZGdldHMuQm94TWl4aW4sIFdpZGdldHMuU2l6ZU1peGluIF0sXG4gICAgICAgIHByb3BzOiBbXG4gICAgICAgICAgICB7IG5hbWU6ICdtb2RlbCcsIHRpdGxlOiAnTW9kZWwnLCB0eXBlOiAndmFyJywgdGFiOiAnZGF0YScsIHZhcmlhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdzdGVyZW90eXBlJywgdGl0bGU6ICdTdGVyZW90eXBlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2l0ZW1zJywgdHlwZTogJ211bHRpcGxlJywgdGl0bGU6ICdJdGVtcycsIHRhYjogJ2RhdGEnLFxuICAgICAgICAgICAgICAgIHRhYnM6IFtcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnZGF0YScsIHRpdGxlOiAnRGF0YScgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHByb3BzOiBbXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ3ZhbHVlJywgdGl0bGU6ICdWYWx1ZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdsYWJlbCcsIHRpdGxlOiAnTGFiZWwnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH0pKTtcblxuICAgIFdpZGdldHMuQ2hlY2tXaWRnZXRGYWN0b3J5ID0gZnVuY3Rpb24oc3RlcmVvdHlwZSwgdmFsdWUsIG9wdGlvbnMpIHtcblxuICAgICAgICByZXR1cm4gV2lkZ2V0cy5idWlsZChXaWRnZXRzLkNoZWNrV2lkZ2V0LCB7XG4gICAgICAgICAgICBtb2RlbDoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiB7IHZhbHVlOiB2YWx1ZSB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWFyZ2luOiB7IHZhbHVlOiAnMTVweCAxNXB4JyB9LFxuICAgICAgICAgICAgc3RlcmVvdHlwZTogeyB2YWx1ZTogc3RlcmVvdHlwZSB9LFxuICAgICAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogb3B0aW9ucy5tYXAoZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogeyB2YWx1ZTogb3B0aW9uLnZhbHVlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogeyB2YWx1ZTogb3B0aW9uLmxhYmVsIH0sXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQ2hlY2tzR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ2NoZWNrLWRlZmF1bHQnLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9jaGVjay9jaGVjay1kZWZhdWx0LnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5DaGVja1dpZGdldEZhY3RvcnkoJ2RlZmF1bHQnLCBbICdBJywgJ0InIF0sIFtcbiAgICAgICAgICAgIHsgdmFsdWU6ICdBJywgbGFiZWw6ICdBJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJ0InLCBsYWJlbDogJ0InIH0sXG4gICAgICAgICAgICB7IHZhbHVlOiAnQycsIGxhYmVsOiAnQycgfSxcbiAgICAgICAgXSksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5DaGVja3NHcm91cCwge1xuICAgICAgICBuYW1lOiAnY2hlY2stcHJpbWFyeScsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2NoZWNrL2NoZWNrLXByaW1hcnkucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkNoZWNrV2lkZ2V0RmFjdG9yeSgncHJpbWFyeScsIFsgJ0EnLCAnQicgXSwgW1xuICAgICAgICAgICAgeyB2YWx1ZTogJ0EnLCBsYWJlbDogJ0EnIH0sXG4gICAgICAgICAgICB7IHZhbHVlOiAnQicsIGxhYmVsOiAnQicgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICdDJywgbGFiZWw6ICdDJyB9LFxuICAgICAgICBdKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkNoZWNrc0dyb3VwLCB7XG4gICAgICAgIG5hbWU6ICdjaGVjay1zdWNjZXNzJyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vY2hlY2svY2hlY2stc3VjY2Vzcy5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuQ2hlY2tXaWRnZXRGYWN0b3J5KCdzdWNjZXNzJywgWyAnQScsICdCJyBdLCBbXG4gICAgICAgICAgICB7IHZhbHVlOiAnQScsIGxhYmVsOiAnQScgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICdCJywgbGFiZWw6ICdCJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJ0MnLCBsYWJlbDogJ0MnIH0sXG4gICAgICAgIF0pLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQ2hlY2tzR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ2NoZWNrLWluZm8nLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9jaGVjay9jaGVjay1pbmZvLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5DaGVja1dpZGdldEZhY3RvcnkoJ2luZm8nLCBbICdBJywgJ0InIF0sIFtcbiAgICAgICAgICAgIHsgdmFsdWU6ICdBJywgbGFiZWw6ICdBJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJ0InLCBsYWJlbDogJ0InIH0sXG4gICAgICAgICAgICB7IHZhbHVlOiAnQycsIGxhYmVsOiAnQycgfSxcbiAgICAgICAgXSksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5DaGVja3NHcm91cCwge1xuICAgICAgICBuYW1lOiAnY2hlY2std2FybmluZycsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2NoZWNrL2NoZWNrLXdhcm5pbmcucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkNoZWNrV2lkZ2V0RmFjdG9yeSgnd2FybmluZycsIFsgJ0EnLCAnQicgXSwgW1xuICAgICAgICAgICAgeyB2YWx1ZTogJ0EnLCBsYWJlbDogJ0EnIH0sXG4gICAgICAgICAgICB7IHZhbHVlOiAnQicsIGxhYmVsOiAnQicgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICdDJywgbGFiZWw6ICdDJyB9LFxuICAgICAgICBdKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkNoZWNrc0dyb3VwLCB7XG4gICAgICAgIG5hbWU6ICdjaGVjay1kYW5nZXInLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9jaGVjay9jaGVjay1kYW5nZXIucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkNoZWNrV2lkZ2V0RmFjdG9yeSgnZGFuZ2VyJywgWyAnQScsICdCJyBdLCBbXG4gICAgICAgICAgICB7IHZhbHVlOiAnQScsIGxhYmVsOiAnQScgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICdCJywgbGFiZWw6ICdCJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJ0MnLCBsYWJlbDogJ0MnIH0sXG4gICAgICAgIF0pLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWlucHV0LXRleHQnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtaW5wdXQtdGV4dCcsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ21vZGVsJywgdGhpcy5iaW5kaW5ncyk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnc3RvcmFnZScsIHRoaXMuc3RvcmFnZS5vbmUpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWlucHV0LXRleHRhcmVhJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWlucHV0LXRleHRhcmVhJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtaW5wdXQtY2hlY2tib3gnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtaW5wdXQtY2hlY2tib3gnLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgIH0pO1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1pbnB1dC1yYWRpbycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1pbnB1dC1yYWRpbycsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcblxuICAgIFdpZGdldHMuSW5wdXRXaWRnZXQgPVxuICAgIFdpZGdldHMuV2lkZ2V0KFdpZGdldHMuSW5wdXRzR3JvdXAsIFdpZGdldHMuY3JlYXRlKHtcbiAgICAgICAgbmFtZTogJ2RlZmF1bHQtaW5wdXQtdGV4dCcsXG4gICAgICAgIHRhZzogJ2RlZmF1bHQtaW5wdXQtdGV4dCcsXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluLCBXaWRnZXRzLlNpemVNaXhpbiBdLFxuICAgICAgICBwcm9wczogW1xuICAgICAgICAgICAgeyBuYW1lOiAnbW9kZWwnLCB0aXRsZTogJ01vZGVsJywgdHlwZTogJ3ZhcicsIHRhYjogJ2RhdGEnLCB2YXJpYWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAndHlwZScsIHRpdGxlOiAnVHlwZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdjb250ZW50JyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnbGFiZWwnLCB0aXRsZTogJ0xhYmVsJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2NvbnRlbnQnIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdwbGFjZWhvbGRlcicsIHRpdGxlOiAnUGxhY2Vob2xkZXInLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnY29udGVudCcgfSxcbiAgICAgICAgXSxcbiAgICB9KSk7XG5cbiAgICBXaWRnZXRzLklucHV0V2lkZ2V0RmFjdG9yeSA9IGZ1bmN0aW9uKGxhYmVsLCB0eXBlKSB7XG5cbiAgICAgICAgcmV0dXJuIFdpZGdldHMuYnVpbGQoV2lkZ2V0cy5JbnB1dFdpZGdldCwge1xuICAgICAgICAgICAgbW9kZWw6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogeyB2YWx1ZTogJycgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1hcmdpbjogeyB2YWx1ZTogJzE1cHggMTVweCcgfSxcbiAgICAgICAgICAgIGxhYmVsOiB7IHZhbHVlOiBsYWJlbCB9LFxuICAgICAgICAgICAgdHlwZTogeyB2YWx1ZTogdHlwZSB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuSW5wdXRzR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ2lucHV0LXRleHQnLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9pbnB1dC90ZXh0LnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5JbnB1dFdpZGdldEZhY3RvcnkoJ0lucHV0JywgJ3RleHQnKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuVGV4dGFyZWFXaWRnZXQgPVxuICAgIFdpZGdldHMuV2lkZ2V0KFdpZGdldHMuSW5wdXRzR3JvdXAsIFdpZGdldHMuY3JlYXRlKHtcbiAgICAgICAgbmFtZTogJ2RlZmF1bHQtaW5wdXQtdGV4dGFyZWEnLFxuICAgICAgICB0YWc6ICdkZWZhdWx0LWlucHV0LXRleHRhcmVhJyxcbiAgICAgICAgbWl4aW5zOiBbIFdpZGdldHMuV2lkZ2V0TWl4aW4sIFdpZGdldHMuQm94TWl4aW4sIFdpZGdldHMuU2l6ZU1peGluIF0sXG4gICAgICAgIHByb3BzOiBbXG4gICAgICAgICAgICB7IG5hbWU6ICdtb2RlbCcsIHRpdGxlOiAnTW9kZWwnLCB0eXBlOiAndmFyJywgdGFiOiAnZGF0YScsIHZhcmlhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdsYWJlbCcsIHRpdGxlOiAnTGFiZWwnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ3BsYWNlaG9sZGVyJywgdGl0bGU6ICdQbGFjZWhvbGRlcicsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICBdLFxuICAgIH0pKTtcblxuICAgIFdpZGdldHMuVGV4dGFyZWFXaWRnZXRGYWN0b3J5ID0gZnVuY3Rpb24obGFiZWwsIHBsYWNlaG9sZGVyKSB7XG5cbiAgICAgICAgcmV0dXJuIFdpZGdldHMuYnVpbGQoV2lkZ2V0cy5UZXh0YXJlYVdpZGdldCwge1xuICAgICAgICAgICAgbW9kZWw6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogeyB2YWx1ZTogJycgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiB7IHZhbHVlOiBwbGFjZWhvbGRlciB9LFxuICAgICAgICAgICAgbWFyZ2luOiB7IHZhbHVlOiAnMTVweCAxNXB4JyB9LFxuICAgICAgICAgICAgbGFiZWw6IHsgdmFsdWU6IGxhYmVsIH0sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5JbnB1dHNHcm91cCwge1xuICAgICAgICBuYW1lOiAnaW5wdXQtdGV4dGFyZWEnLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9pbnB1dC90ZXh0YXJlYS5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuVGV4dGFyZWFXaWRnZXRGYWN0b3J5KCdUZXh0YXJlYScsICdUeXBlIG1lc3NhZ2UgaGVyZScpLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5SYWRpb0lucHV0V2lkZ2V0ID1cbiAgICBXaWRnZXRzLldpZGdldChXaWRnZXRzLklucHV0c0dyb3VwLCBXaWRnZXRzLmNyZWF0ZSh7XG4gICAgICAgIG5hbWU6ICdkZWZhdWx0LWlucHV0LXJhZGlvJyxcbiAgICAgICAgdGFnOiAnZGVmYXVsdC1pbnB1dC1yYWRpbycsXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluLCBXaWRnZXRzLlNpemVNaXhpbiBdLFxuICAgICAgICBwcm9wczogW1xuICAgICAgICAgICAgeyBuYW1lOiAnbW9kZWwnLCB0aXRsZTogJ01vZGVsJywgdHlwZTogJ3ZhcicsIHRhYjogJ2RhdGEnLCB2YXJpYWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnc3RlcmVvdHlwZScsIHRpdGxlOiAnU3RlcmVvdHlwZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdpdGVtcycsIHR5cGU6ICdtdWx0aXBsZScsIHRpdGxlOiAnSXRlbXMnLCB0YWI6ICdkYXRhJyxcbiAgICAgICAgICAgICAgICB0YWJzOiBbXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2RhdGEnLCB0aXRsZTogJ0RhdGEnIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBwcm9wczogW1xuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICd2YWx1ZScsIHRpdGxlOiAnVmFsdWUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnbGFiZWwnLCB0aXRsZTogJ0xhYmVsJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICB9KSk7XG5cbiAgICBXaWRnZXRzLlJhZGlvSW5wdXRXaWRnZXRGYWN0b3J5ID0gZnVuY3Rpb24odmFsdWUsIG9wdGlvbnMpIHtcblxuICAgICAgICByZXR1cm4gV2lkZ2V0cy5idWlsZChXaWRnZXRzLlJhZGlvSW5wdXRXaWRnZXQsIHtcbiAgICAgICAgICAgIG1vZGVsOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHsgdmFsdWU6IHZhbHVlIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtYXJnaW46IHsgdmFsdWU6ICcxNXB4IDE1cHgnIH0sXG4gICAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBvcHRpb25zLm1hcChmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBXaWRnZXRzLlBhcmFtKG9wdGlvbi52YWx1ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogV2lkZ2V0cy5QYXJhbShvcHRpb24ubGFiZWwpLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5JbnB1dHNHcm91cCwge1xuICAgICAgICBuYW1lOiAnaW5wdXQtcmFkaW8nLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9pbnB1dC9yYWRpby5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuUmFkaW9JbnB1dFdpZGdldEZhY3RvcnkoJzEnLCBbXG4gICAgICAgICAgICB7IHZhbHVlOiAnMScsIGxhYmVsOiAnRmlyc3QnIH0sXG4gICAgICAgICAgICB7IHZhbHVlOiAnMicsIGxhYmVsOiAnU2Vjb25kJyB9LFxuICAgICAgICBdKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuQ2hlY2tJbnB1dFdpZGdldCA9XG4gICAgV2lkZ2V0cy5XaWRnZXQoV2lkZ2V0cy5JbnB1dHNHcm91cCwgV2lkZ2V0cy5jcmVhdGUoe1xuICAgICAgICBuYW1lOiAnZGVmYXVsdC1pbnB1dC1jaGVja2JveCcsXG4gICAgICAgIHRhZzogJ2RlZmF1bHQtaW5wdXQtY2hlY2tib3gnLFxuICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcbiAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ21vZGVsJywgdGl0bGU6ICdNb2RlbCcsIHR5cGU6ICd2YXInLCB0YWI6ICdkYXRhJywgdmFyaWFibGU6IHRydWUgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ3N0ZXJlb3R5cGUnLCB0aXRsZTogJ1N0ZXJlb3R5cGUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnaXRlbXMnLCB0eXBlOiAnbXVsdGlwbGUnLCB0aXRsZTogJ0l0ZW1zJywgdGFiOiAnZGF0YScsXG4gICAgICAgICAgICAgICAgdGFiczogW1xuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdkYXRhJywgdGl0bGU6ICdEYXRhJyB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAndmFsdWUnLCB0aXRsZTogJ1ZhbHVlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2xhYmVsJywgdGl0bGU6ICdMYWJlbCcsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgfSkpO1xuXG4gICAgV2lkZ2V0cy5DaGVja0lucHV0V2lkZ2V0RmFjdG9yeSA9IGZ1bmN0aW9uKHZhbHVlLCBvcHRpb25zKSB7XG5cbiAgICAgICAgcmV0dXJuIFdpZGdldHMuYnVpbGQoV2lkZ2V0cy5DaGVja0lucHV0V2lkZ2V0LCB7XG4gICAgICAgICAgICBtb2RlbDoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiB7IHZhbHVlOiB2YWx1ZSB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWFyZ2luOiB7IHZhbHVlOiAnMTVweCAxNXB4JyB9LFxuICAgICAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogb3B0aW9ucy5tYXAoZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogV2lkZ2V0cy5QYXJhbShvcHRpb24udmFsdWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFdpZGdldHMuUGFyYW0ob3B0aW9uLmxhYmVsKSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuSW5wdXRzR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ2lucHV0LWNoZWNrJyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vaW5wdXQvY2hlY2tib3gucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkNoZWNrSW5wdXRXaWRnZXRGYWN0b3J5KFsgJzEnIF0sIFtcbiAgICAgICAgICAgIHsgdmFsdWU6ICcxJywgbGFiZWw6ICdGaXJzdCcgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICcyJywgbGFiZWw6ICdTZWNvbmQnIH0sXG4gICAgICAgIF0pLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XG5cbiAgICBXaWRnZXRzLlJhZGlvV2lkZ2V0ID1cbiAgICBXaWRnZXRzLldpZGdldChXaWRnZXRzLlJhZGlvc0dyb3VwLCBXaWRnZXRzLmNyZWF0ZSh7XG4gICAgICAgIG5hbWU6ICdkZWZhdWx0LXJhZGlvJyxcbiAgICAgICAgdGFnOiAnZGVmYXVsdC1yYWRpbycsXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluLCBXaWRnZXRzLlNpemVNaXhpbiBdLFxuICAgICAgICBwcm9wczogW1xuICAgICAgICAgICAgeyBuYW1lOiAnbW9kZWwnLCB0aXRsZTogJ01vZGVsJywgdHlwZTogJ3ZhcicsIHRhYjogJ2RhdGEnLCB2YXJpYWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnc3RlcmVvdHlwZScsIHRpdGxlOiAnU3RlcmVvdHlwZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdpdGVtcycsIHR5cGU6ICdtdWx0aXBsZScsIHRpdGxlOiAnSXRlbXMnLCB0YWI6ICdkYXRhJyxcbiAgICAgICAgICAgICAgICB0YWJzOiBbXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2RhdGEnLCB0aXRsZTogJ0RhdGEnIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBwcm9wczogW1xuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICd2YWx1ZScsIHRpdGxlOiAnVmFsdWUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnbGFiZWwnLCB0aXRsZTogJ0xhYmVsJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICB9KSk7XG5cbiAgICBXaWRnZXRzLlJhZGlvV2lkZ2V0RmFjdG9yeSA9IGZ1bmN0aW9uKHN0ZXJlb3R5cGUsIHZhbHVlLCBvcHRpb25zKSB7XG5cbiAgICAgICAgcmV0dXJuIFdpZGdldHMuYnVpbGQoV2lkZ2V0cy5SYWRpb1dpZGdldCwge1xuICAgICAgICAgICAgbW9kZWw6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogeyB2YWx1ZTogdmFsdWUgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1hcmdpbjogeyB2YWx1ZTogJzE1cHggMTVweCcgfSxcbiAgICAgICAgICAgIHN0ZXJlb3R5cGU6IHsgdmFsdWU6IHN0ZXJlb3R5cGUgfSxcbiAgICAgICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IG9wdGlvbnMubWFwKGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHsgdmFsdWU6IG9wdGlvbi52YWx1ZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHsgdmFsdWU6IG9wdGlvbi5sYWJlbCB9LFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5SYWRpb3NHcm91cCwge1xuICAgICAgICBuYW1lOiAncmFkaW8tZGVmYXVsdCcsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL3JhZGlvL3JhZGlvLWRlZmF1bHQucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlJhZGlvV2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsICcxJywgW1xuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJzAnLCBsYWJlbDogJ09mZicgfSxcbiAgICAgICAgXSksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5SYWRpb3NHcm91cCwge1xuICAgICAgICBuYW1lOiAncmFkaW8tcHJpbWFyeScsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL3JhZGlvL3JhZGlvLXByaW1hcnkucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlJhZGlvV2lkZ2V0RmFjdG9yeSgncHJpbWFyeScsICcxJywgW1xuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJzAnLCBsYWJlbDogJ09mZicgfSxcbiAgICAgICAgXSksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5SYWRpb3NHcm91cCwge1xuICAgICAgICBuYW1lOiAncmFkaW8tc3VjY2VzcycsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL3JhZGlvL3JhZGlvLXN1Y2Nlc3MucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlJhZGlvV2lkZ2V0RmFjdG9yeSgnc3VjY2VzcycsICcxJywgW1xuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJzAnLCBsYWJlbDogJ09mZicgfSxcbiAgICAgICAgXSksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5SYWRpb3NHcm91cCwge1xuICAgICAgICBuYW1lOiAncmFkaW8taW5mbycsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL3JhZGlvL3JhZGlvLWluZm8ucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlJhZGlvV2lkZ2V0RmFjdG9yeSgnaW5mbycsICcxJywgW1xuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJzAnLCBsYWJlbDogJ09mZicgfSxcbiAgICAgICAgXSksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5SYWRpb3NHcm91cCwge1xuICAgICAgICBuYW1lOiAncmFkaW8td2FybmluZycsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL3JhZGlvL3JhZGlvLXdhcm5pbmcucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlJhZGlvV2lkZ2V0RmFjdG9yeSgnd2FybmluZycsICcxJywgW1xuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJzAnLCBsYWJlbDogJ09mZicgfSxcbiAgICAgICAgXSksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5SYWRpb3NHcm91cCwge1xuICAgICAgICBuYW1lOiAncmFkaW8tZGFuZ2VyJyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vcmFkaW8vcmFkaW8tZGFuZ2VyLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5SYWRpb1dpZGdldEZhY3RvcnkoJ2RhbmdlcicsICcxJywgW1xuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJzAnLCBsYWJlbDogJ09mZicgfSxcbiAgICAgICAgXSksXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtcmFkaW8nLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtcmFkaW8nLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XG5cbiAgICBXaWRnZXRzLlRleHRXaWRnZXQgPVxuICAgIFdpZGdldHMuV2lkZ2V0KFdpZGdldHMuQmxvY2tzR3JvdXAsIFdpZGdldHMuY3JlYXRlKHtcbiAgICAgICAgbmFtZTogJ2RlZmF1bHQtdGV4dCcsXG4gICAgICAgIHRhZzogJ2RlZmF1bHQtdGV4dCcsXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluLCBXaWRnZXRzLlNpemVNaXhpbiBdLFxuICAgICAgICBwcm9wczogW1xuICAgICAgICAgICAgeyBuYW1lOiAnc3RlcmVvdHlwZScsIHRpdGxlOiAnU3RlcmVvdHlwZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnY29udGVudCcsIHRpdGxlOiAnQ29udGVudCcsIHR5cGU6ICdyaWNoJywgdGFiOiAnY29udGVudCcgfSxcbiAgICAgICAgXSxcbiAgICB9KSk7XG5cbiAgICBXaWRnZXRzLlRleHRXaWRnZXRGYWN0b3J5ID0gZnVuY3Rpb24oc3RlcmVvdHlwZSwgY29udGVudCkge1xuXG4gICAgICAgIHJldHVybiBXaWRnZXRzLmJ1aWxkKFdpZGdldHMuVGV4dFdpZGdldCwge1xuICAgICAgICAgICAgY29udGVudDogeyB2YWx1ZTogY29udGVudCB9LFxuICAgICAgICAgICAgbWFyZ2luOiB7IHZhbHVlOiAnMTVweCAxNXB4JyB9LFxuICAgICAgICAgICAgc3RlcmVvdHlwZTogeyB2YWx1ZTogc3RlcmVvdHlwZSB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5IZWFkaW5nc0dyb3VwLCB7XG4gICAgICAgIG5hbWU6ICd0ZXh0LWgxJyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL3RleHQvdGV4dC90ZXh0LWgxLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsIGBcbiAgICAgICAgICAgIDxoMT5IZWFkaW5nIDE8L2gxPlxuICAgICAgICBgKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkhlYWRpbmdzR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ3RleHQtaDInLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L3RleHQtaDIucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXRGYWN0b3J5KCdkZWZhdWx0JywgYFxuICAgICAgICAgICAgPGgyPkhlYWRpbmcgMjwvaDI+XG4gICAgICAgIGApLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuSGVhZGluZ3NHcm91cCwge1xuICAgICAgICBuYW1lOiAndGV4dC1oMycsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvdGV4dC1oMy5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuVGV4dFdpZGdldEZhY3RvcnkoJ2RlZmF1bHQnLCBgXG4gICAgICAgICAgICA8aDM+SGVhZGluZyAzPC9oMz5cbiAgICAgICAgYCksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5IZWFkaW5nc0dyb3VwLCB7XG4gICAgICAgIG5hbWU6ICd0ZXh0LWg0JyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL3RleHQvdGV4dC90ZXh0LWg0LnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsIGBcbiAgICAgICAgICAgIDxoND5IZWFkaW5nIDQ8L2g0PlxuICAgICAgICBgKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkhlYWRpbmdzR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ3RleHQtaDUnLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L3RleHQtaDUucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXRGYWN0b3J5KCdkZWZhdWx0JywgYFxuICAgICAgICAgICAgPGg1PkhlYWRpbmcgNTwvaDU+XG4gICAgICAgIGApLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuSGVhZGluZ3NHcm91cCwge1xuICAgICAgICBuYW1lOiAndGV4dC1oNicsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvdGV4dC1oNi5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuVGV4dFdpZGdldEZhY3RvcnkoJ2RlZmF1bHQnLCBgXG4gICAgICAgICAgICA8aDY+SGVhZGluZyA2PC9oNj5cbiAgICAgICAgYCksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CbG9ja3NHcm91cCwge1xuICAgICAgICBuYW1lOiAnYmxvY2stZGVmYXVsdCcsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvYmxvY2stZGVmYXVsdC5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuVGV4dFdpZGdldEZhY3RvcnkoJ2RlZmF1bHQnLCBgXG4gICAgICAgICAgICA8aDM+TG9yZW0gaXBzdW08L2gzPlxuICAgICAgICAgICAgPHA+RXRpYW0gcG9ydGEgc2VtIG1hbGVzdWFkYSBtYWduYSBtb2xsaXMgZXVpc21vZC48L3A+XG4gICAgICAgIGApLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQmxvY2tzR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ2Jsb2NrLXByaW1hcnknLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L2Jsb2NrLXByaW1hcnkucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXRGYWN0b3J5KCdwcmltYXJ5JywgYFxuICAgICAgICAgICAgPGgzPkxvcmVtIGlwc3VtPC9oMz5cbiAgICAgICAgICAgIDxwPkV0aWFtIHBvcnRhIHNlbSBtYWxlc3VhZGEgbWFnbmEgbW9sbGlzIGV1aXNtb2QuPC9wPlxuICAgICAgICBgKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJsb2Nrc0dyb3VwLCB7XG4gICAgICAgIG5hbWU6ICdibG9jay1zdWNjZXNzJyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL3RleHQvdGV4dC9ibG9jay1zdWNjZXNzLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnc3VjY2VzcycsIGBcbiAgICAgICAgICAgIDxoMz5Mb3JlbSBpcHN1bTwvaDM+XG4gICAgICAgICAgICA8cD5FdGlhbSBwb3J0YSBzZW0gbWFsZXN1YWRhIG1hZ25hIG1vbGxpcyBldWlzbW9kLjwvcD5cbiAgICAgICAgYCksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CbG9ja3NHcm91cCwge1xuICAgICAgICBuYW1lOiAnYmxvY2staW5mbycsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvYmxvY2staW5mby5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuVGV4dFdpZGdldEZhY3RvcnkoJ2luZm8nLCBgXG4gICAgICAgICAgICA8aDM+TG9yZW0gaXBzdW08L2gzPlxuICAgICAgICAgICAgPHA+RXRpYW0gcG9ydGEgc2VtIG1hbGVzdWFkYSBtYWduYSBtb2xsaXMgZXVpc21vZC48L3A+XG4gICAgICAgIGApLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQmxvY2tzR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ2Jsb2NrLXdhcm5pbmcnLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L2Jsb2NrLXdhcm5pbmcucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXRGYWN0b3J5KCd3YXJuaW5nJywgYFxuICAgICAgICAgICAgPGgzPkxvcmVtIGlwc3VtPC9oMz5cbiAgICAgICAgICAgIDxwPkV0aWFtIHBvcnRhIHNlbSBtYWxlc3VhZGEgbWFnbmEgbW9sbGlzIGV1aXNtb2QuPC9wPlxuICAgICAgICBgKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJsb2Nrc0dyb3VwLCB7XG4gICAgICAgIG5hbWU6ICdibG9jay1kYW5nZXInLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L2Jsb2NrLWRhbmdlci5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuVGV4dFdpZGdldEZhY3RvcnkoJ2RhbmdlcicsIGBcbiAgICAgICAgICAgIDxoMz5Mb3JlbSBpcHN1bTwvaDM+XG4gICAgICAgICAgICA8cD5FdGlhbSBwb3J0YSBzZW0gbWFsZXN1YWRhIG1hZ25hIG1vbGxpcyBldWlzbW9kLjwvcD5cbiAgICAgICAgYCksXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtdGV4dCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC10ZXh0JyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1ib3gnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtYm94JyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGJpbmRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBjbGFzczogU3RyaW5nLFxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtcGxhY2Vob2xkZXInLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtcGxhY2Vob2xkZXInLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XG5cbiAgICBXaWRnZXRzLlN0dWJXaWRnZXQgPVxuICAgIFdpZGdldHMuV2lkZ2V0KFdpZGdldHMuVXRpbEdyb3VwLCBXaWRnZXRzLmNyZWF0ZSh7XG4gICAgICAgIF9hY3Rpb246ICdpZ25vcmUnLFxuICAgICAgICBuYW1lOiAnZGVmYXVsdC1zdHViJyxcbiAgICAgICAgdGFnOiAnZGVmYXVsdC1zdHViJyxcbiAgICAgICAgbWl4aW5zOiBbIFdpZGdldHMuQm94TWl4aW4gXSxcbiAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ2NvbnRlbnQnLCB0eXBlOiAncmljaCcgfVxuICAgICAgICBdLFxuICAgIH0pKTtcblxuICAgIFdpZGdldHMuU3R1YldpZGdldEZhY3RvcnkgPSBmdW5jdGlvbihjb250ZW50KSB7XG5cbiAgICAgICAgcmV0dXJuIFdpZGdldHMuYnVpbGQoV2lkZ2V0cy5TdHViV2lkZ2V0LCB7XG4gICAgICAgICAgICBjb250ZW50OiB7IHZhbHVlOiBjb250ZW50IH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFdpZGdldHMpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1zdHViJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXN0dWInLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xuXG4gICAgTGFuZGluZy5MYW5kaW5nUGFnZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1wYWdlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXBhZ2UnLFxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5MYW5kaW5nR2FsbGVyeVBhZ2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctZ2FsbGVyeS1wYWdlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLWdhbGxlcnktcGFnZScsXG4gICAgfSk7XG5cbiAgICBMYW5kaW5nLkxhbmRpbmdTdG9yYWdlUGFnZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1zdG9yYWdlLXBhZ2UnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctc3RvcmFnZS1wYWdlJyxcbiAgICB9KTtcblxuICAgIExhbmRpbmcuTGFuZGluZ1NpZ25pblBhZ2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctc2lnbmluLXBhZ2UnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctc2lnbmluLXBhZ2UnLFxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5MYW5kaW5nU2lnbnVwUGFnZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1zaWdudXAtcGFnZScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1zaWdudXAtcGFnZScsXG4gICAgfSk7XG5cbiAgICBMYW5kaW5nLkxhbmRpbmdQcm9maWxlUGFnZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1wcm9maWxlLXBhZ2UnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctcHJvZmlsZS1wYWdlJyxcbiAgICB9KTtcblxuICAgIExhbmRpbmcuTGFuZGluZ01hbmFnZVBhZ2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctbWFuYWdlLXBhZ2UnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctbWFuYWdlLXBhZ2UnLFxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5MYW5kaW5nTWFuYWdlQ3JlYXRlUGFnZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1tYW5hZ2UtY3JlYXRlLXBhZ2UnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctbWFuYWdlLWNyZWF0ZS1wYWdlJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICBDb3JlLlBvcnRhbHNGYWN0b3J5ID0gZnVuY3Rpb24ob3duZXIpIHtcblxuICAgICAgICByZXR1cm4ge1xuXG4gICAgICAgICAgICBsb2FkOiAoZGF0YSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgb3duZXIuJGh0dHAuZ2V0KCcvd3MvcG9ydGFscycsIGRhdGEpLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHJlc29sdmUoZCk7IH0sXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IHJlamVjdChlKTsgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KSxcblxuICAgICAgICAgICAgY3JlYXRlOiAoZGF0YSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgb3duZXIuJGh0dHAucG9zdCgnL3dzL3BvcnRhbHMnLCBkYXRhKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyByZXNvbHZlKGQpOyB9LFxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyByZWplY3QoZSk7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgIHJlbW92ZTogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLmRlbGV0ZSgnL3dzL3BvcnRhbHMnLCBkYXRhKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyByZXNvbHZlKGQpOyB9LFxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyByZWplY3QoZSk7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgIGdldDogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLmdldChgL3dzL3BvcnRhbHMvJHtkYXRhLmlkfWApLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHJlc29sdmUoZCk7IH0sXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IHJlamVjdChlKTsgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgfTtcbiAgICB9XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xuXG4gICAgQ29yZS5TZWN1cml0eUZhY3RvcnkgPSBmdW5jdGlvbihvd25lcikge1xuXG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIHNpZ251cDogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLnBvc3QoJy93cy9zaWdudXAnLCBkYXRhKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyBvd25lci5wcmluY2lwYWwgPSBkLmRhdGEucHJpbmNpcGFsOyByZXNvbHZlKGQpOyB9LFxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyBvd25lci5wcmluY2lwYWwgPSBudWxsOyByZWplY3QoZSk7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgIHNpZ25pbjogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLnBvc3QoJy93cy9zaWduaW4nLCBkYXRhKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyBvd25lci5wcmluY2lwYWwgPSBkLmRhdGEucHJpbmNpcGFsOyByZXNvbHZlKGQpOyB9LFxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyBvd25lci5wcmluY2lwYWwgPSBudWxsOyByZWplY3QoZSk7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgIHNpZ25vdXQ6ICgpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLnBvc3QoJy93cy9zaWdub3V0JykudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgb3duZXIucHJpbmNpcGFsID0gbnVsbDsgcmVzb2x2ZShkKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgcmVqZWN0KGUpOyB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICB9O1xuICAgIH1cblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICB2YXIgdmFsaWRhdGlvbiA9IHtcbiAgICAgICAgZW1haWw6IFwiL14oW2EtekEtWjAtOV9cXFxcLlxcXFwtXSspQChbYS16QS1aMC05X1xcXFwuXFxcXC1dKylcXFxcLihbYS16QS1aMC05XXsyLH0pJC9nXCIsXG4gICAgfTtcblxuICAgIExhbmRpbmcuU2lnbmluID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWFjY291bnQtc2lnbmluJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLWFjY291bnQtc2lnbmluJyxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZvcm06IHRoaXMuZm9ybSxcbiAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiB2YWxpZGF0aW9uLFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJHNldCgnZm9ybScsIHtcbiAgICAgICAgICAgICAgICBlbWFpbDogbnVsbCxcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBzaWduaW46IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3NlY3VyaXR5Jykuc2lnbmluKHtcbiAgICAgICAgICAgICAgICAgICAgZW1haWw6IHRoaXMuZm9ybS5lbWFpbCxcbiAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHRoaXMuZm9ybS5wYXNzd29yZCxcbiAgICAgICAgICAgICAgICB9KS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyB0aGlzLiRyb3V0ZXIuZ28oJy8nKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBMYW5kaW5nLlNpZ251cCA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1hY2NvdW50LXNpZ251cCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1hY2NvdW50LXNpZ251cCcsXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBmb3JtOiB0aGlzLmZvcm0sXG4gICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogdmFsaWRhdGlvbixcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2Zvcm0nLCB7XG4gICAgICAgICAgICAgICAgZW1haWw6IG51bGwsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgc2lnbnVwOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdzZWN1cml0eScpLnNpZ251cCh7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsOiB0aGlzLmZvcm0uZW1haWwsXG4gICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkOiB0aGlzLmZvcm0ucGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgfSkudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgdGhpcy4kcm91dGVyLmdvKCcvJyk7IH0sXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5Qcm9maWxlID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWFjY291bnQtcHJvZmlsZScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1hY2NvdW50LXByb2ZpbGUnLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIiwiIiwiIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIExhbmRpbmcuRmVlZGJhY2sgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctZmVlZGJhY2snLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctZmVlZGJhY2snLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIExhbmRpbmcuRm9vdGVyID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWZvb3RlcicsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1mb290ZXInLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIExhbmRpbmcuR2FsbGVyeSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1nYWxsZXJ5Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLWdhbGxlcnknLFxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5HYWxsZXJ5RnVsbCA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1nYWxsZXJ5LWZ1bGwnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctZ2FsbGVyeS1mdWxsJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICBMYW5kaW5nLkhlYWRlciA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1oZWFkZXInLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctaGVhZGVyJyxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgc2lnbm91dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3NlY3VyaXR5Jykuc2lnbm91dCgpLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHRoaXMuJHJvdXRlci5nbygnLycpOyB9LFxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICBMYW5kaW5nLk1hbmFnZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1tYW5hZ2UnLCB7XG5cbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1tYW5hZ2UnLFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nICsgd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lICsgKHdpbmRvdy5sb2NhdGlvbi5wb3J0ID8gJzonICsgd2luZG93LmxvY2F0aW9uLnBvcnQ6ICcnKSxcbiAgICAgICAgICAgICAgICBwb3J0YWxzOiB0aGlzLnBvcnRhbHMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgIHJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdwb3J0YWxzJykubG9hZCgpLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHRoaXMuJHNldCgncG9ydGFscycsIGQuZGF0YS5wb3J0YWxzKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgdGhpcy4kc2V0KCdwb3J0YWxzJywgW10pOyB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgICAgICBWdWUuc2VydmljZSgncG9ydGFscycpLnJlbW92ZSh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyB0aGlzLnJlZnJlc2goKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBMYW5kaW5nLk1hbmFnZUNyZWF0ZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1tYW5hZ2UtY3JlYXRlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLW1hbmFnZS1jcmVhdGUnLFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZm9ybTogdGhpcy5mb3JtLFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuJHNldCgnZm9ybScsIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3BvcnRhbHMnKS5jcmVhdGUoe1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy5mb3JtLnRpdGxlLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHRoaXMuJHJvdXRlci5nbygnL21hbmFnZScpfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xuXG4gICAgTGFuZGluZy5TdG9yYWdlID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXByaWNpbmcnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctcHJpY2luZycsXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xuXG4gICAgTGFuZGluZy5TdG9yYWdlID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXN0b3JhZ2UnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctc3RvcmFnZScsXG4gICAgfSk7XG5cbiAgICBMYW5kaW5nLlN0b3JhZ2VGdWxsID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXN0b3JhZ2UtZnVsbCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1zdG9yYWdlLWZ1bGwnLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIExhbmRpbmcuU3VwZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctc3VwZXInLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctc3VwZXInLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIExhbmRpbmcuVXNlY2FzZXMgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctdXNlY2FzZXMnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctdXNlY2FzZXMnLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIExhbmRpbmcuVmlkZW8gPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctdmlkZW8nLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctdmlkZW8nLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
