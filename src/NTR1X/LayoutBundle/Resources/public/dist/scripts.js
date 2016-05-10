(function(Vue, $, Core) {

    var ModalEditor =
    Vue.component('bindings-dialog', {

        template: '#bindings-dialog',
        mixins: [Core.ModalEditorMixin],
    });

    var Editor =
    Vue.component('bindings', {
        mixins: [Core.ActionMixin(ModalEditor)],
    });

})(Vue, jQuery, Core, undefined);

Vue.component('v-form', {

	props: {
		action: String,
		method: String,
		init: Object,
		done: Function,
		fail: Function,
		model: Object,
	},

	// replace: false,

	// template: `
	// 	<form>
	// 		<slot></slot>
	// 	</form>
	// `,

	activate: function(done) {

		this.original = JSON.parse(JSON.stringify(this.model));

		$(this.$el)

			.on('submit', (e) => {
				e.preventDefault();
				this.submit();
			})
			.on('reset', (e) => {
				e.preventDefault();
				this.reset();
			})

		done();
	},

	data: function() {

		return {
			model: this.model
		};
	},

	methods: {

		submit: function() {

			// e.preventDefault();

			// console.log(this.model);

			$.ajax({
				url: this.action,
				method: this.method,
				contentType: "application/json",
				data: JSON.stringify(this.model)
			})
			.done((d) => {
				if (done in this) this.done(d);
			})
			.fail(function(e) { if (fail in this) this.fail(e); }.bind(this))
		},

		reset: function() {
			Object.assign(this.model, this.original);
		}
	},
});
(function($, Vue, undefined) {

	// var model = {
	// 	list: []
	// };
	//
	// var body = Vue.extend({
	// 	created: function()  { this.$dispatch('register-body', this) },
	// });

	Vue.component('grid-table', {

		replace: false,

		props: {
			d: Array
		},

		// data: function() {
		// 	return {
		// 		items: this.d.slice(0)
		// 	}
		// },

		methods: {

			add: function() {
				console.log('asdasd');
				this.items.push({});
				console.log(this.items);
			},

			remove: function(index) {
				this.items.splice(index, 1);
			}
		},
	});

})(jQuery, Vue);

Vue.component('inline-text',
	Vue.extend({
		props: [ 'name', 'value' ],
		template: `
			<div class="inline-container">
				<input class="inline-control" type="text" name="{{ name }}" v-model="value" />
			</div>
		`
	})
);

Vue.component('inline-checkbox',
	Vue.extend({
		props: [ 'name', 'value' ],
		template: `
			<div class="inline-container">
				<input class="inline-checkbox" type="checkbox" name="{{ name }}" v-model="value" />
			</div>
		`
	})
);

Vue.component('inline-select',
	Vue.extend({
		props: [ 'name', 'value', 'options' ],
		template: `
			<div class="inline-container">
				<select class="inline-control1" name="{{ name }}" v-model="value">
					<option v-for="option in options" value="{{ option.key }}">{{ option.value }}</option>
				</select>
			</div>
		`
	})
);

Vue.component('inline-value',
	Vue.extend({
		props: [ 'name', 'value', 'class' ],
		template: `
			<input type="hidden" name="{{ name }}" v-model="value" />
			<span :class="class">{{ value }}</span>
		`
	})
);

Vue.component('modal', {

    props: {
        id: String,
        current: Object,
        original: Object,
    },

    methods: {

        submit: function(e) {
            this.$dispatch('submit', this.current);
            // Object.assign(this.original, JSON.parse(JSON.stringify(this.current)));
            $(e.target).closest('.modal').modal('hide');
        },

        reset: function(e) {
            this.$dispatch('reset', this.current);
            // Object.assign(this.current, JSON.parse(JSON.stringify(this.original)));
            $(e.target).closest('.modal').modal('hide');
        }
    }
});

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

(function(Vue, $, Core) {

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

})(Vue, jQuery, Core, undefined);

(function($) {

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

    });

})(jQuery);

(function(Vue, $, Core) {

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

})(Vue, jQuery, Core, undefined);

(function(Vue, $, Core) {

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

})(Vue, jQuery, Core, undefined);

(function(Vue, $, Core) {

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

})(Vue, jQuery, Core, undefined);

Shell = window.Shell || {};
Shell.Services = window.Shell.Services || {};

(function($, Vue, Shell, undefined) {

    Vue.component('service-layout', {
        props: {
            globals: Object,
            settings: Object,
        },
        ready: function() {

            var self = this;

            Shell.Services.Layout =
            new Vue({
                methods: {
                    getWidget: function(id) {

                        for (var i = 0; i < self.settings.widgets.length; i++) {
                            var w = self.settings.widgets[i];
                            if (w.id == id) {
                                return w;
                            }
                        }

                        return null;
                    }
                }
            });
        },
        destroyed: function() {
            Shell.Services.Layout = null;
        }
    });

})(jQuery, Vue, Shell);

(function(Vue, $) {

    Vue.component('shell', {
        template: '#shell',
        props: {
            selection: Object,
            settings: Object,
            model: Object,
        },
        data: function() {
            return {
                globals: {
                    selection: this.selection,
                    settings: this.settings,
                    model: this.model,
                    data: this.data,
                },
            };
        },
        ready: function() {

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

            this.$watch('settings.categories', (categories) => {

                var category = null;
                if (categories.length > 0) {
                    var sub = categories[0];
                    if (categories.length > 0) {
                        category = sub.categories[0];
                    }
                }
                this.selection.category = category;
            }, {
                immediate: true,
            });

            this.$watch('model.domains', (domains) => {
                this.selection.domain = relevant(this.selection.domain, domains);
            }, {
                immediate: true,
            });

            this.$watch('model.pages', (pages) => {
                this.selection.page = relevant(this.selection.page, pages);
            }, {
                immediate: true,
            });

            this.$watch('selection.page.sources', (sources) => {
                this.selection.source = relevant(this.selection.source, sources);
                // console.log(sources, this.selection.source);
            }, {
                immediate: true,
            });

            this.$watch('selection.page.sources', (sources) => {

                this.data = {};

                if (sources) {
                    for (var i = 0; i < sources.length; i++) {

                        var s = sources[i];

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

                        $.ajax({
                            method: s.method,
                            url: s.url,
                            dataType: "json",
                            data: query,

                        })
                        .done((d) => {
                            this.data[s.name] = d;
                        });
                    }
                }

            }, {
                immediate: true,
                deep: true,
            });

        },
        methods: {

            getWidget: function(id) {

                for (var i = 0; i < this.settings.widgets.length; i++) {
                    var w = this.settings.widgets[i];
                    if (w.id == id) {
                        return w;
                    }
                }

                return null;
            },

            selectPage: function(page) {

                this.selection.page = page;
                this.selection.source = null;

                var data = {};

                // TODO Сделать запросы

                if (page && page.sources) {
                    for (var i = 0; i < page.sources.length; i++) {
                        var s = page.sources[i];
                        data[s.name] = [
                            { one: 11, two: 12 },
                            { one: 21, two: 22 },
                            { one: 31, two: 32 },
                            { one: 41, two: 42 },
                        ];
                    }
                }

                this.globals.data = data;
            },

            selectSource: function(source) {

            },
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
            tree: function(data) {
                console.log(this);
            },
            selectCategory: function(data) {
                this.selection.category = data.item;
            },
            selectDomain: function(data) {
                this.selection.domain = data.item;
            },
            selectPage: function(data) {
                this.selection.page = data.item;
            },
            selectSource: function(data) {
                this.selection.source = data.item;
            },
        }
    });

})(Vue, jQuery, undefined);

(function(Vue, $, Core) {

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

})(Vue, jQuery, Core, undefined);

(function(Vue, $, Core) {

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

})(Vue, jQuery, Core, undefined);

Shell = window.Shell || {};
Shell.Widgets = window.Shell.Widgets || {};

(function(Vue, $, Core, Shell, undefined) {

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
        ready: function() {

            var items = [];

            for (var i = 0; i < this.context.widget.props.length; i++) {

                var prop = this.context.widget.props[i];
                var param = this.current.params[prop.name] = this.current.params[prop.name] || {
                    value: null,
                    binding: null
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
                    params[prop.name] = prop.type != 'multiple'
                        ? {
                            _action: 'create',
                            value: null,
                            binding: null,
                        }
                        : {
                            value: [],
                            binding: null,
                        }
                    ;
                }

                data.params = params;

                return data;
            },
        }
    });

})(Vue, jQuery, Core, Shell, undefined);

(function($,Vue, undefined) {

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

})(jQuery, Vue);

(function($,Vue, undefined) {

    Vue.component('shell-brand', {
        template: '#shell-brand',
    });

})(jQuery, Vue);

(function($,Vue, undefined) {

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

})(jQuery, Vue);

