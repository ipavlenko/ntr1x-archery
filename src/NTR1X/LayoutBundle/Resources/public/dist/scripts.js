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
                globals: this.globals,
            };
        },
        created: function() {

            this.globals = {
                selection: this.selection,
                settings: this.settings,
                model: this.model,
            };

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

            // selectPage: function(page) {
            //
            //     this.selection.page = page;
            //     this.selection.source = null;
            //
            //     var data = {};
            //
            //     // TODO Сделать запросы
            //
            //     if (page && page.sources) {
            //         for (var i = 0; i < page.sources.length; i++) {
            //             var s = page.sources[i];
            //             data[s.name] = [
            //                 { one: 11, two: 12 },
            //                 { one: 21, two: 22 },
            //                 { one: 31, two: 32 },
            //                 { one: 41, two: 42 },
            //             ];
            //         }
            //     }
            //
            //     this.globals.data = data;
            // },

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

    Vue.component('shell-brand', {
        template: '#shell-brand',
    });

})(jQuery, Vue);

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
        // data: function() {
            // console.log(this.globals, this.settings, this.page, this.category);
            // return {
            //     page: this.globals.selection.page
            // }
        // },
        // ready: function() {
        //     console.log(this.globals, this.settings, this.page);
        // }
    });

})(jQuery, Vue);

