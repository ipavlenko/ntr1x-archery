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
                        q = '?';
                        for (var y = 0; y < page.sources[i].params.length; y++) {
                            if ( y>0 ) {
                                q += '&';
                            }
                            q += page.sources[i].params[y].name + '=' + page.sources[i].params[y].value;
                        }

                        var s = page.sources[i];

                        $.ajax({
                            url: page.sources[i].url + q,
                            method: page.sources[i].method,
                            async: false,
                            dataType: "json"
                        }).success(function( data_r, textStatus, jqXHR ) {
                            console.log(data_r);
                            data[s.name] = data_r;
                        });

                    }
                }
                this.globals.data = data;
            }
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
                this.selectPage(data.item);
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
        props: {
            globals: Object,
            settings: Object,
            page: Object,
            stack: Object,
            data: Object,
        },
        ready: function() {

            this.editable = false;
            this.widget = this.$root.$refs.shell.getWidget(this.data.type);

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
                editable: this.editable,
            };
        },
        methods: {

            lockWidget: function() {

            },

            unlockWidget: function() {

            },

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJpbmRpbmdzL2JpbmRpbmdzLmpzIiwiY29tcG9uZW50cy9mb3JtLmpzIiwiY29tcG9uZW50cy9ncmlkLmpzIiwiY29tcG9uZW50cy9pbmxpbmUuanMiLCJjb21wb25lbnRzL21vZGFsLmpzIiwiZGlyZWN0aXZlcy9jb21iby5qcyIsImRpcmVjdGl2ZXMvZGF0ZS5qcyIsImRpcmVjdGl2ZXMvdGFncy5qcyIsImZpbHRlcnMvaW5kZXguanMiLCJkb21haW5zL2RvbWFpbnMuanMiLCJob29rcy9tb2RhbC5qcyIsInBhZ2VzL3BhZ2VzLmpzIiwic2NoZW1lcy9zY2hlbWVzLmpzIiwic2V0dGluZ3Mvc2V0dGluZ3MuanMiLCJzaGVsbC9zaGVsbC5qcyIsIndpZGdldHMvd2lkZ2V0cy5qcyIsInBhZ2VzL3NvdXJjZXMvc291cmNlcy5qcyIsInBhZ2VzL3dpZGdldHMvd2lkZ2V0cy5qcyIsInNoZWxsL2FjdGlvbnMvYWN0aW9ucy5qcyIsInNoZWxsL2JyYW5kL2JyYW5kLmpzIiwic2hlbGwvY2F0ZWdvcmllcy9jYXRlZ29yaWVzLmpzIiwic2hlbGwvY29udGFpbmVyL2NvbnRhaW5lci5qcyIsInNoZWxsL2RvbWFpbnMvZG9tYWlucy5qcyIsInNoZWxsL3BhZ2UvcGFnZS5qcyIsInNoZWxsL3BhZ2VzL3BhZ2VzLmpzIiwic2hlbGwvcGFsZXR0ZS9wYWxldHRlLmpzIiwic2hlbGwvc291cmNlcy9zb3VyY2VzLmpzIiwic2hlbGwvc3RhY2tlZC9zdGFja2VkLmpzIiwic2hlbGwvc3R1Yi9zdHViLmpzIiwic2hlbGwvdGFyZ2V0L3RhcmdldC5qcyIsInNoZWxsL3dpZGdldC93aWRnZXQuanMiLCJwYWdlcy93aWRnZXRzL3BhcmFtcy9wYXJhbXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XG5cbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2JpbmRpbmdzLWRpYWxvZycsIHtcblxuICAgICAgICB0ZW1wbGF0ZTogJyNiaW5kaW5ncy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgnYmluZGluZ3MnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuQWN0aW9uTWl4aW4oTW9kYWxFZGl0b3IpXSxcbiAgICB9KTtcblxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XG4iLCJWdWUuY29tcG9uZW50KCd2LWZvcm0nLCB7XG5cblx0cHJvcHM6IHtcblx0XHRhY3Rpb246IFN0cmluZyxcblx0XHRtZXRob2Q6IFN0cmluZyxcblx0XHRpbml0OiBPYmplY3QsXG5cdFx0ZG9uZTogRnVuY3Rpb24sXG5cdFx0ZmFpbDogRnVuY3Rpb24sXG5cdFx0bW9kZWw6IE9iamVjdCxcblx0fSxcblxuXHQvLyByZXBsYWNlOiBmYWxzZSxcblxuXHQvLyB0ZW1wbGF0ZTogYFxuXHQvLyBcdDxmb3JtPlxuXHQvLyBcdFx0PHNsb3Q+PC9zbG90PlxuXHQvLyBcdDwvZm9ybT5cblx0Ly8gYCxcblxuXHRhY3RpdmF0ZTogZnVuY3Rpb24oZG9uZSkge1xuXG5cdFx0dGhpcy5vcmlnaW5hbCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCkpO1xuXG5cdFx0JCh0aGlzLiRlbClcblxuXHRcdFx0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdHRoaXMuc3VibWl0KCk7XG5cdFx0XHR9KVxuXHRcdFx0Lm9uKCdyZXNldCcsIChlKSA9PiB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0dGhpcy5yZXNldCgpO1xuXHRcdFx0fSlcblxuXHRcdGRvbmUoKTtcblx0fSxcblxuXHRkYXRhOiBmdW5jdGlvbigpIHtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRtb2RlbDogdGhpcy5tb2RlbFxuXHRcdH07XG5cdH0sXG5cblx0bWV0aG9kczoge1xuXG5cdFx0c3VibWl0OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0Ly8gZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHQvLyBjb25zb2xlLmxvZyh0aGlzLm1vZGVsKTtcblxuXHRcdFx0JC5hamF4KHtcblx0XHRcdFx0dXJsOiB0aGlzLmFjdGlvbixcblx0XHRcdFx0bWV0aG9kOiB0aGlzLm1ldGhvZCxcblx0XHRcdFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuXHRcdFx0XHRkYXRhOiBKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKVxuXHRcdFx0fSlcblx0XHRcdC5kb25lKChkKSA9PiB7XG5cdFx0XHRcdGlmIChkb25lIGluIHRoaXMpIHRoaXMuZG9uZShkKTtcblx0XHRcdH0pXG5cdFx0XHQuZmFpbChmdW5jdGlvbihlKSB7IGlmIChmYWlsIGluIHRoaXMpIHRoaXMuZmFpbChlKTsgfS5iaW5kKHRoaXMpKVxuXHRcdH0sXG5cblx0XHRyZXNldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIHRoaXMub3JpZ2luYWwpO1xuXHRcdH1cblx0fSxcbn0pOyIsIihmdW5jdGlvbigkLCBWdWUsIHVuZGVmaW5lZCkge1xuXG5cdC8vIHZhciBtb2RlbCA9IHtcblx0Ly8gXHRsaXN0OiBbXVxuXHQvLyB9O1xuXHQvL1xuXHQvLyB2YXIgYm9keSA9IFZ1ZS5leHRlbmQoe1xuXHQvLyBcdGNyZWF0ZWQ6IGZ1bmN0aW9uKCkgIHsgdGhpcy4kZGlzcGF0Y2goJ3JlZ2lzdGVyLWJvZHknLCB0aGlzKSB9LFxuXHQvLyB9KTtcblxuXHRWdWUuY29tcG9uZW50KCdncmlkLXRhYmxlJywge1xuXG5cdFx0cmVwbGFjZTogZmFsc2UsXG5cblx0XHRwcm9wczoge1xuXHRcdFx0ZDogQXJyYXlcblx0XHR9LFxuXG5cdFx0Ly8gZGF0YTogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gXHRyZXR1cm4ge1xuXHRcdC8vIFx0XHRpdGVtczogdGhpcy5kLnNsaWNlKDApXG5cdFx0Ly8gXHR9XG5cdFx0Ly8gfSxcblxuXHRcdG1ldGhvZHM6IHtcblxuXHRcdFx0YWRkOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ2FzZGFzZCcpO1xuXHRcdFx0XHR0aGlzLml0ZW1zLnB1c2goe30pO1xuXHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLml0ZW1zKTtcblx0XHRcdH0sXG5cblx0XHRcdHJlbW92ZTogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRcdFx0dGhpcy5pdGVtcy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdH0pO1xuXG59KShqUXVlcnksIFZ1ZSk7XG4iLCJWdWUuY29tcG9uZW50KCdpbmxpbmUtdGV4dCcsXG5cdFZ1ZS5leHRlbmQoe1xuXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJyBdLFxuXHRcdHRlbXBsYXRlOiBgXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxuXHRcdFx0XHQ8aW5wdXQgY2xhc3M9XCJpbmxpbmUtY29udHJvbFwiIHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIiAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0YFxuXHR9KVxuKTtcblxuVnVlLmNvbXBvbmVudCgnaW5saW5lLWNoZWNrYm94Jyxcblx0VnVlLmV4dGVuZCh7XG5cdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnIF0sXG5cdFx0dGVtcGxhdGU6IGBcblx0XHRcdDxkaXYgY2xhc3M9XCJpbmxpbmUtY29udGFpbmVyXCI+XG5cdFx0XHRcdDxpbnB1dCBjbGFzcz1cImlubGluZS1jaGVja2JveFwiIHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCIgLz5cblx0XHRcdDwvZGl2PlxuXHRcdGBcblx0fSlcbik7XG5cblZ1ZS5jb21wb25lbnQoJ2lubGluZS1zZWxlY3QnLFxuXHRWdWUuZXh0ZW5kKHtcblx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScsICdvcHRpb25zJyBdLFxuXHRcdHRlbXBsYXRlOiBgXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxuXHRcdFx0XHQ8c2VsZWN0IGNsYXNzPVwiaW5saW5lLWNvbnRyb2wxXCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIj5cblx0XHRcdFx0XHQ8b3B0aW9uIHYtZm9yPVwib3B0aW9uIGluIG9wdGlvbnNcIiB2YWx1ZT1cInt7IG9wdGlvbi5rZXkgfX1cIj57eyBvcHRpb24udmFsdWUgfX08L29wdGlvbj5cblx0XHRcdFx0PC9zZWxlY3Q+XG5cdFx0XHQ8L2Rpdj5cblx0XHRgXG5cdH0pXG4pO1xuXG5WdWUuY29tcG9uZW50KCdpbmxpbmUtdmFsdWUnLFxuXHRWdWUuZXh0ZW5kKHtcblx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScsICdjbGFzcycgXSxcblx0XHR0ZW1wbGF0ZTogYFxuXHRcdFx0PGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiIC8+XG5cdFx0XHQ8c3BhbiA6Y2xhc3M9XCJjbGFzc1wiPnt7IHZhbHVlIH19PC9zcGFuPlxuXHRcdGBcblx0fSlcbik7XG4iLCJWdWUuY29tcG9uZW50KCdtb2RhbCcsIHtcblxuICAgIHByb3BzOiB7XG4gICAgICAgIGlkOiBTdHJpbmcsXG4gICAgICAgIGN1cnJlbnQ6IE9iamVjdCxcbiAgICAgICAgb3JpZ2luYWw6IE9iamVjdCxcbiAgICB9LFxuXG4gICAgbWV0aG9kczoge1xuXG4gICAgICAgIHN1Ym1pdDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goJ3N1Ym1pdCcsIHRoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAvLyBPYmplY3QuYXNzaWduKHRoaXMub3JpZ2luYWwsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5jdXJyZW50KSkpO1xuICAgICAgICAgICAgJChlLnRhcmdldCkuY2xvc2VzdCgnLm1vZGFsJykubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZXNldDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goJ3Jlc2V0JywgdGhpcy5jdXJyZW50KTtcbiAgICAgICAgICAgIC8vIE9iamVjdC5hc3NpZ24odGhpcy5jdXJyZW50LCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMub3JpZ2luYWwpKSk7XG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5jbG9zZXN0KCcubW9kYWwnKS5tb2RhbCgnaGlkZScpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG4iLCJWdWUuZGlyZWN0aXZlKCdjb21ibycsIHtcblxuXHRiaW5kOiBmdW5jdGlvbiAoKSB7XG5cblx0XHRpZiAoJC5mbi50YWdzaW5wdXQpIHtcblxuXHRcdFx0JCh0aGlzLmVsKS5zZWxlY3QyKHtcblx0XHRcdFx0dGFnczogdHJ1ZSxcblx0XHRcdFx0bXVsdGlwbGU6IGZhbHNlLFxuXHRcdFx0XHRjcmVhdGVUYWc6IGZ1bmN0aW9uIChwYXJhbXMpIHtcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0aWQ6IHBhcmFtcy50ZXJtLFxuXHRcdFx0XHRcdFx0dGV4dDogcGFyYW1zLnRlcm0sXG5cdFx0XHRcdFx0XHRuZXdPcHRpb246IHRydWVcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cdHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuXHR9LFxuXHR1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0fVxufSk7XG4iLCJWdWUuZGlyZWN0aXZlKCdkYXRlJywge1xuXG5cdGJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcblx0XHRpZiAoJC5mbi5kYXRlcGlja2VyKSB7XG5cblx0XHRcdCQodGhpcy5lbCkuZGF0ZXBpY2tlcih7XG5cdFx0XHRcdGF1dG9jbG9zZTogdHJ1ZSxcblx0XHRcdFx0dG9kYXlIaWdobGlnaHQ6IHRydWUsXG5cdFx0XHRcdGZvcm1hdDogXCJ5eXl5LW1tLWRkXCJcblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblx0dXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XG5cdH0sXG5cdHVuYmluZDogZnVuY3Rpb24gKCkge1xuXHR9XG59KTtcbiIsIlZ1ZS5kaXJlY3RpdmUoJ3RhZ3MnLCB7XG5cblx0YmluZDogZnVuY3Rpb24gKCkge1xuXG5cdFx0aWYgKCQuZm4udGFnc2lucHV0KSB7XG5cblx0XHRcdCQodGhpcy5lbCkudGFnc2lucHV0KHtcblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblx0dXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XG5cdH0sXG5cdHVuYmluZDogZnVuY3Rpb24gKCkge1xuXHR9XG59KTtcbiIsIlZ1ZS5maWx0ZXIoJ3RlbXBsYXRlJywgZnVuY3Rpb24gKHN0cmluZywgZGF0YSkge1xuXG5cdHZhciByZSA9IC8keyhbXn1dKyl9L2c7XG5cdHJldHVybiBzdHJpbmcucmVwbGFjZShyZSwgZnVuY3Rpb24obWF0Y2gsIGtleSkge1xuXHRcdHJldHVybiBkYXRhW2tleV07XG5cdH0pO1xufSk7XG5cblZ1ZS5maWx0ZXIoJ2Fzc2lnbicsIGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZTEsIHNvdXJjZTIsIHNvdXJjZTMpIHtcblxuXHRyZXR1cm4gT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZTEsIHNvdXJjZTIsIHNvdXJjZTMpO1xufSk7XG5cblZ1ZS5maWx0ZXIoJ2NvcHknLCBmdW5jdGlvbiAoc291cmNlKSB7XG5cblx0cmV0dXJuIG5ldyBWdWUoe1xuXHRcdGRhdGE6IHNvdXJjZSAhPSBudWxsXG5cdFx0XHQ/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc291cmNlKSlcblx0XHRcdDogbnVsbFxuXHR9KS4kZGF0YTtcbn0pO1xuXG5WdWUuZmlsdGVyKCdjbG9uZScsIGZ1bmN0aW9uIChzb3VyY2UpIHtcblxuXHRyZXR1cm4gbmV3IFZ1ZSh7XG5cdFx0ZGF0YTogc291cmNlICE9IG51bGxcblx0XHRcdD8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzb3VyY2UpKVxuXHRcdFx0OiBudWxsXG5cdH0pLiRkYXRhO1xufSk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XG5cbiAgICB2YXIgTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ21haW4nKV0sXG4gICAgfSk7XG5cbiAgICB2YXIgRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdkb21haW5zJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMnLFxuICAgIH0pO1xuXG5cbiAgICB2YXIgU2V0dGluZ3NMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdkb21haW5zLXNldHRpbmdzLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtc2V0dGluZ3MtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTZXR0aW5nc01vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdkb21haW5zLXNldHRpbmdzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZG9tYWlucy1zZXR0aW5ncy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIFNldHRpbmdzRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdkb21haW5zLXNldHRpbmdzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFNldHRpbmdzTGlzdFZpZXdlciwgU2V0dGluZ3NNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLXNldHRpbmdzJyxcbiAgICB9KTtcblxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XG4iLCIoZnVuY3Rpb24oJCkge1xuXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgZnVuY3Rpb24gcmVwb3NpdGlvbihlbGVtZW50KSB7XG5cbiAgICAgICAgICAgIHZhciBtb2RhbCA9ICQoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgZGlhbG9nID0gJCgnLm1vZGFsLWRpYWxvZycsIG1vZGFsKTtcblxuICAgICAgICAgICAgbW9kYWwuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgICAgICAgICBkaWFsb2cuY3NzKFwibWFyZ2luLXRvcFwiLCBNYXRoLm1heCgwLCAoJCh3aW5kb3cpLmhlaWdodCgpIC0gZGlhbG9nLmhlaWdodCgpKSAvIDIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQoJChkb2N1bWVudCksICcubW9kYWwubW9kYWwtY2VudGVyJykub24oJ3Nob3cuYnMubW9kYWwnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZXBvc2l0aW9uKGUudGFyZ2V0KTtcbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxufSkoalF1ZXJ5KTtcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcblxuICAgIHZhciBMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ21haW4nKV0sXG4gICAgfSk7XG5cbiAgICB2YXIgRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihMaXN0Vmlld2VyLCBNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcycsXG4gICAgfSk7XG5cblxuICAgIHZhciBTZXR0aW5nc0xpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNldHRpbmdzLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNldHRpbmdzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU2V0dGluZ3NNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc2V0dGluZ3MtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zZXR0aW5ncy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIFNldHRpbmdzRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zZXR0aW5ncycsIHtcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTZXR0aW5nc0xpc3RWaWV3ZXIsIFNldHRpbmdzTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc2V0dGluZ3MnLFxuICAgIH0pO1xuXG5cbiAgICB2YXIgTWV0YXNMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1tZXRhcy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1tZXRhcy1saXN0JyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIE1ldGFzTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLW1ldGFzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtbWV0YXMtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBNZXRhc0VkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtbWV0YXMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTWV0YXNMaXN0Vmlld2VyLCBNZXRhc01vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLW1ldGFzJyxcbiAgICB9KTtcblxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XG5cbiAgICB2YXIgTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ21haW4nKV0sXG4gICAgfSk7XG5cbiAgICB2YXIgRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMnLFxuICAgIH0pO1xuXG5cbiAgICB2YXIgU2V0dGluZ3NMaXN0Vmlld2VyID1cbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLXNldHRpbmdzLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMtc2V0dGluZ3MtbGlzdCcsXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcbiAgICB9KTtcblxuICAgIHZhciBTZXR0aW5nc01vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLXNldHRpbmdzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1zZXR0aW5ncy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxuICAgIH0pO1xuXG4gICAgdmFyIFNldHRpbmdzRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLXNldHRpbmdzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFNldHRpbmdzTGlzdFZpZXdlciwgU2V0dGluZ3NNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNzY2hlbWVzLXNldHRpbmdzJyxcbiAgICB9KTtcblxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XG5cbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NldHRpbmdzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2V0dGluZ3MtZGlhbG9nJyxcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignZG9tYWlucycpXSxcbiAgICB9KTtcblxuICAgIHZhciBFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NldHRpbmdzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkFjdGlvbk1peGluKE1vZGFsRWRpdG9yKV0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgcHVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL3NldHRpbmdzL2RvLXVwZGF0ZScsXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZG9uZSgoZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIGQpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHVsbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL3NldHRpbmdzJyxcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZG9uZSgoZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIGQpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgc2VsZWN0aW9uOiBPYmplY3QsXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uOiB0aGlzLnNlbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M6IHRoaXMuc2V0dGluZ3MsXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsOiB0aGlzLm1vZGVsLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0aGlzLmRhdGEsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgLy8gVE9ETyDQotGD0YIg0LjQs9C90L7RgNC40YDRg9C10YLRgdGPINGC0L7RgiDRhNCw0LrRgiwg0YfRgtC+INC30LDQv9C40YHRjCDQvNC+0LbQtdGCINCx0YvRgtGMINGBIF9hY3Rpb246IHJlbW92ZWRcblxuICAgICAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGlvbi5jYXRlZ29yeSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmNhdGVnb3JpZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3ViID0gdGhpcy5zZXR0aW5ncy5jYXRlZ29yaWVzWzBdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3ViLmNhdGVnb3JpZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb24uY2F0ZWdvcnkgPSBzdWIuY2F0ZWdvcmllc1swXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGlvbi5kb21haW4pIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5kb21haW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb24uZG9tYWluID0gdGhpcy5tb2RlbC5kb21haW5zWzBdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5wYWdlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb24uc291cmNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5zZWxlY3Rpb24ucGFnZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLnBhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RQYWdlKHRoaXMubW9kZWwucGFnZXNbMF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGlvbi5zb3VyY2UpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3Rpb24ucGFnZSAmJiB0aGlzLnNlbGVjdGlvbi5wYWdlLnNvdXJjZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5zb3VyY2UgPSB0aGlzLnNlbGVjdGlvbi5wYWdlLnNvdXJjZXNbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgIGdldFdpZGdldDogZnVuY3Rpb24oaWQpIHtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zZXR0aW5ncy53aWRnZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3ID0gdGhpcy5zZXR0aW5ncy53aWRnZXRzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAody5pZCA9PSBpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHNlbGVjdFBhZ2U6IGZ1bmN0aW9uKHBhZ2UpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLnBhZ2UgPSBwYWdlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLnNvdXJjZSA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xuXG4gICAgICAgICAgICAgICAgLy8gVE9ETyDQodC00LXQu9Cw0YLRjCDQt9Cw0L/RgNC+0YHRi1xuXG4gICAgICAgICAgICAgICAgaWYgKHBhZ2UgJiYgcGFnZS5zb3VyY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFnZS5zb3VyY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcyA9IHBhZ2Uuc291cmNlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbcy5uYW1lXSA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG9uZTogMTEsIHR3bzogMTIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG9uZTogMjEsIHR3bzogMjIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG9uZTogMzEsIHR3bzogMzIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG9uZTogNDEsIHR3bzogNDIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuZGF0YSA9IGRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgcHVsbDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgIHVybDogJy9zZXR0aW5ncycsXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmRvbmUoKGQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBkKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHB1c2g6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvc2V0dGluZ3MvZG8tdXBkYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5kb25lKChkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgZCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0cmVlOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VsZWN0Q2F0ZWdvcnk6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5jYXRlZ29yeSA9IGRhdGEuaXRlbTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZWxlY3REb21haW46IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbi5kb21haW4gPSBkYXRhLml0ZW07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VsZWN0UGFnZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0UGFnZShkYXRhLml0ZW0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlbGVjdFNvdXJjZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uLnNvdXJjZSA9IGRhdGEuaXRlbTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoVnVlLCBqUXVlcnksIHVuZGVmaW5lZCk7XG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XG5cbiAgICB2YXIgTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgnd2lkZ2V0cy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyN3aWRnZXRzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3dpZGdldHMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyN3aWRnZXRzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCd3aWRnZXRzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKV0sXG4gICAgICAgIHRlbXBsYXRlOiAnI3dpZGdldHMnLFxuICAgIH0pO1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgdW5kZWZpbmVkKTtcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcblxuICAgIHZhciBTb3VyY2VzTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU291cmNlc01vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLWRpYWxvZycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcy1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBjaGVjazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2NoZWNrJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBTb3VyY2VzRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFNvdXJjZXNMaXN0Vmlld2VyLCBTb3VyY2VzTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcycsXG4gICAgfSk7XG5cbiAgICB2YXIgU291cmNlc1BhcmFtc0xpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU291cmNlc1BhcmFtc01vZGFsRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLXBhcmFtcy1kaWFsb2cnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXG4gICAgfSk7XG5cbiAgICB2YXIgU291cmNlc1BhcmFtc0VkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1wYXJhbXMnLCB7XG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU291cmNlc1BhcmFtc0xpc3RWaWV3ZXIsIFNvdXJjZXNQYXJhbXNNb2RhbEVkaXRvcildLFxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLXBhcmFtcycsXG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xuIiwiU2hlbGwgPSB3aW5kb3cuU2hlbGwgfHwge307XG5TaGVsbC5XaWRnZXRzID0gd2luZG93LlNoZWxsLldpZGdldHMgfHwge307XG5cbihmdW5jdGlvbihWdWUsICQsIENvcmUsIFNoZWxsLCB1bmRlZmluZWQpIHtcblxuICAgIHZhciBXaWRnZXRzTGlzdFZpZXdlciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIGdldFdpZGdldDogZnVuY3Rpb24odykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5nbG9iYWxzLndpZGdldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdpZGdldCA9IHRoaXMuZ2xvYmFscy53aWRnZXRzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAody50eXBlID09IHdpZGdldC5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdpZGdldDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIFdpZGdldHNNb2RhbEVkaXRvciA9IFNoZWxsLldpZGdldHMuTW9kYWxFZGl0b3IgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLWRpYWxvZycsXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2RhdGEnKV0sXG4gICAgICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZXh0LndpZGdldC5wcm9wcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHByb3AgPSB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHRoaXMuY3VycmVudC5wYXJhbXNbcHJvcC5uYW1lXSA9IHRoaXMuY3VycmVudC5wYXJhbXNbcHJvcC5uYW1lXSB8fCB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBiaW5kaW5nOiBudWxsXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHBhcmFtLl9hY3Rpb24gPSBwYXJhbS5fYWN0aW9uID09ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgID8gJ3VwZGF0ZSdcbiAgICAgICAgICAgICAgICAgICAgOiAnY3JlYXRlJ1xuICAgICAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICBwcm9wOiBwcm9wLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbTogcGFyYW0sXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuaXRlbXMgPSBpdGVtcztcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuY29udGV4dCxcbiAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5pdGVtcyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcblxuICAgICAgICAgICAgaGFzUHJvcHM6IGZ1bmN0aW9uKHRhYikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbnRleHQud2lkZ2V0ICYmIHRoaXMuY29udGV4dC53aWRnZXQucHJvcHMpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvcC50YWIgPT0gdGFiKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBXaWRnZXRzRWRpdG9yID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFdpZGdldHNMaXN0Vmlld2VyLCBXaWRnZXRzTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICB3aWRnZXQ6IE9iamVjdFxuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgIHByb3RvOiBmdW5jdGlvbih3aWRnZXQpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiB3aWRnZXQuaWQsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtczoge30sXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHZhciBwYXJhbXMgPSB7fTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgd2lkZ2V0LnByb3BzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb3AgPSB3aWRnZXQucHJvcHNbaV07XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtc1twcm9wLm5hbWVdID0gcHJvcC50eXBlICE9ICdtdWx0aXBsZSdcbiAgICAgICAgICAgICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hY3Rpb246ICdjcmVhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRpbmc6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmluZGluZzogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRhdGEucGFyYW1zID0gcGFyYW1zO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCBTaGVsbCwgdW5kZWZpbmVkKTtcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1hY3Rpb25zJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1hY3Rpb25zJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXG4gICAgICAgICAgICBjYXRlZ29yeTogT2JqZWN0LFxuICAgICAgICAgICAgZG9tYWluOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3RcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGl0ZW0sIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSk7XG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtYnJhbmQnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWJyYW5kJyxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUpO1xuIiwiKGZ1bmN0aW9uKCQsVnVlLCB1bmRlZmluZWQpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWNhdGVnb3JpZXMnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWNhdGVnb3JpZXMnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgY2F0ZWdvcmllczogQXJyYXksXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUpO1xuIiwiKGZ1bmN0aW9uKCQsVnVlLCB1bmRlZmluZWQpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWNvbnRhaW5lcicsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtY29udGFpbmVyJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBjYXRlZ29yeTogT2JqZWN0LFxuICAgICAgICB9LFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuZ2xvYmFscywgdGhpcy5zZXR0aW5ncywgdGhpcy5wYWdlLCB0aGlzLmNhdGVnb3J5KTtcbiAgICAgICAgICAgIC8vIHJldHVybiB7XG4gICAgICAgICAgICAvLyAgICAgcGFnZTogdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5wYWdlXG4gICAgICAgICAgICAvLyB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIHJlYWR5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKHRoaXMuZ2xvYmFscywgdGhpcy5zZXR0aW5ncywgdGhpcy5wYWdlKTtcbiAgICAgICAgLy8gfVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSk7XG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtZG9tYWlucycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZG9tYWlucycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBkb21haW5zOiBBcnJheSxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUpO1xuIiwiKGZ1bmN0aW9uKCQsVnVlLCB1bmRlZmluZWQpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXBhZ2UnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXBhZ2UnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUpO1xuIiwiKGZ1bmN0aW9uKCQsVnVlLCB1bmRlZmluZWQpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXBhZ2VzJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wYWdlcycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBwYWdlczogQXJyYXksXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlKTtcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XG5cbiAgICB2YXIgUGFsZXR0ZUl0ZW0gPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXBhbGV0dGUtaXRlbScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcGFsZXR0ZS1pdGVtJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9LFxuICAgICAgICBjb21wdXRlZDoge1xuICAgICAgICAgICAgdGh1bWJuYWlsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJy9idW5kbGVzLycgKyB0aGlzLndpZGdldC5wcm92aWRlci5hbGlhcyArICcvJyArIHRoaXMud2lkZ2V0LnRodW1ibmFpbC5wYXRoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICByZWFkeTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBTb3J0YWJsZS5jcmVhdGUodGhpcy4kZWwsIHtcbiAgICAgICAgICAgICAgICBncm91cDoge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnd2lkZ2V0cycsXG4gICAgICAgICAgICAgICAgICAgIHB1bGw6ICdjbG9uZScsXG4gICAgICAgICAgICAgICAgICAgIHB1dDogZmFsc2VcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogMTUwLFxuICAgICAgICAgICAgICAgIHNvcnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIC8vIG9uU3RhcnQ6IGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhldnQpO1xuICAgICAgICAgICAgICAgIC8vICAgICAkKGV2dC5pdGVtKS5odG1sKCc8Yj5EYXRhPC9iPicpO1xuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICAvLyBzZXREYXRhOiBmdW5jdGlvbiAoZGF0YVRyYW5zZmVyLCBkcmFnRWwpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coZHJhZ0VsKTtcbiAgICAgICAgICAgICAgICAvLyAgICAgJChkcmFnRWwpLmh0bWwoJzxiPkhlbGxvPC9iPicpO1xuICAgICAgICAgICAgICAgIC8vICAgICAvLyBkYXRhVHJhbnNmZXIuc2V0RGF0YSgnVGV4dCcsIGRyYWdFbC50ZXh0Q29udGVudCk7XG4gICAgICAgICAgICAgICAgLy8gfSxcbiAgICAgICAgICAgICAgICAvLyBzZXREYXRhOiBmdW5jdGlvbihkYXRhVHJhbnNmZXIsIGRyYWdFbCkge1xuICAgICAgICAgICAgICAgIC8vICAgICBkYXRhVHJhbnNmZXIuc2V0RGF0YSgnVGV4dCcsIGRyYWdFbC50ZXh0Q29udGVudCk7XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyAkKHRoaXMuJGVsKS5kcmFnZ2FibGUoe1xuICAgICAgICAgICAgLy8gICAgIGNvbm5lY3RUb1NvcnRhYmxlOiBcIi5nZS5nZS1zdGFja2VkXCIsXG4gICAgICAgICAgICAvLyAgICAgaGVscGVyOiBcImNsb25lXCIsXG4gICAgICAgICAgICAvLyAgICAgcmV2ZXJ0OiBcImludmFsaWRcIlxuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXBhbGV0dGUnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXBhbGV0dGUnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgY2F0ZWdvcnk6IE9iamVjdFxuICAgICAgICB9LFxuICAgICAgICBjb21wb25lbnRzOiB7XG4gICAgICAgICAgICAncGFsZXR0ZS1pdGVtJzogUGFsZXR0ZUl0ZW1cbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSk7XG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtc291cmNlcycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtc291cmNlcycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBzb3VyY2VzOiBBcnJheSxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUpO1xuIiwiLy8gKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgdW5kZWZpbmVkKSB7XG4vL1xuLy8gICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXN0YWNrZWQnLCB7XG4vLyAgICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXN0YWNrZWQnLFxuLy8gICAgICAgICBtaXhpbnM6IFsgQ29yZS5TdGFja2VkIF1cbi8vICAgICB9KTtcbi8vXG4vLyB9KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKCQsVnVlLCB1bmRlZmluZWQpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXN0dWInLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXN0dWInLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICB9LFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSk7XG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtdGFyZ2V0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC10YXJnZXQnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICB9LFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSk7XG4iLCJTaGVsbCA9IHdpbmRvdy5TaGVsbCB8fCB7fTtcblNoZWxsLldpZGdldHMgPSB3aW5kb3cuU2hlbGwuV2lkZ2V0cyB8fCB7fTtcblxuKGZ1bmN0aW9uKCQsIFZ1ZSwgU2hlbGwsIHVuZGVmaW5lZCkge1xuXG4gICAgU2hlbGwuV2lkZ2V0ID1cbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC13aWRnZXQnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXdpZGdldCcsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxuICAgICAgICAgICAgc3RhY2s6IE9iamVjdCxcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcbiAgICAgICAgfSxcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB0aGlzLmVkaXRhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLndpZGdldCA9IHRoaXMuJHJvb3QuJHJlZnMuc2hlbGwuZ2V0V2lkZ2V0KHRoaXMuZGF0YS50eXBlKTtcblxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnZGF0YS5wYXJhbXMnLCBmdW5jdGlvbihwYXJhbXMpIHtcblxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHJlY3VyKHBhcmFtcykge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgIGZvcih2YXIga2V5IGluIHBhcmFtcykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW1zW2tleV1bJ2JpbmRpbmcnXSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVba2V5XSA9IHNlbGYuJGludGVycG9sYXRlKHBhcmFtc1trZXldWydiaW5kaW5nJ10pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCQuaXNBcnJheShwYXJhbXNba2V5XVsndmFsdWUnXSkpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlW2tleV0gPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBwYXJhbXNba2V5XVsndmFsdWUnXS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVtrZXldW2ldID0gcmVjdXIocGFyYW1zW2tleV1bJ3ZhbHVlJ11baV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVtrZXldID0gcGFyYW1zW2tleV1bJ3ZhbHVlJ107XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2VsZi5iaW5kaW5ncyA9IHJlY3VyKHNlbGYuZGF0YS5wYXJhbXMpO1xuXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgIGRlZXA6IHRydWUsXG4gICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB3aWRnZXQ6IHRoaXMud2lkZ2V0LFxuICAgICAgICAgICAgICAgIGJpbmRpbmdzOiB0aGlzLmJpbmRpbmdzLFxuICAgICAgICAgICAgICAgIGVkaXRhYmxlOiB0aGlzLmVkaXRhYmxlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgbWV0aG9kczoge1xuXG4gICAgICAgICAgICBsb2NrV2lkZ2V0OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgdW5sb2NrV2lkZ2V0OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZG9BcHBseTogZnVuY3Rpb24obW9kZWwpIHtcblxuICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5kYXRhLCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG1vZGVsKSksIHtcbiAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogdGhpcy5kYXRhLl9hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy5kYXRhLl9hY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIDogJ3VwZGF0ZSdcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHNob3dTZXR0aW5nczogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGlhbG9nID0gbmV3IFNoZWxsLldpZGdldHMuTW9kYWxFZGl0b3Ioe1xuXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogdGhpcy53aWRnZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbDogdGhpcy5kYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudDogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGEpKVxuICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vd25lci5kb0FwcGx5KHRoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS4kbW91bnQoKS4kYXBwZW5kVG8oJCgnYm9keScpLmdldCgwKSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICByZW1vdmVXaWRnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKCdyZW1vdmVXaWRnZXQnLCB7IGl0ZW06IHRoaXMuZGF0YSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgU2hlbGwpO1xuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSkge1xuXG4gICAgdmFyIFBhcmFtU3RyaW5nID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLXBhcmFtcy1zdHJpbmcnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMtcGFyYW1zLXN0cmluZycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBpZDogU3RyaW5nLFxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgUGFyYW1SaWNoID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLXBhcmFtcy1yaWNoJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcy1yaWNoJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGlkOiBTdHJpbmcsXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBQYXJhbVNvdXJjZSA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1wYXJhbXMtc291cmNlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcy1zb3VyY2UnLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgaWQ6IFN0cmluZyxcbiAgICAgICAgICAgIGl0ZW06IE9iamVjdCxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIFBhcmFtTXVsdGlwbGUgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtcGFyYW1zLW11bHRpcGxlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcy1tdWx0aXBsZScsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBpZDogU3RyaW5nLFxuICAgICAgICAgICAgaXRlbTogT2JqZWN0LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxuICAgICAgICB9LFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaXRlbXM6IHRoaXMuaXRlbS5pdGVtc1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyByZWFkeTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vICAgICB0aGlzLml0ZW1zID0gW107XG4gICAgICAgIC8vIH1cbiAgICB9KTtcblxuICAgIHZhciBQYXJhbXMgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtcGFyYW1zJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcycsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBvd25lcjogT2JqZWN0LFxuICAgICAgICAgICAgdGFiOiBTdHJpbmcsXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcbiAgICAgICAgfVxuICAgIH0pO1xuXG5cbiAgICB2YXIgUGFyYW1NdWx0aXBsZUxpc3RWaWV3ZXIgPVxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtcGFyYW1zLW11bHRpcGxlLWxpc3QnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMtcGFyYW1zLW11bHRpcGxlLWxpc3QnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBwcm9wOiBPYmplY3QsXG4gICAgICAgICAgICBwYXJhbTogT2JqZWN0LFxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgdmFyIFBhcmFtTXVsdGlwbGVNb2RhbEVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1wYXJhbXMtbXVsdGlwbGUtZGlhbG9nJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcy1tdWx0aXBsZS1kaWFsb2cnLFxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdkYXRhJyldLFxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaXRlbXM6IHRoaXMuaXRlbXMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICByZWFkeTogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmNvbnRleHQpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGV4dC5wcm9wLnByb3BzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHRoaXMuY29udGV4dC5wcm9wLnByb3BzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHRoaXMuY3VycmVudFtwcm9wLm5hbWVdID0gdGhpcy5jdXJyZW50W3Byb3AubmFtZV0gfHwge307XG5cbiAgICAgICAgICAgICAgICBwYXJhbS5fYWN0aW9uID0gcGFyYW0uX2FjdGlvbiA9PSAndXBkYXRlJ1xuICAgICAgICAgICAgICAgICAgICA/ICd1cGRhdGUnXG4gICAgICAgICAgICAgICAgICAgIDogJ2NyZWF0ZSdcbiAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogcHJvcCxcbiAgICAgICAgICAgICAgICAgICAgcGFyYW06IHBhcmFtLFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLml0ZW1zID0gaXRlbXM7XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB2YXIgUGFyYW1NdWx0aXBsZUVkaXRvciA9XG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cy1wYXJhbXMtbXVsdGlwbGUtZWRpdG9yJywge1xuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFBhcmFtTXVsdGlwbGVMaXN0Vmlld2VyLCBQYXJhbU11bHRpcGxlTW9kYWxFZGl0b3IpXSxcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1wYXJhbXMtbXVsdGlwbGUtZWRpdG9yJyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIHByb3A6IE9iamVjdCxcbiAgICAgICAgICAgIHBhcmFtOiBPYmplY3QsXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXG4gICAgICAgIH0sXG4gICAgICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMpO1xuICAgICAgICB9XG4gICAgfSk7XG5cblxuICAgIHZhciBQYXJhbXNMaXN0ID1cbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLXBhcmFtcy1saXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzLXBhcmFtcy1saXN0JyxcbiAgICAgICAgY29tcG9uZW50czoge1xuICAgICAgICAgICAgJ3BhcmFtcy1zdHJpbmcnOiBQYXJhbVN0cmluZyxcbiAgICAgICAgICAgICdwYXJhbXMtcmljaCc6IFBhcmFtUmljaCxcbiAgICAgICAgICAgICdwYXJhbXMtc291cmNlJzogUGFyYW1Tb3VyY2UsXG4gICAgICAgICAgICAncGFyYW1zLW11bHRpcGxlJzogUGFyYW1NdWx0aXBsZSxcbiAgICAgICAgfSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIG93bmVyOiBPYmplY3QsXG4gICAgICAgICAgICB0YWI6IFN0cmluZyxcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
