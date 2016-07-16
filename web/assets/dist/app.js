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

            // console.log('created', ParamMultipleModalEditor);

            console.log(this.context.prop);

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

                console.log(item);

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

            find: function(children, domIndex) {

                var index = 0;
                for (var i = 0; i < children.length && index < domIndex; i++) {

                    var child = children[i];

                    if (child._action != 'remove') {
                        index++;
                    }
                }

                return index;
            }
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

                    dragged = {
                        stack: stack,
                        index: stack.find(stack.items, context.$originalItem.index()),
                        vue: context.$originalItem.find('.ge.ge-widget:first').get(0).__vue__,
                    };
                },
                onDrop: function(context, event, _super) {

                    _super(context, event);

                    var stack = context.location.$container.closest('.ge.ge-widget').get(0).__vue__;

                    var w = context.$item.data('widget');

                    if (w) {

                        var ni = stack.find(stack.items, context.$item.index());
                        stack.items.splice(ni, 0, Vue.service('palette').widget(w));

                    } else {

                        if (dragged) {

                            var ni = stack.find(stack.items, context.$item.index());
                            var newItem = JSON.parse(JSON.stringify(dragged.vue.model));
                            newItem._action = 'create';
                            if ('resource' in newItem) {
                                delete newItem.resource.id;
                            }
                            delete newItem.id;

                            dragged.stack.items.splice(dragged.index, 1);
                            stack.items.splice(ni, 0, newItem);
                        }
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
        // attached: function() {
        //
        //     // var adjustment;
        //     // var dragged;
        //     // var oldContainer;
        //
        //     $(this.$el).sortable({
        //         group: 'widgets',
        //         clone: true,
        //         containerSelector: '.wg-sortable-container',
        //         itemSelector: '.wg-sortable-item',
        //         drop: false,
        //         // containerPath: '.wg.wg-item-content > .wg.wg-inner > .ge.ge-decorator > .ge.ge-widget > .ge.ge-content > .wg.wg-sortable > .wg.wg-sortable-content > .wg.wg-sortable-inner',
        //         // itemPath: '',
        //         // verticalClass: "wg-sortable-vertical",
        //         // horisontalClass: "wg-sortable-horisontal",
        //         // placeholder: `
        //         //     <div class="wg wg-sortable-placeholder">
        //         //         <div class="wg wg-placeholder-container">
        //         //             <div class="wg wg-placeholder-inner"></div>
        //         //         </div>
        //         //     </div>
        //         // `,
        //         // afterMove: function (placeholder, container) {
        //         //
        //         //     if(oldContainer != container) {
        //         //
        //         //         if(oldContainer) {
        //         //             oldContainer.el.removeClass("active");
        //         //         }
        //         //         container.el.addClass("active");
        //         //
        //         //         oldContainer = container;
        //         //     }
        //         // },
        //         // onDragStart: function ($item, container, _super) {
        //         //
        //         //     // $(container.el).parents('.wg-sortable-container').sortable('disable');
        //         //
        //         //     // console.log($item, $item.find('.wg-sortable-container').length);
        //         //     // $item.find('.wg-sortable-container').sortable('disable');
        //         //
        //         //     // console.log($('.wg-sortable-container', container.el));
        //         //
        //         //     // console.log('disable', $('.wg-sortable-container', container.el).length);
        //         //     // $('.wg-sortable-container', container.el).sortable('disable');
        //         //
        //         //     var w = $item.data('widget');
        //         //     if (!w) {
        //         //
        //         //         var stack = $(container.el).closest('.ge.ge-widget').get(0).__vue__;
        //         //
        //         //         dragged = {
        //         //             stack: stack,
        //         //             index: stack.find(stack.items, $item.index()),
        //         //             vue: $item.find('.ge.ge-widget:first').get(0).__vue__,
        //         //         };
        //         //     }
        //         //
        //         //     if(!container.options.drop) {
        //         //         $item.clone().insertAfter($item);
        //         //     }
        //         //
        //         //     var offset = $item.offset();
        //         //     var pointer = container.rootGroup.pointer;
        //         //
        //         //     adjustment = {
        //         //         left: pointer.left - offset.left,
        //         //         top: pointer.top - offset.top,
        //         //     };
        //         //
        //         //     _super($item, container);
        //         // },
        //         // onDrop: function ($item, container, _super, event) {
        //         //
        //         //     // $item.find('.wg-sortable-container').sortable('enable');
        //         //     // console.log($item);
        //         //
        //         //     // $('.wg-sortable-container', container.el).sortable('enable');
        //         //
        //         //     var stack = $(container.el).closest('.ge.ge-widget').get(0).__vue__;
        //         //
        //         //     var w = $item.data('widget');
        //         //
        //         //     if (w) {
        //         //
        //         //         var ni = stack.find(stack.items, $item.index());
        //         //         stack.items.splice(ni, 0, Vue.service('palette').widget(w));
        //         //         $item.remove();
        //         //
        //         //     } else {
        //         //
        //         //         if (dragged) {
        //         //
        //         //             var ni = stack.find(stack.items, $item.index());
        //         //             var newItem = JSON.parse(JSON.stringify(dragged.vue.model));
        //         //             newItem._action = 'create';
        //         //             if ('resource' in newItem) {
        //         //                 delete newItem.resource.id;
        //         //             }
        //         //             delete newItem.id;
        //         //
        //         //             dragged.stack.items.splice(dragged.index, 1);
        //         //             stack.items.splice(ni, 0, newItem);
        //         //
        //         //             $item.removeClass(container.group.options.draggedClass).removeAttr("style");
        //         //         }
        //         //     }
        //         //
        //         //     dragged = null;
        //         //
        //         //     $("body").removeClass(container.group.options.bodyClass);
        //         // },
        //         // onDrag: function ($item, position) {
        //         //     $item.css({
        //         //         left: position.left - adjustment.left,
        //         //         top: position.top - adjustment.top,
        //         //     });
        //         // },
        //     });
        // }
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

            // console.log('widget');

            var shell = Vue.service('shell');

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

        var placeholder = function(content) {
            return {
                tag: 'default-stub',
                _action: 'ignore',
                props: [
                    { name: 'content', type: 'string' }
                ],
                params: {
                    content: { value: content },
                }
            };
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
            placeholder: placeholder,
            generateId: generateId,
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
            widgets: config.widgets || undefined,
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

        function initParams(props, params) {

            for (var i = 0; i < props.length; i++) {

                var prop = props[i];
                var param = params[prop.name] = params[prop.name] || { value: null }; // TODO Set a type-dependent initial value

                if (prop.props) {
                    initParams(prop, param);
                }
            }
        }

        initParams(result.props, result.params);

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

    Widgets.FormCategory = Widgets.Category('default-form', 'Form Elements');
    Widgets.TextCategory = Widgets.Category('default-text', 'Text Elements');
    Widgets.ContainerCategory = Widgets.Category('default-container', 'Container Elements');

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

    Widgets.StackWidget = function(tag) {

        return Widgets.extend({
            tag: tag,
            mixins: [ Widgets.WidgetMixin, Widgets.BoxMixin ],
            widgets: [],
        });
    };

    Widgets.Item(Widgets.StackGroup, 'stack-horisontal', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/container/stack/stack-horisontal.png',
        widget: Widgets.StackWidget('default-stack-horisontal'),
    });

    Widgets.Item(Widgets.StackGroup, 'stack-vertical', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/container/stack/stack-vertical.png',
        widget: Widgets.StackWidget('default-stack-vertical'),
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
                margin:     Widgets.Param('15px 15px'),
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

})(jQuery, Vue, Core, Widgets);

(function($, Vue, Core) {

    Vue.component('default-check', {
        template: '#default-check',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core, Widgets) {

    Widgets.CheckWidget = function(stereotype, value, options) {

        return Widgets.extend({
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
            params: {
                model:      Widgets.Param({ value: value }),
                margin:     Widgets.Param('15px 15px'),
                stereotype: Widgets.Param(stereotype),
                items: {
                    value: options.map(function(option) {
                        return {
                            value: Widgets.Param(option.value),
                            label: Widgets.Param(option.label),
                        };
                    })
                }
            },
        });
    }

    Widgets.Item(Widgets.ChecksGroup, 'check-default', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/check/check-default.png',
        widget: Widgets.CheckWidget('default', [ 'A', 'B' ], [
            { value: 'A', label: 'A' },
            { value: 'B', label: 'B' },
            { value: 'C', label: 'C' },
        ]),
    });

    Widgets.Item(Widgets.ChecksGroup, 'check-primary', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/check/check-primary.png',
        widget: Widgets.CheckWidget('primary', [ 'A', 'B' ], [
            { value: 'A', label: 'A' },
            { value: 'B', label: 'B' },
            { value: 'C', label: 'C' },
        ]),
    });

    Widgets.Item(Widgets.ChecksGroup, 'check-success', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/check/check-success.png',
        widget: Widgets.CheckWidget('success', [ 'A', 'B' ], [
            { value: 'A', label: 'A' },
            { value: 'B', label: 'B' },
            { value: 'C', label: 'C' },
        ]),
    });

    Widgets.Item(Widgets.ChecksGroup, 'check-info', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/check/check-info.png',
        widget: Widgets.CheckWidget('info', [ 'A', 'B' ], [
            { value: 'A', label: 'A' },
            { value: 'B', label: 'B' },
            { value: 'C', label: 'C' },
        ]),
    });

    Widgets.Item(Widgets.ChecksGroup, 'check-warning', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/check/check-warning.png',
        widget: Widgets.CheckWidget('warning', [ 'A', 'B' ], [
            { value: 'A', label: 'A' },
            { value: 'B', label: 'B' },
            { value: 'C', label: 'C' },
        ]),
    });

    Widgets.Item(Widgets.ChecksGroup, 'check-danger', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/check/check-danger.png',
        widget: Widgets.CheckWidget('danger', [ 'A', 'B' ], [
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

    Widgets.InputWidget = function(label, type) {

        return Widgets.extend({
            tag: 'default-input-text',
            mixins: [ Widgets.WidgetMixin, Widgets.BoxMixin, Widgets.SizeMixin ],
            props: [
                { name: 'model', title: 'Model', type: 'var', tab: 'data', variable: true },
                { name: 'type', title: 'Type', type: 'string', tab: 'content' },
                { name: 'label', title: 'Label', type: 'string', tab: 'content' },
                { name: 'placeholder', title: 'Placeholder', type: 'string', tab: 'content' },
            ],
            params: {
                model:      Widgets.Param({ value: '' }),
                margin:     Widgets.Param('15px 15px'),
                type:       Widgets.Param(type),
                label:      Widgets.Param(label),
            },
        });
    };

    Widgets.Item(Widgets.InputsGroup, 'input-text', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/input/text.png',
        widget: Widgets.InputWidget('Input', 'text'),
    });

    Widgets.TextareaWidget = function(label, placeholder) {

        return Widgets.extend({
            tag: 'default-input-textarea',
            mixins: [ Widgets.WidgetMixin, Widgets.BoxMixin, Widgets.SizeMixin ],
            props: [
                { name: 'model', title: 'Model', type: 'var', tab: 'data', variable: true },
                { name: 'label', title: 'Label', type: 'string', tab: 'data' },
                { name: 'placeholder', title: 'Placeholder', type: 'string', tab: 'data' },
            ],
            params: {
                model:          Widgets.Param({ value: '' }),
                margin:         Widgets.Param('15px 15px'),
                label:          Widgets.Param(label),
                placeholder:    Widgets.Param(placeholder),
            },
        });
    };

    Widgets.Item(Widgets.InputsGroup, 'input-textarea', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/input/textarea.png',
        widget: Widgets.TextareaWidget('Textarea', 'Type message here'),
    });

    Widgets.RadioInputWidget = function(value, options) {

        return Widgets.extend({
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
            params: {
                model:      Widgets.Param({ value: value }),
                margin:     Widgets.Param('15px 15px'),
                items: {
                    value: options.map(function(option) {
                        return {
                            value: Widgets.Param(option.value),
                            label: Widgets.Param(option.label),
                        };
                    })
                }
            },
        });
    };

    Widgets.Item(Widgets.InputsGroup, 'input-radio', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/input/radio.png',
        widget: Widgets.RadioInputWidget('1', [
            { value: '1', label: 'First' },
            { value: '2', label: 'Second' },
        ]),
    });

    Widgets.CheckInputWidget = function(value, options) {

        return Widgets.extend({
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
            params: {
                model:      Widgets.Param({ value: value }),
                margin:     Widgets.Param('15px 15px'),
                items: {
                    value: options.map(function(option) {
                        return {
                            value: Widgets.Param(option.value),
                            label: Widgets.Param(option.label),
                        };
                    })
                }
            },
        });
    };

    Widgets.Item(Widgets.InputsGroup, 'input-check', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/input/checkbox.png',
        widget: Widgets.CheckInputWidget([ '1' ], [
            { value: '1', label: 'First' },
            { value: '2', label: 'Second' },
        ]),
    });

})(jQuery, Vue, Core, Widgets);