(function($,Vue, undefined) {

    Vue.component('shell-domains', {
        template: '#shell-domains',
        props: {
            domains: Array,
            globals: Object,
        },
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

        created: function() {

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

            this.$watch('data', (data) => {
                this.bindings = recur(this.model.params);
            }, {
                deep: true,
                immediate: true,
            });

            this.$watch('model', (model) => {
                this.bindings = recur(model.params);
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

                var self = this;
                this.$watch('selected', function(selected) {

                    if (selected) {

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

                                       var widget = self.$root.$refs.shell.getWidget(w);

                                       self.items.splice(ni, 0, {
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
        mixins: [ DecoratorMixin, CompositeMixin, SortableMixin('>.ge.ge-content >.wg.wg-default-stack >.wg.wg-content >.wg.wg-table >.wg.wg-row'), BindingsMixin ],
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
        mixins: [ DecoratorMixin, CompositeMixin, SortableMixin('>.ge.ge-content >.wg.wg-default-stack >.wg.wg-content >.wg.wg-table'), BindingsMixin ],
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
        mixins: [ CompositeMixin, SortableMixin('>.ge.ge-content >.wg.wg-default-stack >.wg.wg-content >.wg.wg-table') ],
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
                data: this.data,
            };
        },
        ready: function() {

            this.decorator = 'shell-decorator-canvas';
            this.data = {};

            this.$watch('page.sources', (sources) => {

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

                            this.$set('data.' + s.name, d);

                            // Object.assign(this.data, ext);
                            // console.log(this.data);
                        });
                    }
                }

            }, {
                immediate: true,
                deep: true,
            });
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

// (function($, Vue, Core, undefined) {
//
//     Vue.component('shell-stacked', {
//         template: '#shell-stacked',
//         mixins: [ Core.Stacked ]
//     });
//
// })(jQuery, Vue, Core, Shell);

(function($,Vue, undefined) {

    Vue.component('shell-sources', {
        template: '#shell-sources',
        props: {
            sources: Array,
            globals: Object,
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

(function($,Vue, undefined) {

    Vue.component('shell-stub', {
        template: '#shell-stub',
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
            data: Object,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJpbmRpbmdzL2JpbmRpbmdzLmpzIiwiY29tcG9uZW50cy9mb3JtLmpzIiwiY29tcG9uZW50cy9ncmlkLmpzIiwiY29tcG9uZW50cy9pbmxpbmUuanMiLCJjb21wb25lbnRzL21vZGFsLmpzIiwiZGlyZWN0aXZlcy9jb21iby5qcyIsImRpcmVjdGl2ZXMvZGF0ZS5qcyIsImRpcmVjdGl2ZXMvdGFncy5qcyIsImZpbHRlcnMvaW5kZXguanMiLCJkb21haW5zL2RvbWFpbnMuanMiLCJob29rcy9tb2RhbC5qcyIsInBhZ2VzL3BhZ2VzLmpzIiwic2NoZW1lcy9zY2hlbWVzLmpzIiwic2VydmljZXMvbGF5b3V0LmpzIiwic2V0dGluZ3Mvc2V0dGluZ3MuanMiLCJzaGVsbC9zaGVsbC5qcyIsIndpZGdldHMvd2lkZ2V0cy5qcyIsInBhZ2VzL3NvdXJjZXMvc291cmNlcy5qcyIsInBhZ2VzL3dpZGdldHMvd2lkZ2V0cy5qcyIsInNoZWxsL2JyYW5kL2JyYW5kLmpzIiwic2hlbGwvYWN0aW9ucy9hY3Rpb25zLmpzIiwic2hlbGwvY2F0ZWdvcmllcy9jYXRlZ29yaWVzLmpzIiwic2hlbGwvY29udGFpbmVyL2NvbnRhaW5lci5qcyIsInNoZWxsL2RvbWFpbnMvZG9tYWlucy5qcyIsInNoZWxsL2RlY29yYXRvci9kZWNvcmF0b3IuanMiLCJzaGVsbC9wYWdlL3BhZ2UuanMiLCJzaGVsbC9wYWdlcy9wYWdlcy5qcyIsInNoZWxsL3BhbGV0dGUvcGFsZXR0ZS5qcyIsInNoZWxsL3N0YWNrZWQvc3RhY2tlZC5qcyIsInNoZWxsL3NvdXJjZXMvc291cmNlcy5qcyIsInNoZWxsL3RhcmdldC90YXJnZXQuanMiLCJzaGVsbC9zdHViL3N0dWIuanMiLCJzaGVsbC93aWRnZXQvd2lkZ2V0LmpzIiwicGFnZXMvd2lkZ2V0cy9wYXJhbXMvcGFyYW1zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2JpbmRpbmdzLWRpYWxvZycsIHtcclxuXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjYmluZGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdiaW5kaW5ncycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkFjdGlvbk1peGluKE1vZGFsRWRpdG9yKV0sXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xyXG4iLCJWdWUuY29tcG9uZW50KCd2LWZvcm0nLCB7XHJcblxyXG5cdHByb3BzOiB7XHJcblx0XHRhY3Rpb246IFN0cmluZyxcclxuXHRcdG1ldGhvZDogU3RyaW5nLFxyXG5cdFx0aW5pdDogT2JqZWN0LFxyXG5cdFx0ZG9uZTogRnVuY3Rpb24sXHJcblx0XHRmYWlsOiBGdW5jdGlvbixcclxuXHRcdG1vZGVsOiBPYmplY3QsXHJcblx0fSxcclxuXHJcblx0Ly8gcmVwbGFjZTogZmFsc2UsXHJcblxyXG5cdC8vIHRlbXBsYXRlOiBgXHJcblx0Ly8gXHQ8Zm9ybT5cclxuXHQvLyBcdFx0PHNsb3Q+PC9zbG90PlxyXG5cdC8vIFx0PC9mb3JtPlxyXG5cdC8vIGAsXHJcblxyXG5cdGFjdGl2YXRlOiBmdW5jdGlvbihkb25lKSB7XHJcblxyXG5cdFx0dGhpcy5vcmlnaW5hbCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCkpO1xyXG5cclxuXHRcdCQodGhpcy4kZWwpXHJcblxyXG5cdFx0XHQub24oJ3N1Ym1pdCcsIChlKSA9PiB7XHJcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdHRoaXMuc3VibWl0KCk7XHJcblx0XHRcdH0pXHJcblx0XHRcdC5vbigncmVzZXQnLCAoZSkgPT4ge1xyXG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHR0aGlzLnJlc2V0KCk7XHJcblx0XHRcdH0pXHJcblxyXG5cdFx0ZG9uZSgpO1xyXG5cdH0sXHJcblxyXG5cdGRhdGE6IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdG1vZGVsOiB0aGlzLm1vZGVsXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cdG1ldGhvZHM6IHtcclxuXHJcblx0XHRzdWJtaXQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdFx0Ly8gZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHRcdFx0Ly8gY29uc29sZS5sb2codGhpcy5tb2RlbCk7XHJcblxyXG5cdFx0XHQkLmFqYXgoe1xyXG5cdFx0XHRcdHVybDogdGhpcy5hY3Rpb24sXHJcblx0XHRcdFx0bWV0aG9kOiB0aGlzLm1ldGhvZCxcclxuXHRcdFx0XHRjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcblx0XHRcdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbClcclxuXHRcdFx0fSlcclxuXHRcdFx0LmRvbmUoKGQpID0+IHtcclxuXHRcdFx0XHRpZiAoZG9uZSBpbiB0aGlzKSB0aGlzLmRvbmUoZCk7XHJcblx0XHRcdH0pXHJcblx0XHRcdC5mYWlsKGZ1bmN0aW9uKGUpIHsgaWYgKGZhaWwgaW4gdGhpcykgdGhpcy5mYWlsKGUpOyB9LmJpbmQodGhpcykpXHJcblx0XHR9LFxyXG5cclxuXHRcdHJlc2V0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCB0aGlzLm9yaWdpbmFsKTtcclxuXHRcdH1cclxuXHR9LFxyXG59KTsiLCIoZnVuY3Rpb24oJCwgVnVlLCB1bmRlZmluZWQpIHtcclxuXHJcblx0Ly8gdmFyIG1vZGVsID0ge1xyXG5cdC8vIFx0bGlzdDogW11cclxuXHQvLyB9O1xyXG5cdC8vXHJcblx0Ly8gdmFyIGJvZHkgPSBWdWUuZXh0ZW5kKHtcclxuXHQvLyBcdGNyZWF0ZWQ6IGZ1bmN0aW9uKCkgIHsgdGhpcy4kZGlzcGF0Y2goJ3JlZ2lzdGVyLWJvZHknLCB0aGlzKSB9LFxyXG5cdC8vIH0pO1xyXG5cclxuXHRWdWUuY29tcG9uZW50KCdncmlkLXRhYmxlJywge1xyXG5cclxuXHRcdHJlcGxhY2U6IGZhbHNlLFxyXG5cclxuXHRcdHByb3BzOiB7XHJcblx0XHRcdGQ6IEFycmF5XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG5cdFx0Ly8gXHRyZXR1cm4ge1xyXG5cdFx0Ly8gXHRcdGl0ZW1zOiB0aGlzLmQuc2xpY2UoMClcclxuXHRcdC8vIFx0fVxyXG5cdFx0Ly8gfSxcclxuXHJcblx0XHRtZXRob2RzOiB7XHJcblxyXG5cdFx0XHRhZGQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCdhc2Rhc2QnKTtcclxuXHRcdFx0XHR0aGlzLml0ZW1zLnB1c2goe30pO1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKHRoaXMuaXRlbXMpO1xyXG5cdFx0XHR9LFxyXG5cclxuXHRcdFx0cmVtb3ZlOiBmdW5jdGlvbihpbmRleCkge1xyXG5cdFx0XHRcdHRoaXMuaXRlbXMuc3BsaWNlKGluZGV4LCAxKTtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHR9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlKTtcclxuIiwiVnVlLmNvbXBvbmVudCgnaW5saW5lLXRleHQnLFxyXG5cdFZ1ZS5leHRlbmQoe1xyXG5cdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnIF0sXHJcblx0XHR0ZW1wbGF0ZTogYFxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxyXG5cdFx0XHRcdDxpbnB1dCBjbGFzcz1cImlubGluZS1jb250cm9sXCIgdHlwZT1cInRleHRcIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiIC8+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0YFxyXG5cdH0pXHJcbik7XHJcblxyXG5WdWUuY29tcG9uZW50KCdpbmxpbmUtY2hlY2tib3gnLFxyXG5cdFZ1ZS5leHRlbmQoe1xyXG5cdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnIF0sXHJcblx0XHR0ZW1wbGF0ZTogYFxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxyXG5cdFx0XHRcdDxpbnB1dCBjbGFzcz1cImlubGluZS1jaGVja2JveFwiIHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCIgLz5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRgXHJcblx0fSlcclxuKTtcclxuXHJcblZ1ZS5jb21wb25lbnQoJ2lubGluZS1zZWxlY3QnLFxyXG5cdFZ1ZS5leHRlbmQoe1xyXG5cdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnLCAnb3B0aW9ucycgXSxcclxuXHRcdHRlbXBsYXRlOiBgXHJcblx0XHRcdDxkaXYgY2xhc3M9XCJpbmxpbmUtY29udGFpbmVyXCI+XHJcblx0XHRcdFx0PHNlbGVjdCBjbGFzcz1cImlubGluZS1jb250cm9sMVwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCI+XHJcblx0XHRcdFx0XHQ8b3B0aW9uIHYtZm9yPVwib3B0aW9uIGluIG9wdGlvbnNcIiB2YWx1ZT1cInt7IG9wdGlvbi5rZXkgfX1cIj57eyBvcHRpb24udmFsdWUgfX08L29wdGlvbj5cclxuXHRcdFx0XHQ8L3NlbGVjdD5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRgXHJcblx0fSlcclxuKTtcclxuXHJcblZ1ZS5jb21wb25lbnQoJ2lubGluZS12YWx1ZScsXHJcblx0VnVlLmV4dGVuZCh7XHJcblx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScsICdjbGFzcycgXSxcclxuXHRcdHRlbXBsYXRlOiBgXHJcblx0XHRcdDxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIiAvPlxyXG5cdFx0XHQ8c3BhbiA6Y2xhc3M9XCJjbGFzc1wiPnt7IHZhbHVlIH19PC9zcGFuPlxyXG5cdFx0YFxyXG5cdH0pXHJcbik7XHJcbiIsIlZ1ZS5jb21wb25lbnQoJ21vZGFsJywge1xyXG5cclxuICAgIHByb3BzOiB7XHJcbiAgICAgICAgaWQ6IFN0cmluZyxcclxuICAgICAgICBjdXJyZW50OiBPYmplY3QsXHJcbiAgICAgICAgb3JpZ2luYWw6IE9iamVjdCxcclxuICAgIH0sXHJcblxyXG4gICAgbWV0aG9kczoge1xyXG5cclxuICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goJ3N1Ym1pdCcsIHRoaXMuY3VycmVudCk7XHJcbiAgICAgICAgICAgIC8vIE9iamVjdC5hc3NpZ24odGhpcy5vcmlnaW5hbCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmN1cnJlbnQpKSk7XHJcbiAgICAgICAgICAgICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goJ3Jlc2V0JywgdGhpcy5jdXJyZW50KTtcclxuICAgICAgICAgICAgLy8gT2JqZWN0LmFzc2lnbih0aGlzLmN1cnJlbnQsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5vcmlnaW5hbCkpKTtcclxuICAgICAgICAgICAgJChlLnRhcmdldCkuY2xvc2VzdCgnLm1vZGFsJykubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG4iLCJWdWUuZGlyZWN0aXZlKCdjb21ibycsIHtcclxuXHJcblx0YmluZDogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdGlmICgkLmZuLnRhZ3NpbnB1dCkge1xyXG5cclxuXHRcdFx0JCh0aGlzLmVsKS5zZWxlY3QyKHtcclxuXHRcdFx0XHR0YWdzOiB0cnVlLFxyXG5cdFx0XHRcdG11bHRpcGxlOiBmYWxzZSxcclxuXHRcdFx0XHRjcmVhdGVUYWc6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuXHRcdFx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0XHRcdGlkOiBwYXJhbXMudGVybSxcclxuXHRcdFx0XHRcdFx0dGV4dDogcGFyYW1zLnRlcm0sXHJcblx0XHRcdFx0XHRcdG5ld09wdGlvbjogdHJ1ZVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0dXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XHJcblx0fSxcclxuXHR1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHR9XHJcbn0pO1xyXG4iLCJWdWUuZGlyZWN0aXZlKCdkYXRlJywge1xyXG5cclxuXHRiaW5kOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRcclxuXHRcdGlmICgkLmZuLmRhdGVwaWNrZXIpIHtcclxuXHJcblx0XHRcdCQodGhpcy5lbCkuZGF0ZXBpY2tlcih7XHJcblx0XHRcdFx0YXV0b2Nsb3NlOiB0cnVlLFxyXG5cdFx0XHRcdHRvZGF5SGlnaGxpZ2h0OiB0cnVlLFxyXG5cdFx0XHRcdGZvcm1hdDogXCJ5eXl5LW1tLWRkXCJcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHR1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuXHR9LFxyXG5cdHVuYmluZDogZnVuY3Rpb24gKCkge1xyXG5cdH1cclxufSk7XHJcbiIsIlZ1ZS5kaXJlY3RpdmUoJ3RhZ3MnLCB7XHJcblxyXG5cdGJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRpZiAoJC5mbi50YWdzaW5wdXQpIHtcclxuXHJcblx0XHRcdCQodGhpcy5lbCkudGFnc2lucHV0KHtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHR1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuXHR9LFxyXG5cdHVuYmluZDogZnVuY3Rpb24gKCkge1xyXG5cdH1cclxufSk7XHJcbiIsIlZ1ZS5maWx0ZXIoJ3RlbXBsYXRlJywgZnVuY3Rpb24gKHN0cmluZywgZGF0YSkge1xyXG5cclxuXHR2YXIgcmUgPSAvJHsoW159XSspfS9nO1xyXG5cdHJldHVybiBzdHJpbmcucmVwbGFjZShyZSwgZnVuY3Rpb24obWF0Y2gsIGtleSkge1xyXG5cdFx0cmV0dXJuIGRhdGFba2V5XTtcclxuXHR9KTtcclxufSk7XHJcblxyXG5WdWUuZmlsdGVyKCdhc3NpZ24nLCBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UxLCBzb3VyY2UyLCBzb3VyY2UzKSB7XHJcblxyXG5cdHJldHVybiBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlMSwgc291cmNlMiwgc291cmNlMyk7XHJcbn0pO1xyXG5cclxuVnVlLmZpbHRlcignY29weScsIGZ1bmN0aW9uIChzb3VyY2UpIHtcclxuXHJcblx0cmV0dXJuIG5ldyBWdWUoe1xyXG5cdFx0ZGF0YTogc291cmNlICE9IG51bGxcclxuXHRcdFx0PyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNvdXJjZSkpXHJcblx0XHRcdDogbnVsbFxyXG5cdH0pLiRkYXRhO1xyXG59KTtcclxuXHJcblZ1ZS5maWx0ZXIoJ2Nsb25lJywgZnVuY3Rpb24gKHNvdXJjZSkge1xyXG5cclxuXHRyZXR1cm4gbmV3IFZ1ZSh7XHJcblx0XHRkYXRhOiBzb3VyY2UgIT0gbnVsbFxyXG5cdFx0XHQ/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc291cmNlKSlcclxuXHRcdFx0OiBudWxsXHJcblx0fSkuJGRhdGE7XHJcbn0pO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgdmFyIExpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJyldLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdkb21haW5zJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zJyxcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICB2YXIgU2V0dGluZ3NMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLXNldHRpbmdzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTZXR0aW5nc01vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtc2V0dGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNldHRpbmdzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTZXR0aW5nc0xpc3RWaWV3ZXIsIFNldHRpbmdzTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLXNldHRpbmdzJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIihmdW5jdGlvbigkKSB7XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcG9zaXRpb24oZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIG1vZGFsID0gJChlbGVtZW50KSxcclxuICAgICAgICAgICAgICAgIGRpYWxvZyA9ICQoJy5tb2RhbC1kaWFsb2cnLCBtb2RhbCk7XHJcblxyXG4gICAgICAgICAgICBtb2RhbC5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgZGlhbG9nLmNzcyhcIm1hcmdpbi10b3BcIiwgTWF0aC5tYXgoMCwgKCQod2luZG93KS5oZWlnaHQoKSAtIGRpYWxvZy5oZWlnaHQoKSkgLyAyKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkKCQoZG9jdW1lbnQpLCAnLm1vZGFsLm1vZGFsLWNlbnRlcicpLm9uKCdzaG93LmJzLm1vZGFsJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICByZXBvc2l0aW9uKGUudGFyZ2V0KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcclxuXHJcbiAgICB2YXIgTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJyldLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMnLFxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBTZXR0aW5nc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc2V0dGluZ3MtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zZXR0aW5ncy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU2V0dGluZ3NNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zZXR0aW5ncy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc2V0dGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNldHRpbmdzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNldHRpbmdzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU2V0dGluZ3NMaXN0Vmlld2VyLCBTZXR0aW5nc01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc2V0dGluZ3MnLFxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBNZXRhc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtbWV0YXMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1tZXRhcy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgTWV0YXNNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1tZXRhcy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtbWV0YXMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIE1ldGFzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLW1ldGFzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTWV0YXNMaXN0Vmlld2VyLCBNZXRhc01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtbWV0YXMnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgdW5kZWZpbmVkKTtcclxuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSkge1xyXG5cclxuICAgIHZhciBMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignbWFpbicpXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcycsXHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgdmFyIFNldHRpbmdzTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLXNldHRpbmdzLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1zZXR0aW5ncy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU2V0dGluZ3NNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLXNldHRpbmdzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLXNldHRpbmdzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTZXR0aW5nc0VkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLXNldHRpbmdzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU2V0dGluZ3NMaXN0Vmlld2VyLCBTZXR0aW5nc01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1zZXR0aW5ncycsXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xyXG4iLCJTaGVsbCA9IHdpbmRvdy5TaGVsbCB8fCB7fTtcclxuU2hlbGwuU2VydmljZXMgPSB3aW5kb3cuU2hlbGwuU2VydmljZXMgfHwge307XHJcblxyXG4oZnVuY3Rpb24oJCwgVnVlLCBTaGVsbCwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2VydmljZS1sYXlvdXQnLCB7XHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgU2hlbGwuU2VydmljZXMuTGF5b3V0ID1cclxuICAgICAgICAgICAgbmV3IFZ1ZSh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2V0V2lkZ2V0OiBmdW5jdGlvbihpZCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxmLnNldHRpbmdzLndpZGdldHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3ID0gc2VsZi5zZXR0aW5ncy53aWRnZXRzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHcuaWQgPT0gaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlc3Ryb3llZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIFNoZWxsLlNlcnZpY2VzLkxheW91dCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NldHRpbmdzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzZXR0aW5ncy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2RvbWFpbnMnKV0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NldHRpbmdzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuQWN0aW9uTWl4aW4oTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgcHVzaDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9zZXR0aW5ncy9kby11cGRhdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKSxcclxuICAgICAgICAgICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmRvbmUoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIGQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcHVsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9zZXR0aW5ncycsXHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZG9uZSgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgZCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgdW5kZWZpbmVkKTtcclxuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBzZWxlY3Rpb246IE9iamVjdCxcclxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nbG9iYWxzID0ge1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uOiB0aGlzLnNlbGVjdGlvbixcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzLFxyXG4gICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWwsXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiByZWxldmFudChjdXJyZW50LCBjb2xsZWN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFjdXJyZW50IHx8IGN1cnJlbnQuX2FjdGlvbiA9PSAncmVtb3ZlJyB8fCAoY29sbGVjdGlvbiAmJiBjb2xsZWN0aW9uLmluZGV4T2YoY3VycmVudCkgPCAwKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29sbGVjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbGxlY3Rpb24ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjID0gY29sbGVjdGlvbltpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjLl9hY3Rpb24gIT0gJ3JlbW92ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQgJiYgY3VycmVudC5fYWN0aW9uID09ICdyZW1vdmUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdzZXR0aW5ncy5jYXRlZ29yaWVzJywgKGNhdGVnb3JpZXMpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgY2F0ZWdvcnkgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhdGVnb3JpZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdWIgPSBjYXRlZ29yaWVzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYXRlZ29yaWVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnkgPSBzdWIuY2F0ZWdvcmllc1swXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5jYXRlZ29yeSA9IGNhdGVnb3J5O1xyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ21vZGVsLmRvbWFpbnMnLCAoZG9tYWlucykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb24uZG9tYWluID0gcmVsZXZhbnQodGhpcy5zZWxlY3Rpb24uZG9tYWluLCBkb21haW5zKTtcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdtb2RlbC5wYWdlcycsIChwYWdlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb24ucGFnZSA9IHJlbGV2YW50KHRoaXMuc2VsZWN0aW9uLnBhZ2UsIHBhZ2VzKTtcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdzZWxlY3Rpb24ucGFnZS5zb3VyY2VzJywgKHNvdXJjZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLnNvdXJjZSA9IHJlbGV2YW50KHRoaXMuc2VsZWN0aW9uLnNvdXJjZSwgc291cmNlcyk7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhzb3VyY2VzLCB0aGlzLnNlbGVjdGlvbi5zb3VyY2UpO1xyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgICAgIGdldFdpZGdldDogZnVuY3Rpb24oaWQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2V0dGluZ3Mud2lkZ2V0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB3ID0gdGhpcy5zZXR0aW5ncy53aWRnZXRzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3LmlkID09IGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB3O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIC8vIHNlbGVjdFBhZ2U6IGZ1bmN0aW9uKHBhZ2UpIHtcclxuICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgLy8gICAgIHRoaXMuc2VsZWN0aW9uLnBhZ2UgPSBwYWdlO1xyXG4gICAgICAgICAgICAvLyAgICAgdGhpcy5zZWxlY3Rpb24uc291cmNlID0gbnVsbDtcclxuICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgLy8gICAgIHZhciBkYXRhID0ge307XHJcbiAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgIC8vICAgICAvLyBUT0RPINCh0LTQtdC70LDRgtGMINC30LDQv9GA0L7RgdGLXHJcbiAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgIC8vICAgICBpZiAocGFnZSAmJiBwYWdlLnNvdXJjZXMpIHtcclxuICAgICAgICAgICAgLy8gICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhZ2Uuc291cmNlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICB2YXIgcyA9IHBhZ2Uuc291cmNlc1tpXTtcclxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgZGF0YVtzLm5hbWVdID0gW1xyXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgeyBvbmU6IDExLCB0d286IDEyIH0sXHJcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICB7IG9uZTogMjEsIHR3bzogMjIgfSxcclxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgIHsgb25lOiAzMSwgdHdvOiAzMiB9LFxyXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgeyBvbmU6IDQxLCB0d286IDQyIH0sXHJcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIC8vICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAvLyAgICAgdGhpcy5nbG9iYWxzLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgICAgICAvLyB9LFxyXG5cclxuICAgICAgICAgICAgc2VsZWN0U291cmNlOiBmdW5jdGlvbihzb3VyY2UpIHtcclxuXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBldmVudHM6IHtcclxuICAgICAgICAgICAgcHVsbDogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvc2V0dGluZ3MnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmRvbmUoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIGQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcHVzaDogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvc2V0dGluZ3MvZG8tdXBkYXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5kb25lKChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBkKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRyZWU6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZWxlY3RDYXRlZ29yeTogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb24uY2F0ZWdvcnkgPSBkYXRhLml0ZW07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNlbGVjdERvbWFpbjogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb24uZG9tYWluID0gZGF0YS5pdGVtO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZWxlY3RQYWdlOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5wYWdlID0gZGF0YS5pdGVtO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZWxlY3RTb3VyY2U6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLnNvdXJjZSA9IGRhdGEuaXRlbTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCB1bmRlZmluZWQpO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgdmFyIExpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnd2lkZ2V0cy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3dpZGdldHMtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3dpZGdldHMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3dpZGdldHMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCd3aWRnZXRzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyN3aWRnZXRzJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcclxuXHJcbiAgICB2YXIgU291cmNlc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNvdXJjZXNNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIGNoZWNrOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjaGVjaycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNvdXJjZXNFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFNvdXJjZXNMaXN0Vmlld2VyLCBTb3VyY2VzTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzJyxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTb3VyY2VzUGFyYW1zTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLXBhcmFtcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTb3VyY2VzUGFyYW1zTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1wYXJhbXMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTb3VyY2VzUGFyYW1zRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMtcGFyYW1zJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU291cmNlc1BhcmFtc0xpc3RWaWV3ZXIsIFNvdXJjZXNQYXJhbXNNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIlNoZWxsID0gd2luZG93LlNoZWxsIHx8IHt9O1xyXG5TaGVsbC5XaWRnZXRzID0gd2luZG93LlNoZWxsLldpZGdldHMgfHwge307XHJcblxyXG4oZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgdmFyIFdpZGdldHNMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIGdldFdpZGdldDogZnVuY3Rpb24odykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdsb2JhbHMud2lkZ2V0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB3aWRnZXQgPSB0aGlzLmdsb2JhbHMud2lkZ2V0c1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAody50eXBlID09IHdpZGdldC5pZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gd2lkZ2V0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFdpZGdldHNNb2RhbEVkaXRvciA9IFNoZWxsLldpZGdldHMuTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2RhdGEnKV0sXHJcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHNbaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW0gPSB0aGlzLmN1cnJlbnQucGFyYW1zW3Byb3AubmFtZV0gPSB0aGlzLmN1cnJlbnQucGFyYW1zW3Byb3AubmFtZV0gfHwge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgYmluZGluZzogbnVsbFxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgcGFyYW0uX2FjdGlvbiA9IHBhcmFtLl9hY3Rpb24gPT0gJ3VwZGF0ZSdcclxuICAgICAgICAgICAgICAgICAgICA/ICd1cGRhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgOiAnY3JlYXRlJ1xyXG4gICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb3A6IHByb3AsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyYW06IHBhcmFtLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLml0ZW1zID0gaXRlbXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuY29udGV4dCxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLml0ZW1zLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG5cclxuICAgICAgICAgICAgaGFzUHJvcHM6IGZ1bmN0aW9uKHRhYikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29udGV4dC53aWRnZXQgJiYgdGhpcy5jb250ZXh0LndpZGdldC5wcm9wcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZXh0LndpZGdldC5wcm9wcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wLnRhYiA9PSB0YWIpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBXaWRnZXRzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihXaWRnZXRzTGlzdFZpZXdlciwgV2lkZ2V0c01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3RcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgICAgIHByb3RvOiBmdW5jdGlvbih3aWRnZXQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiB3aWRnZXQuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtcyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgd2lkZ2V0LnByb3BzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9wID0gd2lkZ2V0LnByb3BzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtc1twcm9wLm5hbWVdID0gcHJvcC50eXBlICE9ICdtdWx0aXBsZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiAnY3JlYXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmluZGluZzogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRpbmc6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZGF0YS5wYXJhbXMgPSBwYXJhbXM7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwsIHVuZGVmaW5lZCk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtYnJhbmQnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtYnJhbmQnLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtYWN0aW9ucycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1hY3Rpb25zJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxyXG4gICAgICAgICAgICBjYXRlZ29yeTogT2JqZWN0LFxyXG4gICAgICAgICAgICBkb21haW46IE9iamVjdCxcclxuICAgICAgICAgICAgcGFnZTogT2JqZWN0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUpO1xyXG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWNhdGVnb3JpZXMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtY2F0ZWdvcmllcycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgY2F0ZWdvcmllczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGl0ZW0sIGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtY29udGFpbmVyJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWNvbnRhaW5lcicsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5nbG9iYWxzLCB0aGlzLnNldHRpbmdzLCB0aGlzLnBhZ2UsIHRoaXMuY2F0ZWdvcnkpO1xyXG4gICAgICAgICAgICAvLyByZXR1cm4ge1xyXG4gICAgICAgICAgICAvLyAgICAgcGFnZTogdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5wYWdlXHJcbiAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAvLyB9LFxyXG4gICAgICAgIC8vIHJlYWR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyAgICAgY29uc29sZS5sb2codGhpcy5nbG9iYWxzLCB0aGlzLnNldHRpbmdzLCB0aGlzLnBhZ2UpO1xyXG4gICAgICAgIC8vIH1cclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUpO1xyXG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRvbWFpbnMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZG9tYWlucycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZG9tYWluczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIlNoZWxsID0gd2luZG93LlNoZWxsIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIGZ1bmN0aW9uIHN0dWIodGl0bGUsIHN1YnRpdGxlKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdHlwZTogJ05UUjFYRGVmYXVsdEJ1bmRsZS9TdHViJyxcclxuICAgICAgICAgICAgX2FjdGlvbjogJ2lnbm9yZScsXHJcbiAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6IHsgdmFsdWU6IHRpdGxlIH0sXHJcbiAgICAgICAgICAgICAgICBzdWJ0aXRsZTogeyB2YWx1ZTogc3VidGl0bGUgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBEZWNvcmF0b3JNaXhpbiA9IHtcclxuXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgICAgIHJlbW92ZVdpZGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaCgncmVtb3ZlQ2hpbGRXaWRnZXQnLCB7IGl0ZW06IHRoaXMubW9kZWwgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBkb0FwcGx5OiBmdW5jdGlvbihtb2RlbCkge1xyXG5cclxuICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShtb2RlbCkpLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogdGhpcy5tb2RlbC5fYWN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy5tb2RlbC5fYWN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogJ3VwZGF0ZSdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIHNob3dTZXR0aW5nczogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGRpYWxvZyA9IG5ldyBTaGVsbC5XaWRnZXRzLk1vZGFsRWRpdG9yKHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxzOiB0aGlzLmdsb2JhbHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQ6IHRoaXMud2lkZ2V0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiB0aGlzLm1vZGVsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpKVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3duZXIuZG9BcHBseSh0aGlzLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSkuJG1vdW50KCkuJGFwcGVuZFRvKCQoJ2JvZHknKS5nZXQoMCkpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBCaW5kaW5nc01peGluID0ge1xyXG5cclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGJpbmRpbmdzOiB0aGlzLmJpbmRpbmdzLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcmVjdXIocGFyYW1zKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0ge307XHJcbiAgICAgICAgICAgICAgICBmb3IodmFyIGtleSBpbiBwYXJhbXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW1zW2tleV1bJ2JpbmRpbmcnXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVtrZXldID0gc2VsZi4kaW50ZXJwb2xhdGUocGFyYW1zW2tleV1bJ2JpbmRpbmcnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICgkLmlzQXJyYXkocGFyYW1zW2tleV1bJ3ZhbHVlJ10pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlW2tleV0gPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHBhcmFtc1trZXldWyd2YWx1ZSddLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVtrZXldW2ldID0gcmVjdXIocGFyYW1zW2tleV1bJ3ZhbHVlJ11baV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVba2V5XSA9IHBhcmFtc1trZXldWyd2YWx1ZSddO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdkYXRhJywgKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmluZGluZ3MgPSByZWN1cih0aGlzLm1vZGVsLnBhcmFtcyk7XHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ21vZGVsJywgKG1vZGVsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJpbmRpbmdzID0gcmVjdXIobW9kZWwucGFyYW1zKTtcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgQ29tcG9zaXRlTWl4aW4gPSB7XHJcblxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IHRoaXMuY2hpbGRyZW4sXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnaXRlbXMnLCAoaXRlbXMpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBbXTtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBpdGVtc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uX2FjdGlvbiAhPSAncmVtb3ZlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnN0dWIoKSkpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGV2ZW50czoge1xyXG5cclxuICAgICAgICAgICAgcmVtb3ZlQ2hpbGRXaWRnZXQ6IGZ1bmN0aW9uKGRhdGEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IGRhdGEuaXRlbTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5fYWN0aW9uID09ICdjcmVhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcy4kcmVtb3ZlKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLl9hY3Rpb24gPSAncmVtb3ZlJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zID0gdGhpcy5pdGVtcy5zbGljZSgpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBTb3J0YWJsZU1peGluID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGZpbmQoY2hpbGRyZW4sIGRvbUluZGV4KSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSAwO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aCAmJiBpbmRleCA8IGRvbUluZGV4OyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQuX2FjdGlvbiAhPSAncmVtb3ZlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBpbmRleDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcblxyXG4gICAgICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkOiB0aGlzLnNlbGVjdGVkLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdzZWxlY3RlZCcsIGZ1bmN0aW9uKHNlbGVjdGVkKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zb3J0YWJsZSA9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFNvcnRhYmxlLmNyZWF0ZSgkKHNlbGVjdG9yLCBzZWxmLiRlbCkuZ2V0KDApLCB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnd2lkZ2V0cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVsbDogJ2Nsb25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IDE1MCxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkFkZDogZnVuY3Rpb24gKGV2dCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFsZXR0ZSA9ICQoZXZ0Lml0ZW0pLmNsb3Nlc3QoJy5nZS5nZS1wYWxldHRlJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3ID0gJChldnQuaXRlbSkuZGF0YSgnd2lkZ2V0Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXBhbGV0dGUubGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGV2dC5pdGVtKS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuaSA9IGZpbmQoc2VsZi5pdGVtcywgZXZ0Lm5ld0luZGV4KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3aWRnZXQgPSBzZWxmLiRyb290LiRyZWZzLnNoZWxsLmdldFdpZGdldCh3KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuaXRlbXMuc3BsaWNlKG5pLCAwLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB3aWRnZXQuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogJ2NyZWF0ZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHdpZGdldC5wYXJhbXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkod2lkZ2V0LnBhcmFtcykpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0czogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiAnY3JlYXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRyYWdnZWQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2dWU6IGV2dC5mcm9tLl9fZHJhZ2dlZF9fLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogJCgnLmdlLmdlLXdpZGdldCcsIGV2dC5pdGVtKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lOiAkKCcuZ2UuZ2Utd2lkZ2V0JywgZXZ0LmNsb25lKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb250YWluZXIgPSAkKGV2dC50bykuY2xvc2VzdCgnLmdlLmdlLXdpZGdldCcpLmdldCgwKS5fX3Z1ZV9fO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5pID0gZmluZChzZWxmLml0ZW1zLCBldnQubmV3SW5kZXgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0l0ZW0gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRyYWdnZWQudnVlLm1vZGVsKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0l0ZW0uX2FjdGlvbiA9ICdjcmVhdGUnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgbmV3SXRlbS5yZXNvdXJjZS5pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG5ld0l0ZW0uaWQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2VkLml0ZW0ucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuaXRlbXMuc3BsaWNlKG5pLCAwLCBuZXdJdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLml0ZW1zID0gY29udGFpbmVyLml0ZW1zLnNsaWNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblN0YXJ0OiBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZ0LmZyb20uX19kcmFnZ2VkX18gPSAkKCcuZ2UuZ2Utd2lkZ2V0JywgZXZ0Lml0ZW0pLmdldCgwKS5fX3Z1ZV9fO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblJlbW92ZTogZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRyYWdnZWQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZ1ZTogZXZ0LmZyb20uX19kcmFnZ2VkX18sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06ICQoJy5nZS5nZS13aWRnZXQnLCBldnQuaXRlbSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lOiAkKCcuZ2UuZ2Utd2lkZ2V0JywgZXZ0LmNsb25lKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RhY2sgPSAgZHJhZ2dlZC52dWUuJHBhcmVudC4kcGFyZW50LiRwYXJlbnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnZWQuY2xvbmUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkcmFnZ2VkLnZ1ZS5tb2RlbC5fYWN0aW9uID09ICdjcmVhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrLml0ZW1zLiRyZW1vdmUoZHJhZ2dlZC52dWUubW9kZWwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnZWQudnVlLm1vZGVsLl9hY3Rpb24gPSAncmVtb3ZlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrLml0ZW1zID0gc3RhY2suaXRlbXMuc2xpY2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25VcGRhdGU6IGZ1bmN0aW9uIChldnQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9pID0gc2VsZi5pdGVtcy5pbmRleE9mKGV2dC5mcm9tLl9fZHJhZ2dlZF9fLm1vZGVsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmkgPSBmaW5kKHNlbGYuaXRlbXMsIGV2dC5uZXdJbmRleCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvaSAhPSBuaSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLml0ZW1zLnNwbGljZShuaSwgMCwgc2VsZi5pdGVtcy5zcGxpY2Uob2ksIDEpWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pdGVtcyA9IHNlbGYuaXRlbXMuc2xpY2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRW5kOiBmdW5jdGlvbiAoZXZ0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBldnQuZnJvbS5fX2RyYWdnZWRfXztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5zb3J0YWJsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zb3J0YWJsZS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNvcnRhYmxlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWVcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0VGFyZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgdW5zZWxlY3RUYXJnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1kZWNvcmF0b3Itc3R1YicsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kZWNvcmF0b3Itc3R1YicsXHJcbiAgICAgICAgbWl4aW5zOiBbIERlY29yYXRvck1peGluLCBCaW5kaW5nc01peGluIF0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcclxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcclxuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3QsXHJcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxyXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci13aWRnZXQnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZGVjb3JhdG9yLXdpZGdldCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIERlY29yYXRvck1peGluLCBCaW5kaW5nc01peGluIF0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcclxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcclxuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3QsXHJcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxyXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci1ob3Jpc29udGFsJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWRlY29yYXRvci1ob3Jpc29udGFsJyxcclxuICAgICAgICBtaXhpbnM6IFsgRGVjb3JhdG9yTWl4aW4sIENvbXBvc2l0ZU1peGluLCBTb3J0YWJsZU1peGluKCc+LmdlLmdlLWNvbnRlbnQgPi53Zy53Zy1kZWZhdWx0LXN0YWNrID4ud2cud2ctY29udGVudCA+LndnLndnLXRhYmxlID4ud2cud2ctcm93JyksIEJpbmRpbmdzTWl4aW4gXSxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxyXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxyXG4gICAgICAgICAgICB3aWRnZXQ6IE9iamVjdCxcclxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXHJcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgc3R1YjogZnVuY3Rpb24oKSB7IHJldHVybiBzdHViKCdIb3Jpc29udGFsIFN0YWNrJywgJ0Ryb3AgSGVyZScpOyB9XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci12ZXJ0aWNhbCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kZWNvcmF0b3ItdmVydGljYWwnLFxyXG4gICAgICAgIG1peGluczogWyBEZWNvcmF0b3JNaXhpbiwgQ29tcG9zaXRlTWl4aW4sIFNvcnRhYmxlTWl4aW4oJz4uZ2UuZ2UtY29udGVudCA+LndnLndnLWRlZmF1bHQtc3RhY2sgPi53Zy53Zy1jb250ZW50ID4ud2cud2ctdGFibGUnKSwgQmluZGluZ3NNaXhpbiBdLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RhY2s6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXHJcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0LFxyXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcclxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBzdHViOiBmdW5jdGlvbigpIHsgcmV0dXJuIHN0dWIoJ1ZlcnRpY2FsIFN0YWNrJywgJ0Ryb3AgSGVyZScpOyB9XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci1jYW52YXMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZGVjb3JhdG9yLWNhbnZhcycsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvbXBvc2l0ZU1peGluLCBTb3J0YWJsZU1peGluKCc+LmdlLmdlLWNvbnRlbnQgPi53Zy53Zy1kZWZhdWx0LXN0YWNrID4ud2cud2ctY29udGVudCA+LndnLndnLXRhYmxlJykgXSxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxyXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcclxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBzdHViOiBmdW5jdGlvbigpIHsgcmV0dXJuIHN0dWIoJ1ZlcnRpY2FsIFN0YWNrJywgJ0Ryb3AgSGVyZScpOyB9XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcclxuIiwiXHJcblxyXG4oZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wYWdlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXBhZ2UnLFxyXG4gICAgICAgIG1peGluczogWyAvKkNvcmUuQ29udGFpbmVyTWl4aW4sIENvcmUuU29ydGFibGVNaXhpbiovIF0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGRlY29yYXRvcjogdGhpcy5kZWNvcmF0b3IsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB0aGlzLmRhdGEsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWFkeTogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmRlY29yYXRvciA9ICdzaGVsbC1kZWNvcmF0b3ItY2FudmFzJztcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0ge307XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgncGFnZS5zb3VyY2VzJywgKHNvdXJjZXMpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc291cmNlcykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZXMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzID0gc291cmNlc1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBxdWVyeSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHMucGFyYW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyYW0gPSBzLnBhcmFtc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbS5pbiA9PSAncXVlcnknICYmIHBhcmFtLnNwZWNpZmllZCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBwYXJhbS5iaW5kaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy4kaW50ZXJwb2xhdGUocGFyYW0uYmluZGluZykgLy8gVE9ETyBJbnRlcnBvbGF0ZSBpbiBwYWdlIGNvbnRleHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBwYXJhbS52YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlbcGFyYW0ubmFtZV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogcy5tZXRob2QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHMudXJsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcXVlcnksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5kb25lKChkKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdkYXRhLicgKyBzLm5hbWUsIGQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9iamVjdC5hc3NpZ24odGhpcy5kYXRhLCBleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5kYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXBhZ2VzJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXBhZ2VzJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBwYWdlczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgdmFyIFBhbGV0dGVJdGVtID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXBhbGV0dGUtaXRlbScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wYWxldHRlLWl0ZW0nLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb21wdXRlZDoge1xyXG4gICAgICAgICAgICB0aHVtYm5haWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICcvYnVuZGxlcy8nICsgdGhpcy53aWRnZXQucHJvdmlkZXIuYWxpYXMgKyAnLycgKyB0aGlzLndpZGdldC50aHVtYm5haWwucGF0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS5jcmVhdGUodGhpcy4kZWwsIHtcclxuICAgICAgICAgICAgICAgIGdyb3VwOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3dpZGdldHMnLFxyXG4gICAgICAgICAgICAgICAgICAgIHB1bGw6ICdjbG9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHV0OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogMTUwLFxyXG4gICAgICAgICAgICAgICAgc29ydDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAvLyBvblN0YXJ0OiBmdW5jdGlvbihldnQpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhldnQpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICQoZXZ0Lml0ZW0pLmh0bWwoJzxiPkRhdGE8L2I+Jyk7XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAvLyBzZXREYXRhOiBmdW5jdGlvbiAoZGF0YVRyYW5zZmVyLCBkcmFnRWwpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhkcmFnRWwpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICQoZHJhZ0VsKS5odG1sKCc8Yj5IZWxsbzwvYj4nKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBkYXRhVHJhbnNmZXIuc2V0RGF0YSgnVGV4dCcsIGRyYWdFbC50ZXh0Q29udGVudCk7XHJcbiAgICAgICAgICAgICAgICAvLyB9LFxyXG4gICAgICAgICAgICAgICAgLy8gc2V0RGF0YTogZnVuY3Rpb24oZGF0YVRyYW5zZmVyLCBkcmFnRWwpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICBkYXRhVHJhbnNmZXIuc2V0RGF0YSgnVGV4dCcsIGRyYWdFbC50ZXh0Q29udGVudCk7XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyAkKHRoaXMuJGVsKS5kcmFnZ2FibGUoe1xyXG4gICAgICAgICAgICAvLyAgICAgY29ubmVjdFRvU29ydGFibGU6IFwiLmdlLmdlLXN0YWNrZWRcIixcclxuICAgICAgICAgICAgLy8gICAgIGhlbHBlcjogXCJjbG9uZVwiLFxyXG4gICAgICAgICAgICAvLyAgICAgcmV2ZXJ0OiBcImludmFsaWRcIlxyXG4gICAgICAgICAgICAvLyB9KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wYWxldHRlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXBhbGV0dGUnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBPYmplY3RcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbXBvbmVudHM6IHtcclxuICAgICAgICAgICAgJ3BhbGV0dGUtaXRlbSc6IFBhbGV0dGVJdGVtXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIi8vIChmdW5jdGlvbigkLCBWdWUsIENvcmUsIHVuZGVmaW5lZCkge1xyXG4vL1xyXG4vLyAgICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtc3RhY2tlZCcsIHtcclxuLy8gICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1zdGFja2VkJyxcclxuLy8gICAgICAgICBtaXhpbnM6IFsgQ29yZS5TdGFja2VkIF1cclxuLy8gICAgIH0pO1xyXG4vL1xyXG4vLyB9KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXNvdXJjZXMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtc291cmNlcycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgc291cmNlczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtdGFyZ2V0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXRhcmdldCcsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtc3R1YicsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1zdHViJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlKTtcclxuIiwiU2hlbGwgPSB3aW5kb3cuU2hlbGwgfHwge307XHJcblNoZWxsLldpZGdldHMgPSB3aW5kb3cuU2hlbGwuV2lkZ2V0cyB8fCB7fTtcclxuXHJcbihmdW5jdGlvbigkLCBWdWUsIFNoZWxsLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBTaGVsbC5XaWRnZXQgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtd2lkZ2V0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXdpZGdldCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIC8qIENvcmUuRGVjb3JhdG9yTWl4aW4sIENvcmUuQ29udGFpbmVyTWl4aW4sIENvcmUuU29ydGFibGVNaXhpbiwgQ29yZS5CaW5kaW5nc01peGluICovIF0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXHJcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcclxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5kZWNvcmF0b3JzID0ge1xyXG4gICAgICAgICAgICAgICAgYWx0ZXJuYXRpdmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gJ2RlZmF1bHQtc3RhY2stcGFnZSc6IGZ1bmN0aW9uKCkgeyBPYmplY3QuYXNzaWduKHRoaXMsIHsgc2VsZWN0b3I6ICcud2cud2ctdGFibGUnLCBzdHViOiBzdHViKCdWZXJ0aWNhbCBTdGFjaycsICdEcm9wIEhlcmUnKSB9KSB9LFxyXG4gICAgICAgICAgICAgICAgICAgIC8vICdkZWZhdWx0LXN0YWNrLWhvcmlzb250YWwnOiBmdW5jdGlvbigpIHsgT2JqZWN0LmFzc2lnbih0aGlzLCB7IHNlbGVjdG9yOiAnLndnLndnLXJvdycsIHN0dWI6IHN0dWIoJ0hvcmlzb250YWwgU3RhY2snLCAnRHJvcCBIZXJlJykgfSkgfSxcclxuICAgICAgICAgICAgICAgICAgICAvLyAnZGVmYXVsdC1zdGFjay12ZXJ0aWNhbCc6IGZ1bmN0aW9uKCkgeyBPYmplY3QuYXNzaWduKHRoaXMsIHsgc2VsZWN0b3I6ICcud2cud2ctdGFibGUnLCBzdHViOiBzdHViKCdWZXJ0aWNhbCBTdGFjaycsICdEcm9wIEhlcmUnKSB9KSB9LFxyXG4gICAgICAgICAgICAgICAgICAgICdkZWZhdWx0LXN0YWNrLWhvcmlzb250YWwnOiAnc2hlbGwtZGVjb3JhdG9yLWhvcmlzb250YWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICdkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJzogJ3NoZWxsLWRlY29yYXRvci12ZXJ0aWNhbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2RlZmF1bHQtc3R1Yic6ICdzaGVsbC1kZWNvcmF0b3Itc3R1YicsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZmFsbGJhY2s6ICdzaGVsbC1kZWNvcmF0b3Itd2lkZ2V0J1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLndpZGdldCA9IHRoaXMuJHJvb3QuJHJlZnMuc2hlbGwuZ2V0V2lkZ2V0KHRoaXMubW9kZWwudHlwZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZGVjb3JhdG9yID0gdGhpcy5kZWNvcmF0b3JzLmFsdGVybmF0aXZlc1t0aGlzLndpZGdldC50YWddIHx8IHRoaXMuZGVjb3JhdG9ycy5mYWxsYmFjaztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHdpZGdldDogdGhpcy53aWRnZXQsXHJcbiAgICAgICAgICAgICAgICBkZWNvcmF0b3I6IHRoaXMuZGVjb3JhdG9yLFxyXG4gICAgICAgICAgICAgICAgLy8gaXRlbXM6IHRoaXMud2lkZ2V0cyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgdmFyIFBhcmFtU3RyaW5nID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtcGFyYW1zLXN0cmluZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcy1zdHJpbmcnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGlkOiBTdHJpbmcsXHJcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBQYXJhbVJpY2ggPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1wYXJhbXMtcmljaCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcy1yaWNoJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBpZDogU3RyaW5nLFxyXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgUGFyYW1Tb3VyY2UgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1wYXJhbXMtc291cmNlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMtcGFyYW1zLXNvdXJjZScsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgaWQ6IFN0cmluZyxcclxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtTXVsdGlwbGUgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1wYXJhbXMtbXVsdGlwbGUnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1wYXJhbXMtbXVsdGlwbGUnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGlkOiBTdHJpbmcsXHJcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtLml0ZW1zXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIHJlYWR5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyAgICAgdGhpcy5pdGVtcyA9IFtdO1xyXG4gICAgICAgIC8vIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBQYXJhbXMgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1wYXJhbXMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1wYXJhbXMnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIG93bmVyOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHRhYjogU3RyaW5nLFxyXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICB2YXIgUGFyYW1NdWx0aXBsZUxpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1wYXJhbXMtbXVsdGlwbGUtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcy1tdWx0aXBsZS1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgcHJvcDogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYXJhbTogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgUGFyYW1NdWx0aXBsZU1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtcGFyYW1zLW11bHRpcGxlLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcy1tdWx0aXBsZS1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2RhdGEnKV0sXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtcyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5jb250ZXh0KTtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZXh0LnByb3AucHJvcHMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHRoaXMuY29udGV4dC5wcm9wLnByb3BzW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gdGhpcy5jdXJyZW50W3Byb3AubmFtZV0gPSB0aGlzLmN1cnJlbnRbcHJvcC5uYW1lXSB8fCB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICBwYXJhbS5fYWN0aW9uID0gcGFyYW0uX2FjdGlvbiA9PSAndXBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgID8gJ3VwZGF0ZSdcclxuICAgICAgICAgICAgICAgICAgICA6ICdjcmVhdGUnXHJcbiAgICAgICAgICAgICAgICA7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogcHJvcCxcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbTogcGFyYW0sXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXRlbXMgPSBpdGVtcztcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtTXVsdGlwbGVFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1wYXJhbXMtbXVsdGlwbGUtZWRpdG9yJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oUGFyYW1NdWx0aXBsZUxpc3RWaWV3ZXIsIFBhcmFtTXVsdGlwbGVNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMtcGFyYW1zLW11bHRpcGxlLWVkaXRvcicsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgcHJvcDogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYXJhbTogT2JqZWN0LFxyXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWFkeTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICB2YXIgUGFyYW1zTGlzdCA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLXBhcmFtcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMtcGFyYW1zLWxpc3QnLFxyXG4gICAgICAgIGNvbXBvbmVudHM6IHtcclxuICAgICAgICAgICAgJ3BhcmFtcy1zdHJpbmcnOiBQYXJhbVN0cmluZyxcclxuICAgICAgICAgICAgJ3BhcmFtcy1yaWNoJzogUGFyYW1SaWNoLFxyXG4gICAgICAgICAgICAncGFyYW1zLXNvdXJjZSc6IFBhcmFtU291cmNlLFxyXG4gICAgICAgICAgICAncGFyYW1zLW11bHRpcGxlJzogUGFyYW1NdWx0aXBsZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIG93bmVyOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHRhYjogU3RyaW5nLFxyXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
