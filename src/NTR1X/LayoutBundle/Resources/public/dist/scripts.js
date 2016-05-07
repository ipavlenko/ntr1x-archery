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

            // TODO Тут игнорируется тот факт, что запись может быть с _action: removed

            if (!this.selection.category) {
                if (this.settings.categories.length > 0) {
                    var sub = this.settings.categories[0];
                    if (sub.categories.length > 0) {
                        this.selection.category = sub.categories[0];
                    }
                }
            }

            if (!this.selection.domain) {
                if (this.model.domains.length > 0) {
                    this.selection.domain = this.model.domains[0];
                    this.selection.page = null;
                    this.selection.source = null;
                }
            }

            if (!this.selection.page) {
                if (this.model.pages.length > 0) {
                    this.selectPage(this.model.pages[0]);
                }
            }

            if (!this.selection.source) {
                if (this.selection.page && this.selection.page.sources.length > 0) {
                    this.selection.source = this.selection.page.sources[0];
                }
            }
        },
        methods: {
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
            }
        },
        events: {
            pull: function(data) {
                // this.selection.category = data.item;
                console.log('pull');
            },
            push: function(data) {
                console.log('push');
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
                this.selectPage(data.item);
            },
            selectSource: function(data) {
                this.selection.source = data.item;
            },
        }
    });

})(Vue, jQuery, undefined);

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

    Vue.component('shell-domains', {
        template: '#shell-domains',
        props: {
            domains: Array,
            globals: Object,
        },
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

    Vue.component('shell-page', {
        template: '#shell-page',
        props: {
            globals: Object,
            settings: Object,
            page: Object,
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
                sort: false
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
        props: {
            globals: Object,
            settings: Object,
            page: Object,
            stack: Object,
            data: Object,
        },
        ready: function() {

            this.widget = Shell.Services.Layout.getWidget(this.data.type);

            var self = this;

            this.$watch('data.params', function(params) {

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

                self.bindings = recur(self.data.params);

            }, {
              deep: true,
              immediate: true,
            });
        },
        data: function() {

            return {
                widget: this.widget,
                bindings: this.bindings,
            };
        },
        methods: {

            doApply: function(model) {

                Object.assign(this.data, JSON.parse(JSON.stringify(model)), {
                    _action: this.data._action
                        ? this.data._action
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
                        original: this.data,
                        current: JSON.parse(JSON.stringify(this.data))
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

            removeWidget: function() {
                this.$dispatch('removeWidget', { item: this.data });
            }
        }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbXBvbmVudHMvZm9ybS5qcyIsImNvbXBvbmVudHMvZ3JpZC5qcyIsImNvbXBvbmVudHMvaW5saW5lLmpzIiwiY29tcG9uZW50cy9tb2RhbC5qcyIsImRpcmVjdGl2ZXMvY29tYm8uanMiLCJkaXJlY3RpdmVzL2RhdGUuanMiLCJkaXJlY3RpdmVzL3RhZ3MuanMiLCJiaW5kaW5ncy9iaW5kaW5ncy5qcyIsImZpbHRlcnMvaW5kZXguanMiLCJob29rcy9tb2RhbC5qcyIsInNjaGVtZXMvc2NoZW1lcy5qcyIsImRvbWFpbnMvZG9tYWlucy5qcyIsInBhZ2VzL3BhZ2VzLmpzIiwic2VydmljZXMvbGF5b3V0LmpzIiwic2V0dGluZ3Mvc2V0dGluZ3MuanMiLCJ3aWRnZXRzL3dpZGdldHMuanMiLCJzaGVsbC9zaGVsbC5qcyIsInBhZ2VzL3NvdXJjZXMvc291cmNlcy5qcyIsInBhZ2VzL3dpZGdldHMvd2lkZ2V0cy5qcyIsInNoZWxsL2JyYW5kL2JyYW5kLmpzIiwic2hlbGwvY2F0ZWdvcmllcy9jYXRlZ29yaWVzLmpzIiwic2hlbGwvYWN0aW9ucy9hY3Rpb25zLmpzIiwic2hlbGwvZG9tYWlucy9kb21haW5zLmpzIiwic2hlbGwvY29udGFpbmVyL2NvbnRhaW5lci5qcyIsInNoZWxsL3BhZ2VzL3BhZ2VzLmpzIiwic2hlbGwvcGFnZS9wYWdlLmpzIiwic2hlbGwvcGFsZXR0ZS9wYWxldHRlLmpzIiwic2hlbGwvc291cmNlcy9zb3VyY2VzLmpzIiwic2hlbGwvc3RhY2tlZC9zdGFja2VkLmpzIiwic2hlbGwvc3R1Yi9zdHViLmpzIiwic2hlbGwvdGFyZ2V0L3RhcmdldC5qcyIsInNoZWxsL3dpZGdldC93aWRnZXQuanMiLCJwYWdlcy93aWRnZXRzL3BhcmFtcy9wYXJhbXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiVnVlLmNvbXBvbmVudCgndi1mb3JtJywge1xyXG5cclxuXHRwcm9wczoge1xyXG5cdFx0YWN0aW9uOiBTdHJpbmcsXHJcblx0XHRtZXRob2Q6IFN0cmluZyxcclxuXHRcdGluaXQ6IE9iamVjdCxcclxuXHRcdGRvbmU6IEZ1bmN0aW9uLFxyXG5cdFx0ZmFpbDogRnVuY3Rpb24sXHJcblx0XHRtb2RlbDogT2JqZWN0LFxyXG5cdH0sXHJcblxyXG5cdC8vIHJlcGxhY2U6IGZhbHNlLFxyXG5cclxuXHQvLyB0ZW1wbGF0ZTogYFxyXG5cdC8vIFx0PGZvcm0+XHJcblx0Ly8gXHRcdDxzbG90Pjwvc2xvdD5cclxuXHQvLyBcdDwvZm9ybT5cclxuXHQvLyBgLFxyXG5cclxuXHRhY3RpdmF0ZTogZnVuY3Rpb24oZG9uZSkge1xyXG5cclxuXHRcdHRoaXMub3JpZ2luYWwgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpKTtcclxuXHJcblx0XHQkKHRoaXMuJGVsKVxyXG5cclxuXHRcdFx0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xyXG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHR0aGlzLnN1Ym1pdCgpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQub24oJ3Jlc2V0JywgKGUpID0+IHtcclxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0dGhpcy5yZXNldCgpO1xyXG5cdFx0XHR9KVxyXG5cclxuXHRcdGRvbmUoKTtcclxuXHR9LFxyXG5cclxuXHRkYXRhOiBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRtb2RlbDogdGhpcy5tb2RlbFxyXG5cdFx0fTtcclxuXHR9LFxyXG5cclxuXHRtZXRob2RzOiB7XHJcblxyXG5cdFx0c3VibWl0OiBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRcdC8vIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcblx0XHRcdC8vIGNvbnNvbGUubG9nKHRoaXMubW9kZWwpO1xyXG5cclxuXHRcdFx0JC5hamF4KHtcclxuXHRcdFx0XHR1cmw6IHRoaXMuYWN0aW9uLFxyXG5cdFx0XHRcdG1ldGhvZDogdGhpcy5tZXRob2QsXHJcblx0XHRcdFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG5cdFx0XHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpXHJcblx0XHRcdH0pXHJcblx0XHRcdC5kb25lKChkKSA9PiB7XHJcblx0XHRcdFx0aWYgKGRvbmUgaW4gdGhpcykgdGhpcy5kb25lKGQpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuZmFpbChmdW5jdGlvbihlKSB7IGlmIChmYWlsIGluIHRoaXMpIHRoaXMuZmFpbChlKTsgfS5iaW5kKHRoaXMpKVxyXG5cdFx0fSxcclxuXHJcblx0XHRyZXNldDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgdGhpcy5vcmlnaW5hbCk7XHJcblx0XHR9XHJcblx0fSxcclxufSk7IiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG5cdC8vIHZhciBtb2RlbCA9IHtcclxuXHQvLyBcdGxpc3Q6IFtdXHJcblx0Ly8gfTtcclxuXHQvL1xyXG5cdC8vIHZhciBib2R5ID0gVnVlLmV4dGVuZCh7XHJcblx0Ly8gXHRjcmVhdGVkOiBmdW5jdGlvbigpICB7IHRoaXMuJGRpc3BhdGNoKCdyZWdpc3Rlci1ib2R5JywgdGhpcykgfSxcclxuXHQvLyB9KTtcclxuXHJcblx0VnVlLmNvbXBvbmVudCgnZ3JpZC10YWJsZScsIHtcclxuXHJcblx0XHRyZXBsYWNlOiBmYWxzZSxcclxuXHJcblx0XHRwcm9wczoge1xyXG5cdFx0XHRkOiBBcnJheVxyXG5cdFx0fSxcclxuXHJcblx0XHQvLyBkYXRhOiBmdW5jdGlvbigpIHtcclxuXHRcdC8vIFx0cmV0dXJuIHtcclxuXHRcdC8vIFx0XHRpdGVtczogdGhpcy5kLnNsaWNlKDApXHJcblx0XHQvLyBcdH1cclxuXHRcdC8vIH0sXHJcblxyXG5cdFx0bWV0aG9kczoge1xyXG5cclxuXHRcdFx0YWRkOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRjb25zb2xlLmxvZygnYXNkYXNkJyk7XHJcblx0XHRcdFx0dGhpcy5pdGVtcy5wdXNoKHt9KTtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLml0ZW1zKTtcclxuXHRcdFx0fSxcclxuXHJcblx0XHRcdHJlbW92ZTogZnVuY3Rpb24oaW5kZXgpIHtcclxuXHRcdFx0XHR0aGlzLml0ZW1zLnNwbGljZShpbmRleCwgMSk7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0fSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIlZ1ZS5jb21wb25lbnQoJ2lubGluZS10ZXh0JyxcclxuXHRWdWUuZXh0ZW5kKHtcclxuXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJyBdLFxyXG5cdFx0dGVtcGxhdGU6IGBcclxuXHRcdFx0PGRpdiBjbGFzcz1cImlubGluZS1jb250YWluZXJcIj5cclxuXHRcdFx0XHQ8aW5wdXQgY2xhc3M9XCJpbmxpbmUtY29udHJvbFwiIHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIiAvPlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdGBcclxuXHR9KVxyXG4pO1xyXG5cclxuVnVlLmNvbXBvbmVudCgnaW5saW5lLWNoZWNrYm94JyxcclxuXHRWdWUuZXh0ZW5kKHtcclxuXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJyBdLFxyXG5cdFx0dGVtcGxhdGU6IGBcclxuXHRcdFx0PGRpdiBjbGFzcz1cImlubGluZS1jb250YWluZXJcIj5cclxuXHRcdFx0XHQ8aW5wdXQgY2xhc3M9XCJpbmxpbmUtY2hlY2tib3hcIiB0eXBlPVwiY2hlY2tib3hcIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiIC8+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0YFxyXG5cdH0pXHJcbik7XHJcblxyXG5WdWUuY29tcG9uZW50KCdpbmxpbmUtc2VsZWN0JyxcclxuXHRWdWUuZXh0ZW5kKHtcclxuXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJywgJ29wdGlvbnMnIF0sXHJcblx0XHR0ZW1wbGF0ZTogYFxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxyXG5cdFx0XHRcdDxzZWxlY3QgY2xhc3M9XCJpbmxpbmUtY29udHJvbDFcIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiPlxyXG5cdFx0XHRcdFx0PG9wdGlvbiB2LWZvcj1cIm9wdGlvbiBpbiBvcHRpb25zXCIgdmFsdWU9XCJ7eyBvcHRpb24ua2V5IH19XCI+e3sgb3B0aW9uLnZhbHVlIH19PC9vcHRpb24+XHJcblx0XHRcdFx0PC9zZWxlY3Q+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0YFxyXG5cdH0pXHJcbik7XHJcblxyXG5WdWUuY29tcG9uZW50KCdpbmxpbmUtdmFsdWUnLFxyXG5cdFZ1ZS5leHRlbmQoe1xyXG5cdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnLCAnY2xhc3MnIF0sXHJcblx0XHR0ZW1wbGF0ZTogYFxyXG5cdFx0XHQ8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCIgLz5cclxuXHRcdFx0PHNwYW4gOmNsYXNzPVwiY2xhc3NcIj57eyB2YWx1ZSB9fTwvc3Bhbj5cclxuXHRcdGBcclxuXHR9KVxyXG4pO1xyXG4iLCJWdWUuY29tcG9uZW50KCdtb2RhbCcsIHtcclxuXHJcbiAgICBwcm9wczoge1xyXG4gICAgICAgIGlkOiBTdHJpbmcsXHJcbiAgICAgICAgY3VycmVudDogT2JqZWN0LFxyXG4gICAgICAgIG9yaWdpbmFsOiBPYmplY3QsXHJcbiAgICB9LFxyXG5cclxuICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgc3VibWl0OiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKCdzdWJtaXQnLCB0aGlzLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAvLyBPYmplY3QuYXNzaWduKHRoaXMub3JpZ2luYWwsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5jdXJyZW50KSkpO1xyXG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5jbG9zZXN0KCcubW9kYWwnKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHJlc2V0OiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKCdyZXNldCcsIHRoaXMuY3VycmVudCk7XHJcbiAgICAgICAgICAgIC8vIE9iamVjdC5hc3NpZ24odGhpcy5jdXJyZW50LCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMub3JpZ2luYWwpKSk7XHJcbiAgICAgICAgICAgICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuIiwiVnVlLmRpcmVjdGl2ZSgnY29tYm8nLCB7XHJcblxyXG5cdGJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRpZiAoJC5mbi50YWdzaW5wdXQpIHtcclxuXHJcblx0XHRcdCQodGhpcy5lbCkuc2VsZWN0Mih7XHJcblx0XHRcdFx0dGFnczogdHJ1ZSxcclxuXHRcdFx0XHRtdWx0aXBsZTogZmFsc2UsXHJcblx0XHRcdFx0Y3JlYXRlVGFnOiBmdW5jdGlvbiAocGFyYW1zKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0XHRpZDogcGFyYW1zLnRlcm0sXHJcblx0XHRcdFx0XHRcdHRleHQ6IHBhcmFtcy50ZXJtLFxyXG5cdFx0XHRcdFx0XHRuZXdPcHRpb246IHRydWVcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LFxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cdHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG5cdH0sXHJcblx0dW5iaW5kOiBmdW5jdGlvbiAoKSB7XHJcblx0fVxyXG59KTtcclxuIiwiVnVlLmRpcmVjdGl2ZSgnZGF0ZScsIHtcclxuXHJcblx0YmluZDogZnVuY3Rpb24gKCkge1xyXG5cdFx0XHJcblx0XHRpZiAoJC5mbi5kYXRlcGlja2VyKSB7XHJcblxyXG5cdFx0XHQkKHRoaXMuZWwpLmRhdGVwaWNrZXIoe1xyXG5cdFx0XHRcdGF1dG9jbG9zZTogdHJ1ZSxcclxuXHRcdFx0XHR0b2RheUhpZ2hsaWdodDogdHJ1ZSxcclxuXHRcdFx0XHRmb3JtYXQ6IFwieXl5eS1tbS1kZFwiXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0dXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XHJcblx0fSxcclxuXHR1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHR9XHJcbn0pO1xyXG4iLCJWdWUuZGlyZWN0aXZlKCd0YWdzJywge1xyXG5cclxuXHRiaW5kOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0aWYgKCQuZm4udGFnc2lucHV0KSB7XHJcblxyXG5cdFx0XHQkKHRoaXMuZWwpLnRhZ3NpbnB1dCh7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0dXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XHJcblx0fSxcclxuXHR1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHR9XHJcbn0pO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2JpbmRpbmdzLWRpYWxvZycsIHtcclxuXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjYmluZGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdiaW5kaW5ncycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkFjdGlvbk1peGluKE1vZGFsRWRpdG9yKV0sXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xyXG4iLCJWdWUuZmlsdGVyKCd0ZW1wbGF0ZScsIGZ1bmN0aW9uIChzdHJpbmcsIGRhdGEpIHtcclxuXHJcblx0dmFyIHJlID0gLyR7KFtefV0rKX0vZztcclxuXHRyZXR1cm4gc3RyaW5nLnJlcGxhY2UocmUsIGZ1bmN0aW9uKG1hdGNoLCBrZXkpIHtcclxuXHRcdHJldHVybiBkYXRhW2tleV07XHJcblx0fSk7XHJcbn0pO1xyXG5cclxuVnVlLmZpbHRlcignYXNzaWduJywgZnVuY3Rpb24gKHRhcmdldCwgc291cmNlMSwgc291cmNlMiwgc291cmNlMykge1xyXG5cclxuXHRyZXR1cm4gT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZTEsIHNvdXJjZTIsIHNvdXJjZTMpO1xyXG59KTtcclxuXHJcblZ1ZS5maWx0ZXIoJ2NvcHknLCBmdW5jdGlvbiAoc291cmNlKSB7XHJcblxyXG5cdHJldHVybiBuZXcgVnVlKHtcclxuXHRcdGRhdGE6IHNvdXJjZSAhPSBudWxsXHJcblx0XHRcdD8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzb3VyY2UpKVxyXG5cdFx0XHQ6IG51bGxcclxuXHR9KS4kZGF0YTtcclxufSk7XHJcblxyXG5WdWUuZmlsdGVyKCdjbG9uZScsIGZ1bmN0aW9uIChzb3VyY2UpIHtcclxuXHJcblx0cmV0dXJuIG5ldyBWdWUoe1xyXG5cdFx0ZGF0YTogc291cmNlICE9IG51bGxcclxuXHRcdFx0PyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNvdXJjZSkpXHJcblx0XHRcdDogbnVsbFxyXG5cdH0pLiRkYXRhO1xyXG59KTtcclxuIiwiKGZ1bmN0aW9uKCQpIHtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVwb3NpdGlvbihlbGVtZW50KSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgbW9kYWwgPSAkKGVsZW1lbnQpLFxyXG4gICAgICAgICAgICAgICAgZGlhbG9nID0gJCgnLm1vZGFsLWRpYWxvZycsIG1vZGFsKTtcclxuXHJcbiAgICAgICAgICAgIG1vZGFsLmNzcygnZGlzcGxheScsICdibG9jaycpO1xyXG4gICAgICAgICAgICBkaWFsb2cuY3NzKFwibWFyZ2luLXRvcFwiLCBNYXRoLm1heCgwLCAoJCh3aW5kb3cpLmhlaWdodCgpIC0gZGlhbG9nLmhlaWdodCgpKSAvIDIpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICQoJChkb2N1bWVudCksICcubW9kYWwubW9kYWwtY2VudGVyJykub24oJ3Nob3cuYnMubW9kYWwnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHJlcG9zaXRpb24oZS50YXJnZXQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5KTtcclxuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSkge1xyXG5cclxuICAgIHZhciBMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignbWFpbicpXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcycsXHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgdmFyIFNldHRpbmdzTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLXNldHRpbmdzLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1zZXR0aW5ncy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU2V0dGluZ3NNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLXNldHRpbmdzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLXNldHRpbmdzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTZXR0aW5nc0VkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLXNldHRpbmdzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU2V0dGluZ3NMaXN0Vmlld2VyLCBTZXR0aW5nc01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1zZXR0aW5ncycsXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgdmFyIExpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJyldLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdkb21haW5zJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zJyxcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICB2YXIgU2V0dGluZ3NMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLXNldHRpbmdzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTZXR0aW5nc01vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtc2V0dGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNldHRpbmdzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTZXR0aW5nc0xpc3RWaWV3ZXIsIFNldHRpbmdzTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLXNldHRpbmdzJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcclxuXHJcbiAgICB2YXIgTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJyldLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMnLFxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBTZXR0aW5nc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc2V0dGluZ3MtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zZXR0aW5ncy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU2V0dGluZ3NNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zZXR0aW5ncy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc2V0dGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNldHRpbmdzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNldHRpbmdzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU2V0dGluZ3NMaXN0Vmlld2VyLCBTZXR0aW5nc01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc2V0dGluZ3MnLFxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBNZXRhc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtbWV0YXMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1tZXRhcy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgTWV0YXNNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1tZXRhcy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtbWV0YXMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIE1ldGFzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLW1ldGFzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTWV0YXNMaXN0Vmlld2VyLCBNZXRhc01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtbWV0YXMnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgdW5kZWZpbmVkKTtcclxuIiwiU2hlbGwgPSB3aW5kb3cuU2hlbGwgfHwge307XHJcblNoZWxsLlNlcnZpY2VzID0gd2luZG93LlNoZWxsLlNlcnZpY2VzIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKCQsIFZ1ZSwgU2hlbGwsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NlcnZpY2UtbGF5b3V0Jywge1xyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIFNoZWxsLlNlcnZpY2VzLkxheW91dCA9XHJcbiAgICAgICAgICAgIG5ldyBWdWUoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGdldFdpZGdldDogZnVuY3Rpb24oaWQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5zZXR0aW5ncy53aWRnZXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdyA9IHNlbGYuc2V0dGluZ3Mud2lkZ2V0c1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3LmlkID09IGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZXN0cm95ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBTaGVsbC5TZXJ2aWNlcy5MYXlvdXQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIFNoZWxsKTtcclxuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSkge1xyXG5cclxuICAgIHZhciBNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzZXR0aW5ncy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2V0dGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdkb21haW5zJyldLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzZXR0aW5ncycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkFjdGlvbk1peGluKE1vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHB1c2g6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvc2V0dGluZ3MvZG8tdXBkYXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5kb25lKChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBkKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHB1bGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvc2V0dGluZ3MnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmRvbmUoKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIGQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcclxuXHJcbiAgICB2YXIgTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCd3aWRnZXRzLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjd2lkZ2V0cy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnd2lkZ2V0cy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjd2lkZ2V0cy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3dpZGdldHMnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihMaXN0Vmlld2VyLCBNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3dpZGdldHMnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgdW5kZWZpbmVkKTtcclxuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBzZWxlY3Rpb246IE9iamVjdCxcclxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbjogdGhpcy5zZWxlY3Rpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3MsXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGhpcy5kYXRhLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcblxyXG4gICAgICAgICAgICAvLyBUT0RPINCi0YPRgiDQuNCz0L3QvtGA0LjRgNGD0LXRgtGB0Y8g0YLQvtGCINGE0LDQutGCLCDRh9GC0L4g0LfQsNC/0LjRgdGMINC80L7QttC10YIg0LHRi9GC0Ywg0YEgX2FjdGlvbjogcmVtb3ZlZFxyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGlvbi5jYXRlZ29yeSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuY2F0ZWdvcmllcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN1YiA9IHRoaXMuc2V0dGluZ3MuY2F0ZWdvcmllc1swXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3ViLmNhdGVnb3JpZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5jYXRlZ29yeSA9IHN1Yi5jYXRlZ29yaWVzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGlvbi5kb21haW4pIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmRvbWFpbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLmRvbWFpbiA9IHRoaXMubW9kZWwuZG9tYWluc1swXTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5wYWdlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5zb3VyY2UgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuc2VsZWN0aW9uLnBhZ2UpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLnBhZ2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdFBhZ2UodGhpcy5tb2RlbC5wYWdlc1swXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5zZWxlY3Rpb24uc291cmNlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3Rpb24ucGFnZSAmJiB0aGlzLnNlbGVjdGlvbi5wYWdlLnNvdXJjZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLnNvdXJjZSA9IHRoaXMuc2VsZWN0aW9uLnBhZ2Uuc291cmNlc1swXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBzZWxlY3RQYWdlOiBmdW5jdGlvbihwYWdlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb24ucGFnZSA9IHBhZ2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5zb3VyY2UgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge307XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETyDQodC00LXQu9Cw0YLRjCDQt9Cw0L/RgNC+0YHRi1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwYWdlICYmIHBhZ2Uuc291cmNlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFnZS5zb3VyY2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzID0gcGFnZS5zb3VyY2VzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW3MubmFtZV0gPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG9uZTogMTEsIHR3bzogMTIgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgb25lOiAyMSwgdHdvOiAyMiB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBvbmU6IDMxLCB0d286IDMyIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG9uZTogNDEsIHR3bzogNDIgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBldmVudHM6IHtcclxuICAgICAgICAgICAgcHVsbDogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgLy8gdGhpcy5zZWxlY3Rpb24uY2F0ZWdvcnkgPSBkYXRhLml0ZW07XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncHVsbCcpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwdXNoOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncHVzaCcpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0cmVlOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2VsZWN0Q2F0ZWdvcnk6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLmNhdGVnb3J5ID0gZGF0YS5pdGVtO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZWxlY3REb21haW46IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLmRvbWFpbiA9IGRhdGEuaXRlbTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2VsZWN0UGFnZTogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RQYWdlKGRhdGEuaXRlbSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNlbGVjdFNvdXJjZTogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb24uc291cmNlID0gZGF0YS5pdGVtO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIHVuZGVmaW5lZCk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcclxuXHJcbiAgICB2YXIgU291cmNlc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNvdXJjZXNNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIGNoZWNrOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjaGVjaycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNvdXJjZXNFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFNvdXJjZXNMaXN0Vmlld2VyLCBTb3VyY2VzTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzJyxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTb3VyY2VzUGFyYW1zTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLXBhcmFtcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTb3VyY2VzUGFyYW1zTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1wYXJhbXMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTb3VyY2VzUGFyYW1zRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMtcGFyYW1zJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU291cmNlc1BhcmFtc0xpc3RWaWV3ZXIsIFNvdXJjZXNQYXJhbXNNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIlNoZWxsID0gd2luZG93LlNoZWxsIHx8IHt9O1xyXG5TaGVsbC5XaWRnZXRzID0gd2luZG93LlNoZWxsLldpZGdldHMgfHwge307XHJcblxyXG4oZnVuY3Rpb24oVnVlLCAkLCBDb3JlLCBTaGVsbCwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgdmFyIFdpZGdldHNMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIGdldFdpZGdldDogZnVuY3Rpb24odykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdsb2JhbHMud2lkZ2V0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB3aWRnZXQgPSB0aGlzLmdsb2JhbHMud2lkZ2V0c1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAody50eXBlID09IHdpZGdldC5pZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gd2lkZ2V0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFdpZGdldHNNb2RhbEVkaXRvciA9IFNoZWxsLldpZGdldHMuTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2RhdGEnKV0sXHJcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHNbaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW0gPSB0aGlzLmN1cnJlbnQucGFyYW1zW3Byb3AubmFtZV0gPSB0aGlzLmN1cnJlbnQucGFyYW1zW3Byb3AubmFtZV0gfHwge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgYmluZGluZzogbnVsbFxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgcGFyYW0uX2FjdGlvbiA9IHBhcmFtLl9hY3Rpb24gPT0gJ3VwZGF0ZSdcclxuICAgICAgICAgICAgICAgICAgICA/ICd1cGRhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgOiAnY3JlYXRlJ1xyXG4gICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb3A6IHByb3AsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyYW06IHBhcmFtLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLml0ZW1zID0gaXRlbXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuY29udGV4dCxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLml0ZW1zLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG5cclxuICAgICAgICAgICAgaGFzUHJvcHM6IGZ1bmN0aW9uKHRhYikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29udGV4dC53aWRnZXQgJiYgdGhpcy5jb250ZXh0LndpZGdldC5wcm9wcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZXh0LndpZGdldC5wcm9wcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wLnRhYiA9PSB0YWIpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBXaWRnZXRzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihXaWRnZXRzTGlzdFZpZXdlciwgV2lkZ2V0c01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3RcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgICAgIHByb3RvOiBmdW5jdGlvbih3aWRnZXQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiB3aWRnZXQuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtcyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgd2lkZ2V0LnByb3BzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9wID0gd2lkZ2V0LnByb3BzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtc1twcm9wLm5hbWVdID0gcHJvcC50eXBlICE9ICdtdWx0aXBsZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiAnY3JlYXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmluZGluZzogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRpbmc6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZGF0YS5wYXJhbXMgPSBwYXJhbXM7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwsIHVuZGVmaW5lZCk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtYnJhbmQnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtYnJhbmQnLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtY2F0ZWdvcmllcycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1jYXRlZ29yaWVzJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBBcnJheSxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgaXRlbSwgY29udGV4dCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlKTtcclxuIiwiKGZ1bmN0aW9uKCQsVnVlLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1hY3Rpb25zJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWFjdGlvbnMnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBPYmplY3QsXHJcbiAgICAgICAgICAgIGRvbWFpbjogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3RcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGl0ZW0sIGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtZG9tYWlucycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kb21haW5zJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBkb21haW5zOiBBcnJheSxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlKTtcclxuIiwiKGZ1bmN0aW9uKCQsVnVlLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1jb250YWluZXInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtY29udGFpbmVyJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgY2F0ZWdvcnk6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLmdsb2JhbHMsIHRoaXMuc2V0dGluZ3MsIHRoaXMucGFnZSwgdGhpcy5jYXRlZ29yeSk7XHJcbiAgICAgICAgICAgIC8vIHJldHVybiB7XHJcbiAgICAgICAgICAgIC8vICAgICBwYWdlOiB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnBhZ2VcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gcmVhZHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyh0aGlzLmdsb2JhbHMsIHRoaXMuc2V0dGluZ3MsIHRoaXMucGFnZSk7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcGFnZXMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcGFnZXMnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIHBhZ2VzOiBBcnJheSxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlKTtcclxuIiwiKGZ1bmN0aW9uKCQsVnVlLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wYWdlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXBhZ2UnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlKTtcclxuIiwiKGZ1bmN0aW9uKCQsVnVlLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICB2YXIgUGFsZXR0ZUl0ZW0gPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcGFsZXR0ZS1pdGVtJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXBhbGV0dGUtaXRlbScsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3QsXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbXB1dGVkOiB7XHJcbiAgICAgICAgICAgIHRodW1ibmFpbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJy9idW5kbGVzLycgKyB0aGlzLndpZGdldC5wcm92aWRlci5hbGlhcyArICcvJyArIHRoaXMud2lkZ2V0LnRodW1ibmFpbC5wYXRoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWFkeTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmNyZWF0ZSh0aGlzLiRlbCwge1xyXG4gICAgICAgICAgICAgICAgZ3JvdXA6IHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnd2lkZ2V0cycsXHJcbiAgICAgICAgICAgICAgICAgICAgcHVsbDogJ2Nsb25lJyxcclxuICAgICAgICAgICAgICAgICAgICBwdXQ6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uOiAxNTAsXHJcbiAgICAgICAgICAgICAgICBzb3J0OiBmYWxzZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gJCh0aGlzLiRlbCkuZHJhZ2dhYmxlKHtcclxuICAgICAgICAgICAgLy8gICAgIGNvbm5lY3RUb1NvcnRhYmxlOiBcIi5nZS5nZS1zdGFja2VkXCIsXHJcbiAgICAgICAgICAgIC8vICAgICBoZWxwZXI6IFwiY2xvbmVcIixcclxuICAgICAgICAgICAgLy8gICAgIHJldmVydDogXCJpbnZhbGlkXCJcclxuICAgICAgICAgICAgLy8gfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcGFsZXR0ZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wYWxldHRlJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBjYXRlZ29yeTogT2JqZWN0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb21wb25lbnRzOiB7XHJcbiAgICAgICAgICAgICdwYWxldHRlLWl0ZW0nOiBQYWxldHRlSXRlbVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUpO1xyXG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXNvdXJjZXMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtc291cmNlcycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgc291cmNlczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIi8vIChmdW5jdGlvbigkLCBWdWUsIENvcmUsIHVuZGVmaW5lZCkge1xyXG4vL1xyXG4vLyAgICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtc3RhY2tlZCcsIHtcclxuLy8gICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1zdGFja2VkJyxcclxuLy8gICAgICAgICBtaXhpbnM6IFsgQ29yZS5TdGFja2VkIF1cclxuLy8gICAgIH0pO1xyXG4vL1xyXG4vLyB9KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXN0dWInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtc3R1YicsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtdGFyZ2V0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXRhcmdldCcsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIlNoZWxsID0gd2luZG93LlNoZWxsIHx8IHt9O1xyXG5TaGVsbC5XaWRnZXRzID0gd2luZG93LlNoZWxsLldpZGdldHMgfHwge307XHJcblxyXG4oZnVuY3Rpb24oJCwgVnVlLCBTaGVsbCwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgU2hlbGwuV2lkZ2V0ID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXdpZGdldCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC13aWRnZXQnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxyXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWFkeTogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLndpZGdldCA9IFNoZWxsLlNlcnZpY2VzLkxheW91dC5nZXRXaWRnZXQodGhpcy5kYXRhLnR5cGUpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ2RhdGEucGFyYW1zJywgZnVuY3Rpb24ocGFyYW1zKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gcmVjdXIocGFyYW1zKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGtleSBpbiBwYXJhbXMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbXNba2V5XVsnYmluZGluZyddKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVba2V5XSA9IHNlbGYuJGludGVycG9sYXRlKHBhcmFtc1trZXldWydiaW5kaW5nJ10pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICgkLmlzQXJyYXkocGFyYW1zW2tleV1bJ3ZhbHVlJ10pKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVba2V5XSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBwYXJhbXNba2V5XVsndmFsdWUnXS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlW2tleV1baV0gPSByZWN1cihwYXJhbXNba2V5XVsndmFsdWUnXVtpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVba2V5XSA9IHBhcmFtc1trZXldWyd2YWx1ZSddO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5iaW5kaW5ncyA9IHJlY3VyKHNlbGYuZGF0YS5wYXJhbXMpO1xyXG5cclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgIGRlZXA6IHRydWUsXHJcbiAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHdpZGdldDogdGhpcy53aWRnZXQsXHJcbiAgICAgICAgICAgICAgICBiaW5kaW5nczogdGhpcy5iaW5kaW5ncyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgICAgIGRvQXBwbHk6IGZ1bmN0aW9uKG1vZGVsKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLmRhdGEsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobW9kZWwpKSwge1xyXG4gICAgICAgICAgICAgICAgICAgIF9hY3Rpb246IHRoaXMuZGF0YS5fYWN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy5kYXRhLl9hY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ3Jlc2l6ZScpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgc2hvd1NldHRpbmdzOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZGlhbG9nID0gbmV3IFNoZWxsLldpZGdldHMuTW9kYWxFZGl0b3Ioe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3duZXI6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogdGhpcy53aWRnZXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IHRoaXMuZGF0YSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudDogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGEpKVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub3duZXIuZG9BcHBseSh0aGlzLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSkuJG1vdW50KCkuJGFwcGVuZFRvKCQoJ2JvZHknKS5nZXQoMCkpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgcmVtb3ZlV2lkZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKCdyZW1vdmVXaWRnZXQnLCB7IGl0ZW06IHRoaXMuZGF0YSB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIFNoZWxsKTtcclxuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSkge1xyXG5cclxuICAgIHZhciBQYXJhbVN0cmluZyA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLXBhcmFtcy1zdHJpbmcnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1wYXJhbXMtc3RyaW5nJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBpZDogU3RyaW5nLFxyXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgUGFyYW1SaWNoID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtcGFyYW1zLXJpY2gnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1wYXJhbXMtcmljaCcsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgaWQ6IFN0cmluZyxcclxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtU291cmNlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtcGFyYW1zLXNvdXJjZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcy1zb3VyY2UnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGlkOiBTdHJpbmcsXHJcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBQYXJhbU11bHRpcGxlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtcGFyYW1zLW11bHRpcGxlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMtcGFyYW1zLW11bHRpcGxlJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBpZDogU3RyaW5nLFxyXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaXRlbXM6IHRoaXMuaXRlbS5pdGVtc1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyByZWFkeTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuaXRlbXMgPSBbXTtcclxuICAgICAgICAvLyB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgUGFyYW1zID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtcGFyYW1zJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMtcGFyYW1zJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBvd25lcjogT2JqZWN0LFxyXG4gICAgICAgICAgICB0YWI6IFN0cmluZyxcclxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgdmFyIFBhcmFtTXVsdGlwbGVMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtcGFyYW1zLW11bHRpcGxlLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1wYXJhbXMtbXVsdGlwbGUtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIHByb3A6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFyYW06IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFBhcmFtTXVsdGlwbGVNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLXBhcmFtcy1tdWx0aXBsZS1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1wYXJhbXMtbXVsdGlwbGUtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdkYXRhJyldLFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaXRlbXM6IHRoaXMuaXRlbXMsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWFkeTogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY29udGV4dCk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGV4dC5wcm9wLnByb3BzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHByb3AgPSB0aGlzLmNvbnRleHQucHJvcC5wcm9wc1tpXTtcclxuICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHRoaXMuY3VycmVudFtwcm9wLm5hbWVdID0gdGhpcy5jdXJyZW50W3Byb3AubmFtZV0gfHwge307XHJcblxyXG4gICAgICAgICAgICAgICAgcGFyYW0uX2FjdGlvbiA9IHBhcmFtLl9hY3Rpb24gPT0gJ3VwZGF0ZSdcclxuICAgICAgICAgICAgICAgICAgICA/ICd1cGRhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgOiAnY3JlYXRlJ1xyXG4gICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb3A6IHByb3AsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyYW06IHBhcmFtLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLml0ZW1zID0gaXRlbXM7XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBQYXJhbU11bHRpcGxlRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtcGFyYW1zLW11bHRpcGxlLWVkaXRvcicsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFBhcmFtTXVsdGlwbGVMaXN0Vmlld2VyLCBQYXJhbU11bHRpcGxlTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcy1tdWx0aXBsZS1lZGl0b3InLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIHByb3A6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFyYW06IE9iamVjdCxcclxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgdmFyIFBhcmFtc0xpc3QgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1wYXJhbXMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcy1saXN0JyxcclxuICAgICAgICBjb21wb25lbnRzOiB7XHJcbiAgICAgICAgICAgICdwYXJhbXMtc3RyaW5nJzogUGFyYW1TdHJpbmcsXHJcbiAgICAgICAgICAgICdwYXJhbXMtcmljaCc6IFBhcmFtUmljaCxcclxuICAgICAgICAgICAgJ3BhcmFtcy1zb3VyY2UnOiBQYXJhbVNvdXJjZSxcclxuICAgICAgICAgICAgJ3BhcmFtcy1tdWx0aXBsZSc6IFBhcmFtTXVsdGlwbGUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBvd25lcjogT2JqZWN0LFxyXG4gICAgICAgICAgICB0YWI6IFN0cmluZyxcclxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