(function($,Vue, undefined) {

    Vue.component('shell-container', {
        template: '#shell-container',
        props: {
            globals: Object,
            settings: Object,
            page: Object,
            category: Object,
        },
        data: function() {
            // console.log(this.globals, this.settings, this.page, this.category);
            // return {
            //     page: this.globals.selection.page
            // }
        },
        // ready: function() {
        //     console.log(this.globals, this.settings, this.page);
        // }
    });

})(jQuery, Vue);

Shell = window.Shell || {};

(function($, Vue, Core, Shell, undefined) {

    function stub(title, subtitle) {
        return {
            type: 'NTR1XDefaultBundle/Stub',
            _action: 'ignore',
            params: {
                title: { value: title },
                subtitle: { value: subtitle }
            }
        }
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

        ready: function() {

            var self = this;

            function recur(params) {

                var value = {};
                for(var key in params) {
                    if (params[key]['binding']) {
                        value[key] = self.$interpolate(params[key]['binding']);
                    } else if ($.isArray(params[key]['value'])) {
                        value[key] = [];
                        for(var i = 0; i < params[key]['value'].length; i++) {
                            value[key][i] = recur(params[key]['value'][i]);
                        }
                    } else {
                        value[key] = params[key]['value'];
                    }
                }

                return value;
            }

            this.$watch('model', (params) => {
                this.bindings = recur(this.model.params);
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

        ready: function() {

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

                if (children.length < 2) {
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

                console.log(item, this.items);

                if (item._action == 'create') {
                    this.items.$remove(item);
                } else {
                    item._action = 'remove';
                }

                this.items = $.extend(true, [], this.items);
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

            ready: function() {

                var self = this;
                this.$watch('selected', function(selected) {

                    if (selected) {

                        self.sortable =
                        Sortable.create($(selector, self.$el).get(0), {
                            group: {
                                name: 'widgets',
                            },
                            animation: 150,

                            onAdd: function (evt) {

                                var palette = $(evt.item).closest('.ge.ge-palette');

                                if (!palette.length) {
                                    $(evt.item).remove();

                                    console.log(self);
                                    var i = find(self.items, evt.newIndex);

                                    var widget = self.$root.$refs.shell.getWidget($(evt.item).data('widget'));

                                    self.items.splice(i.index, 0, {
                                        type: widget.id,
                                        resource: {
                                            params: [],
                                            _action: 'create'
                                        },
                                        params: widget.params
                                            ? JSON.parse(JSON.stringify(widget.params))
                                            : {}
                                        ,
                                        widgets: [],
                                        _action: 'create',
                                    });

                                    self.items = $.extend(true, [], self.items);
                                }
                            },

                            onEnd: function (evt) {

                                if  (evt.newIndex != evt.oldIndex) {

                                    evt.preventDefault();

                                    var oi = find(self.items, evt.oldIndex);
                                    var ni = find(self.items, evt.newIndex);

                                    console.log('end', oi, ni);
                                    console.log(self.items);

                                    self.items.splice(ni, 0, self.items.splice(oi, 1)[0]);
                                }

                                self.items = $.extend(true, [], self.items);

                                console.log(self.items);
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
            model: Object,
            widget: Object,
            editable: Boolean,
            items: Array,
        },
    });

    Vue.component('shell-decorator-horisontal', {
        template: '#shell-decorator-horisontal',
        mixins: [ DecoratorMixin, CompositeMixin, SortableMixin('.wg.wg-row'), BindingsMixin ],
        props: {
            globals: Object,
            settings: Object,
            stack: Object,
            page: Object,
            data: Object,
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
        mixins: [ DecoratorMixin, CompositeMixin, SortableMixin('.wg.wg-table'), BindingsMixin ],
        props: {
            globals: Object,
            settings: Object,
            stack: Object,
            page: Object,
            data: Object,
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
        mixins: [ CompositeMixin, SortableMixin('.wg.wg-table') ],
        props: {
            globals: Object,
            settings: Object,
            stack: Object,
            page: Object,
            data: Object,
            editable: Boolean,
            items: Array,
        },
        methods: {
            stub: function() { return stub('Vertical Stack', 'Drop Here'); }
        },
    });

})(jQuery, Vue, Core, Shell);

(function($,Vue, undefined) {

    Vue.component('shell-domains', {
        template: '#shell-domains',
        props: {
            domains: Array,
            globals: Object,
        },
    });

})(jQuery, Vue);



(function($, Vue, Core, undefined) {

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
            };
        },
        ready: function() {
            this.decorator = 'shell-decorator-canvas';
        },
    });

})(jQuery, Vue, Core);

(function($,Vue, undefined) {

    Vue.component('shell-pages', {
        template: '#shell-pages',
        props: {
            pages: Array,
            globals: Object,
        },
    });

})(jQuery, Vue);

(function($,Vue, undefined) {

    var PaletteItem =
    Vue.component('shell-palette-item', {
        template: '#shell-palette-item',
        props: {
            widget: Object,
            globals: Object,
        },
        computed: {
            thumbnail: function() {
                return '/bundles/' + this.widget.provider.alias + '/' + this.widget.thumbnail.path;
            }
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
                // onStart: function(evt) {
                //     console.log(evt);
                //     $(evt.item).html('<b>Data</b>');
                // }
                // setData: function (dataTransfer, dragEl) {
                //     console.log(dragEl);
                //     $(dragEl).html('<b>Hello</b>');
                //     // dataTransfer.setData('Text', dragEl.textContent);
                // },
                // setData: function(dataTransfer, dragEl) {
                //     dataTransfer.setData('Text', dragEl.textContent);
                // }
            });
            // $(this.$el).draggable({
            //     connectToSortable: ".ge.ge-stacked",
            //     helper: "clone",
            //     revert: "invalid"
            // });
        }
    });

    Vue.component('shell-palette', {
        template: '#shell-palette',
        props: {
            category: Object
        },
        components: {
            'palette-item': PaletteItem
        }
    });

})(jQuery, Vue);

(function($,Vue, undefined) {

    Vue.component('shell-sources', {
        template: '#shell-sources',
        props: {
            sources: Array,
            globals: Object,
        },
    });

})(jQuery, Vue);

// (function($, Vue, Core, undefined) {
//
//     Vue.component('shell-stacked', {
//         template: '#shell-stacked',
//         mixins: [ Core.Stacked ]
//     });
//
// })(jQuery, Vue, Core, Shell);

(function($,Vue, undefined) {

    Vue.component('shell-stub', {
        template: '#shell-stub',
        props: {
        },
    });

})(jQuery, Vue);

(function($,Vue, undefined) {

    Vue.component('shell-target', {
        template: '#shell-target',
        props: {
        },
    });

})(jQuery, Vue);

Shell = window.Shell || {};
Shell.Widgets = window.Shell.Widgets || {};

(function($, Vue, Shell, undefined) {

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
                fallback: 'shell-decorator-widget'
            };
        },
        ready: function() {
            this.widget = this.$root.$refs.shell.getWidget(this.model.type);
            this.decorator = this.decorators.alternatives[this.widget.tag] || this.decorators.fallback;
        },
        data: function() {

            return {
                widget: this.widget,
                decorator: this.decorator,
                // items: this.widgets,
            };
        },
    });

})(jQuery, Vue, Shell);

(function(Vue, $, Core) {

    var ParamString =
    Vue.component('pages-widgets-params-string', {
        template: '#pages-widgets-params-string',
        props: {
            id: String,
            item: Object,
            globals: Object,
        }
    });

    var ParamRich =
    Vue.component('pages-widgets-params-rich', {
        template: '#pages-widgets-params-rich',
        props: {
            id: String,
            item: Object,
            globals: Object,
        }
    });

    var ParamSource =
    Vue.component('pages-widgets-params-source', {
        template: '#pages-widgets-params-source',
        props: {
            id: String,
            item: Object,
            globals: Object,
        }
    });

    var ParamMultiple =
    Vue.component('pages-widgets-params-multiple', {
        template: '#pages-widgets-params-multiple',
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
        // ready: function() {
        //     this.items = [];
        // }
    });

    var Params =
    Vue.component('pages-widgets-params', {
        template: '#pages-widgets-params',
        props: {
            owner: Object,
            tab: String,
            items: Array,
            globals: Object
        }
    });


    var ParamMultipleListViewer =
    Vue.component('pages-widgets-params-multiple-list', {
        template: '#pages-widgets-params-multiple-list',
        mixins: [Core.ListViewerMixin],
        props: {
            prop: Object,
            param: Object,
        },
    });

    var ParamMultipleModalEditor =
    Vue.component('pages-widgets-params-multiple-dialog', {
        template: '#pages-widgets-params-multiple-dialog',
        mixins: [Core.ModalEditorMixin, Core.TabsMixin('data')],
        data: function() {
            return {
                items: this.items,
            };
        },
        ready: function() {

            var items = [];

            console.log(this.context);

            for (var i = 0; i < this.context.prop.props.length; i++) {

                var prop = this.context.prop.props[i];
                var param = this.current[prop.name] = this.current[prop.name] || {};

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
    });

    var ParamMultipleEditor =
    Vue.component('pages-widgets-params-multiple-editor', {
        mixins: [Core.EditorMixin(ParamMultipleListViewer, ParamMultipleModalEditor)],
        template: '#pages-widgets-params-multiple-editor',
        props: {
            prop: Object,
            param: Object,
            items: Array,
        },
        ready: function() {
            // console.log(this);
        }
    });


    var ParamsList =
    Vue.component('pages-widgets-params-list', {
        template: '#pages-widgets-params-list',
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

})(Vue, jQuery, Core, undefined);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJpbmRpbmdzL2JpbmRpbmdzLmpzIiwiY29tcG9uZW50cy9mb3JtLmpzIiwiY29tcG9uZW50cy9ncmlkLmpzIiwiY29tcG9uZW50cy9pbmxpbmUuanMiLCJjb21wb25lbnRzL21vZGFsLmpzIiwiZGlyZWN0aXZlcy9jb21iby5qcyIsImRpcmVjdGl2ZXMvZGF0ZS5qcyIsImRpcmVjdGl2ZXMvdGFncy5qcyIsImZpbHRlcnMvaW5kZXguanMiLCJkb21haW5zL2RvbWFpbnMuanMiLCJob29rcy9tb2RhbC5qcyIsInBhZ2VzL3BhZ2VzLmpzIiwic2NoZW1lcy9zY2hlbWVzLmpzIiwic2V0dGluZ3Mvc2V0dGluZ3MuanMiLCJzZXJ2aWNlcy9sYXlvdXQuanMiLCJzaGVsbC9zaGVsbC5qcyIsIndpZGdldHMvd2lkZ2V0cy5qcyIsInBhZ2VzL3NvdXJjZXMvc291cmNlcy5qcyIsInBhZ2VzL3dpZGdldHMvd2lkZ2V0cy5qcyIsInNoZWxsL2FjdGlvbnMvYWN0aW9ucy5qcyIsInNoZWxsL2JyYW5kL2JyYW5kLmpzIiwic2hlbGwvY2F0ZWdvcmllcy9jYXRlZ29yaWVzLmpzIiwic2hlbGwvY29udGFpbmVyL2NvbnRhaW5lci5qcyIsInNoZWxsL2RlY29yYXRvci9kZWNvcmF0b3IuanMiLCJzaGVsbC9kb21haW5zL2RvbWFpbnMuanMiLCJzaGVsbC9wYWdlL3BhZ2UuanMiLCJzaGVsbC9wYWdlcy9wYWdlcy5qcyIsInNoZWxsL3BhbGV0dGUvcGFsZXR0ZS5qcyIsInNoZWxsL3NvdXJjZXMvc291cmNlcy5qcyIsInNoZWxsL3N0YWNrZWQvc3RhY2tlZC5qcyIsInNoZWxsL3N0dWIvc3R1Yi5qcyIsInNoZWxsL3RhcmdldC90YXJnZXQuanMiLCJzaGVsbC93aWRnZXQvd2lkZ2V0LmpzIiwicGFnZXMvd2lkZ2V0cy9wYXJhbXMvcGFyYW1zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSkge1xuXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdiaW5kaW5ncy1kaWFsb2cnLCB7XG5cbiAgICAgICAgdGVtcGxhdGU6ICcjYmluZGluZ3MtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2JpbmRpbmdzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkFjdGlvbk1peGluKE1vZGFsRWRpdG9yKV0sXG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xuIiwiVnVlLmNvbXBvbmVudCgndi1mb3JtJywge1xuXG5cdHByb3BzOiB7XG5cdFx0YWN0aW9uOiBTdHJpbmcsXG5cdFx0bWV0aG9kOiBTdHJpbmcsXG5cdFx0aW5pdDogT2JqZWN0LFxuXHRcdGRvbmU6IEZ1bmN0aW9uLFxuXHRcdGZhaWw6IEZ1bmN0aW9uLFxuXHRcdG1vZGVsOiBPYmplY3QsXG5cdH0sXG5cblx0Ly8gcmVwbGFjZTogZmFsc2UsXG5cblx0Ly8gdGVtcGxhdGU6IGBcblx0Ly8gXHQ8Zm9ybT5cblx0Ly8gXHRcdDxzbG90Pjwvc2xvdD5cblx0Ly8gXHQ8L2Zvcm0+XG5cdC8vIGAsXG5cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKGRvbmUpIHtcblxuXHRcdHRoaXMub3JpZ2luYWwgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpKTtcblxuXHRcdCQodGhpcy4kZWwpXG5cblx0XHRcdC5vbignc3VibWl0JywgKGUpID0+IHtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHR0aGlzLnN1Ym1pdCgpO1xuXHRcdFx0fSlcblx0XHRcdC5vbigncmVzZXQnLCAoZSkgPT4ge1xuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdHRoaXMucmVzZXQoKTtcblx0XHRcdH0pXG5cblx0XHRkb25lKCk7XG5cdH0sXG5cblx0ZGF0YTogZnVuY3Rpb24oKSB7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0bW9kZWw6IHRoaXMubW9kZWxcblx0XHR9O1xuXHR9LFxuXG5cdG1ldGhvZHM6IHtcblxuXHRcdHN1Ym1pdDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdC8vIGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0Ly8gY29uc29sZS5sb2codGhpcy5tb2RlbCk7XG5cblx0XHRcdCQuYWpheCh7XG5cdFx0XHRcdHVybDogdGhpcy5hY3Rpb24sXG5cdFx0XHRcdG1ldGhvZDogdGhpcy5tZXRob2QsXG5cdFx0XHRcdGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcblx0XHRcdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbClcblx0XHRcdH0pXG5cdFx0XHQuZG9uZSgoZCkgPT4ge1xuXHRcdFx0XHRpZiAoZG9uZSBpbiB0aGlzKSB0aGlzLmRvbmUoZCk7XG5cdFx0XHR9KVxuXHRcdFx0LmZhaWwoZnVuY3Rpb24oZSkgeyBpZiAoZmFpbCBpbiB0aGlzKSB0aGlzLmZhaWwoZSk7IH0uYmluZCh0aGlzKSlcblx0XHR9LFxuXG5cdFx0cmVzZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCB0aGlzLm9yaWdpbmFsKTtcblx0XHR9XG5cdH0sXG59KTsiLCIoZnVuY3Rpb24oJCwgVnVlLCB1bmRlZmluZWQpIHtcblxuXHQvLyB2YXIgbW9kZWwgPSB7XG5cdC8vIFx0bGlzdDogW11cblx0Ly8gfTtcblx0Ly9cblx0Ly8gdmFyIGJvZHkgPSBWdWUuZXh0ZW5kKHtcblx0Ly8gXHRjcmVhdGVkOiBmdW5jdGlvbigpICB7IHRoaXMuJGRpc3BhdGNoKCdyZWdpc3Rlci1ib2R5JywgdGhpcykgfSxcblx0Ly8gfSk7XG5cblx0VnVlLmNvbXBvbmVudCgnZ3JpZC10YWJsZScsIHtcblxuXHRcdHJlcGxhY2U6IGZhbHNlLFxuXG5cdFx0cHJvcHM6IHtcblx0XHRcdGQ6IEFycmF5XG5cdFx0fSxcblxuXHRcdC8vIGRhdGE6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIFx0cmV0dXJuIHtcblx0XHQvLyBcdFx0aXRlbXM6IHRoaXMuZC5zbGljZSgwKVxuXHRcdC8vIFx0fVxuXHRcdC8vIH0sXG5cblx0XHRtZXRob2RzOiB7XG5cblx0XHRcdGFkZDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdhc2Rhc2QnKTtcblx0XHRcdFx0dGhpcy5pdGVtcy5wdXNoKHt9KTtcblx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5pdGVtcyk7XG5cdFx0XHR9LFxuXG5cdFx0XHRyZW1vdmU6IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0XHRcdHRoaXMuaXRlbXMuc3BsaWNlKGluZGV4LCAxKTtcblx0XHRcdH1cblx0XHR9LFxuXHR9KTtcblxufSkoalF1ZXJ5LCBWdWUpO1xuIiwiVnVlLmNvbXBvbmVudCgnaW5saW5lLXRleHQnLFxuXHRWdWUuZXh0ZW5kKHtcblx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScgXSxcblx0XHR0ZW1wbGF0ZTogYFxuXHRcdFx0PGRpdiBjbGFzcz1cImlubGluZS1jb250YWluZXJcIj5cblx0XHRcdFx0PGlucHV0IGNsYXNzPVwiaW5saW5lLWNvbnRyb2xcIiB0eXBlPVwidGV4dFwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCIgLz5cblx0XHRcdDwvZGl2PlxuXHRcdGBcblx0fSlcbik7XG5cblZ1ZS5jb21wb25lbnQoJ2lubGluZS1jaGVja2JveCcsXG5cdFZ1ZS5leHRlbmQoe1xuXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJyBdLFxuXHRcdHRlbXBsYXRlOiBgXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxuXHRcdFx0XHQ8aW5wdXQgY2xhc3M9XCJpbmxpbmUtY2hlY2tib3hcIiB0eXBlPVwiY2hlY2tib3hcIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiIC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHRgXG5cdH0pXG4pO1xuXG5WdWUuY29tcG9uZW50KCdpbmxpbmUtc2VsZWN0Jyxcblx0VnVlLmV4dGVuZCh7XG5cdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnLCAnb3B0aW9ucycgXSxcblx0XHR0ZW1wbGF0ZTogYFxuXHRcdFx0PGRpdiBjbGFzcz1cImlubGluZS1jb250YWluZXJcIj5cblx0XHRcdFx0PHNlbGVjdCBjbGFzcz1cImlubGluZS1jb250cm9sMVwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCI+XG5cdFx0XHRcdFx0PG9wdGlvbiB2LWZvcj1cIm9wdGlvbiBpbiBvcHRpb25zXCIgdmFsdWU9XCJ7eyBvcHRpb24ua2V5IH19XCI+e3sgb3B0aW9uLnZhbHVlIH19PC9vcHRpb24+XG5cdFx0XHRcdDwvc2VsZWN0PlxuXHRcdFx0PC9kaXY+XG5cdFx0YFxuXHR9KVxuKTtcblxuVnVlLmNvbXBvbmVudCgnaW5saW5lLXZhbHVlJyxcblx0VnVlLmV4dGVuZCh7XG5cdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnLCAnY2xhc3MnIF0sXG5cdFx0dGVtcGxhdGU6IGBcblx0XHRcdDxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIiAvPlxuXHRcdFx0PHNwYW4gOmNsYXNzPVwiY2xhc3NcIj57eyB2YWx1ZSB9fTwvc3Bhbj5cblx0XHRgXG5cdH0pXG4pO1xuIiwiVnVlLmNvbXBvbmVudCgnbW9kYWwnLCB7XG5cbiAgICBwcm9wczoge1xuICAgICAgICBpZDogU3RyaW5nLFxuICAgICAgICBjdXJyZW50OiBPYmplY3QsXG4gICAgICAgIG9yaWdpbmFsOiBPYmplY3QsXG4gICAgfSxcblxuICAgIG1ldGhvZHM6IHtcblxuICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKCdzdWJtaXQnLCB0aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgLy8gT2JqZWN0LmFzc2lnbih0aGlzLm9yaWdpbmFsLCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuY3VycmVudCkpKTtcbiAgICAgICAgICAgICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKCdyZXNldCcsIHRoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAvLyBPYmplY3QuYXNzaWduKHRoaXMuY3VycmVudCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLm9yaWdpbmFsKSkpO1xuICAgICAgICAgICAgJChlLnRhcmdldCkuY2xvc2VzdCgnLm1vZGFsJykubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuIiwiVnVlLmRpcmVjdGl2ZSgnY29tYm8nLCB7XG5cblx0YmluZDogZnVuY3Rpb24gKCkge1xuXG5cdFx0aWYgKCQuZm4udGFnc2lucHV0KSB7XG5cblx0XHRcdCQodGhpcy5lbCkuc2VsZWN0Mih7XG5cdFx0XHRcdHRhZ3M6IHRydWUsXG5cdFx0XHRcdG11bHRpcGxlOiBmYWxzZSxcblx0XHRcdFx0Y3JlYXRlVGFnOiBmdW5jdGlvbiAocGFyYW1zKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdGlkOiBwYXJhbXMudGVybSxcblx0XHRcdFx0XHRcdHRleHQ6IHBhcmFtcy50ZXJtLFxuXHRcdFx0XHRcdFx0bmV3T3B0aW9uOiB0cnVlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXHR1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcblx0fSxcblx0dW5iaW5kOiBmdW5jdGlvbiAoKSB7XG5cdH1cbn0pO1xuIiwiVnVlLmRpcmVjdGl2ZSgnZGF0ZScsIHtcblxuXHRiaW5kOiBmdW5jdGlvbiAoKSB7XG5cdFx0XG5cdFx0aWYgKCQuZm4uZGF0ZXBpY2tlcikge1xuXG5cdFx0XHQkKHRoaXMuZWwpLmRhdGVwaWNrZXIoe1xuXHRcdFx0XHRhdXRvY2xvc2U6IHRydWUsXG5cdFx0XHRcdHRvZGF5SGlnaGxpZ2h0OiB0cnVlLFxuXHRcdFx0XHRmb3JtYXQ6IFwieXl5eS1tbS1kZFwiXG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cdHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuXHR9LFxuXHR1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0fVxufSk7XG4iLCJWdWUuZGlyZWN0aXZlKCd0YWdzJywge1xuXG5cdGJpbmQ6IGZ1bmN0aW9uICgpIHtcblxuXHRcdGlmICgkLmZuLnRhZ3NpbnB1dCkge1xuXG5cdFx0XHQkKHRoaXMuZWwpLnRhZ3NpbnB1dCh7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cdHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuXHR9LFxuXHR1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0fVxufSk7XG4iLCJWdWUuZmlsdGVyKCd0ZW1wbGF0ZScsIGZ1bmN0aW9uIChzdHJpbmcsIGRhdGEpIHtcblxuXHR2YXIgcmUgPSAvJHsoW159XSspfS9nO1xuXHRyZXR1cm4gc3RyaW5nLnJlcGxhY2UocmUsIGZ1bmN0aW9uKG1hdGNoLCBrZXkpIHtcblx0XHRyZXR1cm4gZGF0YVtrZXldO1xuXHR9KTtcbn0pO1xuXG5WdWUuZmlsdGVyKCdhc3NpZ24nLCBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UxLCBzb3VyY2UyLCBzb3VyY2UzKSB7XG5cblx0cmV0dXJuIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UxLCBzb3VyY2UyLCBzb3VyY2UzKTtcbn0pO1xuXG5WdWUuZmlsdGVyKCdjb3B5JywgZnVuY3Rpb24gKHNvdXJjZSkge1xuXG5cdHJldHVybiBuZXcgVnVlKHtcblx0XHRkYXRhOiBzb3VyY2UgIT0gbnVsbFxuXHRcdFx0PyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNvdXJjZSkpXG5cdFx0XHQ6IG51bGxcblx0fSkuJGRhdGE7XG59KTtcblxuVnVlLmZpbHRlcignY2xvbmUnLCBmdW5jdGlvbiAoc291cmNlKSB7XG5cblx0cmV0dXJuIG5ldyBWdWUoe1xuXHRcdGRhdGE6IHNvdXJjZSAhPSBudWxsXG5cdFx0XHQ/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc291cmNlKSlcblx0XHRcdDogbnVsbFxuXHR9KS4kZGF0YTtcbn0pO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSkge1xuXG4gICAgdmFyIExpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZG9tYWlucy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdkb21haW5zLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZG9tYWlucy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJyldLFxuICAgIH0pO1xuXG4gICAgdmFyIEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihMaXN0Vmlld2VyLCBNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zJyxcbiAgICB9KTtcblxuXG4gICAgdmFyIFNldHRpbmdzTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1zZXR0aW5ncy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLXNldHRpbmdzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU2V0dGluZ3NNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1zZXR0aW5ncy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtc2V0dGluZ3MtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTZXR0aW5nc0VkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1zZXR0aW5ncycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTZXR0aW5nc0xpc3RWaWV3ZXIsIFNldHRpbmdzTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjZG9tYWlucy1zZXR0aW5ncycsXG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xuIiwiKGZ1bmN0aW9uKCQpIHtcblxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGZ1bmN0aW9uIHJlcG9zaXRpb24oZWxlbWVudCkge1xuXG4gICAgICAgICAgICB2YXIgbW9kYWwgPSAkKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIGRpYWxvZyA9ICQoJy5tb2RhbC1kaWFsb2cnLCBtb2RhbCk7XG5cbiAgICAgICAgICAgIG1vZGFsLmNzcygnZGlzcGxheScsICdibG9jaycpO1xuICAgICAgICAgICAgZGlhbG9nLmNzcyhcIm1hcmdpbi10b3BcIiwgTWF0aC5tYXgoMCwgKCQod2luZG93KS5oZWlnaHQoKSAtIGRpYWxvZy5oZWlnaHQoKSkgLyAyKSk7XG4gICAgICAgIH1cblxuICAgICAgICAkKCQoZG9jdW1lbnQpLCAnLm1vZGFsLm1vZGFsLWNlbnRlcicpLm9uKCdzaG93LmJzLm1vZGFsJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmVwb3NpdGlvbihlLnRhcmdldCk7XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbn0pKGpRdWVyeSk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XG5cbiAgICB2YXIgTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJyldLFxuICAgIH0pO1xuXG4gICAgdmFyIEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMnLFxuICAgIH0pO1xuXG5cbiAgICB2YXIgU2V0dGluZ3NMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zZXR0aW5ncy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zZXR0aW5ncy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIFNldHRpbmdzTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNldHRpbmdzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc2V0dGluZ3MtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTZXR0aW5nc0VkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc2V0dGluZ3MnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU2V0dGluZ3NMaXN0Vmlld2VyLCBTZXR0aW5nc01vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNldHRpbmdzJyxcbiAgICB9KTtcblxuXG4gICAgdmFyIE1ldGFzTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtbWV0YXMtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtbWV0YXMtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBNZXRhc01vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1tZXRhcy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLW1ldGFzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgTWV0YXNFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLW1ldGFzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKE1ldGFzTGlzdFZpZXdlciwgTWV0YXNNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1tZXRhcycsXG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSkge1xuXG4gICAgdmFyIExpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMtbGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJyldLFxuICAgIH0pO1xuXG4gICAgdmFyIEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihMaXN0Vmlld2VyLCBNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzJyxcbiAgICB9KTtcblxuXG4gICAgdmFyIFNldHRpbmdzTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcy1zZXR0aW5ncy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLXNldHRpbmdzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU2V0dGluZ3NNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcy1zZXR0aW5ncy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMtc2V0dGluZ3MtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTZXR0aW5nc0VkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcy1zZXR0aW5ncycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTZXR0aW5nc0xpc3RWaWV3ZXIsIFNldHRpbmdzTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1zZXR0aW5ncycsXG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSkge1xuXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdzZXR0aW5ncy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NldHRpbmdzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2RvbWFpbnMnKV0sXG4gICAgfSk7XG5cbiAgICB2YXIgRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdzZXR0aW5ncycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5BY3Rpb25NaXhpbihNb2RhbEVkaXRvcildLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0XG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHB1c2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9zZXR0aW5ncy9kby11cGRhdGUnLFxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKSxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmRvbmUoKGQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBkKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHB1bGw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9zZXR0aW5ncycsXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmRvbmUoKGQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBkKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xuIiwiU2hlbGwgPSB3aW5kb3cuU2hlbGwgfHwge307XG5TaGVsbC5TZXJ2aWNlcyA9IHdpbmRvdy5TaGVsbC5TZXJ2aWNlcyB8fCB7fTtcblxuKGZ1bmN0aW9uKCQsIFZ1ZSwgU2hlbGwsIHVuZGVmaW5lZCkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2VydmljZS1sYXlvdXQnLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxuICAgICAgICB9LFxuICAgICAgICByZWFkeTogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgU2hlbGwuU2VydmljZXMuTGF5b3V0ID1cbiAgICAgICAgICAgIG5ldyBWdWUoe1xuICAgICAgICAgICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0V2lkZ2V0OiBmdW5jdGlvbihpZCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGYuc2V0dGluZ3Mud2lkZ2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3ID0gc2VsZi5zZXR0aW5ncy53aWRnZXRzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3LmlkID09IGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB3O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVzdHJveWVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFNoZWxsLlNlcnZpY2VzLkxheW91dCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbihWdWUsICQpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbCcsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBzZWxlY3Rpb246IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxuICAgICAgICB9LFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb246IHRoaXMuc2VsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nczogdGhpcy5zZXR0aW5ncyxcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWwsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRoaXMuZGF0YSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICBmdW5jdGlvbiByZWxldmFudChjdXJyZW50LCBjb2xsZWN0aW9uKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWN1cnJlbnQgfHwgY3VycmVudC5fYWN0aW9uID09ICdyZW1vdmUnIHx8IChjb2xsZWN0aW9uICYmIGNvbGxlY3Rpb24uaW5kZXhPZihjdXJyZW50KSA8IDApKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29sbGVjdGlvbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjID0gY29sbGVjdGlvbltpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYy5fYWN0aW9uICE9ICdyZW1vdmUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50ICYmIGN1cnJlbnQuX2FjdGlvbiA9PSAncmVtb3ZlJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ3NldHRpbmdzLmNhdGVnb3JpZXMnLCAoY2F0ZWdvcmllcykgPT4ge1xuXG4gICAgICAgICAgICAgICAgdmFyIGNhdGVnb3J5ID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAoY2F0ZWdvcmllcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdWIgPSBjYXRlZ29yaWVzWzBdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2F0ZWdvcmllcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeSA9IHN1Yi5jYXRlZ29yaWVzWzBdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLmNhdGVnb3J5ID0gY2F0ZWdvcnk7XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdtb2RlbC5kb21haW5zJywgKGRvbWFpbnMpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5kb21haW4gPSByZWxldmFudCh0aGlzLnNlbGVjdGlvbi5kb21haW4sIGRvbWFpbnMpO1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnbW9kZWwucGFnZXMnLCAocGFnZXMpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5wYWdlID0gcmVsZXZhbnQodGhpcy5zZWxlY3Rpb24ucGFnZSwgcGFnZXMpO1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnc2VsZWN0aW9uLnBhZ2Uuc291cmNlcycsIChzb3VyY2VzKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb24uc291cmNlID0gcmVsZXZhbnQodGhpcy5zZWxlY3Rpb24uc291cmNlLCBzb3VyY2VzKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhzb3VyY2VzLCB0aGlzLnNlbGVjdGlvbi5zb3VyY2UpO1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnc2VsZWN0aW9uLnBhZ2Uuc291cmNlcycsIChzb3VyY2VzKSA9PiB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSB7fTtcblxuICAgICAgICAgICAgICAgIGlmIChzb3VyY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc291cmNlcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcyA9IHNvdXJjZXNbaV07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBxdWVyeSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzLnBhcmFtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHMucGFyYW1zW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbS5pbiA9PSAncXVlcnknICYmIHBhcmFtLnNwZWNpZmllZCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHBhcmFtLmJpbmRpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy4kaW50ZXJwb2xhdGUocGFyYW0uYmluZGluZykgLy8gVE9ETyBJbnRlcnBvbGF0ZSBpbiBwYWdlIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogcGFyYW0udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5W3BhcmFtLm5hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogcy5tZXRob2QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBzLnVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcXVlcnksXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuZG9uZSgoZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YVtzLm5hbWVdID0gZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgIGdldFdpZGdldDogZnVuY3Rpb24oaWQpIHtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zZXR0aW5ncy53aWRnZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3ID0gdGhpcy5zZXR0aW5ncy53aWRnZXRzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAody5pZCA9PSBpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHNlbGVjdFBhZ2U6IGZ1bmN0aW9uKHBhZ2UpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLnBhZ2UgPSBwYWdlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLnNvdXJjZSA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xuXG4gICAgICAgICAgICAgICAgLy8gVE9ETyDQodC00LXQu9Cw0YLRjCDQt9Cw0L/RgNC+0YHRi1xuXG4gICAgICAgICAgICAgICAgaWYgKHBhZ2UgJiYgcGFnZS5zb3VyY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFnZS5zb3VyY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcyA9IHBhZ2Uuc291cmNlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbcy5uYW1lXSA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG9uZTogMTEsIHR3bzogMTIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG9uZTogMjEsIHR3bzogMjIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG9uZTogMzEsIHR3bzogMzIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG9uZTogNDEsIHR3bzogNDIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuZGF0YSA9IGRhdGE7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBzZWxlY3RTb3VyY2U6IGZ1bmN0aW9uKHNvdXJjZSkge1xuXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgIHB1bGw6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvc2V0dGluZ3MnLFxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5kb25lKChkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgZCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwdXNoOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL3NldHRpbmdzL2RvLXVwZGF0ZScsXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZG9uZSgoZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIGQpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdHJlZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlbGVjdENhdGVnb3J5OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb24uY2F0ZWdvcnkgPSBkYXRhLml0ZW07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VsZWN0RG9tYWluOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb24uZG9tYWluID0gZGF0YS5pdGVtO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlbGVjdFBhZ2U6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5wYWdlID0gZGF0YS5pdGVtO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlbGVjdFNvdXJjZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLnNvdXJjZSA9IGRhdGEuaXRlbTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoVnVlLCBqUXVlcnksIHVuZGVmaW5lZCk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XG5cbiAgICB2YXIgTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgnd2lkZ2V0cy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyN3aWRnZXRzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3dpZGdldHMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyN3aWRnZXRzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCd3aWRnZXRzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3dpZGdldHMnLFxuICAgIH0pO1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgdW5kZWZpbmVkKTtcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcblxuICAgIHZhciBTb3VyY2VzTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU291cmNlc01vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBjaGVjazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2NoZWNrJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBTb3VyY2VzRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFNvdXJjZXNMaXN0Vmlld2VyLCBTb3VyY2VzTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcycsXG4gICAgfSk7XG5cbiAgICB2YXIgU291cmNlc1BhcmFtc0xpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU291cmNlc1BhcmFtc01vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLXBhcmFtcy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU291cmNlc1BhcmFtc0VkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1wYXJhbXMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU291cmNlc1BhcmFtc0xpc3RWaWV3ZXIsIFNvdXJjZXNQYXJhbXNNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLXBhcmFtcycsXG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xuIiwiU2hlbGwgPSB3aW5kb3cuU2hlbGwgfHwge307XG5TaGVsbC5XaWRnZXRzID0gd2luZG93LlNoZWxsLldpZGdldHMgfHwge307XG5cbihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsLCB1bmRlZmluZWQpIHtcblxuICAgIHZhciBXaWRnZXRzTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIGdldFdpZGdldDogZnVuY3Rpb24odykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5nbG9iYWxzLndpZGdldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdpZGdldCA9IHRoaXMuZ2xvYmFscy53aWRnZXRzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAody50eXBlID09IHdpZGdldC5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdpZGdldDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIFdpZGdldHNNb2RhbEVkaXRvciA9IFNoZWxsLldpZGdldHMuTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2RhdGEnKV0sXG4gICAgICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZXh0LndpZGdldC5wcm9wcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHByb3AgPSB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHRoaXMuY3VycmVudC5wYXJhbXNbcHJvcC5uYW1lXSA9IHRoaXMuY3VycmVudC5wYXJhbXNbcHJvcC5uYW1lXSB8fCB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBiaW5kaW5nOiBudWxsXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHBhcmFtLl9hY3Rpb24gPSBwYXJhbS5fYWN0aW9uID09ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgID8gJ3VwZGF0ZSdcbiAgICAgICAgICAgICAgICAgICAgOiAnY3JlYXRlJ1xuICAgICAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICBwcm9wOiBwcm9wLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbTogcGFyYW0sXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuaXRlbXMgPSBpdGVtcztcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuY29udGV4dCxcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtcyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcblxuICAgICAgICAgICAgaGFzUHJvcHM6IGZ1bmN0aW9uKHRhYikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbnRleHQud2lkZ2V0ICYmIHRoaXMuY29udGV4dC53aWRnZXQucHJvcHMpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvcC50YWIgPT0gdGFiKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBXaWRnZXRzRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFdpZGdldHNMaXN0Vmlld2VyLCBXaWRnZXRzTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICB3aWRnZXQ6IE9iamVjdFxuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgIHByb3RvOiBmdW5jdGlvbih3aWRnZXQpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiB3aWRnZXQuaWQsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtczoge30sXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHZhciBwYXJhbXMgPSB7fTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgd2lkZ2V0LnByb3BzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb3AgPSB3aWRnZXQucHJvcHNbaV07XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtc1twcm9wLm5hbWVdID0gcHJvcC50eXBlICE9ICdtdWx0aXBsZSdcbiAgICAgICAgICAgICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hY3Rpb246ICdjcmVhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRpbmc6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmluZGluZzogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRhdGEucGFyYW1zID0gcGFyYW1zO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCwgdW5kZWZpbmVkKTtcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1hY3Rpb25zJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1hY3Rpb25zJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXG4gICAgICAgICAgICBjYXRlZ29yeTogT2JqZWN0LFxuICAgICAgICAgICAgZG9tYWluOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3RcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGl0ZW0sIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSk7XG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtYnJhbmQnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWJyYW5kJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUpO1xuIiwiKGZ1bmN0aW9uKCQsVnVlLCB1bmRlZmluZWQpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWNhdGVnb3JpZXMnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWNhdGVnb3JpZXMnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogQXJyYXksXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUpO1xuIiwiKGZ1bmN0aW9uKCQsVnVlLCB1bmRlZmluZWQpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWNvbnRhaW5lcicsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtY29udGFpbmVyJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBjYXRlZ29yeTogT2JqZWN0LFxuICAgICAgICB9LFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuZ2xvYmFscywgdGhpcy5zZXR0aW5ncywgdGhpcy5wYWdlLCB0aGlzLmNhdGVnb3J5KTtcbiAgICAgICAgICAgIC8vIHJldHVybiB7XG4gICAgICAgICAgICAvLyAgICAgcGFnZTogdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5wYWdlXG4gICAgICAgICAgICAvLyB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIHJlYWR5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKHRoaXMuZ2xvYmFscywgdGhpcy5zZXR0aW5ncywgdGhpcy5wYWdlKTtcbiAgICAgICAgLy8gfVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSk7XG4iLCJTaGVsbCA9IHdpbmRvdy5TaGVsbCB8fCB7fTtcblxuKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIHVuZGVmaW5lZCkge1xuXG4gICAgZnVuY3Rpb24gc3R1Yih0aXRsZSwgc3VidGl0bGUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHR5cGU6ICdOVFIxWERlZmF1bHRCdW5kbGUvU3R1YicsXG4gICAgICAgICAgICBfYWN0aW9uOiAnaWdub3JlJyxcbiAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgIHRpdGxlOiB7IHZhbHVlOiB0aXRsZSB9LFxuICAgICAgICAgICAgICAgIHN1YnRpdGxlOiB7IHZhbHVlOiBzdWJ0aXRsZSB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgRGVjb3JhdG9yTWl4aW4gPSB7XG5cbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgfSxcblxuICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgIHJlbW92ZVdpZGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goJ3JlbW92ZUNoaWxkV2lkZ2V0JywgeyBpdGVtOiB0aGlzLm1vZGVsIH0pO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZG9BcHBseTogZnVuY3Rpb24obW9kZWwpIHtcblxuICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShtb2RlbCkpLCB7XG4gICAgICAgICAgICAgICAgICAgIF9hY3Rpb246IHRoaXMubW9kZWwuX2FjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgPyB0aGlzLm1vZGVsLl9hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIDogJ3VwZGF0ZSdcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHNob3dTZXR0aW5nczogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGlhbG9nID0gbmV3IFNoZWxsLldpZGdldHMuTW9kYWxFZGl0b3Ioe1xuXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogdGhpcy53aWRnZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbDogdGhpcy5tb2RlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCkpXG4gICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm93bmVyLmRvQXBwbHkodGhpcy5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLiRtb3VudCgpLiRhcHBlbmRUbygkKCdib2R5JykuZ2V0KDApKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIHZhciBCaW5kaW5nc01peGluID0ge1xuXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBiaW5kaW5nczogdGhpcy5iaW5kaW5ncyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlY3VyKHBhcmFtcykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0ge307XG4gICAgICAgICAgICAgICAgZm9yKHZhciBrZXkgaW4gcGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbXNba2V5XVsnYmluZGluZyddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVtrZXldID0gc2VsZi4kaW50ZXJwb2xhdGUocGFyYW1zW2tleV1bJ2JpbmRpbmcnXSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoJC5pc0FycmF5KHBhcmFtc1trZXldWyd2YWx1ZSddKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVba2V5XSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHBhcmFtc1trZXldWyd2YWx1ZSddLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVba2V5XVtpXSA9IHJlY3VyKHBhcmFtc1trZXldWyd2YWx1ZSddW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlW2tleV0gPSBwYXJhbXNba2V5XVsndmFsdWUnXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ21vZGVsJywgKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYmluZGluZ3MgPSByZWN1cih0aGlzLm1vZGVsLnBhcmFtcyk7XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgQ29tcG9zaXRlTWl4aW4gPSB7XG5cbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiB0aGlzLmNoaWxkcmVuLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkeTogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdpdGVtcycsIChpdGVtcykgPT4ge1xuXG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gW107XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1zKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gaXRlbXNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5fYWN0aW9uICE9ICdyZW1vdmUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnN0dWIoKSkpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBldmVudHM6IHtcblxuICAgICAgICAgICAgcmVtb3ZlQ2hpbGRXaWRnZXQ6IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gZGF0YS5pdGVtO1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coaXRlbSwgdGhpcy5pdGVtcyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5fYWN0aW9uID09ICdjcmVhdGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMuJHJlbW92ZShpdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLl9hY3Rpb24gPSAncmVtb3ZlJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zID0gJC5leHRlbmQodHJ1ZSwgW10sIHRoaXMuaXRlbXMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgdmFyIFNvcnRhYmxlTWl4aW4gPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcblxuICAgICAgICBmdW5jdGlvbiBmaW5kKGNoaWxkcmVuLCBkb21JbmRleCkge1xuXG4gICAgICAgICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGggJiYgaW5kZXggPCBkb21JbmRleDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcblxuICAgICAgICAgICAgICAgIGlmIChjaGlsZC5fYWN0aW9uICE9ICdyZW1vdmUnKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuXG4gICAgICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICByZWFkeTogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ3NlbGVjdGVkJywgZnVuY3Rpb24oc2VsZWN0ZWQpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zb3J0YWJsZSA9XG4gICAgICAgICAgICAgICAgICAgICAgICBTb3J0YWJsZS5jcmVhdGUoJChzZWxlY3Rvciwgc2VsZi4kZWwpLmdldCgwKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICd3aWRnZXRzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogMTUwLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25BZGQ6IGZ1bmN0aW9uIChldnQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFsZXR0ZSA9ICQoZXZ0Lml0ZW0pLmNsb3Nlc3QoJy5nZS5nZS1wYWxldHRlJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFwYWxldHRlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChldnQuaXRlbSkucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNlbGYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGkgPSBmaW5kKHNlbGYuaXRlbXMsIGV2dC5uZXdJbmRleCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3aWRnZXQgPSBzZWxmLiRyb290LiRyZWZzLnNoZWxsLmdldFdpZGdldCgkKGV2dC5pdGVtKS5kYXRhKCd3aWRnZXQnKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuaXRlbXMuc3BsaWNlKGkuaW5kZXgsIDAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB3aWRnZXQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogJ2NyZWF0ZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogd2lkZ2V0LnBhcmFtc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkod2lkZ2V0LnBhcmFtcykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDoge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0czogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogJ2NyZWF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pdGVtcyA9ICQuZXh0ZW5kKHRydWUsIFtdLCBzZWxmLml0ZW1zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkVuZDogZnVuY3Rpb24gKGV2dCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICAoZXZ0Lm5ld0luZGV4ICE9IGV2dC5vbGRJbmRleCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9pID0gZmluZChzZWxmLml0ZW1zLCBldnQub2xkSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5pID0gZmluZChzZWxmLml0ZW1zLCBldnQubmV3SW5kZXgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZW5kJywgb2ksIG5pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNlbGYuaXRlbXMpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLml0ZW1zLnNwbGljZShuaSwgMCwgc2VsZi5pdGVtcy5zcGxpY2Uob2ksIDEpWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuaXRlbXMgPSAkLmV4dGVuZCh0cnVlLCBbXSwgc2VsZi5pdGVtcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coc2VsZi5pdGVtcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuc29ydGFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNvcnRhYmxlLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNvcnRhYmxlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICAgICAgc2VsZWN0VGFyZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHVuc2VsZWN0VGFyZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci1zdHViJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kZWNvcmF0b3Itc3R1YicsXG4gICAgICAgIG1peGluczogWyBEZWNvcmF0b3JNaXhpbiwgQmluZGluZ3NNaXhpbiBdLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3QsXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci13aWRnZXQnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWRlY29yYXRvci13aWRnZXQnLFxuICAgICAgICBtaXhpbnM6IFsgRGVjb3JhdG9yTWl4aW4sIEJpbmRpbmdzTWl4aW4gXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0LFxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1kZWNvcmF0b3ItaG9yaXNvbnRhbCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZGVjb3JhdG9yLWhvcmlzb250YWwnLFxuICAgICAgICBtaXhpbnM6IFsgRGVjb3JhdG9yTWl4aW4sIENvbXBvc2l0ZU1peGluLCBTb3J0YWJsZU1peGluKCcud2cud2ctcm93JyksIEJpbmRpbmdzTWl4aW4gXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0LFxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHN0dWI6IGZ1bmN0aW9uKCkgeyByZXR1cm4gc3R1YignSG9yaXNvbnRhbCBTdGFjaycsICdEcm9wIEhlcmUnKTsgfVxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtZGVjb3JhdG9yLXZlcnRpY2FsJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kZWNvcmF0b3ItdmVydGljYWwnLFxuICAgICAgICBtaXhpbnM6IFsgRGVjb3JhdG9yTWl4aW4sIENvbXBvc2l0ZU1peGluLCBTb3J0YWJsZU1peGluKCcud2cud2ctdGFibGUnKSwgQmluZGluZ3NNaXhpbiBdLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3QsXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgc3R1YjogZnVuY3Rpb24oKSB7IHJldHVybiBzdHViKCdWZXJ0aWNhbCBTdGFjaycsICdEcm9wIEhlcmUnKTsgfVxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtZGVjb3JhdG9yLWNhbnZhcycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZGVjb3JhdG9yLWNhbnZhcycsXG4gICAgICAgIG1peGluczogWyBDb21wb3NpdGVNaXhpbiwgU29ydGFibGVNaXhpbignLndnLndnLXRhYmxlJykgXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHN0dWI6IGZ1bmN0aW9uKCkgeyByZXR1cm4gc3R1YignVmVydGljYWwgU3RhY2snLCAnRHJvcCBIZXJlJyk7IH1cbiAgICAgICAgfSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1kb21haW5zJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kb21haW5zJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGRvbWFpbnM6IEFycmF5LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSk7XG4iLCJcblxuKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgdW5kZWZpbmVkKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wYWdlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wYWdlJyxcbiAgICAgICAgbWl4aW5zOiBbIC8qQ29yZS5Db250YWluZXJNaXhpbiwgQ29yZS5Tb3J0YWJsZU1peGluKi8gXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkZWNvcmF0b3I6IHRoaXMuZGVjb3JhdG9yLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5kZWNvcmF0b3IgPSAnc2hlbGwtZGVjb3JhdG9yLWNhbnZhcyc7XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wYWdlcycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcGFnZXMnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgcGFnZXM6IEFycmF5LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSk7XG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xuXG4gICAgdmFyIFBhbGV0dGVJdGVtID1cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wYWxldHRlLWl0ZW0nLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXBhbGV0dGUtaXRlbScsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICB3aWRnZXQ6IE9iamVjdCxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICAgICAgY29tcHV0ZWQ6IHtcbiAgICAgICAgICAgIHRodW1ibmFpbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcvYnVuZGxlcy8nICsgdGhpcy53aWRnZXQucHJvdmlkZXIuYWxpYXMgKyAnLycgKyB0aGlzLndpZGdldC50aHVtYm5haWwucGF0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgU29ydGFibGUuY3JlYXRlKHRoaXMuJGVsLCB7XG4gICAgICAgICAgICAgICAgZ3JvdXA6IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3dpZGdldHMnLFxuICAgICAgICAgICAgICAgICAgICBwdWxsOiAnY2xvbmUnLFxuICAgICAgICAgICAgICAgICAgICBwdXQ6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IDE1MCxcbiAgICAgICAgICAgICAgICBzb3J0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAvLyBvblN0YXJ0OiBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coZXZ0KTtcbiAgICAgICAgICAgICAgICAvLyAgICAgJChldnQuaXRlbSkuaHRtbCgnPGI+RGF0YTwvYj4nKTtcbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgLy8gc2V0RGF0YTogZnVuY3Rpb24gKGRhdGFUcmFuc2ZlciwgZHJhZ0VsKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGRyYWdFbCk7XG4gICAgICAgICAgICAgICAgLy8gICAgICQoZHJhZ0VsKS5odG1sKCc8Yj5IZWxsbzwvYj4nKTtcbiAgICAgICAgICAgICAgICAvLyAgICAgLy8gZGF0YVRyYW5zZmVyLnNldERhdGEoJ1RleHQnLCBkcmFnRWwudGV4dENvbnRlbnQpO1xuICAgICAgICAgICAgICAgIC8vIH0sXG4gICAgICAgICAgICAgICAgLy8gc2V0RGF0YTogZnVuY3Rpb24oZGF0YVRyYW5zZmVyLCBkcmFnRWwpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgZGF0YVRyYW5zZmVyLnNldERhdGEoJ1RleHQnLCBkcmFnRWwudGV4dENvbnRlbnQpO1xuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gJCh0aGlzLiRlbCkuZHJhZ2dhYmxlKHtcbiAgICAgICAgICAgIC8vICAgICBjb25uZWN0VG9Tb3J0YWJsZTogXCIuZ2UuZ2Utc3RhY2tlZFwiLFxuICAgICAgICAgICAgLy8gICAgIGhlbHBlcjogXCJjbG9uZVwiLFxuICAgICAgICAgICAgLy8gICAgIHJldmVydDogXCJpbnZhbGlkXCJcbiAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wYWxldHRlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wYWxldHRlJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGNhdGVnb3J5OiBPYmplY3RcbiAgICAgICAgfSxcbiAgICAgICAgY29tcG9uZW50czoge1xuICAgICAgICAgICAgJ3BhbGV0dGUtaXRlbSc6IFBhbGV0dGVJdGVtXG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUpO1xuIiwiKGZ1bmN0aW9uKCQsVnVlLCB1bmRlZmluZWQpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXNvdXJjZXMnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXNvdXJjZXMnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgc291cmNlczogQXJyYXksXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlKTtcbiIsIi8vIChmdW5jdGlvbigkLCBWdWUsIENvcmUsIHVuZGVmaW5lZCkge1xuLy9cbi8vICAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1zdGFja2VkJywge1xuLy8gICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1zdGFja2VkJyxcbi8vICAgICAgICAgbWl4aW5zOiBbIENvcmUuU3RhY2tlZCBdXG4vLyAgICAgfSk7XG4vL1xuLy8gfSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1zdHViJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1zdHViJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgfSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUpO1xuIiwiKGZ1bmN0aW9uKCQsVnVlLCB1bmRlZmluZWQpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXRhcmdldCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtdGFyZ2V0JyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgfSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUpO1xuIiwiU2hlbGwgPSB3aW5kb3cuU2hlbGwgfHwge307XG5TaGVsbC5XaWRnZXRzID0gd2luZG93LlNoZWxsLldpZGdldHMgfHwge307XG5cbihmdW5jdGlvbigkLCBWdWUsIFNoZWxsLCB1bmRlZmluZWQpIHtcblxuICAgIFNoZWxsLldpZGdldCA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtd2lkZ2V0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC13aWRnZXQnLFxuICAgICAgICBtaXhpbnM6IFsgLyogQ29yZS5EZWNvcmF0b3JNaXhpbiwgQ29yZS5Db250YWluZXJNaXhpbiwgQ29yZS5Tb3J0YWJsZU1peGluLCBDb3JlLkJpbmRpbmdzTWl4aW4gKi8gXSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxuICAgICAgICB9LFxuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZGVjb3JhdG9ycyA9IHtcbiAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gJ2RlZmF1bHQtc3RhY2stcGFnZSc6IGZ1bmN0aW9uKCkgeyBPYmplY3QuYXNzaWduKHRoaXMsIHsgc2VsZWN0b3I6ICcud2cud2ctdGFibGUnLCBzdHViOiBzdHViKCdWZXJ0aWNhbCBTdGFjaycsICdEcm9wIEhlcmUnKSB9KSB9LFxuICAgICAgICAgICAgICAgICAgICAvLyAnZGVmYXVsdC1zdGFjay1ob3Jpc29udGFsJzogZnVuY3Rpb24oKSB7IE9iamVjdC5hc3NpZ24odGhpcywgeyBzZWxlY3RvcjogJy53Zy53Zy1yb3cnLCBzdHViOiBzdHViKCdIb3Jpc29udGFsIFN0YWNrJywgJ0Ryb3AgSGVyZScpIH0pIH0sXG4gICAgICAgICAgICAgICAgICAgIC8vICdkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJzogZnVuY3Rpb24oKSB7IE9iamVjdC5hc3NpZ24odGhpcywgeyBzZWxlY3RvcjogJy53Zy53Zy10YWJsZScsIHN0dWI6IHN0dWIoJ1ZlcnRpY2FsIFN0YWNrJywgJ0Ryb3AgSGVyZScpIH0pIH0sXG4gICAgICAgICAgICAgICAgICAgICdkZWZhdWx0LXN0YWNrLWhvcmlzb250YWwnOiAnc2hlbGwtZGVjb3JhdG9yLWhvcmlzb250YWwnLFxuICAgICAgICAgICAgICAgICAgICAnZGVmYXVsdC1zdGFjay12ZXJ0aWNhbCc6ICdzaGVsbC1kZWNvcmF0b3ItdmVydGljYWwnLFxuICAgICAgICAgICAgICAgICAgICAnZGVmYXVsdC1zdHViJzogJ3NoZWxsLWRlY29yYXRvci1zdHViJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZhbGxiYWNrOiAnc2hlbGwtZGVjb3JhdG9yLXdpZGdldCdcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMud2lkZ2V0ID0gdGhpcy4kcm9vdC4kcmVmcy5zaGVsbC5nZXRXaWRnZXQodGhpcy5tb2RlbC50eXBlKTtcbiAgICAgICAgICAgIHRoaXMuZGVjb3JhdG9yID0gdGhpcy5kZWNvcmF0b3JzLmFsdGVybmF0aXZlc1t0aGlzLndpZGdldC50YWddIHx8IHRoaXMuZGVjb3JhdG9ycy5mYWxsYmFjaztcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgd2lkZ2V0OiB0aGlzLndpZGdldCxcbiAgICAgICAgICAgICAgICBkZWNvcmF0b3I6IHRoaXMuZGVjb3JhdG9yLFxuICAgICAgICAgICAgICAgIC8vIGl0ZW1zOiB0aGlzLndpZGdldHMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSkge1xuXG4gICAgdmFyIFBhcmFtU3RyaW5nID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLXBhcmFtcy1zdHJpbmcnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMtcGFyYW1zLXN0cmluZycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBpZDogU3RyaW5nLFxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgUGFyYW1SaWNoID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLXBhcmFtcy1yaWNoJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcy1yaWNoJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGlkOiBTdHJpbmcsXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBQYXJhbVNvdXJjZSA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1wYXJhbXMtc291cmNlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcy1zb3VyY2UnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgaWQ6IFN0cmluZyxcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIFBhcmFtTXVsdGlwbGUgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtcGFyYW1zLW11bHRpcGxlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcy1tdWx0aXBsZScsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBpZDogU3RyaW5nLFxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9LFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaXRlbXM6IHRoaXMuaXRlbS5pdGVtc1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyByZWFkeTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vICAgICB0aGlzLml0ZW1zID0gW107XG4gICAgICAgIC8vIH1cbiAgICB9KTtcblxuICAgIHZhciBQYXJhbXMgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtcGFyYW1zJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBvd25lcjogT2JqZWN0LFxuICAgICAgICAgICAgdGFiOiBTdHJpbmcsXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcbiAgICAgICAgfVxuICAgIH0pO1xuXG5cbiAgICB2YXIgUGFyYW1NdWx0aXBsZUxpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtcGFyYW1zLW11bHRpcGxlLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMtcGFyYW1zLW11bHRpcGxlLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBwcm9wOiBPYmplY3QsXG4gICAgICAgICAgICBwYXJhbTogT2JqZWN0LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgdmFyIFBhcmFtTXVsdGlwbGVNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1wYXJhbXMtbXVsdGlwbGUtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcy1tdWx0aXBsZS1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdkYXRhJyldLFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaXRlbXM6IHRoaXMuaXRlbXMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICByZWFkeTogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmNvbnRleHQpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGV4dC5wcm9wLnByb3BzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHRoaXMuY29udGV4dC5wcm9wLnByb3BzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHRoaXMuY3VycmVudFtwcm9wLm5hbWVdID0gdGhpcy5jdXJyZW50W3Byb3AubmFtZV0gfHwge307XG5cbiAgICAgICAgICAgICAgICBwYXJhbS5fYWN0aW9uID0gcGFyYW0uX2FjdGlvbiA9PSAndXBkYXRlJ1xuICAgICAgICAgICAgICAgICAgICA/ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgIDogJ2NyZWF0ZSdcbiAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogcHJvcCxcbiAgICAgICAgICAgICAgICAgICAgcGFyYW06IHBhcmFtLFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLml0ZW1zID0gaXRlbXM7XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB2YXIgUGFyYW1NdWx0aXBsZUVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1wYXJhbXMtbXVsdGlwbGUtZWRpdG9yJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFBhcmFtTXVsdGlwbGVMaXN0Vmlld2VyLCBQYXJhbU11bHRpcGxlTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1wYXJhbXMtbXVsdGlwbGUtZWRpdG9yJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIHByb3A6IE9iamVjdCxcbiAgICAgICAgICAgIHBhcmFtOiBPYmplY3QsXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgIH0sXG4gICAgICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMpO1xuICAgICAgICB9XG4gICAgfSk7XG5cblxuICAgIHZhciBQYXJhbXNMaXN0ID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLXBhcmFtcy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcy1saXN0JyxcbiAgICAgICAgY29tcG9uZW50czoge1xuICAgICAgICAgICAgJ3BhcmFtcy1zdHJpbmcnOiBQYXJhbVN0cmluZyxcbiAgICAgICAgICAgICdwYXJhbXMtcmljaCc6IFBhcmFtUmljaCxcbiAgICAgICAgICAgICdwYXJhbXMtc291cmNlJzogUGFyYW1Tb3VyY2UsXG4gICAgICAgICAgICAncGFyYW1zLW11bHRpcGxlJzogUGFyYW1NdWx0aXBsZSxcbiAgICAgICAgfSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIG93bmVyOiBPYmplY3QsXG4gICAgICAgICAgICB0YWI6IFN0cmluZyxcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
