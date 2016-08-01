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
                    width: size.width,
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

            var excludeTags = ['TEXTAREA', 'INPUT', 'BUTTON', 'LABEL'];

            if (excludeTags.indexOf($(e.target).prop("tagName")) < 0) {
                e.preventDefault();
                e.stopPropagation();
            }

            if (!context) {

                var $item = $(e.target).closest(this.options.itemSelector);
                var $parent = $item.parent();

                var offset = $item.offset();

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
        Pages: {},
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

(function($, Vue, Core, Shell) {

    var PagesModalEditor = Shell.Pages.ModalEditor =
    Vue.component('shell-pages-dialog', {
        template: '#shell-pages-dialog',
        mixins: [ Core.ModalEditorMixin, Core.TabsMixin('main') ],
        created: function() {

            var items = [];

            for (var i = 0; i < this.context.widget.props.length; i++) {

                var prop = this.context.widget.props[i];
                var param = this.current.root.params[prop.name];

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
        },
    });

})(jQuery, Vue, Core, Shell);

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

(function($, Vue, Core, Shell) {

    Vue.component('shell-actions', {
        template: '#shell-actions',
        props: {
            model: Object,
            globals: Object,
            // category: Object,
            // domain: Object,
            // page: Object
        },
        methods: {
            trigger: function(event, item, context) {
                this.$dispatch(event, { item: item, context: context });
            },
        }
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

    Vue.component('shell-brand', {
        template: '#shell-brand',
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

                var b = item.param ? item.param.binding : null;
                var v = item.param ? item.param.value : null;

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
        mixins: [ CompositeMixin, SortableMixin('>.ge.ge-content >.wg.wg-default-stack >.wg.wg-content >.wg.wg-table'), BindingsMixin ],
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
        created: function() {
            this.selected = true;
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

                    console.log(newStack, newStack.items);
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
                widget: this.widget,
            };
        },
        created: function() {

            this.widget = Vue.service('palette').widget('default-container/default-container-stack/default-stack-canvas');

            var runtime = Vue.service('runtime');

            this.decorator = 'shell-decorator-canvas';
            this.data = {};
            this.storage = {};

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
        data: function() {
            return {
                items: this.items,
            }
        },
        created: function() {

            this.$watch('pages', (pages) => {

                var items = [];
                for (var i = 0; i < this.pages.length; i++) {
                    var page = this.pages[i];
                    if (page._action != 'remove') {
                        items.push(page);
                    }
                }
                this.items = items;
                
            }, { deep: true, immediate: true })
        },
        methods: {

            remove: function(page) {

                var index = this.pages.indexOf(page);
                if (index !== -1) {
                    var item = this.pages[index];
                    if (item._action == 'create') {
                        this.pages.$remove(item);
                    } else {
                        item._action = 'remove';
                    }
                }

                this.pages = this.pages.slice();
                // console.log(this.pages);
            },

            create: function() {

                var root = Vue.service('palette').item('default-container/default-container-stack/stack-canvas');
                var widget = Vue.service('palette').widget('default-container/default-container-stack/default-stack-canvas');

                var page = {
                    _action: 'create',
                    root: root,
                    sources: [],
                    storages: [],
                };

                var dialog = new Shell.Pages.ModalEditor({

                    data: {
                        globals: this.globals,
                        owner: this,
                        context: {
                            widget: widget,
                        },
                        original: page,
                        current: JSON.parse(JSON.stringify(page)),
                    },

                    methods: {
                        submit: function() {

                            Object.assign(this.original, JSON.parse(JSON.stringify(this.current)));
                            this.original._action = this.original._action ? this.original._action : 'create';
                            this.original.root._action = this.original.root._action ? this.original.root._action : 'create';

                            this.owner.pages.push(this.original);

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
            update: function(page) {

                var widget = Vue.service('palette').widget('default-container/default-container-stack/default-stack-canvas');

                var dialog = new Shell.Pages.ModalEditor({

                    data: {
                        globals: this.globals,
                        owner: this,
                        context: {
                            widget: widget,
                        },
                        original: page,
                        current: JSON.parse(JSON.stringify(page))
                    },

                    methods: {
                        submit: function() {

                            Object.assign(this.original, JSON.parse(JSON.stringify(this.current)));
                            this.original._action = this.original._action ? this.original._action : 'update';
                            this.original.root._action = this.original.root._action ? this.original.root._action : 'update';

                            this.owner.pages = this.owner.pages.slice();

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
            trigger: function(event, item, context) {
                this.$dispatch(event, { item: item, context: context });
            },
        }
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

    Vue.component('shell-sources', {
        template: '#shell-sources',
        props: {
            sources: Array,
            globals: Object,
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

(function(Vue, $, Core, Shell) {

    var WidgetsModalEditor = Shell.Widgets.ModalEditor =
    Vue.component('shell-widgets-dialog', {
        template: '#shell-widgets-dialog',
        mixins: [Core.ModalEditorMixin, Core.TabsMixin('data')],
        created: function() {

            var items = [];

            for (var i = 0; i < this.context.widget.props.length; i++) {

                var prop = this.context.widget.props[i];
                var param = this.current.params[prop.name];

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

})(Vue, jQuery, Core, Shell);

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
            var w = $.extend(true, {}, this.category(segments[0]).group(segments[1]).item(segments[2]).widget, {
                _action: 'create',
            });
            delete w.props;
            delete w.tabs;
            return w;
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

            if (m.override) {

                if ('tabs' in m) w.tabs = JSON.parse(JSON.stringify(m.tabs));
                if ('props' in m) w.props = JSON.parse(JSON.stringify(m.props));

            } else {

                if ('tabs' in m) w.tabs = w.tabs.concat(m.tabs);
                if ('props' in m) w.props = w.props.concat(m.props);
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

    Widgets.CanvasMixin = {
        tabs: [ T.Data, T.Appearance, T.Content ],
    };

    Widgets.WidgetMixin = {
        tabs: [ T.Data, T.Appearance, T.Content ],
        props: [ P.Id ],
    };

    Widgets.BoxMixin = {
        props: [
            { name: 'inner', title: 'Inner Container', type: 'object', tab: 'appearance',
                tabs: [ T.Appearance ],
                props: [ P.Margin, P.Padding, P.Border, P.Background ]
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

    Widgets.HeadingsGroup = Widgets.Group(Widgets.TextCategory, 'default-text-headings', 'Headings');
    Widgets.BlocksGroup = Widgets.Group(Widgets.TextCategory, 'default-text-blocks', 'Blocks');

})(jQuery, Vue, Core, Widgets);

(function($, Vue, Core, Widgets) {

    Widgets.ButtonsGroup = Widgets.Group(Widgets.FormCategory, 'default-form-buttons', 'Buttons');
    Widgets.InputsGroup = Widgets.Group(Widgets.FormCategory, 'default-form-inputs', 'Inputs');
    Widgets.RadiosGroup = Widgets.Group(Widgets.FormCategory, 'default-form-radios', 'Radios');
    Widgets.ChecksGroup = Widgets.Group(Widgets.FormCategory, 'default-form-checks', 'Checkboxes');

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
                                        height: { value: item.drawing.height },
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

    Widgets.Item(Widgets.GalleryGroup, {
        name: 'gallery-r1c3b',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/composites/gallery/gallery-r1c3b.png',
        widget: Widgets.GalleryWidgetFactory({
            rows: 1, cols: 3, dock: 'bottom', padding: '15px', align: 'left', color: '#333333',
            border: {
                spacing: '20px',
            },
            items: {
                style: {
                    width: '100%',
                },
                collection: [
                    {
                        drawing: {
                            background: '#FF6466',
                            height: '180px',
                        },
                        description: {
                            content: `
                                <h3><span style="font-size:24px">First Item</span></h3>
                                <p><span style="font-size: 18px">You can change item data using settings editor</span></p>
                            `,
                        },
                    },
                    {
                        drawing: {
                            background: '#605BE8',
                            height: '180px',
                        },
                        description: {
                            content: `
                                <h3><span style="font-size:24px">Second Item</span></h3>
                                <p><span style="font-size: 18px">You can change item data using settings editor</span></p>
                            `,
                        },
                    },
                    {
                        drawing: {
                            background: '#70FFBF',
                            height: '180px',
                        },
                        description: {
                            content: `
                                <h3><span style="font-size:24px">Third Item</span></h3>
                                <p><span style="font-size: 18px">You can change item data using settings editor</span></p>
                            `,
                        },
                    },
                    {
                        drawing: {
                            background: '#A52939',
                            height: '180px',
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
                            background: '#EE3B80',
                            height: '180px',
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
                            background: '#EE6B9E',
                            height: '180px',
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

    Widgets.Item(Widgets.GalleryGroup, {
        name: 'gallery-r2c4f',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/composites/gallery/gallery-r2c4f.png',
        widget: Widgets.GalleryWidgetFactory({
            rows: 2, cols: 4, dock: 'above', padding: '15px', align: 'center', color: '#FFFFFF',
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
                    {
                        drawing: {
                            background: '#FF6466'
                        },
                        description: {
                            content: `
                                <h3><span>Seventh Item</span></h3>
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
                                <h3><span>Eighth Item</span></h3>
                                <p><span>You can change item data using settings editor</span></p>
                            `,
                        },
                    },
                ]
            }
        }),
    });

    Widgets.Item(Widgets.GalleryGroup, {
        name: 'gallery-r2c4b',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/composites/gallery/gallery-r2c4b.png',
        widget: Widgets.GalleryWidgetFactory({
            rows: 2, cols: 4, dock: 'bottom', padding: '15px', align: 'center', color: '#333333',
            border: {
                spacing: '20px',
            },
            items: {
                style: {
                    width: '100%',
                },
                collection: [
                    {
                        drawing: {
                            background: '#FF6466',
                            height: '180px',
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
                            background: '#605BE8',
                            height: '180px',
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
                            background: '#70FFBF',
                            height: '180px',
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
                            background: '#A52939',
                            height: '180px',
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
                            background: '#EE3B80',
                            height: '180px',
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
                            background: '#EE6B9E',
                            height: '180px',
                        },
                        description: {
                            content: `
                                <h3><span>Sixth Item</span></h3>
                                <p><span>You can change item data using settings editor</span></p>
                            `,
                        },
                    },
                    {
                        drawing: {
                            background: '#FF6466',
                            height: '180px',
                        },
                        description: {
                            content: `
                                <h3><span>Seventh Item</span></h3>
                                <p><span>You can change item data using settings editor</span></p>
                            `,
                        },
                    },
                    {
                        drawing: {
                            background: '#605BE8',
                            height: '180px',
                        },
                        description: {
                            content: `
                                <h3><span>Eighth Item</span></h3>
                                <p><span>You can change item data using settings editor</span></p>
                            `,
                        },
                    },
                ]
            }
        }),
    });

    Widgets.Item(Widgets.GalleryGroup, {
        name: 'gallery-r2c3f',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/composites/gallery/gallery-r2c3f.png',
        widget: Widgets.GalleryWidgetFactory({
            rows: 2, cols: 3, dock: 'above', padding: '15px', align: 'center', color: '#FFFFFF',
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

    Widgets.Item(Widgets.GalleryGroup, {
        name: 'gallery-r3c2r',
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/composites/gallery/gallery-r3c2r.png',
        widget: Widgets.GalleryWidgetFactory({
            rows: 3, cols: 2, dock: 'right', padding: '15px', align: 'left', color: '#333333',
            border: {
                spacing: '20px',
            },
            items: {
                style: {
                    width: '100%',
                    height: '140px',
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

})(jQuery, Vue, Core, Widgets);

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
            stereotype: { value: stereotype },
            inner: {
                value: {
                    padding: { value: '15px 15px' },
                }
            },
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

(function($, Vue, Core, Widgets) {

    Widgets.StackCanvasWidget =
    Widgets.Widget(Widgets.StackGroup, Widgets.create({
        name: 'default-stack-canvas',
        tag: 'default-stack-canvas',
        mixins: [ Widgets.CanvasMixin, Widgets.SizeMixin ],
        widgets: [],
    }));

    Widgets.Item(Widgets.StackGroup, {
        hidden: true,
        name: 'stack-canvas',
        widget: Widgets.build(Widgets.StackCanvasWidget),
    });

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
        mixins: [ Core.WidgetMixin, Core.StackedMixin ],
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
            inner: {
                value: {
                    margin: { value: '15px 15px' },
                }
            },
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
            inner: {
                value: {
                    margin: { value: '15px 15px' },
                }
            },
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
            inner: {
                value: {
                    margin: { value: '15px 15px' },
                }
            },
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
            inner: {
                value: {
                    margin: { value: '15px 15px' },
                }
            },
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
            inner: {
                value: {
                    margin: { value: '15px 15px' },
                }
            },
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
            inner: {
                value: {
                    margin: { value: '15px 15px' },
                }
            },
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

(function($, Vue, Core) {

    Vue.component('default-placeholder', {
        template: '#default-placeholder',
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

                owner.$http.delete(`/ws/portals/${data.id}`).then(
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

    Landing.Usecases =
    Vue.component('landing-usecases', {
        template: '#landing-usecases',
    });

})(jQuery, Vue, Core, Shell, Landing);

(function($, Vue, Core, Shell, Landing) {

    Landing.Super =
    Vue.component('landing-super', {
        template: '#landing-super',
    });

})(jQuery, Vue, Core, Shell, Landing);

(function($, Vue, Core, Shell, Landing) {

    Landing.Video =
    Vue.component('landing-video', {
        template: '#landing-video',
    });

})(jQuery, Vue, Core, Shell, Landing);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiY29tcG9uZW50cy9lZGl0b3IuanMiLCJjb21wb25lbnRzL2Zvcm0uanMiLCJjb21wb25lbnRzL2lubGluZS5qcyIsImNvbXBvbmVudHMvbWl4aW5zLmpzIiwiY29tcG9uZW50cy9tb2RhbC5qcyIsImNvbXBvbmVudHMvc29ydGFibGUuanMiLCJkaXJlY3RpdmVzL2FmZml4LmpzIiwiZGlyZWN0aXZlcy9jb21iby5qcyIsImRpcmVjdGl2ZXMvZGF0ZS5qcyIsImRpcmVjdGl2ZXMvcmljaC5qcyIsImRpcmVjdGl2ZXMvc2Nyb2xsYWJsZS5qcyIsImRpcmVjdGl2ZXMvdGFncy5qcyIsImhvb2tzL21vZGFsLmpzIiwiZmlsdGVycy9pbmRleC5qcyIsInBsdWdpbnMvY29udGFpbmVyLmpzIiwidmFsaWRhdG9ycy9lbWFpbC5qcyIsImVkaXRvci9iaW5kaW5ncy9iaW5kaW5ncy5qcyIsImVkaXRvci9kb21haW5zL2RvbWFpbnMuanMiLCJlZGl0b3IvcGFnZXMvcGFnZXMuanMiLCJlZGl0b3Ivc2NoZW1lcy9zY2hlbWVzLmpzIiwiZWRpdG9yL3BhcmFtcy9wYXJhbXMuanMiLCJlZGl0b3Ivc2V0dGluZ3Mvc2V0dGluZ3MuanMiLCJlZGl0b3Ivc3RvcmFnZXMvc3RvcmFnZXMuanMiLCJzaGVsbC9hY3Rpb25zL2FjdGlvbnMuanMiLCJzaGVsbC9jYXRlZ29yaWVzL2NhdGVnb3JpZXMuanMiLCJzaGVsbC9jb250YWluZXIvY29udGFpbmVyLmpzIiwic2hlbGwvYnJhbmQvYnJhbmQuanMiLCJzaGVsbC9kZWNvcmF0b3IvZGVjb3JhdG9yLmpzIiwic2hlbGwvZG9tYWlucy9kb21haW5zLmpzIiwic2hlbGwvbG9hZGVyL2xvYWRlci5qcyIsInNoZWxsL3BhZ2UvcGFnZS5qcyIsInNoZWxsL3BhZ2VzL3BhZ2VzLmpzIiwic2hlbGwvcGFsZXR0ZS9wYWxldHRlLmpzIiwic2hlbGwvc291cmNlcy9zb3VyY2VzLmpzIiwic2hlbGwvc2hlbGwvc2hlbGwuanMiLCJzaGVsbC93aWRnZXQvd2lkZ2V0LmpzIiwic2hlbGwvc3RvcmFnZXMvc3RvcmFnZXMuanMiLCJzaGVsbC90YXJnZXQvdGFyZ2V0LmpzIiwiZWRpdG9yL3BhZ2VzL3dpZGdldHMvd2lkZ2V0cy5qcyIsImVkaXRvci9wYWdlcy9zb3VyY2VzL3NvdXJjZXMuanMiLCJ3aWRnZXRzLmpzIiwid2lkZ2V0cy9wYWxldHRlLmpzIiwid2lkZ2V0cy93aWRnZXRzLmpzIiwid2lkZ2V0cy9jb21wb3NpdGVzL3BhbGV0dGUuanMiLCJ3aWRnZXRzL2NvbnRhaW5lci9wYWxldHRlLmpzIiwid2lkZ2V0cy90ZXh0L3BhbGV0dGUuanMiLCJ3aWRnZXRzL2Zvcm0vcGFsZXR0ZS5qcyIsIndpZGdldHMvdXRpbHMvcGFsZXR0ZS5qcyIsIndpZGdldHMvY29tcG9zaXRlcy9jYXJvdXNlbC9jYXJvdXNlbC5qcyIsIndpZGdldHMvY29tcG9zaXRlcy9nYWxsZXJ5L2dhbGxlcnkuanMiLCJ3aWRnZXRzL2NvbXBvc2l0ZXMvZ2FsbGVyeS9wYWxldHRlLmpzIiwid2lkZ2V0cy90ZXh0L3RleHQvcGFsZXR0ZS5qcyIsIndpZGdldHMvdGV4dC90ZXh0L3RleHQuanMiLCJ3aWRnZXRzL2Zvcm0vYnV0dG9uL2J1dHRvbi5qcyIsIndpZGdldHMvZm9ybS9idXR0b24vcGFsZXR0ZS5qcyIsIndpZGdldHMvY29udGFpbmVyL3N0YWNrL3BhbGV0dGUuanMiLCJ3aWRnZXRzL2NvbnRhaW5lci9zdGFjay9zdGFjay5qcyIsIndpZGdldHMvZm9ybS9jaGVjay9jaGVjay5qcyIsIndpZGdldHMvZm9ybS9jaGVjay9wYWxldHRlLmpzIiwid2lkZ2V0cy9mb3JtL3JhZGlvL3BhbGV0dGUuanMiLCJ3aWRnZXRzL2Zvcm0vcmFkaW8vcmFkaW8uanMiLCJ3aWRnZXRzL2Zvcm0vaW5wdXQvaW5wdXQuanMiLCJ3aWRnZXRzL2Zvcm0vaW5wdXQvcGFsZXR0ZS5qcyIsIndpZGdldHMvdXRpbHMvYm94L2JveC5qcyIsIndpZGdldHMvdXRpbHMvc3R1Yi9wYWxldHRlLmpzIiwid2lkZ2V0cy91dGlscy9zdHViL3N0dWIuanMiLCJ3aWRnZXRzL3V0aWxzL3BsYWNlaG9sZGVyL3BsYWNlaG9sZGVyLmpzIiwic2VydmljZXMvcG9ydGFscy5qcyIsInNlcnZpY2VzL3NlY3VyaXR5LmpzIiwibGFuZGluZy9sYW5kaW5nLmpzIiwibGFuZGluZy9hY2NvdW50L2FjY291bnQuanMiLCJsYW5kaW5nL2JlbmVmaXRzL2JlbmVmaXRzLmpzIiwibGFuZGluZy9mZWVkYmFjay9mZWVkYmFjay5qcyIsImxhbmRpbmcvZm9vdGVyL2Zvb3Rlci5qcyIsImxhbmRpbmcvY29udGFjdHMvY29udGFjdHMuanMiLCJsYW5kaW5nL2dhbGxlcnkvZ2FsbGVyeS5qcyIsImxhbmRpbmcvaGVhZGVyL2hlYWRlci5qcyIsImxhbmRpbmcvbWFuYWdlL21hbmFnZS5qcyIsImxhbmRpbmcvcHJpY2luZy9wcmljaW5nLmpzIiwibGFuZGluZy9zdG9yYWdlL3N0b3JhZ2UuanMiLCJsYW5kaW5nL3VzZWNhc2VzL3VzZWNhc2VzLmpzIiwibGFuZGluZy9zdXBlci9zdXBlci5qcyIsImxhbmRpbmcvdmlkZW8vdmlkZW8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDblFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FoQlBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBaUJYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNWhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9QQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzd3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FuRVJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FvRTVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEVBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIExhbmRpbmcgPVxyXG4oZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIExhbmRpbmcgPSB7fTtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgJCgnW2RhdGEtdnVlLWFwcF0nKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgZGF0YSA9ICQoZWxlbWVudCkuZGF0YSgpO1xyXG5cclxuICAgICAgICAgICAgdmFyIEFwcCA9IFZ1ZS5leHRlbmQoe1xyXG4gICAgICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdzZWN1cml0eScsIENvcmUuU2VjdXJpdHlGYWN0b3J5KHRoaXMpKTtcclxuICAgICAgICAgICAgICAgICAgICBWdWUuc2VydmljZSgncG9ydGFscycsIENvcmUuUG9ydGFsc0ZhY3RvcnkodGhpcykpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgcm91dGVyID0gbmV3IFZ1ZVJvdXRlcih7XHJcbiAgICAgICAgICAgICAgICBoaXN0b3J5OiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJvdXRlci5iZWZvcmVFYWNoKGZ1bmN0aW9uKHRyYW5zaXRpb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodHJhbnNpdGlvbi50by5hdXRoICYmICFyb3V0ZXIuYXBwLnByaW5jaXBhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb24uYWJvcnQoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHJhbnNpdGlvbi50by5hbm9uICYmIHJvdXRlci5hcHAucHJpbmNpcGFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbi5hYm9ydCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uLm5leHQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgcm91dGVzID0ge1xyXG4gICAgICAgICAgICAgICAgJy8nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBMYW5kaW5nLkxhbmRpbmdQYWdlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICcvZ2FsbGVyeSc6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IExhbmRpbmcuTGFuZGluZ0dhbGxlcnlQYWdlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICcvc3RvcmFnZSc6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IExhbmRpbmcuTGFuZGluZ1N0b3JhZ2VQYWdlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICcvc2lnbmluJzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nU2lnbmluUGFnZSxcclxuICAgICAgICAgICAgICAgICAgICBhbm9uOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICcvc2lnbnVwJzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nU2lnbnVwUGFnZSxcclxuICAgICAgICAgICAgICAgICAgICBhbm9uOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICcvbWFuYWdlJzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nTWFuYWdlUGFnZSxcclxuICAgICAgICAgICAgICAgICAgICBhdXRoOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICcvbWFuYWdlLWNyZWF0ZSc6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IExhbmRpbmcuTGFuZGluZ01hbmFnZUNyZWF0ZVBhZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAnL3NpdGUvOnBvcnRhbC86cGFnZSc6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IFNoZWxsLlNoZWxsUHVibGljLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgJy9tYW5hZ2UvOnBvcnRhbCc6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IFNoZWxsLkxvYWRlcixcclxuICAgICAgICAgICAgICAgICAgICBhdXRoOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHByaXZhdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgJy9tYW5hZ2UvOnBvcnRhbC86cGFnZSc6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IFNoZWxsLkxvYWRlcixcclxuICAgICAgICAgICAgICAgICAgICBhdXRoOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHByaXZhdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY3JlYXRlUm91dGUocGFnZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IFNoZWxsLlNoZWxsUHVibGljLmV4dGVuZCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlOiBwYWdlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGRhdGEubW9kZWwpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5tb2RlbC5wYWdlcy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFnZSA9IGRhdGEubW9kZWwucGFnZXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgcm91dGVzW3BhZ2UubmFtZV0gPSBjcmVhdGVSb3V0ZShwYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcm91dGVyLm1hcChyb3V0ZXMpO1xyXG5cclxuICAgICAgICAgICAgcm91dGVyLnN0YXJ0KEFwcCwgJCgnW2RhdGEtdnVlLWJvZHldJywgZWxlbWVudCkuZ2V0KDApKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBMYW5kaW5nO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcclxuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSkge1xyXG5cclxuICAgIENvcmUuVGFic01peGluID0gZnVuY3Rpb24oYWN0aXZlKSB7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcblxyXG4gICAgICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFiczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmU6IGFjdGl2ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgICAgICAgICBhY3RpdmF0ZTogZnVuY3Rpb24odGFiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJzLmFjdGl2ZSA9IHRhYjtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgaXNBY3RpdmU6IGZ1bmN0aW9uKHRhYikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRhYnMuYWN0aXZlID09IHRhYjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBDb3JlLkFjdGlvbk1peGluID0gZnVuY3Rpb24oTW9kYWxFZGl0b3IpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxyXG4gICAgICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICAgICAgY29udGV4dDogT2JqZWN0LFxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbWV0aG9kczoge1xyXG5cclxuICAgICAgICAgICAgICAgIG9wZW46IGZ1bmN0aW9uKGNvbnRleHQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRpYWxvZyA9IG5ldyBNb2RhbEVkaXRvcih7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxzOiB0aGlzLmdsb2JhbHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvd25lcjogdGhpcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQgfHwgdGhpcy5jb250ZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IHRoaXMubW9kZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm93bmVyLmRvQXBwbHkodGhpcy5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pLiRtb3VudCgpLiRhcHBlbmRUbygkKCdib2R5JykuZ2V0KDApKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgZG9BcHBseTogZnVuY3Rpb24obW9kZWwpIHtcblxyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShtb2RlbCkpLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hY3Rpb246IHRoaXMubW9kZWwuX2FjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyB0aGlzLm1vZGVsLl9hY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ3VwZGF0ZSdcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ3Jlc2l6ZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcblxyXG4gICAgQ29yZS5FZGl0b3JNaXhpbiA9IGZ1bmN0aW9uKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKSB7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcblxyXG4gICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBtZXRob2RzOiB7XHJcblxyXG4gICAgICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGl0ZW0sIGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRpYWxvZyA9IG5ldyBNb2RhbEVkaXRvcih7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxzOiB0aGlzLmdsb2JhbHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvd25lcjogdGhpcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbDogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IGl0ZW0gPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW0pKSA6IHt9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3duZXIuZG9DcmVhdGUodGhpcy5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pLiRtb3VudCgpLiRhcHBlbmRUbygkKCdib2R5JykuZ2V0KDApKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kb1JlbW92ZShpdGVtLCBjb250ZXh0KTtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgdXBkYXRlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gaXRlbTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IE1vZGFsRWRpdG9yKHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiBpdGVtLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudDogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShpdGVtKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vd25lci5kb1VwZGF0ZSh0aGlzLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldDogIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KS4kbW91bnQoKS4kYXBwZW5kVG8oJCgnYm9keScpLmdldCgwKSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIGRvQ3JlYXRlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaChPYmplY3QuYXNzaWduKHt9LCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW0pKSwgeyBfYWN0aW9uOiAnY3JlYXRlJyB9KSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnaXRlbXMnLCAkLmV4dGVuZCh0cnVlLCBbXSwgdGhpcy5pdGVtcykpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBkb1VwZGF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xuXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5hY3RpdmUsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiB0aGlzLmFjdGl2ZS5fYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyB0aGlzLmFjdGl2ZS5fYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLml0ZW1zID0gJC5leHRlbmQodHJ1ZSwgW10sIHRoaXMuaXRlbXMpOy8vdGhpcy5pdGVtcy5zbGljZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zID0gdGhpcy5pdGVtcy5zbGljZSgpO1xuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gbnVsbDtcblxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygndXBkYXRlJywgaXRlbSwgY29udGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLiRzZXQoJ2FjdGl2ZScsIE9iamVjdC5hc3NpZ24oSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShpdGVtKSksIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgX2FjdGlvbjogdGhpcy5hY3RpdmUuX2FjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgPyB0aGlzLmFjdGl2ZS5fYWN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICA6ICd1cGRhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gLy8gdGhpcy5pdGVtcyA9ICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKTsvL3RoaXMuaXRlbXMuc2xpY2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuJHNldCgnaXRlbXMnLCAkLmV4dGVuZCh0cnVlLCBbXSwgdGhpcy5pdGVtcykpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gJCh3aW5kb3cpLnRyaWdnZXIoJ3Jlc2l6ZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuYWN0aXZlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgZG9SZW1vdmU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5pdGVtcy5pbmRleE9mKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLml0ZW1zW2luZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uX2FjdGlvbiA9PSAnY3JlYXRlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcy4kcmVtb3ZlKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5fYWN0aW9uID0gJ3JlbW92ZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuaXRlbXMgPSAkLmV4dGVuZCh0cnVlLCBbXSwgdGhpcy5pdGVtcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdpdGVtcycsICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBldmVudHM6IHtcclxuICAgICAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24oZGF0YSkgeyB0aGlzLmNyZWF0ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXHJcbiAgICAgICAgICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy51cGRhdGUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxyXG4gICAgICAgICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMucmVtb3ZlKGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcclxuICAgICAgICAgICAgICAgIGRvQ3JlYXRlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMuZG9DcmVhdGUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxyXG4gICAgICAgICAgICAgICAgZG9VcGRhdGU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy5kb1VwZGF0ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXHJcbiAgICAgICAgICAgICAgICBkb1JlbW92ZTogZnVuY3Rpb24oZGF0YSkgeyB0aGlzLmRvUmVtb3ZlKGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG5cclxuICAgIENvcmUuTGlzdFZpZXdlck1peGluID0ge1xyXG5cclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHsgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTsgfSxcclxuICAgICAgICAgICAgY3JlYXRlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7IHRoaXMuJGRpc3BhdGNoKCdjcmVhdGUnLCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHR9ICk7IH0sXHJcbiAgICAgICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkgeyB0aGlzLiRkaXNwYXRjaCgndXBkYXRlJywgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0fSApOyB9LFxyXG4gICAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHsgdGhpcy4kZGlzcGF0Y2goJ3JlbW92ZScsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dH0gKTsgfSxcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIENvcmUuTW9kYWxFZGl0b3JNaXhpbiA9IHtcclxuXHJcbiAgICAgICAgYXR0YWNoZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgJCh0aGlzLiRlbCkubW9kYWwoJ3Nob3cnKTtcclxuICAgICAgICAgICAgJCh0aGlzLiRlbCkub24oJ2hpZGUuYnMubW9kYWwnLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZGV0YWNoZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKHRoaXMuJGVsKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHt9LFxyXG4gICAgICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7fVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSk7XHJcbiIsIi8vIFZ1ZS5jb21wb25lbnQoJ3YtZm9ybScsIHtcclxuLy9cclxuLy8gXHRwcm9wczoge1xyXG4vLyBcdFx0YWN0aW9uOiBTdHJpbmcsXHJcbi8vIFx0XHRtZXRob2Q6IFN0cmluZyxcclxuLy8gXHRcdGluaXQ6IE9iamVjdCxcclxuLy8gXHRcdGRvbmU6IEZ1bmN0aW9uLFxyXG4vLyBcdFx0ZmFpbDogRnVuY3Rpb24sXHJcbi8vIFx0XHRtb2RlbDogT2JqZWN0LFxyXG4vLyBcdH0sXHJcbi8vXHJcbi8vIFx0Ly8gcmVwbGFjZTogZmFsc2UsXHJcbi8vXHJcbi8vIFx0Ly8gdGVtcGxhdGU6IGBcclxuLy8gXHQvLyBcdDxmb3JtPlxyXG4vLyBcdC8vIFx0XHQ8c2xvdD48L3Nsb3Q+XHJcbi8vIFx0Ly8gXHQ8L2Zvcm0+XHJcbi8vIFx0Ly8gYCxcclxuLy9cclxuLy8gXHRhY3RpdmF0ZTogZnVuY3Rpb24oZG9uZSkge1xyXG4vL1xyXG4vLyBcdFx0dGhpcy5vcmlnaW5hbCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCkpO1xyXG4vL1xyXG4vLyBcdFx0JCh0aGlzLiRlbClcclxuLy9cclxuLy8gXHRcdFx0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xyXG4vLyBcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuLy8gXHRcdFx0XHR0aGlzLnN1Ym1pdCgpO1xyXG4vLyBcdFx0XHR9KVxyXG4vLyBcdFx0XHQub24oJ3Jlc2V0JywgKGUpID0+IHtcclxuLy8gXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcbi8vIFx0XHRcdFx0dGhpcy5yZXNldCgpO1xyXG4vLyBcdFx0XHR9KVxyXG4vL1xyXG4vLyBcdFx0ZG9uZSgpO1xyXG4vLyBcdH0sXHJcbi8vXHJcbi8vIFx0ZGF0YTogZnVuY3Rpb24oKSB7XHJcbi8vXHJcbi8vIFx0XHRyZXR1cm4ge1xyXG4vLyBcdFx0XHRtb2RlbDogdGhpcy5tb2RlbFxyXG4vLyBcdFx0fTtcclxuLy8gXHR9LFxyXG4vL1xyXG4vLyBcdG1ldGhvZHM6IHtcclxuLy9cclxuLy8gXHRcdHN1Ym1pdDogZnVuY3Rpb24oKSB7XHJcbi8vXHJcbi8vIFx0XHRcdC8vIGUucHJldmVudERlZmF1bHQoKTtcclxuLy9cclxuLy8gXHRcdFx0Ly8gY29uc29sZS5sb2codGhpcy5tb2RlbCk7XHJcbi8vXHJcbi8vIFx0XHRcdCQuYWpheCh7XHJcbi8vIFx0XHRcdFx0dXJsOiB0aGlzLmFjdGlvbixcclxuLy8gXHRcdFx0XHRtZXRob2Q6IHRoaXMubWV0aG9kLFxyXG4vLyBcdFx0XHRcdGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuLy8gXHRcdFx0XHRkYXRhOiBKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKVxyXG4vLyBcdFx0XHR9KVxyXG4vLyBcdFx0XHQuZG9uZSgoZCkgPT4ge1xyXG4vLyBcdFx0XHRcdGlmIChkb25lIGluIHRoaXMpIHRoaXMuZG9uZShkKTtcclxuLy8gXHRcdFx0fSlcclxuLy8gXHRcdFx0LmZhaWwoZnVuY3Rpb24oZSkgeyBpZiAoZmFpbCBpbiB0aGlzKSB0aGlzLmZhaWwoZSk7IH0uYmluZCh0aGlzKSlcclxuLy8gXHRcdH0sXHJcbi8vXHJcbi8vIFx0XHRyZXNldDogZnVuY3Rpb24oKSB7XHJcbi8vIFx0XHRcdE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgdGhpcy5vcmlnaW5hbCk7XHJcbi8vIFx0XHR9XHJcbi8vIFx0fSxcclxuLy8gfSk7XHJcbiIsIi8vIFZ1ZS5jb21wb25lbnQoJ2lubGluZS10ZXh0JyxcclxuLy8gXHRWdWUuZXh0ZW5kKHtcclxuLy8gXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJyBdLFxyXG4vLyBcdFx0dGVtcGxhdGU6IGBcclxuLy8gXHRcdFx0PGRpdiBjbGFzcz1cImlubGluZS1jb250YWluZXJcIj5cclxuLy8gXHRcdFx0XHQ8aW5wdXQgY2xhc3M9XCJpbmxpbmUtY29udHJvbFwiIHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIiAvPlxyXG4vLyBcdFx0XHQ8L2Rpdj5cclxuLy8gXHRcdGBcclxuLy8gXHR9KVxyXG4vLyApO1xyXG4vL1xyXG4vLyBWdWUuY29tcG9uZW50KCdpbmxpbmUtY2hlY2tib3gnLFxyXG4vLyBcdFZ1ZS5leHRlbmQoe1xyXG4vLyBcdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnIF0sXHJcbi8vIFx0XHR0ZW1wbGF0ZTogYFxyXG4vLyBcdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxyXG4vLyBcdFx0XHRcdDxpbnB1dCBjbGFzcz1cImlubGluZS1jaGVja2JveFwiIHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCIgLz5cclxuLy8gXHRcdFx0PC9kaXY+XHJcbi8vIFx0XHRgXHJcbi8vIFx0fSlcclxuLy8gKTtcclxuLy9cclxuLy8gVnVlLmNvbXBvbmVudCgnaW5saW5lLXNlbGVjdCcsXHJcbi8vIFx0VnVlLmV4dGVuZCh7XHJcbi8vIFx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScsICdvcHRpb25zJyBdLFxyXG4vLyBcdFx0dGVtcGxhdGU6IGBcclxuLy8gXHRcdFx0PGRpdiBjbGFzcz1cImlubGluZS1jb250YWluZXJcIj5cclxuLy8gXHRcdFx0XHQ8c2VsZWN0IGNsYXNzPVwiaW5saW5lLWNvbnRyb2wxXCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIj5cclxuLy8gXHRcdFx0XHRcdDxvcHRpb24gdi1mb3I9XCJvcHRpb24gaW4gb3B0aW9uc1wiIHZhbHVlPVwie3sgb3B0aW9uLmtleSB9fVwiPnt7IG9wdGlvbi52YWx1ZSB9fTwvb3B0aW9uPlxyXG4vLyBcdFx0XHRcdDwvc2VsZWN0PlxyXG4vLyBcdFx0XHQ8L2Rpdj5cclxuLy8gXHRcdGBcclxuLy8gXHR9KVxyXG4vLyApO1xyXG4vL1xyXG4vLyBWdWUuY29tcG9uZW50KCdpbmxpbmUtdmFsdWUnLFxyXG4vLyBcdFZ1ZS5leHRlbmQoe1xyXG4vLyBcdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnLCAnY2xhc3MnIF0sXHJcbi8vIFx0XHR0ZW1wbGF0ZTogYFxyXG4vLyBcdFx0XHQ8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCIgLz5cclxuLy8gXHRcdFx0PHNwYW4gOmNsYXNzPVwiY2xhc3NcIj57eyB2YWx1ZSB9fTwvc3Bhbj5cclxuLy8gXHRcdGBcclxuLy8gXHR9KVxyXG4vLyApO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XHJcblxyXG4gICAgQ29yZS5XaWRnZXRNaXhpbiA9IHtcclxuXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0b3JhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RhY2s6IE9iamVjdCxcclxuICAgICAgICAgICAgYmluZGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgY2hpbGRyZW46IEFycmF5LFxyXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBkYXRhOiAgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBzeXN0ZW1JZDogdGhpcy5zeXN0ZW1JZCxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yYW5kb21JZCA9IFZ1ZS5zZXJ2aWNlKCdwYWxldHRlJykuZ2VuZXJhdGVJZCgnd2lkZ2V0LScpO1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETyDQo9GB0YLQsNC90L7QstC40YLRjCDRgNCw0LfQvNC10YDRiyDRgNC+0LTQuNGC0LXQu9GM0YHQutC+0Lkg0Y/Rh9C10LnQutC4XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnYmluZGluZ3MuaWQnLCBmdW5jdGlvbih2YWx1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3lzdGVtSWQgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zeXN0ZW1JZCA9IHRoaXMucmFuZG9tSWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgQ29yZS5TdGFja2VkTWl4aW4gPSB7XHJcblxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0b3JhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXHJcbiAgICAgICAgICAgIGNoaWxkcmVuOiBBcnJheSxcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHN0YWNrSWQ6IHRoaXMuc3RhY2tJZCxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgdGhpcy5zdGFja0lkID0gVnVlLnNlcnZpY2UoJ3BhbGV0dGUnKS5nZW5lcmF0ZUlkKCdzdGFjay0nKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xyXG4iLCIvLyBWdWUuY29tcG9uZW50KCdtb2RhbCcsIHtcclxuLy9cclxuLy8gICAgIHByb3BzOiB7XHJcbi8vICAgICAgICAgaWQ6IFN0cmluZyxcclxuLy8gICAgICAgICBjdXJyZW50OiBPYmplY3QsXHJcbi8vICAgICAgICAgb3JpZ2luYWw6IE9iamVjdCxcclxuLy8gICAgIH0sXHJcbi8vXHJcbi8vICAgICBtZXRob2RzOiB7XHJcbi8vXHJcbi8vICAgICAgICAgc3VibWl0OiBmdW5jdGlvbihlKSB7XHJcbi8vICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKCdzdWJtaXQnLCB0aGlzLmN1cnJlbnQpO1xyXG4vLyAgICAgICAgICAgICAvLyBPYmplY3QuYXNzaWduKHRoaXMub3JpZ2luYWwsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5jdXJyZW50KSkpO1xyXG4vLyAgICAgICAgICAgICAkKGUudGFyZ2V0KS5jbG9zZXN0KCcubW9kYWwnKS5tb2RhbCgnaGlkZScpO1xyXG4vLyAgICAgICAgIH0sXHJcbi8vXHJcbi8vICAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKGUpIHtcclxuLy8gICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goJ3Jlc2V0JywgdGhpcy5jdXJyZW50KTtcclxuLy8gICAgICAgICAgICAgLy8gT2JqZWN0LmFzc2lnbih0aGlzLmN1cnJlbnQsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5vcmlnaW5hbCkpKTtcclxuLy8gICAgICAgICAgICAgJChlLnRhcmdldCkuY2xvc2VzdCgnLm1vZGFsJykubW9kYWwoJ2hpZGUnKTtcclxuLy8gICAgICAgICB9XHJcbi8vICAgICB9XHJcbi8vIH0pO1xyXG4iLCIoZnVuY3Rpb24gKCQsIHdpbmRvdywgcGx1Z2luTmFtZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgdmFyIGRlZmF1bHRzID0ge1xyXG5cclxuICAgICAgICBkcmFnOiB0cnVlLFxyXG4gICAgICAgIGRyb3A6IHRydWUsXHJcbiAgICAgICAgdmVydGljYWw6IHRydWUsXHJcblxyXG4gICAgICAgIGNvbnRhaW5lclNlbGVjdG9yOiBcIm9sLCB1bFwiLFxyXG4gICAgICAgIGl0ZW1TZWxlY3RvcjogXCJsaVwiLFxyXG4gICAgICAgIGV4Y2x1ZGVTZWxlY3RvcjogXCJcIixcclxuXHJcbiAgICAgICAgYm9keUNsYXNzOiBcImRyYWdnaW5nXCIsXHJcbiAgICAgICAgYWN0aXZlQ2xhc3M6IFwiYWN0aXZlXCIsXHJcbiAgICAgICAgZHJhZ2dlZENsYXNzOiBcImRyYWdnZWRcIixcclxuICAgICAgICB2ZXJ0aWNhbENsYXNzOiBcInZlcnRpY2FsXCIsXHJcbiAgICAgICAgaG9yaXNvbnRhbENsYXNzOiBcImhvcmlzb250YWxcIixcclxuICAgICAgICBwbGFjZWhvbGRlckNsYXNzOiBcInBsYWNlaG9sZGVyXCIsXHJcblxyXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnPGxpIGNsYXNzPVwicGxhY2Vob2xkZXJcIj48L2xpPicsXHJcblxyXG4gICAgICAgIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbihjb250ZXh0LCBldmVudCwgX3N1cGVyKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgc2l6ZSA9IHtcclxuICAgICAgICAgICAgICAgIGhlaWdodDogY29udGV4dC4kaXRlbS5vdXRlckhlaWdodCgpLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6IGNvbnRleHQuJGl0ZW0ub3V0ZXJXaWR0aCgpLFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgY29udGV4dC4kb3JpZ2luYWxJdGVtID0gY29udGV4dC4kaXRlbTtcclxuXHJcbiAgICAgICAgICAgIGNvbnRleHQuJGl0ZW0gPSBjb250ZXh0LiRvcmlnaW5hbEl0ZW1cclxuICAgICAgICAgICAgICAgIC5jbG9uZSgpXHJcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoY29udGV4dC5zb3J0YWJsZS5vcHRpb25zLmRyYWdnZWRDbGFzcylcclxuICAgICAgICAgICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IGV2ZW50LnBhZ2VYIC0gY29udGV4dC5hZGp1c3RtZW50LmxlZnQsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBldmVudC5wYWdlWSAtIGNvbnRleHQuYWRqdXN0bWVudC50b3AsXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHNpemUud2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBzaXplLmhlaWdodCxcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYXBwZW5kVG8oY29udGV4dC4kcGFyZW50KVxyXG4gICAgICAgICAgICA7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb25EcmFnOiBmdW5jdGlvbihjb250ZXh0LCBldmVudCwgX3N1cGVyKSB7XHJcblxyXG4gICAgICAgICAgICBjb250ZXh0LiRpdGVtLmNzcyh7XHJcbiAgICAgICAgICAgICAgICBsZWZ0OiBldmVudC5wYWdlWCAtIGNvbnRleHQuYWRqdXN0bWVudC5sZWZ0LFxyXG4gICAgICAgICAgICAgICAgdG9wOiBldmVudC5wYWdlWSAtIGNvbnRleHQuYWRqdXN0bWVudC50b3AsXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgb25Ecm9wOiBmdW5jdGlvbihjb250ZXh0LCBldmVudCwgX3N1cGVyKSB7XHJcblxyXG4gICAgICAgICAgICBjb250ZXh0LiRpdGVtLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICBpZiAoY29udGV4dC5sb2NhdGlvbikge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnRleHQuJGl0ZW0gPSBjb250ZXh0LmxvY2F0aW9uLmJlZm9yZVxyXG4gICAgICAgICAgICAgICAgICAgID8gY29udGV4dC4kaXRlbS5pbnNlcnRCZWZvcmUoY29udGV4dC5sb2NhdGlvbi4kaXRlbSlcclxuICAgICAgICAgICAgICAgICAgICA6IGNvbnRleHQuJGl0ZW0uaW5zZXJ0QWZ0ZXIoY29udGV4dC5sb2NhdGlvbi4kaXRlbSlcclxuICAgICAgICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LiRpdGVtLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvcDogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJycsXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0sXHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBjb250ZXh0ID0gbnVsbDtcclxuICAgIHZhciBzb3J0YWJsZXMgPSBbXTtcclxuXHJcbiAgICBmdW5jdGlvbiBTb3J0YWJsZSgkZWxlbWVudCwgb3B0aW9ucykge1xyXG5cclxuICAgICAgICB0aGlzLiRlbGVtZW50ID0gJGVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgJGVsZW1lbnQub24oJ21vdXNlZG93bi5zb3J0YWJsZScsIHRoaXMub3B0aW9ucy5pdGVtU2VsZWN0b3IsIChlKSA9PiB7IHRoaXMuaGFuZGxlU3RhcnQoZSk7IH0pO1xyXG5cclxuICAgICAgICB0aGlzLmRyYWdnYWJsZSA9IG51bGw7XHJcblxyXG4gICAgICAgIHNvcnRhYmxlcy5wdXNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoZG9jdW1lbnQpXHJcbiAgICAgICAgICAgIC5vbignbW91c2V1cC5zb3J0YWJsZScsIChlKSA9PiB7IGNvbnRleHQgJiYgY29udGV4dC5zb3J0YWJsZS5oYW5kbGVFbmQoZSwgY29udGV4dCk7IH0pXHJcbiAgICAgICAgICAgIC5vbignbW91c2Vtb3ZlLnNvcnRhYmxlJywgKGUpID0+IHsgY29udGV4dCAmJiBjb250ZXh0LnNvcnRhYmxlLmhhbmRsZURyYWcoZSwgY29udGV4dCk7IH0pXHJcbiAgICAgICAgO1xyXG4gICAgfSk7XHJcblxyXG4gICAgU29ydGFibGUucHJvdG90eXBlID0ge1xyXG5cclxuICAgICAgICBkcm9wTG9jYXRpb246IGZ1bmN0aW9uKGUpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciAkaXRlbTtcclxuICAgICAgICAgICAgdmFyIHNvcnRhYmxlO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNvbnRleHQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZGlzcGxheSA9IGNvbnRleHQuJGl0ZW0uY3NzKCdkaXNwbGF5Jyk7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LiRpdGVtLmNzcyh7IGRpc3BsYXk6ICdub25lJywgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzb3J0YWJsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcyA9IHNvcnRhYmxlc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocy5vcHRpb25zLmRyb3ApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHJlc3VsdCA9ICQoZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChlLnBhZ2VYLCBlLnBhZ2VZKSkuY2xvc2VzdChzLm9wdGlvbnMuaXRlbVNlbGVjdG9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRyZXN1bHQubGVuZ3RoICYmICRyZXN1bHQuY2xvc2VzdChzLiRlbGVtZW50KS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpdGVtID0gJHJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlID0gcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnRleHQuJGl0ZW0uY3NzKHsgZGlzcGxheTogZGlzcGxheSwgfSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc29ydGFibGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSBzb3J0YWJsZXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHMub3B0aW9ucy5kcm9wKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRyZXN1bHQgPSAkKGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZS5wYWdlWCwgZS5wYWdlWSkpLmNsb3Nlc3Qocy5vcHRpb25zLml0ZW1TZWxlY3Rvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkcmVzdWx0Lmxlbmd0aCAmJiAkcmVzdWx0LmNsb3Nlc3Qocy4kZWxlbWVudCkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaXRlbSA9ICRyZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZSA9IHM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHNvcnRhYmxlICYmICRpdGVtICYmICRpdGVtLmxlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciAkY29udGFpbmVyID0gJGl0ZW0uY2xvc2VzdChzb3J0YWJsZS5vcHRpb25zLmNvbnRhaW5lclNlbGVjdG9yKTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gJGl0ZW0ub2Zmc2V0KCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2l6ZSA9IHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogJGl0ZW0ub3V0ZXJXaWR0aCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJGl0ZW0ub3V0ZXJIZWlnaHQoKSxcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIG9yaWVudGF0aW9uID0gdGhpcy5vcHRpb25zLnZlcnRpY2FsXHJcbiAgICAgICAgICAgICAgICAgICAgPyAkY29udGFpbmVyLmhhc0NsYXNzKHNvcnRhYmxlLm9wdGlvbnMuaG9yaXNvbnRhbENsYXNzKSA/ICdoJyA6ICd2J1xyXG4gICAgICAgICAgICAgICAgICAgIDogJGNvbnRhaW5lci5oYXNDbGFzcyhzb3J0YWJsZS5vcHRpb25zLnZlcnRpY2FsQ2xhc3MpID8gJ3YnIDogJ2gnXHJcbiAgICAgICAgICAgICAgICA7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGJlZm9yZSA9IChvcmllbnRhdGlvbiA9PSAnaCcpXHJcbiAgICAgICAgICAgICAgICAgICAgPyBlLnBhZ2VYIC0gb2Zmc2V0LmxlZnQgPCBzaXplLndpZHRoIC8gMlxyXG4gICAgICAgICAgICAgICAgICAgIDogZS5wYWdlWSAtIG9mZnNldC50b3AgPCBzaXplLmhlaWdodCAvIDJcclxuICAgICAgICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICRpdGVtOiAkaXRlbSxcclxuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyOiAkY29udGFpbmVyLFxyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlOiBzb3J0YWJsZSxcclxuICAgICAgICAgICAgICAgICAgICBiZWZvcmU6IGJlZm9yZSxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGhhbmRsZVN0YXJ0OiBmdW5jdGlvbihlKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmV4Y2x1ZGVTZWxlY3RvciAmJiAkKGUudGFyZ2V0KS5jbG9zZXN0KHRoaXMub3B0aW9ucy5leGNsdWRlU2VsZWN0b3IpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBleGNsdWRlVGFncyA9IFsnVEVYVEFSRUEnLCAnSU5QVVQnLCAnQlVUVE9OJywgJ0xBQkVMJ107XHJcblxyXG4gICAgICAgICAgICBpZiAoZXhjbHVkZVRhZ3MuaW5kZXhPZigkKGUudGFyZ2V0KS5wcm9wKFwidGFnTmFtZVwiKSkgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIWNvbnRleHQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgJGl0ZW0gPSAkKGUudGFyZ2V0KS5jbG9zZXN0KHRoaXMub3B0aW9ucy5pdGVtU2VsZWN0b3IpO1xyXG4gICAgICAgICAgICAgICAgdmFyICRwYXJlbnQgPSAkaXRlbS5wYXJlbnQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gJGl0ZW0ub2Zmc2V0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZTogdGhpcyxcclxuICAgICAgICAgICAgICAgICAgICBpbmRleDogJGl0ZW0uaW5kZXgoKSxcclxuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyOiAkaXRlbS5jbG9zZXN0KHRoaXMub3B0aW9ucy5jb250YWluZXJTZWxlY3RvciksXHJcbiAgICAgICAgICAgICAgICAgICAgJHBhcmVudDogJGl0ZW0ucGFyZW50KCksXHJcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW06ICRpdGVtLFxyXG4gICAgICAgICAgICAgICAgICAgICRvcmlnaW5hbEl0ZW06ICRpdGVtLFxyXG4gICAgICAgICAgICAgICAgICAgICR0YXJnZXRJdGVtOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICR0YXJnZXRDb250YWluZXI6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb246IHRoaXMuZHJvcExvY2F0aW9uKGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIGFkanVzdG1lbnQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogZS5jbGllbnRYIC0gb2Zmc2V0LmxlZnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogZS5jbGllbnRZIC0gb2Zmc2V0LnRvcCxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMub25EcmFnU3RhcnQoY29udGV4dCwgZSwgZGVmYXVsdHMub25EcmFnU3RhcnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgaGFuZGxlRW5kOiBmdW5jdGlvbihlKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoY29udGV4dCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc29ydGFibGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNvcnRhYmxlID0gc29ydGFibGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICQoc29ydGFibGUub3B0aW9ucy5jb250YWluZXJTZWxlY3Rvciwgc29ydGFibGUuJGVsZW1lbnQpLnJlbW92ZUNsYXNzKHNvcnRhYmxlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0LiRwbGFjZWhvbGRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuJHBsYWNlaG9sZGVyLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnRleHQubG9jYXRpb24gPSB0aGlzLmRyb3BMb2NhdGlvbihlKTtcclxuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0LmxvY2F0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5sb2NhdGlvbi5zb3J0YWJsZS5vcHRpb25zLm9uRHJvcChjb250ZXh0LCBlLCBkZWZhdWx0cy5vbkRyb3ApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LiRpdGVtLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgaGFuZGxlRHJhZzogZnVuY3Rpb24oZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKGNvbnRleHQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvcnRhYmxlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzb3J0YWJsZSA9IHNvcnRhYmxlc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMub3B0aW9ucy5jb250YWluZXJTZWxlY3Rvciwgc29ydGFibGUuJGVsZW1lbnQpLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHQuJHBsYWNlaG9sZGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC4kcGxhY2Vob2xkZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY29udGV4dC5sb2NhdGlvbiA9IHRoaXMuZHJvcExvY2F0aW9uKGUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHQubG9jYXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxvY2F0aW9uLiRjb250YWluZXIuYWRkQ2xhc3MoY29udGV4dC5sb2NhdGlvbi5zb3J0YWJsZS5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LiRwbGFjZWhvbGRlciA9IGNvbnRleHQubG9jYXRpb24uYmVmb3JlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gJChjb250ZXh0LmxvY2F0aW9uLnNvcnRhYmxlLm9wdGlvbnMucGxhY2Vob2xkZXIpLmluc2VydEJlZm9yZShjb250ZXh0LmxvY2F0aW9uLiRpdGVtKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6ICQoY29udGV4dC5sb2NhdGlvbi5zb3J0YWJsZS5vcHRpb25zLnBsYWNlaG9sZGVyKS5pbnNlcnRBZnRlcihjb250ZXh0LmxvY2F0aW9uLiRpdGVtKVxyXG4gICAgICAgICAgICAgICAgICAgIDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LnNvcnRhYmxlLm9wdGlvbnMub25EcmFnKGNvbnRleHQsIGUsIGRlZmF1bHRzLm9uRHJhZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgQVBJID0gJC5leHRlbmQoU29ydGFibGUucHJvdG90eXBlLCB7XHJcblxyXG4gICAgICAgIGVuYWJsZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgJC5mbltwbHVnaW5OYW1lXSA9IGZ1bmN0aW9uKG1ldGhvZE9yT3B0aW9ucykge1xyXG5cclxuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciAkdCA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBvYmplY3QgPSAkdC5kYXRhKHBsdWdpbk5hbWUpXHJcbiAgICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgICAgIGlmIChvYmplY3QgJiYgQVBJW21ldGhvZE9yT3B0aW9uc10pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBBUElbbWV0aG9kT3JPcHRpb25zXS5hcHBseShvYmplY3QsIGFyZ3MpIHx8IHRoaXM7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIW9iamVjdCAmJiAobWV0aG9kT3JPcHRpb25zID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIG1ldGhvZE9yT3B0aW9ucyA9PT0gXCJvYmplY3RcIikpIHtcclxuICAgICAgICAgICAgICAgICR0LmRhdGEocGx1Z2luTmFtZSwgbmV3IFNvcnRhYmxlKCR0LCBtZXRob2RPck9wdGlvbnMpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxufSkoalF1ZXJ5LCB3aW5kb3csICdzb3J0YWJsZScpO1xyXG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5kaXJlY3RpdmUoJ2FmZml4Jywge1xyXG5cclxuICAgICAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoJC5mbi5hZmZpeCkge1xyXG4gICAgICAgICAgICAgICAgJCh0aGlzLmVsKS5hZmZpeCh0aGlzLnZtLiRnZXQodGhpcy5leHByZXNzaW9uKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5kaXJlY3RpdmUoJ2NvbWJvJywge1xyXG5cclxuICAgICAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoJC5mbi50YWdzaW5wdXQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAkKHRoaXMuZWwpLnNlbGVjdDIoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRhZ3M6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgbXVsdGlwbGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZVRhZzogZnVuY3Rpb24gKHBhcmFtcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHBhcmFtcy50ZXJtLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogcGFyYW1zLnRlcm0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdPcHRpb246IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBDb3JlKSB7XHJcblxyXG4gICAgVnVlLmRpcmVjdGl2ZSgnZGF0ZScsIHtcclxuXHJcbiAgICAgICAgYmluZDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKCQuZm4uZGF0ZXBpY2tlcikge1xyXG5cclxuICAgICAgICAgICAgICAgICQodGhpcy5lbCkuZGF0ZXBpY2tlcih7XHJcbiAgICAgICAgICAgICAgICAgICAgYXV0b2Nsb3NlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvZGF5SGlnaGxpZ2h0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdDogXCJ5eXl5LW1tLWRkXCJcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVuYmluZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuZGlyZWN0aXZlKCdyaWNoJywge1xyXG5cclxuICAgICAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAod2luZG93LkNLRURJVE9SKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0b3IgPSBDS0VESVRPUi5pbmxpbmUodGhpcy5lbCwge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlc1NldDogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdCb2xkZXInLCBlbGVtZW50OiAnc3BhbicsIGF0dHJpYnV0ZXM6IHsgJ2NsYXNzJzogJ2V4dHJhYm9sZCd9IH1cclxuICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvb2xiYXJHcm91cHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8geyBuYW1lOiAnY2xpcGJvYXJkJywgICBncm91cHM6IFsgJ2NsaXBib2FyZCcsICd1bmRvJyBdIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHsgbmFtZTogJ2VkaXRpbmcnLCAgICAgZ3JvdXBzOiBbICdmaW5kJywgJ3NlbGVjdGlvbicsICdzcGVsbGNoZWNrZXInIF0gfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnbGlua3MnIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHsgbmFtZTogJ2Zvcm1zJyB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ3Rvb2xzJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnZG9jdW1lbnQnLCBncm91cHM6IFsnbW9kZScsICdkb2N1bWVudCcsICdkb2N0b29scyddfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6ICdvdGhlcnMnfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6ICdwYXJhZ3JhcGgnLCBncm91cHM6IFsnbGlzdCcsICdpbmRlbnQnLCAnYmxvY2tzJywgJ2FsaWduJ119LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ2NvbG9ycyd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnLycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnYmFzaWNzdHlsZXMnLCBncm91cHM6IFsnYmFzaWNzdHlsZXMnLCAnY2xlYW51cCddfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6ICdzdHlsZXMnfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJy8nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdpbnNlcnQnLCBncm91cHM6IFsgJ0ltYWdlQnV0dG9uJyBdICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8ve25hbWU6ICdhYm91dCd9XHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0b3Iub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWRpdG9yLnVwZGF0ZUVsZW1lbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZtLiRzZXQodGhpcy5leHByZXNzaW9uLCAkKHRoaXMuZWwpLnZhbCgpKTtcclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0RGF0YSh0aGlzLnZtLiRnZXQodGhpcy5leHByZXNzaW9uKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3VwZGF0ZScsIG5ld1ZhbHVlLCBvbGRWYWx1ZSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgdGhpcy5lZGl0b3IgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLnRleHRhcmVhID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5kaXJlY3RpdmUoJ3Njcm9sbGFibGUnLCB7XHJcblxyXG4gICAgICAgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgIC8vICQodGhpcy5lbCkuY3NzKHtcclxuICAgICAgICAgICAgLy8gICAgICdvdmVyZmxvdyc6ICdhdXRvJyxcclxuICAgICAgICAgICAgLy8gfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoJC5mbi5wZXJmZWN0U2Nyb2xsYmFyKSB7XHJcbiAgICAgICAgICAgICAgICBWdWUubmV4dFRpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzLmVsKS5wZXJmZWN0U2Nyb2xsYmFyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXhpczogdGhpcy5leHByZXNzaW9uXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBDb3JlKSB7XHJcblxyXG4gICAgVnVlLmRpcmVjdGl2ZSgndGFncycsIHtcclxuXHJcbiAgICAgICAgYmluZDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKCQuZm4udGFnc2lucHV0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgJCh0aGlzLmVsKS50YWdzaW5wdXQoe1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xyXG5cclxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICBmdW5jdGlvbiByZXBvc2l0aW9uKGVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBtb2RhbCA9ICQoZWxlbWVudCksXHJcbiAgICAgICAgICAgICAgICBkaWFsb2cgPSAkKCcubW9kYWwtZGlhbG9nJywgbW9kYWwpO1xyXG5cclxuICAgICAgICAgICAgbW9kYWwuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICAgICAgICAgIGRpYWxvZy5jc3MoXCJtYXJnaW4tdG9wXCIsIE1hdGgubWF4KDAsICgkKHdpbmRvdykuaGVpZ2h0KCkgLSBkaWFsb2cuaGVpZ2h0KCkpIC8gMikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJCgkKGRvY3VtZW50KSwgJy5tb2RhbC5tb2RhbC1jZW50ZXInKS5vbignc2hvdy5icy5tb2RhbCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgcmVwb3NpdGlvbihlLnRhcmdldCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAkKCcubW9kYWwubW9kYWwtY2VudGVyOnZpc2libGUnKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXBvc2l0aW9uKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuZmlsdGVyKCdqc29uUGF0aCcsIGZ1bmN0aW9uIChjb250ZXh0LCBzdHIpIHtcclxuICAgICAgICBpZiAoc3RyID09PSB1bmRlZmluZWQgfHwgY29udGV4dCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciByZSA9IC97KFtefV0rKX0vZztcclxuXHJcbiAgICAgICAgcmVzdWx0ID0gc3RyLnJlcGxhY2UocmUsIGZ1bmN0aW9uKG1hdGNoLCBleHByKSB7XHJcbiAgICAgICAgICAgIGpzb24gPSBKU09OUGF0aCh7XHJcbiAgICAgICAgICAgICAgICBqc29uOiBjb250ZXh0LFxyXG4gICAgICAgICAgICAgICAgcGF0aDogZXhwclxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKGpzb24uaGFzT3duUHJvcGVydHkoMSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnYXJyYXknO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGpzb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKHJlc3VsdCA9PSAnYXJyYXknKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBKU09OUGF0aCh7XHJcbiAgICAgICAgICAgICAgICBqc29uOiBjb250ZXh0LFxyXG4gICAgICAgICAgICAgICAgcGF0aDogc3RyLnJlcGxhY2UocmUsIFwiJDFcIilcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBWdWUuZmlsdGVyKCd0ZW1wbGF0ZScsIGZ1bmN0aW9uIChzdHJpbmcsIGRhdGEpIHtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgcmUgPSAvJHsoW159XSspfS9nO1xyXG4gICAgICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShyZSwgZnVuY3Rpb24obWF0Y2gsIGtleSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0YVtrZXldO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmZpbHRlcignYXNzaWduJywgZnVuY3Rpb24gKHRhcmdldCwgc291cmNlMSwgc291cmNlMiwgc291cmNlMykge1xyXG5cclxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZTEsIHNvdXJjZTIsIHNvdXJjZTMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmZpbHRlcignY29weScsIGZ1bmN0aW9uIChzb3VyY2UpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBWdWUoe1xyXG4gICAgICAgICAgICBkYXRhOiBzb3VyY2UgIT0gbnVsbFxyXG4gICAgICAgICAgICAgICAgPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNvdXJjZSkpXHJcbiAgICAgICAgICAgICAgICA6IG51bGxcclxuICAgICAgICB9KS4kZGF0YTtcclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5maWx0ZXIoJ2Nsb25lJywgZnVuY3Rpb24gKHNvdXJjZSkge1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFZ1ZSh7XHJcbiAgICAgICAgICAgIGRhdGE6IHNvdXJjZSAhPSBudWxsXHJcbiAgICAgICAgICAgICAgICA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc291cmNlKSlcclxuICAgICAgICAgICAgICAgIDogbnVsbFxyXG4gICAgICAgIH0pLiRkYXRhO1xyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XHJcblxyXG4gICAgVnVlLnVzZSh7XHJcblxyXG4gICAgICAgIGluc3RhbGw6IGZ1bmN0aW9uKFZ1ZSwgb3B0aW9ucykge1xyXG5cclxuICAgICAgICAgICAgdmFyIHNlcnZpY2VzID0ge307XHJcblxyXG4gICAgICAgICAgICBWdWUuc2VydmljZSA9IGZ1bmN0aW9uKG5hbWUsIHNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VydmljZXNbbmFtZV0gPSBzZXJ2aWNlc1tuYW1lXSB8fCBzZXJ2aWNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIENvcmUpIHtcclxuXHJcbiAgICBWdWUudmFsaWRhdG9yKCdlbWFpbCcsIGZ1bmN0aW9uICh2YWwpIHtcclxuICAgICAgcmV0dXJuIC9eKChbXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKFxcLltePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSspKil8KFxcXCIuK1xcXCIpKUAoKFxcW1swLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXF0pfCgoW2EtekEtWlxcLTAtOV0rXFwuKStbYS16QS1aXXsyLH0pKSQvLnRlc3QodmFsKVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIHZhciBNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdiaW5kaW5ncy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjYmluZGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgc2V0U3RyYXRlZ3k6IGZ1bmN0aW9uKHN0cmF0ZWd5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2N1cnJlbnQuYmluZGluZy5zdHJhdGVneScsIHN0cmF0ZWd5KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ2V0U3RyYXRlZ3k6IGZ1bmN0aW9uKHN0cmF0ZWd5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy4kZ2V0KCdjdXJyZW50LmJpbmRpbmcuc3RyYXRlZ3knKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuY3VycmVudC5iaW5kaW5nKSB0aGlzLmN1cnJlbnQuYmluZGluZyA9IHt9O1xyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2JpbmRpbmdzJywge1xyXG5cclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkFjdGlvbk1peGluKE1vZGFsRWRpdG9yKV0sXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsKSB7XHJcblxyXG4gICAgdmFyIExpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJyldLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdkb21haW5zJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zJyxcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICB2YXIgU2V0dGluZ3NMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLXNldHRpbmdzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTZXR0aW5nc01vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtc2V0dGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNldHRpbmdzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTZXR0aW5nc0xpc3RWaWV3ZXIsIFNldHRpbmdzTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLXNldHRpbmdzJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIFNoZWxsKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcclxuXHJcbiAgICB2YXIgUGFnZXNNb2RhbEVkaXRvciA9IFNoZWxsLlBhZ2VzLk1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXBhZ2VzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wYWdlcy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJykgXSxcclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHByb3AgPSB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gdGhpcy5jdXJyZW50LnJvb3QucGFyYW1zW3Byb3AubmFtZV07XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogcHJvcCxcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbTogcGFyYW0sXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXRlbXMgPSBpdGVtcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dDogdGhpcy5jb250ZXh0LFxyXG4gICAgICAgICAgICAgICAgaXRlbXM6IHRoaXMuaXRlbXMsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcblxyXG4gICAgICAgICAgICBoYXNQcm9wczogZnVuY3Rpb24odGFiKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb250ZXh0LndpZGdldCAmJiB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcm9wID0gdGhpcy5jb250ZXh0LndpZGdldC5wcm9wc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3AudGFiID09IHRhYikgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcclxuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcclxuXHJcbiAgICB2YXIgTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ21haW4nKV0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihMaXN0Vmlld2VyLCBNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMnLFxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBTZXR0aW5nc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcy1zZXR0aW5ncy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMtc2V0dGluZ3MtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNldHRpbmdzTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcy1zZXR0aW5ncy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1zZXR0aW5ncy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU2V0dGluZ3NFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcy1zZXR0aW5ncycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFNldHRpbmdzTGlzdFZpZXdlciwgU2V0dGluZ3NNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMtc2V0dGluZ3MnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIHZhciBQYXJhbVZhcmlhYmxlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy12YXJpYWJsZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtdmFyaWFibGUnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGlkOiBTdHJpbmcsXHJcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBQYXJhbVN0cmluZyA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtc3RyaW5nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1zdHJpbmcnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGlkOiBTdHJpbmcsXHJcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBQYXJhbVNlbGVjdCA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtc2VsZWN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1zZWxlY3QnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGlkOiBTdHJpbmcsXHJcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBQYXJhbVJpY2ggPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLXJpY2gnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLXJpY2gnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGlkOiBTdHJpbmcsXHJcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBQYXJhbVNvdXJjZSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtc291cmNlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1zb3VyY2UnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGlkOiBTdHJpbmcsXHJcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBQYXJhbU11bHRpcGxlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1tdWx0aXBsZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtbXVsdGlwbGUnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGlkOiBTdHJpbmcsXHJcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtLml0ZW1zXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtT2JqZWN0ID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1vYmplY3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLW9iamVjdCcsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgaWQ6IFN0cmluZyxcclxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBQYXJhbXMgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgb3duZXI6IE9iamVjdCxcclxuICAgICAgICAgICAgdGFiOiBTdHJpbmcsXHJcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBQYXJhbU11bHRpcGxlTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtbXVsdGlwbGUtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtbXVsdGlwbGUtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIHByb3A6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFyYW06IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgZ2V0TGFiZWw6IGZ1bmN0aW9uKGl0ZW0pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wLmRpc3BsYXkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdm0gPSBuZXcgVnVlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdm0uJGludGVycG9sYXRlKHRoaXMucHJvcC5kaXNwbGF5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiAnPGl0ZW0+JztcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgUGFyYW1CaW5kaW5nc01vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1iaW5kaW5ncy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLWJpbmRpbmdzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2JpbmRpbmcnKSBdLFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaXRlbXM6IHRoaXMuaXRlbXMsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgdmFyIGJpbmRpbmcgPSB0aGlzLmN1cnJlbnQuYmluZGluZyB8fCB7fTtcclxuICAgICAgICAgICAgaWYgKCFiaW5kaW5nLnN0cmF0ZWd5KSBiaW5kaW5nLnN0cmF0ZWd5ID0gJ2ludGVycG9sYXRlJztcclxuXHJcbiAgICAgICAgICAgIGJpbmRpbmcucGFyYW1zID0gYmluZGluZy5wYXJhbXMgfHwge307XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5jb250ZXh0LnByb3AucHJvcHMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGV4dC5wcm9wLnByb3BzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9wID0gdGhpcy5jb250ZXh0LnByb3AucHJvcHNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gdGhpcy5jdXJyZW50LnZhbHVlW3Byb3AubmFtZV0gPSB0aGlzLmN1cnJlbnQudmFsdWVbcHJvcC5uYW1lXSB8fCB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyYW0uX2FjdGlvbiA9IHBhcmFtLl9hY3Rpb24gPT0gJ3VwZGF0ZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyAndXBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICA6ICdjcmVhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogcHJvcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW06IHBhcmFtLFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHNldCgnY3VycmVudC5iaW5kaW5nJywgYmluZGluZyk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNldCgnaXRlbXMnLCBpdGVtcyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHNldFN0cmF0ZWd5OiBmdW5jdGlvbihzdHJhdGVneSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdjdXJyZW50LmJpbmRpbmcuc3RyYXRlZ3knLCBzdHJhdGVneSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdldFN0cmF0ZWd5OiBmdW5jdGlvbihzdHJhdGVneSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGdldCgnY3VycmVudC5iaW5kaW5nLnN0cmF0ZWd5Jyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLWJpbmRpbmdzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuQWN0aW9uTWl4aW4oUGFyYW1CaW5kaW5nc01vZGFsRWRpdG9yKV0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgUGFyYW1NdWx0aXBsZU1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1tdWx0aXBsZS1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLW11bHRpcGxlLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignZGF0YScpXSxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLml0ZW1zLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdjcmVhdGVkJywgUGFyYW1NdWx0aXBsZU1vZGFsRWRpdG9yKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuY29udGV4dC5wcm9wKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZXh0LnByb3AucHJvcHMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHRoaXMuY29udGV4dC5wcm9wLnByb3BzW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gdGhpcy5jdXJyZW50W3Byb3AubmFtZV0gPSB0aGlzLmN1cnJlbnRbcHJvcC5uYW1lXSB8fCB7IHZhbHVlOiBudWxsIH07XHJcblxyXG4gICAgICAgICAgICAgICAgcGFyYW0uX2FjdGlvbiA9IHBhcmFtLl9hY3Rpb24gPT0gJ3VwZGF0ZSdcclxuICAgICAgICAgICAgICAgICAgICA/ICd1cGRhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgOiAnY3JlYXRlJ1xyXG4gICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb3A6IHByb3AsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyYW06IHBhcmFtLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhpdGVtKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2l0ZW1zJywgaXRlbXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgUGFyYW1NdWx0aXBsZUVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtbXVsdGlwbGUtZWRpdG9yJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oUGFyYW1NdWx0aXBsZUxpc3RWaWV3ZXIsIFBhcmFtTXVsdGlwbGVNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1tdWx0aXBsZS1lZGl0b3InLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIHByb3A6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFyYW06IE9iamVjdCxcclxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgdmFyIFBhcmFtc0xpc3QgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLWxpc3QnLFxyXG4gICAgICAgIGNvbXBvbmVudHM6IHtcclxuICAgICAgICAgICAgJ3BhcmFtcy1zdHJpbmcnOiBQYXJhbVN0cmluZyxcclxuICAgICAgICAgICAgJ3BhcmFtcy1yaWNoJzogUGFyYW1SaWNoLFxyXG4gICAgICAgICAgICAncGFyYW1zLXNvdXJjZSc6IFBhcmFtU291cmNlLFxyXG4gICAgICAgICAgICAncGFyYW1zLW11bHRpcGxlJzogUGFyYW1NdWx0aXBsZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIG93bmVyOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHRhYjogU3RyaW5nLFxyXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIFNoZWxsKTtcclxuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcclxuXHJcbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2V0dGluZ3MtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NldHRpbmdzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignZG9tYWlucycpXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2V0dGluZ3MnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5BY3Rpb25NaXhpbihNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBwdXNoOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL3NldHRpbmdzL2RvLXVwZGF0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZG9uZSgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgZCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwdWxsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL3NldHRpbmdzJyxcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5kb25lKChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBkKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsKSB7XHJcblxyXG4gICAgdmFyIFN0b3JhZ2VzTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzdG9yYWdlcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3N0b3JhZ2VzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTdG9yYWdlc01vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3N0b3JhZ2VzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzdG9yYWdlcy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBjaGVjazogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY2hlY2snKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTdG9yYWdlc0VkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzdG9yYWdlcycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFN0b3JhZ2VzTGlzdFZpZXdlciwgU3RvcmFnZXNNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3N0b3JhZ2VzJyxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTdG9yYWdlc1ZhcmlhYmxlc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc3RvcmFnZXMtdmFyaWFibGVzLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc3RvcmFnZXMtdmFyaWFibGVzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTdG9yYWdlc1ZhcmlhYmxlc01vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3N0b3JhZ2VzLXZhcmlhYmxlcy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc3RvcmFnZXMtdmFyaWFibGVzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTdG9yYWdlc1ZhcmlhYmxlc0VkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzdG9yYWdlcy12YXJpYWJsZXMnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTdG9yYWdlc1ZhcmlhYmxlc0xpc3RWaWV3ZXIsIFN0b3JhZ2VzVmFyaWFibGVzTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzdG9yYWdlcy12YXJpYWJsZXMnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWFjdGlvbnMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtYWN0aW9ucycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICAvLyBjYXRlZ29yeTogT2JqZWN0LFxyXG4gICAgICAgICAgICAvLyBkb21haW46IE9iamVjdCxcclxuICAgICAgICAgICAgLy8gcGFnZTogT2JqZWN0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1jYXRlZ29yaWVzJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWNhdGVnb3JpZXMnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGNhdGVnb3JpZXM6IEFycmF5LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1jb250YWluZXInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtY29udGFpbmVyJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWJyYW5kJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWJyYW5kJyxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcclxuXHJcbiAgICB2YXIgcnVudGltZSA9IFZ1ZS5zZXJ2aWNlKCdydW50aW1lJywge1xyXG5cclxuICAgICAgICBldmFsdWF0ZTogZnVuY3Rpb24oc2VsZiwgYiwgdikge1xyXG5cclxuICAgICAgICAgICAgaWYgKGIgJiYgYi5leHByZXNzaW9uKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYi5zdHJhdGVneSA9PSAnZXZhbCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gc2VsZi4kZXZhbChiLmV4cHJlc3Npb24pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChiLnN0cmF0ZWd5ID09ICd3aXJlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBzZWxmLiRnZXQoYi5leHByZXNzaW9uKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLiRpbnRlcnBvbGF0ZShiLmV4cHJlc3Npb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2Fubm90IGV2YWx1YXRlIGV4cHJlc3Npb24nLCBiLmV4cHJlc3Npb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdjtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBldmFsdWF0ZVBhcmFtczogZnVuY3Rpb24oc2VsZiwgcHJvcHMsIHBhcmFtcykge1xyXG5cclxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBwcm9wID0gcHJvcHNbaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW0gPSBwYXJhbXMgJiYgcGFyYW1zW3Byb3AubmFtZV07XHJcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wOiBwcm9wLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtOiBwYXJhbSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB7fTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gaXRlbXNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIG4gPSBpdGVtLnByb3AubmFtZTtcclxuICAgICAgICAgICAgICAgIHZhciByID0gaXRlbS5wcm9wLnZhcmlhYmxlO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBiID0gaXRlbS5wYXJhbSA/IGl0ZW0ucGFyYW0uYmluZGluZyA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICB2YXIgdiA9IGl0ZW0ucGFyYW0gPyBpdGVtLnBhcmFtLnZhbHVlIDogbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5wcm9wLnR5cGUgPT0gJ29iamVjdCcpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZ2O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoYiAmJiBiLmV4cHJlc3Npb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlW25dID0gdnY7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzID0gdGhpcy5ldmFsdWF0ZVBhcmFtcyhzZWxmLCBpdGVtLnByb3AucHJvcHMsIHYpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2diA9IHIgPyB7IHZhbHVlOiByZXMgfSA6IHJlcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVbbl0gPSB2djtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVtLnByb3AudHlwZSA9PSAnbXVsdGlwbGUnKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChiICYmIGIuZXhwcmVzc2lvbikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZ2ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhcnJheSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gcnVudGltZS5ldmFsdWF0ZShzZWxmLCBiLCB2KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2diA9IHJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoJC5pc0FycmF5KHJlc3VsdCkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCByZXN1bHQubGVuZ3RoOyBqKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2bSA9IG5ldyBWdWUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogT2JqZWN0LmFzc2lnbihKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNlbGYuJGRhdGEpKSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXg6IGosXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiByZXN1bHRbal0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJheS5wdXNoKHRoaXMuZXZhbHVhdGVQYXJhbXModm0sIGl0ZW0ucHJvcC5wcm9wcywgYi5wYXJhbXMpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZ2ID0gYXJyYXk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhcnJheSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHYubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2aSA9IHZbal07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmkuX2FjdGlvbiAhPSAncmVtb3ZlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5W2luZGV4KytdID0gdGhpcy5ldmFsdWF0ZVBhcmFtcyhzZWxmLCBpdGVtLnByb3AucHJvcHMsIHZpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdnYgPSByID8geyB2YWx1ZTogYXJyYXkgfSA6IGFycmF5O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVbbl0gPSB2djtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgdnYgPSBydW50aW1lLmV2YWx1YXRlKHNlbGYsIGIsIHYpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlW25dID0gdnYgfHwgJyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgRGVjb3JhdG9yTWl4aW4gPSB7XHJcblxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBtZXRob2RzOiB7XHJcblxyXG4gICAgICAgICAgICByZW1vdmVXaWRnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goJ3JlbW92ZUNoaWxkV2lkZ2V0JywgeyBpdGVtOiB0aGlzLm1vZGVsIH0pO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZG9BcHBseTogZnVuY3Rpb24obW9kZWwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobW9kZWwpKSwge1xyXG4gICAgICAgICAgICAgICAgICAgIF9hY3Rpb246IHRoaXMubW9kZWwuX2FjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMubW9kZWwuX2FjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6ICd1cGRhdGUnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBzaG93U2V0dGluZ3M6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBkaWFsb2cgPSBuZXcgU2hlbGwuV2lkZ2V0cy5Nb2RhbEVkaXRvcih7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsczogdGhpcy5nbG9iYWxzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvd25lcjogdGhpcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiB0aGlzLndpZGdldFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbDogdGhpcy5tb2RlbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudDogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKSlcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm93bmVyLmRvQXBwbHkodGhpcy5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pLiRtb3VudCgpLiRhcHBlbmRUbygkKCdib2R5JykuZ2V0KDApKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgQmluZGluZ3NNaXhpbiA9IHtcclxuXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBiaW5kaW5nczogdGhpcy5iaW5kaW5ncyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdkYXRhJywgKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciBiaW5kaW5ncyA9IHJ1bnRpbWUuZXZhbHVhdGVQYXJhbXModGhpcywgdGhpcy53aWRnZXQucHJvcHMsIHRoaXMubW9kZWwucGFyYW1zKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnYmluZGluZ3MnLCBiaW5kaW5ncyk7XHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ3N0b3JhZ2UnLCAoc3RvcmFnZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdmFyIGJpbmRpbmdzID0gcnVudGltZS5ldmFsdWF0ZVBhcmFtcyh0aGlzLCB0aGlzLndpZGdldC5wcm9wcywgdGhpcy5tb2RlbC5wYXJhbXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdiaW5kaW5ncycsIGJpbmRpbmdzKTtcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnbW9kZWwnLCAobW9kZWwpID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciBiaW5kaW5ncyA9IHJ1bnRpbWUuZXZhbHVhdGVQYXJhbXModGhpcywgdGhpcy53aWRnZXQucHJvcHMsIG1vZGVsLnBhcmFtcylcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnYmluZGluZ3MnLCBiaW5kaW5ncyk7XHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdmFyIENvbXBvc2l0ZU1peGluID0ge1xyXG5cclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiB0aGlzLmNoaWxkcmVuLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ2l0ZW1zJywgKGl0ZW1zKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gW107XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gaXRlbXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLl9hY3Rpb24gIT0gJ3JlbW92ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA8IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5wbGFjZWhvbGRlcigpKSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZXZlbnRzOiB7XHJcblxyXG4gICAgICAgICAgICByZW1vdmVDaGlsZFdpZGdldDogZnVuY3Rpb24oZGF0YSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gZGF0YS5pdGVtO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLl9hY3Rpb24gPT0gJ2NyZWF0ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLiRyZW1vdmUoaXRlbSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uX2FjdGlvbiA9ICdyZW1vdmUnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMgPSB0aGlzLml0ZW1zLnNsaWNlKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG5cclxuICAgICAgICAgICAgLy8gZmluZDogZnVuY3Rpb24oY2hpbGRyZW4sIGl0ZW0pIHtcclxuICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgLy8gICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICAgICAgICAgIC8vICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aCAmJiBpbmRleCA8IGRvbUluZGV4OyBpKyspIHtcclxuICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgLy8gICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgLy8gICAgICAgICBpZiAoY2hpbGQuX2FjdGlvbiAhPSAncmVtb3ZlJykge1xyXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAvLyAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgLy8gICAgIHJldHVybiBpbmRleDtcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgIH0sXHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBTb3J0YWJsZU1peGluID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcblxyXG4gICAgICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnNlbGVjdGVkLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGF0dGFjaGVkOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy4kcm91dGUucHJpdmF0ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2hlbGwgPSBWdWUuc2VydmljZSgnc2hlbGwnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy4kd2F0Y2goJ3NlbGVjdGVkJywgZnVuY3Rpb24oc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBpZiAodGhpcy5zb3J0YWJsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgaWYgKHNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgdGhpcy5zb3J0YWJsZS5zb3J0YWJsZShcImRpc2FibGVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIHRoaXMuc29ydGFibGUuc29ydGFibGUoXCJlbmFibGVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdFRhcmdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIHVuc2VsZWN0VGFyZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtZGVjb3JhdG9yLXN0dWInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZGVjb3JhdG9yLXN0dWInLFxyXG4gICAgICAgIG1peGluczogWyBEZWNvcmF0b3JNaXhpbiwgQmluZGluZ3NNaXhpbiBdLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RhY2s6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0b3JhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcclxuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3QsXHJcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxyXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci13aWRnZXQnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZGVjb3JhdG9yLXdpZGdldCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIERlY29yYXRvck1peGluLCBCaW5kaW5nc01peGluIF0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxyXG4gICAgICAgICAgICB3aWRnZXQ6IE9iamVjdCxcclxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXHJcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtZGVjb3JhdG9yLWhvcmlzb250YWwnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZGVjb3JhdG9yLWhvcmlzb250YWwnLFxyXG4gICAgICAgIG1peGluczogWyBEZWNvcmF0b3JNaXhpbiwgQ29tcG9zaXRlTWl4aW4sIFNvcnRhYmxlTWl4aW4oJz4uZ2UuZ2UtY29udGVudCA+LndnLndnLWRlZmF1bHQtc3RhY2sgPi53Zy53Zy1jb250ZW50ID4ud2cud2ctdGFibGUgPi53Zy53Zy1yb3cnKSwgQmluZGluZ3NNaXhpbiBdLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RhY2s6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0b3JhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcclxuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3QsXHJcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxyXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBWdWUuc2VydmljZSgncGFsZXR0ZScpLnBsYWNlaG9sZGVyKGBcclxuICAgICAgICAgICAgICAgICAgICA8c21hbGw+SG9yaXNvbnRhbCBTdGFjazwvc21hbGw+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdj5Ecm9wIEhlcmU8L2Rpdj5cclxuICAgICAgICAgICAgICAgIGApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci12ZXJ0aWNhbCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kZWNvcmF0b3ItdmVydGljYWwnLFxyXG4gICAgICAgIG1peGluczogWyBEZWNvcmF0b3JNaXhpbiwgQ29tcG9zaXRlTWl4aW4sIFNvcnRhYmxlTWl4aW4oJz4uZ2UuZ2UtY29udGVudCA+LndnLndnLWRlZmF1bHQtc3RhY2sgPi53Zy53Zy1jb250ZW50ID4ud2cud2ctdGFibGUnKSwgQmluZGluZ3NNaXhpbiBdLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RhY2s6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0b3JhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcclxuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3QsXHJcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxyXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBWdWUuc2VydmljZSgncGFsZXR0ZScpLnBsYWNlaG9sZGVyKGBcclxuICAgICAgICAgICAgICAgICAgICA8c21hbGw+VmVydGljYWwgU3RhY2s8L3NtYWxsPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXY+RHJvcCBIZXJlPC9kaXY+XHJcbiAgICAgICAgICAgICAgICBgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1kZWNvcmF0b3ItY2FudmFzJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWRlY29yYXRvci1jYW52YXMnLFxyXG4gICAgICAgIG1peGluczogWyBDb21wb3NpdGVNaXhpbiwgU29ydGFibGVNaXhpbignPi5nZS5nZS1jb250ZW50ID4ud2cud2ctZGVmYXVsdC1zdGFjayA+LndnLndnLWNvbnRlbnQgPi53Zy53Zy10YWJsZScpLCBCaW5kaW5nc01peGluIF0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxyXG4gICAgICAgICAgICB3aWRnZXQ6IE9iamVjdCxcclxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXHJcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGF0dGFjaGVkOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBkcmFnZ2VkO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zb3J0YWJsZSA9ICQodGhpcy4kZWwpLnNvcnRhYmxlKHtcclxuXHJcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGRyb3A6IHRydWUsXHJcblxyXG4gICAgICAgICAgICAgICAgY29udGFpbmVyU2VsZWN0b3I6ICcud2cud2ctc29ydGFibGUtY29udGFpbmVyLndnLXNvcnRhYmxlLWVkaXRhYmxlJyxcclxuICAgICAgICAgICAgICAgIGl0ZW1TZWxlY3RvcjogJy53Zy53Zy1zb3J0YWJsZS1pdGVtLndnLXNvcnRhYmxlLWVkaXRhYmxlJyxcclxuICAgICAgICAgICAgICAgIGV4Y2x1ZGVTZWxlY3RvcjogJy5nZS5nZS1vdmVybGF5JyxcclxuXHJcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbENsYXNzOiBcIndnLXNvcnRhYmxlLXZlcnRpY2FsXCIsXHJcbiAgICAgICAgICAgICAgICBob3Jpc29udGFsQ2xhc3M6IFwid2ctc29ydGFibGUtaG9yaXNvbnRhbFwiLFxyXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6IGBcclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwid2cgd2ctc29ydGFibGUtcGxhY2Vob2xkZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIndnIHdnLXBsYWNlaG9sZGVyLWNvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIndnIHdnLXBsYWNlaG9sZGVyLWlubmVyXCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgICAgIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbihjb250ZXh0LCBldmVudCwgX3N1cGVyKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIF9zdXBlcihjb250ZXh0LCBldmVudCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGFjayA9ICQoY29udGV4dC4kY29udGFpbmVyKS5jbG9zZXN0KCcuZ2UuZ2Utd2lkZ2V0JykuZ2V0KDApLl9fdnVlX187XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZ1ZSA9IGNvbnRleHQuJG9yaWdpbmFsSXRlbS5maW5kKCcuZ2UuZ2Utd2lkZ2V0OmZpcnN0JykuZ2V0KDApLl9fdnVlX187XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnZWQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrOiBzdGFjayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW5kZXg6IHN0YWNrLmZpbmQoc3RhY2suaXRlbXMsIGNvbnRleHQuJG9yaWdpbmFsSXRlbS5pbmRleCgpKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXg6IHN0YWNrLml0ZW1zLmluZGV4T2YodnVlLm1vZGVsKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdnVlOiB2dWUsXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbkRyb3A6IGZ1bmN0aW9uKGNvbnRleHQsIGV2ZW50LCBfc3VwZXIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgX3N1cGVyKGNvbnRleHQsIGV2ZW50KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZ1ZSA9IGNvbnRleHQubG9jYXRpb24uJGl0ZW0uZmluZCgnLmdlLmdlLXdpZGdldDpmaXJzdCcpLmdldCgwKS5fX3Z1ZV9fXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdTdGFjayA9IGNvbnRleHQubG9jYXRpb24uJGNvbnRhaW5lci5jbG9zZXN0KCcuZ2UuZ2Utd2lkZ2V0JykuZ2V0KDApLl9fdnVlX187XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG5ld1N0YWNrLCBuZXdTdGFjay5pdGVtcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0luZGV4ID0gbmV3U3RhY2suaXRlbXMuaW5kZXhPZih2dWUubW9kZWwpICsgKGNvbnRleHQubG9jYXRpb24uYmVmb3JlID8gMCA6IDEpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgdyA9IGNvbnRleHQuJGl0ZW0uZGF0YSgnd2lkZ2V0Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3SXRlbSA9IFZ1ZS5zZXJ2aWNlKCdwYWxldHRlJykuaXRlbSh3KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RhY2suaXRlbXMuc3BsaWNlKG5ld0luZGV4LCAwLCBuZXdJdGVtKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkcmFnZ2VkKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2xkU3RhY2sgPSBkcmFnZ2VkLnN0YWNrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2xkSW5kZXggPSBkcmFnZ2VkLmluZGV4O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2xkSXRlbSA9IGRyYWdnZWQudnVlLm1vZGVsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0l0ZW0gPSBPYmplY3QuYXNzaWduKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZHJhZ2dlZC52dWUubW9kZWwpKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob2xkU3RhY2sgIT0gbmV3U3RhY2spIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgbmV3SXRlbS5pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0l0ZW0uX2FjdGlvbiA9ICdjcmVhdGUnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvbGRJdGVtLl9hY3Rpb24gPT0gJ2NyZWF0ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRTdGFjay5pdGVtcy5zcGxpY2Uob2xkSW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRJdGVtLl9hY3Rpb24gPSAncmVtb3ZlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdTdGFjay5pdGVtcy5zcGxpY2UobmV3SW5kZXgsIDAsIG5ld0l0ZW0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdJbmRleCAhPSBvbGRJbmRleCAmJiBuZXdJbmRleCAhPSBvbGRJbmRleCArIDEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdJdGVtLl9hY3Rpb24gPSBvbGRJdGVtLl9hY3Rpb24gPT0gJ2NyZWF0ZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdjcmVhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdJbmRleCA8IG9sZEluZGV4KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZFN0YWNrLml0ZW1zLnNwbGljZShvbGRJbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RhY2suaXRlbXMuc3BsaWNlKG5ld0luZGV4LCAwLCBuZXdJdGVtKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5ld0luZGV4ID4gb2xkSW5kZXgpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RhY2suaXRlbXMuc3BsaWNlKG5ld0luZGV4LCAwLCBuZXdJdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRTdGFjay5pdGVtcy5zcGxpY2Uob2xkSW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbGRTdGFjay5pdGVtcyA9IG9sZFN0YWNrLml0ZW1zLnNsaWNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0YWNrLml0ZW1zID0gbmV3U3RhY2suaXRlbXMuc2xpY2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuJGl0ZW0ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gVnVlLnNlcnZpY2UoJ3BhbGV0dGUnKS5wbGFjZWhvbGRlcihgXHJcbiAgICAgICAgICAgICAgICAgICAgPHNtYWxsPlZlcnRpY2FsIFN0YWNrPC9zbWFsbD5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2PkRyb3AgSGVyZTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRvbWFpbnMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZG9tYWlucycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZG9tYWluczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIFNoZWxsLkxvYWRlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1sb2FkZXInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtbG9hZGVyJyxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHBvcnRhbDogbnVsbCxcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiBudWxsLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3BvcnRhbHMnKS5nZXQoeyBpZDogdGhpcy4kcm91dGUucGFyYW1zLnBvcnRhbCB9KS50aGVuKFxyXG4gICAgICAgICAgICAgICAgKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ3BvcnRhbCcsIGQuZGF0YS5wb3J0YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnc2V0dGluZ3MnLCBkLmRhdGEuc2V0dGluZ3MpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXBhZ2UnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcGFnZScsXHJcbiAgICAgICAgbWl4aW5zOiBbIC8qQ29yZS5Db250YWluZXJNaXhpbiwgQ29yZS5Tb3J0YWJsZU1peGluKi8gXSxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZGVjb3JhdG9yOiB0aGlzLmRlY29yYXRvcixcclxuICAgICAgICAgICAgICAgIGRhdGE6IHRoaXMuZGF0YSxcclxuICAgICAgICAgICAgICAgIHN0b3JhZ2U6IHRoaXMuc3RvcmFnZSxcclxuICAgICAgICAgICAgICAgIHdpZGdldDogdGhpcy53aWRnZXQsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMud2lkZ2V0ID0gVnVlLnNlcnZpY2UoJ3BhbGV0dGUnKS53aWRnZXQoJ2RlZmF1bHQtY29udGFpbmVyL2RlZmF1bHQtY29udGFpbmVyLXN0YWNrL2RlZmF1bHQtc3RhY2stY2FudmFzJyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgcnVudGltZSA9IFZ1ZS5zZXJ2aWNlKCdydW50aW1lJyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmRlY29yYXRvciA9ICdzaGVsbC1kZWNvcmF0b3ItY2FudmFzJztcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0ge307XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcmFnZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ3BhZ2Uuc3RvcmFnZXMnLCAoc3RvcmFnZXMpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RvcmFnZXMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0b3JhZ2UgPSB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdG9yYWdlcy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0ID0gc3RvcmFnZXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JhZ2Vbc3QubmFtZV0gPSB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3QudmFyaWFibGVzLmxlbmd0aDsgaisrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhcmlhYmxlID0gc3QudmFyaWFibGVzW2pdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmFnZVtzdC5uYW1lXVt2YXJpYWJsZS5uYW1lXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcnVudGltZS5ldmFsdWF0ZSh0aGlzLCB2YXJpYWJsZS5iaW5kaW5nLCB2YXJpYWJsZS52YWx1ZSkgfHwgbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdzdG9yYWdlJywgc3RvcmFnZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ3BhZ2Uuc291cmNlcycsIChzb3VyY2VzKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZXMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzb3VyY2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnB1c2godGhpcy5kb1JlcXVlc3Qoc291cmNlc1tpXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlZmVycmVkLmxlbmd0aCA+IDEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQud2hlbi5hcHBseSh0aGlzLCBkZWZlcnJlZCkuZG9uZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbc291cmNlc1tpXS5uYW1lXSA9IGFyZ3VtZW50c1tpXVswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnZGF0YScsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRlZmVycmVkLmxlbmd0aCA9PSAxKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZFswXS5kb25lKGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge307XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW3NvdXJjZXNbMF0ubmFtZV0gPSBkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdkYXRhJywgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIGRvUmVxdWVzdDogZnVuY3Rpb24ocykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHF1ZXJ5ID0ge307XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHMucGFyYW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gcy5wYXJhbXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmFtLmluID09ICdxdWVyeScgJiYgcGFyYW0uc3BlY2lmaWVkKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBwYXJhbS5iaW5kaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyB0aGlzLiRpbnRlcnBvbGF0ZShwYXJhbS5iaW5kaW5nKSAvLyBUT0RPIEludGVycG9sYXRlIGluIHBhZ2UgY29udGV4dFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogcGFyYW0udmFsdWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5W3BhcmFtLm5hbWVdID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogcy5tZXRob2QsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBzLnVybCxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcXVlcnksXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcGFnZXMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcGFnZXMnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIHBhZ2VzOiBBcnJheSxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtcyxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgncGFnZXMnLCAocGFnZXMpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYWdlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYWdlID0gdGhpcy5wYWdlc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFnZS5fYWN0aW9uICE9ICdyZW1vdmUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2gocGFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtcyA9IGl0ZW1zO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0sIHsgZGVlcDogdHJ1ZSwgaW1tZWRpYXRlOiB0cnVlIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcblxyXG4gICAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKHBhZ2UpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLnBhZ2VzLmluZGV4T2YocGFnZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLnBhZ2VzW2luZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5fYWN0aW9uID09ICdjcmVhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFnZXMuJHJlbW92ZShpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLl9hY3Rpb24gPSAncmVtb3ZlJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYWdlcyA9IHRoaXMucGFnZXMuc2xpY2UoKTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMucGFnZXMpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgY3JlYXRlOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgcm9vdCA9IFZ1ZS5zZXJ2aWNlKCdwYWxldHRlJykuaXRlbSgnZGVmYXVsdC1jb250YWluZXIvZGVmYXVsdC1jb250YWluZXItc3RhY2svc3RhY2stY2FudmFzJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgd2lkZ2V0ID0gVnVlLnNlcnZpY2UoJ3BhbGV0dGUnKS53aWRnZXQoJ2RlZmF1bHQtY29udGFpbmVyL2RlZmF1bHQtY29udGFpbmVyLXN0YWNrL2RlZmF1bHQtc3RhY2stY2FudmFzJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHBhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogJ2NyZWF0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcm9vdDogcm9vdCxcclxuICAgICAgICAgICAgICAgICAgICBzb3VyY2VzOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICBzdG9yYWdlczogW10sXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBkaWFsb2cgPSBuZXcgU2hlbGwuUGFnZXMuTW9kYWxFZGl0b3Ioe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3duZXI6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogd2lkZ2V0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbDogcGFnZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudDogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShwYWdlKSksXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5vcmlnaW5hbCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmN1cnJlbnQpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9yaWdpbmFsLl9hY3Rpb24gPSB0aGlzLm9yaWdpbmFsLl9hY3Rpb24gPyB0aGlzLm9yaWdpbmFsLl9hY3Rpb24gOiAnY3JlYXRlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3JpZ2luYWwucm9vdC5fYWN0aW9uID0gdGhpcy5vcmlnaW5hbC5yb290Ll9hY3Rpb24gPyB0aGlzLm9yaWdpbmFsLnJvb3QuX2FjdGlvbiA6ICdjcmVhdGUnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3duZXIucGFnZXMucHVzaCh0aGlzLm9yaWdpbmFsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KS4kbW91bnQoKS4kYXBwZW5kVG8oJCgnYm9keScpLmdldCgwKSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHVwZGF0ZTogZnVuY3Rpb24ocGFnZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciB3aWRnZXQgPSBWdWUuc2VydmljZSgncGFsZXR0ZScpLndpZGdldCgnZGVmYXVsdC1jb250YWluZXIvZGVmYXVsdC1jb250YWluZXItc3RhY2svZGVmYXVsdC1zdGFjay1jYW52YXMnKTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZGlhbG9nID0gbmV3IFNoZWxsLlBhZ2VzLk1vZGFsRWRpdG9yKHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxzOiB0aGlzLmdsb2JhbHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQ6IHdpZGdldCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IHBhZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocGFnZSkpXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5vcmlnaW5hbCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmN1cnJlbnQpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9yaWdpbmFsLl9hY3Rpb24gPSB0aGlzLm9yaWdpbmFsLl9hY3Rpb24gPyB0aGlzLm9yaWdpbmFsLl9hY3Rpb24gOiAndXBkYXRlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3JpZ2luYWwucm9vdC5fYWN0aW9uID0gdGhpcy5vcmlnaW5hbC5yb290Ll9hY3Rpb24gPyB0aGlzLm9yaWdpbmFsLnJvb3QuX2FjdGlvbiA6ICd1cGRhdGUnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3duZXIucGFnZXMgPSB0aGlzLm93bmVyLnBhZ2VzLnNsaWNlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSkuJG1vdW50KCkuJGFwcGVuZFRvKCQoJ2JvZHknKS5nZXQoMCkpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgaXRlbSwgY29udGV4dCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XHJcblxyXG4gICAgdmFyIFBhbGV0dGVJdGVtID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXBhbGV0dGUtaXRlbScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wYWxldHRlLWl0ZW0nLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBPYmplY3QsXHJcbiAgICAgICAgICAgIGdyb3VwOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wYWxldHRlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXBhbGV0dGUnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICAgICAgY2F0ZWdvcnk6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcmllczogdGhpcy5jYXRlZ29yaWVzXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb21wb25lbnRzOiB7XHJcbiAgICAgICAgICAgICdwYWxldHRlLWl0ZW0nOiBQYWxldHRlSXRlbVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2F0ZWdvcmllcyA9IFdpZGdldHMuUGFsZXR0ZS5jYXRlZ29yaWVzKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhdHRhY2hlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNvcnRhYmxlID0gJCh0aGlzLiRlbCkuc29ydGFibGUoe1xyXG4gICAgICAgICAgICAgICAgZ3JvdXA6ICd3aWRnZXRzJyxcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lclNlbGVjdG9yOiAnLndnLXNvcnRhYmxlLWNvbnRhaW5lcicsXHJcbiAgICAgICAgICAgICAgICBpdGVtU2VsZWN0b3I6ICcud2ctc29ydGFibGUtaXRlbScsXHJcbiAgICAgICAgICAgICAgICBkcm9wOiBmYWxzZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtc291cmNlcycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1zb3VyY2VzJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBzb3VyY2VzOiBBcnJheSxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XHJcblxyXG4gICAgU2hlbGwuU2hlbGwgPSB7XHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsczogdGhpcy5nbG9iYWxzLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdsb2JhbHMgPSB7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb246IHtcclxuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBwYWdlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBzdG9yYWdlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzLFxyXG4gICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWwsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcblxyXG4gICAgU2hlbGwuU2hlbGxQdWJsaWMgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcHVibGljJywge1xyXG4gICAgICAgIG1peGluczogWyBTaGVsbC5TaGVsbCBdLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXB1YmxpYycsXHJcbiAgICB9KTtcclxuXHJcbiAgICBTaGVsbC5TaGVsbFByaXZhdGUgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcHJpdmF0ZScsIHtcclxuXHJcbiAgICAgICAgbWl4aW5zOiBbIFNoZWxsLlNoZWxsIF0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcHJpdmF0ZScsXHJcblxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zY2FsZSA9IDE7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiByZWxldmFudChjdXJyZW50LCBjb2xsZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFjdXJyZW50IHx8IGN1cnJlbnQuX2FjdGlvbiA9PSAncmVtb3ZlJyB8fCAoY29sbGVjdGlvbiAmJiBjb2xsZWN0aW9uLmluZGV4T2YoY3VycmVudCkgPCAwKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29sbGVjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbGxlY3Rpb24ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjID0gY29sbGVjdGlvbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjLl9hY3Rpb24gIT0gJ3JlbW92ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQgJiYgY3VycmVudC5fYWN0aW9uID09ICdyZW1vdmUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uY2F0ZWdvcnkgPSBWdWUuc2VydmljZSgncGFsZXR0ZScpLmNhdGVnb3JpZXMoKVswXTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdtb2RlbC5kb21haW5zJywgKGRvbWFpbnMpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uZG9tYWluID0gcmVsZXZhbnQodGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5kb21haW4sIGRvbWFpbnMpO1xyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ21vZGVsLnBhZ2VzJywgKHBhZ2VzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnBhZ2UgPSByZWxldmFudCh0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnBhZ2UsIHBhZ2VzKTtcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdnbG9iYWxzLnNlbGVjdGlvbi5wYWdlLnNvdXJjZXMnLCAoc291cmNlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5zb3VyY2UgPSByZWxldmFudCh0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnNvdXJjZSwgc291cmNlcyk7XHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnZ2xvYmFscy5zZWxlY3Rpb24ucGFnZS5zdG9yYWdlcycsIChzdG9yYWdlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5zdG9yYWdlID0gcmVsZXZhbnQodGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5zdG9yYWdlLCBzdG9yYWdlcyk7XHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXZlbnRzOiB7XHJcbiAgICAgICAgICAgIHpvb21JbjogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zY2FsZSArPSAwLjE7XHJcbiAgICAgICAgICAgICAgICAkKCcuZ2UuZ2UtcGFnZScsIHRoaXMuJGVsKS5jc3MoJ3RyYW5zZm9ybScsICdzY2FsZSgnICsgdGhpcy5zY2FsZSArICcpJyk7XHJcbiAgICAgICAgICAgICAgICAkKCcuZ2UuZ2UtY29udGFpbmVyJywgdGhpcy4kZWwpLnBlcmZlY3RTY3JvbGxiYXIoJ3VwZGF0ZScpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB6b29tT3V0OiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjYWxlIC09IDAuMTtcclxuICAgICAgICAgICAgICAgICQoJy5nZS5nZS1wYWdlJywgdGhpcy4kZWwpLmNzcygndHJhbnNmb3JtJywgJ3NjYWxlKCcgKyB0aGlzLnNjYWxlICsgJyknKTtcclxuICAgICAgICAgICAgICAgICQoJy5nZS5nZS1jb250YWluZXInLCB0aGlzLiRlbCkucGVyZmVjdFNjcm9sbGJhcigndXBkYXRlJyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHB1bGw6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBgL3dzL3BvcnRhbHMvJHt0aGlzLm1vZGVsLmlkfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZG9uZSgoZCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdtb2RlbCcsIGQucG9ydGFsKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHB1c2g6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBgL3dzL3BvcnRhbHMvJHt0aGlzLm1vZGVsLmlkfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5kb25lKChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdtb2RlbCcsIGQucG9ydGFsKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNlbGVjdENhdGVnb3J5OiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLmNhdGVnb3J5ID0gZGF0YS5pdGVtO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZWxlY3REb21haW46IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uZG9tYWluID0gZGF0YS5pdGVtO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZWxlY3RQYWdlOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnBhZ2UgPSBkYXRhLml0ZW07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNlbGVjdFNvdXJjZTogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5zb3VyY2UgPSBkYXRhLml0ZW07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNlbGVjdFN0b3JhZ2U6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uc3RvcmFnZSA9IGRhdGEuaXRlbTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XHJcblxyXG4gICAgU2hlbGwuV2lkZ2V0ID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXdpZGdldCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC13aWRnZXQnLFxyXG4gICAgICAgIG1peGluczogWyAvKiBDb3JlLkRlY29yYXRvck1peGluLCBDb3JlLkNvbnRhaW5lck1peGluLCBDb3JlLlNvcnRhYmxlTWl4aW4sIENvcmUuQmluZGluZ3NNaXhpbiAqLyBdLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxyXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxyXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0b3JhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5kZWNvcmF0b3JzID0ge1xyXG4gICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ2RlZmF1bHQtc3RhY2staG9yaXNvbnRhbCc6ICdzaGVsbC1kZWNvcmF0b3ItaG9yaXNvbnRhbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2RlZmF1bHQtc3RhY2stdmVydGljYWwnOiAnc2hlbGwtZGVjb3JhdG9yLXZlcnRpY2FsJyxcclxuICAgICAgICAgICAgICAgICAgICAnZGVmYXVsdC1zdHViJzogJ3NoZWxsLWRlY29yYXRvci1zdHViJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBmYWxsYmFjazogJ3NoZWxsLWRlY29yYXRvci13aWRnZXQnLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgcGFsZXR0ZSA9IFZ1ZS5zZXJ2aWNlKCdwYWxldHRlJyk7XHJcbiAgICAgICAgICAgIHRoaXMud2lkZ2V0ID0gcGFsZXR0ZS53aWRnZXQodGhpcy5tb2RlbC5uYW1lKTtcclxuICAgICAgICAgICAgdGhpcy5kZWNvcmF0b3IgPSB0aGlzLmRlY29yYXRvcnMuYWx0ZXJuYXRpdmVzW3RoaXMud2lkZ2V0LnRhZ10gfHwgdGhpcy5kZWNvcmF0b3JzLmZhbGxiYWNrO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgd2lkZ2V0OiB0aGlzLndpZGdldCxcclxuICAgICAgICAgICAgICAgIGRlY29yYXRvcjogdGhpcy5kZWNvcmF0b3IsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1zdG9yYWdlcycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1zdG9yYWdlcycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgc3RvcmFnZXM6IEFycmF5LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC10YXJnZXQnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtdGFyZ2V0JyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsKSB7XHJcblxyXG4gICAgdmFyIFdpZGdldHNNb2RhbEVkaXRvciA9IFNoZWxsLldpZGdldHMuTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtd2lkZ2V0cy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtd2lkZ2V0cy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2RhdGEnKV0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZXh0LndpZGdldC5wcm9wcy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBwcm9wID0gdGhpcy5jb250ZXh0LndpZGdldC5wcm9wc1tpXTtcclxuICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHRoaXMuY3VycmVudC5wYXJhbXNbcHJvcC5uYW1lXTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wOiBwcm9wLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtOiBwYXJhbSxcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5pdGVtcyA9IGl0ZW1zO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0OiB0aGlzLmNvbnRleHQsXHJcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtcyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgICAgIGhhc1Byb3BzOiBmdW5jdGlvbih0YWIpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbnRleHQud2lkZ2V0ICYmIHRoaXMuY29udGV4dC53aWRnZXQucHJvcHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByb3AgPSB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvcC50YWIgPT0gdGFiKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsKSB7XHJcblxyXG4gICAgdmFyIFNvdXJjZXNMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTb3VyY2VzTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBjaGVjazogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY2hlY2snKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTb3VyY2VzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTb3VyY2VzTGlzdFZpZXdlciwgU291cmNlc01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcycsXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU291cmNlc1BhcmFtc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1wYXJhbXMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLXBhcmFtcy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU291cmNlc1BhcmFtc01vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLXBhcmFtcy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU291cmNlc1BhcmFtc0VkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLXBhcmFtcycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFNvdXJjZXNQYXJhbXNMaXN0Vmlld2VyLCBTb3VyY2VzUGFyYW1zTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLXBhcmFtcycsXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCk7XHJcbiIsInZhciBXaWRnZXRzID1cclxuKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFdpZGdldHMgPSB7fTtcclxuXHJcbiAgICBXaWRnZXRzLlBhbGV0dGUgPSAoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHZhciBtYXAgPSB7fTtcclxuICAgICAgICB2YXIgYXJyID0gW107XHJcblxyXG4gICAgICAgIHZhciB3aWRnZXRzID0ge307XHJcblxyXG4gICAgICAgIHZhciBjYXRlZ29yaWVzID0gZnVuY3Rpb24oKSB7IHJldHVybiBhcnI7IH1cclxuICAgICAgICB2YXIgY2F0ZWdvcnkgPSBmdW5jdGlvbihuLCBjYXRlZ29yeSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKG4gaW4gbWFwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWFwW25dO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnkubmFtZSA9IG47XHJcbiAgICAgICAgICAgICAgICBtYXBbbl0gPSBjYXRlZ29yeTtcclxuICAgICAgICAgICAgICAgIGFyci5wdXNoKGNhdGVnb3J5KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgd2lkZ2V0ID0gZnVuY3Rpb24ocGF0aCkge1xyXG4gICAgICAgICAgICB2YXIgc2VnbWVudHMgPSBwYXRoLnNwbGl0KCcvJyk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNhdGVnb3J5KHNlZ21lbnRzWzBdKS5ncm91cChzZWdtZW50c1sxXSkud2lkZ2V0KHNlZ21lbnRzWzJdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBpdGVtID0gZnVuY3Rpb24ocGF0aCkge1xyXG4gICAgICAgICAgICB2YXIgc2VnbWVudHMgPSBwYXRoLnNwbGl0KCcvJyk7XHJcbiAgICAgICAgICAgIHZhciB3ID0gJC5leHRlbmQodHJ1ZSwge30sIHRoaXMuY2F0ZWdvcnkoc2VnbWVudHNbMF0pLmdyb3VwKHNlZ21lbnRzWzFdKS5pdGVtKHNlZ21lbnRzWzJdKS53aWRnZXQsIHtcclxuICAgICAgICAgICAgICAgIF9hY3Rpb246ICdjcmVhdGUnLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZGVsZXRlIHcucHJvcHM7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB3LnRhYnM7XHJcbiAgICAgICAgICAgIHJldHVybiB3O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVJZChwcmVmaXgpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBBTFBIQUJFVCA9ICcwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWic7XHJcbiAgICAgICAgICAgIHZhciBJRF9MRU5HVEggPSA4O1xyXG5cclxuICAgICAgICAgICAgdmFyIHJ0biA9ICcnO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IElEX0xFTkdUSDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBydG4gKz0gQUxQSEFCRVQuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIEFMUEhBQkVULmxlbmd0aCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBwcmVmaXggPyBwcmVmaXggKyBydG4gOiBydG47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBjYXRlZ29yaWVzLFxyXG4gICAgICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnksXHJcbiAgICAgICAgICAgIHdpZGdldDogd2lkZ2V0LFxyXG4gICAgICAgICAgICBpdGVtOiBpdGVtLFxyXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogZnVuY3Rpb24oY29udGVudCkgeyByZXR1cm4gV2lkZ2V0cy5TdHViV2lkZ2V0RmFjdG9yeShjb250ZW50KSB9LFxyXG4gICAgICAgICAgICBnZW5lcmF0ZUlkOiBnZW5lcmF0ZUlkLFxyXG4gICAgICAgIH07XHJcbiAgICB9KSgpO1xyXG5cclxuICAgIFdpZGdldHMuQ2F0ZWdvcnkgPSBmdW5jdGlvbihuYW1lLCB0aXRsZSwgaWdub3JlKSB7XHJcblxyXG4gICAgICAgIHZhciBtYXAgPSB7fTtcclxuICAgICAgICB2YXIgYXJyID0gW107XHJcblxyXG4gICAgICAgIHZhciBncm91cHMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGFycjsgfVxyXG4gICAgICAgIHZhciBncm91cCA9IGZ1bmN0aW9uKG4sIGdyb3VwKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAobiBpbiBtYXApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBtYXBbbl07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBncm91cC5uYW1lID0gYCR7bmFtZX0vJHtufWA7XHJcbiAgICAgICAgICAgICAgICBtYXBbbl0gPSBncm91cDtcclxuICAgICAgICAgICAgICAgIGFyci5wdXNoKGdyb3VwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBXaWRnZXRzLlBhbGV0dGUuY2F0ZWdvcnkobmFtZSwge1xyXG4gICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgIGdyb3VwczogZ3JvdXBzLFxyXG4gICAgICAgICAgICBncm91cDogZ3JvdXAsXHJcbiAgICAgICAgICAgIGlnbm9yZTogaWdub3JlLFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gV2lkZ2V0cy5QYWxldHRlLmNhdGVnb3J5KG5hbWUpO1xyXG4gICAgfTtcclxuXHJcbiAgICBXaWRnZXRzLkdyb3VwID0gZnVuY3Rpb24oY2F0ZWdvcnksIG5hbWUsIHRpdGxlKSB7XHJcblxyXG4gICAgICAgIHZhciBtYXAgPSB7fTtcclxuICAgICAgICB2YXIgYXJyID0gW107XHJcblxyXG4gICAgICAgIHZhciBpdGVtcyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJyOyB9XHJcbiAgICAgICAgdmFyIGl0ZW0gPSBmdW5jdGlvbihuLCBpdGVtKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAobiBpbiBtYXApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBtYXBbbl07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLm5hbWUgPSBgJHt0aGlzLm5hbWV9LyR7bn1gO1xyXG4gICAgICAgICAgICAgICAgbWFwW25dID0gaXRlbTtcclxuICAgICAgICAgICAgICAgIGFyci5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB3X21hcCA9IHt9O1xyXG4gICAgICAgIHZhciB3X2FyciA9IFtdO1xyXG5cclxuICAgICAgICB2YXIgd2lkZ2V0cyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gd19hcnI7IH1cclxuICAgICAgICB2YXIgd2lkZ2V0ID0gZnVuY3Rpb24obiwgd2lkZ2V0KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAobiBpbiB3X21hcCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHdfbWFwW25dO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgd2lkZ2V0Lm5hbWUgPSBgJHt0aGlzLm5hbWV9LyR7bn1gO1xyXG4gICAgICAgICAgICAgICAgd19tYXBbbl0gPSB3aWRnZXQ7XHJcbiAgICAgICAgICAgICAgICB3X2Fyci5wdXNoKHdpZGdldCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2F0ZWdvcnkuZ3JvdXAobmFtZSwge1xyXG4gICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgIGl0ZW1zOiBpdGVtcyxcclxuICAgICAgICAgICAgaXRlbTogaXRlbSxcclxuICAgICAgICAgICAgd2lkZ2V0czogd2lkZ2V0cyxcclxuICAgICAgICAgICAgd2lkZ2V0OiB3aWRnZXQsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBjYXRlZ29yeS5ncm91cChuYW1lKTtcclxuICAgIH07XHJcblxyXG4gICAgV2lkZ2V0cy5XaWRnZXQgPSBmdW5jdGlvbihncm91cCwgY29uZmlnKSB7XHJcblxyXG4gICAgICAgIHZhciBuYW1lID0gY29uZmlnLm5hbWU7XHJcblxyXG4gICAgICAgIGdyb3VwLndpZGdldChjb25maWcubmFtZSwgY29uZmlnKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGdyb3VwLndpZGdldChuYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBXaWRnZXRzLmNsb25lID0gZnVuY3Rpb24ob3JpZ2luYWwpIHtcclxuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvcmlnaW5hbCkpO1xyXG4gICAgfVxyXG5cclxuICAgIFdpZGdldHMuY3JlYXRlID0gZnVuY3Rpb24oY29uZmlnKSB7XHJcblxyXG4gICAgICAgIHZhciByZXN1bHQgPSB7XHJcbiAgICAgICAgICAgIG5hbWU6IGNvbmZpZy5uYW1lLFxyXG4gICAgICAgICAgICB0YWc6IGNvbmZpZy50YWcsXHJcbiAgICAgICAgICAgIHdpZGdldHM6IGNvbmZpZy53aWRnZXRzLFxyXG4gICAgICAgICAgICB0YWJzOiBbXSxcclxuICAgICAgICAgICAgcHJvcHM6IFtdLFxyXG4gICAgICAgICAgICBwYXJhbXM6IHt9LFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmICgnX2FjdGlvbicgaW4gY29uZmlnKSByZXN1bHQuX2FjdGlvbiA9IGNvbmZpZy5fYWN0aW9uO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiB2aXNpdCh3LCBtKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAobS5vdmVycmlkZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICgndGFicycgaW4gbSkgdy50YWJzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShtLnRhYnMpKTtcclxuICAgICAgICAgICAgICAgIGlmICgncHJvcHMnIGluIG0pIHcucHJvcHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG0ucHJvcHMpKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCd0YWJzJyBpbiBtKSB3LnRhYnMgPSB3LnRhYnMuY29uY2F0KG0udGFicyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoJ3Byb3BzJyBpbiBtKSB3LnByb3BzID0gdy5wcm9wcy5jb25jYXQobS5wcm9wcyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29uZmlnLm1peGlucykge1xyXG5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb25maWcubWl4aW5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbSA9IGNvbmZpZy5taXhpbnNbaV07XHJcbiAgICAgICAgICAgICAgICB2aXNpdChyZXN1bHQsIG0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2aXNpdChyZXN1bHQsIGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG5cclxuICAgIFdpZGdldHMuYnVpbGQgPSBmdW5jdGlvbih3aWRnZXQsIHBhcmFtcykge1xyXG5cclxuICAgICAgICB2YXIgdyA9IE9iamVjdC5hc3NpZ24oSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh3aWRnZXQpKSwge1xyXG4gICAgICAgICAgICBwYXJhbXM6IHBhcmFtcyB8fCB7fVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBpbml0UGFyYW1zKHByb3BzLCBwYXJhbXMpIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHByb3BzW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gcGFyYW1zW3Byb3AubmFtZV0gPSBwYXJhbXNbcHJvcC5uYW1lXSB8fCB7IHZhbHVlOiBudWxsIH07IC8vIFRPRE8gU2V0IGEgdHlwZS1kZXBlbmRlbnQgaW5pdGlhbCB2YWx1ZVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwcm9wLnByb3BzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3AudHlwZSA9PSAnbXVsdGlwbGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtLnZhbHVlID0gcGFyYW0udmFsdWUgPT0gbnVsbCA/IFtdIDogcGFyYW0udmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcGFyYW0udmFsdWUubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRQYXJhbXMocHJvcC5wcm9wcywgcGFyYW0udmFsdWVbal0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9wLnR5cGUgPT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW0udmFsdWUgPSBwYXJhbS52YWx1ZSA9PSBudWxsID8ge30gOiBwYXJhbS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdFBhcmFtcyhwcm9wLnByb3BzLCBwYXJhbS52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpbml0UGFyYW1zKHcucHJvcHMsIHcucGFyYW1zKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHc7XHJcbiAgICB9XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtID0gZnVuY3Rpb24oZ3JvdXAsIGNvbmZpZykge1xyXG5cclxuICAgICAgICB2YXIgbmFtZSA9IGNvbmZpZy5uYW1lO1xyXG5cclxuICAgICAgICBncm91cC5pdGVtKGNvbmZpZy5uYW1lLCBjb25maWcpO1xyXG5cclxuICAgICAgICByZXR1cm4gZ3JvdXAuaXRlbShuYW1lKTtcclxuICAgIH07XHJcblxyXG4gICAgV2lkZ2V0cy5Qcm9wID0gZnVuY3Rpb24obmFtZSwgdGl0bGUsIHR5cGUsIHRhYiwgcGxhY2Vob2xkZXIpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgICAgICAgIHRhYjogdGFiLFxyXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogcGxhY2Vob2xkZXIsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBXaWRnZXRzLlBhcmFtID0gZnVuY3Rpb24odmFsdWUsIGJpbmRpbmcsIHN0cmF0ZWd5KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlIHx8IHVuZGVmaW5lZCxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgVnVlLnNlcnZpY2UoJ3BhbGV0dGUnLCBXaWRnZXRzLlBhbGV0dGUpO1xyXG5cclxuICAgIHJldHVybiBXaWRnZXRzO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XHJcblxyXG4gICAgV2lkZ2V0cy5Db21wb3NpdGVDYXRlZ29yeSA9IFdpZGdldHMuQ2F0ZWdvcnkoJ2RlZmF1bHQtY29tcG9zaXRlcycsICdDb21wb3NpdGUgRWxlbWVudHMnKTtcclxuICAgIFdpZGdldHMuRm9ybUNhdGVnb3J5ID0gV2lkZ2V0cy5DYXRlZ29yeSgnZGVmYXVsdC1mb3JtJywgJ0Zvcm0gRWxlbWVudHMnKTtcclxuICAgIFdpZGdldHMuVGV4dENhdGVnb3J5ID0gV2lkZ2V0cy5DYXRlZ29yeSgnZGVmYXVsdC10ZXh0JywgJ1RleHQgRWxlbWVudHMnKTtcclxuICAgIFdpZGdldHMuQ29udGFpbmVyQ2F0ZWdvcnkgPSBXaWRnZXRzLkNhdGVnb3J5KCdkZWZhdWx0LWNvbnRhaW5lcicsICdDb250YWluZXIgRWxlbWVudHMnKTtcclxuXHJcbiAgICBXaWRnZXRzLlV0aWxDYXRlZ29yeSA9IFdpZGdldHMuQ2F0ZWdvcnkoJ2RlZmF1bHQtdXRpbCcsICdVdGlsIEVsZW1lbnRzJywgdHJ1ZSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcclxuXHJcbiAgICB2YXIgUCA9IFdpZGdldHMuUHJvcHMgPSB7fTtcclxuICAgIHZhciBUID0gV2lkZ2V0cy5UYWJzID0ge307XHJcblxyXG4gICAgVC5EYXRhID0geyBuYW1lOiAnZGF0YScsIHRpdGxlOiAnRGF0YScgfTtcclxuICAgIFQuQXBwZWFyYW5jZSA9IHsgbmFtZTogJ2FwcGVhcmFuY2UnLCB0aXRsZTogJ0FwcGVhcmFuY2UnIH07XHJcbiAgICBULkNvbnRlbnQgPSB7IG5hbWU6ICdjb250ZW50JywgdGl0bGU6ICdDb250ZW50JyB9O1xyXG5cclxuICAgIFAuSWQgPSB7IG5hbWU6ICdpZCcsIHRpdGxlOiAnSUQnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScsIHBsYWNlaG9sZGVyOiAnVW5pcXVlIElEJyB9O1xyXG5cclxuICAgIFAuV2lkdGggPSB7IG5hbWU6ICd3aWR0aCcsIHRpdGxlOiAnV2lkdGgnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnYXBwZWFyYW5jZScgfTtcclxuICAgIFAuSGVpZ2h0ID0geyBuYW1lOiAnaGVpZ2h0JywgdGl0bGU6ICdIZWlnaHQnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnYXBwZWFyYW5jZScgfTtcclxuICAgIFAuUGFkZGluZyA9IHsgbmFtZTogJ3BhZGRpbmcnLCB0aXRsZTogJ1BhZGRpbmcnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnYXBwZWFyYW5jZScgfTtcclxuICAgIFAuTWFyZ2luID0geyBuYW1lOiAnbWFyZ2luJywgdGl0bGU6ICdNYXJnaW4nLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnYXBwZWFyYW5jZScgfTtcclxuICAgIFAuQm9yZGVyID0geyBuYW1lOiAnYm9yZGVyJywgdGl0bGU6ICdCb3JkZXInLCB0eXBlOiAnc3RyaW5nJywgcGxhY2Vob2xkZXI6ICcxcHggc29saWQgIzAwMDAwMCcsIHRhYjogJ2FwcGVhcmFuY2UnIH07XHJcbiAgICBQLkJhY2tncm91bmQgPSB7IG5hbWU6ICdiYWNrZ3JvdW5kJywgdGl0bGU6ICdCYWNrZ3JvdW5kJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2FwcGVhcmFuY2UnIH07XHJcblxyXG4gICAgUC5Db2xzID0geyBuYW1lOiAnY29scycsIHRpdGxlOiAnQ29sdW1ucycsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdhcHBlYXJhbmNlJyB9O1xyXG4gICAgUC5Sb3dzID0geyBuYW1lOiAncm93cycsIHRpdGxlOiAnUm93cycsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdhcHBlYXJhbmNlJyB9O1xyXG4gICAgUC5Db2xvciA9IHsgbmFtZTogJ2NvbG9yJywgdGl0bGU6ICdDb2xvcicsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdhcHBlYXJhbmNlJyB9O1xyXG4gICAgUC5Db250ZW50ID0geyBuYW1lOiAnY29udGVudCcsIHRpdGxlOiAnQ29udGVudCcsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdjb250ZW50JyB9O1xyXG5cclxuICAgIFAuU3BhY2luZyA9IHsgbmFtZTogJ3NwYWNpbmcnLCB0aXRsZTogJ0JvcmRlciBTcGFjaW5nJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2FwcGVhcmFuY2UnIH07XHJcbiAgICBQLkNvbGxhcHNlID0geyBuYW1lOiAnY29sbGFwc2UnLCB0aXRsZTogJ0JvcmRlciBDb2xsYXBzZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdhcHBlYXJhbmNlJyB9O1xyXG5cclxuICAgIFAuQWxpZ24gPSB7IG5hbWU6ICdhbGlnbicsIHRpdGxlOiAnVGV4dCBBbGlnbicsIHR5cGU6ICdzZWxlY3QnLCB0YWI6ICdhcHBlYXJhbmNlJywgb3B0aW9uczogW1xyXG4gICAgICAgIHsgdmFsdWU6ICdsZWZ0JywgdGV4dDogJ0xlZnQnIH0sXHJcbiAgICAgICAgeyB2YWx1ZTogJ3JpZ2h0JywgdGV4dDogJ1JpZ2h0JyB9LFxyXG4gICAgICAgIHsgdmFsdWU6ICdjZW50ZXInLCB0ZXh0OiAnQ2VuZXRlcicgfSxcclxuICAgICAgICB7IHZhbHVlOiAnanVzdGlmeScsIHRleHQ6ICdKdXN0aWZ5JyB9LFxyXG4gICAgXSB9O1xyXG5cclxuICAgIFAuRG9jayA9IHsgbmFtZTogJ2RvY2snLCB0aXRsZTogJ0RvY2snLCB0eXBlOiAnc2VsZWN0JywgdGFiOiAnYXBwZWFyYW5jZScsIG9wdGlvbnM6IFtcclxuICAgICAgICB7IHZhbHVlOiAnYWJvdmUnLCB0ZXh0OiAnQWJvdmUnIH0sXHJcbiAgICAgICAgeyB2YWx1ZTogJ3RvcCcsIHRleHQ6ICdUb3AnIH0sXHJcbiAgICAgICAgeyB2YWx1ZTogJ3JpZ2h0JywgdGV4dDogJ1JpZ2h0JyB9LFxyXG4gICAgICAgIHsgdmFsdWU6ICdib3R0b20nLCB0ZXh0OiAnQm90dG9tJyB9LFxyXG4gICAgICAgIHsgdmFsdWU6ICdsZWZ0JywgdGV4dDogJ0xlZnQnIH0sXHJcbiAgICBdfTtcclxuXHJcbiAgICBXaWRnZXRzLkNhbnZhc01peGluID0ge1xyXG4gICAgICAgIHRhYnM6IFsgVC5EYXRhLCBULkFwcGVhcmFuY2UsIFQuQ29udGVudCBdLFxyXG4gICAgfTtcclxuXHJcbiAgICBXaWRnZXRzLldpZGdldE1peGluID0ge1xyXG4gICAgICAgIHRhYnM6IFsgVC5EYXRhLCBULkFwcGVhcmFuY2UsIFQuQ29udGVudCBdLFxyXG4gICAgICAgIHByb3BzOiBbIFAuSWQgXSxcclxuICAgIH07XHJcblxyXG4gICAgV2lkZ2V0cy5Cb3hNaXhpbiA9IHtcclxuICAgICAgICBwcm9wczogW1xyXG4gICAgICAgICAgICB7IG5hbWU6ICdpbm5lcicsIHRpdGxlOiAnSW5uZXIgQ29udGFpbmVyJywgdHlwZTogJ29iamVjdCcsIHRhYjogJ2FwcGVhcmFuY2UnLFxyXG4gICAgICAgICAgICAgICAgdGFiczogWyBULkFwcGVhcmFuY2UgXSxcclxuICAgICAgICAgICAgICAgIHByb3BzOiBbIFAuTWFyZ2luLCBQLlBhZGRpbmcsIFAuQm9yZGVyLCBQLkJhY2tncm91bmQgXVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7IG5hbWU6ICdvdXRlcicsIHRpdGxlOiAnT3V0ZXIgQ29udGFpbmVyJywgdHlwZTogJ29iamVjdCcsIHRhYjogJ2FwcGVhcmFuY2UnLFxyXG4gICAgICAgICAgICAgICAgdGFiczogWyBULkFwcGVhcmFuY2UgXSxcclxuICAgICAgICAgICAgICAgIHByb3BzOiBbIFAuTWFyZ2luLCBQLlBhZGRpbmcsIFAuQm9yZGVyLCBQLkJhY2tncm91bmQgXVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICB9O1xyXG5cclxuICAgIFdpZGdldHMuU2l6ZU1peGluID0ge1xyXG4gICAgICAgIHByb3BzOiBbIFAuV2lkdGgsIFAuSGVpZ2h0IF0sXHJcbiAgICB9XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcclxuXHJcbiAgICBXaWRnZXRzLkdhbGxlcnlHcm91cCA9IFdpZGdldHMuR3JvdXAoV2lkZ2V0cy5Db21wb3NpdGVDYXRlZ29yeSwgJ2RlZmF1bHQtY29tcG9zaXRlLWdhbGxlcnknLCAnR2FsbGVyaWVzJyk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcclxuXHJcbiAgICBXaWRnZXRzLlN0YWNrR3JvdXAgPSBXaWRnZXRzLkdyb3VwKFdpZGdldHMuQ29udGFpbmVyQ2F0ZWdvcnksICdkZWZhdWx0LWNvbnRhaW5lci1zdGFjaycsICdTdGFja2VkJyk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcclxuXHJcbiAgICBXaWRnZXRzLkhlYWRpbmdzR3JvdXAgPSBXaWRnZXRzLkdyb3VwKFdpZGdldHMuVGV4dENhdGVnb3J5LCAnZGVmYXVsdC10ZXh0LWhlYWRpbmdzJywgJ0hlYWRpbmdzJyk7XHJcbiAgICBXaWRnZXRzLkJsb2Nrc0dyb3VwID0gV2lkZ2V0cy5Hcm91cChXaWRnZXRzLlRleHRDYXRlZ29yeSwgJ2RlZmF1bHQtdGV4dC1ibG9ja3MnLCAnQmxvY2tzJyk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcclxuXHJcbiAgICBXaWRnZXRzLkJ1dHRvbnNHcm91cCA9IFdpZGdldHMuR3JvdXAoV2lkZ2V0cy5Gb3JtQ2F0ZWdvcnksICdkZWZhdWx0LWZvcm0tYnV0dG9ucycsICdCdXR0b25zJyk7XHJcbiAgICBXaWRnZXRzLklucHV0c0dyb3VwID0gV2lkZ2V0cy5Hcm91cChXaWRnZXRzLkZvcm1DYXRlZ29yeSwgJ2RlZmF1bHQtZm9ybS1pbnB1dHMnLCAnSW5wdXRzJyk7XHJcbiAgICBXaWRnZXRzLlJhZGlvc0dyb3VwID0gV2lkZ2V0cy5Hcm91cChXaWRnZXRzLkZvcm1DYXRlZ29yeSwgJ2RlZmF1bHQtZm9ybS1yYWRpb3MnLCAnUmFkaW9zJyk7XHJcbiAgICBXaWRnZXRzLkNoZWNrc0dyb3VwID0gV2lkZ2V0cy5Hcm91cChXaWRnZXRzLkZvcm1DYXRlZ29yeSwgJ2RlZmF1bHQtZm9ybS1jaGVja3MnLCAnQ2hlY2tib3hlcycpO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFdpZGdldHMpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XHJcblxyXG4gICAgV2lkZ2V0cy5VdGlsR3JvdXAgPSBXaWRnZXRzLkdyb3VwKFdpZGdldHMuVXRpbENhdGVnb3J5LCAnZGVmYXVsdC11dGlsLWdyb3VwJywgJ1V0aWwgRWxlbWVudHMnKTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtY2Fyb3VzZWwnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1jYXJvdXNlbCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1nYWxsZXJ5Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtZ2FsbGVyeScsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcclxuXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBtYXRyaXg6IHRoaXMubWF0cml4LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnYmluZGluZ3MnLCB1cGRhdGVNYXRyaXguYmluZCh0aGlzKSwgeyBpbW1lZGlhdGU6IHRydWUsIGRlZXA6IHRydWUgfSk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiB1cGRhdGVNYXRyaXgoYmluZGluZ3MpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlbXMgPSBiaW5kaW5ncy5pdGVtcy5jb2xsZWN0aW9uIHx8IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciByb3dzID0gcGFyc2VJbnQoYmluZGluZ3Mucm93cyk7XHJcbiAgICAgICAgICAgICAgICByb3dzID0gcm93cyA+IDAgPyByb3dzIDogMTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgY29scyA9IHBhcnNlSW50KGJpbmRpbmdzLmNvbHMpO1xyXG4gICAgICAgICAgICAgICAgY29scyA9IGNvbHMgPiAwID8gY29scyA6IDM7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGNlbGxzID0gcm93cyAqIGNvbHM7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGRpdiA9IHBhcnNlSW50KGl0ZW1zLmxlbmd0aCAvIGNlbGxzKTtcclxuICAgICAgICAgICAgICAgIHZhciBtb2QgPSBpdGVtcy5sZW5ndGggJSBjZWxscztcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgY291bnQgPSAobW9kID4gMCB8fCBkaXYgPT0gMClcclxuICAgICAgICAgICAgICAgICAgICA/IGRpdiArIDFcclxuICAgICAgICAgICAgICAgICAgICA6IGRpdlxyXG4gICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBtYXRyaXggPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IGNvdW50OyBwKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBkID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCByb3dzOyByKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJkID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGMgPSAwOyBjIDwgY29sczsgYysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAocCAqIHJvd3MgKyByKSAqIGNvbHMgKyBjO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4IDwgaXRlbXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmQucHVzaChpdGVtc1tpbmRleF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBkLnB1c2gocmQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBtYXRyaXgucHVzaChwZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRyaXggPSBtYXRyaXg7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcclxuXHJcbiAgICB2YXIgUCA9IFdpZGdldHMuUHJvcHM7XHJcbiAgICB2YXIgVCA9IFdpZGdldHMuVGFicztcclxuXHJcbiAgICBXaWRnZXRzLkdhbGxlcnlXaWRnZXQgPVxyXG4gICAgV2lkZ2V0cy5XaWRnZXQoV2lkZ2V0cy5HYWxsZXJ5R3JvdXAsIFdpZGdldHMuY3JlYXRlKHtcclxuICAgICAgICBuYW1lOiAnZGVmYXVsdC1nYWxsZXJ5JyxcclxuICAgICAgICB0YWc6ICdkZWZhdWx0LWdhbGxlcnknLFxyXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluLCBXaWRnZXRzLlNpemVNaXhpbiBdLFxyXG4gICAgICAgIHByb3BzOiBbIFAuQ29scywgUC5Sb3dzLCBQLkRvY2ssIFAuQ29sb3IsIFAuQWxpZ24sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdib3JkZXInLCB0aXRsZTogJ0JvcmRlcicsIHR5cGU6ICdvYmplY3QnLCB0YWI6ICdhcHBlYXJhbmNlJyxcclxuICAgICAgICAgICAgICAgIHRhYnM6IFsgVC5BcHBlYXJhbmNlIF0sXHJcbiAgICAgICAgICAgICAgICBwcm9wczogWyBQLlNwYWNpbmcsIFAuQ29sbGFwc2UgXVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnaXRlbXMnLCB0aXRsZTogJ0l0ZW1zJywgdHlwZTogJ29iamVjdCcsIHRhYjogJ2RhdGEnLFxyXG4gICAgICAgICAgICAgICAgdGFiczogWyBULkRhdGEsIFQuQXBwZWFyYW5jZSBdLFxyXG4gICAgICAgICAgICAgICAgcHJvcHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdjb2xsZWN0aW9uJywgdGl0bGU6ICdDb2xsZWN0aW9uJywgdHlwZTogJ211bHRpcGxlJywgdGFiOiAnZGF0YScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhYnM6IFsgVC5BcHBlYXJhbmNlLCBULkNvbnRlbnQgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHM6IFsgUC5XaWR0aCwgUC5IZWlnaHQsIFAuTWFyZ2luLCBQLlBhZGRpbmcsIFAuQmFja2dyb3VuZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZHJhd2luZycsIHRpdGxlOiAnRHJhd2luZycsIHR5cGU6ICdvYmplY3QnLCB0YWI6ICdhcHBlYXJhbmNlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJzOiBbIFQuQXBwZWFyYW5jZSBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzOiBbIFAuV2lkdGgsIFAuSGVpZ2h0LCBQLk1hcmdpbiwgUC5QYWRkaW5nLCBQLkJhY2tncm91bmQsIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdkZXNjcmlwdGlvbicsIHRpdGxlOiAnRGVzY3JpcHRpb24nLCB0eXBlOiAnb2JqZWN0JywgdGFiOiAnYXBwZWFyYW5jZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFiczogWyBULkFwcGVhcmFuY2UsIFQuQ29udGVudCBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzOiBbIFAuV2lkdGgsIFAuSGVpZ2h0LCBQLk1hcmdpbiwgUC5QYWRkaW5nLCBQLkJhY2tncm91bmQsIFAuQ29sb3IsIFAuQWxpZ24sIFAuQ29udGVudCwgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc3R5bGUnLCB0aXRsZTogJ1N0eWxlJywgdHlwZTogJ29iamVjdCcsIHRhYjogJ2FwcGVhcmFuY2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWJzOiBbIFQuQXBwZWFyYW5jZSBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wczogWyBQLldpZHRoLCBQLkhlaWdodCwgUC5NYXJnaW4sIFAuUGFkZGluZywgUC5CYWNrZ3JvdW5kLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdkcmF3aW5nJywgdGl0bGU6ICdEcmF3aW5nJywgdHlwZTogJ29iamVjdCcsIHRhYjogJ2FwcGVhcmFuY2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhYnM6IFsgVC5BcHBlYXJhbmNlIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUC5XaWR0aCwgUC5IZWlnaHQsIFAuTWFyZ2luLCBQLlBhZGRpbmcsIFAuQmFja2dyb3VuZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdkZXNjcmlwdGlvbicsIHRpdGxlOiAnRGVzY3JpcHRpb24nLCB0eXBlOiAnb2JqZWN0JywgdGFiOiAnYXBwZWFyYW5jZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFiczogWyBULkFwcGVhcmFuY2UgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wczogWyBQLldpZHRoLCBQLkhlaWdodCwgUC5NYXJnaW4sIFAuUGFkZGluZywgUC5CYWNrZ3JvdW5kLCBQLkNvbG9yLCBQLkFsaWduLCBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgfSkpO1xyXG5cclxuICAgIFdpZGdldHMuR2FsbGVyeVdpZGdldEZhY3RvcnkgPSBmdW5jdGlvbihkZWZhdWx0cykge1xyXG5cclxuICAgICAgICB2YXIgdyA9IFdpZGdldHMuYnVpbGQoV2lkZ2V0cy5HYWxsZXJ5V2lkZ2V0LCB7XHJcbiAgICAgICAgICAgIHJvd3M6IHsgdmFsdWU6IGRlZmF1bHRzLnJvd3MgfSxcclxuICAgICAgICAgICAgY29sczogeyB2YWx1ZTogZGVmYXVsdHMuY29scyB9LFxyXG4gICAgICAgICAgICBkb2NrOiB7IHZhbHVlOiBkZWZhdWx0cy5kb2NrIH0sXHJcbiAgICAgICAgICAgIGFsaWduOiB7IHZhbHVlOiBkZWZhdWx0cy5hbGlnbiB9LFxyXG4gICAgICAgICAgICBjb2xvcjogeyB2YWx1ZTogZGVmYXVsdHMuY29sb3IgfSxcclxuICAgICAgICAgICAgYmFja2dyb3VuZDogeyB2YWx1ZTogZGVmYXVsdHMuYmFja2dyb3VuZCB9LFxyXG4gICAgICAgICAgICBib3JkZXI6IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3BhY2luZzogeyB2YWx1ZTogZGVmYXVsdHMuYm9yZGVyLnNwYWNpbmcgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHsgdmFsdWU6IGRlZmF1bHRzLml0ZW1zLnN0eWxlLndpZHRoIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHsgdmFsdWU6IGRlZmF1bHRzLml0ZW1zLnN0eWxlLmhlaWdodCB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiB7IHZhbHVlOiBkZWZhdWx0cy5wYWRkaW5nIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBkZWZhdWx0cy5pdGVtcy5jb2xsZWN0aW9uLm1hcChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHsgdmFsdWU6IGl0ZW0uZHJhd2luZy5iYWNrZ3JvdW5kIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHsgdmFsdWU6IGl0ZW0uZHJhd2luZy5oZWlnaHQgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHsgdmFsdWU6IGl0ZW0uZGVzY3JpcHRpb24uY29udGVudCB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdztcclxuICAgIH1cclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5HYWxsZXJ5R3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnZ2FsbGVyeS1yMWMxZicsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2NvbXBvc2l0ZXMvZ2FsbGVyeS9nYWxsZXJ5LXIxYzFmLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkdhbGxlcnlXaWRnZXRGYWN0b3J5KHtcclxuICAgICAgICAgICAgcm93czogMSwgY29sczogMSwgZG9jazogJ2Fib3ZlJywgcGFkZGluZzogJzMwcHgnLCBhbGlnbjogJ2NlbnRlcicsIGNvbG9yOiAnI0ZGRkZGRicsXHJcbiAgICAgICAgICAgIGJvcmRlcjoge1xyXG4gICAgICAgICAgICAgICAgc3BhY2luZzogJzBweCcsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMjUwcHgnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjRkY2NDY2J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTo0OHB4XCI+Rmlyc3QgSXRlbTwvc3Bhbj48L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAyOHB4XCI+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzYwNUJFOCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4gc3R5bGU9XCJmb250LXNpemU6NDhweFwiPlNlY29uZCBJdGVtPC9zcGFuPjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+PHNwYW4gc3R5bGU9XCJmb250LXNpemU6IDI4cHhcIj5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9zcGFuPjwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNzBGRkJGJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTo0OHB4XCI+VGhpcmQgSXRlbTwvc3Bhbj48L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAyOHB4XCI+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KSxcclxuICAgIH0pO1xyXG5cclxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkdhbGxlcnlHcm91cCwge1xyXG4gICAgICAgIG5hbWU6ICdnYWxsZXJ5LXIxYzFyJyxcclxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvY29tcG9zaXRlcy9nYWxsZXJ5L2dhbGxlcnktcjFjMXIucG5nJyxcclxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuR2FsbGVyeVdpZGdldEZhY3Rvcnkoe1xyXG4gICAgICAgICAgICByb3dzOiAxLCBjb2xzOiAxLCBkb2NrOiAncmlnaHQnLCBwYWRkaW5nOiAnMzBweCcsIGFsaWduOiAnbGVmdCcsIGNvbG9yOiAnIzMzMzMzMycsXHJcbiAgICAgICAgICAgIGJvcmRlcjoge1xyXG4gICAgICAgICAgICAgICAgc3BhY2luZzogJzIwcHgnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzI0MHB4JyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI0ZGNjQ2NidcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4gc3R5bGU9XCJmb250LXNpemU6NDhweFwiPkZpcnN0IEl0ZW08L3NwYW4+PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMjhweFwiPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd2luZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM2MDVCRTgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjQ4cHhcIj5TZWNvbmQgSXRlbTwvc3Bhbj48L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAyOHB4XCI+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzcwRkZCRidcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4gc3R5bGU9XCJmb250LXNpemU6NDhweFwiPlRoaXJkIEl0ZW08L3NwYW4+PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMjhweFwiPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5HYWxsZXJ5R3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnZ2FsbGVyeS1yMWMzZicsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2NvbXBvc2l0ZXMvZ2FsbGVyeS9nYWxsZXJ5LXIxYzNmLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkdhbGxlcnlXaWRnZXRGYWN0b3J5KHtcclxuICAgICAgICAgICAgcm93czogMSwgY29sczogMywgZG9jazogJ2Fib3ZlJywgcGFkZGluZzogJzMwcHgnLCBhbGlnbjogJ2NlbnRlcicsIGNvbG9yOiAnI0ZGRkZGRicsXHJcbiAgICAgICAgICAgIGJvcmRlcjoge1xyXG4gICAgICAgICAgICAgICAgc3BhY2luZzogJzIwcHgnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzE4MHB4JyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI0ZGNjQ2NidcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4+Rmlyc3QgSXRlbTwvc3Bhbj48L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd2luZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM2MDVCRTgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuPlNlY29uZCBJdGVtPC9zcGFuPjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+PHNwYW4+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzcwRkZCRidcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4+VGhpcmQgSXRlbTwvc3Bhbj48L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd2luZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNBNTI5MzknXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuPkZvdXJ0aCBJdGVtPC9zcGFuPjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+PHNwYW4+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI0VFM0I4MCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4+RmlmdGggSXRlbTwvc3Bhbj48L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd2luZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNFRTZCOUUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuPlNpeHRoIEl0ZW08L3NwYW4+PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3Bhbj5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9zcGFuPjwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuR2FsbGVyeUdyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ2dhbGxlcnktcjFjM2InLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9jb21wb3NpdGVzL2dhbGxlcnkvZ2FsbGVyeS1yMWMzYi5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5HYWxsZXJ5V2lkZ2V0RmFjdG9yeSh7XHJcbiAgICAgICAgICAgIHJvd3M6IDEsIGNvbHM6IDMsIGRvY2s6ICdib3R0b20nLCBwYWRkaW5nOiAnMTVweCcsIGFsaWduOiAnbGVmdCcsIGNvbG9yOiAnIzMzMzMzMycsXHJcbiAgICAgICAgICAgIGJvcmRlcjoge1xyXG4gICAgICAgICAgICAgICAgc3BhY2luZzogJzIwcHgnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjRkY2NDY2JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzE4MHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4gc3R5bGU9XCJmb250LXNpemU6MjRweFwiPkZpcnN0IEl0ZW08L3NwYW4+PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMThweFwiPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd2luZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM2MDVCRTgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTgwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZToyNHB4XCI+U2Vjb25kIEl0ZW08L3NwYW4+PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTogMThweFwiPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd2luZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM3MEZGQkYnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTgwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz48c3BhbiBzdHlsZT1cImZvbnQtc2l6ZToyNHB4XCI+VGhpcmQgSXRlbTwvc3Bhbj48L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuIHN0eWxlPVwiZm9udC1zaXplOiAxOHB4XCI+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI0E1MjkzOScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxODBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuPkZvdXJ0aCBJdGVtPC9zcGFuPjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+PHNwYW4+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI0VFM0I4MCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxODBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuPkZpZnRoIEl0ZW08L3NwYW4+PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3Bhbj5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9zcGFuPjwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjRUU2QjlFJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzE4MHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4+U2l4dGggSXRlbTwvc3Bhbj48L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5HYWxsZXJ5R3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnZ2FsbGVyeS1yMmM0ZicsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2NvbXBvc2l0ZXMvZ2FsbGVyeS9nYWxsZXJ5LXIyYzRmLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkdhbGxlcnlXaWRnZXRGYWN0b3J5KHtcclxuICAgICAgICAgICAgcm93czogMiwgY29sczogNCwgZG9jazogJ2Fib3ZlJywgcGFkZGluZzogJzE1cHgnLCBhbGlnbjogJ2NlbnRlcicsIGNvbG9yOiAnI0ZGRkZGRicsXHJcbiAgICAgICAgICAgIGJvcmRlcjoge1xyXG4gICAgICAgICAgICAgICAgc3BhY2luZzogJzIwcHgnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzE4MHB4JyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI0ZGNjQ2NidcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4+Rmlyc3QgSXRlbTwvc3Bhbj48L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd2luZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM2MDVCRTgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuPlNlY29uZCBJdGVtPC9zcGFuPjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+PHNwYW4+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzcwRkZCRidcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4+VGhpcmQgSXRlbTwvc3Bhbj48L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd2luZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNBNTI5MzknXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuPkZvdXJ0aCBJdGVtPC9zcGFuPjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+PHNwYW4+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI0VFM0I4MCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4+RmlmdGggSXRlbTwvc3Bhbj48L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd2luZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNFRTZCOUUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuPlNpeHRoIEl0ZW08L3NwYW4+PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3Bhbj5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9zcGFuPjwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjRkY2NDY2J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz48c3Bhbj5TZXZlbnRoIEl0ZW08L3NwYW4+PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3Bhbj5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9zcGFuPjwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNjA1QkU4J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz48c3Bhbj5FaWdodGggSXRlbTwvc3Bhbj48L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5HYWxsZXJ5R3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnZ2FsbGVyeS1yMmM0YicsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2NvbXBvc2l0ZXMvZ2FsbGVyeS9nYWxsZXJ5LXIyYzRiLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkdhbGxlcnlXaWRnZXRGYWN0b3J5KHtcclxuICAgICAgICAgICAgcm93czogMiwgY29sczogNCwgZG9jazogJ2JvdHRvbScsIHBhZGRpbmc6ICcxNXB4JywgYWxpZ246ICdjZW50ZXInLCBjb2xvcjogJyMzMzMzMzMnLFxyXG4gICAgICAgICAgICBib3JkZXI6IHtcclxuICAgICAgICAgICAgICAgIHNwYWNpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI0ZGNjQ2NicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxODBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuPkZpcnN0IEl0ZW08L3NwYW4+PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3Bhbj5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9zcGFuPjwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNjA1QkU4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzE4MHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4+U2Vjb25kIEl0ZW08L3NwYW4+PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3Bhbj5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9zcGFuPjwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNzBGRkJGJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzE4MHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4+VGhpcmQgSXRlbTwvc3Bhbj48L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd2luZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNBNTI5MzknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTgwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz48c3Bhbj5Gb3VydGggSXRlbTwvc3Bhbj48L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd2luZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNFRTNCODAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTgwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz48c3Bhbj5GaWZ0aCBJdGVtPC9zcGFuPjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+PHNwYW4+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI0VFNkI5RScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxODBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuPlNpeHRoIEl0ZW08L3NwYW4+PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3Bhbj5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9zcGFuPjwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjRkY2NDY2JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzE4MHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4+U2V2ZW50aCBJdGVtPC9zcGFuPjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+PHNwYW4+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzYwNUJFOCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxODBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuPkVpZ2h0aCBJdGVtPC9zcGFuPjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+PHNwYW4+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KSxcclxuICAgIH0pO1xyXG5cclxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkdhbGxlcnlHcm91cCwge1xyXG4gICAgICAgIG5hbWU6ICdnYWxsZXJ5LXIyYzNmJyxcclxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvY29tcG9zaXRlcy9nYWxsZXJ5L2dhbGxlcnktcjJjM2YucG5nJyxcclxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuR2FsbGVyeVdpZGdldEZhY3Rvcnkoe1xyXG4gICAgICAgICAgICByb3dzOiAyLCBjb2xzOiAzLCBkb2NrOiAnYWJvdmUnLCBwYWRkaW5nOiAnMTVweCcsIGFsaWduOiAnY2VudGVyJywgY29sb3I6ICcjRkZGRkZGJyxcclxuICAgICAgICAgICAgYm9yZGVyOiB7XHJcbiAgICAgICAgICAgICAgICBzcGFjaW5nOiAnMjBweCcsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTgwcHgnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjRkY2NDY2J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz48c3Bhbj5GaXJzdCBJdGVtPC9zcGFuPjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+PHNwYW4+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzYwNUJFOCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4+U2Vjb25kIEl0ZW08L3NwYW4+PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3Bhbj5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9zcGFuPjwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNzBGRkJGJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz48c3Bhbj5UaGlyZCBJdGVtPC9zcGFuPjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+PHNwYW4+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI0E1MjkzOSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4+Rm91cnRoIEl0ZW08L3NwYW4+PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3Bhbj5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9zcGFuPjwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjRUUzQjgwJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz48c3Bhbj5GaWZ0aCBJdGVtPC9zcGFuPjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+PHNwYW4+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkcmF3aW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI0VFNkI5RSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDM+PHNwYW4+U2l4dGggSXRlbTwvc3Bhbj48L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5HYWxsZXJ5R3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnZ2FsbGVyeS1yM2MycicsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2NvbXBvc2l0ZXMvZ2FsbGVyeS9nYWxsZXJ5LXIzYzJyLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkdhbGxlcnlXaWRnZXRGYWN0b3J5KHtcclxuICAgICAgICAgICAgcm93czogMywgY29sczogMiwgZG9jazogJ3JpZ2h0JywgcGFkZGluZzogJzE1cHgnLCBhbGlnbjogJ2xlZnQnLCBjb2xvcjogJyMzMzMzMzMnLFxyXG4gICAgICAgICAgICBib3JkZXI6IHtcclxuICAgICAgICAgICAgICAgIHNwYWNpbmc6ICcyMHB4JyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxNDBweCcsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbjogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd2luZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNGRjY0NjYnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuPkZpcnN0IEl0ZW08L3NwYW4+PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3Bhbj5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9zcGFuPjwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNjA1QkU4J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz48c3Bhbj5TZWNvbmQgSXRlbTwvc3Bhbj48L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd2luZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM3MEZGQkYnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuPlRoaXJkIEl0ZW08L3NwYW4+PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3Bhbj5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9zcGFuPjwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjQTUyOTM5J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz48c3Bhbj5Gb3VydGggSXRlbTwvc3Bhbj48L2gzPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPjxzcGFuPllvdSBjYW4gY2hhbmdlIGl0ZW0gZGF0YSB1c2luZyBzZXR0aW5ncyBlZGl0b3I8L3NwYW4+PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhd2luZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNFRTNCODAnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPjxzcGFuPkZpZnRoIEl0ZW08L3NwYW4+PC9oMz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cD48c3Bhbj5Zb3UgY2FuIGNoYW5nZSBpdGVtIGRhdGEgdXNpbmcgc2V0dGluZ3MgZWRpdG9yPC9zcGFuPjwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdpbmc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjRUU2QjlFJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz48c3Bhbj5TaXh0aCBJdGVtPC9zcGFuPjwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHA+PHNwYW4+WW91IGNhbiBjaGFuZ2UgaXRlbSBkYXRhIHVzaW5nIHNldHRpbmdzIGVkaXRvcjwvc3Bhbj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFdpZGdldHMpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XHJcblxyXG4gICAgV2lkZ2V0cy5UZXh0V2lkZ2V0ID1cclxuICAgIFdpZGdldHMuV2lkZ2V0KFdpZGdldHMuQmxvY2tzR3JvdXAsIFdpZGdldHMuY3JlYXRlKHtcclxuICAgICAgICBuYW1lOiAnZGVmYXVsdC10ZXh0JyxcclxuICAgICAgICB0YWc6ICdkZWZhdWx0LXRleHQnLFxyXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluLCBXaWRnZXRzLlNpemVNaXhpbiBdLFxyXG4gICAgICAgIHByb3BzOiBbXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ3N0ZXJlb3R5cGUnLCB0aXRsZTogJ1N0ZXJlb3R5cGUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICAgICAgeyBuYW1lOiAnY29udGVudCcsIHRpdGxlOiAnQ29udGVudCcsIHR5cGU6ICdyaWNoJywgdGFiOiAnY29udGVudCcgfSxcclxuICAgICAgICBdLFxyXG4gICAgfSkpO1xyXG5cclxuICAgIFdpZGdldHMuVGV4dFdpZGdldEZhY3RvcnkgPSBmdW5jdGlvbihzdGVyZW90eXBlLCBjb250ZW50KSB7XHJcblxyXG4gICAgICAgIHJldHVybiBXaWRnZXRzLmJ1aWxkKFdpZGdldHMuVGV4dFdpZGdldCwge1xyXG4gICAgICAgICAgICBjb250ZW50OiB7IHZhbHVlOiBjb250ZW50IH0sXHJcbiAgICAgICAgICAgIHN0ZXJlb3R5cGU6IHsgdmFsdWU6IHN0ZXJlb3R5cGUgfSxcclxuICAgICAgICAgICAgaW5uZXI6IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogeyB2YWx1ZTogJzE1cHggMTVweCcgfSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5IZWFkaW5nc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ3RleHQtaDEnLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvdGV4dC1oMS5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsIGBcclxuICAgICAgICAgICAgPGgxPkhlYWRpbmcgMTwvaDE+XHJcbiAgICAgICAgYCksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5IZWFkaW5nc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ3RleHQtaDInLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvdGV4dC1oMi5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsIGBcclxuICAgICAgICAgICAgPGgyPkhlYWRpbmcgMjwvaDI+XHJcbiAgICAgICAgYCksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5IZWFkaW5nc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ3RleHQtaDMnLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvdGV4dC1oMy5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsIGBcclxuICAgICAgICAgICAgPGgzPkhlYWRpbmcgMzwvaDM+XHJcbiAgICAgICAgYCksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5IZWFkaW5nc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ3RleHQtaDQnLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvdGV4dC1oNC5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsIGBcclxuICAgICAgICAgICAgPGg0PkhlYWRpbmcgNDwvaDQ+XHJcbiAgICAgICAgYCksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5IZWFkaW5nc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ3RleHQtaDUnLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvdGV4dC1oNS5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsIGBcclxuICAgICAgICAgICAgPGg1PkhlYWRpbmcgNTwvaDU+XHJcbiAgICAgICAgYCksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5IZWFkaW5nc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ3RleHQtaDYnLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvdGV4dC1oNi5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsIGBcclxuICAgICAgICAgICAgPGg2PkhlYWRpbmcgNjwvaDY+XHJcbiAgICAgICAgYCksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CbG9ja3NHcm91cCwge1xyXG4gICAgICAgIG5hbWU6ICdibG9jay1kZWZhdWx0JyxcclxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L2Jsb2NrLWRlZmF1bHQucG5nJyxcclxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuVGV4dFdpZGdldEZhY3RvcnkoJ2RlZmF1bHQnLCBgXHJcbiAgICAgICAgICAgIDxoMz5Mb3JlbSBpcHN1bTwvaDM+XHJcbiAgICAgICAgICAgIDxwPkV0aWFtIHBvcnRhIHNlbSBtYWxlc3VhZGEgbWFnbmEgbW9sbGlzIGV1aXNtb2QuPC9wPlxyXG4gICAgICAgIGApLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQmxvY2tzR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnYmxvY2stcHJpbWFyeScsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL3RleHQvdGV4dC9ibG9jay1wcmltYXJ5LnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXRGYWN0b3J5KCdwcmltYXJ5JywgYFxyXG4gICAgICAgICAgICA8aDM+TG9yZW0gaXBzdW08L2gzPlxyXG4gICAgICAgICAgICA8cD5FdGlhbSBwb3J0YSBzZW0gbWFsZXN1YWRhIG1hZ25hIG1vbGxpcyBldWlzbW9kLjwvcD5cclxuICAgICAgICBgKSxcclxuICAgIH0pO1xyXG5cclxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJsb2Nrc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ2Jsb2NrLXN1Y2Nlc3MnLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvYmxvY2stc3VjY2Vzcy5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0RmFjdG9yeSgnc3VjY2VzcycsIGBcclxuICAgICAgICAgICAgPGgzPkxvcmVtIGlwc3VtPC9oMz5cclxuICAgICAgICAgICAgPHA+RXRpYW0gcG9ydGEgc2VtIG1hbGVzdWFkYSBtYWduYSBtb2xsaXMgZXVpc21vZC48L3A+XHJcbiAgICAgICAgYCksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CbG9ja3NHcm91cCwge1xyXG4gICAgICAgIG5hbWU6ICdibG9jay1pbmZvJyxcclxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L2Jsb2NrLWluZm8ucG5nJyxcclxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuVGV4dFdpZGdldEZhY3RvcnkoJ2luZm8nLCBgXHJcbiAgICAgICAgICAgIDxoMz5Mb3JlbSBpcHN1bTwvaDM+XHJcbiAgICAgICAgICAgIDxwPkV0aWFtIHBvcnRhIHNlbSBtYWxlc3VhZGEgbWFnbmEgbW9sbGlzIGV1aXNtb2QuPC9wPlxyXG4gICAgICAgIGApLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQmxvY2tzR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnYmxvY2std2FybmluZycsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL3RleHQvdGV4dC9ibG9jay13YXJuaW5nLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXRGYWN0b3J5KCd3YXJuaW5nJywgYFxyXG4gICAgICAgICAgICA8aDM+TG9yZW0gaXBzdW08L2gzPlxyXG4gICAgICAgICAgICA8cD5FdGlhbSBwb3J0YSBzZW0gbWFsZXN1YWRhIG1hZ25hIG1vbGxpcyBldWlzbW9kLjwvcD5cclxuICAgICAgICBgKSxcclxuICAgIH0pO1xyXG5cclxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJsb2Nrc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ2Jsb2NrLWRhbmdlcicsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL3RleHQvdGV4dC9ibG9jay1kYW5nZXIucG5nJyxcclxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuVGV4dFdpZGdldEZhY3RvcnkoJ2RhbmdlcicsIGBcclxuICAgICAgICAgICAgPGgzPkxvcmVtIGlwc3VtPC9oMz5cclxuICAgICAgICAgICAgPHA+RXRpYW0gcG9ydGEgc2VtIG1hbGVzdWFkYSBtYWduYSBtb2xsaXMgZXVpc21vZC48L3A+XHJcbiAgICAgICAgYCksXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtdGV4dCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXRleHQnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtYnV0dG9uJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtYnV0dG9uJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcclxuXHJcbiAgICBXaWRnZXRzLkJ1dHRvbldpZGdldCA9XHJcbiAgICBXaWRnZXRzLldpZGdldChXaWRnZXRzLkJ1dHRvbnNHcm91cCwgV2lkZ2V0cy5jcmVhdGUoe1xyXG4gICAgICAgIG5hbWU6ICdkZWZhdWx0LWJ1dHRvbicsXHJcbiAgICAgICAgdGFnOiAnZGVmYXVsdC1idXR0b24nLFxyXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluLCBXaWRnZXRzLlNpemVNaXhpbiBdLFxyXG4gICAgICAgIHByb3BzOiBbXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ3RpdGxlJywgdGl0bGU6ICdUaXRsZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdjb250ZW50JyB9LFxyXG4gICAgICAgICAgICB7IG5hbWU6ICd0eXBlJywgdGl0bGU6ICdUeXBlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ3N0ZXJlb3R5cGUnLCB0aXRsZTogJ1N0ZXJlb3R5cGUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICBdLFxyXG4gICAgfSkpO1xyXG5cclxuICAgIFdpZGdldHMuQnV0dG9uV2lkZ2V0RmFjdG9yeSA9IGZ1bmN0aW9uKHRpdGxlLCBzdGVyZW90eXBlKSB7XHJcblxyXG4gICAgICAgIHZhciB3ID0gV2lkZ2V0cy5idWlsZChXaWRnZXRzLkJ1dHRvbldpZGdldCwge1xyXG4gICAgICAgICAgICBpbm5lcjoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6ICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiB7IHZhbHVlOiAnMTVweCAxNXB4JyB9LFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0eXBlOiB7IHZhbHVlOiAnYnV0dG9uJyB9LFxyXG4gICAgICAgICAgICB0aXRsZTogeyB2YWx1ZTogdGl0bGUgfSxcclxuICAgICAgICAgICAgc3RlcmVvdHlwZTogeyB2YWx1ZTogc3RlcmVvdHlwZSB9LFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdztcclxuICAgIH1cclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CdXR0b25zR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnYnV0dG9uLWRlZmF1bHQnLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2J1dHRvbi9idXR0b24tZGVmYXVsdC5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5CdXR0b25XaWRnZXRGYWN0b3J5KCdEZWZhdWx0JywgJ2RlZmF1bHQnKSxcclxuICAgIH0pO1xyXG5cclxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJ1dHRvbnNHcm91cCwge1xyXG4gICAgICAgIG5hbWU6ICdidXR0b24tcHJpbWFyeScsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vYnV0dG9uL2J1dHRvbi1wcmltYXJ5LnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkJ1dHRvbldpZGdldEZhY3RvcnkoJ1ByaW1hcnknLCAncHJpbWFyeScpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQnV0dG9uc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ2J1dHRvbi1zdWNjZXNzJyxcclxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9idXR0b24vYnV0dG9uLXN1Y2Nlc3MucG5nJyxcclxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuQnV0dG9uV2lkZ2V0RmFjdG9yeSgnU3VjY2VzcycsICdzdWNjZXNzJyksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CdXR0b25zR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnYnV0dG9uLWluZm8nLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2J1dHRvbi9idXR0b24taW5mby5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5CdXR0b25XaWRnZXRGYWN0b3J5KCdJbmZvJywgJ2luZm8nKSxcclxuICAgIH0pO1xyXG5cclxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJ1dHRvbnNHcm91cCwge1xyXG4gICAgICAgIG5hbWU6ICdidXR0b24td2FybmluZycsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vYnV0dG9uL2J1dHRvbi13YXJuaW5nLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkJ1dHRvbldpZGdldEZhY3RvcnkoJ1dhcm5pbmcnLCAnd2FybmluZycpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQnV0dG9uc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ2J1dHRvbi1kYW5nZXInLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2J1dHRvbi9idXR0b24tZGFuZ2VyLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkJ1dHRvbldpZGdldEZhY3RvcnkoJ0RhbmdlcicsICdkYW5nZXInKSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFdpZGdldHMpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XHJcblxyXG4gICAgV2lkZ2V0cy5TdGFja0NhbnZhc1dpZGdldCA9XHJcbiAgICBXaWRnZXRzLldpZGdldChXaWRnZXRzLlN0YWNrR3JvdXAsIFdpZGdldHMuY3JlYXRlKHtcclxuICAgICAgICBuYW1lOiAnZGVmYXVsdC1zdGFjay1jYW52YXMnLFxyXG4gICAgICAgIHRhZzogJ2RlZmF1bHQtc3RhY2stY2FudmFzJyxcclxuICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5DYW52YXNNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcclxuICAgICAgICB3aWRnZXRzOiBbXSxcclxuICAgIH0pKTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5TdGFja0dyb3VwLCB7XHJcbiAgICAgICAgaGlkZGVuOiB0cnVlLFxyXG4gICAgICAgIG5hbWU6ICdzdGFjay1jYW52YXMnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5idWlsZChXaWRnZXRzLlN0YWNrQ2FudmFzV2lkZ2V0KSxcclxuICAgIH0pO1xyXG5cclxuICAgIFdpZGdldHMuU3RhY2tIb3Jpc29udGFsV2lkZ2V0ID1cclxuICAgIFdpZGdldHMuV2lkZ2V0KFdpZGdldHMuU3RhY2tHcm91cCwgV2lkZ2V0cy5jcmVhdGUoe1xyXG4gICAgICAgIG5hbWU6ICdkZWZhdWx0LXN0YWNrLWhvcmlzb250YWwnLFxyXG4gICAgICAgIHRhZzogJ2RlZmF1bHQtc3RhY2staG9yaXNvbnRhbCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIFdpZGdldHMuV2lkZ2V0TWl4aW4sIFdpZGdldHMuQm94TWl4aW4gXSxcclxuICAgICAgICB3aWRnZXRzOiBbXSxcclxuICAgIH0pKTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5TdGFja0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ3N0YWNrLWhvcmlzb250YWwnLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9jb250YWluZXIvc3RhY2svc3RhY2staG9yaXNvbnRhbC5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5idWlsZChXaWRnZXRzLlN0YWNrSG9yaXNvbnRhbFdpZGdldCksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLlN0YWNrVmVydGljYWxXaWRnZXQgPVxyXG4gICAgV2lkZ2V0cy5XaWRnZXQoV2lkZ2V0cy5TdGFja0dyb3VwLCBXaWRnZXRzLmNyZWF0ZSh7XHJcbiAgICAgICAgbmFtZTogJ2RlZmF1bHQtc3RhY2stdmVydGljYWwnLFxyXG4gICAgICAgIHRhZzogJ2RlZmF1bHQtc3RhY2stdmVydGljYWwnLFxyXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluIF0sXHJcbiAgICAgICAgd2lkZ2V0czogW10sXHJcbiAgICB9KSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuU3RhY2tHcm91cCwge1xyXG4gICAgICAgIG5hbWU6ICdzdGFjay12ZXJ0aWNhbCcsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2NvbnRhaW5lci9zdGFjay9zdGFjay12ZXJ0aWNhbC5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5idWlsZChXaWRnZXRzLlN0YWNrVmVydGljYWxXaWRnZXQsIHt9KSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFdpZGdldHMpO1xyXG4iLCJTaGVsbCA9IHdpbmRvdy5TaGVsbCB8fCB7fTtcclxuXHJcbihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXN0YWNrLWNhbnZhcycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXN0YWNrLWNhbnZhcycsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4sIENvcmUuU3RhY2tlZE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXN0YWNrLWhvcmlzb250YWwnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zdGFjay1ob3Jpc29udGFsJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiwgQ29yZS5TdGFja2VkTWl4aW4gXSxcclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3RhY2stdmVydGljYWwnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zdGFjay12ZXJ0aWNhbCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4sIENvcmUuU3RhY2tlZE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWNoZWNrJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtY2hlY2snLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xyXG5cclxuICAgIFdpZGdldHMuQ2hlY2tXaWRnZXQgPVxyXG4gICAgV2lkZ2V0cy5XaWRnZXQoV2lkZ2V0cy5DaGVja3NHcm91cCwgV2lkZ2V0cy5jcmVhdGUoe1xyXG4gICAgICAgIG5hbWU6ICdkZWZhdWx0LWNoZWNrJyxcclxuICAgICAgICB0YWc6ICdkZWZhdWx0LWNoZWNrJyxcclxuICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcclxuICAgICAgICBwcm9wczogW1xyXG4gICAgICAgICAgICB7IG5hbWU6ICdtb2RlbCcsIHRpdGxlOiAnTW9kZWwnLCB0eXBlOiAndmFyJywgdGFiOiAnZGF0YScsIHZhcmlhYmxlOiB0cnVlIH0sXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ3N0ZXJlb3R5cGUnLCB0aXRsZTogJ1N0ZXJlb3R5cGUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ2l0ZW1zJywgdHlwZTogJ211bHRpcGxlJywgdGl0bGU6ICdJdGVtcycsIHRhYjogJ2RhdGEnLFxyXG4gICAgICAgICAgICAgICAgdGFiczogW1xyXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2RhdGEnLCB0aXRsZTogJ0RhdGEnIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgcHJvcHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICd2YWx1ZScsIHRpdGxlOiAnVmFsdWUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdsYWJlbCcsIHRpdGxlOiAnTGFiZWwnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgfSkpO1xyXG5cclxuICAgIFdpZGdldHMuQ2hlY2tXaWRnZXRGYWN0b3J5ID0gZnVuY3Rpb24oc3RlcmVvdHlwZSwgdmFsdWUsIG9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFdpZGdldHMuYnVpbGQoV2lkZ2V0cy5DaGVja1dpZGdldCwge1xyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHsgdmFsdWU6IHZhbHVlIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaW5uZXI6IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiB7IHZhbHVlOiAnMTVweCAxNXB4JyB9LFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdGVyZW90eXBlOiB7IHZhbHVlOiBzdGVyZW90eXBlIH0sXHJcbiAgICAgICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogb3B0aW9ucy5tYXAoZnVuY3Rpb24ob3B0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHsgdmFsdWU6IG9wdGlvbi52YWx1ZSB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogeyB2YWx1ZTogb3B0aW9uLmxhYmVsIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5DaGVja3NHcm91cCwge1xyXG4gICAgICAgIG5hbWU6ICdjaGVjay1kZWZhdWx0JyxcclxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9jaGVjay9jaGVjay1kZWZhdWx0LnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkNoZWNrV2lkZ2V0RmFjdG9yeSgnZGVmYXVsdCcsIFsgJ0EnLCAnQicgXSwgW1xyXG4gICAgICAgICAgICB7IHZhbHVlOiAnQScsIGxhYmVsOiAnQScgfSxcclxuICAgICAgICAgICAgeyB2YWx1ZTogJ0InLCBsYWJlbDogJ0InIH0sXHJcbiAgICAgICAgICAgIHsgdmFsdWU6ICdDJywgbGFiZWw6ICdDJyB9LFxyXG4gICAgICAgIF0pLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQ2hlY2tzR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnY2hlY2stcHJpbWFyeScsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vY2hlY2svY2hlY2stcHJpbWFyeS5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5DaGVja1dpZGdldEZhY3RvcnkoJ3ByaW1hcnknLCBbICdBJywgJ0InIF0sIFtcclxuICAgICAgICAgICAgeyB2YWx1ZTogJ0EnLCBsYWJlbDogJ0EnIH0sXHJcbiAgICAgICAgICAgIHsgdmFsdWU6ICdCJywgbGFiZWw6ICdCJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnQycsIGxhYmVsOiAnQycgfSxcclxuICAgICAgICBdKSxcclxuICAgIH0pO1xyXG5cclxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkNoZWNrc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ2NoZWNrLXN1Y2Nlc3MnLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2NoZWNrL2NoZWNrLXN1Y2Nlc3MucG5nJyxcclxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuQ2hlY2tXaWRnZXRGYWN0b3J5KCdzdWNjZXNzJywgWyAnQScsICdCJyBdLCBbXHJcbiAgICAgICAgICAgIHsgdmFsdWU6ICdBJywgbGFiZWw6ICdBJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnQicsIGxhYmVsOiAnQicgfSxcclxuICAgICAgICAgICAgeyB2YWx1ZTogJ0MnLCBsYWJlbDogJ0MnIH0sXHJcbiAgICAgICAgXSksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5DaGVja3NHcm91cCwge1xyXG4gICAgICAgIG5hbWU6ICdjaGVjay1pbmZvJyxcclxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9jaGVjay9jaGVjay1pbmZvLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkNoZWNrV2lkZ2V0RmFjdG9yeSgnaW5mbycsIFsgJ0EnLCAnQicgXSwgW1xyXG4gICAgICAgICAgICB7IHZhbHVlOiAnQScsIGxhYmVsOiAnQScgfSxcclxuICAgICAgICAgICAgeyB2YWx1ZTogJ0InLCBsYWJlbDogJ0InIH0sXHJcbiAgICAgICAgICAgIHsgdmFsdWU6ICdDJywgbGFiZWw6ICdDJyB9LFxyXG4gICAgICAgIF0pLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQ2hlY2tzR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnY2hlY2std2FybmluZycsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vY2hlY2svY2hlY2std2FybmluZy5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5DaGVja1dpZGdldEZhY3RvcnkoJ3dhcm5pbmcnLCBbICdBJywgJ0InIF0sIFtcclxuICAgICAgICAgICAgeyB2YWx1ZTogJ0EnLCBsYWJlbDogJ0EnIH0sXHJcbiAgICAgICAgICAgIHsgdmFsdWU6ICdCJywgbGFiZWw6ICdCJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnQycsIGxhYmVsOiAnQycgfSxcclxuICAgICAgICBdKSxcclxuICAgIH0pO1xyXG5cclxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkNoZWNrc0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ2NoZWNrLWRhbmdlcicsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vY2hlY2svY2hlY2stZGFuZ2VyLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkNoZWNrV2lkZ2V0RmFjdG9yeSgnZGFuZ2VyJywgWyAnQScsICdCJyBdLCBbXHJcbiAgICAgICAgICAgIHsgdmFsdWU6ICdBJywgbGFiZWw6ICdBJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnQicsIGxhYmVsOiAnQicgfSxcclxuICAgICAgICAgICAgeyB2YWx1ZTogJ0MnLCBsYWJlbDogJ0MnIH0sXHJcbiAgICAgICAgXSksXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xyXG5cclxuICAgIFdpZGdldHMuUmFkaW9XaWRnZXQgPVxyXG4gICAgV2lkZ2V0cy5XaWRnZXQoV2lkZ2V0cy5SYWRpb3NHcm91cCwgV2lkZ2V0cy5jcmVhdGUoe1xyXG4gICAgICAgIG5hbWU6ICdkZWZhdWx0LXJhZGlvJyxcclxuICAgICAgICB0YWc6ICdkZWZhdWx0LXJhZGlvJyxcclxuICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcclxuICAgICAgICBwcm9wczogW1xyXG4gICAgICAgICAgICB7IG5hbWU6ICdtb2RlbCcsIHRpdGxlOiAnTW9kZWwnLCB0eXBlOiAndmFyJywgdGFiOiAnZGF0YScsIHZhcmlhYmxlOiB0cnVlIH0sXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ3N0ZXJlb3R5cGUnLCB0aXRsZTogJ1N0ZXJlb3R5cGUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ2l0ZW1zJywgdHlwZTogJ211bHRpcGxlJywgdGl0bGU6ICdJdGVtcycsIHRhYjogJ2RhdGEnLFxyXG4gICAgICAgICAgICAgICAgdGFiczogW1xyXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2RhdGEnLCB0aXRsZTogJ0RhdGEnIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgcHJvcHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICd2YWx1ZScsIHRpdGxlOiAnVmFsdWUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdsYWJlbCcsIHRpdGxlOiAnTGFiZWwnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgfSkpO1xyXG5cclxuICAgIFdpZGdldHMuUmFkaW9XaWRnZXRGYWN0b3J5ID0gZnVuY3Rpb24oc3RlcmVvdHlwZSwgdmFsdWUsIG9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFdpZGdldHMuYnVpbGQoV2lkZ2V0cy5SYWRpb1dpZGdldCwge1xyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHsgdmFsdWU6IHZhbHVlIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaW5uZXI6IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiB7IHZhbHVlOiAnMTVweCAxNXB4JyB9LFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdGVyZW90eXBlOiB7IHZhbHVlOiBzdGVyZW90eXBlIH0sXHJcbiAgICAgICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogb3B0aW9ucy5tYXAoZnVuY3Rpb24ob3B0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHsgdmFsdWU6IG9wdGlvbi52YWx1ZSB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogeyB2YWx1ZTogb3B0aW9uLmxhYmVsIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAncmFkaW8tZGVmYXVsdCcsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vcmFkaW8vcmFkaW8tZGVmYXVsdC5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5SYWRpb1dpZGdldEZhY3RvcnkoJ2RlZmF1bHQnLCAnMScsIFtcclxuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnMCcsIGxhYmVsOiAnT2ZmJyB9LFxyXG4gICAgICAgIF0pLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAncmFkaW8tcHJpbWFyeScsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vcmFkaW8vcmFkaW8tcHJpbWFyeS5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5SYWRpb1dpZGdldEZhY3RvcnkoJ3ByaW1hcnknLCAnMScsIFtcclxuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnMCcsIGxhYmVsOiAnT2ZmJyB9LFxyXG4gICAgICAgIF0pLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAncmFkaW8tc3VjY2VzcycsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vcmFkaW8vcmFkaW8tc3VjY2Vzcy5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5SYWRpb1dpZGdldEZhY3RvcnkoJ3N1Y2Nlc3MnLCAnMScsIFtcclxuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnMCcsIGxhYmVsOiAnT2ZmJyB9LFxyXG4gICAgICAgIF0pLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAncmFkaW8taW5mbycsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vcmFkaW8vcmFkaW8taW5mby5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5SYWRpb1dpZGdldEZhY3RvcnkoJ2luZm8nLCAnMScsIFtcclxuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnMCcsIGxhYmVsOiAnT2ZmJyB9LFxyXG4gICAgICAgIF0pLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAncmFkaW8td2FybmluZycsXHJcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vcmFkaW8vcmFkaW8td2FybmluZy5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5SYWRpb1dpZGdldEZhY3RvcnkoJ3dhcm5pbmcnLCAnMScsIFtcclxuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnMCcsIGxhYmVsOiAnT2ZmJyB9LFxyXG4gICAgICAgIF0pLFxyXG4gICAgfSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAncmFkaW8tZGFuZ2VyJyxcclxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9yYWRpby9yYWRpby1kYW5nZXIucG5nJyxcclxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuUmFkaW9XaWRnZXRGYWN0b3J5KCdkYW5nZXInLCAnMScsIFtcclxuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxyXG4gICAgICAgICAgICB7IHZhbHVlOiAnMCcsIGxhYmVsOiAnT2ZmJyB9LFxyXG4gICAgICAgIF0pLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXJhZGlvJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtcmFkaW8nLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtaW5wdXQtdGV4dCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWlucHV0LXRleHQnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdtb2RlbCcsIHRoaXMuYmluZGluZ3MpO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnc3RvcmFnZScsIHRoaXMuc3RvcmFnZS5vbmUpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtaW5wdXQtdGV4dGFyZWEnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1pbnB1dC10ZXh0YXJlYScsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtaW5wdXQtY2hlY2tib3gnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1pbnB1dC1jaGVja2JveCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtaW5wdXQtcmFkaW8nLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1pbnB1dC1yYWRpbycsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XHJcblxyXG4gICAgV2lkZ2V0cy5JbnB1dFdpZGdldCA9XHJcbiAgICBXaWRnZXRzLldpZGdldChXaWRnZXRzLklucHV0c0dyb3VwLCBXaWRnZXRzLmNyZWF0ZSh7XHJcbiAgICAgICAgbmFtZTogJ2RlZmF1bHQtaW5wdXQtdGV4dCcsXHJcbiAgICAgICAgdGFnOiAnZGVmYXVsdC1pbnB1dC10ZXh0JyxcclxuICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcclxuICAgICAgICBwcm9wczogW1xyXG4gICAgICAgICAgICB7IG5hbWU6ICdtb2RlbCcsIHRpdGxlOiAnTW9kZWwnLCB0eXBlOiAndmFyJywgdGFiOiAnZGF0YScsIHZhcmlhYmxlOiB0cnVlIH0sXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ3R5cGUnLCB0aXRsZTogJ1R5cGUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnY29udGVudCcgfSxcclxuICAgICAgICAgICAgeyBuYW1lOiAnbGFiZWwnLCB0aXRsZTogJ0xhYmVsJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2NvbnRlbnQnIH0sXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ3BsYWNlaG9sZGVyJywgdGl0bGU6ICdQbGFjZWhvbGRlcicsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdjb250ZW50JyB9LFxyXG4gICAgICAgIF0sXHJcbiAgICB9KSk7XHJcblxyXG4gICAgV2lkZ2V0cy5JbnB1dFdpZGdldEZhY3RvcnkgPSBmdW5jdGlvbihsYWJlbCwgdHlwZSkge1xyXG5cclxuICAgICAgICByZXR1cm4gV2lkZ2V0cy5idWlsZChXaWRnZXRzLklucHV0V2lkZ2V0LCB7XHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogeyB2YWx1ZTogJycgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBpbm5lcjoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW46IHsgdmFsdWU6ICcxNXB4IDE1cHgnIH0sXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGxhYmVsOiB7IHZhbHVlOiBsYWJlbCB9LFxyXG4gICAgICAgICAgICB0eXBlOiB7IHZhbHVlOiB0eXBlIH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLklucHV0c0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ2lucHV0LXRleHQnLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2lucHV0L3RleHQucG5nJyxcclxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuSW5wdXRXaWRnZXRGYWN0b3J5KCdJbnB1dCcsICd0ZXh0JyksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLlRleHRhcmVhV2lkZ2V0ID1cclxuICAgIFdpZGdldHMuV2lkZ2V0KFdpZGdldHMuSW5wdXRzR3JvdXAsIFdpZGdldHMuY3JlYXRlKHtcclxuICAgICAgICBuYW1lOiAnZGVmYXVsdC1pbnB1dC10ZXh0YXJlYScsXHJcbiAgICAgICAgdGFnOiAnZGVmYXVsdC1pbnB1dC10ZXh0YXJlYScsXHJcbiAgICAgICAgbWl4aW5zOiBbIFdpZGdldHMuV2lkZ2V0TWl4aW4sIFdpZGdldHMuQm94TWl4aW4sIFdpZGdldHMuU2l6ZU1peGluIF0sXHJcbiAgICAgICAgcHJvcHM6IFtcclxuICAgICAgICAgICAgeyBuYW1lOiAnbW9kZWwnLCB0aXRsZTogJ01vZGVsJywgdHlwZTogJ3ZhcicsIHRhYjogJ2RhdGEnLCB2YXJpYWJsZTogdHJ1ZSB9LFxyXG4gICAgICAgICAgICB7IG5hbWU6ICdsYWJlbCcsIHRpdGxlOiAnTGFiZWwnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICAgICAgeyBuYW1lOiAncGxhY2Vob2xkZXInLCB0aXRsZTogJ1BsYWNlaG9sZGVyJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXHJcbiAgICAgICAgXSxcclxuICAgIH0pKTtcclxuXHJcbiAgICBXaWRnZXRzLlRleHRhcmVhV2lkZ2V0RmFjdG9yeSA9IGZ1bmN0aW9uKGxhYmVsLCBwbGFjZWhvbGRlcikge1xyXG5cclxuICAgICAgICByZXR1cm4gV2lkZ2V0cy5idWlsZChXaWRnZXRzLlRleHRhcmVhV2lkZ2V0LCB7XHJcbiAgICAgICAgICAgIG1vZGVsOiB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogeyB2YWx1ZTogJycgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogeyB2YWx1ZTogcGxhY2Vob2xkZXIgfSxcclxuICAgICAgICAgICAgaW5uZXI6IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiB7IHZhbHVlOiAnMTVweCAxNXB4JyB9LFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBsYWJlbDogeyB2YWx1ZTogbGFiZWwgfSxcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuSW5wdXRzR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnaW5wdXQtdGV4dGFyZWEnLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2lucHV0L3RleHRhcmVhLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRhcmVhV2lkZ2V0RmFjdG9yeSgnVGV4dGFyZWEnLCAnVHlwZSBtZXNzYWdlIGhlcmUnKSxcclxuICAgIH0pO1xyXG5cclxuICAgIFdpZGdldHMuUmFkaW9JbnB1dFdpZGdldCA9XHJcbiAgICBXaWRnZXRzLldpZGdldChXaWRnZXRzLklucHV0c0dyb3VwLCBXaWRnZXRzLmNyZWF0ZSh7XHJcbiAgICAgICAgbmFtZTogJ2RlZmF1bHQtaW5wdXQtcmFkaW8nLFxyXG4gICAgICAgIHRhZzogJ2RlZmF1bHQtaW5wdXQtcmFkaW8nLFxyXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluLCBXaWRnZXRzLlNpemVNaXhpbiBdLFxyXG4gICAgICAgIHByb3BzOiBbXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ21vZGVsJywgdGl0bGU6ICdNb2RlbCcsIHR5cGU6ICd2YXInLCB0YWI6ICdkYXRhJywgdmFyaWFibGU6IHRydWUgfSxcclxuICAgICAgICAgICAgeyBuYW1lOiAnc3RlcmVvdHlwZScsIHRpdGxlOiAnU3RlcmVvdHlwZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnaXRlbXMnLCB0eXBlOiAnbXVsdGlwbGUnLCB0aXRsZTogJ0l0ZW1zJywgdGFiOiAnZGF0YScsXHJcbiAgICAgICAgICAgICAgICB0YWJzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnZGF0YScsIHRpdGxlOiAnRGF0YScgfSxcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBwcm9wczogW1xyXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ3ZhbHVlJywgdGl0bGU6ICdWYWx1ZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2xhYmVsJywgdGl0bGU6ICdMYWJlbCcsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICB9KSk7XHJcblxyXG4gICAgV2lkZ2V0cy5SYWRpb0lucHV0V2lkZ2V0RmFjdG9yeSA9IGZ1bmN0aW9uKHZhbHVlLCBvcHRpb25zKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBXaWRnZXRzLmJ1aWxkKFdpZGdldHMuUmFkaW9JbnB1dFdpZGdldCwge1xyXG4gICAgICAgICAgICBtb2RlbDoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHsgdmFsdWU6IHZhbHVlIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaW5uZXI6IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiB7IHZhbHVlOiAnMTVweCAxNXB4JyB9LFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IG9wdGlvbnMubWFwKGZ1bmN0aW9uKG9wdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBXaWRnZXRzLlBhcmFtKG9wdGlvbi52YWx1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBXaWRnZXRzLlBhcmFtKG9wdGlvbi5sYWJlbCksXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuSW5wdXRzR3JvdXAsIHtcclxuICAgICAgICBuYW1lOiAnaW5wdXQtcmFkaW8nLFxyXG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2lucHV0L3JhZGlvLnBuZycsXHJcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlJhZGlvSW5wdXRXaWRnZXRGYWN0b3J5KCcxJywgW1xyXG4gICAgICAgICAgICB7IHZhbHVlOiAnMScsIGxhYmVsOiAnRmlyc3QnIH0sXHJcbiAgICAgICAgICAgIHsgdmFsdWU6ICcyJywgbGFiZWw6ICdTZWNvbmQnIH0sXHJcbiAgICAgICAgXSksXHJcbiAgICB9KTtcclxuXHJcbiAgICBXaWRnZXRzLkNoZWNrSW5wdXRXaWRnZXQgPVxyXG4gICAgV2lkZ2V0cy5XaWRnZXQoV2lkZ2V0cy5JbnB1dHNHcm91cCwgV2lkZ2V0cy5jcmVhdGUoe1xyXG4gICAgICAgIG5hbWU6ICdkZWZhdWx0LWlucHV0LWNoZWNrYm94JyxcclxuICAgICAgICB0YWc6ICdkZWZhdWx0LWlucHV0LWNoZWNrYm94JyxcclxuICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcclxuICAgICAgICBwcm9wczogW1xyXG4gICAgICAgICAgICB7IG5hbWU6ICdtb2RlbCcsIHRpdGxlOiAnTW9kZWwnLCB0eXBlOiAndmFyJywgdGFiOiAnZGF0YScsIHZhcmlhYmxlOiB0cnVlIH0sXHJcbiAgICAgICAgICAgIHsgbmFtZTogJ3N0ZXJlb3R5cGUnLCB0aXRsZTogJ1N0ZXJlb3R5cGUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ2l0ZW1zJywgdHlwZTogJ211bHRpcGxlJywgdGl0bGU6ICdJdGVtcycsIHRhYjogJ2RhdGEnLFxyXG4gICAgICAgICAgICAgICAgdGFiczogW1xyXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2RhdGEnLCB0aXRsZTogJ0RhdGEnIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgcHJvcHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICd2YWx1ZScsIHRpdGxlOiAnVmFsdWUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdsYWJlbCcsIHRpdGxlOiAnTGFiZWwnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgfSkpO1xyXG5cclxuICAgIFdpZGdldHMuQ2hlY2tJbnB1dFdpZGdldEZhY3RvcnkgPSBmdW5jdGlvbih2YWx1ZSwgb3B0aW9ucykge1xyXG5cclxuICAgICAgICByZXR1cm4gV2lkZ2V0cy5idWlsZChXaWRnZXRzLkNoZWNrSW5wdXRXaWRnZXQsIHtcclxuICAgICAgICAgICAgbW9kZWw6IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7IHZhbHVlOiB2YWx1ZSB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGlubmVyOiB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbjogeyB2YWx1ZTogJzE1cHggMTVweCcgfSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBvcHRpb25zLm1hcChmdW5jdGlvbihvcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogV2lkZ2V0cy5QYXJhbShvcHRpb24udmFsdWUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogV2lkZ2V0cy5QYXJhbShvcHRpb24ubGFiZWwpLFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLklucHV0c0dyb3VwLCB7XHJcbiAgICAgICAgbmFtZTogJ2lucHV0LWNoZWNrJyxcclxuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9pbnB1dC9jaGVja2JveC5wbmcnLFxyXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5DaGVja0lucHV0V2lkZ2V0RmFjdG9yeShbICcxJyBdLCBbXHJcbiAgICAgICAgICAgIHsgdmFsdWU6ICcxJywgbGFiZWw6ICdGaXJzdCcgfSxcclxuICAgICAgICAgICAgeyB2YWx1ZTogJzInLCBsYWJlbDogJ1NlY29uZCcgfSxcclxuICAgICAgICBdKSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFdpZGdldHMpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1ib3gnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1ib3gnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGJpbmRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGNsYXNzOiBTdHJpbmcsXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcclxuXHJcbiAgICBXaWRnZXRzLlN0dWJXaWRnZXQgPVxyXG4gICAgV2lkZ2V0cy5XaWRnZXQoV2lkZ2V0cy5VdGlsR3JvdXAsIFdpZGdldHMuY3JlYXRlKHtcclxuICAgICAgICBfYWN0aW9uOiAnaWdub3JlJyxcclxuICAgICAgICBuYW1lOiAnZGVmYXVsdC1zdHViJyxcclxuICAgICAgICB0YWc6ICdkZWZhdWx0LXN0dWInLFxyXG4gICAgICAgIG1peGluczogWyBXaWRnZXRzLkJveE1peGluIF0sXHJcbiAgICAgICAgcHJvcHM6IFtcclxuICAgICAgICAgICAgeyBuYW1lOiAnY29udGVudCcsIHR5cGU6ICdyaWNoJyB9XHJcbiAgICAgICAgXSxcclxuICAgIH0pKTtcclxuXHJcbiAgICBXaWRnZXRzLlN0dWJXaWRnZXRGYWN0b3J5ID0gZnVuY3Rpb24oY29udGVudCkge1xyXG5cclxuICAgICAgICByZXR1cm4gV2lkZ2V0cy5idWlsZChXaWRnZXRzLlN0dWJXaWRnZXQsIHtcclxuICAgICAgICAgICAgY29udGVudDogeyB2YWx1ZTogY29udGVudCB9LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFdpZGdldHMpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1zdHViJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtc3R1YicsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1wbGFjZWhvbGRlcicsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXBsYWNlaG9sZGVyJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XHJcblxyXG4gICAgQ29yZS5Qb3J0YWxzRmFjdG9yeSA9IGZ1bmN0aW9uKG93bmVyKSB7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcblxyXG4gICAgICAgICAgICBsb2FkOiAoZGF0YSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLmdldCgnL3dzL3BvcnRhbHMnLCBkYXRhKS50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHJlc29sdmUoZCk7IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgcmVqZWN0KGUpOyB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KSxcclxuXHJcbiAgICAgICAgICAgIGNyZWF0ZTogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5wb3N0KCcvd3MvcG9ydGFscycsIGRhdGEpLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgcmVzb2x2ZShkKTsgfSxcclxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyByZWplY3QoZSk7IH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pLFxyXG5cclxuICAgICAgICAgICAgcmVtb3ZlOiAoZGF0YSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLmRlbGV0ZShgL3dzL3BvcnRhbHMvJHtkYXRhLmlkfWApLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgcmVzb2x2ZShkKTsgfSxcclxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyByZWplY3QoZSk7IH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pLFxyXG5cclxuICAgICAgICAgICAgZ2V0OiAoZGF0YSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLmdldChgL3dzL3BvcnRhbHMvJHtkYXRhLmlkfWApLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgcmVzb2x2ZShkKTsgfSxcclxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyByZWplY3QoZSk7IH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xyXG5cclxuICAgIENvcmUuU2VjdXJpdHlGYWN0b3J5ID0gZnVuY3Rpb24ob3duZXIpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgICAgIHNpZ251cDogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5wb3N0KCcvd3Mvc2lnbnVwJywgZGF0YSkudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyBvd25lci5wcmluY2lwYWwgPSBkLmRhdGEucHJpbmNpcGFsOyByZXNvbHZlKGQpOyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IG93bmVyLnByaW5jaXBhbCA9IG51bGw7IHJlamVjdChlKTsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSksXHJcblxyXG4gICAgICAgICAgICBzaWduaW46IChkYXRhKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgb3duZXIuJGh0dHAucG9zdCgnL3dzL3NpZ25pbicsIGRhdGEpLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgb3duZXIucHJpbmNpcGFsID0gZC5kYXRhLnByaW5jaXBhbDsgcmVzb2x2ZShkKTsgfSxcclxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyBvd25lci5wcmluY2lwYWwgPSBudWxsOyByZWplY3QoZSk7IH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pLFxyXG5cclxuICAgICAgICAgICAgc2lnbm91dDogKCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLnBvc3QoJy93cy9zaWdub3V0JykudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyBvd25lci5wcmluY2lwYWwgPSBudWxsOyByZXNvbHZlKGQpOyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IHJlamVjdChlKTsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XHJcblxyXG4gICAgTGFuZGluZy5MYW5kaW5nUGFnZSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXBhZ2UnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ0dhbGxlcnlQYWdlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctZ2FsbGVyeS1wYWdlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctZ2FsbGVyeS1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ1N0b3JhZ2VQYWdlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctc3RvcmFnZS1wYWdlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctc3RvcmFnZS1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ1NpZ25pblBhZ2UgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1zaWduaW4tcGFnZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXNpZ25pbi1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ1NpZ251cFBhZ2UgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1zaWdudXAtcGFnZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXNpZ251cC1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ1Byb2ZpbGVQYWdlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctcHJvZmlsZS1wYWdlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctcHJvZmlsZS1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ01hbmFnZVBhZ2UgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1tYW5hZ2UtcGFnZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLW1hbmFnZS1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ01hbmFnZUNyZWF0ZVBhZ2UgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1tYW5hZ2UtY3JlYXRlLXBhZ2UnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1tYW5hZ2UtY3JlYXRlLXBhZ2UnLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xyXG5cclxuICAgIHZhciB2YWxpZGF0aW9uID0ge1xyXG4gICAgICAgIGVtYWlsOiBcIi9eKFthLXpBLVowLTlfXFxcXC5cXFxcLV0rKUAoW2EtekEtWjAtOV9cXFxcLlxcXFwtXSspXFxcXC4oW2EtekEtWjAtOV17Mix9KSQvZ1wiLFxyXG4gICAgfTtcclxuXHJcbiAgICBMYW5kaW5nLlNpZ25pbiA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWFjY291bnQtc2lnbmluJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctYWNjb3VudC1zaWduaW4nLFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZm9ybTogdGhpcy5mb3JtLFxyXG4gICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogdmFsaWRhdGlvbixcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJHNldCgnZm9ybScsIHtcclxuICAgICAgICAgICAgICAgIGVtYWlsOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IG51bGwsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBzaWduaW46IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdzZWN1cml0eScpLnNpZ25pbih7XHJcbiAgICAgICAgICAgICAgICAgICAgZW1haWw6IHRoaXMuZm9ybS5lbWFpbCxcclxuICAgICAgICAgICAgICAgICAgICBwYXNzd29yZDogdGhpcy5mb3JtLnBhc3N3b3JkLFxyXG4gICAgICAgICAgICAgICAgfSkudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyB0aGlzLiRyb3V0ZXIuZ28oJy8nKTsgfSxcclxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuU2lnbnVwID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctYWNjb3VudC1zaWdudXAnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1hY2NvdW50LXNpZ251cCcsXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBmb3JtOiB0aGlzLmZvcm0sXHJcbiAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiB2YWxpZGF0aW9uLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy4kc2V0KCdmb3JtJywge1xyXG4gICAgICAgICAgICAgICAgZW1haWw6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogbnVsbCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHNpZ251cDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3NlY3VyaXR5Jykuc2lnbnVwKHtcclxuICAgICAgICAgICAgICAgICAgICBlbWFpbDogdGhpcy5mb3JtLmVtYWlsLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkOiB0aGlzLmZvcm0ucGFzc3dvcmQsXHJcbiAgICAgICAgICAgICAgICB9KS50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHRoaXMuJHJvdXRlci5nbygnLycpOyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgTGFuZGluZy5Qcm9maWxlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctYWNjb3VudC1wcm9maWxlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctYWNjb3VudC1wcm9maWxlJyxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcclxuIiwiIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcclxuXHJcbiAgICBMYW5kaW5nLkZlZWRiYWNrID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctZmVlZGJhY2snLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1mZWVkYmFjaycsXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XHJcblxyXG4gICAgTGFuZGluZy5Gb290ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1mb290ZXInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1mb290ZXInLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xyXG4iLCIiLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xyXG5cclxuICAgIExhbmRpbmcuR2FsbGVyeSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWdhbGxlcnknLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1nYWxsZXJ5JyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuR2FsbGVyeUZ1bGwgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1nYWxsZXJ5LWZ1bGwnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1nYWxsZXJ5LWZ1bGwnLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xyXG5cclxuICAgIExhbmRpbmcuSGVhZGVyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctaGVhZGVyJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctaGVhZGVyJyxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHNpZ25vdXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3NlY3VyaXR5Jykuc2lnbm91dCgpLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgdGhpcy4kcm91dGVyLmdvKCcvJyk7IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XHJcblxyXG4gICAgTGFuZGluZy5NYW5hZ2UgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1tYW5hZ2UnLCB7XHJcblxyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctbWFuYWdlJyxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSArICh3aW5kb3cubG9jYXRpb24ucG9ydCA/ICc6JyArIHdpbmRvdy5sb2NhdGlvbi5wb3J0OiAnJyksXHJcbiAgICAgICAgICAgICAgICBwb3J0YWxzOiB0aGlzLnBvcnRhbHMsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcblxyXG4gICAgICAgICAgICByZWZyZXNoOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdwb3J0YWxzJykubG9hZCgpLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgdGhpcy4kc2V0KCdwb3J0YWxzJywgZC5kYXRhLnBvcnRhbHMpOyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IHRoaXMuJHNldCgncG9ydGFscycsIFtdKTsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24oaWQpIHtcclxuICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdwb3J0YWxzJykucmVtb3ZlKHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogaWQsXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgdGhpcy5yZWZyZXNoKCk7IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBMYW5kaW5nLk1hbmFnZUNyZWF0ZSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLW1hbmFnZS1jcmVhdGUnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1tYW5hZ2UtY3JlYXRlJyxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGZvcm06IHRoaXMuZm9ybSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJHNldCgnZm9ybScsIHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiBudWxsLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBWdWUuc2VydmljZSgncG9ydGFscycpLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMuZm9ybS50aXRsZSxcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyB0aGlzLiRyb3V0ZXIuZ28oJy9tYW5hZ2UnKX0sXHJcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XHJcblxyXG4gICAgTGFuZGluZy5TdG9yYWdlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctcHJpY2luZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXByaWNpbmcnLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xyXG5cclxuICAgIExhbmRpbmcuU3RvcmFnZSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXN0b3JhZ2UnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1zdG9yYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuU3RvcmFnZUZ1bGwgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1zdG9yYWdlLWZ1bGwnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1zdG9yYWdlLWZ1bGwnLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xyXG5cclxuICAgIExhbmRpbmcuVXNlY2FzZXMgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy11c2VjYXNlcycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXVzZWNhc2VzJyxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcclxuXHJcbiAgICBMYW5kaW5nLlN1cGVyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctc3VwZXInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1zdXBlcicsXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XHJcblxyXG4gICAgTGFuZGluZy5WaWRlbyA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXZpZGVvJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctdmlkZW8nLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