(function($, Vue, Core, Widgets) {

    Widgets.RadioWidget = function(stereotype, value, options) {

        return Widgets.extend({
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
            params: {
                model:      Widgets.Param({ value: value }),
                margin:     Widgets.Param('15px 15px'),
                stereotype: Widgets.Param(stereotype),
                items: {
                    value: options.map(function(option) {
                        return {
                            value: Widgets.Param(option.value),
                            label: Widgets.Param(option.label),
                        };
                    })
                }
            },
        });
    }

    Widgets.Item(Widgets.RadiosGroup, 'radio-default', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/radio/radio-default.png',
        widget: Widgets.RadioWidget('default', '1', [
            { value: '1', label: 'On' },
            { value: '0', label: 'Off' },
        ]),
    });

    Widgets.Item(Widgets.RadiosGroup, 'radio-primary', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/radio/radio-primary.png',
        widget: Widgets.RadioWidget('primary', '1', [
            { value: '1', label: 'On' },
            { value: '0', label: 'Off' },
        ]),
    });

    Widgets.Item(Widgets.RadiosGroup, 'radio-success', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/radio/radio-success.png',
        widget: Widgets.RadioWidget('success', '1', [
            { value: '1', label: 'On' },
            { value: '0', label: 'Off' },
        ]),
    });

    Widgets.Item(Widgets.RadiosGroup, 'radio-info', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/radio/radio-info.png',
        widget: Widgets.RadioWidget('info', '1', [
            { value: '1', label: 'On' },
            { value: '0', label: 'Off' },
        ]),
    });

    Widgets.Item(Widgets.RadiosGroup, 'radio-warning', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/radio/radio-warning.png',
        widget: Widgets.RadioWidget('warning', '1', [
            { value: '1', label: 'On' },
            { value: '0', label: 'Off' },
        ]),
    });

    Widgets.Item(Widgets.RadiosGroup, 'radio-danger', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/form/radio/radio-danger.png',
        widget: Widgets.RadioWidget('danger', '1', [
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

    Widgets.TextWidget = function(stereotype, content) {

        return Widgets.extend({
            tag: 'default-text',
            mixins: [ Widgets.WidgetMixin, Widgets.BoxMixin, Widgets.SizeMixin ],
            props: [
                { name: 'stereotype', title: 'Stereotype', type: 'string', tab: 'data' },
                { name: 'content', title: 'Content', type: 'rich', tab: 'content' },
            ],
            params: {
                content:    Widgets.Param(content),
                margin:     Widgets.Param('15px 15px'),
                stereotype: Widgets.Param(stereotype),
            },
        });
    }

    Widgets.Item(Widgets.HeadingsGroup, 'text-h1', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/text-h1.png',
        widget: Widgets.TextWidget('default', `
            <h1>Heading 1</h1>
        `),
    });

    Widgets.Item(Widgets.HeadingsGroup, 'text-h2', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/text-h2.png',
        widget: Widgets.TextWidget('default', `
            <h2>Heading 2</h2>
        `),
    });

    Widgets.Item(Widgets.HeadingsGroup, 'text-h3', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/text-h3.png',
        widget: Widgets.TextWidget('default', `
            <h3>Heading 3</h3>
        `),
    });

    Widgets.Item(Widgets.HeadingsGroup, 'text-h4', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/text-h4.png',
        widget: Widgets.TextWidget('default', `
            <h4>Heading 4</h4>
        `),
    });

    Widgets.Item(Widgets.HeadingsGroup, 'text-h5', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/text-h5.png',
        widget: Widgets.TextWidget('default', `
            <h5>Heading 5</h5>
        `),
    });

    Widgets.Item(Widgets.HeadingsGroup, 'text-h6', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/text-h6.png',
        widget: Widgets.TextWidget('default', `
            <h6>Heading 6</h6>
        `),
    });

    Widgets.Item(Widgets.BlocksGroup, 'block-default', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/block-default.png',
        widget: Widgets.TextWidget('default', `
            <h3>Lorem ipsum</h3>
            <p>Etiam porta sem malesuada magna mollis euismod.</p>
        `),
    });

    Widgets.Item(Widgets.BlocksGroup, 'block-primary', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/block-primary.png',
        widget: Widgets.TextWidget('primary', `
            <h3>Lorem ipsum</h3>
            <p>Etiam porta sem malesuada magna mollis euismod.</p>
        `),
    });

    Widgets.Item(Widgets.BlocksGroup, 'block-success', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/block-success.png',
        widget: Widgets.TextWidget('success', `
            <h3>Lorem ipsum</h3>
            <p>Etiam porta sem malesuada magna mollis euismod.</p>
        `),
    });

    Widgets.Item(Widgets.BlocksGroup, 'block-info', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/block-info.png',
        widget: Widgets.TextWidget('info', `
            <h3>Lorem ipsum</h3>
            <p>Etiam porta sem malesuada magna mollis euismod.</p>
        `),
    });

    Widgets.Item(Widgets.BlocksGroup, 'block-warning', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/block-warning.png',
        widget: Widgets.TextWidget('warning', `
            <h3>Lorem ipsum</h3>
            <p>Etiam porta sem malesuada magna mollis euismod.</p>
        `),
    });

    Widgets.Item(Widgets.BlocksGroup, 'block-danger', {
        thumbnail: '/assets/vendor/ntr1x-archery-widgets/src/widgets/text/text/block-danger.png',
        widget: Widgets.TextWidget('danger', `
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

    Widgets.StubWidget = function(content) {

        return Widgets.extend({
            tag: 'default-stub',
            props: [
                { name: 'content', title: 'Content', type: 'rich', tab: 'content' },
            ],
            params: {
                content:    Widgets.Param(content),
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiY29tcG9uZW50cy9lZGl0b3IuanMiLCJjb21wb25lbnRzL2Zvcm0uanMiLCJjb21wb25lbnRzL2dyaWQuanMiLCJjb21wb25lbnRzL2lubGluZS5qcyIsImNvbXBvbmVudHMvbWl4aW5zLmpzIiwiY29tcG9uZW50cy9tb2RhbC5qcyIsImNvbXBvbmVudHMvc29ydGFibGUuanMiLCJkaXJlY3RpdmVzL2FmZml4LmpzIiwiZGlyZWN0aXZlcy9jb21iby5qcyIsImRpcmVjdGl2ZXMvZGF0ZS5qcyIsImRpcmVjdGl2ZXMvcmljaC5qcyIsImRpcmVjdGl2ZXMvc2Nyb2xsYWJsZS5qcyIsImRpcmVjdGl2ZXMvdGFncy5qcyIsImZpbHRlcnMvaW5kZXguanMiLCJob29rcy9tb2RhbC5qcyIsInZhbGlkYXRvcnMvZW1haWwuanMiLCJwbHVnaW5zL2NvbnRhaW5lci5qcyIsImVkaXRvci9iaW5kaW5ncy9iaW5kaW5ncy5qcyIsImVkaXRvci9kb21haW5zL2RvbWFpbnMuanMiLCJlZGl0b3IvcGFnZXMvcGFnZXMuanMiLCJlZGl0b3IvcGFyYW1zL3BhcmFtcy5qcyIsImVkaXRvci9zY2hlbWVzL3NjaGVtZXMuanMiLCJlZGl0b3Ivc2V0dGluZ3Mvc2V0dGluZ3MuanMiLCJlZGl0b3Ivc3RvcmFnZXMvc3RvcmFnZXMuanMiLCJlZGl0b3Ivd2lkZ2V0cy93aWRnZXRzLmpzIiwic2hlbGwvYWN0aW9ucy9hY3Rpb25zLmpzIiwic2hlbGwvYnJhbmQvYnJhbmQuanMiLCJzaGVsbC9jYXRlZ29yaWVzL2NhdGVnb3JpZXMuanMiLCJzaGVsbC9jb250YWluZXIvY29udGFpbmVyLmpzIiwic2hlbGwvZGVjb3JhdG9yL2RlY29yYXRvci5qcyIsInNoZWxsL2RvbWFpbnMvZG9tYWlucy5qcyIsInNoZWxsL2xvYWRlci9sb2FkZXIuanMiLCJzaGVsbC9wYWdlL3BhZ2UuanMiLCJzaGVsbC9wYWdlcy9wYWdlcy5qcyIsInNoZWxsL3BhbGV0dGUvcGFsZXR0ZS5qcyIsInNoZWxsL3NoZWxsL3NoZWxsLmpzIiwic2hlbGwvc291cmNlcy9zb3VyY2VzLmpzIiwic2hlbGwvc3RvcmFnZXMvc3RvcmFnZXMuanMiLCJzaGVsbC90YXJnZXQvdGFyZ2V0LmpzIiwic2hlbGwvd2lkZ2V0L3dpZGdldC5qcyIsImVkaXRvci9wYWdlcy9zb3VyY2VzL3NvdXJjZXMuanMiLCJlZGl0b3IvcGFnZXMvd2lkZ2V0cy93aWRnZXRzLmpzIiwid2lkZ2V0cy5qcyIsIndpZGdldHMvcGFsZXR0ZS5qcyIsIndpZGdldHMvd2lkZ2V0cy5qcyIsIndpZGdldHMvY29udGFpbmVyL3BhbGV0dGUuanMiLCJ3aWRnZXRzL2Zvcm0vcGFsZXR0ZS5qcyIsIndpZGdldHMvdGV4dC9wYWxldHRlLmpzIiwid2lkZ2V0cy9jb250YWluZXIvc3RhY2svcGFsZXR0ZS5qcyIsIndpZGdldHMvY29udGFpbmVyL3N0YWNrL3N0YWNrLmpzIiwid2lkZ2V0cy9mb3JtL2J1dHRvbi9idXR0b24uanMiLCJ3aWRnZXRzL2Zvcm0vYnV0dG9uL3BhbGV0dGUuanMiLCJ3aWRnZXRzL2Zvcm0vY2hlY2svY2hlY2suanMiLCJ3aWRnZXRzL2Zvcm0vY2hlY2svcGFsZXR0ZS5qcyIsIndpZGdldHMvZm9ybS9pbnB1dC9pbnB1dC5qcyIsIndpZGdldHMvZm9ybS9pbnB1dC9wYWxldHRlLmpzIiwid2lkZ2V0cy9mb3JtL3JhZGlvL3BhbGV0dGUuanMiLCJ3aWRnZXRzL2Zvcm0vcmFkaW8vcmFkaW8uanMiLCJ3aWRnZXRzL3RleHQvdGV4dC9wYWxldHRlLmpzIiwid2lkZ2V0cy90ZXh0L3RleHQvdGV4dC5qcyIsIndpZGdldHMvdXRpbHMvYm94L2JveC5qcyIsIndpZGdldHMvdXRpbHMvcGxhY2Vob2xkZXIvcGxhY2Vob2xkZXIuanMiLCJ3aWRnZXRzL3V0aWxzL3N0dWIvcGFsZXR0ZS5qcyIsIndpZGdldHMvdXRpbHMvc3R1Yi9zdHViLmpzIiwibGFuZGluZy9sYW5kaW5nLmpzIiwic2VydmljZXMvcG9ydGFscy5qcyIsInNlcnZpY2VzL3NlY3VyaXR5LmpzIiwibGFuZGluZy9hY2NvdW50L2FjY291bnQuanMiLCJsYW5kaW5nL2JlbmVmaXRzL2JlbmVmaXRzLmpzIiwibGFuZGluZy9jb250YWN0cy9jb250YWN0cy5qcyIsImxhbmRpbmcvZmVlZGJhY2svZmVlZGJhY2suanMiLCJsYW5kaW5nL2Zvb3Rlci9mb290ZXIuanMiLCJsYW5kaW5nL2dhbGxlcnkvZ2FsbGVyeS5qcyIsImxhbmRpbmcvaGVhZGVyL2hlYWRlci5qcyIsImxhbmRpbmcvbWFuYWdlL21hbmFnZS5qcyIsImxhbmRpbmcvcHJpY2luZy9wcmljaW5nLmpzIiwibGFuZGluZy9zdG9yYWdlL3N0b3JhZ2UuanMiLCJsYW5kaW5nL3N1cGVyL3N1cGVyLmpzIiwibGFuZGluZy91c2VjYXNlcy91c2VjYXNlcy5qcyIsImxhbmRpbmcvdmlkZW8vdmlkZW8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDblFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QWpCZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBa0JWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QWhFUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QWlFNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0RUE7QUNBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgTGFuZGluZyA9XG4oZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgTGFuZGluZyA9IHt9O1xuXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgJCgnW2RhdGEtdnVlLWFwcF0nKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG5cbiAgICAgICAgICAgIHZhciBkYXRhID0gJChlbGVtZW50KS5kYXRhKCk7XG5cbiAgICAgICAgICAgIHZhciBBcHAgPSBWdWUuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICBWdWUuc2VydmljZSgnc2VjdXJpdHknLCBDb3JlLlNlY3VyaXR5RmFjdG9yeSh0aGlzKSk7XG4gICAgICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdwb3J0YWxzJywgQ29yZS5Qb3J0YWxzRmFjdG9yeSh0aGlzKSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgcm91dGVyID0gbmV3IFZ1ZVJvdXRlcih7XG4gICAgICAgICAgICAgICAgaGlzdG9yeTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByb3V0ZXIuYmVmb3JlRWFjaChmdW5jdGlvbih0cmFuc2l0aW9uKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAodHJhbnNpdGlvbi50by5hdXRoICYmICFyb3V0ZXIuYXBwLnByaW5jaXBhbCkge1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0cmFuc2l0aW9uLnRvLmFub24gJiYgcm91dGVyLmFwcC5wcmluY2lwYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbi5hYm9ydCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb24ubmV4dCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgcm91dGVzID0ge1xuICAgICAgICAgICAgICAgICcvJzoge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IExhbmRpbmcuTGFuZGluZ1BhZ2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnL2dhbGxlcnknOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nR2FsbGVyeVBhZ2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnL3N0b3JhZ2UnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nU3RvcmFnZVBhZ2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnL3NpZ25pbic6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBMYW5kaW5nLkxhbmRpbmdTaWduaW5QYWdlLFxuICAgICAgICAgICAgICAgICAgICBhbm9uOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJy9zaWdudXAnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nU2lnbnVwUGFnZSxcbiAgICAgICAgICAgICAgICAgICAgYW5vbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICcvbWFuYWdlJzoge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IExhbmRpbmcuTGFuZGluZ01hbmFnZVBhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGF1dGg6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnL21hbmFnZS1jcmVhdGUnOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nTWFuYWdlQ3JlYXRlUGFnZSxcbiAgICAgICAgICAgICAgICAgICAgYXV0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICcvc2l0ZS86cG9ydGFsLzpwYWdlJzoge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IFNoZWxsLlNoZWxsUHVibGljLFxuICAgICAgICAgICAgICAgICAgICBhdXRoOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJy9tYW5hZ2UvOnBvcnRhbCc6IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBTaGVsbC5Mb2FkZXIsXG4gICAgICAgICAgICAgICAgICAgIGF1dGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHByaXZhdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnL21hbmFnZS86cG9ydGFsLzpwYWdlJzoge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IFNoZWxsLkxvYWRlcixcbiAgICAgICAgICAgICAgICAgICAgYXV0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcHJpdmF0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gY3JlYXRlUm91dGUocGFnZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogU2hlbGwuU2hlbGxQdWJsaWMuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2U6IHBhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRhdGEubW9kZWwpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubW9kZWwucGFnZXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFnZSA9IGRhdGEubW9kZWwucGFnZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIHJvdXRlc1twYWdlLm5hbWVdID0gY3JlYXRlUm91dGUocGFnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByb3V0ZXIubWFwKHJvdXRlcyk7XG5cbiAgICAgICAgICAgIHJvdXRlci5zdGFydChBcHAsICQoJ1tkYXRhLXZ1ZS1ib2R5XScsIGVsZW1lbnQpLmdldCgwKSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIExhbmRpbmc7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XG5cbiAgICBDb3JlLlRhYnNNaXhpbiA9IGZ1bmN0aW9uKGFjdGl2ZSkge1xuXG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHRhYnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZTogYWN0aXZlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgICAgICBhY3RpdmF0ZTogZnVuY3Rpb24odGFiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFicy5hY3RpdmUgPSB0YWI7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGlzQWN0aXZlOiBmdW5jdGlvbih0YWIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFicy5hY3RpdmUgPT0gdGFiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIENvcmUuQWN0aW9uTWl4aW4gPSBmdW5jdGlvbihNb2RhbEVkaXRvcikge1xuXG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcbiAgICAgICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgICAgICAgICAgY29udGV4dDogT2JqZWN0LFxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgbWV0aG9kczoge1xuXG4gICAgICAgICAgICAgICAgb3BlbjogZnVuY3Rpb24oY29udGV4dCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBkaWFsb2cgPSBuZXcgTW9kYWxFZGl0b3Ioe1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsczogdGhpcy5nbG9iYWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQgfHwgdGhpcy5jb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiB0aGlzLm1vZGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCkpXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vd25lci5kb0FwcGx5KHRoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KS4kbW91bnQoKS4kYXBwZW5kVG8oJCgnYm9keScpLmdldCgwKSk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGRvQXBwbHk6IGZ1bmN0aW9uKG1vZGVsKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG1vZGVsKSksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hY3Rpb246IHRoaXMubW9kZWwuX2FjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy5tb2RlbC5fYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBDb3JlLkVkaXRvck1peGluID0gZnVuY3Rpb24oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpIHtcblxuICAgICAgICByZXR1cm4ge1xuXG4gICAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG1ldGhvZHM6IHtcblxuICAgICAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBkaWFsb2cgPSBuZXcgTW9kYWxFZGl0b3Ioe1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsczogdGhpcy5nbG9iYWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudDogaXRlbSA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpIDoge31cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm93bmVyLmRvQ3JlYXRlKHRoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KS4kbW91bnQoKS4kYXBwZW5kVG8oJCgnYm9keScpLmdldCgwKSk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvUmVtb3ZlKGl0ZW0sIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IGl0ZW07XG5cbiAgICAgICAgICAgICAgICAgICAgbmV3IE1vZGFsRWRpdG9yKHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvd25lcjogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vd25lci5kb1VwZGF0ZSh0aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXQ6ICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KS4kbW91bnQoKS4kYXBwZW5kVG8oJCgnYm9keScpLmdldCgwKSk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGRvQ3JlYXRlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKE9iamVjdC5hc3NpZ24oe30sIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpLCB7IF9hY3Rpb246ICdjcmVhdGUnIH0pKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2l0ZW1zJywgJC5leHRlbmQodHJ1ZSwgW10sIHRoaXMuaXRlbXMpKTtcblxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgZG9VcGRhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcblxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMuYWN0aXZlLCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW0pKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogdGhpcy5hY3RpdmUuX2FjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy5hY3RpdmUuX2FjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ3VwZGF0ZSdcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5pdGVtcyA9ICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKTsvL3RoaXMuaXRlbXMuc2xpY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcyA9IHRoaXMuaXRlbXMuc2xpY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ3Jlc2l6ZScpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3VwZGF0ZScsIGl0ZW0sIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLiRzZXQoJ2FjdGl2ZScsIE9iamVjdC5hc3NpZ24oSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShpdGVtKSksIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIF9hY3Rpb246IHRoaXMuYWN0aXZlLl9hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICA/IHRoaXMuYWN0aXZlLl9hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICA6ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgIC8vIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gLy8gdGhpcy5pdGVtcyA9ICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKTsvL3RoaXMuaXRlbXMuc2xpY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy4kc2V0KCdpdGVtcycsICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKSk7XG4gICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5hY3RpdmUgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBkb1JlbW92ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMuaXRlbXMuaW5kZXhPZihpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLml0ZW1zW2luZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLl9hY3Rpb24gPT0gJ2NyZWF0ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLiRyZW1vdmUoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uX2FjdGlvbiA9ICdyZW1vdmUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5pdGVtcyA9ICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdpdGVtcycsICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ3Jlc2l6ZScpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAgICAgY3JlYXRlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMuY3JlYXRlKGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcbiAgICAgICAgICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy51cGRhdGUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxuICAgICAgICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24oZGF0YSkgeyB0aGlzLnJlbW92ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXG4gICAgICAgICAgICAgICAgZG9DcmVhdGU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy5kb0NyZWF0ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXG4gICAgICAgICAgICAgICAgZG9VcGRhdGU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy5kb1VwZGF0ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXG4gICAgICAgICAgICAgICAgZG9SZW1vdmU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy5kb1JlbW92ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIENvcmUuTGlzdFZpZXdlck1peGluID0ge1xuXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcbiAgICAgICAgfSxcblxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgZGF0YSkgeyB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pOyB9LFxuICAgICAgICAgICAgY3JlYXRlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7IHRoaXMuJGRpc3BhdGNoKCdjcmVhdGUnLCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHR9ICk7IH0sXG4gICAgICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHsgdGhpcy4kZGlzcGF0Y2goJ3VwZGF0ZScsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dH0gKTsgfSxcbiAgICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkgeyB0aGlzLiRkaXNwYXRjaCgncmVtb3ZlJywgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0fSApOyB9LFxuICAgICAgICB9XG4gICAgfTtcblxuICAgIENvcmUuTW9kYWxFZGl0b3JNaXhpbiA9IHtcblxuICAgICAgICBhdHRhY2hlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICQodGhpcy4kZWwpLm1vZGFsKCdzaG93Jyk7XG4gICAgICAgICAgICAkKHRoaXMuJGVsKS5vbignaGlkZS5icy5tb2RhbCcsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBkZXRhY2hlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKHRoaXMuJGVsKS5tb2RhbCgnaGlkZScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHN1Ym1pdDogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgICAgIHJlc2V0OiBmdW5jdGlvbigpIHt9XG4gICAgICAgIH1cbiAgICB9O1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSk7XG4iLCIvLyBWdWUuY29tcG9uZW50KCd2LWZvcm0nLCB7XG4vL1xuLy8gXHRwcm9wczoge1xuLy8gXHRcdGFjdGlvbjogU3RyaW5nLFxuLy8gXHRcdG1ldGhvZDogU3RyaW5nLFxuLy8gXHRcdGluaXQ6IE9iamVjdCxcbi8vIFx0XHRkb25lOiBGdW5jdGlvbixcbi8vIFx0XHRmYWlsOiBGdW5jdGlvbixcbi8vIFx0XHRtb2RlbDogT2JqZWN0LFxuLy8gXHR9LFxuLy9cbi8vIFx0Ly8gcmVwbGFjZTogZmFsc2UsXG4vL1xuLy8gXHQvLyB0ZW1wbGF0ZTogYFxuLy8gXHQvLyBcdDxmb3JtPlxuLy8gXHQvLyBcdFx0PHNsb3Q+PC9zbG90PlxuLy8gXHQvLyBcdDwvZm9ybT5cbi8vIFx0Ly8gYCxcbi8vXG4vLyBcdGFjdGl2YXRlOiBmdW5jdGlvbihkb25lKSB7XG4vL1xuLy8gXHRcdHRoaXMub3JpZ2luYWwgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpKTtcbi8vXG4vLyBcdFx0JCh0aGlzLiRlbClcbi8vXG4vLyBcdFx0XHQub24oJ3N1Ym1pdCcsIChlKSA9PiB7XG4vLyBcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcbi8vIFx0XHRcdFx0dGhpcy5zdWJtaXQoKTtcbi8vIFx0XHRcdH0pXG4vLyBcdFx0XHQub24oJ3Jlc2V0JywgKGUpID0+IHtcbi8vIFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuLy8gXHRcdFx0XHR0aGlzLnJlc2V0KCk7XG4vLyBcdFx0XHR9KVxuLy9cbi8vIFx0XHRkb25lKCk7XG4vLyBcdH0sXG4vL1xuLy8gXHRkYXRhOiBmdW5jdGlvbigpIHtcbi8vXG4vLyBcdFx0cmV0dXJuIHtcbi8vIFx0XHRcdG1vZGVsOiB0aGlzLm1vZGVsXG4vLyBcdFx0fTtcbi8vIFx0fSxcbi8vXG4vLyBcdG1ldGhvZHM6IHtcbi8vXG4vLyBcdFx0c3VibWl0OiBmdW5jdGlvbigpIHtcbi8vXG4vLyBcdFx0XHQvLyBlLnByZXZlbnREZWZhdWx0KCk7XG4vL1xuLy8gXHRcdFx0Ly8gY29uc29sZS5sb2codGhpcy5tb2RlbCk7XG4vL1xuLy8gXHRcdFx0JC5hamF4KHtcbi8vIFx0XHRcdFx0dXJsOiB0aGlzLmFjdGlvbixcbi8vIFx0XHRcdFx0bWV0aG9kOiB0aGlzLm1ldGhvZCxcbi8vIFx0XHRcdFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuLy8gXHRcdFx0XHRkYXRhOiBKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKVxuLy8gXHRcdFx0fSlcbi8vIFx0XHRcdC5kb25lKChkKSA9PiB7XG4vLyBcdFx0XHRcdGlmIChkb25lIGluIHRoaXMpIHRoaXMuZG9uZShkKTtcbi8vIFx0XHRcdH0pXG4vLyBcdFx0XHQuZmFpbChmdW5jdGlvbihlKSB7IGlmIChmYWlsIGluIHRoaXMpIHRoaXMuZmFpbChlKTsgfS5iaW5kKHRoaXMpKVxuLy8gXHRcdH0sXG4vL1xuLy8gXHRcdHJlc2V0OiBmdW5jdGlvbigpIHtcbi8vIFx0XHRcdE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgdGhpcy5vcmlnaW5hbCk7XG4vLyBcdFx0fVxuLy8gXHR9LFxuLy8gfSk7XG4iLCIvLyAoZnVuY3Rpb24oJCwgVnVlLCB1bmRlZmluZWQpIHtcbi8vXG4vLyBcdC8vIHZhciBtb2RlbCA9IHtcbi8vIFx0Ly8gXHRsaXN0OiBbXVxuLy8gXHQvLyB9O1xuLy8gXHQvL1xuLy8gXHQvLyB2YXIgYm9keSA9IFZ1ZS5leHRlbmQoe1xuLy8gXHQvLyBcdGNyZWF0ZWQ6IGZ1bmN0aW9uKCkgIHsgdGhpcy4kZGlzcGF0Y2goJ3JlZ2lzdGVyLWJvZHknLCB0aGlzKSB9LFxuLy8gXHQvLyB9KTtcbi8vXG4vLyBcdFZ1ZS5jb21wb25lbnQoJ2dyaWQtdGFibGUnLCB7XG4vL1xuLy8gXHRcdHJlcGxhY2U6IGZhbHNlLFxuLy9cbi8vIFx0XHRwcm9wczoge1xuLy8gXHRcdFx0ZDogQXJyYXlcbi8vIFx0XHR9LFxuLy9cbi8vIFx0XHQvLyBkYXRhOiBmdW5jdGlvbigpIHtcbi8vIFx0XHQvLyBcdHJldHVybiB7XG4vLyBcdFx0Ly8gXHRcdGl0ZW1zOiB0aGlzLmQuc2xpY2UoMClcbi8vIFx0XHQvLyBcdH1cbi8vIFx0XHQvLyB9LFxuLy9cbi8vIFx0XHRtZXRob2RzOiB7XG4vL1xuLy8gXHRcdFx0YWRkOiBmdW5jdGlvbigpIHtcbi8vIFx0XHRcdFx0Y29uc29sZS5sb2coJ2FzZGFzZCcpO1xuLy8gXHRcdFx0XHR0aGlzLml0ZW1zLnB1c2goe30pO1xuLy8gXHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLml0ZW1zKTtcbi8vIFx0XHRcdH0sXG4vL1xuLy8gXHRcdFx0cmVtb3ZlOiBmdW5jdGlvbihpbmRleCkge1xuLy8gXHRcdFx0XHR0aGlzLml0ZW1zLnNwbGljZShpbmRleCwgMSk7XG4vLyBcdFx0XHR9XG4vLyBcdFx0fSxcbi8vIFx0fSk7XG4vL1xuLy8gfSkoalF1ZXJ5LCBWdWUpO1xuIiwiLy8gVnVlLmNvbXBvbmVudCgnaW5saW5lLXRleHQnLFxuLy8gXHRWdWUuZXh0ZW5kKHtcbi8vIFx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScgXSxcbi8vIFx0XHR0ZW1wbGF0ZTogYFxuLy8gXHRcdFx0PGRpdiBjbGFzcz1cImlubGluZS1jb250YWluZXJcIj5cbi8vIFx0XHRcdFx0PGlucHV0IGNsYXNzPVwiaW5saW5lLWNvbnRyb2xcIiB0eXBlPVwidGV4dFwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCIgLz5cbi8vIFx0XHRcdDwvZGl2PlxuLy8gXHRcdGBcbi8vIFx0fSlcbi8vICk7XG4vL1xuLy8gVnVlLmNvbXBvbmVudCgnaW5saW5lLWNoZWNrYm94Jyxcbi8vIFx0VnVlLmV4dGVuZCh7XG4vLyBcdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnIF0sXG4vLyBcdFx0dGVtcGxhdGU6IGBcbi8vIFx0XHRcdDxkaXYgY2xhc3M9XCJpbmxpbmUtY29udGFpbmVyXCI+XG4vLyBcdFx0XHRcdDxpbnB1dCBjbGFzcz1cImlubGluZS1jaGVja2JveFwiIHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCIgLz5cbi8vIFx0XHRcdDwvZGl2PlxuLy8gXHRcdGBcbi8vIFx0fSlcbi8vICk7XG4vL1xuLy8gVnVlLmNvbXBvbmVudCgnaW5saW5lLXNlbGVjdCcsXG4vLyBcdFZ1ZS5leHRlbmQoe1xuLy8gXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJywgJ29wdGlvbnMnIF0sXG4vLyBcdFx0dGVtcGxhdGU6IGBcbi8vIFx0XHRcdDxkaXYgY2xhc3M9XCJpbmxpbmUtY29udGFpbmVyXCI+XG4vLyBcdFx0XHRcdDxzZWxlY3QgY2xhc3M9XCJpbmxpbmUtY29udHJvbDFcIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiPlxuLy8gXHRcdFx0XHRcdDxvcHRpb24gdi1mb3I9XCJvcHRpb24gaW4gb3B0aW9uc1wiIHZhbHVlPVwie3sgb3B0aW9uLmtleSB9fVwiPnt7IG9wdGlvbi52YWx1ZSB9fTwvb3B0aW9uPlxuLy8gXHRcdFx0XHQ8L3NlbGVjdD5cbi8vIFx0XHRcdDwvZGl2PlxuLy8gXHRcdGBcbi8vIFx0fSlcbi8vICk7XG4vL1xuLy8gVnVlLmNvbXBvbmVudCgnaW5saW5lLXZhbHVlJyxcbi8vIFx0VnVlLmV4dGVuZCh7XG4vLyBcdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnLCAnY2xhc3MnIF0sXG4vLyBcdFx0dGVtcGxhdGU6IGBcbi8vIFx0XHRcdDxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIiAvPlxuLy8gXHRcdFx0PHNwYW4gOmNsYXNzPVwiY2xhc3NcIj57eyB2YWx1ZSB9fTwvc3Bhbj5cbi8vIFx0XHRgXG4vLyBcdH0pXG4vLyApO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgQ29yZS5XaWRnZXRNaXhpbiA9IHtcblxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxuICAgICAgICAgICAgc3RhY2s6IE9iamVjdCxcbiAgICAgICAgICAgIGJpbmRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBjaGlsZHJlbjogQXJyYXksXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcbiAgICAgICAgfSxcblxuICAgICAgICBkYXRhOiAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN5c3RlbUlkOiB0aGlzLnN5c3RlbUlkLFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB0aGlzLnJhbmRvbUlkID0gVnVlLnNlcnZpY2UoJ3BhbGV0dGUnKS5nZW5lcmF0ZUlkKCd3aWRnZXQtJyk7XG5cbiAgICAgICAgICAgIC8vIFRPRE8g0KPRgdGC0LDQvdC+0LLQuNGC0Ywg0YDQsNC30LzQtdGA0Ysg0YDQvtC00LjRgtC10LvRjNGB0LrQvtC5INGP0YfQtdC50LrQuFxuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnYmluZGluZ3MuaWQnLCBmdW5jdGlvbih2YWx1ZSkge1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3lzdGVtSWQgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN5c3RlbUlkID0gdGhpcy5yYW5kb21JZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgaXRlbSwgY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgfTtcblxuICAgIENvcmUuU3RhY2tlZE1peGluID0ge1xuXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBjaGlsZHJlbjogQXJyYXksXG4gICAgICAgIH0sXG5cbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YWNrSWQ6IHRoaXMuc3RhY2tJZCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICB0aGlzLnN0YWNrSWQgPSBWdWUuc2VydmljZSgncGFsZXR0ZScpLmdlbmVyYXRlSWQoJ3N0YWNrLScpO1xuICAgICAgICB9XG4gICAgfTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiLy8gVnVlLmNvbXBvbmVudCgnbW9kYWwnLCB7XG4vL1xuLy8gICAgIHByb3BzOiB7XG4vLyAgICAgICAgIGlkOiBTdHJpbmcsXG4vLyAgICAgICAgIGN1cnJlbnQ6IE9iamVjdCxcbi8vICAgICAgICAgb3JpZ2luYWw6IE9iamVjdCxcbi8vICAgICB9LFxuLy9cbi8vICAgICBtZXRob2RzOiB7XG4vL1xuLy8gICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcbi8vICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKCdzdWJtaXQnLCB0aGlzLmN1cnJlbnQpO1xuLy8gICAgICAgICAgICAgLy8gT2JqZWN0LmFzc2lnbih0aGlzLm9yaWdpbmFsLCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuY3VycmVudCkpKTtcbi8vICAgICAgICAgICAgICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XG4vLyAgICAgICAgIH0sXG4vL1xuLy8gICAgICAgICByZXNldDogZnVuY3Rpb24oZSkge1xuLy8gICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goJ3Jlc2V0JywgdGhpcy5jdXJyZW50KTtcbi8vICAgICAgICAgICAgIC8vIE9iamVjdC5hc3NpZ24odGhpcy5jdXJyZW50LCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMub3JpZ2luYWwpKSk7XG4vLyAgICAgICAgICAgICAkKGUudGFyZ2V0KS5jbG9zZXN0KCcubW9kYWwnKS5tb2RhbCgnaGlkZScpO1xuLy8gICAgICAgICB9XG4vLyAgICAgfVxuLy8gfSk7XG4iLCIoZnVuY3Rpb24gKCQsIHdpbmRvdywgcGx1Z2luTmFtZSwgdW5kZWZpbmVkKSB7XG5cbiAgICB2YXIgZGVmYXVsdHMgPSB7XG5cbiAgICAgICAgZHJhZzogdHJ1ZSxcbiAgICAgICAgZHJvcDogdHJ1ZSxcbiAgICAgICAgdmVydGljYWw6IHRydWUsXG5cbiAgICAgICAgY29udGFpbmVyU2VsZWN0b3I6IFwib2wsIHVsXCIsXG4gICAgICAgIGl0ZW1TZWxlY3RvcjogXCJsaVwiLFxuICAgICAgICBleGNsdWRlU2VsZWN0b3I6IFwiXCIsXG5cbiAgICAgICAgYm9keUNsYXNzOiBcImRyYWdnaW5nXCIsXG4gICAgICAgIGFjdGl2ZUNsYXNzOiBcImFjdGl2ZVwiLFxuICAgICAgICBkcmFnZ2VkQ2xhc3M6IFwiZHJhZ2dlZFwiLFxuICAgICAgICB2ZXJ0aWNhbENsYXNzOiBcInZlcnRpY2FsXCIsXG4gICAgICAgIGhvcmlzb250YWxDbGFzczogXCJob3Jpc29udGFsXCIsXG4gICAgICAgIHBsYWNlaG9sZGVyQ2xhc3M6IFwicGxhY2Vob2xkZXJcIixcblxuICAgICAgICBwbGFjZWhvbGRlcjogJzxsaSBjbGFzcz1cInBsYWNlaG9sZGVyXCI+PC9saT4nLFxuXG4gICAgICAgIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbihjb250ZXh0LCBldmVudCwgX3N1cGVyKSB7XG5cbiAgICAgICAgICAgIHZhciBzaXplID0ge1xuICAgICAgICAgICAgICAgIGhlaWdodDogY29udGV4dC4kaXRlbS5vdXRlckhlaWdodCgpLFxuICAgICAgICAgICAgICAgIHdpZHRoOiBjb250ZXh0LiRpdGVtLm91dGVyV2lkdGgoKSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnRleHQuJG9yaWdpbmFsSXRlbSA9IGNvbnRleHQuJGl0ZW07XG5cbiAgICAgICAgICAgIGNvbnRleHQuJGl0ZW0gPSBjb250ZXh0LiRvcmlnaW5hbEl0ZW1cbiAgICAgICAgICAgICAgICAuY2xvbmUoKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhjb250ZXh0LnNvcnRhYmxlLm9wdGlvbnMuZHJhZ2dlZENsYXNzKVxuICAgICAgICAgICAgICAgIC5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJyxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogZXZlbnQucGFnZVggLSBjb250ZXh0LmFkanVzdG1lbnQubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBldmVudC5wYWdlWSAtIGNvbnRleHQuYWRqdXN0bWVudC50b3AsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBzaXplLnNpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHNpemUuaGVpZ2h0LFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmFwcGVuZFRvKGNvbnRleHQuJHBhcmVudClcbiAgICAgICAgICAgIDtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkRyYWc6IGZ1bmN0aW9uKGNvbnRleHQsIGV2ZW50LCBfc3VwZXIpIHtcblxuICAgICAgICAgICAgY29udGV4dC4kaXRlbS5jc3Moe1xuICAgICAgICAgICAgICAgIGxlZnQ6IGV2ZW50LnBhZ2VYIC0gY29udGV4dC5hZGp1c3RtZW50LmxlZnQsXG4gICAgICAgICAgICAgICAgdG9wOiBldmVudC5wYWdlWSAtIGNvbnRleHQuYWRqdXN0bWVudC50b3AsXG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uRHJvcDogZnVuY3Rpb24oY29udGV4dCwgZXZlbnQsIF9zdXBlcikge1xuXG4gICAgICAgICAgICBjb250ZXh0LiRpdGVtLnJlbW92ZSgpO1xuICAgICAgICAgICAgaWYgKGNvbnRleHQubG9jYXRpb24pIHtcblxuICAgICAgICAgICAgICAgIGNvbnRleHQuJGl0ZW0gPSBjb250ZXh0LmxvY2F0aW9uLmJlZm9yZVxuICAgICAgICAgICAgICAgICAgICA/IGNvbnRleHQuJGl0ZW0uaW5zZXJ0QmVmb3JlKGNvbnRleHQubG9jYXRpb24uJGl0ZW0pXG4gICAgICAgICAgICAgICAgICAgIDogY29udGV4dC4kaXRlbS5pbnNlcnRBZnRlcihjb250ZXh0LmxvY2F0aW9uLiRpdGVtKVxuICAgICAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgICAgIGNvbnRleHQuJGl0ZW0uY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICcnLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcnLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcnLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgdmFyIGNvbnRleHQgPSBudWxsO1xuICAgIHZhciBzb3J0YWJsZXMgPSBbXTtcblxuICAgIGZ1bmN0aW9uIFNvcnRhYmxlKCRlbGVtZW50LCBvcHRpb25zKSB7XG5cbiAgICAgICAgdGhpcy4kZWxlbWVudCA9ICRlbGVtZW50O1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gICAgICAgICRlbGVtZW50Lm9uKCdtb3VzZWRvd24uc29ydGFibGUnLCB0aGlzLm9wdGlvbnMuaXRlbVNlbGVjdG9yLCAoZSkgPT4geyB0aGlzLmhhbmRsZVN0YXJ0KGUpOyB9KTtcblxuICAgICAgICB0aGlzLmRyYWdnYWJsZSA9IG51bGw7XG5cbiAgICAgICAgc29ydGFibGVzLnB1c2godGhpcyk7XG4gICAgfVxuXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICQoZG9jdW1lbnQpXG4gICAgICAgICAgICAub24oJ21vdXNldXAuc29ydGFibGUnLCAoZSkgPT4geyBjb250ZXh0ICYmIGNvbnRleHQuc29ydGFibGUuaGFuZGxlRW5kKGUsIGNvbnRleHQpOyB9KVxuICAgICAgICAgICAgLm9uKCdtb3VzZW1vdmUuc29ydGFibGUnLCAoZSkgPT4geyBjb250ZXh0ICYmIGNvbnRleHQuc29ydGFibGUuaGFuZGxlRHJhZyhlLCBjb250ZXh0KTsgfSlcbiAgICAgICAgO1xuICAgIH0pO1xuXG4gICAgU29ydGFibGUucHJvdG90eXBlID0ge1xuXG4gICAgICAgIGRyb3BMb2NhdGlvbjogZnVuY3Rpb24oZSkge1xuXG4gICAgICAgICAgICB2YXIgJGl0ZW07XG4gICAgICAgICAgICB2YXIgc29ydGFibGU7XG5cbiAgICAgICAgICAgIGlmIChjb250ZXh0KSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGlzcGxheSA9IGNvbnRleHQuJGl0ZW0uY3NzKCdkaXNwbGF5Jyk7XG4gICAgICAgICAgICAgICAgY29udGV4dC4kaXRlbS5jc3MoeyBkaXNwbGF5OiAnbm9uZScsIH0pO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzb3J0YWJsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSBzb3J0YWJsZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzLm9wdGlvbnMuZHJvcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHJlc3VsdCA9ICQoZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChlLnBhZ2VYLCBlLnBhZ2VZKSkuY2xvc2VzdChzLm9wdGlvbnMuaXRlbVNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkcmVzdWx0Lmxlbmd0aCAmJiAkcmVzdWx0LmNsb3Nlc3Qocy4kZWxlbWVudCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGl0ZW0gPSAkcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlID0gcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnRleHQuJGl0ZW0uY3NzKHsgZGlzcGxheTogZGlzcGxheSwgfSk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvcnRhYmxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcyA9IHNvcnRhYmxlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHMub3B0aW9ucy5kcm9wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkcmVzdWx0ID0gJChkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KGUucGFnZVgsIGUucGFnZVkpKS5jbG9zZXN0KHMub3B0aW9ucy5pdGVtU2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRyZXN1bHQubGVuZ3RoICYmICRyZXN1bHQuY2xvc2VzdChzLiRlbGVtZW50KS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaXRlbSA9ICRyZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGUgPSBzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc29ydGFibGUgJiYgJGl0ZW0gJiYgJGl0ZW0ubGVuZ3RoKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgJGNvbnRhaW5lciA9ICRpdGVtLmNsb3Nlc3Qoc29ydGFibGUub3B0aW9ucy5jb250YWluZXJTZWxlY3Rvcik7XG5cbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gJGl0ZW0ub2Zmc2V0KCk7XG4gICAgICAgICAgICAgICAgdmFyIHNpemUgPSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAkaXRlbS5vdXRlcldpZHRoKCksXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJGl0ZW0ub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdmFyIG9yaWVudGF0aW9uID0gdGhpcy5vcHRpb25zLnZlcnRpY2FsXG4gICAgICAgICAgICAgICAgICAgID8gJGNvbnRhaW5lci5oYXNDbGFzcyhzb3J0YWJsZS5vcHRpb25zLmhvcmlzb250YWxDbGFzcykgPyAnaCcgOiAndidcbiAgICAgICAgICAgICAgICAgICAgOiAkY29udGFpbmVyLmhhc0NsYXNzKHNvcnRhYmxlLm9wdGlvbnMudmVydGljYWxDbGFzcykgPyAndicgOiAnaCdcbiAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgICAgICAgICB2YXIgYmVmb3JlID0gKG9yaWVudGF0aW9uID09ICdoJylcbiAgICAgICAgICAgICAgICAgICAgPyBlLnBhZ2VYIC0gb2Zmc2V0LmxlZnQgPCBzaXplLndpZHRoIC8gMlxuICAgICAgICAgICAgICAgICAgICA6IGUucGFnZVkgLSBvZmZzZXQudG9wIDwgc2l6ZS5oZWlnaHQgLyAyXG4gICAgICAgICAgICAgICAgO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW06ICRpdGVtLFxuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyOiAkY29udGFpbmVyLFxuICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZTogc29ydGFibGUsXG4gICAgICAgICAgICAgICAgICAgIGJlZm9yZTogYmVmb3JlLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhhbmRsZVN0YXJ0OiBmdW5jdGlvbihlKSB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXhjbHVkZVNlbGVjdG9yICYmICQoZS50YXJnZXQpLmNsb3Nlc3QodGhpcy5vcHRpb25zLmV4Y2x1ZGVTZWxlY3RvcikubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgIGlmICghY29udGV4dCkge1xuXG4gICAgICAgICAgICAgICAgdmFyICRpdGVtID0gJChlLnRhcmdldCkuY2xvc2VzdCh0aGlzLm9wdGlvbnMuaXRlbVNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICB2YXIgJHBhcmVudCA9ICRpdGVtLnBhcmVudCgpO1xuXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9ICRpdGVtLm9mZnNldCgpO1xuICAgICAgICAgICAgICAgIC8vIGlmICghb2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKCRpdGVtLCApO1xuICAgICAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0aGlzLFxuICAgICAgICAgICAgICAgICAgICBpbmRleDogJGl0ZW0uaW5kZXgoKSxcbiAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lcjogJGl0ZW0uY2xvc2VzdCh0aGlzLm9wdGlvbnMuY29udGFpbmVyU2VsZWN0b3IpLFxuICAgICAgICAgICAgICAgICAgICAkcGFyZW50OiAkaXRlbS5wYXJlbnQoKSxcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW06ICRpdGVtLFxuICAgICAgICAgICAgICAgICAgICAkb3JpZ2luYWxJdGVtOiAkaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgJHRhcmdldEl0ZW06IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICR0YXJnZXRDb250YWluZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uOiB0aGlzLmRyb3BMb2NhdGlvbihlKSxcbiAgICAgICAgICAgICAgICAgICAgYWRqdXN0bWVudDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogZS5jbGllbnRYIC0gb2Zmc2V0LmxlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IGUuY2xpZW50WSAtIG9mZnNldC50b3AsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vbkRyYWdTdGFydChjb250ZXh0LCBlLCBkZWZhdWx0cy5vbkRyYWdTdGFydCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGFuZGxlRW5kOiBmdW5jdGlvbihlKSB7XG5cbiAgICAgICAgICAgIGlmIChjb250ZXh0KSB7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvcnRhYmxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc29ydGFibGUgPSBzb3J0YWJsZXNbaV07XG4gICAgICAgICAgICAgICAgICAgICQoc29ydGFibGUub3B0aW9ucy5jb250YWluZXJTZWxlY3Rvciwgc29ydGFibGUuJGVsZW1lbnQpLnJlbW92ZUNsYXNzKHNvcnRhYmxlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0LiRwbGFjZWhvbGRlcikge1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LiRwbGFjZWhvbGRlci5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb250ZXh0LmxvY2F0aW9uID0gdGhpcy5kcm9wTG9jYXRpb24oZSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHQubG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5sb2NhdGlvbi5zb3J0YWJsZS5vcHRpb25zLm9uRHJvcChjb250ZXh0LCBlLCBkZWZhdWx0cy5vbkRyb3ApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuJGl0ZW0ucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGFuZGxlRHJhZzogZnVuY3Rpb24oZSkge1xuXG4gICAgICAgICAgICBpZiAoY29udGV4dCkge1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzb3J0YWJsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNvcnRhYmxlID0gc29ydGFibGVzW2ldO1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMub3B0aW9ucy5jb250YWluZXJTZWxlY3Rvciwgc29ydGFibGUuJGVsZW1lbnQpLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHQuJHBsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuJHBsYWNlaG9sZGVyLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnRleHQubG9jYXRpb24gPSB0aGlzLmRyb3BMb2NhdGlvbihlKTtcbiAgICAgICAgICAgICAgICBpZiAoY29udGV4dC5sb2NhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmxvY2F0aW9uLiRjb250YWluZXIuYWRkQ2xhc3MoY29udGV4dC5sb2NhdGlvbi5zb3J0YWJsZS5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC4kcGxhY2Vob2xkZXIgPSBjb250ZXh0LmxvY2F0aW9uLmJlZm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgPyAkKGNvbnRleHQubG9jYXRpb24uc29ydGFibGUub3B0aW9ucy5wbGFjZWhvbGRlcikuaW5zZXJ0QmVmb3JlKGNvbnRleHQubG9jYXRpb24uJGl0ZW0pXG4gICAgICAgICAgICAgICAgICAgICAgICA6ICQoY29udGV4dC5sb2NhdGlvbi5zb3J0YWJsZS5vcHRpb25zLnBsYWNlaG9sZGVyKS5pbnNlcnRBZnRlcihjb250ZXh0LmxvY2F0aW9uLiRpdGVtKVxuICAgICAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29udGV4dC5zb3J0YWJsZS5vcHRpb25zLm9uRHJhZyhjb250ZXh0LCBlLCBkZWZhdWx0cy5vbkRyYWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH07XG5cbiAgICB2YXIgQVBJID0gJC5leHRlbmQoU29ydGFibGUucHJvdG90eXBlLCB7XG5cbiAgICAgICAgZW5hYmxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB9LFxuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgICQuZm5bcGx1Z2luTmFtZV0gPSBmdW5jdGlvbihtZXRob2RPck9wdGlvbnMpIHtcblxuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgJHQgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIG9iamVjdCA9ICR0LmRhdGEocGx1Z2luTmFtZSlcbiAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgaWYgKG9iamVjdCAmJiBBUElbbWV0aG9kT3JPcHRpb25zXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBUElbbWV0aG9kT3JPcHRpb25zXS5hcHBseShvYmplY3QsIGFyZ3MpIHx8IHRoaXM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFvYmplY3QgJiYgKG1ldGhvZE9yT3B0aW9ucyA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBtZXRob2RPck9wdGlvbnMgPT09IFwib2JqZWN0XCIpKSB7XG4gICAgICAgICAgICAgICAgJHQuZGF0YShwbHVnaW5OYW1lLCBuZXcgU29ydGFibGUoJHQsIG1ldGhvZE9yT3B0aW9ucykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSk7XG4gICAgfTtcblxufSkoalF1ZXJ5LCB3aW5kb3csICdzb3J0YWJsZScpO1xuIiwiKGZ1bmN0aW9uKCQsIENvcmUpIHtcblxuICAgIFZ1ZS5kaXJlY3RpdmUoJ2FmZml4Jywge1xuXG4gICAgICAgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgaWYgKCQuZm4uYWZmaXgpIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMuZWwpLmFmZml4KHRoaXMudm0uJGdldCh0aGlzLmV4cHJlc3Npb24pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgIH0sXG4gICAgICAgIHVuYmluZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xuXG4gICAgVnVlLmRpcmVjdGl2ZSgnY29tYm8nLCB7XG5cbiAgICAgICAgYmluZDogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBpZiAoJC5mbi50YWdzaW5wdXQpIHtcblxuICAgICAgICAgICAgICAgICQodGhpcy5lbCkuc2VsZWN0Mih7XG4gICAgICAgICAgICAgICAgICAgIHRhZ3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG11bHRpcGxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlVGFnOiBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBwYXJhbXMudGVybSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBwYXJhbXMudGVybSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdPcHRpb246IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgIH0sXG4gICAgICAgIHVuYmluZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xuXG4gICAgVnVlLmRpcmVjdGl2ZSgnZGF0ZScsIHtcblxuICAgICAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIGlmICgkLmZuLmRhdGVwaWNrZXIpIHtcblxuICAgICAgICAgICAgICAgICQodGhpcy5lbCkuZGF0ZXBpY2tlcih7XG4gICAgICAgICAgICAgICAgICAgIGF1dG9jbG9zZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgdG9kYXlIaWdobGlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdDogXCJ5eXl5LW1tLWRkXCJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgIH0sXG4gICAgICAgIHVuYmluZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xuXG4gICAgVnVlLmRpcmVjdGl2ZSgncmljaCcsIHtcblxuICAgICAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIGlmICh3aW5kb3cuQ0tFRElUT1IpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuZWRpdG9yID0gQ0tFRElUT1IuaW5saW5lKHRoaXMuZWwsIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVzU2V0OiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdCb2xkZXInLCBlbGVtZW50OiAnc3BhbicsIGF0dHJpYnV0ZXM6IHsgJ2NsYXNzJzogJ2V4dHJhYm9sZCd9IH1cbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgdG9vbGJhckdyb3VwczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8geyBuYW1lOiAnY2xpcGJvYXJkJywgICBncm91cHM6IFsgJ2NsaXBib2FyZCcsICd1bmRvJyBdIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB7IG5hbWU6ICdlZGl0aW5nJywgICAgIGdyb3VwczogWyAnZmluZCcsICdzZWxlY3Rpb24nLCAnc3BlbGxjaGVja2VyJyBdIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdsaW5rcycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHsgbmFtZTogJ2Zvcm1zJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6ICd0b29scyd9LFxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6ICdkb2N1bWVudCcsIGdyb3VwczogWydtb2RlJywgJ2RvY3VtZW50JywgJ2RvY3Rvb2xzJ119LFxuICAgICAgICAgICAgICAgICAgICAgICAge25hbWU6ICdvdGhlcnMnfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiAncGFyYWdyYXBoJywgZ3JvdXBzOiBbJ2xpc3QnLCAnaW5kZW50JywgJ2Jsb2NrcycsICdhbGlnbiddfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnY29sb3JzJ30sXG4gICAgICAgICAgICAgICAgICAgICAgICAnLycsXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ2Jhc2ljc3R5bGVzJywgZ3JvdXBzOiBbJ2Jhc2ljc3R5bGVzJywgJ2NsZWFudXAnXX0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ3N0eWxlcyd9LFxuICAgICAgICAgICAgICAgICAgICAgICAgJy8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnaW5zZXJ0JywgZ3JvdXBzOiBbICdJbWFnZUJ1dHRvbicgXSAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy97bmFtZTogJ2Fib3V0J31cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0b3Iub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVkaXRvci51cGRhdGVFbGVtZW50KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudm0uJHNldCh0aGlzLmV4cHJlc3Npb24sICQodGhpcy5lbCkudmFsKCkpO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmVkaXRvci5zZXREYXRhKHRoaXMudm0uJGdldCh0aGlzLmV4cHJlc3Npb24pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd1cGRhdGUnLCBuZXdWYWx1ZSwgb2xkVmFsdWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVuYmluZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3IuZGVzdHJveSgpO1xuICAgICAgICAgICAgdGhpcy5lZGl0b3IgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy50ZXh0YXJlYSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmlucHV0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIENvcmUpIHtcblxuICAgIFZ1ZS5kaXJlY3RpdmUoJ3Njcm9sbGFibGUnLCB7XG5cbiAgICAgICAgYmluZDogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAvLyAkKHRoaXMuZWwpLmNzcyh7XG4gICAgICAgICAgICAvLyAgICAgJ292ZXJmbG93JzogJ2F1dG8nLFxuICAgICAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgICAgIGlmICgkLmZuLnBlcmZlY3RTY3JvbGxiYXIpIHtcbiAgICAgICAgICAgICAgICBWdWUubmV4dFRpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcy5lbCkucGVyZmVjdFNjcm9sbGJhcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBheGlzOiB0aGlzLmV4cHJlc3Npb25cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgfSxcbiAgICAgICAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBDb3JlKSB7XG5cbiAgICBWdWUuZGlyZWN0aXZlKCd0YWdzJywge1xuXG4gICAgICAgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgaWYgKCQuZm4udGFnc2lucHV0KSB7XG5cbiAgICAgICAgICAgICAgICAkKHRoaXMuZWwpLnRhZ3NpbnB1dCh7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICB9LFxuICAgICAgICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIENvcmUpIHtcblxuICAgIFZ1ZS5maWx0ZXIoJ2pzb25QYXRoJywgZnVuY3Rpb24gKGNvbnRleHQsIHN0cikge1xuICAgICAgICBpZiAoc3RyID09PSB1bmRlZmluZWQgfHwgY29udGV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmUgPSAveyhbXn1dKyl9L2c7XG5cbiAgICAgICAgcmVzdWx0ID0gc3RyLnJlcGxhY2UocmUsIGZ1bmN0aW9uKG1hdGNoLCBleHByKSB7XG4gICAgICAgICAgICBqc29uID0gSlNPTlBhdGgoe1xuICAgICAgICAgICAgICAgIGpzb246IGNvbnRleHQsXG4gICAgICAgICAgICAgICAgcGF0aDogZXhwclxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoanNvbi5oYXNPd25Qcm9wZXJ0eSgxKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnYXJyYXknO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ganNvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHJlc3VsdCA9PSAnYXJyYXknKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTlBhdGgoe1xuICAgICAgICAgICAgICAgIGpzb246IGNvbnRleHQsXG4gICAgICAgICAgICAgICAgcGF0aDogc3RyLnJlcGxhY2UocmUsIFwiJDFcIilcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgVnVlLmZpbHRlcigndGVtcGxhdGUnLCBmdW5jdGlvbiAoc3RyaW5nLCBkYXRhKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgcmUgPSAvJHsoW159XSspfS9nO1xuICAgICAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UocmUsIGZ1bmN0aW9uKG1hdGNoLCBrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhW2tleV07XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgVnVlLmZpbHRlcignYXNzaWduJywgZnVuY3Rpb24gKHRhcmdldCwgc291cmNlMSwgc291cmNlMiwgc291cmNlMykge1xuXG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlMSwgc291cmNlMiwgc291cmNlMyk7XG4gICAgfSk7XG5cbiAgICBWdWUuZmlsdGVyKCdjb3B5JywgZnVuY3Rpb24gKHNvdXJjZSkge1xuXG4gICAgICAgIHJldHVybiBuZXcgVnVlKHtcbiAgICAgICAgICAgIGRhdGE6IHNvdXJjZSAhPSBudWxsXG4gICAgICAgICAgICAgICAgPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNvdXJjZSkpXG4gICAgICAgICAgICAgICAgOiBudWxsXG4gICAgICAgIH0pLiRkYXRhO1xuICAgIH0pO1xuXG4gICAgVnVlLmZpbHRlcignY2xvbmUnLCBmdW5jdGlvbiAoc291cmNlKSB7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBWdWUoe1xuICAgICAgICAgICAgZGF0YTogc291cmNlICE9IG51bGxcbiAgICAgICAgICAgICAgICA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc291cmNlKSlcbiAgICAgICAgICAgICAgICA6IG51bGxcbiAgICAgICAgfSkuJGRhdGE7XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgQ29yZSkge1xuXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgZnVuY3Rpb24gcmVwb3NpdGlvbihlbGVtZW50KSB7XG5cbiAgICAgICAgICAgIHZhciBtb2RhbCA9ICQoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgZGlhbG9nID0gJCgnLm1vZGFsLWRpYWxvZycsIG1vZGFsKTtcblxuICAgICAgICAgICAgbW9kYWwuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgICAgICAgICBkaWFsb2cuY3NzKFwibWFyZ2luLXRvcFwiLCBNYXRoLm1heCgwLCAoJCh3aW5kb3cpLmhlaWdodCgpIC0gZGlhbG9nLmhlaWdodCgpKSAvIDIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQoJChkb2N1bWVudCksICcubW9kYWwubW9kYWwtY2VudGVyJykub24oJ3Nob3cuYnMubW9kYWwnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZXBvc2l0aW9uKGUudGFyZ2V0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICAgICAgICAkKCcubW9kYWwubW9kYWwtY2VudGVyOnZpc2libGUnKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgcmVwb3NpdGlvbihlbGVtZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBDb3JlKSB7XG5cbiAgICBWdWUudmFsaWRhdG9yKCdlbWFpbCcsIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgIHJldHVybiAvXigoW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKyhcXC5bXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKSopfChcXFwiLitcXFwiKSlAKChcXFtbMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFxdKXwoKFthLXpBLVpcXC0wLTldK1xcLikrW2EtekEtWl17Mix9KSkkLy50ZXN0KHZhbClcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS51c2Uoe1xuXG4gICAgICAgIGluc3RhbGw6IGZ1bmN0aW9uKFZ1ZSwgb3B0aW9ucykge1xuXG4gICAgICAgICAgICB2YXIgc2VydmljZXMgPSB7fTtcblxuICAgICAgICAgICAgVnVlLnNlcnZpY2UgPSBmdW5jdGlvbihuYW1lLCBzZXJ2aWNlKSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc2VydmljZXNbbmFtZV0gPSBzZXJ2aWNlc1tuYW1lXSB8fCBzZXJ2aWNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdiaW5kaW5ncy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2JpbmRpbmdzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHNldFN0cmF0ZWd5OiBmdW5jdGlvbihzdHJhdGVneSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnY3VycmVudC5iaW5kaW5nLnN0cmF0ZWd5Jywgc3RyYXRlZ3kpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldFN0cmF0ZWd5OiBmdW5jdGlvbihzdHJhdGVneSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLiRnZXQoJ2N1cnJlbnQuYmluZGluZy5zdHJhdGVneScpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuY3VycmVudC5iaW5kaW5nKSB0aGlzLmN1cnJlbnQuYmluZGluZyA9IHt9O1xuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgdmFyIEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnYmluZGluZ3MnLCB7XG5cbiAgICAgICAgbWl4aW5zOiBbQ29yZS5BY3Rpb25NaXhpbihNb2RhbEVkaXRvcildLFxuICAgIH0pO1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdkb21haW5zLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignbWFpbicpXSxcbiAgICB9KTtcblxuICAgIHZhciBFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjZG9tYWlucycsXG4gICAgfSk7XG5cblxuICAgIHZhciBTZXR0aW5nc0xpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZG9tYWlucy1zZXR0aW5ncy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIFNldHRpbmdzTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLXNldHRpbmdzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU2V0dGluZ3NFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU2V0dGluZ3NMaXN0Vmlld2VyLCBTZXR0aW5nc01vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtc2V0dGluZ3MnLFxuICAgIH0pO1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ21haW4nKV0sXG4gICAgfSk7XG5cbiAgICB2YXIgRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihMaXN0Vmlld2VyLCBNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcycsXG4gICAgfSk7XG5cblxuICAgIHZhciBTZXR0aW5nc0xpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNldHRpbmdzLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNldHRpbmdzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU2V0dGluZ3NNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc2V0dGluZ3MtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zZXR0aW5ncy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIFNldHRpbmdzRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zZXR0aW5ncycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTZXR0aW5nc0xpc3RWaWV3ZXIsIFNldHRpbmdzTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc2V0dGluZ3MnLFxuICAgIH0pO1xuXG5cbiAgICB2YXIgTWV0YXNMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1tZXRhcy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1tZXRhcy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIE1ldGFzTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLW1ldGFzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtbWV0YXMtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBNZXRhc0VkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtbWV0YXMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTWV0YXNMaXN0Vmlld2VyLCBNZXRhc01vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLW1ldGFzJyxcbiAgICB9KTtcblxufSkoVnVlLCBqUXVlcnksIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsKSB7XG5cbiAgICB2YXIgUGFyYW1WYXJpYWJsZSA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLXZhcmlhYmxlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtdmFyaWFibGUnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgaWQ6IFN0cmluZyxcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIFBhcmFtU3RyaW5nID1cbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtc3RyaW5nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtc3RyaW5nJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGlkOiBTdHJpbmcsXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBQYXJhbVJpY2ggPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1yaWNoJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtcmljaCcsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBpZDogU3RyaW5nLFxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgUGFyYW1Tb3VyY2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1zb3VyY2UnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1zb3VyY2UnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgaWQ6IFN0cmluZyxcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIFBhcmFtTXVsdGlwbGUgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1tdWx0aXBsZScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLW11bHRpcGxlJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGlkOiBTdHJpbmcsXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtLml0ZW1zXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB2YXIgUGFyYW1zID1cbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBvd25lcjogT2JqZWN0LFxuICAgICAgICAgICAgdGFiOiBTdHJpbmcsXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcbiAgICAgICAgfVxuICAgIH0pO1xuXG5cbiAgICB2YXIgUGFyYW1NdWx0aXBsZUxpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1tdWx0aXBsZS1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtbXVsdGlwbGUtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIHByb3A6IE9iamVjdCxcbiAgICAgICAgICAgIHBhcmFtOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIGdldExhYmVsOiBmdW5jdGlvbihpdGVtKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wLmRpc3BsYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZtID0gbmV3IFZ1ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZtLiRpbnRlcnBvbGF0ZSh0aGlzLnByb3AuZGlzcGxheSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiAnPGl0ZW0+JztcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBQYXJhbUJpbmRpbmdzTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1iaW5kaW5ncy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1iaW5kaW5ncy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignYmluZGluZycpIF0sXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtcyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcblxuICAgICAgICAgICAgdmFyIGJpbmRpbmcgPSB0aGlzLmN1cnJlbnQuYmluZGluZyB8fCB7fTtcbiAgICAgICAgICAgIGlmICghYmluZGluZy5zdHJhdGVneSkgYmluZGluZy5zdHJhdGVneSA9ICdpbnRlcnBvbGF0ZSc7XG5cbiAgICAgICAgICAgIGJpbmRpbmcucGFyYW1zID0gYmluZGluZy5wYXJhbXMgfHwge307XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmNvbnRleHQucHJvcC5wcm9wcykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZXh0LnByb3AucHJvcHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHRoaXMuY29udGV4dC5wcm9wLnByb3BzW2ldO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyYW0gPSBiaW5kaW5nLnBhcmFtc1twcm9wLm5hbWVdID0gYmluZGluZy5wYXJhbXNbcHJvcC5uYW1lXSB8fCB7fTtcblxuICAgICAgICAgICAgICAgICAgICBwYXJhbS5fYWN0aW9uID0gcGFyYW0uX2FjdGlvbiA9PSAndXBkYXRlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgPyAndXBkYXRlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgOiAnY3JlYXRlJ1xuICAgICAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBwcm9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW06IHBhcmFtLFxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2N1cnJlbnQuYmluZGluZycsIGJpbmRpbmcpO1xuICAgICAgICAgICAgdGhpcy4kc2V0KCdpdGVtcycsIGl0ZW1zKTtcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgc2V0U3RyYXRlZ3k6IGZ1bmN0aW9uKHN0cmF0ZWd5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdjdXJyZW50LmJpbmRpbmcuc3RyYXRlZ3knLCBzdHJhdGVneSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0U3RyYXRlZ3k6IGZ1bmN0aW9uKHN0cmF0ZWd5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGdldCgnY3VycmVudC5iaW5kaW5nLnN0cmF0ZWd5Jyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgdmFyIEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLWJpbmRpbmdzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkFjdGlvbk1peGluKFBhcmFtQmluZGluZ3NNb2RhbEVkaXRvcildLFxuICAgIH0pO1xuXG4gICAgdmFyIFBhcmFtTXVsdGlwbGVNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLW11bHRpcGxlLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLW11bHRpcGxlLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2RhdGEnKV0sXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtcyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2NyZWF0ZWQnLCBQYXJhbU11bHRpcGxlTW9kYWxFZGl0b3IpO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmNvbnRleHQucHJvcCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZXh0LnByb3AucHJvcHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgICAgIHZhciBwcm9wID0gdGhpcy5jb250ZXh0LnByb3AucHJvcHNbaV07XG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gdGhpcy5jdXJyZW50W3Byb3AubmFtZV0gPSB0aGlzLmN1cnJlbnRbcHJvcC5uYW1lXSB8fCB7IHZhbHVlOiBudWxsIH07XG5cbiAgICAgICAgICAgICAgICBwYXJhbS5fYWN0aW9uID0gcGFyYW0uX2FjdGlvbiA9PSAndXBkYXRlJ1xuICAgICAgICAgICAgICAgICAgICA/ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgIDogJ2NyZWF0ZSdcbiAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogcHJvcCxcbiAgICAgICAgICAgICAgICAgICAgcGFyYW06IHBhcmFtLFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhpdGVtKTtcblxuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJHNldCgnaXRlbXMnLCBpdGVtcyk7XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB2YXIgUGFyYW1NdWx0aXBsZUVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLW11bHRpcGxlLWVkaXRvcicsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihQYXJhbU11bHRpcGxlTGlzdFZpZXdlciwgUGFyYW1NdWx0aXBsZU1vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1tdWx0aXBsZS1lZGl0b3InLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgcHJvcDogT2JqZWN0LFxuICAgICAgICAgICAgcGFyYW06IE9iamVjdCxcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgfSxcbiAgICB9KTtcblxuXG4gICAgdmFyIFBhcmFtc0xpc3QgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtbGlzdCcsXG4gICAgICAgIGNvbXBvbmVudHM6IHtcbiAgICAgICAgICAgICdwYXJhbXMtc3RyaW5nJzogUGFyYW1TdHJpbmcsXG4gICAgICAgICAgICAncGFyYW1zLXJpY2gnOiBQYXJhbVJpY2gsXG4gICAgICAgICAgICAncGFyYW1zLXNvdXJjZSc6IFBhcmFtU291cmNlLFxuICAgICAgICAgICAgJ3BhcmFtcy1tdWx0aXBsZSc6IFBhcmFtTXVsdGlwbGUsXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBvd25lcjogT2JqZWN0LFxuICAgICAgICAgICAgdGFiOiBTdHJpbmcsXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignbWFpbicpXSxcbiAgICB9KTtcblxuICAgIHZhciBFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcycsXG4gICAgfSk7XG5cblxuICAgIHZhciBTZXR0aW5nc0xpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMtc2V0dGluZ3MtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1zZXR0aW5ncy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIFNldHRpbmdzTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMtc2V0dGluZ3MtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLXNldHRpbmdzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU2V0dGluZ3NFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMtc2V0dGluZ3MnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU2V0dGluZ3NMaXN0Vmlld2VyLCBTZXR0aW5nc01vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMtc2V0dGluZ3MnLFxuICAgIH0pO1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2V0dGluZ3MtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzZXR0aW5ncy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdkb21haW5zJyldLFxuICAgIH0pO1xuXG4gICAgdmFyIEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2V0dGluZ3MnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuQWN0aW9uTWl4aW4oTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBwdXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvc2V0dGluZ3MvZG8tdXBkYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5kb25lKChkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgZCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwdWxsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvc2V0dGluZ3MnLFxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5kb25lKChkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgZCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBTdG9yYWdlc0xpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3N0b3JhZ2VzLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3N0b3JhZ2VzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU3RvcmFnZXNNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc3RvcmFnZXMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzdG9yYWdlcy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBjaGVjazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2NoZWNrJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBTdG9yYWdlc0VkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc3RvcmFnZXMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU3RvcmFnZXNMaXN0Vmlld2VyLCBTdG9yYWdlc01vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3N0b3JhZ2VzJyxcbiAgICB9KTtcblxuICAgIHZhciBTdG9yYWdlc1ZhcmlhYmxlc0xpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3N0b3JhZ2VzLXZhcmlhYmxlcy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzdG9yYWdlcy12YXJpYWJsZXMtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTdG9yYWdlc1ZhcmlhYmxlc01vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdzdG9yYWdlcy12YXJpYWJsZXMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzdG9yYWdlcy12YXJpYWJsZXMtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTdG9yYWdlc1ZhcmlhYmxlc0VkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc3RvcmFnZXMtdmFyaWFibGVzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFN0b3JhZ2VzVmFyaWFibGVzTGlzdFZpZXdlciwgU3RvcmFnZXNWYXJpYWJsZXNNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNzdG9yYWdlcy12YXJpYWJsZXMnLFxuICAgIH0pO1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCd3aWRnZXRzLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3dpZGdldHMtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnd2lkZ2V0cy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3dpZGdldHMtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3dpZGdldHMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjd2lkZ2V0cycsXG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgdmFyIHNjYWxlID0gMTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWFjdGlvbnMnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWFjdGlvbnMnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcbiAgICAgICAgICAgIGNhdGVnb3J5OiBPYmplY3QsXG4gICAgICAgICAgICBkb21haW46IE9iamVjdCxcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdFxuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgaXRlbSwgY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgem9vbTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBzY2FsZSArPSAoZXZlbnQgPT0gJ2luJykgPyAwLjEgOiAtMC4xO1xuICAgICAgICAgICAgICAgICQoJy5nZS5nZS1wYWdlJykuY3NzKCd0cmFuc2Zvcm0nLCAnc2NhbGUoJyArIHNjYWxlICsgJyknKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1icmFuZCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtYnJhbmQnLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWNhdGVnb3JpZXMnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWNhdGVnb3JpZXMnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogQXJyYXksXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1jb250YWluZXInLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWNvbnRhaW5lcicsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBydW50aW1lID0gVnVlLnNlcnZpY2UoJ3J1bnRpbWUnLCB7XG5cbiAgICAgICAgZXZhbHVhdGU6IGZ1bmN0aW9uKHNlbGYsIGIsIHYpIHtcblxuICAgICAgICAgICAgaWYgKGIgJiYgYi5leHByZXNzaW9uKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYi5zdHJhdGVneSA9PSAnZXZhbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHNlbGYuJGV2YWwoYi5leHByZXNzaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChiLnN0cmF0ZWd5ID09ICd3aXJlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gc2VsZi4kZ2V0KGIuZXhwcmVzc2lvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygndmFsdWUnLCB2YWx1ZSwgYik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi4kaW50ZXJwb2xhdGUoYi5leHByZXNzaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Nhbm5vdCBldmFsdWF0ZSBleHByZXNzaW9uJywgYi5leHByZXNzaW9uKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgfSxcblxuICAgICAgICBldmFsdWF0ZVBhcmFtczogZnVuY3Rpb24oc2VsZiwgcHJvcHMsIHBhcmFtcykge1xuXG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHByb3BzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHBhcmFtcyAmJiBwYXJhbXNbcHJvcC5uYW1lXTtcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogcHJvcCxcbiAgICAgICAgICAgICAgICAgICAgcGFyYW06IHBhcmFtLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gaXRlbXNbaV07XG5cbiAgICAgICAgICAgICAgICB2YXIgbiA9IGl0ZW0ucHJvcC5uYW1lO1xuICAgICAgICAgICAgICAgIHZhciByID0gaXRlbS5wcm9wLnZhcmlhYmxlO1xuICAgICAgICAgICAgICAgIHZhciBiID0gaXRlbS5wYXJhbS5iaW5kaW5nO1xuICAgICAgICAgICAgICAgIHZhciB2ID0gaXRlbS5wYXJhbS52YWx1ZTtcblxuICAgICAgICAgICAgICAgIGlmIChpdGVtLnByb3AudHlwZSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIEltcGxlbWVudFxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbS5wcm9wLnR5cGUgPT0gJ211bHRpcGxlJykge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChiICYmIGIuZXhwcmVzc2lvbikge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdnYgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXJyYXkgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBydW50aW1lLmV2YWx1YXRlKHNlbGYsIGIsIHYpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZ2ID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkLmlzQXJyYXkocmVzdWx0KSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcmVzdWx0Lmxlbmd0aDsgaisrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2bSA9IG5ldyBWdWUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IE9iamVjdC5hc3NpZ24oSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzZWxmLiRkYXRhKSksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXg6IGosXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmVzdWx0W2pdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJheS5wdXNoKHRoaXMuZXZhbHVhdGVQYXJhbXModm0sIGl0ZW0ucHJvcC5wcm9wcywgYi5wYXJhbXMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZ2ID0gYXJyYXk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhcnJheSA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHYubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmkgPSB2W2pdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2aS5fYWN0aW9uICE9ICdyZW1vdmUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5W2luZGV4KytdID0gdGhpcy5ldmFsdWF0ZVBhcmFtcyhzZWxmLCBpdGVtLnByb3AucHJvcHMsIHZpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZ2ID0gciA/IHsgdmFsdWU6IGFycmF5IH0gOiBhcnJheTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlW25dID0gdnY7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB2diA9IHJ1bnRpbWUuZXZhbHVhdGUoc2VsZiwgYiwgdik7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlW25dID0gdnYgfHwgJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBEZWNvcmF0b3JNaXhpbiA9IHtcblxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxuICAgICAgICB9LFxuXG4gICAgICAgIG1ldGhvZHM6IHtcblxuICAgICAgICAgICAgcmVtb3ZlV2lkZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaCgncmVtb3ZlQ2hpbGRXaWRnZXQnLCB7IGl0ZW06IHRoaXMubW9kZWwgfSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBkb0FwcGx5OiBmdW5jdGlvbihtb2RlbCkge1xuXG4gICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG1vZGVsKSksIHtcbiAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogdGhpcy5tb2RlbC5fYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMubW9kZWwuX2FjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ3Jlc2l6ZScpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgc2hvd1NldHRpbmdzOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkaWFsb2cgPSBuZXcgU2hlbGwuV2lkZ2V0cy5Nb2RhbEVkaXRvcih7XG5cbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsczogdGhpcy5nbG9iYWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3duZXI6IHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiB0aGlzLndpZGdldFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiB0aGlzLm1vZGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudDogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKSlcbiAgICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3duZXIuZG9BcHBseSh0aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkuJG1vdW50KCkuJGFwcGVuZFRvKCQoJ2JvZHknKS5nZXQoMCkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgdmFyIEJpbmRpbmdzTWl4aW4gPSB7XG5cbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGJpbmRpbmdzOiB0aGlzLmJpbmRpbmdzLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBiaW5kaW5ncyA9IHJ1bnRpbWUuZXZhbHVhdGVQYXJhbXModGhpcywgdGhpcy53aWRnZXQucHJvcHMsIHRoaXMubW9kZWwucGFyYW1zKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2JpbmRpbmdzJywgYmluZGluZ3MpO1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdzdG9yYWdlJywgKHN0b3JhZ2UpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgYmluZGluZ3MgPSBydW50aW1lLmV2YWx1YXRlUGFyYW1zKHRoaXMsIHRoaXMud2lkZ2V0LnByb3BzLCB0aGlzLm1vZGVsLnBhcmFtcyk7XG4gICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdiaW5kaW5ncycsIGJpbmRpbmdzKTtcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBkZWVwOiB0cnVlLFxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnbW9kZWwnLCAobW9kZWwpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgYmluZGluZ3MgPSBydW50aW1lLmV2YWx1YXRlUGFyYW1zKHRoaXMsIHRoaXMud2lkZ2V0LnByb3BzLCBtb2RlbC5wYXJhbXMpXG4gICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdiaW5kaW5ncycsIGJpbmRpbmdzKTtcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBkZWVwOiB0cnVlLFxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBDb21wb3NpdGVNaXhpbiA9IHtcblxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IHRoaXMuY2hpbGRyZW4sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnaXRlbXMnLCAoaXRlbXMpID0+IHtcblxuICAgICAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IFtdO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtcykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IGl0ZW1zW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uX2FjdGlvbiAhPSAncmVtb3ZlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5wbGFjZWhvbGRlcigpKSkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGV2ZW50czoge1xuXG4gICAgICAgICAgICByZW1vdmVDaGlsZFdpZGdldDogZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBkYXRhLml0ZW07XG5cbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5fYWN0aW9uID09ICdjcmVhdGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMuJHJlbW92ZShpdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLl9hY3Rpb24gPSAncmVtb3ZlJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zID0gdGhpcy5pdGVtcy5zbGljZSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcblxuICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgIGZpbmQ6IGZ1bmN0aW9uKGNoaWxkcmVuLCBkb21JbmRleCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aCAmJiBpbmRleCA8IGRvbUluZGV4OyBpKyspIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQuX2FjdGlvbiAhPSAncmVtb3ZlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgdmFyIFNvcnRhYmxlTWl4aW4gPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcblxuICAgICAgICByZXR1cm4ge1xuXG4gICAgICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBhdHRhY2hlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy4kcm91dGUucHJpdmF0ZSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBzaGVsbCA9IFZ1ZS5zZXJ2aWNlKCdzaGVsbCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuJHdhdGNoKCdzZWxlY3RlZCcsIGZ1bmN0aW9uKHNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBpZiAodGhpcy5zb3J0YWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIGlmIChzZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICB0aGlzLnNvcnRhYmxlLnNvcnRhYmxlKFwiZGlzYWJsZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICB0aGlzLnNvcnRhYmxlLnNvcnRhYmxlKFwiZW5hYmxlXCIpO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgICAgIHNlbGVjdFRhcmdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICB1bnNlbGVjdFRhcmdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1kZWNvcmF0b3Itc3R1YicsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZGVjb3JhdG9yLXN0dWInLFxuICAgICAgICBtaXhpbnM6IFsgRGVjb3JhdG9yTWl4aW4sIEJpbmRpbmdzTWl4aW4gXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0LFxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1kZWNvcmF0b3Itd2lkZ2V0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kZWNvcmF0b3Itd2lkZ2V0JyxcbiAgICAgICAgbWl4aW5zOiBbIERlY29yYXRvck1peGluLCBCaW5kaW5nc01peGluIF0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxuICAgICAgICAgICAgc3RhY2s6IE9iamVjdCxcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcbiAgICAgICAgICAgIHN0b3JhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXG4gICAgICAgICAgICB3aWRnZXQ6IE9iamVjdCxcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtZGVjb3JhdG9yLWhvcmlzb250YWwnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWRlY29yYXRvci1ob3Jpc29udGFsJyxcbiAgICAgICAgbWl4aW5zOiBbIERlY29yYXRvck1peGluLCBDb21wb3NpdGVNaXhpbiwgU29ydGFibGVNaXhpbignPi5nZS5nZS1jb250ZW50ID4ud2cud2ctZGVmYXVsdC1zdGFjayA+LndnLndnLWNvbnRlbnQgPi53Zy53Zy10YWJsZSA+LndnLndnLXJvdycpLCBCaW5kaW5nc01peGluIF0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxuICAgICAgICAgICAgc3RhY2s6IE9iamVjdCxcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcbiAgICAgICAgICAgIHN0b3JhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXG4gICAgICAgICAgICB3aWRnZXQ6IE9iamVjdCxcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFZ1ZS5zZXJ2aWNlKCdwYWxldHRlJykucGxhY2Vob2xkZXIoYFxuICAgICAgICAgICAgICAgICAgICA8c21hbGw+SG9yaXNvbnRhbCBTdGFjazwvc21hbGw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+RHJvcCBIZXJlPC9kaXY+XG4gICAgICAgICAgICAgICAgYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1kZWNvcmF0b3ItdmVydGljYWwnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWRlY29yYXRvci12ZXJ0aWNhbCcsXG4gICAgICAgIG1peGluczogWyBEZWNvcmF0b3JNaXhpbiwgQ29tcG9zaXRlTWl4aW4sIFNvcnRhYmxlTWl4aW4oJz4uZ2UuZ2UtY29udGVudCA+LndnLndnLWRlZmF1bHQtc3RhY2sgPi53Zy53Zy1jb250ZW50ID4ud2cud2ctdGFibGUnKSwgQmluZGluZ3NNaXhpbiBdLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXG4gICAgICAgICAgICBzdG9yYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3QsXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBWdWUuc2VydmljZSgncGFsZXR0ZScpLnBsYWNlaG9sZGVyKGBcbiAgICAgICAgICAgICAgICAgICAgPHNtYWxsPlZlcnRpY2FsIFN0YWNrPC9zbWFsbD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5Ecm9wIEhlcmU8L2Rpdj5cbiAgICAgICAgICAgICAgICBgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci1jYW52YXMnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWRlY29yYXRvci1jYW52YXMnLFxuICAgICAgICBtaXhpbnM6IFsgQ29tcG9zaXRlTWl4aW4sIFNvcnRhYmxlTWl4aW4oJz4uZ2UuZ2UtY29udGVudCA+LndnLndnLWRlZmF1bHQtc3RhY2sgPi53Zy53Zy1jb250ZW50ID4ud2cud2ctdGFibGUnKSBdLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXG4gICAgICAgICAgICBzdG9yYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgfSxcbiAgICAgICAgYXR0YWNoZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgZHJhZ2dlZDtcblxuICAgICAgICAgICAgdGhpcy5zb3J0YWJsZSA9ICQodGhpcy4kZWwpLnNvcnRhYmxlKHtcblxuICAgICAgICAgICAgICAgIHZlcnRpY2FsOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRyb3A6IHRydWUsXG5cbiAgICAgICAgICAgICAgICBjb250YWluZXJTZWxlY3RvcjogJy53Zy53Zy1zb3J0YWJsZS1jb250YWluZXIud2ctc29ydGFibGUtZWRpdGFibGUnLFxuICAgICAgICAgICAgICAgIGl0ZW1TZWxlY3RvcjogJy53Zy53Zy1zb3J0YWJsZS1pdGVtLndnLXNvcnRhYmxlLWVkaXRhYmxlJyxcbiAgICAgICAgICAgICAgICBleGNsdWRlU2VsZWN0b3I6ICcuZ2UuZ2Utb3ZlcmxheScsXG5cbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbENsYXNzOiBcIndnLXNvcnRhYmxlLXZlcnRpY2FsXCIsXG4gICAgICAgICAgICAgICAgaG9yaXNvbnRhbENsYXNzOiBcIndnLXNvcnRhYmxlLWhvcmlzb250YWxcIixcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogYFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwid2cgd2ctc29ydGFibGUtcGxhY2Vob2xkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3ZyB3Zy1wbGFjZWhvbGRlci1jb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwid2cgd2ctcGxhY2Vob2xkZXItaW5uZXJcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICBgLFxuICAgICAgICAgICAgICAgIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbihjb250ZXh0LCBldmVudCwgX3N1cGVyKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgX3N1cGVyKGNvbnRleHQsIGV2ZW50KTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhY2sgPSAkKGNvbnRleHQuJGNvbnRhaW5lcikuY2xvc2VzdCgnLmdlLmdlLXdpZGdldCcpLmdldCgwKS5fX3Z1ZV9fO1xuXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnZWQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFjazogc3RhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogc3RhY2suZmluZChzdGFjay5pdGVtcywgY29udGV4dC4kb3JpZ2luYWxJdGVtLmluZGV4KCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdnVlOiBjb250ZXh0LiRvcmlnaW5hbEl0ZW0uZmluZCgnLmdlLmdlLXdpZGdldDpmaXJzdCcpLmdldCgwKS5fX3Z1ZV9fLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25Ecm9wOiBmdW5jdGlvbihjb250ZXh0LCBldmVudCwgX3N1cGVyKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgX3N1cGVyKGNvbnRleHQsIGV2ZW50KTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhY2sgPSBjb250ZXh0LmxvY2F0aW9uLiRjb250YWluZXIuY2xvc2VzdCgnLmdlLmdlLXdpZGdldCcpLmdldCgwKS5fX3Z1ZV9fO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB3ID0gY29udGV4dC4kaXRlbS5kYXRhKCd3aWRnZXQnKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmkgPSBzdGFjay5maW5kKHN0YWNrLml0ZW1zLCBjb250ZXh0LiRpdGVtLmluZGV4KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2suaXRlbXMuc3BsaWNlKG5pLCAwLCBWdWUuc2VydmljZSgncGFsZXR0ZScpLndpZGdldCh3KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdnZWQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuaSA9IHN0YWNrLmZpbmQoc3RhY2suaXRlbXMsIGNvbnRleHQuJGl0ZW0uaW5kZXgoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0l0ZW0gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRyYWdnZWQudnVlLm1vZGVsKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3SXRlbS5fYWN0aW9uID0gJ2NyZWF0ZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCdyZXNvdXJjZScgaW4gbmV3SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgbmV3SXRlbS5yZXNvdXJjZS5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG5ld0l0ZW0uaWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2VkLnN0YWNrLml0ZW1zLnNwbGljZShkcmFnZ2VkLmluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFjay5pdGVtcy5zcGxpY2UobmksIDAsIG5ld0l0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC4kaXRlbS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBWdWUuc2VydmljZSgncGFsZXR0ZScpLnBsYWNlaG9sZGVyKGBcbiAgICAgICAgICAgICAgICAgICAgPHNtYWxsPlZlcnRpY2FsIFN0YWNrPC9zbWFsbD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5Ecm9wIEhlcmU8L2Rpdj5cbiAgICAgICAgICAgICAgICBgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1kb21haW5zJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kb21haW5zJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGRvbWFpbnM6IEFycmF5LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIFNoZWxsLkxvYWRlciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtbG9hZGVyJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1sb2FkZXInLFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcG9ydGFsOiBudWxsLFxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiBudWxsLFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdwb3J0YWxzJykuZ2V0KHsgaWQ6IHRoaXMuJHJvdXRlLnBhcmFtcy5wb3J0YWwgfSkudGhlbihcbiAgICAgICAgICAgICAgICAoZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ3BvcnRhbCcsIGQuZGF0YS5wb3J0YWwpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ3NldHRpbmdzJywgZC5kYXRhLnNldHRpbmdzKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wYWdlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wYWdlJyxcbiAgICAgICAgbWl4aW5zOiBbIC8qQ29yZS5Db250YWluZXJNaXhpbiwgQ29yZS5Tb3J0YWJsZU1peGluKi8gXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkZWNvcmF0b3I6IHRoaXMuZGVjb3JhdG9yLFxuICAgICAgICAgICAgICAgIGRhdGE6IHRoaXMuZGF0YSxcbiAgICAgICAgICAgICAgICBzdG9yYWdlOiB0aGlzLnN0b3JhZ2UsXG4gICAgICAgICAgICAgICAgcGFnZVNldHRpbmdzOiB7fSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgcnVudGltZSA9IFZ1ZS5zZXJ2aWNlKCdydW50aW1lJyk7XG5cbiAgICAgICAgICAgIHRoaXMuZGVjb3JhdG9yID0gJ3NoZWxsLWRlY29yYXRvci1jYW52YXMnO1xuICAgICAgICAgICAgdGhpcy5kYXRhID0ge307XG4gICAgICAgICAgICB0aGlzLnN0b3JhZ2UgPSB7fTtcblxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ3BhZ2UucmVzb3VyY2UnLCAocmVzb3VyY2UpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ3BhZ2VTZXR0aW5ncy53aWR0aCcsICc5NjBweCcpOyAvLyBkZWZhdWx0XG4gICAgICAgICAgICAgICAgaWYgKHJlc291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAocGFyYW0gaW4gcmVzb3VyY2UucGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ3BhZ2VTZXR0aW5ncy4nICsgcmVzb3VyY2UucGFyYW1zW3BhcmFtXS5uYW1lLCByZXNvdXJjZS5wYXJhbXNbcGFyYW1dLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgncGFnZS5zdG9yYWdlcycsIChzdG9yYWdlcykgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKHN0b3JhZ2VzKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0b3JhZ2UgPSB7fTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0b3JhZ2VzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdCA9IHN0b3JhZ2VzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmFnZVtzdC5uYW1lXSA9IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN0LnZhcmlhYmxlcy5sZW5ndGg7IGorKykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhcmlhYmxlID0gc3QudmFyaWFibGVzW2pdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JhZ2Vbc3QubmFtZV1bdmFyaWFibGUubmFtZV0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBydW50aW1lLmV2YWx1YXRlKHRoaXMsIHZhcmlhYmxlLmJpbmRpbmcsIHZhcmlhYmxlLnZhbHVlKSB8fCBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnc3RvcmFnZScsIHN0b3JhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgncGFnZS5zb3VyY2VzJywgKHNvdXJjZXMpID0+IHtcblxuICAgICAgICAgICAgICAgIGlmIChzb3VyY2VzKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc291cmNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucHVzaCh0aGlzLmRvUmVxdWVzdChzb3VyY2VzW2ldKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVmZXJyZWQubGVuZ3RoID4gMSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkLndoZW4uYXBwbHkodGhpcywgZGVmZXJyZWQpLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW3NvdXJjZXNbaV0ubmFtZV0gPSBhcmd1bWVudHNbaV1bMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnZGF0YScsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRlZmVycmVkLmxlbmd0aCA9PSAxKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkWzBdLmRvbmUoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtzb3VyY2VzWzBdLm5hbWVdID0gZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2RhdGEnLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBkb1JlcXVlc3Q6IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgICAgICAgICB2YXIgcXVlcnkgPSB7fTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHMucGFyYW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHMucGFyYW1zW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW0uaW4gPT0gJ3F1ZXJ5JyAmJiBwYXJhbS5zcGVjaWZpZWQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gcGFyYW0uYmluZGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMuJGludGVycG9sYXRlKHBhcmFtLmJpbmRpbmcpIC8vIFRPRE8gSW50ZXJwb2xhdGUgaW4gcGFnZSBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogcGFyYW0udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5W3BhcmFtLm5hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBzLm1ldGhvZCxcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBzLnVybCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBxdWVyeSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wYWdlcycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcGFnZXMnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgcGFnZXM6IEFycmF5LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIHZhciBQYWxldHRlSXRlbSA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcGFsZXR0ZS1pdGVtJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wYWxldHRlLWl0ZW0nLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgY2F0ZWdvcnk6IE9iamVjdCxcbiAgICAgICAgICAgIGdyb3VwOiBPYmplY3QsXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIGF0dGFjaGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgIC8vIHZhciBhZGp1c3RtZW50O1xuICAgICAgICAvLyAgICAgLy8gdmFyIGRyYWdnZWQ7XG4gICAgICAgIC8vICAgICAvLyB2YXIgb2xkQ29udGFpbmVyO1xuICAgICAgICAvL1xuICAgICAgICAvLyAgICAgJCh0aGlzLiRlbCkuc29ydGFibGUoe1xuICAgICAgICAvLyAgICAgICAgIGdyb3VwOiAnd2lkZ2V0cycsXG4gICAgICAgIC8vICAgICAgICAgY2xvbmU6IHRydWUsXG4gICAgICAgIC8vICAgICAgICAgY29udGFpbmVyU2VsZWN0b3I6ICcud2ctc29ydGFibGUtY29udGFpbmVyJyxcbiAgICAgICAgLy8gICAgICAgICBpdGVtU2VsZWN0b3I6ICcud2ctc29ydGFibGUtaXRlbScsXG4gICAgICAgIC8vICAgICAgICAgZHJvcDogZmFsc2UsXG4gICAgICAgIC8vICAgICAgICAgLy8gY29udGFpbmVyUGF0aDogJy53Zy53Zy1pdGVtLWNvbnRlbnQgPiAud2cud2ctaW5uZXIgPiAuZ2UuZ2UtZGVjb3JhdG9yID4gLmdlLmdlLXdpZGdldCA+IC5nZS5nZS1jb250ZW50ID4gLndnLndnLXNvcnRhYmxlID4gLndnLndnLXNvcnRhYmxlLWNvbnRlbnQgPiAud2cud2ctc29ydGFibGUtaW5uZXInLFxuICAgICAgICAvLyAgICAgICAgIC8vIGl0ZW1QYXRoOiAnJyxcbiAgICAgICAgLy8gICAgICAgICAvLyB2ZXJ0aWNhbENsYXNzOiBcIndnLXNvcnRhYmxlLXZlcnRpY2FsXCIsXG4gICAgICAgIC8vICAgICAgICAgLy8gaG9yaXNvbnRhbENsYXNzOiBcIndnLXNvcnRhYmxlLWhvcmlzb250YWxcIixcbiAgICAgICAgLy8gICAgICAgICAvLyBwbGFjZWhvbGRlcjogYFxuICAgICAgICAvLyAgICAgICAgIC8vICAgICA8ZGl2IGNsYXNzPVwid2cgd2ctc29ydGFibGUtcGxhY2Vob2xkZXJcIj5cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIDxkaXYgY2xhc3M9XCJ3ZyB3Zy1wbGFjZWhvbGRlci1jb250YWluZXJcIj5cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwid2cgd2ctcGxhY2Vob2xkZXItaW5uZXJcIj48L2Rpdj5cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIDwvZGl2PlxuICAgICAgICAvLyAgICAgICAgIC8vICAgICA8L2Rpdj5cbiAgICAgICAgLy8gICAgICAgICAvLyBgLFxuICAgICAgICAvLyAgICAgICAgIC8vIGFmdGVyTW92ZTogZnVuY3Rpb24gKHBsYWNlaG9sZGVyLCBjb250YWluZXIpIHtcbiAgICAgICAgLy8gICAgICAgICAvL1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICBpZihvbGRDb250YWluZXIgIT0gY29udGFpbmVyKSB7XG4gICAgICAgIC8vICAgICAgICAgLy9cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIGlmKG9sZENvbnRhaW5lcikge1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAgICAgICAgIG9sZENvbnRhaW5lci5lbC5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIH1cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIGNvbnRhaW5lci5lbC5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgLy8gICAgICAgICAvL1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAgICAgb2xkQ29udGFpbmVyID0gY29udGFpbmVyO1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vICAgICAgICAgLy8gfSxcbiAgICAgICAgLy8gICAgICAgICAvLyBvbkRyYWdTdGFydDogZnVuY3Rpb24gKCRpdGVtLCBjb250YWluZXIsIF9zdXBlcikge1xuICAgICAgICAvLyAgICAgICAgIC8vXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIC8vICQoY29udGFpbmVyLmVsKS5wYXJlbnRzKCcud2ctc29ydGFibGUtY29udGFpbmVyJykuc29ydGFibGUoJ2Rpc2FibGUnKTtcbiAgICAgICAgLy8gICAgICAgICAvL1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAvLyBjb25zb2xlLmxvZygkaXRlbSwgJGl0ZW0uZmluZCgnLndnLXNvcnRhYmxlLWNvbnRhaW5lcicpLmxlbmd0aCk7XG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIC8vICRpdGVtLmZpbmQoJy53Zy1zb3J0YWJsZS1jb250YWluZXInKS5zb3J0YWJsZSgnZGlzYWJsZScpO1xuICAgICAgICAvLyAgICAgICAgIC8vXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIC8vIGNvbnNvbGUubG9nKCQoJy53Zy1zb3J0YWJsZS1jb250YWluZXInLCBjb250YWluZXIuZWwpKTtcbiAgICAgICAgLy8gICAgICAgICAvL1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAvLyBjb25zb2xlLmxvZygnZGlzYWJsZScsICQoJy53Zy1zb3J0YWJsZS1jb250YWluZXInLCBjb250YWluZXIuZWwpLmxlbmd0aCk7XG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIC8vICQoJy53Zy1zb3J0YWJsZS1jb250YWluZXInLCBjb250YWluZXIuZWwpLnNvcnRhYmxlKCdkaXNhYmxlJyk7XG4gICAgICAgIC8vICAgICAgICAgLy9cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgdmFyIHcgPSAkaXRlbS5kYXRhKCd3aWRnZXQnKTtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgaWYgKCF3KSB7XG4gICAgICAgIC8vICAgICAgICAgLy9cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIHZhciBzdGFjayA9ICQoY29udGFpbmVyLmVsKS5jbG9zZXN0KCcuZ2UuZ2Utd2lkZ2V0JykuZ2V0KDApLl9fdnVlX187XG4gICAgICAgIC8vICAgICAgICAgLy9cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIGRyYWdnZWQgPSB7XG4gICAgICAgIC8vICAgICAgICAgLy8gICAgICAgICAgICAgc3RhY2s6IHN0YWNrLFxuICAgICAgICAvLyAgICAgICAgIC8vICAgICAgICAgICAgIGluZGV4OiBzdGFjay5maW5kKHN0YWNrLml0ZW1zLCAkaXRlbS5pbmRleCgpKSxcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgICAgICB2dWU6ICRpdGVtLmZpbmQoJy5nZS5nZS13aWRnZXQ6Zmlyc3QnKS5nZXQoMCkuX192dWVfXyxcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIH07XG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gICAgICAgICAvL1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICBpZighY29udGFpbmVyLm9wdGlvbnMuZHJvcCkge1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAgICAgJGl0ZW0uY2xvbmUoKS5pbnNlcnRBZnRlcigkaXRlbSk7XG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gICAgICAgICAvL1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICB2YXIgb2Zmc2V0ID0gJGl0ZW0ub2Zmc2V0KCk7XG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIHZhciBwb2ludGVyID0gY29udGFpbmVyLnJvb3RHcm91cC5wb2ludGVyO1xuICAgICAgICAvLyAgICAgICAgIC8vXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIGFkanVzdG1lbnQgPSB7XG4gICAgICAgIC8vICAgICAgICAgLy8gICAgICAgICBsZWZ0OiBwb2ludGVyLmxlZnQgLSBvZmZzZXQubGVmdCxcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIHRvcDogcG9pbnRlci50b3AgLSBvZmZzZXQudG9wLFxuICAgICAgICAvLyAgICAgICAgIC8vICAgICB9O1xuICAgICAgICAvLyAgICAgICAgIC8vXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIF9zdXBlcigkaXRlbSwgY29udGFpbmVyKTtcbiAgICAgICAgLy8gICAgICAgICAvLyB9LFxuICAgICAgICAvLyAgICAgICAgIC8vIG9uRHJvcDogZnVuY3Rpb24gKCRpdGVtLCBjb250YWluZXIsIF9zdXBlciwgZXZlbnQpIHtcbiAgICAgICAgLy8gICAgICAgICAvL1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAvLyAkaXRlbS5maW5kKCcud2ctc29ydGFibGUtY29udGFpbmVyJykuc29ydGFibGUoJ2VuYWJsZScpO1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAvLyBjb25zb2xlLmxvZygkaXRlbSk7XG4gICAgICAgIC8vICAgICAgICAgLy9cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgLy8gJCgnLndnLXNvcnRhYmxlLWNvbnRhaW5lcicsIGNvbnRhaW5lci5lbCkuc29ydGFibGUoJ2VuYWJsZScpO1xuICAgICAgICAvLyAgICAgICAgIC8vXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIHZhciBzdGFjayA9ICQoY29udGFpbmVyLmVsKS5jbG9zZXN0KCcuZ2UuZ2Utd2lkZ2V0JykuZ2V0KDApLl9fdnVlX187XG4gICAgICAgIC8vICAgICAgICAgLy9cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgdmFyIHcgPSAkaXRlbS5kYXRhKCd3aWRnZXQnKTtcbiAgICAgICAgLy8gICAgICAgICAvL1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICBpZiAodykge1xuICAgICAgICAvLyAgICAgICAgIC8vXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgICAgICB2YXIgbmkgPSBzdGFjay5maW5kKHN0YWNrLml0ZW1zLCAkaXRlbS5pbmRleCgpKTtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIHN0YWNrLml0ZW1zLnNwbGljZShuaSwgMCwgVnVlLnNlcnZpY2UoJ3BhbGV0dGUnKS53aWRnZXQodykpO1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAgICAgJGl0ZW0ucmVtb3ZlKCk7XG4gICAgICAgIC8vICAgICAgICAgLy9cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gICAgICAgICAvL1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAgICAgaWYgKGRyYWdnZWQpIHtcbiAgICAgICAgLy8gICAgICAgICAvL1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAgICAgICAgIHZhciBuaSA9IHN0YWNrLmZpbmQoc3RhY2suaXRlbXMsICRpdGVtLmluZGV4KCkpO1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAgICAgICAgIHZhciBuZXdJdGVtID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkcmFnZ2VkLnZ1ZS5tb2RlbCkpO1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAgICAgICAgIG5ld0l0ZW0uX2FjdGlvbiA9ICdjcmVhdGUnO1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAgICAgICAgIGlmICgncmVzb3VyY2UnIGluIG5ld0l0ZW0pIHtcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgICAgICAgICAgZGVsZXRlIG5ld0l0ZW0ucmVzb3VyY2UuaWQ7XG4gICAgICAgIC8vICAgICAgICAgLy8gICAgICAgICAgICAgfVxuICAgICAgICAvLyAgICAgICAgIC8vICAgICAgICAgICAgIGRlbGV0ZSBuZXdJdGVtLmlkO1xuICAgICAgICAvLyAgICAgICAgIC8vXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgICAgICAgICAgZHJhZ2dlZC5zdGFjay5pdGVtcy5zcGxpY2UoZHJhZ2dlZC5pbmRleCwgMSk7XG4gICAgICAgIC8vICAgICAgICAgLy8gICAgICAgICAgICAgc3RhY2suaXRlbXMuc3BsaWNlKG5pLCAwLCBuZXdJdGVtKTtcbiAgICAgICAgLy8gICAgICAgICAvL1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAgICAgICAgICRpdGVtLnJlbW92ZUNsYXNzKGNvbnRhaW5lci5ncm91cC5vcHRpb25zLmRyYWdnZWRDbGFzcykucmVtb3ZlQXR0cihcInN0eWxlXCIpO1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAvLyAgICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vICAgICAgICAgLy9cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgZHJhZ2dlZCA9IG51bGw7XG4gICAgICAgIC8vICAgICAgICAgLy9cbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgJChcImJvZHlcIikucmVtb3ZlQ2xhc3MoY29udGFpbmVyLmdyb3VwLm9wdGlvbnMuYm9keUNsYXNzKTtcbiAgICAgICAgLy8gICAgICAgICAvLyB9LFxuICAgICAgICAvLyAgICAgICAgIC8vIG9uRHJhZzogZnVuY3Rpb24gKCRpdGVtLCBwb3NpdGlvbikge1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAkaXRlbS5jc3Moe1xuICAgICAgICAvLyAgICAgICAgIC8vICAgICAgICAgbGVmdDogcG9zaXRpb24ubGVmdCAtIGFkanVzdG1lbnQubGVmdCxcbiAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIHRvcDogcG9zaXRpb24udG9wIC0gYWRqdXN0bWVudC50b3AsXG4gICAgICAgIC8vICAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgICAgIC8vIH0sXG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gfVxuICAgIH0pO1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcGFsZXR0ZScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcGFsZXR0ZScsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgICAgICBjYXRlZ29yeTogT2JqZWN0LFxuICAgICAgICB9LFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY2F0ZWdvcmllczogdGhpcy5jYXRlZ29yaWVzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBjb21wb25lbnRzOiB7XG4gICAgICAgICAgICAncGFsZXR0ZS1pdGVtJzogUGFsZXR0ZUl0ZW1cbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmNhdGVnb3JpZXMgPSBXaWRnZXRzLlBhbGV0dGUuY2F0ZWdvcmllcygpO1xuICAgICAgICB9LFxuICAgICAgICBhdHRhY2hlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHRoaXMuc29ydGFibGUgPSAkKHRoaXMuJGVsKS5zb3J0YWJsZSh7XG4gICAgICAgICAgICAgICAgZ3JvdXA6ICd3aWRnZXRzJyxcbiAgICAgICAgICAgICAgICBjb250YWluZXJTZWxlY3RvcjogJy53Zy1zb3J0YWJsZS1jb250YWluZXInLFxuICAgICAgICAgICAgICAgIGl0ZW1TZWxlY3RvcjogJy53Zy1zb3J0YWJsZS1pdGVtJyxcbiAgICAgICAgICAgICAgICBkcm9wOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgaXRlbSwgY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIFNoZWxsLlNoZWxsID0ge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBnbG9iYWxzOiB0aGlzLmdsb2JhbHMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdGhpcy5nbG9iYWxzID0ge1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgcGFnZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBzdG9yYWdlOiBudWxsLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3MsXG4gICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWwsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgIH07XG5cbiAgICBTaGVsbC5TaGVsbFB1YmxpYyA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcHVibGljJywge1xuICAgICAgICBtaXhpbnM6IFsgU2hlbGwuU2hlbGwgXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcHVibGljJyxcbiAgICB9KTtcblxuICAgIFNoZWxsLlNoZWxsUHJpdmF0ZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcHJpdmF0ZScsIHtcblxuICAgICAgICBtaXhpbnM6IFsgU2hlbGwuU2hlbGwgXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcHJpdmF0ZScsXG5cbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlbGV2YW50KGN1cnJlbnQsIGNvbGxlY3Rpb24pIHtcblxuICAgICAgICAgICAgICAgIGlmICghY3VycmVudCB8fCBjdXJyZW50Ll9hY3Rpb24gPT0gJ3JlbW92ZScgfHwgKGNvbGxlY3Rpb24gJiYgY29sbGVjdGlvbi5pbmRleE9mKGN1cnJlbnQpIDwgMCkpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoY29sbGVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2xsZWN0aW9uLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGMgPSBjb2xsZWN0aW9uW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjLl9hY3Rpb24gIT0gJ3JlbW92ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQgJiYgY3VycmVudC5fYWN0aW9uID09ICdyZW1vdmUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLmNhdGVnb3J5ID0gVnVlLnNlcnZpY2UoJ3BhbGV0dGUnKS5jYXRlZ29yaWVzKClbMF07XG5cbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdtb2RlbC5kb21haW5zJywgKGRvbWFpbnMpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLmRvbWFpbiA9IHJlbGV2YW50KHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uZG9tYWluLCBkb21haW5zKTtcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ21vZGVsLnBhZ2VzJywgKHBhZ2VzKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5wYWdlID0gcmVsZXZhbnQodGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5wYWdlLCBwYWdlcyk7XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdnbG9iYWxzLnNlbGVjdGlvbi5wYWdlLnNvdXJjZXMnLCAoc291cmNlcykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uc291cmNlID0gcmVsZXZhbnQodGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5zb3VyY2UsIHNvdXJjZXMpO1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnZ2xvYmFscy5zZWxlY3Rpb24ucGFnZS5zdG9yYWdlcycsIChzdG9yYWdlcykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uc3RvcmFnZSA9IHJlbGV2YW50KHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uc3RvcmFnZSwgc3RvcmFnZXMpO1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgcHVsbDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9zZXR0aW5ncycsXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmRvbmUoKGQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBkKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHB1c2g6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvc2V0dGluZ3MvZG8tdXBkYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5kb25lKChkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgZCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZWxlY3RDYXRlZ29yeTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uY2F0ZWdvcnkgPSBkYXRhLml0ZW07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VsZWN0RG9tYWluOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5kb21haW4gPSBkYXRhLml0ZW07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VsZWN0UGFnZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24ucGFnZSA9IGRhdGEuaXRlbTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZWxlY3RTb3VyY2U6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnNvdXJjZSA9IGRhdGEuaXRlbTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZWxlY3RTdG9yYWdlOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5zdG9yYWdlID0gZGF0YS5pdGVtO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXNvdXJjZXMnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXNvdXJjZXMnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgc291cmNlczogQXJyYXksXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtc3RvcmFnZXMnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXN0b3JhZ2VzJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIHN0b3JhZ2VzOiBBcnJheSxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC10YXJnZXQnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXRhcmdldCcsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgU2hlbGwuV2lkZ2V0ID1cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC13aWRnZXQnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXdpZGdldCcsXG4gICAgICAgIG1peGluczogWyAvKiBDb3JlLkRlY29yYXRvck1peGluLCBDb3JlLkNvbnRhaW5lck1peGluLCBDb3JlLlNvcnRhYmxlTWl4aW4sIENvcmUuQmluZGluZ3NNaXhpbiAqLyBdLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXG4gICAgICAgIH0sXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5kZWNvcmF0b3JzID0ge1xuICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlczoge1xuICAgICAgICAgICAgICAgICAgICAnZGVmYXVsdC1zdGFjay1ob3Jpc29udGFsJzogJ3NoZWxsLWRlY29yYXRvci1ob3Jpc29udGFsJyxcbiAgICAgICAgICAgICAgICAgICAgJ2RlZmF1bHQtc3RhY2stdmVydGljYWwnOiAnc2hlbGwtZGVjb3JhdG9yLXZlcnRpY2FsJyxcbiAgICAgICAgICAgICAgICAgICAgJ2RlZmF1bHQtc3R1Yic6ICdzaGVsbC1kZWNvcmF0b3Itc3R1YicsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmYWxsYmFjazogJ3NoZWxsLWRlY29yYXRvci13aWRnZXQnLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd3aWRnZXQnKTtcblxuICAgICAgICAgICAgdmFyIHNoZWxsID0gVnVlLnNlcnZpY2UoJ3NoZWxsJyk7XG5cbiAgICAgICAgICAgIC8vIHRoaXMud2lkZ2V0ID0gc2hlbGwuZ2V0V2lkZ2V0KHRoaXMubW9kZWwudHlwZSk7XG4gICAgICAgICAgICB0aGlzLndpZGdldCA9IHRoaXMubW9kZWw7XG4gICAgICAgICAgICB0aGlzLmRlY29yYXRvciA9IHRoaXMuZGVjb3JhdG9ycy5hbHRlcm5hdGl2ZXNbdGhpcy5tb2RlbC50YWddIHx8IHRoaXMuZGVjb3JhdG9ycy5mYWxsYmFjaztcblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy4kcm91dGUpO1xuICAgICAgICAgICAgLy8gdGhpcy5kZWNvcmF0b3IgPSAnc2hlbGwtZGVjb3JhdG9yLXN0dWInO1xuICAgICAgICB9LFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB3aWRnZXQ6IHRoaXMud2lkZ2V0LFxuICAgICAgICAgICAgICAgIGRlY29yYXRvcjogdGhpcy5kZWNvcmF0b3IsXG4gICAgICAgICAgICAgICAgLy8gaXRlbXM6IHRoaXMud2lkZ2V0cyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCkge1xuXG4gICAgdmFyIFNvdXJjZXNMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTb3VyY2VzTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIGNoZWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY2hlY2snKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIFNvdXJjZXNFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU291cmNlc0xpc3RWaWV3ZXIsIFNvdXJjZXNNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzJyxcbiAgICB9KTtcblxuICAgIHZhciBTb3VyY2VzUGFyYW1zTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1wYXJhbXMtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcy1wYXJhbXMtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTb3VyY2VzUGFyYW1zTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcy1wYXJhbXMtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTb3VyY2VzUGFyYW1zRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLXBhcmFtcycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTb3VyY2VzUGFyYW1zTGlzdFZpZXdlciwgU291cmNlc1BhcmFtc01vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zJyxcbiAgICB9KTtcblxufSkoVnVlLCBqUXVlcnksIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsKSB7XG5cbiAgICB2YXIgV2lkZ2V0c0xpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBnZXRXaWRnZXQ6IGZ1bmN0aW9uKHcpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2xvYmFscy53aWRnZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3aWRnZXQgPSB0aGlzLmdsb2JhbHMud2lkZ2V0c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHcudHlwZSA9PSB3aWRnZXQuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB3aWRnZXQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBXaWRnZXRzTW9kYWxFZGl0b3IgPSBTaGVsbC5XaWRnZXRzLk1vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdkYXRhJyldLFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZXh0LndpZGdldC5wcm9wcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHByb3AgPSB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzW2ldO1xuXG4gICAgICAgICAgICAgICAgLy8gVE9ETyBNb3ZlIHRvIHNlcnZpY2UgbGF5ZXJcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW0gPSB0aGlzLmN1cnJlbnQucGFyYW1zW3Byb3AubmFtZV0gPSB0aGlzLmN1cnJlbnQucGFyYW1zW3Byb3AubmFtZV0gfHwge1xuICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiAnY3JlYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IChwcm9wLnR5cGUgPT0gJ211bHRpcGxlJyA/IFtdIDogbnVsbCksXG4gICAgICAgICAgICAgICAgICAgIGJpbmRpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmF0ZWd5OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogKHByb3AudHlwZSA9PSAnbXVsdGlwbGUnID8gbnVsbCA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHBhcmFtLl9hY3Rpb24gPSBwYXJhbS5fYWN0aW9uID09ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgID8gJ3VwZGF0ZSdcbiAgICAgICAgICAgICAgICAgICAgOiAnY3JlYXRlJ1xuICAgICAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICBwcm9wOiBwcm9wLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbTogcGFyYW0sXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuaXRlbXMgPSBpdGVtcztcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuY29udGV4dCxcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtcyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcblxuICAgICAgICAgICAgaGFzUHJvcHM6IGZ1bmN0aW9uKHRhYikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbnRleHQud2lkZ2V0ICYmIHRoaXMuY29udGV4dC53aWRnZXQucHJvcHMpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvcC50YWIgPT0gdGFiKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBXaWRnZXRzRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFdpZGdldHNMaXN0Vmlld2VyLCBXaWRnZXRzTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICB3aWRnZXQ6IE9iamVjdFxuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgIHByb3RvOiBmdW5jdGlvbih3aWRnZXQpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiB3aWRnZXQuaWQsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtczoge30sXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHZhciBwYXJhbXMgPSB7fTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgd2lkZ2V0LnByb3BzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb3AgPSB3aWRnZXQucHJvcHNbaV07XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gTW92ZSB0byBzZXJ2aWNlIGxheWVyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtc1twcm9wLm5hbWVdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogJ2NyZWF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogKHByb3AudHlwZSA9PSAnbXVsdGlwbGUnID8gW10gOiBudWxsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRpbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJhdGVneTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogKHByb3AudHlwZSA9PSAnbXVsdGlwbGUnID8gbnVsbCA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRhdGEucGFyYW1zID0gcGFyYW1zO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCk7XG4iLCJ2YXIgV2lkZ2V0cyA9XG4oZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBXaWRnZXRzID0ge307XG5cbiAgICBXaWRnZXRzLlBhbGV0dGUgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIG1hcCA9IHt9O1xuICAgICAgICB2YXIgYXJyID0gW107XG5cbiAgICAgICAgdmFyIGNhdGVnb3JpZXMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGFycjsgfVxuICAgICAgICB2YXIgY2F0ZWdvcnkgPSBmdW5jdGlvbihuYW1lLCBjYXRlZ29yeSkge1xuXG4gICAgICAgICAgICBpZiAobmFtZSBpbiBtYXApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWFwW25hbWVdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtYXBbbmFtZV0gPSBjYXRlZ29yeTtcbiAgICAgICAgICAgICAgICBhcnIucHVzaChjYXRlZ29yeSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHdpZGdldCA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgIHZhciBzZWdtZW50cyA9IHBhdGguc3BsaXQoJy8nKTtcbiAgICAgICAgICAgIHJldHVybiAkLmV4dGVuZCh0cnVlLCB7fSwgdGhpcy5jYXRlZ29yeShzZWdtZW50c1swXSkuZ3JvdXAoc2VnbWVudHNbMV0pLml0ZW0oc2VnbWVudHNbMl0pLndpZGdldCwge1xuICAgICAgICAgICAgICAgIF9hY3Rpb246ICdjcmVhdGUnLFxuICAgICAgICAgICAgICAgIHJlc291cmNlOiB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtczogW10sXG4gICAgICAgICAgICAgICAgICAgIF9hY3Rpb246ICdjcmVhdGUnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHBsYWNlaG9sZGVyID0gZnVuY3Rpb24oY29udGVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0YWc6ICdkZWZhdWx0LXN0dWInLFxuICAgICAgICAgICAgICAgIF9hY3Rpb246ICdpZ25vcmUnLFxuICAgICAgICAgICAgICAgIHByb3BzOiBbXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2NvbnRlbnQnLCB0eXBlOiAnc3RyaW5nJyB9XG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogeyB2YWx1ZTogY29udGVudCB9LFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZW5lcmF0ZUlkKHByZWZpeCkge1xuXG4gICAgICAgICAgICB2YXIgQUxQSEFCRVQgPSAnMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVonO1xuICAgICAgICAgICAgdmFyIElEX0xFTkdUSCA9IDg7XG5cbiAgICAgICAgICAgIHZhciBydG4gPSAnJztcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgSURfTEVOR1RIOyBpKyspIHtcbiAgICAgICAgICAgICAgICBydG4gKz0gQUxQSEFCRVQuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIEFMUEhBQkVULmxlbmd0aCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByZWZpeCA/IHByZWZpeCArIHJ0biA6IHJ0bjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBjYXRlZ29yaWVzLFxuICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5LFxuICAgICAgICAgICAgd2lkZ2V0OiB3aWRnZXQsXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogcGxhY2Vob2xkZXIsXG4gICAgICAgICAgICBnZW5lcmF0ZUlkOiBnZW5lcmF0ZUlkLFxuICAgICAgICB9O1xuICAgIH0pKCk7XG5cbiAgICBXaWRnZXRzLkNhdGVnb3J5ID0gZnVuY3Rpb24obmFtZSwgdGl0bGUpIHtcblxuICAgICAgICB2YXIgbWFwID0ge307XG4gICAgICAgIHZhciBhcnIgPSBbXTtcblxuICAgICAgICB2YXIgZ3JvdXBzID0gZnVuY3Rpb24oKSB7IHJldHVybiBhcnI7IH1cbiAgICAgICAgdmFyIGdyb3VwID0gZnVuY3Rpb24obmFtZSwgZ3JvdXApIHtcblxuICAgICAgICAgICAgaWYgKG5hbWUgaW4gbWFwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hcFtuYW1lXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWFwW25hbWVdID0gZ3JvdXA7XG4gICAgICAgICAgICAgICAgYXJyLnB1c2goZ3JvdXApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIFdpZGdldHMuUGFsZXR0ZS5jYXRlZ29yeShuYW1lLCB7XG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICAgICAgZ3JvdXBzOiBncm91cHMsXG4gICAgICAgICAgICBncm91cDogZ3JvdXAsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBXaWRnZXRzLlBhbGV0dGUuY2F0ZWdvcnkobmFtZSk7XG4gICAgfTtcblxuICAgIFdpZGdldHMuR3JvdXAgPSBmdW5jdGlvbihjYXRlZ29yeSwgbmFtZSwgdGl0bGUpIHtcblxuICAgICAgICB2YXIgbWFwID0ge307XG4gICAgICAgIHZhciBhcnIgPSBbXTtcblxuICAgICAgICB2YXIgaXRlbXMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGFycjsgfVxuICAgICAgICB2YXIgaXRlbSA9IGZ1bmN0aW9uKG5hbWUsIGl0ZW0pIHtcblxuICAgICAgICAgICAgaWYgKG5hbWUgaW4gbWFwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hcFtuYW1lXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWFwW25hbWVdID0gaXRlbTtcbiAgICAgICAgICAgICAgICBhcnIucHVzaChpdGVtKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBjYXRlZ29yeS5ncm91cChuYW1lLCB7XG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zLFxuICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNhdGVnb3J5Lmdyb3VwKG5hbWUpO1xuICAgIH07XG5cbiAgICBXaWRnZXRzLmV4dGVuZCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuXG4gICAgICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgICAgICB0YWc6IGNvbmZpZy50YWcsXG4gICAgICAgICAgICB0YWJzOiBbXSxcbiAgICAgICAgICAgIHByb3BzOiBbXSxcbiAgICAgICAgICAgIHBhcmFtczoge30sXG4gICAgICAgICAgICB3aWRnZXRzOiBjb25maWcud2lkZ2V0cyB8fCB1bmRlZmluZWQsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGNvbmZpZy5taXhpbnMpIHtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb25maWcubWl4aW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG0gPSBjb25maWcubWl4aW5zW2ldO1xuICAgICAgICAgICAgICAgIGlmICgndGFicycgaW4gbSkgcmVzdWx0LnRhYnMgPSByZXN1bHQudGFicy5jb25jYXQobS50YWJzKTtcbiAgICAgICAgICAgICAgICBpZiAoJ3Byb3BzJyBpbiBtKSByZXN1bHQucHJvcHMgPSByZXN1bHQucHJvcHMuY29uY2F0KG0ucHJvcHMpO1xuICAgICAgICAgICAgICAgIGlmICgncGFyYW1zJyBpbiBtKSByZXN1bHQucGFyYW1zID0gJC5leHRlbmQodHJ1ZSwgcmVzdWx0LnBhcmFtcywgbS5wYXJhbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCd0YWJzJyBpbiBjb25maWcpIHJlc3VsdC50YWJzID0gcmVzdWx0LnRhYnMuY29uY2F0KGNvbmZpZy50YWJzKTtcbiAgICAgICAgaWYgKCdwcm9wcycgaW4gY29uZmlnKSByZXN1bHQucHJvcHMgPSByZXN1bHQucHJvcHMuY29uY2F0KGNvbmZpZy5wcm9wcyk7XG4gICAgICAgIGlmICgncGFyYW1zJyBpbiBjb25maWcpIHJlc3VsdC5wYXJhbXMgPSAkLmV4dGVuZCh0cnVlLCByZXN1bHQucGFyYW1zLCBjb25maWcucGFyYW1zKTtcblxuICAgICAgICBmdW5jdGlvbiBpbml0UGFyYW1zKHByb3BzLCBwYXJhbXMpIHtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHByb3AgPSBwcm9wc1tpXTtcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW0gPSBwYXJhbXNbcHJvcC5uYW1lXSA9IHBhcmFtc1twcm9wLm5hbWVdIHx8IHsgdmFsdWU6IG51bGwgfTsgLy8gVE9ETyBTZXQgYSB0eXBlLWRlcGVuZGVudCBpbml0aWFsIHZhbHVlXG5cbiAgICAgICAgICAgICAgICBpZiAocHJvcC5wcm9wcykge1xuICAgICAgICAgICAgICAgICAgICBpbml0UGFyYW1zKHByb3AsIHBhcmFtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpbml0UGFyYW1zKHJlc3VsdC5wcm9wcywgcmVzdWx0LnBhcmFtcyk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgV2lkZ2V0cy5JdGVtID0gZnVuY3Rpb24oZ3JvdXAsIG5hbWUsIGNvbmZpZykge1xuXG4gICAgICAgIGdyb3VwLml0ZW0obmFtZSwge1xuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIHRodW1ibmFpbDogY29uZmlnLnRodW1ibmFpbCxcbiAgICAgICAgICAgIHdpZGdldDogY29uZmlnLndpZGdldCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGdyb3VwLml0ZW0obmFtZSk7XG4gICAgfTtcblxuICAgIFdpZGdldHMuUHJvcCA9IGZ1bmN0aW9uKG5hbWUsIHRpdGxlLCB0eXBlLCB0YWIsIHBsYWNlaG9sZGVyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgIHRhYjogdGFiLFxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IHBsYWNlaG9sZGVyLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIFdpZGdldHMuUGFyYW0gPSBmdW5jdGlvbih2YWx1ZSwgYmluZGluZywgc3RyYXRlZ3kpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSB8fCB1bmRlZmluZWQsXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBWdWUuc2VydmljZSgncGFsZXR0ZScsIFdpZGdldHMuUGFsZXR0ZSk7XG5cbiAgICByZXR1cm4gV2lkZ2V0cztcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xuXG4gICAgV2lkZ2V0cy5Gb3JtQ2F0ZWdvcnkgPSBXaWRnZXRzLkNhdGVnb3J5KCdkZWZhdWx0LWZvcm0nLCAnRm9ybSBFbGVtZW50cycpO1xuICAgIFdpZGdldHMuVGV4dENhdGVnb3J5ID0gV2lkZ2V0cy5DYXRlZ29yeSgnZGVmYXVsdC10ZXh0JywgJ1RleHQgRWxlbWVudHMnKTtcbiAgICBXaWRnZXRzLkNvbnRhaW5lckNhdGVnb3J5ID0gV2lkZ2V0cy5DYXRlZ29yeSgnZGVmYXVsdC1jb250YWluZXInLCAnQ29udGFpbmVyIEVsZW1lbnRzJyk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcblxuICAgIFdpZGdldHMuV2lkZ2V0TWl4aW4gPSB7XG4gICAgICAgIHRhYnM6IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ2RhdGEnLCB0aXRsZTogJ0RhdGEnIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdhcHBlYXJhbmNlJywgdGl0bGU6ICdBcHBlYXJhbmNlJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnY29udGVudCcsIHRpdGxlOiAnQ29udGVudCcgfSxcbiAgICAgICAgXSxcbiAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ2lkJywgdGl0bGU6ICdJRCcsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJywgcGxhY2Vob2xkZXI6ICdVbmlxdWUgSUQnIH0sXG4gICAgICAgIF0sXG4gICAgfTtcblxuICAgIFdpZGdldHMuQm94TWl4aW4gPSB7XG4gICAgICAgIHByb3BzOiBbXG4gICAgICAgICAgICB7IG5hbWU6ICdtYXJnaW4nLCB0aXRsZTogJ01hcmdpbicsIHR5cGU6ICdzdHJpbmcnLCBwbGFjZWhvbGRlcjogJzBweCAwcHgnLCB0YWI6ICdhcHBlYXJhbmNlJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAncGFkZGluZycsIHRpdGxlOiAnUGFkZGluZycsIHR5cGU6ICdzdHJpbmcnLCBwbGFjZWhvbGRlcjogJzBweCAwcHgnLCB0YWI6ICdhcHBlYXJhbmNlJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnaW5uZXJCb3JkZXInLCB0aXRsZTogJ0lubmVyIEJvcmRlcicsIHR5cGU6ICdzdHJpbmcnLCBwbGFjZWhvbGRlcjogJ3NvbGlkIDFweCAjMDAwMDAwJywgdGFiOiAnYXBwZWFyYW5jZScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ2lubmVyQmFja2dyb3VuZCcsIHRpdGxlOiAnSW5uZXIgQmFja2dyb3VuZCcsIHR5cGU6ICdzdHJpbmcnLCBwbGFjZWhvbGRlcjogJyNGRkZGRkYnLCB0YWI6ICdhcHBlYXJhbmNlJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnaW5uZXJCYWNrZ3JvdW5kU2l6ZScsIHRpdGxlOiAnSW5uZXIgQmFja2dyb3VuZCBTaXplJywgdHlwZTogJ3N0cmluZycsIHBsYWNlaG9sZGVyOiAnY292ZXInLCB0YWI6ICdhcHBlYXJhbmNlJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnb3V0ZXJCb3JkZXInLCB0aXRsZTogJ091dGVyIEJvcmRlcicsIHR5cGU6ICdzdHJpbmcnLCBwbGFjZWhvbGRlcjogJ3NvbGlkIDFweCAjMDAwMDAwJywgdGFiOiAnYXBwZWFyYW5jZScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ291dGVyQmFja2dyb3VuZCcsIHRpdGxlOiAnT3V0ZXIgQmFja2dyb3VuZCcsIHR5cGU6ICdzdHJpbmcnLCBwbGFjZWhvbGRlcjogJyNGRkZGRkYnLCB0YWI6ICdhcHBlYXJhbmNlJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnb3V0ZXJCYWNrZ3JvdW5kU2l6ZScsIHRpdGxlOiAnT3V0ZXIgQmFja2dyb3VuZCBTaXplJywgdHlwZTogJ3N0cmluZycsIHBsYWNlaG9sZGVyOiAnY292ZXInLCB0YWI6ICdhcHBlYXJhbmNlJyB9LFxuICAgICAgICBdLFxuICAgIH07XG5cbiAgICBXaWRnZXRzLlNpemVNaXhpbiA9IHtcbiAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ3dpZHRoJywgdGl0bGU6ICdXaWR0aCcsIHR5cGU6ICdzdHJpbmcnLCBwbGFjZWhvbGRlcjogJzEwMHB4JywgdGFiOiAnYXBwZWFyYW5jZScgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ2hlaWdodCcsIHRpdGxlOiAnSGVpZ2h0JywgdHlwZTogJ3N0cmluZycsIHBsYWNlaG9sZGVyOiAnMTAwcHgnLCB0YWI6ICdhcHBlYXJhbmNlJyB9LFxuICAgICAgICBdXG4gICAgfVxuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XG5cbiAgICBXaWRnZXRzLlN0YWNrR3JvdXAgPSBXaWRnZXRzLkdyb3VwKFdpZGdldHMuQ29udGFpbmVyQ2F0ZWdvcnksICdkZWZhdWx0LWNvbnRhaW5lci1zdGFjaycsICdTdGFja2VkJyk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcblxuICAgIFdpZGdldHMuQnV0dG9uc0dyb3VwID0gV2lkZ2V0cy5Hcm91cChXaWRnZXRzLkZvcm1DYXRlZ29yeSwgJ2RlZmF1bHQtZm9ybS1idXR0b25zJywgJ0J1dHRvbnMnKTtcbiAgICBXaWRnZXRzLklucHV0c0dyb3VwID0gV2lkZ2V0cy5Hcm91cChXaWRnZXRzLkZvcm1DYXRlZ29yeSwgJ2RlZmF1bHQtZm9ybS1pbnB1dHMnLCAnSW5wdXRzJyk7XG4gICAgV2lkZ2V0cy5SYWRpb3NHcm91cCA9IFdpZGdldHMuR3JvdXAoV2lkZ2V0cy5Gb3JtQ2F0ZWdvcnksICdkZWZhdWx0LWZvcm0tcmFkaW9zJywgJ1JhZGlvcycpO1xuICAgIFdpZGdldHMuQ2hlY2tzR3JvdXAgPSBXaWRnZXRzLkdyb3VwKFdpZGdldHMuRm9ybUNhdGVnb3J5LCAnZGVmYXVsdC1mb3JtLWNoZWNrcycsICdDaGVja2JveGVzJyk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcblxuICAgIFdpZGdldHMuSGVhZGluZ3NHcm91cCA9IFdpZGdldHMuR3JvdXAoV2lkZ2V0cy5UZXh0Q2F0ZWdvcnksICdkZWZhdWx0LXRleHQtaGVhZGluZ3MnLCAnSGVhZGluZ3MnKTtcbiAgICBXaWRnZXRzLkJsb2Nrc0dyb3VwID0gV2lkZ2V0cy5Hcm91cChXaWRnZXRzLlRleHRDYXRlZ29yeSwgJ2RlZmF1bHQtdGV4dC1ibG9ja3MnLCAnQmxvY2tzJyk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcblxuICAgIFdpZGdldHMuU3RhY2tXaWRnZXQgPSBmdW5jdGlvbih0YWcpIHtcblxuICAgICAgICByZXR1cm4gV2lkZ2V0cy5leHRlbmQoe1xuICAgICAgICAgICAgdGFnOiB0YWcsXG4gICAgICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiBdLFxuICAgICAgICAgICAgd2lkZ2V0czogW10sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5TdGFja0dyb3VwLCAnc3RhY2staG9yaXNvbnRhbCcsIHtcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2NvbnRhaW5lci9zdGFjay9zdGFjay1ob3Jpc29udGFsLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5TdGFja1dpZGdldCgnZGVmYXVsdC1zdGFjay1ob3Jpc29udGFsJyksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5TdGFja0dyb3VwLCAnc3RhY2stdmVydGljYWwnLCB7XG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9jb250YWluZXIvc3RhY2svc3RhY2stdmVydGljYWwucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlN0YWNrV2lkZ2V0KCdkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJyksXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIlNoZWxsID0gd2luZG93LlNoZWxsIHx8IHt9O1xuXG4oZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgdW5kZWZpbmVkKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXN0YWNrLWNhbnZhcycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zdGFjay1jYW52YXMnLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5TdGFja2VkTWl4aW4gXSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3RhY2staG9yaXNvbnRhbCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zdGFjay1ob3Jpc29udGFsJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4sIENvcmUuU3RhY2tlZE1peGluIF0sXG4gICAgfSk7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4sIENvcmUuU3RhY2tlZE1peGluIF0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWJ1dHRvbicsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1idXR0b24nLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XG5cbiAgICBXaWRnZXRzLkJ1dHRvbldpZGdldCA9IGZ1bmN0aW9uKHRpdGxlLCBzdGVyZW90eXBlKSB7XG5cbiAgICAgICAgcmV0dXJuIFdpZGdldHMuZXh0ZW5kKHtcbiAgICAgICAgICAgIHRhZzogJ2RlZmF1bHQtYnV0dG9uJyxcbiAgICAgICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluLCBXaWRnZXRzLlNpemVNaXhpbiBdLFxuICAgICAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgICAgICB7IG5hbWU6ICd0aXRsZScsIHRpdGxlOiAnVGl0bGUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnY29udGVudCcgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6ICd0eXBlJywgdGl0bGU6ICdUeXBlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiAnc3RlcmVvdHlwZScsIHRpdGxlOiAnU3RlcmVvdHlwZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgIG1hcmdpbjogICAgIFdpZGdldHMuUGFyYW0oJzE1cHggMTVweCcpLFxuICAgICAgICAgICAgICAgIHR5cGU6ICAgICAgIFdpZGdldHMuUGFyYW0oJ2J1dHRvbicpLFxuICAgICAgICAgICAgICAgIHRpdGxlOiAgICAgIFdpZGdldHMuUGFyYW0odGl0bGUpLFxuICAgICAgICAgICAgICAgIHN0ZXJlb3R5cGU6IFdpZGdldHMuUGFyYW0oc3RlcmVvdHlwZSksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQnV0dG9uc0dyb3VwLCAnYnV0dG9uLWRlZmF1bHQnLCB7XG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2J1dHRvbi9idXR0b24tZGVmYXVsdC5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuQnV0dG9uV2lkZ2V0KCdEZWZhdWx0JywgJ2RlZmF1bHQnKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJ1dHRvbnNHcm91cCwgJ2J1dHRvbi1wcmltYXJ5Jywge1xuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9idXR0b24vYnV0dG9uLXByaW1hcnkucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkJ1dHRvbldpZGdldCgnUHJpbWFyeScsICdwcmltYXJ5JyksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CdXR0b25zR3JvdXAsICdidXR0b24tc3VjY2VzcycsIHtcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vYnV0dG9uL2J1dHRvbi1zdWNjZXNzLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5CdXR0b25XaWRnZXQoJ1N1Y2Nlc3MnLCAnc3VjY2VzcycpLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQnV0dG9uc0dyb3VwLCAnYnV0dG9uLWluZm8nLCB7XG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2J1dHRvbi9idXR0b24taW5mby5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuQnV0dG9uV2lkZ2V0KCdJbmZvJywgJ2luZm8nKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkJ1dHRvbnNHcm91cCwgJ2J1dHRvbi13YXJuaW5nJywge1xuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9idXR0b24vYnV0dG9uLXdhcm5pbmcucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkJ1dHRvbldpZGdldCgnV2FybmluZycsICd3YXJuaW5nJyksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5CdXR0b25zR3JvdXAsICdidXR0b24tZGFuZ2VyJywge1xuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9idXR0b24vYnV0dG9uLWRhbmdlci5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuQnV0dG9uV2lkZ2V0KCdEYW5nZXInLCAnZGFuZ2VyJyksXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtY2hlY2snLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtY2hlY2snLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XG5cbiAgICBXaWRnZXRzLkNoZWNrV2lkZ2V0ID0gZnVuY3Rpb24oc3RlcmVvdHlwZSwgdmFsdWUsIG9wdGlvbnMpIHtcblxuICAgICAgICByZXR1cm4gV2lkZ2V0cy5leHRlbmQoe1xuICAgICAgICAgICAgdGFnOiAnZGVmYXVsdC1jaGVjaycsXG4gICAgICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcbiAgICAgICAgICAgIHByb3BzOiBbXG4gICAgICAgICAgICAgICAgeyBuYW1lOiAnbW9kZWwnLCB0aXRsZTogJ01vZGVsJywgdHlwZTogJ3ZhcicsIHRhYjogJ2RhdGEnLCB2YXJpYWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogJ3N0ZXJlb3R5cGUnLCB0aXRsZTogJ1N0ZXJlb3R5cGUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdpdGVtcycsIHR5cGU6ICdtdWx0aXBsZScsIHRpdGxlOiAnSXRlbXMnLCB0YWI6ICdkYXRhJyxcbiAgICAgICAgICAgICAgICAgICAgdGFiczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnZGF0YScsIHRpdGxlOiAnRGF0YScgfSxcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ3ZhbHVlJywgdGl0bGU6ICdWYWx1ZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnbGFiZWwnLCB0aXRsZTogJ0xhYmVsJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgIG1vZGVsOiAgICAgIFdpZGdldHMuUGFyYW0oeyB2YWx1ZTogdmFsdWUgfSksXG4gICAgICAgICAgICAgICAgbWFyZ2luOiAgICAgV2lkZ2V0cy5QYXJhbSgnMTVweCAxNXB4JyksXG4gICAgICAgICAgICAgICAgc3RlcmVvdHlwZTogV2lkZ2V0cy5QYXJhbShzdGVyZW90eXBlKSxcbiAgICAgICAgICAgICAgICBpdGVtczoge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogb3B0aW9ucy5tYXAoZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBXaWRnZXRzLlBhcmFtKG9wdGlvbi52YWx1ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFdpZGdldHMuUGFyYW0ob3B0aW9uLmxhYmVsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQ2hlY2tzR3JvdXAsICdjaGVjay1kZWZhdWx0Jywge1xuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9jaGVjay9jaGVjay1kZWZhdWx0LnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5DaGVja1dpZGdldCgnZGVmYXVsdCcsIFsgJ0EnLCAnQicgXSwgW1xuICAgICAgICAgICAgeyB2YWx1ZTogJ0EnLCBsYWJlbDogJ0EnIH0sXG4gICAgICAgICAgICB7IHZhbHVlOiAnQicsIGxhYmVsOiAnQicgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICdDJywgbGFiZWw6ICdDJyB9LFxuICAgICAgICBdKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkNoZWNrc0dyb3VwLCAnY2hlY2stcHJpbWFyeScsIHtcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vY2hlY2svY2hlY2stcHJpbWFyeS5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuQ2hlY2tXaWRnZXQoJ3ByaW1hcnknLCBbICdBJywgJ0InIF0sIFtcbiAgICAgICAgICAgIHsgdmFsdWU6ICdBJywgbGFiZWw6ICdBJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJ0InLCBsYWJlbDogJ0InIH0sXG4gICAgICAgICAgICB7IHZhbHVlOiAnQycsIGxhYmVsOiAnQycgfSxcbiAgICAgICAgXSksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5DaGVja3NHcm91cCwgJ2NoZWNrLXN1Y2Nlc3MnLCB7XG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2NoZWNrL2NoZWNrLXN1Y2Nlc3MucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkNoZWNrV2lkZ2V0KCdzdWNjZXNzJywgWyAnQScsICdCJyBdLCBbXG4gICAgICAgICAgICB7IHZhbHVlOiAnQScsIGxhYmVsOiAnQScgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICdCJywgbGFiZWw6ICdCJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJ0MnLCBsYWJlbDogJ0MnIH0sXG4gICAgICAgIF0pLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQ2hlY2tzR3JvdXAsICdjaGVjay1pbmZvJywge1xuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9jaGVjay9jaGVjay1pbmZvLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5DaGVja1dpZGdldCgnaW5mbycsIFsgJ0EnLCAnQicgXSwgW1xuICAgICAgICAgICAgeyB2YWx1ZTogJ0EnLCBsYWJlbDogJ0EnIH0sXG4gICAgICAgICAgICB7IHZhbHVlOiAnQicsIGxhYmVsOiAnQicgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICdDJywgbGFiZWw6ICdDJyB9LFxuICAgICAgICBdKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkNoZWNrc0dyb3VwLCAnY2hlY2std2FybmluZycsIHtcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vY2hlY2svY2hlY2std2FybmluZy5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuQ2hlY2tXaWRnZXQoJ3dhcm5pbmcnLCBbICdBJywgJ0InIF0sIFtcbiAgICAgICAgICAgIHsgdmFsdWU6ICdBJywgbGFiZWw6ICdBJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJ0InLCBsYWJlbDogJ0InIH0sXG4gICAgICAgICAgICB7IHZhbHVlOiAnQycsIGxhYmVsOiAnQycgfSxcbiAgICAgICAgXSksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5DaGVja3NHcm91cCwgJ2NoZWNrLWRhbmdlcicsIHtcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vY2hlY2svY2hlY2stZGFuZ2VyLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5DaGVja1dpZGdldCgnZGFuZ2VyJywgWyAnQScsICdCJyBdLCBbXG4gICAgICAgICAgICB7IHZhbHVlOiAnQScsIGxhYmVsOiAnQScgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICdCJywgbGFiZWw6ICdCJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJ0MnLCBsYWJlbDogJ0MnIH0sXG4gICAgICAgIF0pLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWlucHV0LXRleHQnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtaW5wdXQtdGV4dCcsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ21vZGVsJywgdGhpcy5iaW5kaW5ncyk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnc3RvcmFnZScsIHRoaXMuc3RvcmFnZS5vbmUpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWlucHV0LXRleHRhcmVhJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWlucHV0LXRleHRhcmVhJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtaW5wdXQtY2hlY2tib3gnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtaW5wdXQtY2hlY2tib3gnLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgIH0pO1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1pbnB1dC1yYWRpbycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1pbnB1dC1yYWRpbycsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcblxuICAgIFdpZGdldHMuSW5wdXRXaWRnZXQgPSBmdW5jdGlvbihsYWJlbCwgdHlwZSkge1xuXG4gICAgICAgIHJldHVybiBXaWRnZXRzLmV4dGVuZCh7XG4gICAgICAgICAgICB0YWc6ICdkZWZhdWx0LWlucHV0LXRleHQnLFxuICAgICAgICAgICAgbWl4aW5zOiBbIFdpZGdldHMuV2lkZ2V0TWl4aW4sIFdpZGdldHMuQm94TWl4aW4sIFdpZGdldHMuU2l6ZU1peGluIF0sXG4gICAgICAgICAgICBwcm9wczogW1xuICAgICAgICAgICAgICAgIHsgbmFtZTogJ21vZGVsJywgdGl0bGU6ICdNb2RlbCcsIHR5cGU6ICd2YXInLCB0YWI6ICdkYXRhJywgdmFyaWFibGU6IHRydWUgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6ICd0eXBlJywgdGl0bGU6ICdUeXBlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2NvbnRlbnQnIH0sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiAnbGFiZWwnLCB0aXRsZTogJ0xhYmVsJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2NvbnRlbnQnIH0sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiAncGxhY2Vob2xkZXInLCB0aXRsZTogJ1BsYWNlaG9sZGVyJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2NvbnRlbnQnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgbW9kZWw6ICAgICAgV2lkZ2V0cy5QYXJhbSh7IHZhbHVlOiAnJyB9KSxcbiAgICAgICAgICAgICAgICBtYXJnaW46ICAgICBXaWRnZXRzLlBhcmFtKCcxNXB4IDE1cHgnKSxcbiAgICAgICAgICAgICAgICB0eXBlOiAgICAgICBXaWRnZXRzLlBhcmFtKHR5cGUpLFxuICAgICAgICAgICAgICAgIGxhYmVsOiAgICAgIFdpZGdldHMuUGFyYW0obGFiZWwpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLklucHV0c0dyb3VwLCAnaW5wdXQtdGV4dCcsIHtcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vaW5wdXQvdGV4dC5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuSW5wdXRXaWRnZXQoJ0lucHV0JywgJ3RleHQnKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuVGV4dGFyZWFXaWRnZXQgPSBmdW5jdGlvbihsYWJlbCwgcGxhY2Vob2xkZXIpIHtcblxuICAgICAgICByZXR1cm4gV2lkZ2V0cy5leHRlbmQoe1xuICAgICAgICAgICAgdGFnOiAnZGVmYXVsdC1pbnB1dC10ZXh0YXJlYScsXG4gICAgICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcbiAgICAgICAgICAgIHByb3BzOiBbXG4gICAgICAgICAgICAgICAgeyBuYW1lOiAnbW9kZWwnLCB0aXRsZTogJ01vZGVsJywgdHlwZTogJ3ZhcicsIHRhYjogJ2RhdGEnLCB2YXJpYWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogJ2xhYmVsJywgdGl0bGU6ICdMYWJlbCcsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogJ3BsYWNlaG9sZGVyJywgdGl0bGU6ICdQbGFjZWhvbGRlcicsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgIG1vZGVsOiAgICAgICAgICBXaWRnZXRzLlBhcmFtKHsgdmFsdWU6ICcnIH0pLFxuICAgICAgICAgICAgICAgIG1hcmdpbjogICAgICAgICBXaWRnZXRzLlBhcmFtKCcxNXB4IDE1cHgnKSxcbiAgICAgICAgICAgICAgICBsYWJlbDogICAgICAgICAgV2lkZ2V0cy5QYXJhbShsYWJlbCksXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICAgIFdpZGdldHMuUGFyYW0ocGxhY2Vob2xkZXIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLklucHV0c0dyb3VwLCAnaW5wdXQtdGV4dGFyZWEnLCB7XG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL2lucHV0L3RleHRhcmVhLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0YXJlYVdpZGdldCgnVGV4dGFyZWEnLCAnVHlwZSBtZXNzYWdlIGhlcmUnKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuUmFkaW9JbnB1dFdpZGdldCA9IGZ1bmN0aW9uKHZhbHVlLCBvcHRpb25zKSB7XG5cbiAgICAgICAgcmV0dXJuIFdpZGdldHMuZXh0ZW5kKHtcbiAgICAgICAgICAgIHRhZzogJ2RlZmF1bHQtaW5wdXQtcmFkaW8nLFxuICAgICAgICAgICAgbWl4aW5zOiBbIFdpZGdldHMuV2lkZ2V0TWl4aW4sIFdpZGdldHMuQm94TWl4aW4sIFdpZGdldHMuU2l6ZU1peGluIF0sXG4gICAgICAgICAgICBwcm9wczogW1xuICAgICAgICAgICAgICAgIHsgbmFtZTogJ21vZGVsJywgdGl0bGU6ICdNb2RlbCcsIHR5cGU6ICd2YXInLCB0YWI6ICdkYXRhJywgdmFyaWFibGU6IHRydWUgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6ICdzdGVyZW90eXBlJywgdGl0bGU6ICdTdGVyZW90eXBlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnaXRlbXMnLCB0eXBlOiAnbXVsdGlwbGUnLCB0aXRsZTogJ0l0ZW1zJywgdGFiOiAnZGF0YScsXG4gICAgICAgICAgICAgICAgICAgIHRhYnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2RhdGEnLCB0aXRsZTogJ0RhdGEnIH0sXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHByb3BzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICd2YWx1ZScsIHRpdGxlOiAnVmFsdWUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2xhYmVsJywgdGl0bGU6ICdMYWJlbCcsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICBtb2RlbDogICAgICBXaWRnZXRzLlBhcmFtKHsgdmFsdWU6IHZhbHVlIH0pLFxuICAgICAgICAgICAgICAgIG1hcmdpbjogICAgIFdpZGdldHMuUGFyYW0oJzE1cHggMTVweCcpLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBvcHRpb25zLm1hcChmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFdpZGdldHMuUGFyYW0ob3B0aW9uLnZhbHVlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogV2lkZ2V0cy5QYXJhbShvcHRpb24ubGFiZWwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuSW5wdXRzR3JvdXAsICdpbnB1dC1yYWRpbycsIHtcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vaW5wdXQvcmFkaW8ucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlJhZGlvSW5wdXRXaWRnZXQoJzEnLCBbXG4gICAgICAgICAgICB7IHZhbHVlOiAnMScsIGxhYmVsOiAnRmlyc3QnIH0sXG4gICAgICAgICAgICB7IHZhbHVlOiAnMicsIGxhYmVsOiAnU2Vjb25kJyB9LFxuICAgICAgICBdKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuQ2hlY2tJbnB1dFdpZGdldCA9IGZ1bmN0aW9uKHZhbHVlLCBvcHRpb25zKSB7XG5cbiAgICAgICAgcmV0dXJuIFdpZGdldHMuZXh0ZW5kKHtcbiAgICAgICAgICAgIHRhZzogJ2RlZmF1bHQtaW5wdXQtY2hlY2tib3gnLFxuICAgICAgICAgICAgbWl4aW5zOiBbIFdpZGdldHMuV2lkZ2V0TWl4aW4sIFdpZGdldHMuQm94TWl4aW4sIFdpZGdldHMuU2l6ZU1peGluIF0sXG4gICAgICAgICAgICBwcm9wczogW1xuICAgICAgICAgICAgICAgIHsgbmFtZTogJ21vZGVsJywgdGl0bGU6ICdNb2RlbCcsIHR5cGU6ICd2YXInLCB0YWI6ICdkYXRhJywgdmFyaWFibGU6IHRydWUgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6ICdzdGVyZW90eXBlJywgdGl0bGU6ICdTdGVyZW90eXBlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnaXRlbXMnLCB0eXBlOiAnbXVsdGlwbGUnLCB0aXRsZTogJ0l0ZW1zJywgdGFiOiAnZGF0YScsXG4gICAgICAgICAgICAgICAgICAgIHRhYnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2RhdGEnLCB0aXRsZTogJ0RhdGEnIH0sXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHByb3BzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICd2YWx1ZScsIHRpdGxlOiAnVmFsdWUnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2xhYmVsJywgdGl0bGU6ICdMYWJlbCcsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICBtb2RlbDogICAgICBXaWRnZXRzLlBhcmFtKHsgdmFsdWU6IHZhbHVlIH0pLFxuICAgICAgICAgICAgICAgIG1hcmdpbjogICAgIFdpZGdldHMuUGFyYW0oJzE1cHggMTVweCcpLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBvcHRpb25zLm1hcChmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFdpZGdldHMuUGFyYW0ob3B0aW9uLnZhbHVlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogV2lkZ2V0cy5QYXJhbShvcHRpb24ubGFiZWwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuSW5wdXRzR3JvdXAsICdpbnB1dC1jaGVjaycsIHtcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vaW5wdXQvY2hlY2tib3gucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLkNoZWNrSW5wdXRXaWRnZXQoWyAnMScgXSwgW1xuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ0ZpcnN0JyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJzInLCBsYWJlbDogJ1NlY29uZCcgfSxcbiAgICAgICAgXSksXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFdpZGdldHMpIHtcblxuICAgIFdpZGdldHMuUmFkaW9XaWRnZXQgPSBmdW5jdGlvbihzdGVyZW90eXBlLCB2YWx1ZSwgb3B0aW9ucykge1xuXG4gICAgICAgIHJldHVybiBXaWRnZXRzLmV4dGVuZCh7XG4gICAgICAgICAgICB0YWc6ICdkZWZhdWx0LXJhZGlvJyxcbiAgICAgICAgICAgIG1peGluczogWyBXaWRnZXRzLldpZGdldE1peGluLCBXaWRnZXRzLkJveE1peGluLCBXaWRnZXRzLlNpemVNaXhpbiBdLFxuICAgICAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgICAgICB7IG5hbWU6ICdtb2RlbCcsIHRpdGxlOiAnTW9kZWwnLCB0eXBlOiAndmFyJywgdGFiOiAnZGF0YScsIHZhcmlhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiAnc3RlcmVvdHlwZScsIHRpdGxlOiAnU3RlcmVvdHlwZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2l0ZW1zJywgdHlwZTogJ211bHRpcGxlJywgdGl0bGU6ICdJdGVtcycsIHRhYjogJ2RhdGEnLFxuICAgICAgICAgICAgICAgICAgICB0YWJzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdkYXRhJywgdGl0bGU6ICdEYXRhJyB9LFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBwcm9wczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAndmFsdWUnLCB0aXRsZTogJ1ZhbHVlJywgdHlwZTogJ3N0cmluZycsIHRhYjogJ2RhdGEnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdsYWJlbCcsIHRpdGxlOiAnTGFiZWwnLCB0eXBlOiAnc3RyaW5nJywgdGFiOiAnZGF0YScgfSxcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgbW9kZWw6ICAgICAgV2lkZ2V0cy5QYXJhbSh7IHZhbHVlOiB2YWx1ZSB9KSxcbiAgICAgICAgICAgICAgICBtYXJnaW46ICAgICBXaWRnZXRzLlBhcmFtKCcxNXB4IDE1cHgnKSxcbiAgICAgICAgICAgICAgICBzdGVyZW90eXBlOiBXaWRnZXRzLlBhcmFtKHN0ZXJlb3R5cGUpLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBvcHRpb25zLm1hcChmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFdpZGdldHMuUGFyYW0ob3B0aW9uLnZhbHVlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogV2lkZ2V0cy5QYXJhbShvcHRpb24ubGFiZWwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5SYWRpb3NHcm91cCwgJ3JhZGlvLWRlZmF1bHQnLCB7XG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL3JhZGlvL3JhZGlvLWRlZmF1bHQucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlJhZGlvV2lkZ2V0KCdkZWZhdWx0JywgJzEnLCBbXG4gICAgICAgICAgICB7IHZhbHVlOiAnMScsIGxhYmVsOiAnT24nIH0sXG4gICAgICAgICAgICB7IHZhbHVlOiAnMCcsIGxhYmVsOiAnT2ZmJyB9LFxuICAgICAgICBdKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLlJhZGlvc0dyb3VwLCAncmFkaW8tcHJpbWFyeScsIHtcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vcmFkaW8vcmFkaW8tcHJpbWFyeS5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuUmFkaW9XaWRnZXQoJ3ByaW1hcnknLCAnMScsIFtcbiAgICAgICAgICAgIHsgdmFsdWU6ICcxJywgbGFiZWw6ICdPbicgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICcwJywgbGFiZWw6ICdPZmYnIH0sXG4gICAgICAgIF0pLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsICdyYWRpby1zdWNjZXNzJywge1xuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvZm9ybS9yYWRpby9yYWRpby1zdWNjZXNzLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5SYWRpb1dpZGdldCgnc3VjY2VzcycsICcxJywgW1xuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJzAnLCBsYWJlbDogJ09mZicgfSxcbiAgICAgICAgXSksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5SYWRpb3NHcm91cCwgJ3JhZGlvLWluZm8nLCB7XG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL3JhZGlvL3JhZGlvLWluZm8ucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlJhZGlvV2lkZ2V0KCdpbmZvJywgJzEnLCBbXG4gICAgICAgICAgICB7IHZhbHVlOiAnMScsIGxhYmVsOiAnT24nIH0sXG4gICAgICAgICAgICB7IHZhbHVlOiAnMCcsIGxhYmVsOiAnT2ZmJyB9LFxuICAgICAgICBdKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLlJhZGlvc0dyb3VwLCAncmFkaW8td2FybmluZycsIHtcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL2Zvcm0vcmFkaW8vcmFkaW8td2FybmluZy5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuUmFkaW9XaWRnZXQoJ3dhcm5pbmcnLCAnMScsIFtcbiAgICAgICAgICAgIHsgdmFsdWU6ICcxJywgbGFiZWw6ICdPbicgfSxcbiAgICAgICAgICAgIHsgdmFsdWU6ICcwJywgbGFiZWw6ICdPZmYnIH0sXG4gICAgICAgIF0pLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuUmFkaW9zR3JvdXAsICdyYWRpby1kYW5nZXInLCB7XG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy9mb3JtL3JhZGlvL3JhZGlvLWRhbmdlci5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuUmFkaW9XaWRnZXQoJ2RhbmdlcicsICcxJywgW1xuICAgICAgICAgICAgeyB2YWx1ZTogJzEnLCBsYWJlbDogJ09uJyB9LFxuICAgICAgICAgICAgeyB2YWx1ZTogJzAnLCBsYWJlbDogJ09mZicgfSxcbiAgICAgICAgXSksXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtcmFkaW8nLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtcmFkaW8nLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBXaWRnZXRzKSB7XG5cbiAgICBXaWRnZXRzLlRleHRXaWRnZXQgPSBmdW5jdGlvbihzdGVyZW90eXBlLCBjb250ZW50KSB7XG5cbiAgICAgICAgcmV0dXJuIFdpZGdldHMuZXh0ZW5kKHtcbiAgICAgICAgICAgIHRhZzogJ2RlZmF1bHQtdGV4dCcsXG4gICAgICAgICAgICBtaXhpbnM6IFsgV2lkZ2V0cy5XaWRnZXRNaXhpbiwgV2lkZ2V0cy5Cb3hNaXhpbiwgV2lkZ2V0cy5TaXplTWl4aW4gXSxcbiAgICAgICAgICAgIHByb3BzOiBbXG4gICAgICAgICAgICAgICAgeyBuYW1lOiAnc3RlcmVvdHlwZScsIHRpdGxlOiAnU3RlcmVvdHlwZScsIHR5cGU6ICdzdHJpbmcnLCB0YWI6ICdkYXRhJyB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogJ2NvbnRlbnQnLCB0aXRsZTogJ0NvbnRlbnQnLCB0eXBlOiAncmljaCcsIHRhYjogJ2NvbnRlbnQnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgY29udGVudDogICAgV2lkZ2V0cy5QYXJhbShjb250ZW50KSxcbiAgICAgICAgICAgICAgICBtYXJnaW46ICAgICBXaWRnZXRzLlBhcmFtKCcxNXB4IDE1cHgnKSxcbiAgICAgICAgICAgICAgICBzdGVyZW90eXBlOiBXaWRnZXRzLlBhcmFtKHN0ZXJlb3R5cGUpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuSGVhZGluZ3NHcm91cCwgJ3RleHQtaDEnLCB7XG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvdGV4dC1oMS5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuVGV4dFdpZGdldCgnZGVmYXVsdCcsIGBcbiAgICAgICAgICAgIDxoMT5IZWFkaW5nIDE8L2gxPlxuICAgICAgICBgKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkhlYWRpbmdzR3JvdXAsICd0ZXh0LWgyJywge1xuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L3RleHQtaDIucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXQoJ2RlZmF1bHQnLCBgXG4gICAgICAgICAgICA8aDI+SGVhZGluZyAyPC9oMj5cbiAgICAgICAgYCksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5IZWFkaW5nc0dyb3VwLCAndGV4dC1oMycsIHtcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL3RleHQvdGV4dC90ZXh0LWgzLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0KCdkZWZhdWx0JywgYFxuICAgICAgICAgICAgPGgzPkhlYWRpbmcgMzwvaDM+XG4gICAgICAgIGApLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuSGVhZGluZ3NHcm91cCwgJ3RleHQtaDQnLCB7XG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvdGV4dC1oNC5wbmcnLFxuICAgICAgICB3aWRnZXQ6IFdpZGdldHMuVGV4dFdpZGdldCgnZGVmYXVsdCcsIGBcbiAgICAgICAgICAgIDxoND5IZWFkaW5nIDQ8L2g0PlxuICAgICAgICBgKSxcbiAgICB9KTtcblxuICAgIFdpZGdldHMuSXRlbShXaWRnZXRzLkhlYWRpbmdzR3JvdXAsICd0ZXh0LWg1Jywge1xuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L3RleHQtaDUucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXQoJ2RlZmF1bHQnLCBgXG4gICAgICAgICAgICA8aDU+SGVhZGluZyA1PC9oNT5cbiAgICAgICAgYCksXG4gICAgfSk7XG5cbiAgICBXaWRnZXRzLkl0ZW0oV2lkZ2V0cy5IZWFkaW5nc0dyb3VwLCAndGV4dC1oNicsIHtcbiAgICAgICAgdGh1bWJuYWlsOiAnL2Fzc2V0cy92ZW5kb3IvbnRyMXgtYXJjaGVyeS13aWRnZXRzL3NyYy93aWRnZXRzL3RleHQvdGV4dC90ZXh0LWg2LnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0KCdkZWZhdWx0JywgYFxuICAgICAgICAgICAgPGg2PkhlYWRpbmcgNjwvaDY+XG4gICAgICAgIGApLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQmxvY2tzR3JvdXAsICdibG9jay1kZWZhdWx0Jywge1xuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L2Jsb2NrLWRlZmF1bHQucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXQoJ2RlZmF1bHQnLCBgXG4gICAgICAgICAgICA8aDM+TG9yZW0gaXBzdW08L2gzPlxuICAgICAgICAgICAgPHA+RXRpYW0gcG9ydGEgc2VtIG1hbGVzdWFkYSBtYWduYSBtb2xsaXMgZXVpc21vZC48L3A+XG4gICAgICAgIGApLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQmxvY2tzR3JvdXAsICdibG9jay1wcmltYXJ5Jywge1xuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L2Jsb2NrLXByaW1hcnkucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXQoJ3ByaW1hcnknLCBgXG4gICAgICAgICAgICA8aDM+TG9yZW0gaXBzdW08L2gzPlxuICAgICAgICAgICAgPHA+RXRpYW0gcG9ydGEgc2VtIG1hbGVzdWFkYSBtYWduYSBtb2xsaXMgZXVpc21vZC48L3A+XG4gICAgICAgIGApLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQmxvY2tzR3JvdXAsICdibG9jay1zdWNjZXNzJywge1xuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L2Jsb2NrLXN1Y2Nlc3MucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXQoJ3N1Y2Nlc3MnLCBgXG4gICAgICAgICAgICA8aDM+TG9yZW0gaXBzdW08L2gzPlxuICAgICAgICAgICAgPHA+RXRpYW0gcG9ydGEgc2VtIG1hbGVzdWFkYSBtYWduYSBtb2xsaXMgZXVpc21vZC48L3A+XG4gICAgICAgIGApLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQmxvY2tzR3JvdXAsICdibG9jay1pbmZvJywge1xuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L2Jsb2NrLWluZm8ucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXQoJ2luZm8nLCBgXG4gICAgICAgICAgICA8aDM+TG9yZW0gaXBzdW08L2gzPlxuICAgICAgICAgICAgPHA+RXRpYW0gcG9ydGEgc2VtIG1hbGVzdWFkYSBtYWduYSBtb2xsaXMgZXVpc21vZC48L3A+XG4gICAgICAgIGApLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQmxvY2tzR3JvdXAsICdibG9jay13YXJuaW5nJywge1xuICAgICAgICB0aHVtYm5haWw6ICcvYXNzZXRzL3ZlbmRvci9udHIxeC1hcmNoZXJ5LXdpZGdldHMvc3JjL3dpZGdldHMvdGV4dC90ZXh0L2Jsb2NrLXdhcm5pbmcucG5nJyxcbiAgICAgICAgd2lkZ2V0OiBXaWRnZXRzLlRleHRXaWRnZXQoJ3dhcm5pbmcnLCBgXG4gICAgICAgICAgICA8aDM+TG9yZW0gaXBzdW08L2gzPlxuICAgICAgICAgICAgPHA+RXRpYW0gcG9ydGEgc2VtIG1hbGVzdWFkYSBtYWduYSBtb2xsaXMgZXVpc21vZC48L3A+XG4gICAgICAgIGApLFxuICAgIH0pO1xuXG4gICAgV2lkZ2V0cy5JdGVtKFdpZGdldHMuQmxvY2tzR3JvdXAsICdibG9jay1kYW5nZXInLCB7XG4gICAgICAgIHRodW1ibmFpbDogJy9hc3NldHMvdmVuZG9yL250cjF4LWFyY2hlcnktd2lkZ2V0cy9zcmMvd2lkZ2V0cy90ZXh0L3RleHQvYmxvY2stZGFuZ2VyLnBuZycsXG4gICAgICAgIHdpZGdldDogV2lkZ2V0cy5UZXh0V2lkZ2V0KCdkYW5nZXInLCBgXG4gICAgICAgICAgICA8aDM+TG9yZW0gaXBzdW08L2gzPlxuICAgICAgICAgICAgPHA+RXRpYW0gcG9ydGEgc2VtIG1hbGVzdWFkYSBtYWduYSBtb2xsaXMgZXVpc21vZC48L3A+XG4gICAgICAgIGApLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgV2lkZ2V0cyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXRleHQnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtdGV4dCcsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtYm94Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWJveCcsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBiaW5kaW5nczogT2JqZWN0LFxuICAgICAgICAgICAgY2xhc3M6IFN0cmluZyxcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXBsYWNlaG9sZGVyJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXBsYWNlaG9sZGVyJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgV2lkZ2V0cykge1xuXG4gICAgV2lkZ2V0cy5TdHViV2lkZ2V0ID0gZnVuY3Rpb24oY29udGVudCkge1xuXG4gICAgICAgIHJldHVybiBXaWRnZXRzLmV4dGVuZCh7XG4gICAgICAgICAgICB0YWc6ICdkZWZhdWx0LXN0dWInLFxuICAgICAgICAgICAgcHJvcHM6IFtcbiAgICAgICAgICAgICAgICB7IG5hbWU6ICdjb250ZW50JywgdGl0bGU6ICdDb250ZW50JywgdHlwZTogJ3JpY2gnLCB0YWI6ICdjb250ZW50JyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICAgIFdpZGdldHMuUGFyYW0oY29udGVudCksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBXaWRnZXRzKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3R1YicsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zdHViJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIExhbmRpbmcuTGFuZGluZ1BhZ2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctcGFnZScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1wYWdlJyxcbiAgICB9KTtcblxuICAgIExhbmRpbmcuTGFuZGluZ0dhbGxlcnlQYWdlID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWdhbGxlcnktcGFnZScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1nYWxsZXJ5LXBhZ2UnLFxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5MYW5kaW5nU3RvcmFnZVBhZ2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctc3RvcmFnZS1wYWdlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXN0b3JhZ2UtcGFnZScsXG4gICAgfSk7XG5cbiAgICBMYW5kaW5nLkxhbmRpbmdTaWduaW5QYWdlID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXNpZ25pbi1wYWdlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXNpZ25pbi1wYWdlJyxcbiAgICB9KTtcblxuICAgIExhbmRpbmcuTGFuZGluZ1NpZ251cFBhZ2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctc2lnbnVwLXBhZ2UnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctc2lnbnVwLXBhZ2UnLFxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5MYW5kaW5nUHJvZmlsZVBhZ2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctcHJvZmlsZS1wYWdlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXByb2ZpbGUtcGFnZScsXG4gICAgfSk7XG5cbiAgICBMYW5kaW5nLkxhbmRpbmdNYW5hZ2VQYWdlID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLW1hbmFnZS1wYWdlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLW1hbmFnZS1wYWdlJyxcbiAgICB9KTtcblxuICAgIExhbmRpbmcuTGFuZGluZ01hbmFnZUNyZWF0ZVBhZ2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctbWFuYWdlLWNyZWF0ZS1wYWdlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLW1hbmFnZS1jcmVhdGUtcGFnZScsXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xuXG4gICAgQ29yZS5Qb3J0YWxzRmFjdG9yeSA9IGZ1bmN0aW9uKG93bmVyKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcblxuICAgICAgICAgICAgbG9hZDogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLmdldCgnL3dzL3BvcnRhbHMnLCBkYXRhKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyByZXNvbHZlKGQpOyB9LFxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyByZWplY3QoZSk7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgIGNyZWF0ZTogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLnBvc3QoJy93cy9wb3J0YWxzJywgZGF0YSkudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgcmVzb2x2ZShkKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgcmVqZWN0KGUpOyB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pLFxuXG4gICAgICAgICAgICByZW1vdmU6IChkYXRhKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5kZWxldGUoJy93cy9wb3J0YWxzJywgZGF0YSkudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgcmVzb2x2ZShkKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgcmVqZWN0KGUpOyB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pLFxuXG4gICAgICAgICAgICBnZXQ6IChkYXRhKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5nZXQoYC93cy9wb3J0YWxzLyR7ZGF0YS5pZH1gKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyByZXNvbHZlKGQpOyB9LFxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyByZWplY3QoZSk7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSksXG4gICAgICAgIH07XG4gICAgfVxuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIENvcmUuU2VjdXJpdHlGYWN0b3J5ID0gZnVuY3Rpb24ob3duZXIpIHtcblxuICAgICAgICByZXR1cm4ge1xuXG4gICAgICAgICAgICBzaWdudXA6IChkYXRhKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5wb3N0KCcvd3Mvc2lnbnVwJywgZGF0YSkudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgb3duZXIucHJpbmNpcGFsID0gZC5kYXRhLnByaW5jaXBhbDsgcmVzb2x2ZShkKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgb3duZXIucHJpbmNpcGFsID0gbnVsbDsgcmVqZWN0KGUpOyB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pLFxuXG4gICAgICAgICAgICBzaWduaW46IChkYXRhKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5wb3N0KCcvd3Mvc2lnbmluJywgZGF0YSkudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgb3duZXIucHJpbmNpcGFsID0gZC5kYXRhLnByaW5jaXBhbDsgcmVzb2x2ZShkKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgb3duZXIucHJpbmNpcGFsID0gbnVsbDsgcmVqZWN0KGUpOyB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pLFxuXG4gICAgICAgICAgICBzaWdub3V0OiAoKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5wb3N0KCcvd3Mvc2lnbm91dCcpLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IG93bmVyLnByaW5jaXBhbCA9IG51bGw7IHJlc29sdmUoZCk7IH0sXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IHJlamVjdChlKTsgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgfTtcbiAgICB9XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xuXG4gICAgdmFyIHZhbGlkYXRpb24gPSB7XG4gICAgICAgIGVtYWlsOiBcIi9eKFthLXpBLVowLTlfXFxcXC5cXFxcLV0rKUAoW2EtekEtWjAtOV9cXFxcLlxcXFwtXSspXFxcXC4oW2EtekEtWjAtOV17Mix9KSQvZ1wiLFxuICAgIH07XG5cbiAgICBMYW5kaW5nLlNpZ25pbiA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1hY2NvdW50LXNpZ25pbicsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1hY2NvdW50LXNpZ25pbicsXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBmb3JtOiB0aGlzLmZvcm0sXG4gICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogdmFsaWRhdGlvbixcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2Zvcm0nLCB7XG4gICAgICAgICAgICAgICAgZW1haWw6IG51bGwsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgc2lnbmluOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdzZWN1cml0eScpLnNpZ25pbih7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsOiB0aGlzLmZvcm0uZW1haWwsXG4gICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkOiB0aGlzLmZvcm0ucGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgfSkudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgdGhpcy4kcm91dGVyLmdvKCcvJyk7IH0sXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5TaWdudXAgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctYWNjb3VudC1zaWdudXAnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctYWNjb3VudC1zaWdudXAnLFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZm9ybTogdGhpcy5mb3JtLFxuICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IHZhbGlkYXRpb24sXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy4kc2V0KCdmb3JtJywge1xuICAgICAgICAgICAgICAgIGVtYWlsOiBudWxsLFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBudWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHNpZ251cDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICBWdWUuc2VydmljZSgnc2VjdXJpdHknKS5zaWdudXAoe1xuICAgICAgICAgICAgICAgICAgICBlbWFpbDogdGhpcy5mb3JtLmVtYWlsLFxuICAgICAgICAgICAgICAgICAgICBwYXNzd29yZDogdGhpcy5mb3JtLnBhc3N3b3JkLFxuICAgICAgICAgICAgICAgIH0pLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHRoaXMuJHJvdXRlci5nbygnLycpOyB9LFxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIExhbmRpbmcuUHJvZmlsZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1hY2NvdW50LXByb2ZpbGUnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctYWNjb3VudC1wcm9maWxlJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIiIsIiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICBMYW5kaW5nLkZlZWRiYWNrID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWZlZWRiYWNrJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLWZlZWRiYWNrJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICBMYW5kaW5nLkZvb3RlciA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1mb290ZXInLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctZm9vdGVyJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICBMYW5kaW5nLkdhbGxlcnkgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctZ2FsbGVyeScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1nYWxsZXJ5JyxcbiAgICB9KTtcblxuICAgIExhbmRpbmcuR2FsbGVyeUZ1bGwgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctZ2FsbGVyeS1mdWxsJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLWdhbGxlcnktZnVsbCcsXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xuXG4gICAgTGFuZGluZy5IZWFkZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctaGVhZGVyJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLWhlYWRlcicsXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHNpZ25vdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdzZWN1cml0eScpLnNpZ25vdXQoKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyB0aGlzLiRyb3V0ZXIuZ28oJy8nKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZyk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgTGFuZGluZykge1xuXG4gICAgTGFuZGluZy5NYW5hZ2UgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctbWFuYWdlJywge1xuXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctbWFuYWdlJyxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSArICh3aW5kb3cubG9jYXRpb24ucG9ydCA/ICc6JyArIHdpbmRvdy5sb2NhdGlvbi5wb3J0OiAnJyksXG4gICAgICAgICAgICAgICAgcG9ydGFsczogdGhpcy5wb3J0YWxzLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuXG4gICAgICAgICAgICByZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBWdWUuc2VydmljZSgncG9ydGFscycpLmxvYWQoKS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyB0aGlzLiRzZXQoJ3BvcnRhbHMnLCBkLmRhdGEucG9ydGFscyk7IH0sXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IHRoaXMuJHNldCgncG9ydGFscycsIFtdKTsgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3BvcnRhbHMnKS5yZW1vdmUoe1xuICAgICAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgdGhpcy5yZWZyZXNoKCk7IH0sXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5NYW5hZ2VDcmVhdGUgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctbWFuYWdlLWNyZWF0ZScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1tYW5hZ2UtY3JlYXRlJyxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZvcm06IHRoaXMuZm9ybSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2Zvcm0nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuXG4gICAgICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdwb3J0YWxzJykuY3JlYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMuZm9ybS50aXRsZSxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyB0aGlzLiRyb3V0ZXIuZ28oJy9tYW5hZ2UnKX0sXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIExhbmRpbmcuU3RvcmFnZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1wcmljaW5nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXByaWNpbmcnLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIExhbmRpbmcpIHtcblxuICAgIExhbmRpbmcuU3RvcmFnZSA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1zdG9yYWdlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXN0b3JhZ2UnLFxuICAgIH0pO1xuXG4gICAgTGFuZGluZy5TdG9yYWdlRnVsbCA9XG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1zdG9yYWdlLWZ1bGwnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctc3RvcmFnZS1mdWxsJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICBMYW5kaW5nLlN1cGVyID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXN1cGVyJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXN1cGVyJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICBMYW5kaW5nLlVzZWNhc2VzID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXVzZWNhc2VzJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXVzZWNhc2VzJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKSB7XG5cbiAgICBMYW5kaW5nLlZpZGVvID1cbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXZpZGVvJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXZpZGVvJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsLCBMYW5kaW5nKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
