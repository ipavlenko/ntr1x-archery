var Core =
(function($, Vue) {

    Core = {};

    // if (CKEDITOR) {
    //     CKEDITOR_BASEPATH = '/assets/vendor/ckeditor/';
    // }

    return Core;

})(jQuery, Vue);

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

    P.Align = { name: 'text-align', title: 'Text Align', type: 'select', tab: 'appearance', options: [
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
        props: [
            P.Cols, P.Rows, P.Dock, P.Color, P.Align,
            {
                name: 'border', title: 'Border', type: 'object', tab: 'appearance',
                tabs: [ T.Appearance ],
                props: [ P.Spacing, P.Collapse ]
            },
            {
                name: 'items', title: 'Items', type: 'object', tab: 'data',
                tabs: [ T.Data, T.Appearance ],
                props: [
                    { name: 'collection', title: 'Collection', type: 'multiple', tab: 'data',
                    tabs: [ T.Appearance, T.Content ],
                        props: [
                            { name: 'drawing', title: 'Drawing', type: 'object', tab: 'appearance',
                                tabs: [ T.Appearance ],
                                props: [
                                    P.Width, P.Height, P.Margin, P.Padding, P.Background,
                                ],
                            },
                            { name: 'description', title: 'Description', type: 'object', tab: 'appearance',
                                tabs: [ T.Appearance, T.Content ],
                                props: [
                                    P.Width, P.Height, P.Margin, P.Padding, P.Background,
                                    P.Color, P.Align, P.Content,
                                ]
                            },
                            P.Width, P.Height, P.Margin, P.Padding, P.Background,
                        ]
                    },
                    { name: 'style', title: 'Style', type: 'object', tab: 'appearance',
                        tabs: [ T.Appearance ],
                        props: [
                            { name: 'drawing', title: 'Drawing', type: 'object', tab: 'appearance',
                                tabs: [ T.Appearance ],
                                props: [
                                    P.Width, P.Height, P.Margin, P.Padding, P.Background,
                                ]
                            },
                            { name: 'description', title: 'Description', type: 'object', tab: 'appearance',
                                tabs: [ T.Appearance ],
                                props: [
                                    P.Width, P.Height, P.Margin, P.Padding, P.Background,
                                    P.Color, P.Align,
                                ]
                            },
                            P.Width, P.Height, P.Margin, P.Padding, P.Background,
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
            items: {
                value: {
                    style: {
                        value: {
                            width: { value: defaults.width },
                            height: { value: defaults.height },
                            description: {
                                value: {
                                    padding: { value: defaults.padding },
                                }
                            }
                        }
                    },
                    collection: {
                        value: defaults.collection.map(function(item) {
                            return {
                                drawing: {
                                    value: {
                                        background: { value: item.background },
                                    }
                                },
                                description: {
                                    value: {
                                        content: { value: item.content },
                                        color: { value: item.color },
                                    }
                                },
                            };
                        })
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
        widget: Widgets.GalleryWidgetFactory({
            rows: 1, cols: 1, dock: 'above', width: '100%', height: '300px', padding: '30px', 'text-align': 'center', color: '#FFFFFF',
            collection: [
                { content: `
                    <h3 style="text-align:center;"><span style="font-size:48px">First Item</span></h3>
                    <p style="text-align:center;"><span style="font-size: 28px">You can change item data using settings editor</span></p>
                `, background: '#FF6466', color: '#FFFFFF' },
                { content: `
                    <h3 style="text-align:center;"><span style="font-size:48px">Second Item</span></h3>
                    <p style="text-align:center;"><span style="font-size: 28px">You can change item data using settings editor</span></p>
                `, background: '#605BE8', color: '#FFFFFF' },
                { content: `
                    <h3 style="text-align:center;"><span style="font-size:48px">Third Item</span></h3>
                    <p style="text-align:center;"><span style="font-size: 28px">You can change item data using settings editor</span></p>
                `, background: '#70FFBF', color: '#FFFFFF' },
            ]
        }),
    });

    Widgets.Item(Widgets.GalleryGroup, {
        name: 'gallery-r1c1r',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/composites/gallery/gallery-r1c1r.png',
        widget: Widgets.GalleryWidgetFactory({ rows: 1, cols: 1, dock: 'above', width: '100%', height: '300px', padding: '30px',
            collection: [
                { content: `
                    <h3 style="text-align:center;"><span style="font-size:48px">First Item</span></h3>
                    <p style="text-align:center;"><span style="font-size: 28px">You can change item data using settings editor</span></p>
                `, background: '#FF6466', color: '#FFFFFF' },
                { content: `
                    <h3 style="text-align:center;"><span style="font-size:48px">Second Item</span></h3>
                    <p style="text-align:center;"><span style="font-size: 28px">You can change item data using settings editor</span></p>
                `, background: '#605BE8', color: '#FFFFFF' },
                { content: `
                    <h3 style="text-align:center;"><span style="font-size:48px">Third Item</span></h3>
                    <p style="text-align:center;"><span style="font-size: 28px">You can change item data using settings editor</span></p>
                `, background: '#70FFBF', color: '#FFFFFF' },
            ]
        }),
    });

    // Widgets.Item(Widgets.GalleryGroup, {
    //     name: 'gallery-r1c3f',
    //     thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/composites/gallery/gallery-r1c3f.png',
    //     widget: Widgets.GalleryWidgetFactory(1, 3, 'above', '100%', '400px', '30px', [
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiZGlyZWN0aXZlcy9hZmZpeC5qcyIsImRpcmVjdGl2ZXMvY29tYm8uanMiLCJkaXJlY3RpdmVzL2RhdGUuanMiLCJkaXJlY3RpdmVzL3JpY2guanMiLCJkaXJlY3RpdmVzL3Njcm9sbGFibGUuanMiLCJkaXJlY3RpdmVzL3RhZ3MuanMiLCJjb21wb25lbnRzL2VkaXRvci5qcyIsImNvbXBvbmVudHMvZm9ybS5qcyIsImNvbXBvbmVudHMvaW5saW5lLmpzIiwiY29tcG9uZW50cy9taXhpbnMuanMiLCJjb21wb25lbnRzL21vZGFsLmpzIiwiY29tcG9uZW50cy9zb3J0YWJsZS5qcyIsImZpbHRlcnMvaW5kZXguanMiLCJob29rcy9tb2RhbC5qcyIsInBsdWdpbnMvY29udGFpbmVyLmpzIiwidmFsaWRhdG9ycy9lbWFpbC5qcyIsImVkaXRvci9iaW5kaW5ncy9iaW5kaW5ncy5qcyIsImVkaXRvci9kb21haW5zL2RvbWFpbnMuanMiLCJlZGl0b3IvcGFnZXMvcGFnZXMuanMiLCJlZGl0b3IvcGFyYW1zL3BhcmFtcy5qcyIsImVkaXRvci9zY2hlbWVzL3NjaGVtZXMuanMiLCJlZGl0b3Ivc2V0dGluZ3Mvc2V0dGluZ3MuanMiLCJlZGl0b3Ivc3RvcmFnZXMvc3RvcmFnZXMuanMiLCJlZGl0b3Ivd2lkZ2V0cy93aWRnZXRzLmpzIiwic2hlbGwvYWN0aW9ucy9hY3Rpb25zLmpzIiwic2hlbGwvYnJhbmQvYnJhbmQuanMiLCJzaGVsbC9jYXRlZ29yaWVzL2NhdGVnb3JpZXMuanMiLCJzaGVsbC9jb250YWluZXIvY29udGFpbmVyLmpzIiwic2hlbGwvZGVjb3JhdG9yL2RlY29yYXRvci5qcyIsInNoZWxsL2RvbWFpbnMvZG9tYWlucy5qcyIsInNoZWxsL2xvYWRlci9sb2FkZXIuanMiLCJzaGVsbC9wYWdlL3BhZ2UuanMiLCJzaGVsbC9wYWdlcy9wYWdlcy5qcyIsInNoZWxsL3BhbGV0dGUvcGFsZXR0ZS5qcyIsInNoZWxsL3NoZWxsL3NoZWxsLmpzIiwic2hlbGwvc291cmNlcy9zb3VyY2VzLmpzIiwic2hlbGwvc3RvcmFnZXMvc3RvcmFnZXMuanMiLCJzaGVsbC90YXJnZXQvdGFyZ2V0LmpzIiwic2hlbGwvd2lkZ2V0L3dpZGdldC5qcyIsImVkaXRvci9wYWdlcy9zb3VyY2VzL3NvdXJjZXMuanMiLCJlZGl0b3IvcGFnZXMvd2lkZ2V0cy93aWRnZXRzLmpzIiwid2lkZ2V0cy5qcyIsIndpZGdldHMvcGFsZXR0ZS5qcyIsIndpZGdldHMvd2lkZ2V0cy5qcyIsIndpZGdldHMvY29tcG9zaXRlcy9wYWxldHRlLmpzIiwid2lkZ2V0cy9jb250YWluZXIvcGFsZXR0ZS5qcyIsIndpZGdldHMvZm9ybS9wYWxldHRlLmpzIiwid2lkZ2V0cy90ZXh0L3BhbGV0dGUuanMiLCJ3aWRnZXRzL3V0aWxzL3BhbGV0dGUuanMiLCJ3aWRnZXRzL2NvbXBvc2l0ZXMvY2Fyb3VzZWwvY2Fyb3VzZWwuanMiLCJ3aWRnZXRzL2NvbXBvc2l0ZXMvZ2FsbGVyeS9nYWxsZXJ5LmpzIiwid2lkZ2V0cy9jb21wb3NpdGVzL2dhbGxlcnkvcGFsZXR0ZS5qcyIsIndpZGdldHMvY29udGFpbmVyL3N0YWNrL3BhbGV0dGUuanMiLCJ3aWRnZXRzL2NvbnRhaW5lci9zdGFjay9zdGFjay5qcyIsIndpZGdldHMvZm9ybS9jaGVjay9jaGVjay5qcyIsIndpZGdldHMvZm9ybS9jaGVjay9wYWxldHRlLmpzIiwid2lkZ2V0cy9mb3JtL2J1dHRvbi9idXR0b24uanMiLCJ3aWRnZXRzL2Zvcm0vYnV0dG9uL3BhbGV0dGUuanMiLCJ3aWRnZXRzL2Zvcm0vaW5wdXQvaW5wdXQuanMiLCJ3aWRnZXRzL2Zvcm0vaW5wdXQvcGFsZXR0ZS5qcyIsIndpZGdldHMvZm9ybS9yYWRpby9wYWxldHRlLmpzIiwid2lkZ2V0cy9mb3JtL3JhZGlvL3JhZGlvLmpzIiwid2lkZ2V0cy90ZXh0L3RleHQvcGFsZXR0ZS5qcyIsIndpZGdldHMvdGV4dC90ZXh0L3RleHQuanMiLCJ3aWRnZXRzL3V0aWxzL2JveC9ib3guanMiLCJ3aWRnZXRzL3V0aWxzL3BsYWNlaG9sZGVyL3BsYWNlaG9sZGVyLmpzIiwid2lkZ2V0cy91dGlscy9zdHViL3BhbGV0dGUuanMiLCJ3aWRnZXRzL3V0aWxzL3N0dWIvc3R1Yi5qcyIsImxhbmRpbmcvbGFuZGluZy5qcyIsInNlcnZpY2VzL3BvcnRhbHMuanMiLCJzZXJ2aWNlcy9zZWN1cml0eS5qcyIsImxhbmRpbmcvYWNjb3VudC9hY2NvdW50LmpzIiwibGFuZGluZy9iZW5lZml0cy9iZW5lZml0cy5qcyIsImxhbmRpbmcvY29udGFjdHMvY29udGFjdHMuanMiLCJsYW5kaW5nL2ZlZWRiYWNrL2ZlZWRiYWNrLmpzIiwibGFuZGluZy9mb290ZXIvZm9vdGVyLmpzIiwibGFuZGluZy9nYWxsZXJ5L2dhbGxlcnkuanMiLCJsYW5kaW5nL2hlYWRlci9oZWFkZXIuanMiLCJsYW5kaW5nL21hbmFnZS9tYW5hZ2UuanMiLCJsYW5kaW5nL3ByaWNpbmcvcHJpY2luZy5qcyIsImxhbmRpbmcvc3RvcmFnZS9zdG9yYWdlLmpzIiwibGFuZGluZy9zdXBlci9zdXBlci5qcyIsImxhbmRpbmcvdXNlY2FzZXMvdXNlY2FzZXMuanMiLCJsYW5kaW5nL3ZpZGVvL3ZpZGVvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDblNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FoQlBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QWlCVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9PQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMWhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBcEVSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBcUU1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RFQTtBQ0FBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBMYW5kaW5nID1cbihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG5cbiAgICBMYW5kaW5nID0ge307XG5cbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblxuICAgICAgICAkKCdbZGF0YS12dWUtYXBwXScpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcblxuICAgICAgICAgICAgdmFyIGRhdGEgPSAkKGVsZW1lbnQpLmRhdGEoKTtcblxuICAgICAgICAgICAgdmFyIEFwcCA9IFZ1ZS5leHRlbmQoe1xuICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdzZWN1cml0eScsIENvcmUuU2VjdXJpdHlGYWN0b3J5KHRoaXMpKTtcbiAgICAgICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3BvcnRhbHMnLCBDb3JlLlBvcnRhbHNGYWN0b3J5KHRoaXMpKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciByb3V0ZXIgPSBuZXcgVnVlUm91dGVyKHtcbiAgICAgICAgICAgICAgICBoaXN0b3J5OiB0cnVlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJvdXRlci5iZWZvcmVFYWNoKGZ1bmN0aW9uKHRyYW5zaXRpb24pIHtcblxuICAgICAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uLnRvLmF1dGggJiYgIXJvdXRlci5hcHAucHJpbmNpcGFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb24uYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRyYW5zaXRpb24udG8uYW5vbiAmJiByb3V0ZXIuYXBwLnByaW5jaXBhbCkge1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbi5uZXh0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciByb3V0ZXMgPSB7XG4gICAgICAgICAgICAgICAgJy8nOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nUGFnZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICcvZ2FsbGVyeSc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBMYW5kaW5nLkxhbmRpbmdHYWxsZXJ5UGFnZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICcvc3RvcmFnZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBMYW5kaW5nLkxhbmRpbmdTdG9yYWdlUGFnZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICcvc2lnbmluJzoge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IExhbmRpbmcuTGFuZGluZ1NpZ25pblBhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGFub246IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnL3NpZ251cCc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBMYW5kaW5nLkxhbmRpbmdTaWdudXBQYWdlLFxuICAgICAgICAgICAgICAgICAgICBhbm9uOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJy9tYW5hZ2UnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nTWFuYWdlUGFnZSxcbiAgICAgICAgICAgICAgICAgICAgYXV0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICcvbWFuYWdlLWNyZWF0ZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBMYW5kaW5nLkxhbmRpbmdNYW5hZ2VDcmVhdGVQYWdlLFxuICAgICAgICAgICAgICAgICAgICBhdXRoOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJy9zaXRlLzpwb3J0YWwvOnBhZ2UnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogU2hlbGwuU2hlbGxQdWJsaWMsXG4gICAgICAgICAgICAgICAgICAgIGF1dGg6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnL21hbmFnZS86cG9ydGFsJzoge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IFNoZWxsLkxvYWRlcixcbiAgICAgICAgICAgICAgICAgICAgYXV0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcHJpdmF0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICcvbWFuYWdlLzpwb3J0YWwvOnBhZ2UnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogU2hlbGwuTG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICBhdXRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBwcml2YXRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBjcmVhdGVSb3V0ZShwYWdlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBTaGVsbC5TaGVsbFB1YmxpYy5leHRlbmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZTogcGFnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGF0YS5tb2RlbCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5tb2RlbC5wYWdlcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYWdlID0gZGF0YS5tb2RlbC5wYWdlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgcm91dGVzW3BhZ2UubmFtZV0gPSBjcmVhdGVSb3V0ZShwYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJvdXRlci5tYXAocm91dGVzKTtcblxuICAgICAgICAgICAgcm91dGVyLnN0YXJ0KEFwcCwgJCgnW2RhdGEtdnVlLWJvZHldJywgZWxlbWVudCkuZ2V0KDApKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gTGFuZGluZztcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBDb3JlKSB7XG5cbiAgICBWdWUuZGlyZWN0aXZlKCdhZmZpeCcsIHtcblxuICAgICAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIGlmICgkLmZuLmFmZml4KSB7XG4gICAgICAgICAgICAgICAgJCh0aGlzLmVsKS5hZmZpeCh0aGlzLnZtLiRnZXQodGhpcy5leHByZXNzaW9uKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICB9LFxuICAgICAgICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIENvcmUpIHtcblxuICAgIFZ1ZS5kaXJlY3RpdmUoJ2NvbWJvJywge1xuXG4gICAgICAgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgaWYgKCQuZm4udGFnc2lucHV0KSB7XG5cbiAgICAgICAgICAgICAgICAkKHRoaXMuZWwpLnNlbGVjdDIoe1xuICAgICAgICAgICAgICAgICAgICB0YWdzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtdWx0aXBsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZVRhZzogZnVuY3Rpb24gKHBhcmFtcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogcGFyYW1zLnRlcm0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogcGFyYW1zLnRlcm0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3T3B0aW9uOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICB9LFxuICAgICAgICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIENvcmUpIHtcblxuICAgIFZ1ZS5kaXJlY3RpdmUoJ2RhdGUnLCB7XG5cbiAgICAgICAgYmluZDogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBpZiAoJC5mbi5kYXRlcGlja2VyKSB7XG5cbiAgICAgICAgICAgICAgICAkKHRoaXMuZWwpLmRhdGVwaWNrZXIoe1xuICAgICAgICAgICAgICAgICAgICBhdXRvY2xvc2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHRvZGF5SGlnaGxpZ2h0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6IFwieXl5eS1tbS1kZFwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICB9LFxuICAgICAgICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIENvcmUpIHtcblxuICAgIFZ1ZS5kaXJlY3RpdmUoJ3JpY2gnLCB7XG5cbiAgICAgICAgYmluZDogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBpZiAod2luZG93LkNLRURJVE9SKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmVkaXRvciA9IENLRURJVE9SLmlubGluZSh0aGlzLmVsLCB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlc1NldDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnQm9sZGVyJywgZWxlbWVudDogJ3NwYW4nLCBhdHRyaWJ1dGVzOiB7ICdjbGFzcyc6ICdleHRyYWJvbGQnfSB9XG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHRvb2xiYXJHcm91cHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHsgbmFtZTogJ2NsaXBib2FyZCcsICAgZ3JvdXBzOiBbICdjbGlwYm9hcmQnLCAndW5kbycgXSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8geyBuYW1lOiAnZWRpdGluZycsICAgICBncm91cHM6IFsgJ2ZpbmQnLCAnc2VsZWN0aW9uJywgJ3NwZWxsY2hlY2tlcicgXSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnbGlua3MnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB7IG5hbWU6ICdmb3JtcycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiAndG9vbHMnfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnZG9jdW1lbnQnLCBncm91cHM6IFsnbW9kZScsICdkb2N1bWVudCcsICdkb2N0b29scyddfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnb3RoZXJzJ30sXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ3BhcmFncmFwaCcsIGdyb3VwczogWydsaXN0JywgJ2luZGVudCcsICdibG9ja3MnLCAnYWxpZ24nXX0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ2NvbG9ycyd9LFxuICAgICAgICAgICAgICAgICAgICAgICAgJy8nLFxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6ICdiYXNpY3N0eWxlcycsIGdyb3VwczogWydiYXNpY3N0eWxlcycsICdjbGVhbnVwJ119LFxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6ICdzdHlsZXMnfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2luc2VydCcsIGdyb3VwczogWyAnSW1hZ2VCdXR0b24nIF0gIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8ve25hbWU6ICdhYm91dCd9XG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZWRpdG9yLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lZGl0b3IudXBkYXRlRWxlbWVudCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZtLiRzZXQodGhpcy5leHByZXNzaW9uLCAkKHRoaXMuZWwpLnZhbCgpKTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0RGF0YSh0aGlzLnZtLiRnZXQodGhpcy5leHByZXNzaW9uKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygndXBkYXRlJywgbmV3VmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMudGV4dGFyZWEgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5pbnB1dCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBDb3JlKSB7XG5cbiAgICBWdWUuZGlyZWN0aXZlKCdzY3JvbGxhYmxlJywge1xuXG4gICAgICAgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgLy8gJCh0aGlzLmVsKS5jc3Moe1xuICAgICAgICAgICAgLy8gICAgICdvdmVyZmxvdyc6ICdhdXRvJyxcbiAgICAgICAgICAgIC8vIH0pO1xuXG4gICAgICAgICAgICBpZiAoJC5mbi5wZXJmZWN0U2Nyb2xsYmFyKSB7XG4gICAgICAgICAgICAgICAgVnVlLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMuZWwpLnBlcmZlY3RTY3JvbGxiYXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXhpczogdGhpcy5leHByZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgIH0sXG4gICAgICAgIHVuYmluZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xuXG4gICAgVnVlLmRpcmVjdGl2ZSgndGFncycsIHtcblxuICAgICAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIGlmICgkLmZuLnRhZ3NpbnB1dCkge1xuXG4gICAgICAgICAgICAgICAgJCh0aGlzLmVsKS50YWdzaW5wdXQoe1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgfSxcbiAgICAgICAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBDb3JlKTtcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcblxuICAgIENvcmUuVGFic01peGluID0gZnVuY3Rpb24oYWN0aXZlKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcblxuICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdGFiczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlOiBhY3RpdmVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG1ldGhvZHM6IHtcblxuICAgICAgICAgICAgICAgIGFjdGl2YXRlOiBmdW5jdGlvbih0YWIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzLmFjdGl2ZSA9IHRhYjtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgaXNBY3RpdmU6IGZ1bmN0aW9uKHRhYikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50YWJzLmFjdGl2ZSA9PSB0YWI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgQ29yZS5BY3Rpb25NaXhpbiA9IGZ1bmN0aW9uKE1vZGFsRWRpdG9yKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcblxuICAgICAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxuICAgICAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiBPYmplY3QsXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgICAgICBvcGVuOiBmdW5jdGlvbihjb250ZXh0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGRpYWxvZyA9IG5ldyBNb2RhbEVkaXRvcih7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxzOiB0aGlzLmdsb2JhbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3duZXI6IHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dCB8fCB0aGlzLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IHRoaXMubW9kZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudDogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm93bmVyLmRvQXBwbHkodGhpcy5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLiRtb3VudCgpLiRhcHBlbmRUbygkKCdib2R5JykuZ2V0KDApKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgZG9BcHBseTogZnVuY3Rpb24obW9kZWwpIHtcblxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobW9kZWwpKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogdGhpcy5tb2RlbC5fYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyB0aGlzLm1vZGVsLl9hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIENvcmUuRWRpdG9yTWl4aW4gPSBmdW5jdGlvbihMaXN0Vmlld2VyLCBNb2RhbEVkaXRvcikge1xuXG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxuICAgICAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgbWV0aG9kczoge1xuXG4gICAgICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGl0ZW0sIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgY3JlYXRlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGRpYWxvZyA9IG5ldyBNb2RhbEVkaXRvcih7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxzOiB0aGlzLmdsb2JhbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3duZXI6IHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiBpdGVtID8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShpdGVtKSkgOiB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3duZXIuZG9DcmVhdGUodGhpcy5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLiRtb3VudCgpLiRhcHBlbmRUbygkKCdib2R5JykuZ2V0KDApKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZG9SZW1vdmUoaXRlbSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gaXRlbTtcblxuICAgICAgICAgICAgICAgICAgICBuZXcgTW9kYWxFZGl0b3Ioe1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsczogdGhpcy5nbG9iYWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudDogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShpdGVtKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm93bmVyLmRvVXBkYXRlKHRoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldDogIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLiRtb3VudCgpLiRhcHBlbmRUbygkKCdib2R5JykuZ2V0KDApKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgZG9DcmVhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2goT2JqZWN0LmFzc2lnbih7fSwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShpdGVtKSksIHsgX2FjdGlvbjogJ2NyZWF0ZScgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnaXRlbXMnLCAkLmV4dGVuZCh0cnVlLCBbXSwgdGhpcy5pdGVtcykpO1xuXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBkb1VwZGF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xuXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5hY3RpdmUsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiB0aGlzLmFjdGl2ZS5fYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyB0aGlzLmFjdGl2ZS5fYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLml0ZW1zID0gJC5leHRlbmQodHJ1ZSwgW10sIHRoaXMuaXRlbXMpOy8vdGhpcy5pdGVtcy5zbGljZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zID0gdGhpcy5pdGVtcy5zbGljZSgpO1xuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gbnVsbDtcblxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygndXBkYXRlJywgaXRlbSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuJHNldCgnYWN0aXZlJywgT2JqZWN0LmFzc2lnbihKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW0pKSwge1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgX2FjdGlvbjogdGhpcy5hY3RpdmUuX2FjdGlvblxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgID8gdGhpcy5hY3RpdmUuX2FjdGlvblxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIDogJ3VwZGF0ZSdcbiAgICAgICAgICAgICAgICAgICAgLy8gfSkpO1xuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyAvLyB0aGlzLml0ZW1zID0gJC5leHRlbmQodHJ1ZSwgW10sIHRoaXMuaXRlbXMpOy8vdGhpcy5pdGVtcy5zbGljZSgpO1xuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLiRzZXQoJ2l0ZW1zJywgJC5leHRlbmQodHJ1ZSwgW10sIHRoaXMuaXRlbXMpKTtcbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gJCh3aW5kb3cpLnRyaWdnZXIoJ3Jlc2l6ZScpO1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLmFjdGl2ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGRvUmVtb3ZlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5pdGVtcy5pbmRleE9mKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMuaXRlbXNbaW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uX2FjdGlvbiA9PSAnY3JlYXRlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMuJHJlbW92ZShpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5fYWN0aW9uID0gJ3JlbW92ZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLml0ZW1zID0gJC5leHRlbmQodHJ1ZSwgW10sIHRoaXMuaXRlbXMpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2l0ZW1zJywgJC5leHRlbmQodHJ1ZSwgW10sIHRoaXMuaXRlbXMpKTtcblxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy5jcmVhdGUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxuICAgICAgICAgICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oZGF0YSkgeyB0aGlzLnVwZGF0ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXG4gICAgICAgICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMucmVtb3ZlKGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcbiAgICAgICAgICAgICAgICBkb0NyZWF0ZTogZnVuY3Rpb24oZGF0YSkgeyB0aGlzLmRvQ3JlYXRlKGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcbiAgICAgICAgICAgICAgICBkb1VwZGF0ZTogZnVuY3Rpb24oZGF0YSkgeyB0aGlzLmRvVXBkYXRlKGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcbiAgICAgICAgICAgICAgICBkb1JlbW92ZTogZnVuY3Rpb24oZGF0YSkgeyB0aGlzLmRvUmVtb3ZlKGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgQ29yZS5MaXN0Vmlld2VyTWl4aW4gPSB7XG5cbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxuICAgICAgICB9LFxuXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7IHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7IH0sXG4gICAgICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHsgdGhpcy4kZGlzcGF0Y2goJ2NyZWF0ZScsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dH0gKTsgfSxcbiAgICAgICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkgeyB0aGlzLiRkaXNwYXRjaCgndXBkYXRlJywgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0fSApOyB9LFxuICAgICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7IHRoaXMuJGRpc3BhdGNoKCdyZW1vdmUnLCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHR9ICk7IH0sXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQ29yZS5Nb2RhbEVkaXRvck1peGluID0ge1xuXG4gICAgICAgIGF0dGFjaGVkOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgJCh0aGlzLiRlbCkubW9kYWwoJ3Nob3cnKTtcbiAgICAgICAgICAgICQodGhpcy4kZWwpLm9uKCdoaWRlLmJzLm1vZGFsJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRldGFjaGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQodGhpcy4kZWwpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHt9LFxuICAgICAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKCkge31cbiAgICAgICAgfVxuICAgIH07XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlKTtcbiIsIi8vIFZ1ZS5jb21wb25lbnQoJ3YtZm9ybScsIHtcbi8vXG4vLyBcdHByb3BzOiB7XG4vLyBcdFx0YWN0aW9uOiBTdHJpbmcsXG4vLyBcdFx0bWV0aG9kOiBTdHJpbmcsXG4vLyBcdFx0aW5pdDogT2JqZWN0LFxuLy8gXHRcdGRvbmU6IEZ1bmN0aW9uLFxuLy8gXHRcdGZhaWw6IEZ1bmN0aW9uLFxuLy8gXHRcdG1vZGVsOiBPYmplY3QsXG4vLyBcdH0sXG4vL1xuLy8gXHQvLyByZXBsYWNlOiBmYWxzZSxcbi8vXG4vLyBcdC8vIHRlbXBsYXRlOiBgXG4vLyBcdC8vIFx0PGZvcm0+XG4vLyBcdC8vIFx0XHQ8c2xvdD48L3Nsb3Q+XG4vLyBcdC8vIFx0PC9mb3JtPlxuLy8gXHQvLyBgLFxuLy9cbi8vIFx0YWN0aXZhdGU6IGZ1bmN0aW9uKGRvbmUpIHtcbi8vXG4vLyBcdFx0dGhpcy5vcmlnaW5hbCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCkpO1xuLy9cbi8vIFx0XHQkKHRoaXMuJGVsKVxuLy9cbi8vIFx0XHRcdC5vbignc3VibWl0JywgKGUpID0+IHtcbi8vIFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuLy8gXHRcdFx0XHR0aGlzLnN1Ym1pdCgpO1xuLy8gXHRcdFx0fSlcbi8vIFx0XHRcdC5vbigncmVzZXQnLCAoZSkgPT4ge1xuLy8gXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG4vLyBcdFx0XHRcdHRoaXMucmVzZXQoKTtcbi8vIFx0XHRcdH0pXG4vL1xuLy8gXHRcdGRvbmUoKTtcbi8vIFx0fSxcbi8vXG4vLyBcdGRhdGE6IGZ1bmN0aW9uKCkge1xuLy9cbi8vIFx0XHRyZXR1cm4ge1xuLy8gXHRcdFx0bW9kZWw6IHRoaXMubW9kZWxcbi8vIFx0XHR9O1xuLy8gXHR9LFxuLy9cbi8vIFx0bWV0aG9kczoge1xuLy9cbi8vIFx0XHRzdWJtaXQ6IGZ1bmN0aW9uKCkge1xuLy9cbi8vIFx0XHRcdC8vIGUucHJldmVudERlZmF1bHQoKTtcbi8vXG4vLyBcdFx0XHQvLyBjb25zb2xlLmxvZyh0aGlzLm1vZGVsKTtcbi8vXG4vLyBcdFx0XHQkLmFqYXgoe1xuLy8gXHRcdFx0XHR1cmw6IHRoaXMuYWN0aW9uLFxuLy8gXHRcdFx0XHRtZXRob2Q6IHRoaXMubWV0aG9kLFxuLy8gXHRcdFx0XHRjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4vLyBcdFx0XHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpXG4vLyBcdFx0XHR9KVxuLy8gXHRcdFx0LmRvbmUoKGQpID0+IHtcbi8vIFx0XHRcdFx0aWYgKGRvbmUgaW4gdGhpcykgdGhpcy5kb25lKGQpO1xuLy8gXHRcdFx0fSlcbi8vIFx0XHRcdC5mYWlsKGZ1bmN0aW9uKGUpIHsgaWYgKGZhaWwgaW4gdGhpcykgdGhpcy5mYWlsKGUpOyB9LmJpbmQodGhpcykpXG4vLyBcdFx0fSxcbi8vXG4vLyBcdFx0cmVzZXQ6IGZ1bmN0aW9uKCkge1xuLy8gXHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCB0aGlzLm9yaWdpbmFsKTtcbi8vIFx0XHR9XG4vLyBcdH0sXG4vLyB9KTtcbiIsIi8vIFZ1ZS5jb21wb25lbnQoJ2lubGluZS10ZXh0Jyxcbi8vIFx0VnVlLmV4dGVuZCh7XG4vLyBcdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnIF0sXG4vLyBcdFx0dGVtcGxhdGU6IGBcbi8vIFx0XHRcdDxkaXYgY2xhc3M9XCJpbmxpbmUtY29udGFpbmVyXCI+XG4vLyBcdFx0XHRcdDxpbnB1dCBjbGFzcz1cImlubGluZS1jb250cm9sXCIgdHlwZT1cInRleHRcIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiIC8+XG4vLyBcdFx0XHQ8L2Rpdj5cbi8vIFx0XHRgXG4vLyBcdH0pXG4vLyApO1xuLy9cbi8vIFZ1ZS5jb21wb25lbnQoJ2lubGluZS1jaGVja2JveCcsXG4vLyBcdFZ1ZS5leHRlbmQoe1xuLy8gXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJyBdLFxuLy8gXHRcdHRlbXBsYXRlOiBgXG4vLyBcdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxuLy8gXHRcdFx0XHQ8aW5wdXQgY2xhc3M9XCJpbmxpbmUtY2hlY2tib3hcIiB0eXBlPVwiY2hlY2tib3hcIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiIC8+XG4vLyBcdFx0XHQ8L2Rpdj5cbi8vIFx0XHRgXG4vLyBcdH0pXG4vLyApO1xuLy9cbi8vIFZ1ZS5jb21wb25lbnQoJ2lubGluZS1zZWxlY3QnLFxuLy8gXHRWdWUuZXh0ZW5kKHtcbi8vIFx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScsICdvcHRpb25zJyBdLFxuLy8gXHRcdHRlbXBsYXRlOiBgXG4vLyBcdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxuLy8gXHRcdFx0XHQ8c2VsZWN0IGNsYXNzPVwiaW5saW5lLWNvbnRyb2wxXCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIj5cbi8vIFx0XHRcdFx0XHQ8b3B0aW9uIHYtZm9yPVwib3B0aW9uIGluIG9wdGlvbnNcIiB2YWx1ZT1cInt7IG9wdGlvbi5rZXkgfX1cIj57eyBvcHRpb24udmFsdWUgfX08L29wdGlvbj5cbi8vIFx0XHRcdFx0PC9zZWxlY3Q+XG4vLyBcdFx0XHQ8L2Rpdj5cbi8vIFx0XHRgXG4vLyBcdH0pXG4vLyApO1xuLy9cbi8vIFZ1ZS5jb21wb25lbnQoJ2lubGluZS12YWx1ZScsXG4vLyBcdFZ1ZS5leHRlbmQoe1xuLy8gXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJywgJ2NsYXNzJyBdLFxuLy8gXHRcdHRlbXBsYXRlOiBgXG4vLyBcdFx0XHQ8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCIgLz5cbi8vIFx0XHRcdDxzcGFuIDpjbGFzcz1cImNsYXNzXCI+e3sgdmFsdWUgfX08L3NwYW4+XG4vLyBcdFx0YFxuLy8gXHR9KVxuLy8gKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIENvcmUuV2lkZ2V0TWl4aW4gPSB7XG5cbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcbiAgICAgICAgICAgIHN0b3JhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXG4gICAgICAgICAgICBiaW5kaW5nczogT2JqZWN0LFxuICAgICAgICAgICAgY2hpbGRyZW46IEFycmF5LFxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXG4gICAgICAgIH0sXG5cbiAgICAgICAgZGF0YTogIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzeXN0ZW1JZDogdGhpcy5zeXN0ZW1JZCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdGhpcy5yYW5kb21JZCA9IFZ1ZS5zZXJ2aWNlKCdwYWxldHRlJykuZ2VuZXJhdGVJZCgnd2lkZ2V0LScpO1xuXG4gICAgICAgICAgICAvLyBUT0RPINCj0YHRgtCw0L3QvtCy0LjRgtGMINGA0LDQt9C80LXRgNGLINGA0L7QtNC40YLQtdC70YzRgdC60L7QuSDRj9GH0LXQudC60LhcblxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ2JpbmRpbmdzLmlkJywgZnVuY3Rpb24odmFsdWUpIHtcblxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN5c3RlbUlkID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zeXN0ZW1JZCA9IHRoaXMucmFuZG9tSWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGl0ZW0sIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBDb3JlLlN0YWNrZWRNaXhpbiA9IHtcblxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcbiAgICAgICAgICAgIHN0b3JhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxuICAgICAgICAgICAgY2hpbGRyZW46IEFycmF5LFxuICAgICAgICB9LFxuXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdGFja0lkOiB0aGlzLnN0YWNrSWQsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgdGhpcy5zdGFja0lkID0gVnVlLnNlcnZpY2UoJ3BhbGV0dGUnKS5nZW5lcmF0ZUlkKCdzdGFjay0nKTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIi8vIFZ1ZS5jb21wb25lbnQoJ21vZGFsJywge1xuLy9cbi8vICAgICBwcm9wczoge1xuLy8gICAgICAgICBpZDogU3RyaW5nLFxuLy8gICAgICAgICBjdXJyZW50OiBPYmplY3QsXG4vLyAgICAgICAgIG9yaWdpbmFsOiBPYmplY3QsXG4vLyAgICAgfSxcbi8vXG4vLyAgICAgbWV0aG9kczoge1xuLy9cbi8vICAgICAgICAgc3VibWl0OiBmdW5jdGlvbihlKSB7XG4vLyAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaCgnc3VibWl0JywgdGhpcy5jdXJyZW50KTtcbi8vICAgICAgICAgICAgIC8vIE9iamVjdC5hc3NpZ24odGhpcy5vcmlnaW5hbCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmN1cnJlbnQpKSk7XG4vLyAgICAgICAgICAgICAkKGUudGFyZ2V0KS5jbG9zZXN0KCcubW9kYWwnKS5tb2RhbCgnaGlkZScpO1xuLy8gICAgICAgICB9LFxuLy9cbi8vICAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKGUpIHtcbi8vICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKCdyZXNldCcsIHRoaXMuY3VycmVudCk7XG4vLyAgICAgICAgICAgICAvLyBPYmplY3QuYXNzaWduKHRoaXMuY3VycmVudCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLm9yaWdpbmFsKSkpO1xuLy8gICAgICAgICAgICAgJChlLnRhcmdldCkuY2xvc2VzdCgnLm1vZGFsJykubW9kYWwoJ2hpZGUnKTtcbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vIH0pO1xuIiwiKGZ1bmN0aW9uICgkLCB3aW5kb3csIHBsdWdpbk5hbWUsIHVuZGVmaW5lZCkge1xuXG4gICAgdmFyIGRlZmF1bHRzID0ge1xuXG4gICAgICAgIGRyYWc6IHRydWUsXG4gICAgICAgIGRyb3A6IHRydWUsXG4gICAgICAgIHZlcnRpY2FsOiB0cnVlLFxuXG4gICAgICAgIGNvbnRhaW5lclNlbGVjdG9yOiBcIm9sLCB1bFwiLFxuICAgICAgICBpdGVtU2VsZWN0b3I6IFwibGlcIixcbiAgICAgICAgZXhjbHVkZVNlbGVjdG9yOiBcIlwiLFxuXG4gICAgICAgIGJvZHlDbGFzczogXCJkcmFnZ2luZ1wiLFxuICAgICAgICBhY3RpdmVDbGFzczogXCJhY3RpdmVcIixcbiAgICAgICAgZHJhZ2dlZENsYXNzOiBcImRyYWdnZWRcIixcbiAgICAgICAgdmVydGljYWxDbGFzczogXCJ2ZXJ0aWNhbFwiLFxuICAgICAgICBob3Jpc29udGFsQ2xhc3M6IFwiaG9yaXNvbnRhbFwiLFxuICAgICAgICBwbGFjZWhvbGRlckNsYXNzOiBcInBsYWNlaG9sZGVyXCIsXG5cbiAgICAgICAgcGxhY2Vob2xkZXI6ICc8bGkgY2xhc3M9XCJwbGFjZWhvbGRlclwiPjwvbGk+JyxcblxuICAgICAgICBvbkRyYWdTdGFydDogZnVuY3Rpb24oY29udGV4dCwgZXZlbnQsIF9zdXBlcikge1xuXG4gICAgICAgICAgICB2YXIgc2l6ZSA9IHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGNvbnRleHQuJGl0ZW0ub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgICAgICAgICB3aWR0aDogY29udGV4dC4kaXRlbS5vdXRlcldpZHRoKCksXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb250ZXh0LiRvcmlnaW5hbEl0ZW0gPSBjb250ZXh0LiRpdGVtO1xuXG4gICAgICAgICAgICBjb250ZXh0LiRpdGVtID0gY29udGV4dC4kb3JpZ2luYWxJdGVtXG4gICAgICAgICAgICAgICAgLmNsb25lKClcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoY29udGV4dC5zb3J0YWJsZS5vcHRpb25zLmRyYWdnZWRDbGFzcylcbiAgICAgICAgICAgICAgICAuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdmaXhlZCcsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IGV2ZW50LnBhZ2VYIC0gY29udGV4dC5hZGp1c3RtZW50LmxlZnQsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogZXZlbnQucGFnZVkgLSBjb250ZXh0LmFkanVzdG1lbnQudG9wLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogc2l6ZS5zaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBzaXplLmhlaWdodCxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5hcHBlbmRUbyhjb250ZXh0LiRwYXJlbnQpXG4gICAgICAgICAgICA7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25EcmFnOiBmdW5jdGlvbihjb250ZXh0LCBldmVudCwgX3N1cGVyKSB7XG5cbiAgICAgICAgICAgIGNvbnRleHQuJGl0ZW0uY3NzKHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBldmVudC5wYWdlWCAtIGNvbnRleHQuYWRqdXN0bWVudC5sZWZ0LFxuICAgICAgICAgICAgICAgIHRvcDogZXZlbnQucGFnZVkgLSBjb250ZXh0LmFkanVzdG1lbnQudG9wLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRyb3A6IGZ1bmN0aW9uKGNvbnRleHQsIGV2ZW50LCBfc3VwZXIpIHtcblxuICAgICAgICAgICAgY29udGV4dC4kaXRlbS5yZW1vdmUoKTtcbiAgICAgICAgICAgIGlmIChjb250ZXh0LmxvY2F0aW9uKSB7XG5cbiAgICAgICAgICAgICAgICBjb250ZXh0LiRpdGVtID0gY29udGV4dC5sb2NhdGlvbi5iZWZvcmVcbiAgICAgICAgICAgICAgICAgICAgPyBjb250ZXh0LiRpdGVtLmluc2VydEJlZm9yZShjb250ZXh0LmxvY2F0aW9uLiRpdGVtKVxuICAgICAgICAgICAgICAgICAgICA6IGNvbnRleHQuJGl0ZW0uaW5zZXJ0QWZ0ZXIoY29udGV4dC5sb2NhdGlvbi4kaXRlbSlcbiAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgICAgICAgICBjb250ZXh0LiRpdGVtLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogJycsXG4gICAgICAgICAgICAgICAgICAgIHRvcDogJycsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnJyxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIHZhciBjb250ZXh0ID0gbnVsbDtcbiAgICB2YXIgc29ydGFibGVzID0gW107XG5cbiAgICBmdW5jdGlvbiBTb3J0YWJsZSgkZWxlbWVudCwgb3B0aW9ucykge1xuXG4gICAgICAgIHRoaXMuJGVsZW1lbnQgPSAkZWxlbWVudDtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgICAgICAkZWxlbWVudC5vbignbW91c2Vkb3duLnNvcnRhYmxlJywgdGhpcy5vcHRpb25zLml0ZW1TZWxlY3RvciwgKGUpID0+IHsgdGhpcy5oYW5kbGVTdGFydChlKTsgfSk7XG5cbiAgICAgICAgdGhpcy5kcmFnZ2FibGUgPSBudWxsO1xuXG4gICAgICAgIHNvcnRhYmxlcy5wdXNoKHRoaXMpO1xuICAgIH1cblxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAgICAkKGRvY3VtZW50KVxuICAgICAgICAgICAgLm9uKCdtb3VzZXVwLnNvcnRhYmxlJywgKGUpID0+IHsgY29udGV4dCAmJiBjb250ZXh0LnNvcnRhYmxlLmhhbmRsZUVuZChlLCBjb250ZXh0KTsgfSlcbiAgICAgICAgICAgIC5vbignbW91c2Vtb3ZlLnNvcnRhYmxlJywgKGUpID0+IHsgY29udGV4dCAmJiBjb250ZXh0LnNvcnRhYmxlLmhhbmRsZURyYWcoZSwgY29udGV4dCk7IH0pXG4gICAgICAgIDtcbiAgICB9KTtcblxuICAgIFNvcnRhYmxlLnByb3RvdHlwZSA9IHtcblxuICAgICAgICBkcm9wTG9jYXRpb246IGZ1bmN0aW9uKGUpIHtcblxuICAgICAgICAgICAgdmFyICRpdGVtO1xuICAgICAgICAgICAgdmFyIHNvcnRhYmxlO1xuXG4gICAgICAgICAgICBpZiAoY29udGV4dCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGRpc3BsYXkgPSBjb250ZXh0LiRpdGVtLmNzcygnZGlzcGxheScpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuJGl0ZW0uY3NzKHsgZGlzcGxheTogJ25vbmUnLCB9KTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc29ydGFibGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzID0gc29ydGFibGVzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAocy5vcHRpb25zLmRyb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRyZXN1bHQgPSAkKGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZS5wYWdlWCwgZS5wYWdlWSkpLmNsb3Nlc3Qocy5vcHRpb25zLml0ZW1TZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHJlc3VsdC5sZW5ndGggJiYgJHJlc3VsdC5jbG9zZXN0KHMuJGVsZW1lbnQpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtID0gJHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZSA9IHM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb250ZXh0LiRpdGVtLmNzcyh7IGRpc3BsYXk6IGRpc3BsYXksIH0pO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzb3J0YWJsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSBzb3J0YWJsZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzLm9wdGlvbnMuZHJvcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHJlc3VsdCA9ICQoZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChlLnBhZ2VYLCBlLnBhZ2VZKSkuY2xvc2VzdChzLm9wdGlvbnMuaXRlbVNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkcmVzdWx0Lmxlbmd0aCAmJiAkcmVzdWx0LmNsb3Nlc3Qocy4kZWxlbWVudCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGl0ZW0gPSAkcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlID0gcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNvcnRhYmxlICYmICRpdGVtICYmICRpdGVtLmxlbmd0aCkge1xuXG4gICAgICAgICAgICAgICAgdmFyICRjb250YWluZXIgPSAkaXRlbS5jbG9zZXN0KHNvcnRhYmxlLm9wdGlvbnMuY29udGFpbmVyU2VsZWN0b3IpO1xuXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9ICRpdGVtLm9mZnNldCgpO1xuICAgICAgICAgICAgICAgIHZhciBzaXplID0ge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogJGl0ZW0ub3V0ZXJXaWR0aCgpLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICRpdGVtLm91dGVySGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHZhciBvcmllbnRhdGlvbiA9IHRoaXMub3B0aW9ucy52ZXJ0aWNhbFxuICAgICAgICAgICAgICAgICAgICA/ICRjb250YWluZXIuaGFzQ2xhc3Moc29ydGFibGUub3B0aW9ucy5ob3Jpc29udGFsQ2xhc3MpID8gJ2gnIDogJ3YnXG4gICAgICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lci5oYXNDbGFzcyhzb3J0YWJsZS5vcHRpb25zLnZlcnRpY2FsQ2xhc3MpID8gJ3YnIDogJ2gnXG4gICAgICAgICAgICAgICAgO1xuXG4gICAgICAgICAgICAgICAgdmFyIGJlZm9yZSA9IChvcmllbnRhdGlvbiA9PSAnaCcpXG4gICAgICAgICAgICAgICAgICAgID8gZS5wYWdlWCAtIG9mZnNldC5sZWZ0IDwgc2l6ZS53aWR0aCAvIDJcbiAgICAgICAgICAgICAgICAgICAgOiBlLnBhZ2VZIC0gb2Zmc2V0LnRvcCA8IHNpemUuaGVpZ2h0IC8gMlxuICAgICAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICRpdGVtOiAkaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lcjogJGNvbnRhaW5lcixcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGU6IHNvcnRhYmxlLFxuICAgICAgICAgICAgICAgICAgICBiZWZvcmU6IGJlZm9yZSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBoYW5kbGVTdGFydDogZnVuY3Rpb24oZSkge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmV4Y2x1ZGVTZWxlY3RvciAmJiAkKGUudGFyZ2V0KS5jbG9zZXN0KHRoaXMub3B0aW9ucy5leGNsdWRlU2VsZWN0b3IpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICBpZiAoIWNvbnRleHQpIHtcblxuICAgICAgICAgICAgICAgIHZhciAkaXRlbSA9ICQoZS50YXJnZXQpLmNsb3Nlc3QodGhpcy5vcHRpb25zLml0ZW1TZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgdmFyICRwYXJlbnQgPSAkaXRlbS5wYXJlbnQoKTtcblxuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSAkaXRlbS5vZmZzZXQoKTtcbiAgICAgICAgICAgICAgICAvLyBpZiAoIW9mZnNldCkge1xuICAgICAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZygkaXRlbSwgKTtcbiAgICAgICAgICAgICAgICAvLyB9XG5cbiAgICAgICAgICAgICAgICBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZTogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6ICRpdGVtLmluZGV4KCksXG4gICAgICAgICAgICAgICAgICAgICRjb250YWluZXI6ICRpdGVtLmNsb3Nlc3QodGhpcy5vcHRpb25zLmNvbnRhaW5lclNlbGVjdG9yKSxcbiAgICAgICAgICAgICAgICAgICAgJHBhcmVudDogJGl0ZW0ucGFyZW50KCksXG4gICAgICAgICAgICAgICAgICAgICRpdGVtOiAkaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgJG9yaWdpbmFsSXRlbTogJGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICR0YXJnZXRJdGVtOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAkdGFyZ2V0Q29udGFpbmVyOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbjogdGhpcy5kcm9wTG9jYXRpb24oZSksXG4gICAgICAgICAgICAgICAgICAgIGFkanVzdG1lbnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IGUuY2xpZW50WCAtIG9mZnNldC5sZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiBlLmNsaWVudFkgLSBvZmZzZXQudG9wLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMub25EcmFnU3RhcnQoY29udGV4dCwgZSwgZGVmYXVsdHMub25EcmFnU3RhcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGhhbmRsZUVuZDogZnVuY3Rpb24oZSkge1xuXG4gICAgICAgICAgICBpZiAoY29udGV4dCkge1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzb3J0YWJsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNvcnRhYmxlID0gc29ydGFibGVzW2ldO1xuICAgICAgICAgICAgICAgICAgICAkKHNvcnRhYmxlLm9wdGlvbnMuY29udGFpbmVyU2VsZWN0b3IsIHNvcnRhYmxlLiRlbGVtZW50KS5yZW1vdmVDbGFzcyhzb3J0YWJsZS5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY29udGV4dC4kcGxhY2Vob2xkZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC4kcGxhY2Vob2xkZXIucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29udGV4dC5sb2NhdGlvbiA9IHRoaXMuZHJvcExvY2F0aW9uKGUpO1xuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0LmxvY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQubG9jYXRpb24uc29ydGFibGUub3B0aW9ucy5vbkRyb3AoY29udGV4dCwgZSwgZGVmYXVsdHMub25Ecm9wKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LiRpdGVtLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGhhbmRsZURyYWc6IGZ1bmN0aW9uKGUpIHtcblxuICAgICAgICAgICAgaWYgKGNvbnRleHQpIHtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc29ydGFibGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3J0YWJsZSA9IHNvcnRhYmxlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzLm9wdGlvbnMuY29udGFpbmVyU2VsZWN0b3IsIHNvcnRhYmxlLiRlbGVtZW50KS5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0LiRwbGFjZWhvbGRlcikge1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LiRwbGFjZWhvbGRlci5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb250ZXh0LmxvY2F0aW9uID0gdGhpcy5kcm9wTG9jYXRpb24oZSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHQubG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5sb2NhdGlvbi4kY29udGFpbmVyLmFkZENsYXNzKGNvbnRleHQubG9jYXRpb24uc29ydGFibGUub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuJHBsYWNlaG9sZGVyID0gY29udGV4dC5sb2NhdGlvbi5iZWZvcmVcbiAgICAgICAgICAgICAgICAgICAgICAgID8gJChjb250ZXh0LmxvY2F0aW9uLnNvcnRhYmxlLm9wdGlvbnMucGxhY2Vob2xkZXIpLmluc2VydEJlZm9yZShjb250ZXh0LmxvY2F0aW9uLiRpdGVtKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiAkKGNvbnRleHQubG9jYXRpb24uc29ydGFibGUub3B0aW9ucy5wbGFjZWhvbGRlcikuaW5zZXJ0QWZ0ZXIoY29udGV4dC5sb2NhdGlvbi4kaXRlbSlcbiAgICAgICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnRleHQuc29ydGFibGUub3B0aW9ucy5vbkRyYWcoY29udGV4dCwgZSwgZGVmYXVsdHMub25EcmFnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgdmFyIEFQSSA9ICQuZXh0ZW5kKFNvcnRhYmxlLnByb3RvdHlwZSwge1xuXG4gICAgICAgIGVuYWJsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfSxcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAkLmZuW3BsdWdpbk5hbWVdID0gZnVuY3Rpb24obWV0aG9kT3JPcHRpb25zKSB7XG5cbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyICR0ID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICBvYmplY3QgPSAkdC5kYXRhKHBsdWdpbk5hbWUpXG4gICAgICAgICAgICA7XG5cbiAgICAgICAgICAgIGlmIChvYmplY3QgJiYgQVBJW21ldGhvZE9yT3B0aW9uc10pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQVBJW21ldGhvZE9yT3B0aW9uc10uYXBwbHkob2JqZWN0LCBhcmdzKSB8fCB0aGlzO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghb2JqZWN0ICYmIChtZXRob2RPck9wdGlvbnMgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgbWV0aG9kT3JPcHRpb25zID09PSBcIm9iamVjdFwiKSkge1xuICAgICAgICAgICAgICAgICR0LmRhdGEocGx1Z2luTmFtZSwgbmV3IFNvcnRhYmxlKCR0LCBtZXRob2RPck9wdGlvbnMpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbn0pKGpRdWVyeSwgd2luZG93LCAnc29ydGFibGUnKTtcbiIsIihmdW5jdGlvbigkLCBDb3JlKSB7XG5cbiAgICBWdWUuZmlsdGVyKCdqc29uUGF0aCcsIGZ1bmN0aW9uIChjb250ZXh0LCBzdHIpIHtcbiAgICAgICAgaWYgKHN0ciA9PT0gdW5kZWZpbmVkIHx8IGNvbnRleHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlID0gL3soW159XSspfS9nO1xuXG4gICAgICAgIHJlc3VsdCA9IHN0ci5yZXBsYWNlKHJlLCBmdW5jdGlvbihtYXRjaCwgZXhwcikge1xuICAgICAgICAgICAganNvbiA9IEpTT05QYXRoKHtcbiAgICAgICAgICAgICAgICBqc29uOiBjb250ZXh0LFxuICAgICAgICAgICAgICAgIHBhdGg6IGV4cHJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGpzb24uaGFzT3duUHJvcGVydHkoMSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2FycmF5JztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGpzb247XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChyZXN1bHQgPT0gJ2FycmF5Jykge1xuICAgICAgICAgICAgcmV0dXJuIEpTT05QYXRoKHtcbiAgICAgICAgICAgICAgICBqc29uOiBjb250ZXh0LFxuICAgICAgICAgICAgICAgIHBhdGg6IHN0ci5yZXBsYWNlKHJlLCBcIiQxXCIpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIFZ1ZS5maWx0ZXIoJ3RlbXBsYXRlJywgZnVuY3Rpb24gKHN0cmluZywgZGF0YSkge1xuICAgICAgICBcbiAgICAgICAgdmFyIHJlID0gLyR7KFtefV0rKX0vZztcbiAgICAgICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKHJlLCBmdW5jdGlvbihtYXRjaCwga2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YVtrZXldO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIFZ1ZS5maWx0ZXIoJ2Fzc2lnbicsIGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZTEsIHNvdXJjZTIsIHNvdXJjZTMpIHtcblxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZTEsIHNvdXJjZTIsIHNvdXJjZTMpO1xuICAgIH0pO1xuXG4gICAgVnVlLmZpbHRlcignY29weScsIGZ1bmN0aW9uIChzb3VyY2UpIHtcblxuICAgICAgICByZXR1cm4gbmV3IFZ1ZSh7XG4gICAgICAgICAgICBkYXRhOiBzb3VyY2UgIT0gbnVsbFxuICAgICAgICAgICAgICAgID8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzb3VyY2UpKVxuICAgICAgICAgICAgICAgIDogbnVsbFxuICAgICAgICB9KS4kZGF0YTtcbiAgICB9KTtcblxuICAgIFZ1ZS5maWx0ZXIoJ2Nsb25lJywgZnVuY3Rpb24gKHNvdXJjZSkge1xuXG4gICAgICAgIHJldHVybiBuZXcgVnVlKHtcbiAgICAgICAgICAgIGRhdGE6IHNvdXJjZSAhPSBudWxsXG4gICAgICAgICAgICAgICAgPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNvdXJjZSkpXG4gICAgICAgICAgICAgICAgOiBudWxsXG4gICAgICAgIH0pLiRkYXRhO1xuICAgIH0pO1xuXG59KShqUXVlcnksIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIENvcmUpIHtcblxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGZ1bmN0aW9uIHJlcG9zaXRpb24oZWxlbWVudCkge1xuXG4gICAgICAgICAgICB2YXIgbW9kYWwgPSAkKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIGRpYWxvZyA9ICQoJy5tb2RhbC1kaWFsb2cnLCBtb2RhbCk7XG5cbiAgICAgICAgICAgIG1vZGFsLmNzcygnZGlzcGxheScsICdibG9jaycpO1xuICAgICAgICAgICAgZGlhbG9nLmNzcyhcIm1hcmdpbi10b3BcIiwgTWF0aC5tYXgoMCwgKCQod2luZG93KS5oZWlnaHQoKSAtIGRpYWxvZy5oZWlnaHQoKSkgLyAyKSk7XG4gICAgICAgIH1cblxuICAgICAgICAkKCQoZG9jdW1lbnQpLCAnLm1vZGFsLm1vZGFsLWNlbnRlcicpLm9uKCdzaG93LmJzLm1vZGFsJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmVwb3NpdGlvbihlLnRhcmdldCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgKCkgPT4ge1xuICAgICAgICAgICAgJCgnLm1vZGFsLm1vZGFsLWNlbnRlcjp2aXNpYmxlJykuZWFjaChmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHJlcG9zaXRpb24oZWxlbWVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUudXNlKHtcblxuICAgICAgICBpbnN0YWxsOiBmdW5jdGlvbihWdWUsIG9wdGlvbnMpIHtcblxuICAgICAgICAgICAgdmFyIHNlcnZpY2VzID0ge307XG5cbiAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlID0gZnVuY3Rpb24obmFtZSwgc2VydmljZSkge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlcnZpY2VzW25hbWVdID0gc2VydmljZXNbbmFtZV0gfHwgc2VydmljZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIENvcmUpIHtcblxuICAgIFZ1ZS52YWxpZGF0b3IoJ2VtYWlsJywgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgcmV0dXJuIC9eKChbXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKFxcLltePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSspKil8KFxcXCIuK1xcXCIpKUAoKFxcW1swLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXF0pfCgoW2EtekEtWlxcLTAtOV0rXFwuKStbYS16QS1aXXsyLH0pKSQvLnRlc3QodmFsKVxuICAgIH0pO1xuXG59KShqUXVlcnksIENvcmUpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnYmluZGluZ3MtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNiaW5kaW5ncy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBzZXRTdHJhdGVneTogZnVuY3Rpb24oc3RyYXRlZ3kpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2N1cnJlbnQuYmluZGluZy5zdHJhdGVneScsIHN0cmF0ZWd5KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXRTdHJhdGVneTogZnVuY3Rpb24oc3RyYXRlZ3kpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy4kZ2V0KCdjdXJyZW50LmJpbmRpbmcuc3RyYXRlZ3knKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnQuYmluZGluZykgdGhpcy5jdXJyZW50LmJpbmRpbmcgPSB7fTtcbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIHZhciBFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2JpbmRpbmdzJywge1xuXG4gICAgICAgIG1peGluczogW0NvcmUuQWN0aW9uTWl4aW4oTW9kYWxFZGl0b3IpXSxcbiAgICB9KTtcblxufSkoVnVlLCBqUXVlcnksIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsKSB7XG5cbiAgICB2YXIgTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ21haW4nKV0sXG4gICAgfSk7XG5cbiAgICB2YXIgRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdkb21haW5zJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMnLFxuICAgIH0pO1xuXG5cbiAgICB2YXIgU2V0dGluZ3NMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdkb21haW5zLXNldHRpbmdzLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtc2V0dGluZ3MtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTZXR0aW5nc01vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdkb21haW5zLXNldHRpbmdzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZG9tYWlucy1zZXR0aW5ncy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIFNldHRpbmdzRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdkb21haW5zLXNldHRpbmdzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFNldHRpbmdzTGlzdFZpZXdlciwgU2V0dGluZ3NNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLXNldHRpbmdzJyxcbiAgICB9KTtcblxufSkoVnVlLCBqUXVlcnksIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsKSB7XG5cbiAgICB2YXIgTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJyldLFxuICAgIH0pO1xuXG4gICAgdmFyIEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMnLFxuICAgIH0pO1xuXG5cbiAgICB2YXIgU2V0dGluZ3NMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zZXR0aW5ncy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zZXR0aW5ncy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIFNldHRpbmdzTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNldHRpbmdzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc2V0dGluZ3MtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTZXR0aW5nc0VkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc2V0dGluZ3MnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU2V0dGluZ3NMaXN0Vmlld2VyLCBTZXR0aW5nc01vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNldHRpbmdzJyxcbiAgICB9KTtcblxuXG4gICAgdmFyIE1ldGFzTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtbWV0YXMtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtbWV0YXMtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBNZXRhc01vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1tZXRhcy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLW1ldGFzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgTWV0YXNFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLW1ldGFzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKE1ldGFzTGlzdFZpZXdlciwgTWV0YXNNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1tZXRhcycsXG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgdmFyIFBhcmFtVmFyaWFibGUgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy12YXJpYWJsZScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLXZhcmlhYmxlJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGlkOiBTdHJpbmcsXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBQYXJhbVN0cmluZyA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLXN0cmluZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLXN0cmluZycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBpZDogU3RyaW5nLFxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgUGFyYW1TZWxlY3QgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1zZWxlY3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1zZWxlY3QnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgaWQ6IFN0cmluZyxcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIFBhcmFtUmljaCA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLXJpY2gnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1yaWNoJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGlkOiBTdHJpbmcsXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBQYXJhbVNvdXJjZSA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLXNvdXJjZScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLXNvdXJjZScsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBpZDogU3RyaW5nLFxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgUGFyYW1NdWx0aXBsZSA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLW11bHRpcGxlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtbXVsdGlwbGUnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgaWQ6IFN0cmluZyxcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLml0ZW0uaXRlbXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIHZhciBQYXJhbU9iamVjdCA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLW9iamVjdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLW9iamVjdCcsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBpZDogU3RyaW5nLFxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgdmFyIFBhcmFtcyA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgb3duZXI6IE9iamVjdCxcbiAgICAgICAgICAgIHRhYjogU3RyaW5nLFxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0XG4gICAgICAgIH1cbiAgICB9KTtcblxuXG4gICAgdmFyIFBhcmFtTXVsdGlwbGVMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtbXVsdGlwbGUtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLW11bHRpcGxlLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBwcm9wOiBPYmplY3QsXG4gICAgICAgICAgICBwYXJhbTogT2JqZWN0LFxuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBnZXRMYWJlbDogZnVuY3Rpb24oaXRlbSkge1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcC5kaXNwbGF5KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2bSA9IG5ldyBWdWUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2bS4kaW50ZXJwb2xhdGUodGhpcy5wcm9wLmRpc3BsYXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gJzxpdGVtPic7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgUGFyYW1CaW5kaW5nc01vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtYmluZGluZ3MtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtYmluZGluZ3MtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2JpbmRpbmcnKSBdLFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaXRlbXM6IHRoaXMuaXRlbXMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XG5cbiAgICAgICAgICAgIHZhciBiaW5kaW5nID0gdGhpcy5jdXJyZW50LmJpbmRpbmcgfHwge307XG4gICAgICAgICAgICBpZiAoIWJpbmRpbmcuc3RyYXRlZ3kpIGJpbmRpbmcuc3RyYXRlZ3kgPSAnaW50ZXJwb2xhdGUnO1xuXG4gICAgICAgICAgICBiaW5kaW5nLnBhcmFtcyA9IGJpbmRpbmcucGFyYW1zIHx8IHt9O1xuXG4gICAgICAgICAgICBpZiAodGhpcy5jb250ZXh0LnByb3AucHJvcHMpIHtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZXh0LnByb3AucHJvcHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHRoaXMuY29udGV4dC5wcm9wLnByb3BzW2ldO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyYW0gPSB0aGlzLmN1cnJlbnQudmFsdWVbcHJvcC5uYW1lXSA9IHRoaXMuY3VycmVudC52YWx1ZVtwcm9wLm5hbWVdIHx8IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtLl9hY3Rpb24gPSBwYXJhbS5fYWN0aW9uID09ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgICAgICA/ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgICAgICA6ICdjcmVhdGUnXG4gICAgICAgICAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3A6IHByb3AsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbTogcGFyYW0sXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJHNldCgnY3VycmVudC5iaW5kaW5nJywgYmluZGluZyk7XG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2l0ZW1zJywgaXRlbXMpO1xuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBzZXRTdHJhdGVneTogZnVuY3Rpb24oc3RyYXRlZ3kpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2N1cnJlbnQuYmluZGluZy5zdHJhdGVneScsIHN0cmF0ZWd5KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXRTdHJhdGVneTogZnVuY3Rpb24oc3RyYXRlZ3kpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy4kZ2V0KCdjdXJyZW50LmJpbmRpbmcuc3RyYXRlZ3knKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB2YXIgRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtYmluZGluZ3MnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuQWN0aW9uTWl4aW4oUGFyYW1CaW5kaW5nc01vZGFsRWRpdG9yKV0sXG4gICAgfSk7XG5cbiAgICB2YXIgUGFyYW1NdWx0aXBsZU1vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtbXVsdGlwbGUtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtbXVsdGlwbGUtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignZGF0YScpXSxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLml0ZW1zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xuXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnY3JlYXRlZCcsIFBhcmFtTXVsdGlwbGVNb2RhbEVkaXRvcik7XG5cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuY29udGV4dC5wcm9wKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRleHQucHJvcC5wcm9wcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHByb3AgPSB0aGlzLmNvbnRleHQucHJvcC5wcm9wc1tpXTtcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW0gPSB0aGlzLmN1cnJlbnRbcHJvcC5uYW1lXSA9IHRoaXMuY3VycmVudFtwcm9wLm5hbWVdIHx8IHsgdmFsdWU6IG51bGwgfTtcblxuICAgICAgICAgICAgICAgIHBhcmFtLl9hY3Rpb24gPSBwYXJhbS5fYWN0aW9uID09ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgID8gJ3VwZGF0ZSdcbiAgICAgICAgICAgICAgICAgICAgOiAnY3JlYXRlJ1xuICAgICAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICBwcm9wOiBwcm9wLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbTogcGFyYW0sXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGl0ZW0pO1xuXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy4kc2V0KCdpdGVtcycsIGl0ZW1zKTtcbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIHZhciBQYXJhbU11bHRpcGxlRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtbXVsdGlwbGUtZWRpdG9yJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFBhcmFtTXVsdGlwbGVMaXN0Vmlld2VyLCBQYXJhbU11bHRpcGxlTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLW11bHRpcGxlLWVkaXRvcicsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBwcm9wOiBPYmplY3QsXG4gICAgICAgICAgICBwYXJhbTogT2JqZWN0LFxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG5cbiAgICB2YXIgUGFyYW1zTGlzdCA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1saXN0JyxcbiAgICAgICAgY29tcG9uZW50czoge1xuICAgICAgICAgICAgJ3BhcmFtcy1zdHJpbmcnOiBQYXJhbVN0cmluZyxcbiAgICAgICAgICAgICdwYXJhbXMtcmljaCc6IFBhcmFtUmljaCxcbiAgICAgICAgICAgICdwYXJhbXMtc291cmNlJzogUGFyYW1Tb3VyY2UsXG4gICAgICAgICAgICAncGFyYW1zLW11bHRpcGxlJzogUGFyYW1NdWx0aXBsZSxcbiAgICAgICAgfSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIG93bmVyOiBPYmplY3QsXG4gICAgICAgICAgICB0YWI6IFN0cmluZyxcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgdmFyIExpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJyldLFxuICAgIH0pO1xuXG4gICAgdmFyIEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihMaXN0Vmlld2VyLCBNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzJyxcbiAgICB9KTtcblxuXG4gICAgdmFyIFNldHRpbmdzTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcy1zZXR0aW5ncy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLXNldHRpbmdzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU2V0dGluZ3NNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcy1zZXR0aW5ncy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMtc2V0dGluZ3MtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTZXR0aW5nc0VkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcy1zZXR0aW5ncycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTZXR0aW5nc0xpc3RWaWV3ZXIsIFNldHRpbmdzTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1zZXR0aW5ncycsXG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdzZXR0aW5ncy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NldHRpbmdzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2RvbWFpbnMnKV0sXG4gICAgfSk7XG5cbiAgICB2YXIgRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdzZXR0aW5ncycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5BY3Rpb25NaXhpbihNb2RhbEVkaXRvcildLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0XG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHB1c2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9zZXR0aW5ncy9kby11cGRhdGUnLFxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKSxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmRvbmUoKGQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBkKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHB1bGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9zZXR0aW5ncycsXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmRvbmUoKGQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBkKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgdmFyIFN0b3JhZ2VzTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc3RvcmFnZXMtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc3RvcmFnZXMtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTdG9yYWdlc01vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdzdG9yYWdlcy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3N0b3JhZ2VzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIGNoZWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY2hlY2snKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIFN0b3JhZ2VzRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdzdG9yYWdlcycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTdG9yYWdlc0xpc3RWaWV3ZXIsIFN0b3JhZ2VzTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjc3RvcmFnZXMnLFxuICAgIH0pO1xuXG4gICAgdmFyIFN0b3JhZ2VzVmFyaWFibGVzTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc3RvcmFnZXMtdmFyaWFibGVzLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3N0b3JhZ2VzLXZhcmlhYmxlcy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIFN0b3JhZ2VzVmFyaWFibGVzTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3N0b3JhZ2VzLXZhcmlhYmxlcy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3N0b3JhZ2VzLXZhcmlhYmxlcy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIFN0b3JhZ2VzVmFyaWFibGVzRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdzdG9yYWdlcy12YXJpYWJsZXMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU3RvcmFnZXNWYXJpYWJsZXNMaXN0Vmlld2VyLCBTdG9yYWdlc1ZhcmlhYmxlc01vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3N0b3JhZ2VzLXZhcmlhYmxlcycsXG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgdmFyIExpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3dpZGdldHMtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjd2lkZ2V0cy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCd3aWRnZXRzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjd2lkZ2V0cy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnd2lkZ2V0cycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihMaXN0Vmlld2VyLCBNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyN3aWRnZXRzJyxcbiAgICB9KTtcblxufSkoVnVlLCBqUXVlcnksIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1hY3Rpb25zJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1hY3Rpb25zJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXG4gICAgICAgICAgICBjYXRlZ29yeTogT2JqZWN0LFxuICAgICAgICAgICAgZG9tYWluOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3RcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGl0ZW0sIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWJyYW5kJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1icmFuZCcsXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtY2F0ZWdvcmllcycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtY2F0ZWdvcmllcycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBBcnJheSxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGl0ZW0sIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWNvbnRhaW5lcicsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtY29udGFpbmVyJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgdmFyIHJ1bnRpbWUgPSBWdWUuc2VydmljZSgncnVudGltZScsIHtcblxuICAgICAgICBldmFsdWF0ZTogZnVuY3Rpb24oc2VsZiwgYiwgdikge1xuXG4gICAgICAgICAgICBpZiAoYiAmJiBiLmV4cHJlc3Npb24pIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiLnN0cmF0ZWd5ID09ICdldmFsJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gc2VsZi4kZXZhbChiLmV4cHJlc3Npb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGIuc3RyYXRlZ3kgPT0gJ3dpcmUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBzZWxmLiRnZXQoYi5leHByZXNzaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLiRpbnRlcnBvbGF0ZShiLmV4cHJlc3Npb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2Fubm90IGV2YWx1YXRlIGV4cHJlc3Npb24nLCBiLmV4cHJlc3Npb24pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICB9LFxuXG4gICAgICAgIGV2YWx1YXRlUGFyYW1zOiBmdW5jdGlvbihzZWxmLCBwcm9wcywgcGFyYW1zKSB7XG5cbiAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBwcm9wID0gcHJvcHNbaV07XG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gcGFyYW1zICYmIHBhcmFtc1twcm9wLm5hbWVdO1xuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBwcm9wOiBwcm9wLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbTogcGFyYW0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBpdGVtc1tpXTtcblxuICAgICAgICAgICAgICAgIHZhciBuID0gaXRlbS5wcm9wLm5hbWU7XG4gICAgICAgICAgICAgICAgdmFyIHIgPSBpdGVtLnByb3AudmFyaWFibGU7XG4gICAgICAgICAgICAgICAgdmFyIGIgPSBpdGVtLnBhcmFtLmJpbmRpbmc7XG4gICAgICAgICAgICAgICAgdmFyIHYgPSBpdGVtLnBhcmFtLnZhbHVlO1xuXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0ucHJvcC50eXBlID09ICdvYmplY3QnKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHZ2O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChiICYmIGIuZXhwcmVzc2lvbikge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVtuXSA9IHZ2O1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXMgPSB0aGlzLmV2YWx1YXRlUGFyYW1zKHNlbGYsIGl0ZW0ucHJvcC5wcm9wcywgdik7XG4gICAgICAgICAgICAgICAgICAgICAgICB2diA9IHIgPyB7IHZhbHVlOiByZXMgfSA6IHJlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlW25dID0gdnY7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbS5wcm9wLnR5cGUgPT0gJ211bHRpcGxlJykge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChiICYmIGIuZXhwcmVzc2lvbikge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdnYgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXJyYXkgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBydW50aW1lLmV2YWx1YXRlKHNlbGYsIGIsIHYpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZ2ID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkLmlzQXJyYXkocmVzdWx0KSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcmVzdWx0Lmxlbmd0aDsgaisrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2bSA9IG5ldyBWdWUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IE9iamVjdC5hc3NpZ24oSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzZWxmLiRkYXRhKSksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXg6IGosXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmVzdWx0W2pdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJheS5wdXNoKHRoaXMuZXZhbHVhdGVQYXJhbXModm0sIGl0ZW0ucHJvcC5wcm9wcywgYi5wYXJhbXMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZ2ID0gYXJyYXk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhcnJheSA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHYubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmkgPSB2W2pdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2aS5fYWN0aW9uICE9ICdyZW1vdmUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5W2luZGV4KytdID0gdGhpcy5ldmFsdWF0ZVBhcmFtcyhzZWxmLCBpdGVtLnByb3AucHJvcHMsIHZpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZ2ID0gciA/IHsgdmFsdWU6IGFycmF5IH0gOiBhcnJheTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlW25dID0gdnY7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB2diA9IHJ1bnRpbWUuZXZhbHVhdGUoc2VsZiwgYiwgdik7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlW25dID0gdnYgfHwgJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBEZWNvcmF0b3JNaXhpbiA9IHtcblxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxuICAgICAgICB9LFxuXG4gICAgICAgIG1ldGhvZHM6IHtcblxuICAgICAgICAgICAgcmVtb3ZlV2lkZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaCgncmVtb3ZlQ2hpbGRXaWRnZXQnLCB7IGl0ZW06IHRoaXMubW9kZWwgfSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBkb0FwcGx5OiBmdW5jdGlvbihtb2RlbCkge1xuXG4gICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG1vZGVsKSksIHtcbiAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogdGhpcy5tb2RlbC5fYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMubW9kZWwuX2FjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ3Jlc2l6ZScpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgc2hvd1NldHRpbmdzOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkaWFsb2cgPSBuZXcgU2hlbGwuV2lkZ2V0cy5Nb2RhbEVkaXRvcih7XG5cbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsczogdGhpcy5nbG9iYWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3duZXI6IHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiB0aGlzLndpZGdldFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiB0aGlzLm1vZGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudDogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKSlcbiAgICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3duZXIuZG9BcHBseSh0aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkuJG1vdW50KCkuJGFwcGVuZFRvKCQoJ2JvZHknKS5nZXQoMCkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgdmFyIEJpbmRpbmdzTWl4aW4gPSB7XG5cbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGJpbmRpbmdzOiB0aGlzLmJpbmRpbmdzLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBiaW5kaW5ncyA9IHJ1bnRpbWUuZXZhbHVhdGVQYXJhbXModGhpcywgdGhpcy53aWRnZXQucHJvcHMsIHRoaXMubW9kZWwucGFyYW1zKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2JpbmRpbmdzJywgYmluZGluZ3MpO1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdzdG9yYWdlJywgKHN0b3JhZ2UpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgYmluZGluZ3MgPSBydW50aW1lLmV2YWx1YXRlUGFyYW1zKHRoaXMsIHRoaXMud2lkZ2V0LnByb3BzLCB0aGlzLm1vZGVsLnBhcmFtcyk7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdiaW5kaW5ncycsIGJpbmRpbmdzKTtcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBkZWVwOiB0cnVlLFxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnbW9kZWwnLCAobW9kZWwpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgYmluZGluZ3MgPSBydW50aW1lLmV2YWx1YXRlUGFyYW1zKHRoaXMsIHRoaXMud2lkZ2V0LnByb3BzLCBtb2RlbC5wYXJhbXMpXG4gICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdiaW5kaW5ncycsIGJpbmRpbmdzKTtcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBkZWVwOiB0cnVlLFxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBDb21wb3NpdGVNaXhpbiA9IHtcblxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IHRoaXMuY2hpbGRyZW4sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnaXRlbXMnLCAoaXRlbXMpID0+IHtcblxuICAgICAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IFtdO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtcykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IGl0ZW1zW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uX2FjdGlvbiAhPSAncmVtb3ZlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5wbGFjZWhvbGRlcigpKSkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGV2ZW50czoge1xuXG4gICAgICAgICAgICByZW1vdmVDaGlsZFdpZGdldDogZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBkYXRhLml0ZW07XG5cbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5fYWN0aW9uID09ICdjcmVhdGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMuJHJlbW92ZShpdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLl9hY3Rpb24gPSAncmVtb3ZlJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zID0gdGhpcy5pdGVtcy5zbGljZSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcblxuICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgIC8vIGZpbmQ6IGZ1bmN0aW9uKGNoaWxkcmVuLCBpdGVtKSB7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgICAgICAvLyAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGggJiYgaW5kZXggPCBkb21JbmRleDsgaSsrKSB7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyAgICAgICAgIGlmIChjaGlsZC5fYWN0aW9uICE9ICdyZW1vdmUnKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gaW5kZXg7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIHZhciBTb3J0YWJsZU1peGluID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcblxuICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZDogdGhpcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgYXR0YWNoZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuJHJvdXRlLnByaXZhdGUpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgc2hlbGwgPSBWdWUuc2VydmljZSgnc2hlbGwnKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLiR3YXRjaCgnc2VsZWN0ZWQnLCBmdW5jdGlvbihzZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgaWYgKHRoaXMuc29ydGFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgdGhpcy5zb3J0YWJsZS5zb3J0YWJsZShcImRpc2FibGVcIik7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgdGhpcy5zb3J0YWJsZS5zb3J0YWJsZShcImVuYWJsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgICAgICBzZWxlY3RUYXJnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgdW5zZWxlY3RUYXJnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtZGVjb3JhdG9yLXN0dWInLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWRlY29yYXRvci1zdHViJyxcbiAgICAgICAgbWl4aW5zOiBbIERlY29yYXRvck1peGluLCBCaW5kaW5nc01peGluIF0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxuICAgICAgICAgICAgc3RhY2s6IE9iamVjdCxcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcbiAgICAgICAgICAgIHN0b3JhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXG4gICAgICAgICAgICB3aWRnZXQ6IE9iamVjdCxcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtZGVjb3JhdG9yLXdpZGdldCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZGVjb3JhdG9yLXdpZGdldCcsXG4gICAgICAgIG1peGluczogWyBEZWNvcmF0b3JNaXhpbiwgQmluZGluZ3NNaXhpbiBdLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXG4gICAgICAgICAgICBzdG9yYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3QsXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci1ob3Jpc29udGFsJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kZWNvcmF0b3ItaG9yaXNvbnRhbCcsXG4gICAgICAgIG1peGluczogWyBEZWNvcmF0b3JNaXhpbiwgQ29tcG9zaXRlTWl4aW4sIFNvcnRhYmxlTWl4aW4oJz4uZ2UuZ2UtY29udGVudCA+LndnLndnLWRlZmF1bHQtc3RhY2sgPi53Zy53Zy1jb250ZW50ID4ud2cud2ctdGFibGUgPi53Zy53Zy1yb3cnKSwgQmluZGluZ3NNaXhpbiBdLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXG4gICAgICAgICAgICBzdG9yYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3QsXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBWdWUuc2VydmljZSgncGFsZXR0ZScpLnBsYWNlaG9sZGVyKGBcbiAgICAgICAgICAgICAgICAgICAgPHNtYWxsPkhvcmlzb250YWwgU3RhY2s8L3NtYWxsPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PkRyb3AgSGVyZTwvZGl2PlxuICAgICAgICAgICAgICAgIGApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtZGVjb3JhdG9yLXZlcnRpY2FsJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kZWNvcmF0b3ItdmVydGljYWwnLFxuICAgICAgICBtaXhpbnM6IFsgRGVjb3JhdG9yTWl4aW4sIENvbXBvc2l0ZU1peGluLCBTb3J0YWJsZU1peGluKCc+LmdlLmdlLWNvbnRlbnQgPi53Zy53Zy1kZWZhdWx0LXN0YWNrID4ud2cud2ctY29udGVudCA+LndnLndnLXRhYmxlJyksIEJpbmRpbmdzTWl4aW4gXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0LFxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVnVlLnNlcnZpY2UoJ3BhbGV0dGUnKS5wbGFjZWhvbGRlcihgXG4gICAgICAgICAgICAgICAgICAgIDxzbWFsbD5WZXJ0aWNhbCBTdGFjazwvc21hbGw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+RHJvcCBIZXJlPC9kaXY+XG4gICAgICAgICAgICAgICAgYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1kZWNvcmF0b3ItY2FudmFzJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kZWNvcmF0b3ItY2FudmFzJyxcbiAgICAgICAgbWl4aW5zOiBbIENvbXBvc2l0ZU1peGluLCBTb3J0YWJsZU1peGluKCc+LmdlLmdlLWNvbnRlbnQgPi53Zy53Zy1kZWZhdWx0LXN0YWNrID4ud2cud2ctY29udGVudCA+LndnLndnLXRhYmxlJykgXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgIH0sXG4gICAgICAgIGF0dGFjaGVkOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGRyYWdnZWQ7XG5cbiAgICAgICAgICAgIHRoaXMuc29ydGFibGUgPSAkKHRoaXMuJGVsKS5zb3J0YWJsZSh7XG5cbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkcm9wOiB0cnVlLFxuXG4gICAgICAgICAgICAgICAgY29udGFpbmVyU2VsZWN0b3I6ICcud2cud2ctc29ydGFibGUtY29udGFpbmVyLndnLXNvcnRhYmxlLWVkaXRhYmxlJyxcbiAgICAgICAgICAgICAgICBpdGVtU2VsZWN0b3I6ICcud2cud2ctc29ydGFibGUtaXRlbS53Zy1zb3J0YWJsZS1lZGl0YWJsZScsXG4gICAgICAgICAgICAgICAgZXhjbHVkZVNlbGVjdG9yOiAnLmdlLmdlLW92ZXJsYXknLFxuXG4gICAgICAgICAgICAgICAgdmVydGljYWxDbGFzczogXCJ3Zy1zb3J0YWJsZS12ZXJ0aWNhbFwiLFxuICAgICAgICAgICAgICAgIGhvcmlzb250YWxDbGFzczogXCJ3Zy1zb3J0YWJsZS1ob3Jpc29udGFsXCIsXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6IGBcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIndnIHdnLXNvcnRhYmxlLXBsYWNlaG9sZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwid2cgd2ctcGxhY2Vob2xkZXItY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIndnIHdnLXBsYWNlaG9sZGVyLWlubmVyXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgYCxcbiAgICAgICAgICAgICAgICBvbkRyYWdTdGFydDogZnVuY3Rpb24oY29udGV4dCwgZXZlbnQsIF9zdXBlcikge1xuXG4gICAgICAgICAgICAgICAgICAgIF9zdXBlcihjb250ZXh0LCBldmVudCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YWNrID0gJChjb250ZXh0LiRjb250YWluZXIpLmNsb3Nlc3QoJy5nZS5nZS13aWRnZXQnKS5nZXQoMCkuX192dWVfXztcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZ1ZSA9IGNvbnRleHQuJG9yaWdpbmFsSXRlbS5maW5kKCcuZ2UuZ2Utd2lkZ2V0OmZpcnN0JykuZ2V0KDApLl9fdnVlX187XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codnVlLm1vZGVsKTtcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dlZCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrOiBzdGFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGluZGV4OiBzdGFjay5maW5kKHN0YWNrLml0ZW1zLCBjb250ZXh0LiRvcmlnaW5hbEl0ZW0uaW5kZXgoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogc3RhY2suaXRlbXMuaW5kZXhPZih2dWUubW9kZWwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdnVlOiB2dWUsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbkRyb3A6IGZ1bmN0aW9uKGNvbnRleHQsIGV2ZW50LCBfc3VwZXIpIHtcblxuICAgICAgICAgICAgICAgICAgICBfc3VwZXIoY29udGV4dCwgZXZlbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB2dWUgPSBjb250ZXh0LmxvY2F0aW9uLiRpdGVtLmZpbmQoJy5nZS5nZS13aWRnZXQ6Zmlyc3QnKS5nZXQoMCkuX192dWVfX1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdTdGFjayA9IGNvbnRleHQubG9jYXRpb24uJGNvbnRhaW5lci5jbG9zZXN0KCcuZ2UuZ2Utd2lkZ2V0JykuZ2V0KDApLl9fdnVlX187XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0luZGV4ID0gbmV3U3RhY2suaXRlbXMuaW5kZXhPZih2dWUubW9kZWwpICsgKGNvbnRleHQubG9jYXRpb24uYmVmb3JlID8gMCA6IDEpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB3ID0gY29udGV4dC4kaXRlbS5kYXRhKCd3aWRnZXQnKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3SXRlbSA9IFZ1ZS5zZXJ2aWNlKCdwYWxldHRlJykuaXRlbSh3KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0YWNrLml0ZW1zLnNwbGljZShuZXdJbmRleCwgMCwgbmV3SXRlbSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkcmFnZ2VkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvbGRTdGFjayA9IGRyYWdnZWQuc3RhY2s7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2xkSW5kZXggPSBkcmFnZ2VkLmluZGV4O1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9sZEl0ZW0gPSBkcmFnZ2VkLnZ1ZS5tb2RlbDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0l0ZW0gPSBPYmplY3QuYXNzaWduKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZHJhZ2dlZC52dWUubW9kZWwpKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvbGRTdGFjayAhPSBuZXdTdGFjaykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG5ld0l0ZW0ucmVzb3VyY2UuaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG5ld0l0ZW0uaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3SXRlbS5fYWN0aW9uID0gJ2NyZWF0ZSc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob2xkSXRlbS5fYWN0aW9uID09ICdjcmVhdGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZFN0YWNrLml0ZW1zLnNwbGljZShvbGRJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkSXRlbS5fYWN0aW9uID0gJ3JlbW92ZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RhY2suaXRlbXMuc3BsaWNlKG5ld0luZGV4LCAwLCBuZXdJdGVtKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdJbmRleCAhPSBvbGRJbmRleCAmJiBuZXdJbmRleCAhPSBvbGRJbmRleCArIDEpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0l0ZW0uX2FjdGlvbiA9IG9sZEl0ZW0uX2FjdGlvbiA9PSAnY3JlYXRlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdjcmVhdGUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ3VwZGF0ZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3SW5kZXggPCBvbGRJbmRleCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZFN0YWNrLml0ZW1zLnNwbGljZShvbGRJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0YWNrLml0ZW1zLnNwbGljZShuZXdJbmRleCwgMCwgbmV3SXRlbSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0luZGV4ID4gb2xkSW5kZXgpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdTdGFjay5pdGVtcy5zcGxpY2UobmV3SW5kZXgsIDAsIG5ld0l0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRTdGFjay5pdGVtcy5zcGxpY2Uob2xkSW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgb2xkU3RhY2suaXRlbXMgPSBvbGRTdGFjay5pdGVtcy5zbGljZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RhY2suaXRlbXMgPSBuZXdTdGFjay5pdGVtcy5zbGljZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC4kaXRlbS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBWdWUuc2VydmljZSgncGFsZXR0ZScpLnBsYWNlaG9sZGVyKGBcbiAgICAgICAgICAgICAgICAgICAgPHNtYWxsPlZlcnRpY2FsIFN0YWNrPC9zbWFsbD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5Ecm9wIEhlcmU8L2Rpdj5cbiAgICAgICAgICAgICAgICBgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1kb21haW5zJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kb21haW5zJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGRvbWFpbnM6IEFycmF5LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIFNoZWxsLkxvYWRlciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtbG9hZGVyJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1sb2FkZXInLFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcG9ydGFsOiBudWxsLFxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiBudWxsLFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdwb3J0YWxzJykuZ2V0KHsgaWQ6IHRoaXMuJHJvdXRlLnBhcmFtcy5wb3J0YWwgfSkudGhlbihcbiAgICAgICAgICAgICAgICAoZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ3BvcnRhbCcsIGQuZGF0YS5wb3J0YWwpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ3NldHRpbmdzJywgZC5kYXRhLnNldHRpbmdzKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wYWdlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wYWdlJyxcbiAgICAgICAgbWl4aW5zOiBbIC8qQ29yZS5Db250YWluZXJNaXhpbiwgQ29yZS5Tb3J0YWJsZU1peGluKi8gXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkZWNvcmF0b3I6IHRoaXMuZGVjb3JhdG9yLFxuICAgICAgICAgICAgICAgIGRhdGE6IHRoaXMuZGF0YSxcbiAgICAgICAgICAgICAgICBzdG9yYWdlOiB0aGlzLnN0b3JhZ2UsXG4gICAgICAgICAgICAgICAgcGFnZVNldHRpbmdzOiB7fSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgcnVudGltZSA9IFZ1ZS5zZXJ2aWNlKCdydW50aW1lJyk7XG5cbiAgICAgICAgICAgIHRoaXMuZGVjb3JhdG9yID0gJ3NoZWxsLWRlY29yYXRvci1jYW52YXMnO1xuICAgICAgICAgICAgdGhpcy5kYXRhID0ge307XG4gICAgICAgICAgICB0aGlzLnN0b3JhZ2UgPSB7fTtcblxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ3BhZ2UucmVzb3VyY2UnLCAocmVzb3VyY2UpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ3BhZ2VTZXR0aW5ncy53aWR0aCcsICc5NjBweCcpOyAvLyBkZWZhdWx0XG4gICAgICAgICAgICAgICAgaWYgKHJlc291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAocGFyYW0gaW4gcmVzb3VyY2UucGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ3BhZ2VTZXR0aW5ncy4nICsgcmVzb3VyY2UucGFyYW1zW3BhcmFtXS5uYW1lLCByZXNvdXJjZS5wYXJhbXNbcGFyYW1dLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgncGFnZS5zdG9yYWdlcycsIChzdG9yYWdlcykgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKHN0b3JhZ2VzKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0b3JhZ2UgPSB7fTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0b3JhZ2VzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdCA9IHN0b3JhZ2VzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmFnZVtzdC5uYW1lXSA9IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN0LnZhcmlhYmxlcy5sZW5ndGg7IGorKykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhcmlhYmxlID0gc3QudmFyaWFibGVzW2pdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JhZ2Vbc3QubmFtZV1bdmFyaWFibGUubmFtZV0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBydW50aW1lLmV2YWx1YXRlKHRoaXMsIHZhcmlhYmxlLmJpbmRpbmcsIHZhcmlhYmxlLnZhbHVlKSB8fCBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnc3RvcmFnZScsIHN0b3JhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgncGFnZS5zb3VyY2VzJywgKHNvdXJjZXMpID0+IHtcblxuICAgICAgICAgICAgICAgIGlmIChzb3VyY2VzKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc291cmNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucHVzaCh0aGlzLmRvUmVxdWVzdChzb3VyY2VzW2ldKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVmZXJyZWQubGVuZ3RoID4gMSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkLndoZW4uYXBwbHkodGhpcywgZGVmZXJyZWQpLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW3NvdXJjZXNbaV0ubmFtZV0gPSBhcmd1bWVudHNbaV1bMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnZGF0YScsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRlZmVycmVkLmxlbmd0aCA9PSAxKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkWzBdLmRvbmUoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtzb3VyY2VzWzBdLm5hbWVdID0gZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2RhdGEnLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBkb1JlcXVlc3Q6IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgICAgICAgICB2YXIgcXVlcnkgPSB7fTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHMucGFyYW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHMucGFyYW1zW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW0uaW4gPT0gJ3F1ZXJ5JyAmJiBwYXJhbS5zcGVjaWZpZWQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gcGFyYW0uYmluZGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMuJGludGVycG9sYXRlKHBhcmFtLmJpbmRpbmcpIC8vIFRPRE8gSW50ZXJwb2xhdGUgaW4gcGFnZSBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogcGFyYW0udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5W3BhcmFtLm5hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBzLm1ldGhvZCxcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBzLnVybCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBxdWVyeSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wYWdlcycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcGFnZXMnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgcGFnZXM6IEFycmF5LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBQYWxldHRlSXRlbSA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcGFsZXR0ZS1pdGVtJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wYWxldHRlLWl0ZW0nLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgY2F0ZWdvcnk6IE9iamVjdCxcbiAgICAgICAgICAgIGdyb3VwOiBPYmplY3QsXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wYWxldHRlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wYWxldHRlJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIGNhdGVnb3J5OiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjYXRlZ29yaWVzOiB0aGlzLmNhdGVnb3JpZXNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIGNvbXBvbmVudHM6IHtcbiAgICAgICAgICAgICdwYWxldHRlLWl0ZW0nOiBQYWxldHRlSXRlbVxuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuY2F0ZWdvcmllcyA9IFdpZGdldHMuUGFsZXR0ZS5jYXRlZ29yaWVzKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGF0dGFjaGVkOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdGhpcy5zb3J0YWJsZSA9ICQodGhpcy4kZWwpLnNvcnRhYmxlKHtcbiAgICAgICAgICAgICAgICBncm91cDogJ3dpZGdldHMnLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lclNlbGVjdG9yOiAnLndnLXNvcnRhYmxlLWNvbnRhaW5lcicsXG4gICAgICAgICAgICAgICAgaXRlbVNlbGVjdG9yOiAnLndnLXNvcnRhYmxlLWl0ZW0nLFxuICAgICAgICAgICAgICAgIGRyb3A6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgU2hlbGwuU2hlbGwgPSB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB0aGlzLmdsb2JhbHMgPSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBwYWdlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHN0b3JhZ2U6IG51bGwsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5ncyxcbiAgICAgICAgICAgICAgICBtb2RlbDogdGhpcy5tb2RlbCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIFNoZWxsLlNoZWxsUHVibGljID1cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wdWJsaWMnLCB7XG4gICAgICAgIG1peGluczogWyBTaGVsbC5TaGVsbCBdLFxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wdWJsaWMnLFxuICAgIH0pO1xuXG4gICAgU2hlbGwuU2hlbGxQcml2YXRlID1cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wcml2YXRlJywge1xuXG4gICAgICAgIG1peGluczogWyBTaGVsbC5TaGVsbCBdLFxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wcml2YXRlJyxcblxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdGhpcy5zY2FsZSA9IDE7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlbGV2YW50KGN1cnJlbnQsIGNvbGxlY3Rpb24pIHtcblxuICAgICAgICAgICAgICAgIGlmICghY3VycmVudCB8fCBjdXJyZW50Ll9hY3Rpb24gPT0gJ3JlbW92ZScgfHwgKGNvbGxlY3Rpb24gJiYgY29sbGVjdGlvbi5pbmRleE9mKGN1cnJlbnQpIDwgMCkpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoY29sbGVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2xsZWN0aW9uLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGMgPSBjb2xsZWN0aW9uW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjLl9hY3Rpb24gIT0gJ3JlbW92ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQgJiYgY3VycmVudC5fYWN0aW9uID09ICdyZW1vdmUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLmNhdGVnb3J5ID0gVnVlLnNlcnZpY2UoJ3BhbGV0dGUnKS5jYXRlZ29yaWVzKClbMF07XG5cbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdtb2RlbC5kb21haW5zJywgKGRvbWFpbnMpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLmRvbWFpbiA9IHJlbGV2YW50KHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uZG9tYWluLCBkb21haW5zKTtcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ21vZGVsLnBhZ2VzJywgKHBhZ2VzKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5wYWdlID0gcmVsZXZhbnQodGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5wYWdlLCBwYWdlcyk7XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdnbG9iYWxzLnNlbGVjdGlvbi5wYWdlLnNvdXJjZXMnLCAoc291cmNlcykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uc291cmNlID0gcmVsZXZhbnQodGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5zb3VyY2UsIHNvdXJjZXMpO1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnZ2xvYmFscy5zZWxlY3Rpb24ucGFnZS5zdG9yYWdlcycsIChzdG9yYWdlcykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uc3RvcmFnZSA9IHJlbGV2YW50KHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uc3RvcmFnZSwgc3RvcmFnZXMpO1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgem9vbUluOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zY2FsZSArPSAwLjE7XG4gICAgICAgICAgICAgICAgJCgnLmdlLmdlLXBhZ2UnLCB0aGlzLiRlbCkuY3NzKCd0cmFuc2Zvcm0nLCAnc2NhbGUoJyArIHRoaXMuc2NhbGUgKyAnKScpO1xuICAgICAgICAgICAgICAgICQoJy5nZS5nZS1jb250YWluZXInLCB0aGlzLiRlbCkucGVyZmVjdFNjcm9sbGJhcigndXBkYXRlJyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgem9vbU91dDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2NhbGUgLT0gMC4xO1xuICAgICAgICAgICAgICAgICQoJy5nZS5nZS1wYWdlJywgdGhpcy4kZWwpLmNzcygndHJhbnNmb3JtJywgJ3NjYWxlKCcgKyB0aGlzLnNjYWxlICsgJyknKTtcbiAgICAgICAgICAgICAgICAkKCcuZ2UuZ2UtY29udGFpbmVyJywgdGhpcy4kZWwpLnBlcmZlY3RTY3JvbGxiYXIoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHB1bGw6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6IGAvd3MvcG9ydGFscy8ke3RoaXMubW9kZWwuaWR9YCxcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZG9uZSgoZCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdtb2RlbCcsIGQucG9ydGFsKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHB1c2g6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6IGAvd3MvcG9ydGFscy8ke3RoaXMubW9kZWwuaWR9YCxcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKSxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmRvbmUoKGQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnbW9kZWwnLCBkLnBvcnRhbCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZWxlY3RDYXRlZ29yeTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uY2F0ZWdvcnkgPSBkYXRhLml0ZW07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VsZWN0RG9tYWluOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5kb21haW4gPSBkYXRhLml0ZW07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VsZWN0UGFnZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24ucGFnZSA9IGRhdGEuaXRlbTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZWxlY3RTb3VyY2U6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnNvdXJjZSA9IGRhdGEuaXRlbTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZWxlY3RTdG9yYWdlOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5zdG9yYWdlID0gZGF0YS5pdGVtO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXNvdXJjZXMnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXNvdXJjZXMnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgc291cmNlczogQXJyYXksXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtc3RvcmFnZXMnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXN0b3JhZ2VzJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIHN0b3JhZ2VzOiBBcnJheSxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC10YXJnZXQnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXRhcmdldCcsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgU2hlbGwuV2lkZ2V0ID1cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC13aWRnZXQnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXdpZGdldCcsXG4gICAgICAgIG1peGluczogWyAvKiBDb3JlLkRlY29yYXRvck1peGluLCBDb3JlLkNvbnRhaW5lck1peGluLCBDb3JlLlNvcnRhYmxlTWl4aW4sIENvcmUuQmluZGluZ3NNaXhpbiAqLyBdLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXG4gICAgICAgIH0sXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5kZWNvcmF0b3JzID0ge1xuICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlczoge1xuICAgICAgICAgICAgICAgICAgICAnZGVmYXVsdC1zdGFjay1ob3Jpc29udGFsJzogJ3NoZWxsLWRlY29yYXRvci1ob3Jpc29udGFsJyxcbiAgICAgICAgICAgICAgICAgICAgJ2RlZmF1bHQtc3RhY2stdmVydGljYWwnOiAnc2hlbGwtZGVjb3JhdG9yLXZlcnRpY2FsJyxcbiAgICAgICAgICAgICAgICAgICAgJ2RlZmF1bHQtc3R1Yic6ICdzaGVsbC1kZWNvcmF0b3Itc3R1YicsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmYWxsYmFjazogJ3NoZWxsLWRlY29yYXRvci13aWRnZXQnLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBwYWxldHRlID0gVnVlLnNlcnZpY2UoJ3BhbGV0dGUnKTtcbiAgICAgICAgICAgIHRoaXMud2lkZ2V0ID0gcGFsZXR0ZS53aWRnZXQodGhpcy5tb2RlbC5uYW1lKTtcbiAgICAgICAgICAgIHRoaXMuZGVjb3JhdG9yID0gdGhpcy5kZWNvcmF0b3JzLmFsdGVybmF0aXZlc1t0aGlzLndpZGdldC50YWddIHx8IHRoaXMuZGVjb3JhdG9ycy5mYWxsYmFjaztcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgd2lkZ2V0OiB0aGlzLndpZGdldCxcbiAgICAgICAgICAgICAgICBkZWNvcmF0b3I6IHRoaXMuZGVjb3JhdG9yLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsKSB7XG5cbiAgICB2YXIgU291cmNlc0xpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIFNvdXJjZXNNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgY2hlY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjaGVjaycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgU291cmNlc0VkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTb3VyY2VzTGlzdFZpZXdlciwgU291cmNlc01vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMnLFxuICAgIH0pO1xuXG4gICAgdmFyIFNvdXJjZXNQYXJhbXNMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLXBhcmFtcy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLXBhcmFtcy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIFNvdXJjZXNQYXJhbXNNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1wYXJhbXMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLXBhcmFtcy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIFNvdXJjZXNQYXJhbXNFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMtcGFyYW1zJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFNvdXJjZXNQYXJhbXNMaXN0Vmlld2VyLCBTb3VyY2VzUGFyYW1zTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcy1wYXJhbXMnLFxuICAgIH0pO1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBXaWRnZXRzTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIGdldFdpZGdldDogZnVuY3Rpb24odykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5nbG9iYWxzLndpZGdldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdpZGdldCA9IHRoaXMuZ2xvYmFscy53aWRnZXRzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAody50eXBlID09IHdpZGdldC5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdpZGdldDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIFdpZGdldHNNb2RhbEVkaXRvciA9IFNoZWxsLldpZGdldHMuTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2RhdGEnKV0sXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHNbaV07XG5cbiAgICAgICAgICAgICAgICAvLyBUT0RPIE1vdmUgdG8gc2VydmljZSBsYXllclxuICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHRoaXMuY3VycmVudC5wYXJhbXNbcHJvcC5uYW1lXSA9IHRoaXMuY3VycmVudC5wYXJhbXNbcHJvcC5uYW1lXSB8fCB7XG4gICAgICAgICAgICAgICAgICAgIF9hY3Rpb246ICdjcmVhdGUnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogKHByb3AudHlwZSA9PSAnbXVsdGlwbGUnID8gW10gOiBudWxsKSxcbiAgICAgICAgICAgICAgICAgICAgYmluZGluZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyYXRlZ3k6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiAocHJvcC50eXBlID09ICdtdWx0aXBsZScgPyBudWxsIDogdW5kZWZpbmVkKSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcGFyYW0uX2FjdGlvbiA9IHBhcmFtLl9hY3Rpb24gPT0gJ3VwZGF0ZSdcbiAgICAgICAgICAgICAgICAgICAgPyAndXBkYXRlJ1xuICAgICAgICAgICAgICAgICAgICA6ICdjcmVhdGUnXG4gICAgICAgICAgICAgICAgO1xuXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3A6IHByb3AsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtOiBwYXJhbSxcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5pdGVtcyA9IGl0ZW1zO1xuICAgICAgICB9LFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29udGV4dDogdGhpcy5jb250ZXh0LFxuICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLml0ZW1zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuXG4gICAgICAgICAgICBoYXNQcm9wczogZnVuY3Rpb24odGFiKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29udGV4dC53aWRnZXQgJiYgdGhpcy5jb250ZXh0LndpZGdldC5wcm9wcykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcm9wID0gdGhpcy5jb250ZXh0LndpZGdldC5wcm9wc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wLnRhYiA9PSB0YWIpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIFdpZGdldHNFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oV2lkZ2V0c0xpc3RWaWV3ZXIsIFdpZGdldHNNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0XG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcblxuICAgICAgICAgICAgcHJvdG86IGZ1bmN0aW9uKHdpZGdldCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHdpZGdldC5pZCxcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogW10sXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtcyA9IHt9O1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB3aWRnZXQucHJvcHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHdpZGdldC5wcm9wc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyBNb3ZlIHRvIHNlcnZpY2UgbGF5ZXJcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zW3Byb3AubmFtZV0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiAnY3JlYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAocHJvcC50eXBlID09ICdtdWx0aXBsZScgPyBbXSA6IG51bGwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgYmluZGluZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmF0ZWd5OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb246IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiAocHJvcC50eXBlID09ICdtdWx0aXBsZScgPyBudWxsIDogdW5kZWZpbmVkKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGF0YS5wYXJhbXMgPSBwYXJhbXM7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoVnVlLCBqUXVlcnksIENvcmUsIFNoZWxsKTtcbiIsInZhciBXaWRnZXRzID1cbihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFdpZGdldHMgPSB7fTtcblxuICAgIFdpZGdldHMuUGFsZXR0ZSA9IChmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgbWFwID0ge307XG4gICAgICAgIHZhciBhcnIgPSBbXTtcblxuICAgICAgICB2YXIgd2lkZ2V0cyA9IHt9O1xuXG4gICAgICAgIHZhciBjYXRlZ29yaWVzID0gZnVuY3Rpb24oKSB7IHJldHVybiBhcnI7IH1cbiAgICAgICAgdmFyIGNhdGVnb3J5ID0gZnVuY3Rpb24obiwgY2F0ZWdvcnkpIHtcblxuICAgICAgICAgICAgaWYgKG4gaW4gbWFwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hcFtuXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2F0ZWdvcnkubmFtZSA9IG47XG4gICAgICAgICAgICAgICAgbWFwW25dID0gY2F0ZWdvcnk7XG4gICAgICAgICAgICAgICAgYXJyLnB1c2goY2F0ZWdvcnkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB3aWRnZXQgPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICB2YXIgc2VnbWVudHMgPSBwYXRoLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYXRlZ29yeShzZWdtZW50c1swXSkuZ3JvdXAoc2VnbWVudHNbMV0pLndpZGdldChzZWdtZW50c1syXSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaXRlbSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgIHZhciBzZWdtZW50cyA9IHBhdGguc3BsaXQoJy8nKTtcbiAgICAgICAgICAgIHJldHVybiAkLmV4dGVuZCh0cnVlLCB7fSwgdGhpcy5jYXRlZ29yeShzZWdtZW50c1swXSkuZ3JvdXAoc2VnbWVudHNbMV0pLml0ZW0oc2VnbWVudHNbMl0pLndpZGdldCwge1xuICAgICAgICAgICAgICAgIF9hY3Rpb246ICdjcmVhdGUnLFxuICAgICAgICAgICAgICAgIHJlc291cmNlOiB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtczogW10sXG4gICAgICAgICAgICAgICAgICAgIF9hY3Rpb246ICdjcmVhdGUnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVJZChwcmVmaXgpIHtcblxuICAgICAgICAgICAgdmFyIEFMUEhBQkVUID0gJzAxMjM0NTY3ODlhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJztcbiAgICAgICAgICAgIHZhciBJRF9MRU5HVEggPSA4O1xuXG4gICAgICAgICAgICB2YXIgcnRuID0gJyc7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IElEX0xFTkdUSDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcnRuICs9IEFMUEhBQkVULmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBBTFBIQUJFVC5sZW5ndGgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcmVmaXggPyBwcmVmaXggKyBydG4gOiBydG47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogY2F0ZWdvcmllcyxcbiAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRlZ29yeSxcbiAgICAgICAgICAgIHdpZGdldDogd2lkZ2V0LFxuICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBmdW5jdGlvbihjb250ZW50KSB7IHJldHVybiBXaWRnZXRzLlN0dWJXaWRnZXRGYWN0b3J5KGNvbnRlbnQpIH0sXG4gICAgICAgICAgICBnZW5lcmF0ZUlkOiBnZW5lcmF0ZUlkLFxuICAgICAgICB9O1xuICAgIH0pKCk7XG5cbiAgICBXaWRnZXRzLkNhdGVnb3J5ID0gZnVuY3Rpb24obmFtZSwgdGl0bGUsIGlnbm9yZSkge1xuXG4gICAgICAgIHZhciBtYXAgPSB7fTtcbiAgICAgICAgdmFyIGFyciA9IFtdO1xuXG4gICAgICAgIHZhciBncm91cHMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGFycjsgfVxuICAgICAgICB2YXIgZ3JvdXAgPSBmdW5jdGlvbihuLCBncm91cCkge1xuXG4gICAgICAgICAgICBpZiAobiBpbiBtYXApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWFwW25dO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBncm91cC5uYW1lID0gYCR7bmFtZX0vJHtufWA7XG4gICAgICAgICAgICAgICAgbWFwW25dID0gZ3JvdXA7XG4gICAgICAgICAgICAgICAgYXJyLnB1c2goZ3JvdXApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIFdpZGdldHMuUGFsZXR0ZS5jYXRlZ29yeShuYW1lLCB7XG4gICAgICAgICAgICB0aXRsZTogdGl0bGUsXG4gICAgICAgICAgICBncm91cHM6IGdyb3VwcyxcbiAgICAgICAgICAgIGdyb3VwOiBncm91cCxcbiAgICAgICAgICAgIGlnbm9yZTogaWdub3JlLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gV2lkZ2V0cy5QYWxldHRlLmNhdGVnb3J5KG5hbWUpO1xuICAgIH07XG5cbiAgICBXaWRnZXRzLkdyb3VwID0gZnVuY3Rpb24oY2F0ZWdvcnksIG5hbWUsIHRpdGxlKSB7XG5cbiAgICAgICAgdmFyIG1hcCA9IHt9O1xuICAgICAgICB2YXIgYXJyID0gW107XG5cbiAgICAgICAgdmFyIGl0ZW1zID0gZnVuY3Rpb24oKSB7IHJldHVybiBhcnI7IH1cbiAgICAgICAgdmFyIGl0ZW0gPSBmdW5jdGlvbihuLCBpdGVtKSB7XG5cbiAgICAgICAgICAgIGlmIChuIGluIG1hcCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtYXBbbl07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGl0ZW0ubmFtZSA9IGAke3RoaXMubmFtZX0vJHtufWA7XG4gICAgICAgICAgICAgICAgbWFwW25dID0gaXRlbTtcbiAgICAgICAgICAgICAgICBhcnIucHVzaChpdGVtKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgd19tYXAgPSB7fTtcbiAgICAgICAgdmFyIHdfYXJyID0gW107XG5cbiAgICAgICAgdmFyIHdpZGdldHMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHdfYXJyOyB9XG4gICAgICAgIHZhciB3aWRnZXQgPSBmdW5jdGlvbihuLCB3aWRnZXQpIHtcblxuICAgICAgICAgICAgaWYgKG4gaW4gd19tYXApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd19tYXBbbl07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdpZGdldC5uYW1lID0gYCR7dGhpcy5uYW1lfS8ke259YDtcbiAgICAgICAgICAgICAgICB3X21hcFtuXSA9IHdpZGdldDtcbiAgICAgICAgICAgICAgICB3X2Fyci5wdXNoKHdpZGdldCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgY2F0ZWdvcnkuZ3JvdXAobmFtZSwge1xuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zLFxuICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgICAgIHdpZGdldHM6IHdpZGdldHMsXG4gICAgICAgICAgICB3aWRnZXQ6IHdpZGdldCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNhdGVnb3J5Lmdyb3VwKG5hbWUpO1xuICAgIH07XG5cbiAgICBXaWRnZXRzLldpZGdldCA9IGZ1bmN0aW9uKGdyb3VwLCBjb25maWcpIHtcblxuICAgICAgICB2YXIgbmFtZSA9IGNvbmZpZy5uYW1lO1xuXG4gICAgICAgIGdyb3VwLndpZGdldChjb25maWcubmFtZSwgY29uZmlnKTtcblxuICAgICAgICByZXR1cm4gZ3JvdXAud2lkZ2V0KG5hbWUpO1xuICAgIH1cblxuICAgIFdpZGdldHMuY2xvbmUgPSBmdW5jdGlvbihvcmlnaW5hbCkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcmlnaW5hbCkpO1xuICAgIH1cblxuICAgIFdpZGdldHMuY3JlYXRlID0gZnVuY3Rpb24oY29uZmlnKSB7XG5cbiAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIG5hbWU6IGNvbmZpZy5uYW1lLFxuICAgICAgICAgICAgdGFnOiBjb25maWcudGFnLFxuICAgICAgICAgICAgd2lkZ2V0czogY29uZmlnLndpZGdldHMsXG4gICAgICAgICAgICB0YWJzOiBbXSxcbiAgICAgICAgICAgIHByb3BzOiBbXSxcbiAgICAgICAgICAgIHBhcmFtczoge30sXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCdfYWN0aW9uJyBpbiBjb25maWcpIHJlc3VsdC5fYWN0aW9uID0gY29uZmlnLl9hY3Rpb247XG5cbiAgICAgICAgZnVuY3Rpb24gdmlzaXQodywgbSkge1xuXG4gICAgICAgICAgICBpZiAoJ3Byb3BzJyBpbiBtKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAobS5vdmVycmlkZSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHcudGFicyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobS50YWJzKSk7XG4gICAgICAgICAgICAgICAgICAgIHcucHJvcHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG0ucHJvcHMpKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG0udGFicykgdy50YWJzID0gdy50YWJzLmNvbmNhdChtLnRhYnMpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobS5wcm9wcykgdy5wcm9wcyA9IHcucHJvcHMuY29uY2F0KG0ucHJvcHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbmZpZy5taXhpbnMpIHtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb25maWcubWl4aW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG0gPSBjb25maWcubWl4aW5zW2ldO1xuICAgICAgICAgICAgICAgIHZpc2l0KHJlc3VsdCwgbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2aXNpdChyZXN1bHQsIGNvbmZpZyk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgV2lkZ2V0cy5idWlsZCA9IGZ1bmN0aW9uKHdpZGdldCwgcGFyYW1zKSB7XG5cbiAgICAgICAgdmFyIHcgPSBPYmplY3QuYXNzaWduKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkod2lkZ2V0KSksIHtcbiAgICAgICAgICAgIHBhcmFtczogcGFyYW1zIHx8IHt9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZ1bmN0aW9uIGluaXRQYXJhbXMocHJvcHMsIHBhcmFtcykge1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHByb3BzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHBhcmFtc1twcm9wLm5hbWVdID0gcGFyYW1zW3Byb3AubmFtZV0gfHwgeyB2YWx1ZTogbnVsbCB9OyAvLyBUT0RPIFNldCBhIHR5cGUtZGVwZW5kZW50IGluaXRpYWwgdmFsdWVcblxuICAgICAgICAgICAgICAgIGlmIChwcm9wLnByb3BzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wLnR5cGUgPT0gJ211bHRpcGxlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW0udmFsdWUgPSBwYXJhbS52YWx1ZSA9PSBudWxsID8gW10gOiBwYXJhbS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcGFyYW0udmFsdWUubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0UGFyYW1zKHByb3AucHJvcHMsIHBhcmFtLnZhbHVlW2pdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9wLnR5cGUgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtLnZhbHVlID0gcGFyYW0udmFsdWUgPT0gbnVsbCA/IHt9IDogcGFyYW0udmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0UGFyYW1zKHByb3AucHJvcHMsIHBhcmFtLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGluaXRQYXJhbXMody5wcm9wcywgdy5wYXJhbXMpO1xuXG4gICAgICAgIHJldHVybiB3O1xuICAgIH1cblxuICAgIFdpZGdldHMuSXRlbSA9IGZ1bmN0aW9uKGdyb3VwLCBjb25maWcpIHtcblxuICAgICAgICB2YXIgbmFtZSA9IGNvbmZpZy5uYW1lO1xuXG4gICAgICAgIGdyb3VwLml0ZW0oY29uZmlnLm5hbWUsIGNvbmZpZyk7XG5cbiAgICAgICAgcmV0dXJuIGdyb3VwLml0ZW0obmFtZSk7XG4gICAgfTtcblxuICAgIFdpZGdldHMuUHJvcCA9IGZ1bmN0aW9uKG5hbWUsIHRpdGxlLCB0eXBlLCB0YWIsIHBsYWNlaG9sZGVyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgIHRhYjogdGFiLFxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IHBsYWNlaG9sZGVyLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIFdpZGdldHMuUGFyYW0gPSBmdW5jdGlvbih2YWx1ZSwgYmluZGluZywgc3RyYXRlZ3kpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSB8fCB1bmRlZmluZWQsXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBWdWUuc2VydmljZSgncGFsZXR0ZScsIFdpZGdldHMuUGFsZXR0ZSk7XG5cbiAgICByZXR1cm4gV2lkZ2V0cztcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xuXG4gICAgV2lkZ2V0cy5Db21wb3NpdGVDYXRlZ29yeSA9IFdpZGdldHMuQ2F0ZWdvcnkoJ2RlZmF1bHQtY29tcG9zaXRlcycsICdDb21wb3NpdGUgRWxlbWVudHMnKTtcbiAgICBXaWRnZXRzLkZvcm1DYXRlZ29yeSA9IFdpZGdldHMuQ2F0ZWdvcnkoJ2RlZmF1bHQtZm9ybScsICdGb3JtIEVsZW1lbnRzJyk7XG4gICAgV2lkZ2V0cy5UZXh0Q2F0ZWdvcnkgPSBXaWRnZXRzLkNhdGVnb3J5KCdkZWZhdWx0LXRleHQnLCAnVGV4dCBFbGVtZW50cycpO1xuICAgIFdpZGdldHMuQ29udGFpbmVyQ2F0ZWdvcnkgPSBXaWRnZXRzLkNhdGVnb3J5KCdkZWZhdWx0LWNvbnRhaW5lcicsICdDb250YWluZXIgRWxlbWVudHMnKTtcblxuICAgIFdpZGdldHMuVXRpbENhdGVnb3J5ID0gV2lkZ2V0cy5DYXRlZ29yeSgnZGVmYXVsdC11dGlsJywgJ1V0aWwgRWxlbWVudHMnLCB0cnVlKTtcblxuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XG5cbiAgICB2YXIgUCA9IFdpZGdldHMuUHJvcHMgPSB7fTtcbiAgICB2YXIgVCA9IFdpZGdldHMuVGFicyA9IHt9O1xuXG4gICAgVC5EYXRhID0geyBuYW1lOiAnZGF0YScsIHRpdGxlOiAnRGF0YScgfTtcbiAgICBULkFwcGVhcmFuY2UgPSB7IG5hbWU6ICdhcHBlYXJhbmNlJywgdGl0bGU6ICdBcHBlYXJhbmNlJyB9O1xuICAgIFQuQ29udGVudCA9IHsgbmFtZTogJ2NvbnRlbnQnLCB0aXRsZTogJ0NvbnRlbnQnIH07XG5cbiAgICBQLklkID0geyBuYW1lOiAnaWQnLCB0aXRsZTogJ0lEJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnLCBwbGFjZWhvbGRlcjogJ1VuaXF1ZSBJRCcgfTtcblxuICAgIFAuV2lkdGggPSB7IG5hbWU6ICd3aWR0aCcsIHRpdGxlOiAnV2lkdGgnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnYXBwZWFyYW5jZScgfTtcbiAgICBQLkhlaWdodCA9IHsgbmFtZTogJ2hlaWdodCcsIHRpdGxlOiAnSGVpZ2h0JywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2FwcGVhcmFuY2UnIH07XG4gICAgUC5QYWRkaW5nID0geyBuYW1lOiAncGFkZGluZycsIHRpdGxlOiAnUGFkZGluZycsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdhcHBlYXJhbmNlJyB9O1xuICAgIFAuTWFyZ2luID0geyBuYW1lOiAnbWFyZ2luJywgdGl0bGU6ICdNYXJnaW4nLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnYXBwZWFyYW5jZScgfTtcbiAgICBQLkJvcmRlciA9IHsgbmFtZTogJ2JvcmRlcicsIHRpdGxlOiAnQm9yZGVyJywgdHlwZTogJ3N0cmluZycsIHBsYWNlaG9sZGVyOiAnMXB4IHNvbGlkICMwMDAwMDAnLCB0YWI6ICdhcHBlYXJhbmNlJyB9O1xuICAgIFAuQmFja2dyb3VuZCA9IHsgbmFtZTogJ2JhY2tncm91bmQnLCB0aXRsZTogJ0JhY2tncm91bmQnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnYXBwZWFyYW5jZScgfTtcblxuICAgIFAuQ29scyA9IHsgbmFtZTogJ2NvbHMnLCB0aXRsZTogJ0NvbHVtbnMnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnYXBwZWFyYW5jZScgfTtcbiAgICBQLlJvd3MgPSB7IG5hbWU6ICdyb3dzJywgdGl0bGU6ICdSb3dzJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2FwcGVhcmFuY2UnIH07XG4gICAgUC5Db2xvciA9IHsgbmFtZTogJ2NvbG9yJywgdGl0bGU6ICdDb2xvcicsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdhcHBlYXJhbmNlJyB9O1xuICAgIFAuQ29udGVudCA9IHsgbmFtZTogJ2NvbnRlbnQnLCB0aXRsZTogJ0NvbnRlbnQnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnY29udGVudCcgfTtcblxuICAgIFAuU3BhY2luZyA9IHsgbmFtZTogJ3NwYWNpbmcnLCB0aXRsZTogJ0JvcmRlciBTcGFjaW5nJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2FwcGVhcmFuY2UnIH07XG4gICAgUC5Db2xsYXBzZSA9IHsgbmFtZTogJ2NvbGxhcHNlJywgdGl0bGU6ICdCb3JkZXIgQ29sbGFwc2UnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnYXBwZWFyYW5jZScgfTtcblxuICAgIFAuQWxpZ24gPSB7IG5hbWU6ICd0ZXh0LWFsaWduJywgdGl0bGU6ICdUZXh0IEFsaWduJywgdHlwZTogJ3NlbGVjdCcsIHRhYjogJ2FwcGVhcmFuY2UnLCBvcHRpb25zOiBbXG4gICAgICAgIHsgdmFsdWU6ICdsZWZ0JywgdGV4dDogJ0xlZnQnIH0sXG4gICAgICAgIHsgdmFsdWU6ICdyaWdodCcsIHRleHQ6ICdSaWdodCcgfSxcbiAgICAgICAgeyB2YWx1ZTogJ2NlbnRlcicsIHRleHQ6ICdDZW5ldGVyJyB9LFxuICAgICAgICB7IHZhbHVlOiAnanVzdGlmeScsIHRleHQ6ICdKdXN0aWZ5JyB9LFxuICAgIF0gfTtcblxuICAgIFAuRG9jayA9IHsgbmFtZTogJ2RvY2snLCB0aXRsZTogJ0RvY2snLCB0eXBlOiAnc2VsZWN0JywgdGFiOiAnYXBwZWFyYW5jZScsIG9wdGlvbnM6IFtcbiAgICAgICAgeyB2YWx1ZTogJ2Fib3ZlJywgdGV4dDogJ0Fib3ZlJyB9LFxuICAgICAgICB7IHZhbHVlOiAndG9wJywgdGV4dDogJ1RvcCcgfSxcbiAgICAgICAgeyB2YWx1ZTogJ3JpZ2h0JywgdGV4dDogJ1JpZ2h0JyB9LFxuICAgICAgICB7IHZhbHVlOiAnYm90dG9tJywgdGV4dDogJ0JvdHRvbScgfSxcbiAgICAgICAgeyB2YWx1ZTogJ2xlZnQnLCB0ZXh0OiAnTGVmdCcgfSxcbiAgICBdfTtcblxuICAgIFdpZGdldHMuV2lkZ2V0TWl4aW4gPSB7XG4gICAgICAgIHRhYnM6IFsgVC5EYXRhLCBULkFwcGVhcmFuY2UsIFQuQ29udGVudCBdLFxuICAgICAgICBwcm9wczogWyBQLklkIF0sXG4gICAgfTtcblxuICAgIFdpZGdldHMuQm94TWl4aW4gPSB7XG4gICAgICAgIHByb3BzOiBbXG4gICAgICAgICAgICB7IG5hbWU6ICdpbm5lcicsIHRpdGxlOiAnSW5uZXIgQ29udGFpbmVyJywgdHlwZTogJ29iamVjdCcsIHRhYjogJ2FwcGVhcmFuY2UnLFxuICAgICAgICAgICAgICAgIHRhYnM6IFsgVC5BcHBlYXJhbmNlIF0sXG4gICAgICAgICAgICAgICAgcHJvcHM6IFsgUC5Cb3JkZXIsIFAuQmFja2dyb3VuZCBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnb3V0ZXInLCB0aXRsZTogJ091dGVyIENvbnRhaW5lcicsIHR5cGU6ICdvYmplY3QnLCB0YWI6ICdhcHBlYXJhbmNlJyxcbiAgICAgICAgICAgICAgICB0YWJzOiBbIFQuQXBwZWFyYW5jZSBdLFxuICAgICAgICAgICAgICAgIHByb3BzOiBbIFAuTWFyZ2luLCBQLlBhZGRpbmcsIFAuQm9yZGVyLCBQLkJhY2tncm91bmQgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICB9O1xuXG4gICAgV2lkZ2V0cy5TaXplTWl4aW4gPSB7XG4gICAgICAgIHByb3BzOiBbIFAuV2lkdGgsIFAuSGVpZ2h0IF0sXG4gICAgfVxuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XG5cbiAgICBXaWRnZXRzLkdhbGxlcnlHcm91cCA9IFdpZGdldHMuR3JvdXAoV2lkZ2V0cy5Db21wb3NpdGVDYXRlZ29yeSwgJ2RlZmF1bHQtY29tcG9zaXRlLWdhbGxlcnknLCAnR2FsbGVyaWVzJyk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcblxuICAgIFdpZGdldHMuU3RhY2tHcm91cCA9IFdpZGdldHMuR3JvdXAoV2lkZ2V0cy5Db250YWluZXJDYXRlZ29yeSwgJ2RlZmF1bHQtY29udGFpbmVyLXN0YWNrJywgJ1N0YWNrZWQnKTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFdpZGdldHMpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xuXG4gICAgV2lkZ2V0cy5CdXR0b25zR3JvdXAgPSBXaWRnZXRzLkdyb3VwKFdpZGdldHMuRm9ybUNhdGVnb3J5LCAnZGVmYXVsdC1mb3JtLWJ1dHRvbnMnLCAnQnV0dG9ucycpO1xuICAgIFdpZGdldHMuSW5wdXRzR3JvdXAgPSBXaWRnZXRzLkdyb3VwKFdpZGdldHMuRm9ybUNhdGVnb3J5LCAnZGVmYXVsdC1mb3JtLWlucHV0cycsICdJbnB1dHMnKTtcbiAgICBXaWRnZXRzLlJhZGlvc0dyb3VwID0gV2lkZ2V0cy5Hcm91cChXaWRnZXRzLkZvcm1DYXRlZ29yeSwgJ2RlZmF1bHQtZm9ybS1yYWRpb3MnLCAnUmFkaW9zJyk7XG4gICAgV2lkZ2V0cy5DaGVja3NHcm91cCA9IFdpZGdldHMuR3JvdXAoV2lkZ2V0cy5Gb3JtQ2F0ZWdvcnksICdkZWZhdWx0LWZvcm0tY2hlY2tzJywgJ0NoZWNrYm94ZXMnKTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFdpZGdldHMpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xuXG4gICAgV2lkZ2V0cy5IZWFkaW5nc0dyb3VwID0gV2lkZ2V0cy5Hcm91cChXaWRnZXRzLlRleHRDYXRlZ29yeSwgJ2RlZmF1bHQtdGV4dC1oZWFkaW5ncycsICdIZWFkaW5ncycpO1xuICAgIFdpZGdldHMuQmxvY2tzR3JvdXAgPSBXaWRnZXRzLkdyb3VwKFdpZGdldHMuVGV4dENhdGVnb3J5LCAnZGVmYXVsdC10ZXh0LWJsb2NrcycsICdCbG9ja3MnKTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFdpZGdldHMpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xuXG4gICAgV2lkZ2V0cy5VdGlsR3JvdXAgPSBXaWRnZXRzLkdyb3VwKFdpZGdldHMuVXRpbENhdGVnb3J5LCAnZGVmYXVsdC11dGlsLWdyb3VwJywgJ1V0aWwgRWxlbWVudHMnKTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFdpZGdldHMpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1jYXJvdXNlbCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1jYXJvdXNlbCcsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtZ2FsbGVyeScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1nYWxsZXJ5JyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcblxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbWF0cml4OiB0aGlzLm1hdHJpeCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ2JpbmRpbmdzJywgdXBkYXRlTWF0cml4LmJpbmQodGhpcyksIHsgaW1tZWRpYXRlOiB0cnVlLCBkZWVwOiB0cnVlIH0pO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiB1cGRhdGVNYXRyaXgoYmluZGluZ3MpIHtcblxuICAgICAgICAgICAgICAgIHZhciBpdGVtcyA9IGJpbmRpbmdzLml0ZW1zLmNvbGxlY3Rpb24gfHwgW107XG5cbiAgICAgICAgICAgICAgICB2YXIgcm93cyA9IHBhcnNlSW50KGJpbmRpbmdzLnJvd3MpO1xuICAgICAgICAgICAgICAgIHJvd3MgPSByb3dzID4gMCA/IHJvd3MgOiAxO1xuXG4gICAgICAgICAgICAgICAgdmFyIGNvbHMgPSBwYXJzZUludChiaW5kaW5ncy5jb2xzKTtcbiAgICAgICAgICAgICAgICBjb2xzID0gY29scyA+IDAgPyBjb2xzIDogMztcblxuICAgICAgICAgICAgICAgIHZhciBjZWxscyA9IHJvd3MgKiBjb2xzO1xuXG4gICAgICAgICAgICAgICAgdmFyIGRpdiA9IHBhcnNlSW50KGl0ZW1zLmxlbmd0aCAvIGNlbGxzKTtcbiAgICAgICAgICAgICAgICB2YXIgbW9kID0gaXRlbXMubGVuZ3RoICUgY2VsbHM7XG5cbiAgICAgICAgICAgICAgICB2YXIgY291bnQgPSAobW9kID4gMCB8fCBkaXYgPT0gMClcbiAgICAgICAgICAgICAgICAgICAgPyBkaXYgKyAxXG4gICAgICAgICAgICAgICAgICAgIDogZGl2XG4gICAgICAgICAgICAgICAgO1xuXG4gICAgICAgICAgICAgICAgdmFyIG1hdHJpeCA9IFtdO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcCA9IDA7IHAgPCBjb3VudDsgcCsrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHBkID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHIgPSAwOyByIDwgcm93czsgcisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmQgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGMgPSAwOyBjIDwgY29sczsgYysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gKHAgKiByb3dzICsgcikgKiBjb2xzICsgYztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPCBpdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmQucHVzaChpdGVtc1tpbmRleF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBkLnB1c2gocmQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG1hdHJpeC5wdXNoKHBkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeCA9IG1hdHJpeDtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xuXG4gICAgdmFyIFAgPSBXaWRnZXRzLlByb3BzO1xuICAgIHZhciBUID0gV2lkZ2V0cy5UYWJzO1xuXG4gICAgV2lkZ2V0cy5HYWxsZXJ5V2lkZ2V0ID1cbiAgICBXaWRnZXRzLldpZGdldChXaWRnZXRzLkdhbGxlcnlHcm91cCwgV2lkZ2V0cy5jcmVhdGUoe1xuICAgICAgICBuYW1lOiAnZGVmYXVsdC1nYWxsZXJ5JyxcbiAgICAgICAgdGFnOiAnZGVmYXVsdC1nYWxsZXJ5JyxcbiAgICAgICAgbWl4aW5zOiBbIFdpZGdldHMuV2lkZ2V0TWl4aW4sIFdpZGdldHMuQm94TWl4aW4sIFdpZGdldHMuU2l6ZU1peGluIF0sXG4gICAgICAgIHByb3BzOiBbXG4gICAgICAgICAgICBQLkNvbHMsIFAuUm93cywgUC5Eb2NrLCBQLkNvbG9yLCBQLkFsaWduLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdib3JkZXInLCB0aXRsZTogJ0JvcmRlcicsIHR5cGU6ICdvYmplY3QnLCB0YWI6ICdhcHBlYXJhbmNlJyxcbiAgICAgICAgICAgICAgICB0YWJzOiBbIFQuQXBwZWFyYW5jZSBdLFxuICAgICAgICAgICAgICAgIHByb3BzOiBbIFAuU3BhY2luZywgUC5Db2xsYXBzZSBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdpdGVtcycsIHRpdGxlOiAnSXRlbXMnLCB0eXBlOiAnb2JqZWN0JywgdGFiOiAnZGF0YScsXG4gICAgICAgICAgICAgICAgdGFiczogWyBULkRhdGEsIFQuQXBwZWFyYW5jZSBdLFxuICAgICAgICAgICAgICAgIHByb3BzOiBbXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2NvbGxlY3Rpb24nLCB0aXRsZTogJ0NvbGxlY3Rpb24nLCB0eXBlOiAnbXVsdGlwbGUnLCB0YWI6ICdkYXRhJyxcbiAgICAgICAgICAgICAgICAgICAgdGFiczogWyBULkFwcGVhcmFuY2UsIFQuQ29udGVudCBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdkcmF3aW5nJywgdGl0bGU6ICdEcmF3aW5nJywgdHlwZTogJ29iamVjdCcsIHRhYjogJ2FwcGVhcmFuY2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJzOiBbIFQuQXBwZWFyYW5jZSBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUC5XaWR0aCwgUC5IZWlnaHQsIFAuTWFyZ2luLCBQLlBhZGRpbmcsIFAuQmFja2dyb3VuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2Rlc2NyaXB0aW9uJywgdGl0bGU6ICdEZXNjcmlwdGlvbicsIHR5cGU6ICdvYmplY3QnLCB0YWI6ICdhcHBlYXJhbmNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFiczogWyBULkFwcGVhcmFuY2UsIFQuQ29udGVudCBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUC5XaWR0aCwgUC5IZWlnaHQsIFAuTWFyZ2luLCBQLlBhZGRpbmcsIFAuQmFja2dyb3VuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFAuQ29sb3IsIFAuQWxpZ24sIFAuQ29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUC5XaWR0aCwgUC5IZWlnaHQsIFAuTWFyZ2luLCBQLlBhZGRpbmcsIFAuQmFja2dyb3VuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnc3R5bGUnLCB0aXRsZTogJ1N0eWxlJywgdHlwZTogJ29iamVjdCcsIHRhYjogJ2FwcGVhcmFuY2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFiczogWyBULkFwcGVhcmFuY2UgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnZHJhd2luZycsIHRpdGxlOiAnRHJhd2luZycsIHR5cGU6ICdvYmplY3QnLCB0YWI6ICdhcHBlYXJhbmNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFiczogWyBULkFwcGVhcmFuY2UgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFAuV2lkdGgsIFAuSGVpZ2h0LCBQLk1hcmdpbiwgUC5QYWRkaW5nLCBQLkJhY2tncm91bmQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2Rlc2NyaXB0aW9uJywgdGl0bGU6ICdEZXNjcmlwdGlvbicsIHR5cGU6ICdvYmplY3QnLCB0YWI6ICdhcHBlYXJhbmNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFiczogWyBULkFwcGVhcmFuY2UgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFAuV2lkdGgsIFAuSGVpZ2h0LCBQLk1hcmdpbiwgUC5QYWRkaW5nLCBQLkJhY2tncm91bmQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQLkNvbG9yLCBQLkFsaWduLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBQLldpZHRoLCBQLkhlaWdodCwgUC5NYXJnaW4sIFAuUGFkZGluZywgUC5CYWNrZ3JvdW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgfSkpO1xuXG4gICAgV2lkZ2V0cy5HYWxsZXJ5V2lkZ2V0RmFjdG9yeSA9IGZ1bmN0aW9uKGRlZmF1bHRzKSB7XG5cbiAgICAgICAgdmFyIHcgPSBXaWRnZXRzLmJ1aWxkKFdpZGdldHMuR2FsbGVyeVdpZGdldCwge1xuICAgICAgICAgICAgcm93czogeyB2YWx1ZTogZGVmYXVsdHMucm93cyB9LFxuICAgICAgICAgICAgY29sczogeyB2YWx1ZTogZGVmYXVsdHMuY29scyB9LFxuICAgICAgICAgICAgZG9jazogeyB2YWx1ZTogZGVmYXVsdHMuZG9jayB9LFxuICAgICAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogeyB2YWx1ZTogZGVmYXVsdHMud2lkdGggfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHsgdmFsdWU6IGRlZmF1bHRzLmhlaWdodCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiB7IHZhbHVlOiBkZWZhdWx0cy5wYWRkaW5nIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBkZWZhdWx0cy5jb2xsZWN0aW9uLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhd2luZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiB7IHZhbHVlOiBpdGVtLmJhY2tncm91bmQgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogeyB2YWx1ZTogaXRlbS5jb250ZW50IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHsgdmFsdWU6IGl0ZW0uY29sb3IgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHcpO1xuXG4gICAgICAgIHJldHVybiB3O1xuICAgIH1cblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkdhbGxlcnlHcm91cCwge1xuICAgICAgICBuYW1lOiAnZ2FsbGVyeS1yMWMxZicsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9jb21wb3NpdGVzL2dhbGxlcnkvZ2FsbGVyeS1yMWMxZi5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuR2FsbGVyeVdpZGdldEZhY3Rvcnkoe1xuICAgICAgICAgICAgcm93czogMSwgY29sczogMSwgZG9jazogJ2Fib3ZlJywgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAnMzAwcHgnLCBwYWRkaW5nOiAnMzBweCcsICd0ZXh0LWFsaWduJzogJ2NlbnRlcicsIGNvbG9yOiAnI0ZGRkZGRicsXG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBbXG4gICAgICAgICAgICAgICAgeyBjb250ZW50OiBgXG4gICAgICAgICAgICAgICAgICAgIDxoMyBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO1wiPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjQ4cHhcIj5GaXJzdCBJdGVtPC9zcGFuPjwvaDM+XG4gICAgICAgICAgICAgICAgICAgIDxwIHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+PHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDI4cHhcIj5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9zcGFuPjwvcD5cbiAgICAgICAgICAgICAgICBgLCBiYWNrZ3JvdW5kOiAnI0ZGNjQ2NicsIGNvbG9yOiAnI0ZGRkZGRicgfSxcbiAgICAgICAgICAgICAgICB7IGNvbnRlbnQ6IGBcbiAgICAgICAgICAgICAgICAgICAgPGgzIHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+PHNwYW4gc3R5bGU9XCJmb250LXNpemU6NDhweFwiPlNlY29uZCBJdGVtPC9zcGFuPjwvaDM+XG4gICAgICAgICAgICAgICAgICAgIDxwIHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+PHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDI4cHhcIj5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9zcGFuPjwvcD5cbiAgICAgICAgICAgICAgICBgLCBiYWNrZ3JvdW5kOiAnIzYwNUJFOCcsIGNvbG9yOiAnI0ZGRkZGRicgfSxcbiAgICAgICAgICAgICAgICB7IGNvbnRlbnQ6IGBcbiAgICAgICAgICAgICAgICAgICAgPGgzIHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+PHNwYW4gc3R5bGU9XCJmb250LXNpemU6NDhweFwiPlRoaXJkIEl0ZW08L3NwYW4+PC9oMz5cbiAgICAgICAgICAgICAgICAgICAgPHAgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMjhweFwiPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxuICAgICAgICAgICAgICAgIGAsIGJhY2tncm91bmQ6ICcjNzBGRkJGJywgY29sb3I6ICcjRkZGRkZGJyB9LFxuICAgICAgICAgICAgXVxuICAgICAgICB9KSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkdhbGxlcnlHcm91cCwge1xuICAgICAgICBuYW1lOiAnZ2FsbGVyeS1yMWMxcicsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9jb21wb3NpdGVzL2dhbGxlcnkvZ2FsbGVyeS1yMWMxci5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuR2FsbGVyeVdpZGdldEZhY3RvcnkoeyByb3dzOiAxLCBjb2xzOiAxLCBkb2NrOiAnYWJvdmUnLCB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6ICczMDBweCcsIHBhZGRpbmc6ICczMHB4JyxcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IFtcbiAgICAgICAgICAgICAgICB7IGNvbnRlbnQ6IGBcbiAgICAgICAgICAgICAgICAgICAgPGgzIHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7XCI+PHNwYW4gc3R5bGU9XCJmb250LXNpemU6NDhweFwiPkZpcnN0IEl0ZW08L3NwYW4+PC9oMz5cbiAgICAgICAgICAgICAgICAgICAgPHAgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMjhweFwiPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxuICAgICAgICAgICAgICAgIGAsIGJhY2tncm91bmQ6ICcjRkY2NDY2JywgY29sb3I6ICcjRkZGRkZGJyB9LFxuICAgICAgICAgICAgICAgIHsgY29udGVudDogYFxuICAgICAgICAgICAgICAgICAgICA8aDMgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTo0OHB4XCI+U2Vjb25kIEl0ZW08L3NwYW4+PC9oMz5cbiAgICAgICAgICAgICAgICAgICAgPHAgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMjhweFwiPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxuICAgICAgICAgICAgICAgIGAsIGJhY2tncm91bmQ6ICcjNjA1QkU4JywgY29sb3I6ICcjRkZGRkZGJyB9LFxuICAgICAgICAgICAgICAgIHsgY29udGVudDogYFxuICAgICAgICAgICAgICAgICAgICA8aDMgc3R5bGU9XCJ0ZXh0LWFsaWduOmNlbnRlcjtcIj48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTo0OHB4XCI+VGhpcmQgSXRlbTwvc3Bhbj48L2gzPlxuICAgICAgICAgICAgICAgICAgICA8cCBzdHlsZT1cInRleHQtYWxpZ246Y2VudGVyO1wiPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAyOHB4XCI+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XG4gICAgICAgICAgICAgICAgYCwgYmFja2dyb3VuZDogJyM3MEZGQkYnLCBjb2xvcjogJyNGRkZGRkYnIH0sXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pLFxuICAgIH0pO1xuXG4gICAgLy8gV2lkZ2V0cy5JdGVtKFdpZGdldHMuR2FsbGVyeUdyb3VwLCB7XG4gICAgLy8gICAgIG5hbWU6ICdnYWxsZXJ5LXIxYzNmJyxcbiAgICAvLyAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2NvbXBvc2l0ZXMvZ2FsbGVyeS9nYWxsZXJ5LXIxYzNmLnBuZycsXG4gICAgLy8gICAgIHdpZGdldDogV2lkZ2V0cy5HYWxsZXJ5V2lkZ2V0RmFjdG9yeSgxLCAzLCAnYWJvdmUnLCAnMTAwJScsICc0MDBweCcsICczMHB4JywgW1xuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZpcnN0IEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNGRjM1MDAnIH0sXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+U2Vjb25kIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNEQzAwNTUnIH0sXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+VGhpcmQgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0JGMDAzNycgfSxcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5Gb3VydGggSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0E1MjkzOScgfSxcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5GaWZ0aCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjRUUzQjgwJyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPlNpeHRoIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNFRTZCOUUnIH0sXG4gICAgLy8gICAgIF0pLFxuICAgIC8vIH0pO1xuICAgIC8vXG4gICAgLy8gV2lkZ2V0cy5JdGVtKFdpZGdldHMuR2FsbGVyeUdyb3VwLCB7XG4gICAgLy8gICAgIG5hbWU6ICdnYWxsZXJ5LXIxYzNiJyxcbiAgICAvLyAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2NvbXBvc2l0ZXMvZ2FsbGVyeS9nYWxsZXJ5LXIxYzNiLnBuZycsXG4gICAgLy8gICAgIHdpZGdldDogV2lkZ2V0cy5HYWxsZXJ5V2lkZ2V0RmFjdG9yeSgxLCAzLCAnYm90dG9tJywgJzEwMCUnLCAnNDAwcHgnLCAnMzBweCcsIFtcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5GaXJzdCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjRkYzNTAwJyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPlNlY29uZCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjREMwMDU1JyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPlRoaXJkIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNCRjAwMzcnIH0sXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+Rm91cnRoIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNBNTI5MzknIH0sXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+RmlmdGggSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0VFM0I4MCcgfSxcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5TaXh0aCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjRUU2QjlFJyB9LFxuICAgIC8vICAgICBdKSxcbiAgICAvLyB9KTtcbiAgICAvL1xuICAgIC8vIFdpZGdldHMuSXRlbShXaWRnZXRzLkdhbGxlcnlHcm91cCwge1xuICAgIC8vICAgICBuYW1lOiAnZ2FsbGVyeS1yMmM0ZicsXG4gICAgLy8gICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9jb21wb3NpdGVzL2dhbGxlcnkvZ2FsbGVyeS1yMmM0Zi5wbmcnLFxuICAgIC8vICAgICB3aWRnZXQ6IFdpZGdldHMuR2FsbGVyeVdpZGdldEZhY3RvcnkoMiwgNCwgJ2Fib3ZlJywgJzEwMCUnLCAnNDAwcHgnLCAnMzBweCcsIFtcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5GaXJzdCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjRkYzNTAwJyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPlNlY29uZCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjREMwMDU1JyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPlRoaXJkIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNCRjAwMzcnIH0sXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+Rm91cnRoIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNBNTI5MzknIH0sXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+RmlmdGggSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0VFM0I4MCcgfSxcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5TaXh0aCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjRUU2QjlFJyB9LFxuICAgIC8vICAgICBdKSxcbiAgICAvLyB9KTtcbiAgICAvL1xuICAgIC8vIFdpZGdldHMuSXRlbShXaWRnZXRzLkdhbGxlcnlHcm91cCwge1xuICAgIC8vICAgICBuYW1lOiAnZ2FsbGVyeS1yMmM0YicsXG4gICAgLy8gICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9jb21wb3NpdGVzL2dhbGxlcnkvZ2FsbGVyeS1yMmM0Yi5wbmcnLFxuICAgIC8vICAgICB3aWRnZXQ6IFdpZGdldHMuR2FsbGVyeVdpZGdldEZhY3RvcnkoMiwgNCwgJ2JvdHRvbScsICcxMDAlJywgJzQwMHB4JywgJzMwcHgnLCBbXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+Rmlyc3QgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0ZGMzUwMCcgfSxcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5TZWNvbmQgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0RDMDA1NScgfSxcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5UaGlyZCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjQkYwMDM3JyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZvdXJ0aCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjQTUyOTM5JyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZpZnRoIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNFRTNCODAnIH0sXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+U2l4dGggSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0VFNkI5RScgfSxcbiAgICAvLyAgICAgXSksXG4gICAgLy8gfSk7XG4gICAgLy9cbiAgICAvLyBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5HYWxsZXJ5R3JvdXAsIHtcbiAgICAvLyAgICAgbmFtZTogJ2dhbGxlcnktcjJjM2YnLFxuICAgIC8vICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvY29tcG9zaXRlcy9nYWxsZXJ5L2dhbGxlcnktcjJjM2YucG5nJyxcbiAgICAvLyAgICAgd2lkZ2V0OiBXaWRnZXRzLkdhbGxlcnlXaWRnZXRGYWN0b3J5KDIsIDMsICdhYm92ZScsICcxMDAlJywgJzQwMHB4JywgJzMwcHgnLCBbXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+Rmlyc3QgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0ZGMzUwMCcgfSxcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5TZWNvbmQgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0RDMDA1NScgfSxcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5UaGlyZCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjQkYwMDM3JyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZvdXJ0aCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjQTUyOTM5JyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZpZnRoIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNFRTNCODAnIH0sXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+U2l4dGggSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0VFNkI5RScgfSxcbiAgICAvLyAgICAgXSksXG4gICAgLy8gfSk7XG4gICAgLy9cbiAgICAvLyBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5HYWxsZXJ5R3JvdXAsIHtcbiAgICAvLyAgICAgbmFtZTogJ2dhbGxlcnktcjNjMnInLFxuICAgIC8vICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvY29tcG9zaXRlcy9nYWxsZXJ5L2dhbGxlcnktcjNjMnIucG5nJyxcbiAgICAvLyAgICAgd2lkZ2V0OiBXaWRnZXRzLkdhbGxlcnlXaWRnZXRGYWN0b3J5KDMsIDIsICdyaWdodCcsICcxMDAlJywgJzQwMHB4JywgJzMwcHgnLCBbXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+Rmlyc3QgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0ZGMzUwMCcgfSxcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5TZWNvbmQgSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0RDMDA1NScgfSxcbiAgICAvLyAgICAgICAgIHsgY2FwdGlvbjogJzxoMz5UaGlyZCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjQkYwMDM3JyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZvdXJ0aCBJdGVtPC9oMz48cD5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9wPicsIGJhY2tncm91bmQ6ICcjQTUyOTM5JyB9LFxuICAgIC8vICAgICAgICAgeyBjYXB0aW9uOiAnPGgzPkZpZnRoIEl0ZW08L2gzPjxwPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3A+JywgYmFja2dyb3VuZDogJyNFRTNCODAnIH0sXG4gICAgLy8gICAgICAgICB7IGNhcHRpb246ICc8aDM+U2l4dGggSXRlbTwvaDM+PHA+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvcD4nLCBiYWNrZ3JvdW5kOiAnI0VFNkI5RScgfSxcbiAgICAvLyAgICAgXSksXG4gICAgLy8gfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcblxuICAgIFdpZGdldHMuU3RhY2tIb3Jpc29udGFsV2lkZ2V0ID1cbiAgICBXaWRnZXRzLldpZGdldChXaWRnZXRzLlN0YWNrR3JvdXAsIFdpZGdldHMuY3JlYXRlKHtcbiAgICAgICAgbmFtZTogJ2RlZmF1bHQtc3RhY2staG9yaXNvbnRhbCcsXG4gICAgICAgIHRhZzogJ2RlZmF1bHQtc3RhY2staG9yaXNvbnRhbCcsXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluIF0sXG4gICAgICAgIHdpZGdldHM6IFtdLFxuICAgIH0pKTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLlN0YWNrR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ3N0YWNrLWhvcmlzb250YWwnLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvY29udGFpbmVyL3N0YWNrL3N0YWNrLWhvcmlzb250YWwucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLmJ1aWxkKFdpZGdldHMuU3RhY2tIb3Jpc29udGFsV2lkZ2V0KSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuU3RhY2tWZXJ0aWNhbFdpZGdldCA9XG4gICAgV2lkZ2V0cy5XaWRnZXQoV2lkZ2V0cy5TdGFja0dyb3VwLCBXaWRnZXRzLmNyZWF0ZSh7XG4gICAgICAgIG5hbWU6ICdkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJyxcbiAgICAgICAgdGFnOiAnZGVmYXVsdC1zdGFjay12ZXJ0aWNhbCcsXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluIF0sXG4gICAgICAgIHdpZGdldHM6IFtdLFxuICAgIH0pKTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLlN0YWNrR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ3N0YWNrLXZlcnRpY2FsJyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2NvbnRhaW5lci9zdGFjay9zdGFjay12ZXJ0aWNhbC5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuYnVpbGQoV2lkZ2V0cy5TdGFja1ZlcnRpY2FsV2lkZ2V0LCB7fSksXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIlNoZWxsID0gd2luZG93LlNoZWxsIHx8IHt9O1xuXG4oZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgdW5kZWZpbmVkKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXN0YWNrLWNhbnZhcycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zdGFjay1jYW52YXMnLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5TdGFja2VkTWl4aW4gXSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3RhY2staG9yaXNvbnRhbCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zdGFjay1ob3Jpc29udGFsJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4sIENvcmUuU3RhY2tlZE1peGluIF0sXG4gICAgfSk7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4sIENvcmUuU3RhY2tlZE1peGluIF0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWNoZWNrJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWNoZWNrJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xuXG4gICAgV2lkZ2V0cy5DaGVja1dpZGdldCA9XG4gICAgV2lkZ2V0cy5XaWRnZXQoV2lkZ2V0cy5DaGVja3NHcm91cCwgV2lkZ2V0cy5jcmVhdGUoe1xuICAgICAgICBuYW1lOiAnZGVmYXVsdC1jaGVjaycsXG4gICAgICAgIHRhZzogJ2RlZmF1bHQtY2hlY2snLFxuICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcbiAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ21vZGVsJywgdGl0bGU6ICdNb2RlbCcsIHR5cGU6ICd2YXInLCB0YWI6ICdkYXRhJywgdmFyaWFibGU6IHRydWUgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ3N0ZXJlb3R5cGUnLCB0aXRsZTogJ1N0ZXJlb3R5cGUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnaXRlbXMnLCB0eXBlOiAnbXVsdGlwbGUnLCB0aXRsZTogJ0l0ZW1zJywgdGFiOiAnZGF0YScsXG4gICAgICAgICAgICAgICAgdGFiczogW1xuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdkYXRhJywgdGl0bGU6ICdEYXRhJyB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAndmFsdWUnLCB0aXRsZTogJ1ZhbHVlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2xhYmVsJywgdGl0bGU6ICdMYWJlbCcsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgfSkpO1xuXG4gICAgV2lkZ2V0cy5DaGVja1dpZGdldEZhY3RvcnkgPSBmdW5jdGlvbihzdGVyZW90eXBlLCB2YWx1ZSwgb3B0aW9ucykge1xuXG4gICAgICAgIHJldHVybiBXaWRnZXRzLmJ1aWxkKFdpZGdldHMuQ2hlY2tXaWRnZXQsIHtcbiAgICAgICAgICAgIG1vZGVsOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHsgdmFsdWU6IHZhbHVlIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtYXJnaW46IHsgdmFsdWU6ICcxNXB4IDE1cHgnIH0sXG4gICAgICAgICAgICBzdGVyZW90eXBlOiB7IHZhbHVlOiBzdGVyZW90eXBlIH0sXG4gICAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBvcHRpb25zLm1hcChmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7IHZhbHVlOiBvcHRpb24udmFsdWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiB7IHZhbHVlOiBvcHRpb24ubGFiZWwgfSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5DaGVja3NHcm91cCwge1xuICAgICAgICBuYW1lOiAnY2hlY2stZGVmYXVsdCcsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2NoZWNrL2NoZWNrLWRlZmF1bHQucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkNoZWNrV2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsIFsgJ0EnLCAnQicgXSwgW1xuICAgICAgICAgICAgeyB2YWx1ZTogJ0EnLCBsYWJlbDogJ0EnIH0sXG4gICAgICAgICAgICB7IHZhbHVlOiAnQicsIGxhYmVsOiAnQicgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICdDJywgbGFiZWw6ICdDJyB9LFxuICAgICAgICBdKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkNoZWNrc0dyb3VwLCB7XG4gICAgICAgIG5hbWU6ICdjaGVjay1wcmltYXJ5JyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vY2hlY2svY2hlY2stcHJpbWFyeS5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuQ2hlY2tXaWRnZXRGYWN0b3J5KCdwcmltYXJ5JywgWyAnQScsICdCJyBdLCBbXG4gICAgICAgICAgICB7IHZhbHVlOiAnQScsIGxhYmVsOiAnQScgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICdCJywgbGFiZWw6ICdCJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJ0MnLCBsYWJlbDogJ0MnIH0sXG4gICAgICAgIF0pLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQ2hlY2tzR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ2NoZWNrLXN1Y2Nlc3MnLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9jaGVjay9jaGVjay1zdWNjZXNzLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5DaGVja1dpZGdldEZhY3RvcnkoJ3N1Y2Nlc3MnLCBbICdBJywgJ0InIF0sIFtcbiAgICAgICAgICAgIHsgdmFsdWU6ICdBJywgbGFiZWw6ICdBJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJ0InLCBsYWJlbDogJ0InIH0sXG4gICAgICAgICAgICB7IHZhbHVlOiAnQycsIGxhYmVsOiAnQycgfSxcbiAgICAgICAgXSksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5DaGVja3NHcm91cCwge1xuICAgICAgICBuYW1lOiAnY2hlY2staW5mbycsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2NoZWNrL2NoZWNrLWluZm8ucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkNoZWNrV2lkZ2V0RmFjdG9yeSgnaW5mbycsIFsgJ0EnLCAnQicgXSwgW1xuICAgICAgICAgICAgeyB2YWx1ZTogJ0EnLCBsYWJlbDogJ0EnIH0sXG4gICAgICAgICAgICB7IHZhbHVlOiAnQicsIGxhYmVsOiAnQicgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICdDJywgbGFiZWw6ICdDJyB9LFxuICAgICAgICBdKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkNoZWNrc0dyb3VwLCB7XG4gICAgICAgIG5hbWU6ICdjaGVjay13YXJuaW5nJyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vY2hlY2svY2hlY2std2FybmluZy5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuQ2hlY2tXaWRnZXRGYWN0b3J5KCd3YXJuaW5nJywgWyAnQScsICdCJyBdLCBbXG4gICAgICAgICAgICB7IHZhbHVlOiAnQScsIGxhYmVsOiAnQScgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICdCJywgbGFiZWw6ICdCJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJ0MnLCBsYWJlbDogJ0MnIH0sXG4gICAgICAgIF0pLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQ2hlY2tzR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ2NoZWNrLWRhbmdlcicsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2NoZWNrL2NoZWNrLWRhbmdlci5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuQ2hlY2tXaWRnZXRGYWN0b3J5KCdkYW5nZXInLCBbICdBJywgJ0InIF0sIFtcbiAgICAgICAgICAgIHsgdmFsdWU6ICdBJywgbGFiZWw6ICdBJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJ0InLCBsYWJlbDogJ0InIH0sXG4gICAgICAgICAgICB7IHZhbHVlOiAnQycsIGxhYmVsOiAnQycgfSxcbiAgICAgICAgXSksXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtYnV0dG9uJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWJ1dHRvbicsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcblxuICAgIFdpZGdldHMuQnV0dG9uV2lkZ2V0ID1cbiAgICBXaWRnZXRzLldpZGdldChXaWRnZXRzLkJ1dHRvbnNHcm91cCwgV2lkZ2V0cy5jcmVhdGUoe1xuICAgICAgICBuYW1lOiAnZGVmYXVsdC1idXR0b24nLFxuICAgICAgICB0YWc6ICdkZWZhdWx0LWJ1dHRvbicsXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluLCBXaWRnZXRzLlNpemVNaXhpbiBdLFxuICAgICAgICBwcm9wczogW1xuICAgICAgICAgICAgeyBuYW1lOiAndGl0bGUnLCB0aXRsZTogJ1RpdGxlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2NvbnRlbnQnIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICd0eXBlJywgdGl0bGU6ICdUeXBlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdzdGVyZW90eXBlJywgdGl0bGU6ICdTdGVyZW90eXBlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXG4gICAgICAgIF0sXG4gICAgfSkpO1xuXG4gICAgV2lkZ2V0cy5CdXR0b25XaWRnZXRGYWN0b3J5ID0gZnVuY3Rpb24odGl0bGUsIHN0ZXJlb3R5cGUpIHtcblxuICAgICAgICB2YXIgdyA9IFdpZGdldHMuYnVpbGQoV2lkZ2V0cy5CdXR0b25XaWRnZXQsIHtcbiAgICAgICAgICAgIGlubmVyOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6ICB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbjogeyB2YWx1ZTogJzE1cHggMTVweCcgfSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdHlwZTogeyB2YWx1ZTogJ2J1dHRvbicgfSxcbiAgICAgICAgICAgIHRpdGxlOiB7IHZhbHVlOiB0aXRsZSB9LFxuICAgICAgICAgICAgc3RlcmVvdHlwZTogeyB2YWx1ZTogc3RlcmVvdHlwZSB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zb2xlLmxvZyh3KTtcblxuICAgICAgICByZXR1cm4gdztcbiAgICB9XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CdXR0b25zR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ2J1dHRvbi1kZWZhdWx0JyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vYnV0dG9uL2J1dHRvbi1kZWZhdWx0LnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5CdXR0b25XaWRnZXRGYWN0b3J5KCdEZWZhdWx0JywgJ2RlZmF1bHQnKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJ1dHRvbnNHcm91cCwge1xuICAgICAgICBuYW1lOiAnYnV0dG9uLXByaW1hcnknLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9idXR0b24vYnV0dG9uLXByaW1hcnkucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkJ1dHRvbldpZGdldEZhY3RvcnkoJ1ByaW1hcnknLCAncHJpbWFyeScpLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQnV0dG9uc0dyb3VwLCB7XG4gICAgICAgIG5hbWU6ICdidXR0b24tc3VjY2VzcycsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2J1dHRvbi9idXR0b24tc3VjY2Vzcy5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuQnV0dG9uV2lkZ2V0RmFjdG9yeSgnU3VjY2VzcycsICdzdWNjZXNzJyksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CdXR0b25zR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ2J1dHRvbi1pbmZvJyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vYnV0dG9uL2J1dHRvbi1pbmZvLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5CdXR0b25XaWRnZXRGYWN0b3J5KCdJbmZvJywgJ2luZm8nKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJ1dHRvbnNHcm91cCwge1xuICAgICAgICBuYW1lOiAnYnV0dG9uLXdhcm5pbmcnLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9idXR0b24vYnV0dG9uLXdhcm5pbmcucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkJ1dHRvbldpZGdldEZhY3RvcnkoJ1dhcm5pbmcnLCAnd2FybmluZycpLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQnV0dG9uc0dyb3VwLCB7XG4gICAgICAgIG5hbWU6ICdidXR0b24tZGFuZ2VyJyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vYnV0dG9uL2J1dHRvbi1kYW5nZXIucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkJ1dHRvbldpZGdldEZhY3RvcnkoJ0RhbmdlcicsICdkYW5nZXInKSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFdpZGdldHMpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1pbnB1dC10ZXh0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWlucHV0LXRleHQnLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdtb2RlbCcsIHRoaXMuYmluZGluZ3MpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3N0b3JhZ2UnLCB0aGlzLnN0b3JhZ2Uub25lKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1pbnB1dC10ZXh0YXJlYScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1pbnB1dC10ZXh0YXJlYScsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG4gICAgfSk7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWlucHV0LWNoZWNrYm94Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWlucHV0LWNoZWNrYm94JyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtaW5wdXQtcmFkaW8nLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtaW5wdXQtcmFkaW8nLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XG5cbiAgICBXaWRnZXRzLklucHV0V2lkZ2V0ID1cbiAgICBXaWRnZXRzLldpZGdldChXaWRnZXRzLklucHV0c0dyb3VwLCBXaWRnZXRzLmNyZWF0ZSh7XG4gICAgICAgIG5hbWU6ICdkZWZhdWx0LWlucHV0LXRleHQnLFxuICAgICAgICB0YWc6ICdkZWZhdWx0LWlucHV0LXRleHQnLFxuICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcbiAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ21vZGVsJywgdGl0bGU6ICdNb2RlbCcsIHR5cGU6ICd2YXInLCB0YWI6ICdkYXRhJywgdmFyaWFibGU6IHRydWUgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ3R5cGUnLCB0aXRsZTogJ1R5cGUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnY29udGVudCcgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ2xhYmVsJywgdGl0bGU6ICdMYWJlbCcsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdjb250ZW50JyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAncGxhY2Vob2xkZXInLCB0aXRsZTogJ1BsYWNlaG9sZGVyJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2NvbnRlbnQnIH0sXG4gICAgICAgIF0sXG4gICAgfSkpO1xuXG4gICAgV2lkZ2V0cy5JbnB1dFdpZGdldEZhY3RvcnkgPSBmdW5jdGlvbihsYWJlbCwgdHlwZSkge1xuXG4gICAgICAgIHJldHVybiBXaWRnZXRzLmJ1aWxkKFdpZGdldHMuSW5wdXRXaWRnZXQsIHtcbiAgICAgICAgICAgIG1vZGVsOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHsgdmFsdWU6ICcnIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtYXJnaW46IHsgdmFsdWU6ICcxNXB4IDE1cHgnIH0sXG4gICAgICAgICAgICBsYWJlbDogeyB2YWx1ZTogbGFiZWwgfSxcbiAgICAgICAgICAgIHR5cGU6IHsgdmFsdWU6IHR5cGUgfSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLklucHV0c0dyb3VwLCB7XG4gICAgICAgIG5hbWU6ICdpbnB1dC10ZXh0JyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vaW5wdXQvdGV4dC5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuSW5wdXRXaWRnZXRGYWN0b3J5KCdJbnB1dCcsICd0ZXh0JyksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLlRleHRhcmVhV2lkZ2V0ID1cbiAgICBXaWRnZXRzLldpZGdldChXaWRnZXRzLklucHV0c0dyb3VwLCBXaWRnZXRzLmNyZWF0ZSh7XG4gICAgICAgIG5hbWU6ICdkZWZhdWx0LWlucHV0LXRleHRhcmVhJyxcbiAgICAgICAgdGFnOiAnZGVmYXVsdC1pbnB1dC10ZXh0YXJlYScsXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluLCBXaWRnZXRzLlNpemVNaXhpbiBdLFxuICAgICAgICBwcm9wczogW1xuICAgICAgICAgICAgeyBuYW1lOiAnbW9kZWwnLCB0aXRsZTogJ01vZGVsJywgdHlwZTogJ3ZhcicsIHRhYjogJ2RhdGEnLCB2YXJpYWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnbGFiZWwnLCB0aXRsZTogJ0xhYmVsJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdwbGFjZWhvbGRlcicsIHRpdGxlOiAnUGxhY2Vob2xkZXInLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcbiAgICAgICAgXSxcbiAgICB9KSk7XG5cbiAgICBXaWRnZXRzLlRleHRhcmVhV2lkZ2V0RmFjdG9yeSA9IGZ1bmN0aW9uKGxhYmVsLCBwbGFjZWhvbGRlcikge1xuXG4gICAgICAgIHJldHVybiBXaWRnZXRzLmJ1aWxkKFdpZGdldHMuVGV4dGFyZWFXaWRnZXQsIHtcbiAgICAgICAgICAgIG1vZGVsOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHsgdmFsdWU6ICcnIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogeyB2YWx1ZTogcGxhY2Vob2xkZXIgfSxcbiAgICAgICAgICAgIG1hcmdpbjogeyB2YWx1ZTogJzE1cHggMTVweCcgfSxcbiAgICAgICAgICAgIGxhYmVsOiB7IHZhbHVlOiBsYWJlbCB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuSW5wdXRzR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ2lucHV0LXRleHRhcmVhJyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vaW5wdXQvdGV4dGFyZWEucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRhcmVhV2lkZ2V0RmFjdG9yeSgnVGV4dGFyZWEnLCAnVHlwZSBtZXNzYWdlIGhlcmUnKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuUmFkaW9JbnB1dFdpZGdldCA9XG4gICAgV2lkZ2V0cy5XaWRnZXQoV2lkZ2V0cy5JbnB1dHNHcm91cCwgV2lkZ2V0cy5jcmVhdGUoe1xuICAgICAgICBuYW1lOiAnZGVmYXVsdC1pbnB1dC1yYWRpbycsXG4gICAgICAgIHRhZzogJ2RlZmF1bHQtaW5wdXQtcmFkaW8nLFxuICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcbiAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ21vZGVsJywgdGl0bGU6ICdNb2RlbCcsIHR5cGU6ICd2YXInLCB0YWI6ICdkYXRhJywgdmFyaWFibGU6IHRydWUgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ3N0ZXJlb3R5cGUnLCB0aXRsZTogJ1N0ZXJlb3R5cGUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnaXRlbXMnLCB0eXBlOiAnbXVsdGlwbGUnLCB0aXRsZTogJ0l0ZW1zJywgdGFiOiAnZGF0YScsXG4gICAgICAgICAgICAgICAgdGFiczogW1xuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdkYXRhJywgdGl0bGU6ICdEYXRhJyB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAndmFsdWUnLCB0aXRsZTogJ1ZhbHVlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2xhYmVsJywgdGl0bGU6ICdMYWJlbCcsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgfSkpO1xuXG4gICAgV2lkZ2V0cy5SYWRpb0lucHV0V2lkZ2V0RmFjdG9yeSA9IGZ1bmN0aW9uKHZhbHVlLCBvcHRpb25zKSB7XG5cbiAgICAgICAgcmV0dXJuIFdpZGdldHMuYnVpbGQoV2lkZ2V0cy5SYWRpb0lucHV0V2lkZ2V0LCB7XG4gICAgICAgICAgICBtb2RlbDoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiB7IHZhbHVlOiB2YWx1ZSB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWFyZ2luOiB7IHZhbHVlOiAnMTVweCAxNXB4JyB9LFxuICAgICAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogb3B0aW9ucy5tYXAoZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogV2lkZ2V0cy5QYXJhbShvcHRpb24udmFsdWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFdpZGdldHMuUGFyYW0ob3B0aW9uLmxhYmVsKSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuSW5wdXRzR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ2lucHV0LXJhZGlvJyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vaW5wdXQvcmFkaW8ucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlJhZGlvSW5wdXRXaWRnZXRGYWN0b3J5KCcxJywgW1xuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ0ZpcnN0JyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJzInLCBsYWJlbDogJ1NlY29uZCcgfSxcbiAgICAgICAgXSksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkNoZWNrSW5wdXRXaWRnZXQgPVxuICAgIFdpZGdldHMuV2lkZ2V0KFdpZGdldHMuSW5wdXRzR3JvdXAsIFdpZGdldHMuY3JlYXRlKHtcbiAgICAgICAgbmFtZTogJ2RlZmF1bHQtaW5wdXQtY2hlY2tib3gnLFxuICAgICAgICB0YWc6ICdkZWZhdWx0LWlucHV0LWNoZWNrYm94JyxcbiAgICAgICAgbWl4aW5zOiBbIFdpZGdldHMuV2lkZ2V0TWl4aW4sIFdpZGdldHMuQm94TWl4aW4sIFdpZGdldHMuU2l6ZU1peGluIF0sXG4gICAgICAgIHByb3BzOiBbXG4gICAgICAgICAgICB7IG5hbWU6ICdtb2RlbCcsIHRpdGxlOiAnTW9kZWwnLCB0eXBlOiAndmFyJywgdGFiOiAnZGF0YScsIHZhcmlhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdzdGVyZW90eXBlJywgdGl0bGU6ICdTdGVyZW90eXBlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2l0ZW1zJywgdHlwZTogJ211bHRpcGxlJywgdGl0bGU6ICdJdGVtcycsIHRhYjogJ2RhdGEnLFxuICAgICAgICAgICAgICAgIHRhYnM6IFtcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnZGF0YScsIHRpdGxlOiAnRGF0YScgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHByb3BzOiBbXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ3ZhbHVlJywgdGl0bGU6ICdWYWx1ZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdsYWJlbCcsIHRpdGxlOiAnTGFiZWwnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH0pKTtcblxuICAgIFdpZGdldHMuQ2hlY2tJbnB1dFdpZGdldEZhY3RvcnkgPSBmdW5jdGlvbih2YWx1ZSwgb3B0aW9ucykge1xuXG4gICAgICAgIHJldHVybiBXaWRnZXRzLmJ1aWxkKFdpZGdldHMuQ2hlY2tJbnB1dFdpZGdldCwge1xuICAgICAgICAgICAgbW9kZWw6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogeyB2YWx1ZTogdmFsdWUgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1hcmdpbjogeyB2YWx1ZTogJzE1cHggMTVweCcgfSxcbiAgICAgICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IG9wdGlvbnMubWFwKGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFdpZGdldHMuUGFyYW0ob3B0aW9uLnZhbHVlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBXaWRnZXRzLlBhcmFtKG9wdGlvbi5sYWJlbCksXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLklucHV0c0dyb3VwLCB7XG4gICAgICAgIG5hbWU6ICdpbnB1dC1jaGVjaycsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2lucHV0L2NoZWNrYm94LnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5DaGVja0lucHV0V2lkZ2V0RmFjdG9yeShbICcxJyBdLCBbXG4gICAgICAgICAgICB7IHZhbHVlOiAnMScsIGxhYmVsOiAnRmlyc3QnIH0sXG4gICAgICAgICAgICB7IHZhbHVlOiAnMicsIGxhYmVsOiAnU2Vjb25kJyB9LFxuICAgICAgICBdKSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFdpZGdldHMpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xuXG4gICAgV2lkZ2V0cy5SYWRpb1dpZGdldCA9XG4gICAgV2lkZ2V0cy5XaWRnZXQoV2lkZ2V0cy5SYWRpb3NHcm91cCwgV2lkZ2V0cy5jcmVhdGUoe1xuICAgICAgICBuYW1lOiAnZGVmYXVsdC1yYWRpbycsXG4gICAgICAgIHRhZzogJ2RlZmF1bHQtcmFkaW8nLFxuICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcbiAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ21vZGVsJywgdGl0bGU6ICdNb2RlbCcsIHR5cGU6ICd2YXInLCB0YWI6ICdkYXRhJywgdmFyaWFibGU6IHRydWUgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ3N0ZXJlb3R5cGUnLCB0aXRsZTogJ1N0ZXJlb3R5cGUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnaXRlbXMnLCB0eXBlOiAnbXVsdGlwbGUnLCB0aXRsZTogJ0l0ZW1zJywgdGFiOiAnZGF0YScsXG4gICAgICAgICAgICAgICAgdGFiczogW1xuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdkYXRhJywgdGl0bGU6ICdEYXRhJyB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAndmFsdWUnLCB0aXRsZTogJ1ZhbHVlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2xhYmVsJywgdGl0bGU6ICdMYWJlbCcsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgfSkpO1xuXG4gICAgV2lkZ2V0cy5SYWRpb1dpZGdldEZhY3RvcnkgPSBmdW5jdGlvbihzdGVyZW90eXBlLCB2YWx1ZSwgb3B0aW9ucykge1xuXG4gICAgICAgIHJldHVybiBXaWRnZXRzLmJ1aWxkKFdpZGdldHMuUmFkaW9XaWRnZXQsIHtcbiAgICAgICAgICAgIG1vZGVsOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHsgdmFsdWU6IHZhbHVlIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtYXJnaW46IHsgdmFsdWU6ICcxNXB4IDE1cHgnIH0sXG4gICAgICAgICAgICBzdGVyZW90eXBlOiB7IHZhbHVlOiBzdGVyZW90eXBlIH0sXG4gICAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBvcHRpb25zLm1hcChmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7IHZhbHVlOiBvcHRpb24udmFsdWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiB7IHZhbHVlOiBvcHRpb24ubGFiZWwgfSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ3JhZGlvLWRlZmF1bHQnLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9yYWRpby9yYWRpby1kZWZhdWx0LnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5SYWRpb1dpZGdldEZhY3RvcnkoJ2RlZmF1bHQnLCAnMScsIFtcbiAgICAgICAgICAgIHsgdmFsdWU6ICcxJywgbGFiZWw6ICdPbicgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICcwJywgbGFiZWw6ICdPZmYnIH0sXG4gICAgICAgIF0pLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ3JhZGlvLXByaW1hcnknLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9yYWRpby9yYWRpby1wcmltYXJ5LnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5SYWRpb1dpZGdldEZhY3RvcnkoJ3ByaW1hcnknLCAnMScsIFtcbiAgICAgICAgICAgIHsgdmFsdWU6ICcxJywgbGFiZWw6ICdPbicgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICcwJywgbGFiZWw6ICdPZmYnIH0sXG4gICAgICAgIF0pLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ3JhZGlvLXN1Y2Nlc3MnLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9yYWRpby9yYWRpby1zdWNjZXNzLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5SYWRpb1dpZGdldEZhY3RvcnkoJ3N1Y2Nlc3MnLCAnMScsIFtcbiAgICAgICAgICAgIHsgdmFsdWU6ICcxJywgbGFiZWw6ICdPbicgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICcwJywgbGFiZWw6ICdPZmYnIH0sXG4gICAgICAgIF0pLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ3JhZGlvLWluZm8nLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9yYWRpby9yYWRpby1pbmZvLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5SYWRpb1dpZGdldEZhY3RvcnkoJ2luZm8nLCAnMScsIFtcbiAgICAgICAgICAgIHsgdmFsdWU6ICcxJywgbGFiZWw6ICdPbicgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICcwJywgbGFiZWw6ICdPZmYnIH0sXG4gICAgICAgIF0pLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ3JhZGlvLXdhcm5pbmcnLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9yYWRpby9yYWRpby13YXJuaW5nLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5SYWRpb1dpZGdldEZhY3RvcnkoJ3dhcm5pbmcnLCAnMScsIFtcbiAgICAgICAgICAgIHsgdmFsdWU6ICcxJywgbGFiZWw6ICdPbicgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICcwJywgbGFiZWw6ICdPZmYnIH0sXG4gICAgICAgIF0pLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ3JhZGlvLWRhbmdlcicsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL3JhZGlvL3JhZGlvLWRhbmdlci5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuUmFkaW9XaWRnZXRGYWN0b3J5KCdkYW5nZXInLCAnMScsIFtcbiAgICAgICAgICAgIHsgdmFsdWU6ICcxJywgbGFiZWw6ICdPbicgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICcwJywgbGFiZWw6ICdPZmYnIH0sXG4gICAgICAgIF0pLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXJhZGlvJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXJhZGlvJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xuXG4gICAgV2lkZ2V0cy5UZXh0V2lkZ2V0ID1cbiAgICBXaWRnZXRzLldpZGdldChXaWRnZXRzLkJsb2Nrc0dyb3VwLCBXaWRnZXRzLmNyZWF0ZSh7XG4gICAgICAgIG5hbWU6ICdkZWZhdWx0LXRleHQnLFxuICAgICAgICB0YWc6ICdkZWZhdWx0LXRleHQnLFxuICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcbiAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ3N0ZXJlb3R5cGUnLCB0aXRsZTogJ1N0ZXJlb3R5cGUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ2NvbnRlbnQnLCB0aXRsZTogJ0NvbnRlbnQnLCB0eXBlOiAncmljaCcsIHRhYjogJ2NvbnRlbnQnIH0sXG4gICAgICAgIF0sXG4gICAgfSkpO1xuXG4gICAgV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSA9IGZ1bmN0aW9uKHN0ZXJlb3R5cGUsIGNvbnRlbnQpIHtcblxuICAgICAgICByZXR1cm4gV2lkZ2V0cy5idWlsZChXaWRnZXRzLlRleHRXaWRnZXQsIHtcbiAgICAgICAgICAgIGNvbnRlbnQ6IHsgdmFsdWU6IGNvbnRlbnQgfSxcbiAgICAgICAgICAgIG1hcmdpbjogeyB2YWx1ZTogJzE1cHggMTVweCcgfSxcbiAgICAgICAgICAgIHN0ZXJlb3R5cGU6IHsgdmFsdWU6IHN0ZXJlb3R5cGUgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuSGVhZGluZ3NHcm91cCwge1xuICAgICAgICBuYW1lOiAndGV4dC1oMScsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvdGV4dC1oMS5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuVGV4dFdpZGdldEZhY3RvcnkoJ2RlZmF1bHQnLCBgXG4gICAgICAgICAgICA8aDE+SGVhZGluZyAxPC9oMT5cbiAgICAgICAgYCksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5IZWFkaW5nc0dyb3VwLCB7XG4gICAgICAgIG5hbWU6ICd0ZXh0LWgyJyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL3RleHQvdGV4dC90ZXh0LWgyLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsIGBcbiAgICAgICAgICAgIDxoMj5IZWFkaW5nIDI8L2gyPlxuICAgICAgICBgKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkhlYWRpbmdzR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ3RleHQtaDMnLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L3RleHQtaDMucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXRGYWN0b3J5KCdkZWZhdWx0JywgYFxuICAgICAgICAgICAgPGgzPkhlYWRpbmcgMzwvaDM+XG4gICAgICAgIGApLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuSGVhZGluZ3NHcm91cCwge1xuICAgICAgICBuYW1lOiAndGV4dC1oNCcsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvdGV4dC1oNC5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuVGV4dFdpZGdldEZhY3RvcnkoJ2RlZmF1bHQnLCBgXG4gICAgICAgICAgICA8aDQ+SGVhZGluZyA0PC9oND5cbiAgICAgICAgYCksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5IZWFkaW5nc0dyb3VwLCB7XG4gICAgICAgIG5hbWU6ICd0ZXh0LWg1JyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL3RleHQvdGV4dC90ZXh0LWg1LnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsIGBcbiAgICAgICAgICAgIDxoNT5IZWFkaW5nIDU8L2g1PlxuICAgICAgICBgKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkhlYWRpbmdzR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ3RleHQtaDYnLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L3RleHQtaDYucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXRGYWN0b3J5KCdkZWZhdWx0JywgYFxuICAgICAgICAgICAgPGg2PkhlYWRpbmcgNjwvaDY+XG4gICAgICAgIGApLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQmxvY2tzR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ2Jsb2NrLWRlZmF1bHQnLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L2Jsb2NrLWRlZmF1bHQucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXRGYWN0b3J5KCdkZWZhdWx0JywgYFxuICAgICAgICAgICAgPGgzPkxvcmVtIGlwc3VtPC9oMz5cbiAgICAgICAgICAgIDxwPkV0aWFtIHBvcnRhIHNlbSBtYWxlc3VhZGEgbWFnbmEgbW9sbGlzIGV1aXNtb2QuPC9wPlxuICAgICAgICBgKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJsb2Nrc0dyb3VwLCB7XG4gICAgICAgIG5hbWU6ICdibG9jay1wcmltYXJ5JyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL3RleHQvdGV4dC9ibG9jay1wcmltYXJ5LnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgncHJpbWFyeScsIGBcbiAgICAgICAgICAgIDxoMz5Mb3JlbSBpcHN1bTwvaDM+XG4gICAgICAgICAgICA8cD5FdGlhbSBwb3J0YSBzZW0gbWFsZXN1YWRhIG1hZ25hIG1vbGxpcyBldWlzbW9kLjwvcD5cbiAgICAgICAgYCksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CbG9ja3NHcm91cCwge1xuICAgICAgICBuYW1lOiAnYmxvY2stc3VjY2VzcycsXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvYmxvY2stc3VjY2Vzcy5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuVGV4dFdpZGdldEZhY3RvcnkoJ3N1Y2Nlc3MnLCBgXG4gICAgICAgICAgICA8aDM+TG9yZW0gaXBzdW08L2gzPlxuICAgICAgICAgICAgPHA+RXRpYW0gcG9ydGEgc2VtIG1hbGVzdWFkYSBtYWduYSBtb2xsaXMgZXVpc21vZC48L3A+XG4gICAgICAgIGApLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQmxvY2tzR3JvdXAsIHtcbiAgICAgICAgbmFtZTogJ2Jsb2NrLWluZm8nLFxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L2Jsb2NrLWluZm8ucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXRGYWN0b3J5KCdpbmZvJywgYFxuICAgICAgICAgICAgPGgzPkxvcmVtIGlwc3VtPC9oMz5cbiAgICAgICAgICAgIDxwPkV0aWFtIHBvcnRhIHNlbSBtYWxlc3VhZGEgbWFnbmEgbW9sbGlzIGV1aXNtb2QuPC9wPlxuICAgICAgICBgKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJsb2Nrc0dyb3VwLCB7XG4gICAgICAgIG5hbWU6ICdibG9jay13YXJuaW5nJyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL3RleHQvdGV4dC9ibG9jay13YXJuaW5nLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnd2FybmluZycsIGBcbiAgICAgICAgICAgIDxoMz5Mb3JlbSBpcHN1bTwvaDM+XG4gICAgICAgICAgICA8cD5FdGlhbSBwb3J0YSBzZW0gbWFsZXN1YWRhIG1hZ25hIG1vbGxpcyBldWlzbW9kLjwvcD5cbiAgICAgICAgYCksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CbG9ja3NHcm91cCwge1xuICAgICAgICBuYW1lOiAnYmxvY2stZGFuZ2VyJyxcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL3RleHQvdGV4dC9ibG9jay1kYW5nZXIucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXRGYWN0b3J5KCdkYW5nZXInLCBgXG4gICAgICAgICAgICA8aDM+TG9yZW0gaXBzdW08L2gzPlxuICAgICAgICAgICAgPHA+RXRpYW0gcG9ydGEgc2VtIG1hbGVzdWFkYSBtYWduYSBtb2xsaXMgZXVpc21vZC48L3A+XG4gICAgICAgIGApLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXRleHQnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtdGV4dCcsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtYm94Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWJveCcsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBiaW5kaW5nczogT2JqZWN0LFxuICAgICAgICAgICAgY2xhc3M6IFN0cmluZyxcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXBsYWNlaG9sZGVyJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXBsYWNlaG9sZGVyJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xuXG4gICAgV2lkZ2V0cy5TdHViV2lkZ2V0ID1cbiAgICBXaWRnZXRzLldpZGdldChXaWRnZXRzLlV0aWxHcm91cCwgV2lkZ2V0cy5jcmVhdGUoe1xuICAgICAgICBfYWN0aW9uOiAnaWdub3JlJyxcbiAgICAgICAgbmFtZTogJ2RlZmF1bHQtc3R1YicsXG4gICAgICAgIHRhZzogJ2RlZmF1bHQtc3R1YicsXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLkJveE1peGluIF0sXG4gICAgICAgIHByb3BzOiBbXG4gICAgICAgICAgICB7IG5hbWU6ICdjb250ZW50JywgdHlwZTogJ3JpY2gnIH1cbiAgICAgICAgXSxcbiAgICB9KSk7XG5cbiAgICBXaWRnZXRzLlN0dWJXaWRnZXRGYWN0b3J5ID0gZnVuY3Rpb24oY29udGVudCkge1xuXG4gICAgICAgIHJldHVybiBXaWRnZXRzLmJ1aWxkKFdpZGdldHMuU3R1YldpZGdldCwge1xuICAgICAgICAgICAgY29udGVudDogeyB2YWx1ZTogY29udGVudCB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3R1YicsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zdHViJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIExhbmRpbmcuTGFuZGluZ1BhZ2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctcGFnZScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1wYWdlJyxcbiAgICB9KTtcblxuICAgIExhbmRpbmcuTGFuZGluZ0dhbGxlcnlQYWdlID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWdhbGxlcnktcGFnZScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1nYWxsZXJ5LXBhZ2UnLFxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5MYW5kaW5nU3RvcmFnZVBhZ2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctc3RvcmFnZS1wYWdlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXN0b3JhZ2UtcGFnZScsXG4gICAgfSk7XG5cbiAgICBMYW5kaW5nLkxhbmRpbmdTaWduaW5QYWdlID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXNpZ25pbi1wYWdlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXNpZ25pbi1wYWdlJyxcbiAgICB9KTtcblxuICAgIExhbmRpbmcuTGFuZGluZ1NpZ251cFBhZ2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctc2lnbnVwLXBhZ2UnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctc2lnbnVwLXBhZ2UnLFxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5MYW5kaW5nUHJvZmlsZVBhZ2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctcHJvZmlsZS1wYWdlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXByb2ZpbGUtcGFnZScsXG4gICAgfSk7XG5cbiAgICBMYW5kaW5nLkxhbmRpbmdNYW5hZ2VQYWdlID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLW1hbmFnZS1wYWdlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLW1hbmFnZS1wYWdlJyxcbiAgICB9KTtcblxuICAgIExhbmRpbmcuTGFuZGluZ01hbmFnZUNyZWF0ZVBhZ2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctbWFuYWdlLWNyZWF0ZS1wYWdlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLW1hbmFnZS1jcmVhdGUtcGFnZScsXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xuXG4gICAgQ29yZS5Qb3J0YWxzRmFjdG9yeSA9IGZ1bmN0aW9uKG93bmVyKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcblxuICAgICAgICAgICAgbG9hZDogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLmdldCgnL3dzL3BvcnRhbHMnLCBkYXRhKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyByZXNvbHZlKGQpOyB9LFxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyByZWplY3QoZSk7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgIGNyZWF0ZTogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLnBvc3QoJy93cy9wb3J0YWxzJywgZGF0YSkudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgcmVzb2x2ZShkKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgcmVqZWN0KGUpOyB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pLFxuXG4gICAgICAgICAgICByZW1vdmU6IChkYXRhKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5kZWxldGUoJy93cy9wb3J0YWxzJywgZGF0YSkudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgcmVzb2x2ZShkKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgcmVqZWN0KGUpOyB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pLFxuXG4gICAgICAgICAgICBnZXQ6IChkYXRhKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5nZXQoYC93cy9wb3J0YWxzLyR7ZGF0YS5pZH1gKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyByZXNvbHZlKGQpOyB9LFxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyByZWplY3QoZSk7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSksXG4gICAgICAgIH07XG4gICAgfVxuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIENvcmUuU2VjdXJpdHlGYWN0b3J5ID0gZnVuY3Rpb24ob3duZXIpIHtcblxuICAgICAgICByZXR1cm4ge1xuXG4gICAgICAgICAgICBzaWdudXA6IChkYXRhKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5wb3N0KCcvd3Mvc2lnbnVwJywgZGF0YSkudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgb3duZXIucHJpbmNpcGFsID0gZC5kYXRhLnByaW5jaXBhbDsgcmVzb2x2ZShkKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgb3duZXIucHJpbmNpcGFsID0gbnVsbDsgcmVqZWN0KGUpOyB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pLFxuXG4gICAgICAgICAgICBzaWduaW46IChkYXRhKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5wb3N0KCcvd3Mvc2lnbmluJywgZGF0YSkudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgb3duZXIucHJpbmNpcGFsID0gZC5kYXRhLnByaW5jaXBhbDsgcmVzb2x2ZShkKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgb3duZXIucHJpbmNpcGFsID0gbnVsbDsgcmVqZWN0KGUpOyB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pLFxuXG4gICAgICAgICAgICBzaWdub3V0OiAoKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5wb3N0KCcvd3Mvc2lnbm91dCcpLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IG93bmVyLnByaW5jaXBhbCA9IG51bGw7IHJlc29sdmUoZCk7IH0sXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IHJlamVjdChlKTsgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgfTtcbiAgICB9XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xuXG4gICAgdmFyIHZhbGlkYXRpb24gPSB7XG4gICAgICAgIGVtYWlsOiBcIi9eKFthLXpBLVowLTlfXFxcXC5cXFxcLV0rKUAoW2EtekEtWjAtOV9cXFxcLlxcXFwtXSspXFxcXC4oW2EtekEtWjAtOV17Mix9KSQvZ1wiLFxuICAgIH07XG5cbiAgICBMYW5kaW5nLlNpZ25pbiA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1hY2NvdW50LXNpZ25pbicsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1hY2NvdW50LXNpZ25pbicsXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBmb3JtOiB0aGlzLmZvcm0sXG4gICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogdmFsaWRhdGlvbixcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2Zvcm0nLCB7XG4gICAgICAgICAgICAgICAgZW1haWw6IG51bGwsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgc2lnbmluOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdzZWN1cml0eScpLnNpZ25pbih7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsOiB0aGlzLmZvcm0uZW1haWwsXG4gICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkOiB0aGlzLmZvcm0ucGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgfSkudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgdGhpcy4kcm91dGVyLmdvKCcvJyk7IH0sXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5TaWdudXAgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctYWNjb3VudC1zaWdudXAnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctYWNjb3VudC1zaWdudXAnLFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZm9ybTogdGhpcy5mb3JtLFxuICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IHZhbGlkYXRpb24sXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kc2V0KCdmb3JtJywge1xuICAgICAgICAgICAgICAgIGVtYWlsOiBudWxsLFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBudWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHNpZ251cDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICBWdWUuc2VydmljZSgnc2VjdXJpdHknKS5zaWdudXAoe1xuICAgICAgICAgICAgICAgICAgICBlbWFpbDogdGhpcy5mb3JtLmVtYWlsLFxuICAgICAgICAgICAgICAgICAgICBwYXNzd29yZDogdGhpcy5mb3JtLnBhc3N3b3JkLFxuICAgICAgICAgICAgICAgIH0pLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHRoaXMuJHJvdXRlci5nbygnLycpOyB9LFxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIExhbmRpbmcuUHJvZmlsZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1hY2NvdW50LXByb2ZpbGUnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctYWNjb3VudC1wcm9maWxlJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIiIsIiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICBMYW5kaW5nLkZlZWRiYWNrID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWZlZWRiYWNrJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLWZlZWRiYWNrJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICBMYW5kaW5nLkZvb3RlciA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1mb290ZXInLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctZm9vdGVyJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICBMYW5kaW5nLkdhbGxlcnkgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctZ2FsbGVyeScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1nYWxsZXJ5JyxcbiAgICB9KTtcblxuICAgIExhbmRpbmcuR2FsbGVyeUZ1bGwgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctZ2FsbGVyeS1mdWxsJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLWdhbGxlcnktZnVsbCcsXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xuXG4gICAgTGFuZGluZy5IZWFkZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctaGVhZGVyJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLWhlYWRlcicsXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHNpZ25vdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdzZWN1cml0eScpLnNpZ25vdXQoKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyB0aGlzLiRyb3V0ZXIuZ28oJy8nKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xuXG4gICAgTGFuZGluZy5NYW5hZ2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctbWFuYWdlJywge1xuXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctbWFuYWdlJyxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSArICh3aW5kb3cubG9jYXRpb24ucG9ydCA/ICc6JyArIHdpbmRvdy5sb2NhdGlvbi5wb3J0OiAnJyksXG4gICAgICAgICAgICAgICAgcG9ydGFsczogdGhpcy5wb3J0YWxzLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuXG4gICAgICAgICAgICByZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBWdWUuc2VydmljZSgncG9ydGFscycpLmxvYWQoKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyB0aGlzLiRzZXQoJ3BvcnRhbHMnLCBkLmRhdGEucG9ydGFscyk7IH0sXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IHRoaXMuJHNldCgncG9ydGFscycsIFtdKTsgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3BvcnRhbHMnKS5yZW1vdmUoe1xuICAgICAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgdGhpcy5yZWZyZXNoKCk7IH0sXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5NYW5hZ2VDcmVhdGUgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctbWFuYWdlLWNyZWF0ZScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1tYW5hZ2UtY3JlYXRlJyxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZvcm06IHRoaXMuZm9ybSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2Zvcm0nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuXG4gICAgICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdwb3J0YWxzJykuY3JlYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMuZm9ybS50aXRsZSxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyB0aGlzLiRyb3V0ZXIuZ28oJy9tYW5hZ2UnKX0sXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIExhbmRpbmcuU3RvcmFnZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1wcmljaW5nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXByaWNpbmcnLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIExhbmRpbmcuU3RvcmFnZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1zdG9yYWdlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXN0b3JhZ2UnLFxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5TdG9yYWdlRnVsbCA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1zdG9yYWdlLWZ1bGwnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctc3RvcmFnZS1mdWxsJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICBMYW5kaW5nLlN1cGVyID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXN1cGVyJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXN1cGVyJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICBMYW5kaW5nLlVzZWNhc2VzID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXVzZWNhc2VzJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXVzZWNhc2VzJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICBMYW5kaW5nLlZpZGVvID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXZpZGVvJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXZpZGVvJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
