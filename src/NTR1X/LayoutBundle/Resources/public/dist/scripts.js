
(function($, Vue, Core, Shell, undefined) {

    $(document).ready(function() {

        $('[data-vue-public]').each(function(index, element) {

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
        })
    });

})(jQuery, Vue, Core, Shell);

(function(Vue, $, Core) {

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

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

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

})(Vue, jQuery, Landing);

(function(Vue, $, Core) {

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

Core = window.Core || {};

(function($, Vue, Core, undefined) {

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

})(jQuery, Vue, Core);

Core = window.Core || {};

(function($, Vue, Core, undefined) {

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

})(jQuery, Vue, Core);

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

})(Vue, jQuery, Core, Shell, undefined);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

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

})(Vue, jQuery, Landing);



Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Feedback =
    Vue.component('landing-feedback', {
        template: '#landing-feedback',
    });

})(Vue, jQuery, Landing);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Footer =
    Vue.component('landing-footer', {
        template: '#landing-footer',
    });

})(Vue, jQuery, Landing);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Gallery =
    Vue.component('landing-gallery', {
        template: '#landing-gallery',
    });

    Landing.GalleryFull =
    Vue.component('landing-gallery-full', {
        template: '#landing-gallery-full',
    });

})(Vue, jQuery, Landing);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

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

})(Vue, jQuery, Landing);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

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

})(Vue, jQuery, Landing);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Storage =
    Vue.component('landing-pricing', {
        template: '#landing-pricing',
    });

})(Vue, jQuery, Landing);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Storage =
    Vue.component('landing-storage', {
        template: '#landing-storage',
    });

    Landing.StorageFull =
    Vue.component('landing-storage-full', {
        template: '#landing-storage-full',
    });

})(Vue, jQuery, Landing);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Super =
    Vue.component('landing-super', {
        template: '#landing-super',
    });

})(Vue, jQuery, Landing);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Video =
    Vue.component('landing-video', {
        template: '#landing-video',
    });

})(Vue, jQuery, Landing);

Landing = window.Landing || {};

(function(Vue, $, Landing, undefined) {

    Landing.Usecases =
    Vue.component('landing-usecases', {
        template: '#landing-usecases',
    });

})(Vue, jQuery, Landing);

(function($,Vue, undefined) {

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

})(jQuery, Vue);

(function($,Vue, undefined) {

    Vue.component('shell-brand', {
        template: '#shell-brand',
    });

})(jQuery, Vue);

(function($,Vue, undefined) {

    Vue.component('shell-container', {
        template: '#shell-container',
        props: {
            globals: Object,
            settings: Object,
            page: Object,
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

Shell = window.Shell || {};

(function($, Vue, Core, Shell, undefined) {

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

                                            var widget = shell.getWidget(w);

                                            // TODO Initialize params in service layer

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

    Vue.component('shell-domains', {
        template: '#shell-domains',
        props: {
            domains: Array,
            globals: Object,
        },
    });

})(jQuery, Vue);

(function($, Vue, Shell, undefined) {

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

})(jQuery, Vue, Shell);

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
            });
        }
    });

    Vue.component('shell-palette', {
        template: '#shell-palette',
        props: {
            globals: Object,
            category: Object,
            categories: Array,
        },
        components: {
            'palette-item': PaletteItem
        },
        methods: {
            trigger: function(event, item, context) {
                console.log(event, item, context);
                this.$dispatch(event, { item: item, context: context });
            },
        },
    });

})(jQuery, Vue);

(function($, Vue, Shell, undefined) {

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

            Vue.service('shell', {

                getWidget: (id) => {

                    for (var i = 0; i < this.settings.widgets.length; i++) {
                        var w = this.settings.widgets[i];
                        if (w.id == id) {
                            return w;
                        }
                    }

                    return null;
                },
            });

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

            this.$watch('settings.categories', (categories) => {

                var category = null;
                if (categories.length > 0) {
                    category = categories[0];
                    // var sub = categories[0];
                    // if (categories.length > 0) {
                    //     category = sub.categories[0];
                    // }
                }
                this.globals.selection.category = category;
            }, {
                immediate: true,
            });

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

            getWidget: function(id) {

                for (var i = 0; i < this.settings.widgets.length; i++) {
                    var w = this.settings.widgets[i];
                    if (w.id == id) {
                        return w;
                    }
                }

                return null;
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

})(jQuery, Vue, Shell, undefined);

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

    Vue.component('shell-storages', {
        template: '#shell-storages',
        props: {
            storages: Array,
            globals: Object,
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

            this.widget = shell.getWidget(this.model.type);
            this.decorator = this.decorators.alternatives[this.widget.tag] || this.decorators.fallback;

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

})(jQuery, Vue, Shell);

(function($,Vue, undefined) {

    Vue.component('shell-target', {
        template: '#shell-target',
        props: {
        },
    });

})(jQuery, Vue);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaXZhdGUuanMiLCJwdWJsaWMuanMiLCJiaW5kaW5ncy9iaW5kaW5ncy5qcyIsImNvbXBvbmVudHMvZm9ybS5qcyIsImNvbXBvbmVudHMvZ3JpZC5qcyIsImNvbXBvbmVudHMvaW5saW5lLmpzIiwiY29tcG9uZW50cy9tb2RhbC5qcyIsImRvbWFpbnMvZG9tYWlucy5qcyIsImRpcmVjdGl2ZXMvY29tYm8uanMiLCJkaXJlY3RpdmVzL2RhdGUuanMiLCJkaXJlY3RpdmVzL3RhZ3MuanMiLCJmaWx0ZXJzL2luZGV4LmpzIiwiaG9va3MvbW9kYWwuanMiLCJwYWdlcy9wYWdlcy5qcyIsImxhbmRpbmcvbGFuZGluZy5qcyIsInBhcmFtcy9wYXJhbXMuanMiLCJzY2hlbWVzL3NjaGVtZXMuanMiLCJzZXJ2aWNlcy9wb3J0YWxzLmpzIiwic2VydmljZXMvc2VjdXJpdHkuanMiLCJzZXR0aW5ncy9zZXR0aW5ncy5qcyIsInN0b3JhZ2VzL3N0b3JhZ2VzLmpzIiwid2lkZ2V0cy93aWRnZXRzLmpzIiwicGFnZXMvc291cmNlcy9zb3VyY2VzLmpzIiwicGFnZXMvd2lkZ2V0cy93aWRnZXRzLmpzIiwibGFuZGluZy9hY2NvdW50L2FjY291bnQuanMiLCJsYW5kaW5nL2JlbmVmaXRzL2JlbmVmaXRzLmpzIiwibGFuZGluZy9jb250YWN0cy9jb250YWN0cy5qcyIsImxhbmRpbmcvZmVlZGJhY2svZmVlZGJhY2suanMiLCJsYW5kaW5nL2Zvb3Rlci9mb290ZXIuanMiLCJsYW5kaW5nL2dhbGxlcnkvZ2FsbGVyeS5qcyIsImxhbmRpbmcvaGVhZGVyL2hlYWRlci5qcyIsImxhbmRpbmcvbWFuYWdlL21hbmFnZS5qcyIsImxhbmRpbmcvcHJpY2luZy9wcmljaW5nLmpzIiwibGFuZGluZy9zdG9yYWdlL3N0b3JhZ2UuanMiLCJsYW5kaW5nL3N1cGVyL3N1cGVyLmpzIiwibGFuZGluZy92aWRlby92aWRlby5qcyIsImxhbmRpbmcvdXNlY2FzZXMvdXNlY2FzZXMuanMiLCJzaGVsbC9hY3Rpb25zL2FjdGlvbnMuanMiLCJzaGVsbC9icmFuZC9icmFuZC5qcyIsInNoZWxsL2NvbnRhaW5lci9jb250YWluZXIuanMiLCJzaGVsbC9kZWNvcmF0b3IvZGVjb3JhdG9yLmpzIiwic2hlbGwvY2F0ZWdvcmllcy9jYXRlZ29yaWVzLmpzIiwic2hlbGwvZG9tYWlucy9kb21haW5zLmpzIiwic2hlbGwvbG9hZGVyL2xvYWRlci5qcyIsInNoZWxsL3BhZ2UvcGFnZS5qcyIsInNoZWxsL3BhZ2VzL3BhZ2VzLmpzIiwic2hlbGwvcGFsZXR0ZS9wYWxldHRlLmpzIiwic2hlbGwvc2hlbGwvc2hlbGwuanMiLCJzaGVsbC9zb3VyY2VzL3NvdXJjZXMuanMiLCJzaGVsbC9zdGFja2VkL3N0YWNrZWQuanMiLCJzaGVsbC9zdG9yYWdlcy9zdG9yYWdlcy5qcyIsInNoZWxsL3N0dWIvc3R1Yi5qcyIsInNoZWxsL3dpZGdldC93aWRnZXQuanMiLCJzaGVsbC90YXJnZXQvdGFyZ2V0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEVBO0FDQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIiLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICQoJ1tkYXRhLXZ1ZS1wdWJsaWNdJykuZWFjaChmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGRhdGEgPSAkKGVsZW1lbnQpLmRhdGEoKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBBcHAgPSBWdWUuZXh0ZW5kKHtcclxuICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBWdWUuc2VydmljZSgnc2VjdXJpdHknLCBDb3JlLlNlY3VyaXR5RmFjdG9yeSh0aGlzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3BvcnRhbHMnLCBDb3JlLlBvcnRhbHNGYWN0b3J5KHRoaXMpKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdmFyIHJvdXRlciA9IG5ldyBWdWVSb3V0ZXIoe1xyXG4gICAgICAgICAgICAgICAgaGlzdG9yeTogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByb3V0ZXIuYmVmb3JlRWFjaChmdW5jdGlvbih0cmFuc2l0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24udG8uYXV0aCAmJiAhcm91dGVyLmFwcC5wcmluY2lwYWwpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uLmFib3J0KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRyYW5zaXRpb24udG8uYW5vbiAmJiByb3V0ZXIuYXBwLnByaW5jaXBhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb24uYWJvcnQoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbi5uZXh0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdmFyIHJvdXRlcyA9IHtcclxuICAgICAgICAgICAgICAgICcvJzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogTGFuZGluZy5MYW5kaW5nUGFnZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAnL2dhbGxlcnknOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBMYW5kaW5nLkxhbmRpbmdHYWxsZXJ5UGFnZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAnL3N0b3JhZ2UnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBMYW5kaW5nLkxhbmRpbmdTdG9yYWdlUGFnZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAnL3NpZ25pbic6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IExhbmRpbmcuTGFuZGluZ1NpZ25pblBhZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgYW5vbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAnL3NpZ251cCc6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IExhbmRpbmcuTGFuZGluZ1NpZ251cFBhZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgYW5vbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAnL21hbmFnZSc6IHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IExhbmRpbmcuTGFuZGluZ01hbmFnZVBhZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAnL21hbmFnZS1jcmVhdGUnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBMYW5kaW5nLkxhbmRpbmdNYW5hZ2VDcmVhdGVQYWdlLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1dGg6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgJy9zaXRlLzpwb3J0YWwvOnBhZ2UnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBTaGVsbC5TaGVsbFB1YmxpYyxcclxuICAgICAgICAgICAgICAgICAgICBhdXRoOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICcvbWFuYWdlLzpwb3J0YWwnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBTaGVsbC5Mb2FkZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBwcml2YXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICcvbWFuYWdlLzpwb3J0YWwvOnBhZ2UnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBTaGVsbC5Mb2FkZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0aDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBwcml2YXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNyZWF0ZVJvdXRlKHBhZ2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBTaGVsbC5TaGVsbFB1YmxpYy5leHRlbmQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZTogcGFnZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChkYXRhLm1vZGVsKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubW9kZWwucGFnZXMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhZ2UgPSBkYXRhLm1vZGVsLnBhZ2VzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIHJvdXRlc1twYWdlLm5hbWVdID0gY3JlYXRlUm91dGUocGFnZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJvdXRlci5tYXAocm91dGVzKTtcclxuXHJcbiAgICAgICAgICAgIHJvdXRlci5zdGFydChBcHAsICQoJ1tkYXRhLXZ1ZS1ib2R5XScsIGVsZW1lbnQpLmdldCgwKSk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcclxuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSkge1xyXG5cclxuICAgIHZhciBNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdiaW5kaW5ncy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjYmluZGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgc2V0U3RyYXRlZ3k6IGZ1bmN0aW9uKHN0cmF0ZWd5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2N1cnJlbnQuYmluZGluZy5zdHJhdGVneScsIHN0cmF0ZWd5KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ2V0U3RyYXRlZ3k6IGZ1bmN0aW9uKHN0cmF0ZWd5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy4kZ2V0KCdjdXJyZW50LmJpbmRpbmcuc3RyYXRlZ3knKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuY3VycmVudC5iaW5kaW5nKSB0aGlzLmN1cnJlbnQuYmluZGluZyA9IHt9O1xyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2JpbmRpbmdzJywge1xyXG5cclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkFjdGlvbk1peGluKE1vZGFsRWRpdG9yKV0sXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xyXG4iLCJWdWUuY29tcG9uZW50KCd2LWZvcm0nLCB7XHJcblxyXG5cdHByb3BzOiB7XHJcblx0XHRhY3Rpb246IFN0cmluZyxcclxuXHRcdG1ldGhvZDogU3RyaW5nLFxyXG5cdFx0aW5pdDogT2JqZWN0LFxyXG5cdFx0ZG9uZTogRnVuY3Rpb24sXHJcblx0XHRmYWlsOiBGdW5jdGlvbixcclxuXHRcdG1vZGVsOiBPYmplY3QsXHJcblx0fSxcclxuXHJcblx0Ly8gcmVwbGFjZTogZmFsc2UsXHJcblxyXG5cdC8vIHRlbXBsYXRlOiBgXHJcblx0Ly8gXHQ8Zm9ybT5cclxuXHQvLyBcdFx0PHNsb3Q+PC9zbG90PlxyXG5cdC8vIFx0PC9mb3JtPlxyXG5cdC8vIGAsXHJcblxyXG5cdGFjdGl2YXRlOiBmdW5jdGlvbihkb25lKSB7XHJcblxyXG5cdFx0dGhpcy5vcmlnaW5hbCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCkpO1xyXG5cclxuXHRcdCQodGhpcy4kZWwpXHJcblxyXG5cdFx0XHQub24oJ3N1Ym1pdCcsIChlKSA9PiB7XHJcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdHRoaXMuc3VibWl0KCk7XHJcblx0XHRcdH0pXHJcblx0XHRcdC5vbigncmVzZXQnLCAoZSkgPT4ge1xyXG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHR0aGlzLnJlc2V0KCk7XHJcblx0XHRcdH0pXHJcblxyXG5cdFx0ZG9uZSgpO1xyXG5cdH0sXHJcblxyXG5cdGRhdGE6IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdG1vZGVsOiB0aGlzLm1vZGVsXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cdG1ldGhvZHM6IHtcclxuXHJcblx0XHRzdWJtaXQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdFx0Ly8gZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHRcdFx0Ly8gY29uc29sZS5sb2codGhpcy5tb2RlbCk7XHJcblxyXG5cdFx0XHQkLmFqYXgoe1xyXG5cdFx0XHRcdHVybDogdGhpcy5hY3Rpb24sXHJcblx0XHRcdFx0bWV0aG9kOiB0aGlzLm1ldGhvZCxcclxuXHRcdFx0XHRjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcblx0XHRcdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbClcclxuXHRcdFx0fSlcclxuXHRcdFx0LmRvbmUoKGQpID0+IHtcclxuXHRcdFx0XHRpZiAoZG9uZSBpbiB0aGlzKSB0aGlzLmRvbmUoZCk7XHJcblx0XHRcdH0pXHJcblx0XHRcdC5mYWlsKGZ1bmN0aW9uKGUpIHsgaWYgKGZhaWwgaW4gdGhpcykgdGhpcy5mYWlsKGUpOyB9LmJpbmQodGhpcykpXHJcblx0XHR9LFxyXG5cclxuXHRcdHJlc2V0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCB0aGlzLm9yaWdpbmFsKTtcclxuXHRcdH1cclxuXHR9LFxyXG59KTsiLCIoZnVuY3Rpb24oJCwgVnVlLCB1bmRlZmluZWQpIHtcclxuXHJcblx0Ly8gdmFyIG1vZGVsID0ge1xyXG5cdC8vIFx0bGlzdDogW11cclxuXHQvLyB9O1xyXG5cdC8vXHJcblx0Ly8gdmFyIGJvZHkgPSBWdWUuZXh0ZW5kKHtcclxuXHQvLyBcdGNyZWF0ZWQ6IGZ1bmN0aW9uKCkgIHsgdGhpcy4kZGlzcGF0Y2goJ3JlZ2lzdGVyLWJvZHknLCB0aGlzKSB9LFxyXG5cdC8vIH0pO1xyXG5cclxuXHRWdWUuY29tcG9uZW50KCdncmlkLXRhYmxlJywge1xyXG5cclxuXHRcdHJlcGxhY2U6IGZhbHNlLFxyXG5cclxuXHRcdHByb3BzOiB7XHJcblx0XHRcdGQ6IEFycmF5XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG5cdFx0Ly8gXHRyZXR1cm4ge1xyXG5cdFx0Ly8gXHRcdGl0ZW1zOiB0aGlzLmQuc2xpY2UoMClcclxuXHRcdC8vIFx0fVxyXG5cdFx0Ly8gfSxcclxuXHJcblx0XHRtZXRob2RzOiB7XHJcblxyXG5cdFx0XHRhZGQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCdhc2Rhc2QnKTtcclxuXHRcdFx0XHR0aGlzLml0ZW1zLnB1c2goe30pO1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKHRoaXMuaXRlbXMpO1xyXG5cdFx0XHR9LFxyXG5cclxuXHRcdFx0cmVtb3ZlOiBmdW5jdGlvbihpbmRleCkge1xyXG5cdFx0XHRcdHRoaXMuaXRlbXMuc3BsaWNlKGluZGV4LCAxKTtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHR9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlKTtcclxuIiwiVnVlLmNvbXBvbmVudCgnaW5saW5lLXRleHQnLFxyXG5cdFZ1ZS5leHRlbmQoe1xyXG5cdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnIF0sXHJcblx0XHR0ZW1wbGF0ZTogYFxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxyXG5cdFx0XHRcdDxpbnB1dCBjbGFzcz1cImlubGluZS1jb250cm9sXCIgdHlwZT1cInRleHRcIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiIC8+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0YFxyXG5cdH0pXHJcbik7XHJcblxyXG5WdWUuY29tcG9uZW50KCdpbmxpbmUtY2hlY2tib3gnLFxyXG5cdFZ1ZS5leHRlbmQoe1xyXG5cdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnIF0sXHJcblx0XHR0ZW1wbGF0ZTogYFxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxyXG5cdFx0XHRcdDxpbnB1dCBjbGFzcz1cImlubGluZS1jaGVja2JveFwiIHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCIgLz5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRgXHJcblx0fSlcclxuKTtcclxuXHJcblZ1ZS5jb21wb25lbnQoJ2lubGluZS1zZWxlY3QnLFxyXG5cdFZ1ZS5leHRlbmQoe1xyXG5cdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnLCAnb3B0aW9ucycgXSxcclxuXHRcdHRlbXBsYXRlOiBgXHJcblx0XHRcdDxkaXYgY2xhc3M9XCJpbmxpbmUtY29udGFpbmVyXCI+XHJcblx0XHRcdFx0PHNlbGVjdCBjbGFzcz1cImlubGluZS1jb250cm9sMVwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCI+XHJcblx0XHRcdFx0XHQ8b3B0aW9uIHYtZm9yPVwib3B0aW9uIGluIG9wdGlvbnNcIiB2YWx1ZT1cInt7IG9wdGlvbi5rZXkgfX1cIj57eyBvcHRpb24udmFsdWUgfX08L29wdGlvbj5cclxuXHRcdFx0XHQ8L3NlbGVjdD5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRgXHJcblx0fSlcclxuKTtcclxuXHJcblZ1ZS5jb21wb25lbnQoJ2lubGluZS12YWx1ZScsXHJcblx0VnVlLmV4dGVuZCh7XHJcblx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScsICdjbGFzcycgXSxcclxuXHRcdHRlbXBsYXRlOiBgXHJcblx0XHRcdDxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIiAvPlxyXG5cdFx0XHQ8c3BhbiA6Y2xhc3M9XCJjbGFzc1wiPnt7IHZhbHVlIH19PC9zcGFuPlxyXG5cdFx0YFxyXG5cdH0pXHJcbik7XHJcbiIsIlZ1ZS5jb21wb25lbnQoJ21vZGFsJywge1xyXG5cclxuICAgIHByb3BzOiB7XHJcbiAgICAgICAgaWQ6IFN0cmluZyxcclxuICAgICAgICBjdXJyZW50OiBPYmplY3QsXHJcbiAgICAgICAgb3JpZ2luYWw6IE9iamVjdCxcclxuICAgIH0sXHJcblxyXG4gICAgbWV0aG9kczoge1xyXG5cclxuICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goJ3N1Ym1pdCcsIHRoaXMuY3VycmVudCk7XHJcbiAgICAgICAgICAgIC8vIE9iamVjdC5hc3NpZ24odGhpcy5vcmlnaW5hbCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmN1cnJlbnQpKSk7XHJcbiAgICAgICAgICAgICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goJ3Jlc2V0JywgdGhpcy5jdXJyZW50KTtcclxuICAgICAgICAgICAgLy8gT2JqZWN0LmFzc2lnbih0aGlzLmN1cnJlbnQsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5vcmlnaW5hbCkpKTtcclxuICAgICAgICAgICAgJChlLnRhcmdldCkuY2xvc2VzdCgnLm1vZGFsJykubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgdmFyIExpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnZG9tYWlucy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIE1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJyldLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdkb21haW5zJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zJyxcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICB2YXIgU2V0dGluZ3NMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLXNldHRpbmdzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTZXR0aW5nc01vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RvbWFpbnMtc2V0dGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNldHRpbmdzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RvbWFpbnMtc2V0dGluZ3MnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTZXR0aW5nc0xpc3RWaWV3ZXIsIFNldHRpbmdzTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkb21haW5zLXNldHRpbmdzJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIlZ1ZS5kaXJlY3RpdmUoJ2NvbWJvJywge1xyXG5cclxuXHRiaW5kOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0aWYgKCQuZm4udGFnc2lucHV0KSB7XHJcblxyXG5cdFx0XHQkKHRoaXMuZWwpLnNlbGVjdDIoe1xyXG5cdFx0XHRcdHRhZ3M6IHRydWUsXHJcblx0XHRcdFx0bXVsdGlwbGU6IGZhbHNlLFxyXG5cdFx0XHRcdGNyZWF0ZVRhZzogZnVuY3Rpb24gKHBhcmFtcykge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdFx0aWQ6IHBhcmFtcy50ZXJtLFxyXG5cdFx0XHRcdFx0XHR0ZXh0OiBwYXJhbXMudGVybSxcclxuXHRcdFx0XHRcdFx0bmV3T3B0aW9uOiB0cnVlXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHR1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuXHR9LFxyXG5cdHVuYmluZDogZnVuY3Rpb24gKCkge1xyXG5cdH1cclxufSk7XHJcbiIsIlZ1ZS5kaXJlY3RpdmUoJ2RhdGUnLCB7XHJcblxyXG5cdGJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdFxyXG5cdFx0aWYgKCQuZm4uZGF0ZXBpY2tlcikge1xyXG5cclxuXHRcdFx0JCh0aGlzLmVsKS5kYXRlcGlja2VyKHtcclxuXHRcdFx0XHRhdXRvY2xvc2U6IHRydWUsXHJcblx0XHRcdFx0dG9kYXlIaWdobGlnaHQ6IHRydWUsXHJcblx0XHRcdFx0Zm9ybWF0OiBcInl5eXktbW0tZGRcIlxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cdHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG5cdH0sXHJcblx0dW5iaW5kOiBmdW5jdGlvbiAoKSB7XHJcblx0fVxyXG59KTtcclxuIiwiVnVlLmRpcmVjdGl2ZSgndGFncycsIHtcclxuXHJcblx0YmluZDogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdGlmICgkLmZuLnRhZ3NpbnB1dCkge1xyXG5cclxuXHRcdFx0JCh0aGlzLmVsKS50YWdzaW5wdXQoe1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9LFxyXG5cdHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xyXG5cdH0sXHJcblx0dW5iaW5kOiBmdW5jdGlvbiAoKSB7XHJcblx0fVxyXG59KTtcclxuIiwiVnVlLmZpbHRlcigndGVtcGxhdGUnLCBmdW5jdGlvbiAoc3RyaW5nLCBkYXRhKSB7XHJcblxyXG5cdHZhciByZSA9IC8keyhbXn1dKyl9L2c7XHJcblx0cmV0dXJuIHN0cmluZy5yZXBsYWNlKHJlLCBmdW5jdGlvbihtYXRjaCwga2V5KSB7XHJcblx0XHRyZXR1cm4gZGF0YVtrZXldO1xyXG5cdH0pO1xyXG59KTtcclxuXHJcblZ1ZS5maWx0ZXIoJ2Fzc2lnbicsIGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZTEsIHNvdXJjZTIsIHNvdXJjZTMpIHtcclxuXHJcblx0cmV0dXJuIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UxLCBzb3VyY2UyLCBzb3VyY2UzKTtcclxufSk7XHJcblxyXG5WdWUuZmlsdGVyKCdjb3B5JywgZnVuY3Rpb24gKHNvdXJjZSkge1xyXG5cclxuXHRyZXR1cm4gbmV3IFZ1ZSh7XHJcblx0XHRkYXRhOiBzb3VyY2UgIT0gbnVsbFxyXG5cdFx0XHQ/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc291cmNlKSlcclxuXHRcdFx0OiBudWxsXHJcblx0fSkuJGRhdGE7XHJcbn0pO1xyXG5cclxuVnVlLmZpbHRlcignY2xvbmUnLCBmdW5jdGlvbiAoc291cmNlKSB7XHJcblxyXG5cdHJldHVybiBuZXcgVnVlKHtcclxuXHRcdGRhdGE6IHNvdXJjZSAhPSBudWxsXHJcblx0XHRcdD8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzb3VyY2UpKVxyXG5cdFx0XHQ6IG51bGxcclxuXHR9KS4kZGF0YTtcclxufSk7XHJcbiIsIihmdW5jdGlvbigkKSB7XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcG9zaXRpb24oZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIG1vZGFsID0gJChlbGVtZW50KSxcclxuICAgICAgICAgICAgICAgIGRpYWxvZyA9ICQoJy5tb2RhbC1kaWFsb2cnLCBtb2RhbCk7XHJcblxyXG4gICAgICAgICAgICBtb2RhbC5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgZGlhbG9nLmNzcyhcIm1hcmdpbi10b3BcIiwgTWF0aC5tYXgoMCwgKCQod2luZG93KS5oZWlnaHQoKSAtIGRpYWxvZy5oZWlnaHQoKSkgLyAyKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkKCQoZG9jdW1lbnQpLCAnLm1vZGFsLm1vZGFsLWNlbnRlcicpLm9uKCdzaG93LmJzLm1vZGFsJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICByZXBvc2l0aW9uKGUudGFyZ2V0KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcclxuXHJcbiAgICB2YXIgTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdtYWluJyldLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMnLFxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBTZXR0aW5nc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc2V0dGluZ3MtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zZXR0aW5ncy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU2V0dGluZ3NNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zZXR0aW5ncy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc2V0dGluZ3MtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNldHRpbmdzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNldHRpbmdzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oU2V0dGluZ3NMaXN0Vmlld2VyLCBTZXR0aW5nc01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc2V0dGluZ3MnLFxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBNZXRhc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtbWV0YXMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1tZXRhcy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgTWV0YXNNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1tZXRhcy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtbWV0YXMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIE1ldGFzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLW1ldGFzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oTWV0YXNMaXN0Vmlld2VyLCBNZXRhc01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtbWV0YXMnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgdW5kZWZpbmVkKTtcclxuIiwiTGFuZGluZyA9IHdpbmRvdy5MYW5kaW5nIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKFZ1ZSwgJCwgTGFuZGluZywgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgTGFuZGluZy5MYW5kaW5nUGFnZSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXBhZ2UnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ0dhbGxlcnlQYWdlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctZ2FsbGVyeS1wYWdlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctZ2FsbGVyeS1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ1N0b3JhZ2VQYWdlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctc3RvcmFnZS1wYWdlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctc3RvcmFnZS1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ1NpZ25pblBhZ2UgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1zaWduaW4tcGFnZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXNpZ25pbi1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ1NpZ251cFBhZ2UgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1zaWdudXAtcGFnZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXNpZ251cC1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ1Byb2ZpbGVQYWdlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctcHJvZmlsZS1wYWdlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctcHJvZmlsZS1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ01hbmFnZVBhZ2UgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1tYW5hZ2UtcGFnZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLW1hbmFnZS1wYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuTGFuZGluZ01hbmFnZUNyZWF0ZVBhZ2UgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1tYW5hZ2UtY3JlYXRlLXBhZ2UnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1tYW5hZ2UtY3JlYXRlLXBhZ2UnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgTGFuZGluZyk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcclxuXHJcbiAgICB2YXIgUGFyYW1TdHJpbmcgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLXN0cmluZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtc3RyaW5nJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBpZDogU3RyaW5nLFxyXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgUGFyYW1SaWNoID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1yaWNoJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1yaWNoJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBpZDogU3RyaW5nLFxyXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgUGFyYW1Tb3VyY2UgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLXNvdXJjZScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtc291cmNlJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBpZDogU3RyaW5nLFxyXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgUGFyYW1NdWx0aXBsZSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtbXVsdGlwbGUnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLW11bHRpcGxlJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBpZDogU3RyaW5nLFxyXG4gICAgICAgICAgICBpdGVtOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaXRlbXM6IHRoaXMuaXRlbS5pdGVtc1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBQYXJhbXMgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgb3duZXI6IE9iamVjdCxcclxuICAgICAgICAgICAgdGFiOiBTdHJpbmcsXHJcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBQYXJhbU11bHRpcGxlTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtbXVsdGlwbGUtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYXJhbXMtbXVsdGlwbGUtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIHByb3A6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFyYW06IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgZ2V0TGFiZWw6IGZ1bmN0aW9uKGl0ZW0pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wLmRpc3BsYXkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdm0gPSBuZXcgVnVlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdm0uJGludGVycG9sYXRlKHRoaXMucHJvcC5kaXNwbGF5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiAnPGl0ZW0+JztcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgUGFyYW1CaW5kaW5nc01vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1iaW5kaW5ncy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLWJpbmRpbmdzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ2JpbmRpbmcnKSBdLFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaXRlbXM6IHRoaXMuaXRlbXMsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgdmFyIGJpbmRpbmcgPSB0aGlzLmN1cnJlbnQuYmluZGluZyB8fCB7fTtcclxuICAgICAgICAgICAgaWYgKCFiaW5kaW5nLnN0cmF0ZWd5KSBiaW5kaW5nLnN0cmF0ZWd5ID0gJ2ludGVycG9sYXRlJztcclxuXHJcbiAgICAgICAgICAgIGJpbmRpbmcucGFyYW1zID0gYmluZGluZy5wYXJhbXMgfHwge307XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5jb250ZXh0LnByb3AucHJvcHMpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZXh0LnByb3AucHJvcHMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb3AgPSB0aGlzLmNvbnRleHQucHJvcC5wcm9wc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyYW0gPSBiaW5kaW5nLnBhcmFtc1twcm9wLm5hbWVdID0gYmluZGluZy5wYXJhbXNbcHJvcC5uYW1lXSB8fCB7fTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyYW0uX2FjdGlvbiA9IHBhcmFtLl9hY3Rpb24gPT0gJ3VwZGF0ZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyAndXBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICA6ICdjcmVhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogcHJvcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW06IHBhcmFtLFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHNldCgnY3VycmVudC5iaW5kaW5nJywgYmluZGluZyk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNldCgnaXRlbXMnLCBpdGVtcyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHNldFN0cmF0ZWd5OiBmdW5jdGlvbihzdHJhdGVneSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdjdXJyZW50LmJpbmRpbmcuc3RyYXRlZ3knLCBzdHJhdGVneSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdldFN0cmF0ZWd5OiBmdW5jdGlvbihzdHJhdGVneSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGdldCgnY3VycmVudC5iaW5kaW5nLnN0cmF0ZWd5Jyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLWJpbmRpbmdzJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuQWN0aW9uTWl4aW4oUGFyYW1CaW5kaW5nc01vZGFsRWRpdG9yKV0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgUGFyYW1NdWx0aXBsZU1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhcmFtcy1tdWx0aXBsZS1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLW11bHRpcGxlLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignZGF0YScpXSxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLml0ZW1zLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjcmVhdGVkJywgUGFyYW1NdWx0aXBsZU1vZGFsRWRpdG9yKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb250ZXh0LnByb3AucHJvcHMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHRoaXMuY29udGV4dC5wcm9wLnByb3BzW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtID0gdGhpcy5jdXJyZW50W3Byb3AubmFtZV0gPSB0aGlzLmN1cnJlbnRbcHJvcC5uYW1lXSB8fCB7IHZhbHVlOiBudWxsIH07XHJcblxyXG4gICAgICAgICAgICAgICAgcGFyYW0uX2FjdGlvbiA9IHBhcmFtLl9hY3Rpb24gPT0gJ3VwZGF0ZSdcclxuICAgICAgICAgICAgICAgICAgICA/ICd1cGRhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgOiAnY3JlYXRlJ1xyXG4gICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb3A6IHByb3AsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyYW06IHBhcmFtLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLiRzZXQoJ2l0ZW1zJywgaXRlbXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgUGFyYW1NdWx0aXBsZUVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYXJhbXMtbXVsdGlwbGUtZWRpdG9yJywge1xyXG4gICAgICAgIG1peGluczogW0NvcmUuRWRpdG9yTWl4aW4oUGFyYW1NdWx0aXBsZUxpc3RWaWV3ZXIsIFBhcmFtTXVsdGlwbGVNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhcmFtcy1tdWx0aXBsZS1lZGl0b3InLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIHByb3A6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFyYW06IE9iamVjdCxcclxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgdmFyIFBhcmFtc0xpc3QgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFyYW1zLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFyYW1zLWxpc3QnLFxyXG4gICAgICAgIGNvbXBvbmVudHM6IHtcclxuICAgICAgICAgICAgJ3BhcmFtcy1zdHJpbmcnOiBQYXJhbVN0cmluZyxcclxuICAgICAgICAgICAgJ3BhcmFtcy1yaWNoJzogUGFyYW1SaWNoLFxyXG4gICAgICAgICAgICAncGFyYW1zLXNvdXJjZSc6IFBhcmFtU291cmNlLFxyXG4gICAgICAgICAgICAncGFyYW1zLW11bHRpcGxlJzogUGFyYW1NdWx0aXBsZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIG93bmVyOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHRhYjogU3RyaW5nLFxyXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcclxuXHJcbiAgICB2YXIgTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzY2hlbWVzLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbiwgQ29yZS5UYWJzTWl4aW4oJ21haW4nKV0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NjaGVtZXMnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihMaXN0Vmlld2VyLCBNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMnLFxyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHZhciBTZXR0aW5nc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcy1zZXR0aW5ncy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMtc2V0dGluZ3MtbGlzdCcsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5MaXN0Vmlld2VyTWl4aW5dLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFNldHRpbmdzTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcy1zZXR0aW5ncy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2NoZW1lcy1zZXR0aW5ncy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU2V0dGluZ3NFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2NoZW1lcy1zZXR0aW5ncycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFNldHRpbmdzTGlzdFZpZXdlciwgU2V0dGluZ3NNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NjaGVtZXMtc2V0dGluZ3MnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgdW5kZWZpbmVkKTtcclxuIiwiQ29yZSA9IHdpbmRvdy5Db3JlIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgQ29yZS5Qb3J0YWxzRmFjdG9yeSA9IGZ1bmN0aW9uKG93bmVyKSB7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcblxyXG4gICAgICAgICAgICBsb2FkOiAoZGF0YSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLmdldCgnL3dzL3BvcnRhbHMnLCBkYXRhKS50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHJlc29sdmUoZCk7IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgcmVqZWN0KGUpOyB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KSxcclxuXHJcbiAgICAgICAgICAgIGNyZWF0ZTogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5wb3N0KCcvd3MvcG9ydGFscycsIGRhdGEpLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgcmVzb2x2ZShkKTsgfSxcclxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyByZWplY3QoZSk7IH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pLFxyXG5cclxuICAgICAgICAgICAgcmVtb3ZlOiAoZGF0YSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLmRlbGV0ZSgnL3dzL3BvcnRhbHMnLCBkYXRhKS50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHJlc29sdmUoZCk7IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgcmVqZWN0KGUpOyB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KSxcclxuXHJcbiAgICAgICAgICAgIGdldDogKGRhdGEpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5nZXQoYC93cy9wb3J0YWxzLyR7ZGF0YS5pZH1gKS50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHJlc29sdmUoZCk7IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgcmVqZWN0KGUpOyB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xyXG4iLCJDb3JlID0gd2luZG93LkNvcmUgfHwge307XHJcblxyXG4oZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBDb3JlLlNlY3VyaXR5RmFjdG9yeSA9IGZ1bmN0aW9uKG93bmVyKSB7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcblxyXG4gICAgICAgICAgICBzaWdudXA6IChkYXRhKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgb3duZXIuJGh0dHAucG9zdCgnL3dzL3NpZ251cCcsIGRhdGEpLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgb3duZXIucHJpbmNpcGFsID0gZC5kYXRhLnByaW5jaXBhbDsgcmVzb2x2ZShkKTsgfSxcclxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyBvd25lci5wcmluY2lwYWwgPSBudWxsOyByZWplY3QoZSk7IH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pLFxyXG5cclxuICAgICAgICAgICAgc2lnbmluOiAoZGF0YSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIG93bmVyLiRodHRwLnBvc3QoJy93cy9zaWduaW4nLCBkYXRhKS50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IG93bmVyLnByaW5jaXBhbCA9IGQuZGF0YS5wcmluY2lwYWw7IHJlc29sdmUoZCk7IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgb3duZXIucHJpbmNpcGFsID0gbnVsbDsgcmVqZWN0KGUpOyB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9KSxcclxuXHJcbiAgICAgICAgICAgIHNpZ25vdXQ6ICgpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBvd25lci4kaHR0cC5wb3N0KCcvd3Mvc2lnbm91dCcpLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgb3duZXIucHJpbmNpcGFsID0gbnVsbDsgcmVzb2x2ZShkKTsgfSxcclxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyByZWplY3QoZSk7IH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcclxuXHJcbiAgICB2YXIgTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2V0dGluZ3MtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NldHRpbmdzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluLCBDb3JlLlRhYnNNaXhpbignZG9tYWlucycpXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2V0dGluZ3MnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5BY3Rpb25NaXhpbihNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBwdXNoOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL3NldHRpbmdzL2RvLXVwZGF0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZG9uZSgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgZCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwdWxsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL3NldHRpbmdzJyxcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5kb25lKChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBkKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgdmFyIFN0b3JhZ2VzTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzdG9yYWdlcy1saXN0Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3N0b3JhZ2VzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTdG9yYWdlc01vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3N0b3JhZ2VzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzdG9yYWdlcy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBjaGVjazogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY2hlY2snKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTdG9yYWdlc0VkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzdG9yYWdlcycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFN0b3JhZ2VzTGlzdFZpZXdlciwgU3RvcmFnZXNNb2RhbEVkaXRvcildLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3N0b3JhZ2VzJyxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTdG9yYWdlc1ZhcmlhYmxlc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc3RvcmFnZXMtdmFyaWFibGVzLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc3RvcmFnZXMtdmFyaWFibGVzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTdG9yYWdlc1ZhcmlhYmxlc01vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3N0b3JhZ2VzLXZhcmlhYmxlcy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc3RvcmFnZXMtdmFyaWFibGVzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTdG9yYWdlc1ZhcmlhYmxlc0VkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzdG9yYWdlcy12YXJpYWJsZXMnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTdG9yYWdlc1ZhcmlhYmxlc0xpc3RWaWV3ZXIsIFN0b3JhZ2VzVmFyaWFibGVzTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzdG9yYWdlcy12YXJpYWJsZXMnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgdW5kZWZpbmVkKTtcclxuIiwiKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSkge1xyXG5cclxuICAgIHZhciBMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3dpZGdldHMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyN3aWRnZXRzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBNb2RhbEVkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCd3aWRnZXRzLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyN3aWRnZXRzLWRpYWxvZycsXHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5Nb2RhbEVkaXRvck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnd2lkZ2V0cycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKExpc3RWaWV3ZXIsIE1vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjd2lkZ2V0cycsXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xyXG4iLCIoZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgdmFyIFNvdXJjZXNMaXN0Vmlld2VyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLWxpc3QnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTGlzdFZpZXdlck1peGluXSxcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTb3VyY2VzTW9kYWxFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1kaWFsb2cnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBjaGVjazogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY2hlY2snKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBTb3VyY2VzRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMnLCB7XHJcbiAgICAgICAgbWl4aW5zOiBbQ29yZS5FZGl0b3JNaXhpbihTb3VyY2VzTGlzdFZpZXdlciwgU291cmNlc01vZGFsRWRpdG9yKV0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtc291cmNlcycsXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU291cmNlc1BhcmFtc0xpc3RWaWV3ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtc291cmNlcy1wYXJhbXMtbGlzdCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLXBhcmFtcy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU291cmNlc1BhcmFtc01vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXNvdXJjZXMtcGFyYW1zLWRpYWxvZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLXBhcmFtcy1kaWFsb2cnLFxyXG4gICAgICAgIG1peGluczogW0NvcmUuTW9kYWxFZGl0b3JNaXhpbl0sXHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgU291cmNlc1BhcmFtc0VkaXRvciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy1zb3VyY2VzLXBhcmFtcycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFNvdXJjZXNQYXJhbXNMaXN0Vmlld2VyLCBTb3VyY2VzUGFyYW1zTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy1zb3VyY2VzLXBhcmFtcycsXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBDb3JlLCB1bmRlZmluZWQpO1xyXG4iLCJTaGVsbCA9IHdpbmRvdy5TaGVsbCB8fCB7fTtcclxuU2hlbGwuV2lkZ2V0cyA9IHdpbmRvdy5TaGVsbC5XaWRnZXRzIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSwgU2hlbGwsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIHZhciBXaWRnZXRzTGlzdFZpZXdlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdwYWdlcy13aWRnZXRzLWxpc3QnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjcGFnZXMtd2lkZ2V0cy1saXN0JyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkxpc3RWaWV3ZXJNaXhpbl0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBnZXRXaWRnZXQ6IGZ1bmN0aW9uKHcpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5nbG9iYWxzLndpZGdldHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgd2lkZ2V0ID0gdGhpcy5nbG9iYWxzLndpZGdldHNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHcudHlwZSA9PSB3aWRnZXQuaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdpZGdldDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBXaWRnZXRzTW9kYWxFZGl0b3IgPSBTaGVsbC5XaWRnZXRzLk1vZGFsRWRpdG9yID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3BhZ2VzLXdpZGdldHMtZGlhbG9nJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3BhZ2VzLXdpZGdldHMtZGlhbG9nJyxcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLk1vZGFsRWRpdG9yTWl4aW4sIENvcmUuVGFic01peGluKCdkYXRhJyldLFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IHRoaXMuY29udGV4dC53aWRnZXQucHJvcHNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETyBNb3ZlIHRvIHNlcnZpY2UgbGF5ZXJcclxuICAgICAgICAgICAgICAgIHZhciBwYXJhbSA9IHRoaXMuY3VycmVudC5wYXJhbXNbcHJvcC5uYW1lXSA9IHRoaXMuY3VycmVudC5wYXJhbXNbcHJvcC5uYW1lXSB8fCB7XHJcbiAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogJ2NyZWF0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IChwcm9wLnR5cGUgPT0gJ211bHRpcGxlJyA/IFtdIDogbnVsbCksXHJcbiAgICAgICAgICAgICAgICAgICAgYmluZGluZzoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJhdGVneTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbjogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiAocHJvcC50eXBlID09ICdtdWx0aXBsZScgPyBudWxsIDogdW5kZWZpbmVkKSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBwYXJhbS5fYWN0aW9uID0gcGFyYW0uX2FjdGlvbiA9PSAndXBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgID8gJ3VwZGF0ZSdcclxuICAgICAgICAgICAgICAgICAgICA6ICdjcmVhdGUnXHJcbiAgICAgICAgICAgICAgICA7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogcHJvcCxcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbTogcGFyYW0sXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXRlbXMgPSBpdGVtcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgY29udGV4dDogdGhpcy5jb250ZXh0LFxyXG4gICAgICAgICAgICAgICAgaXRlbXM6IHRoaXMuaXRlbXMsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcblxyXG4gICAgICAgICAgICBoYXNQcm9wczogZnVuY3Rpb24odGFiKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb250ZXh0LndpZGdldCAmJiB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnRleHQud2lkZ2V0LnByb3BzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcm9wID0gdGhpcy5jb250ZXh0LndpZGdldC5wcm9wc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3AudGFiID09IHRhYikgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIFdpZGdldHNFZGl0b3IgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgncGFnZXMtd2lkZ2V0cycsIHtcclxuICAgICAgICBtaXhpbnM6IFtDb3JlLkVkaXRvck1peGluKFdpZGdldHNMaXN0Vmlld2VyLCBXaWRnZXRzTW9kYWxFZGl0b3IpXSxcclxuICAgICAgICB0ZW1wbGF0ZTogJyNwYWdlcy13aWRnZXRzJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICB3aWRnZXQ6IE9iamVjdFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG5cclxuICAgICAgICAgICAgcHJvdG86IGZ1bmN0aW9uKHdpZGdldCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHdpZGdldC5pZCxcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW1zID0ge307XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB3aWRnZXQucHJvcHMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb3AgPSB3aWRnZXQucHJvcHNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyBNb3ZlIHRvIHNlcnZpY2UgbGF5ZXJcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbXNbcHJvcC5uYW1lXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogJ2NyZWF0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAocHJvcC50eXBlID09ICdtdWx0aXBsZScgPyBbXSA6IG51bGwpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5kaW5nOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJhdGVneTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb246IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IChwcm9wLnR5cGUgPT0gJ211bHRpcGxlJyA/IG51bGwgOiB1bmRlZmluZWQpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZGF0YS5wYXJhbXMgPSBwYXJhbXM7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgU2hlbGwsIHVuZGVmaW5lZCk7XHJcbiIsIkxhbmRpbmcgPSB3aW5kb3cuTGFuZGluZyB8fCB7fTtcclxuXHJcbihmdW5jdGlvbihWdWUsICQsIExhbmRpbmcsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIHZhciB2YWxpZGF0aW9uID0ge1xyXG4gICAgICAgIGVtYWlsOiBcIi9eKFthLXpBLVowLTlfXFxcXC5cXFxcLV0rKUAoW2EtekEtWjAtOV9cXFxcLlxcXFwtXSspXFxcXC4oW2EtekEtWjAtOV17Mix9KSQvZ1wiLFxyXG4gICAgfTtcclxuXHJcbiAgICBMYW5kaW5nLlNpZ25pbiA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWFjY291bnQtc2lnbmluJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctYWNjb3VudC1zaWduaW4nLFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgZm9ybTogdGhpcy5mb3JtLFxyXG4gICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogdmFsaWRhdGlvbixcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJHNldCgnZm9ybScsIHtcclxuICAgICAgICAgICAgICAgIGVtYWlsOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IG51bGwsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBzaWduaW46IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdzZWN1cml0eScpLnNpZ25pbih7XHJcbiAgICAgICAgICAgICAgICAgICAgZW1haWw6IHRoaXMuZm9ybS5lbWFpbCxcclxuICAgICAgICAgICAgICAgICAgICBwYXNzd29yZDogdGhpcy5mb3JtLnBhc3N3b3JkLFxyXG4gICAgICAgICAgICAgICAgfSkudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyB0aGlzLiRyb3V0ZXIuZ28oJy8nKTsgfSxcclxuICAgICAgICAgICAgICAgICAgICAoZSkgPT4geyB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuU2lnbnVwID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctYWNjb3VudC1zaWdudXAnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1hY2NvdW50LXNpZ251cCcsXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBmb3JtOiB0aGlzLmZvcm0sXHJcbiAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiB2YWxpZGF0aW9uLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy4kc2V0KCdmb3JtJywge1xyXG4gICAgICAgICAgICAgICAgZW1haWw6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogbnVsbCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHNpZ251cDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3NlY3VyaXR5Jykuc2lnbnVwKHtcclxuICAgICAgICAgICAgICAgICAgICBlbWFpbDogdGhpcy5mb3JtLmVtYWlsLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkOiB0aGlzLmZvcm0ucGFzc3dvcmQsXHJcbiAgICAgICAgICAgICAgICB9KS50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIChkKSA9PiB7IHRoaXMuJHJvdXRlci5nbygnLycpOyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgTGFuZGluZy5Qcm9maWxlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctYWNjb3VudC1wcm9maWxlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctYWNjb3VudC1wcm9maWxlJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIExhbmRpbmcpO1xyXG4iLCIiLCIiLCJMYW5kaW5nID0gd2luZG93LkxhbmRpbmcgfHwge307XHJcblxyXG4oZnVuY3Rpb24oVnVlLCAkLCBMYW5kaW5nLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBMYW5kaW5nLkZlZWRiYWNrID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctZmVlZGJhY2snLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1mZWVkYmFjaycsXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBMYW5kaW5nKTtcclxuIiwiTGFuZGluZyA9IHdpbmRvdy5MYW5kaW5nIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKFZ1ZSwgJCwgTGFuZGluZywgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgTGFuZGluZy5Gb290ZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1mb290ZXInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1mb290ZXInLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgTGFuZGluZyk7XHJcbiIsIkxhbmRpbmcgPSB3aW5kb3cuTGFuZGluZyB8fCB7fTtcclxuXHJcbihmdW5jdGlvbihWdWUsICQsIExhbmRpbmcsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIExhbmRpbmcuR2FsbGVyeSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLWdhbGxlcnknLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1nYWxsZXJ5JyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuR2FsbGVyeUZ1bGwgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1nYWxsZXJ5LWZ1bGwnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1nYWxsZXJ5LWZ1bGwnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgTGFuZGluZyk7XHJcbiIsIkxhbmRpbmcgPSB3aW5kb3cuTGFuZGluZyB8fCB7fTtcclxuXHJcbihmdW5jdGlvbihWdWUsICQsIExhbmRpbmcsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIExhbmRpbmcuSGVhZGVyID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctaGVhZGVyJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctaGVhZGVyJyxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHNpZ25vdXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3NlY3VyaXR5Jykuc2lnbm91dCgpLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgdGhpcy4kcm91dGVyLmdvKCcvJyk7IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBMYW5kaW5nKTtcclxuIiwiTGFuZGluZyA9IHdpbmRvdy5MYW5kaW5nIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKFZ1ZSwgJCwgTGFuZGluZywgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgTGFuZGluZy5NYW5hZ2UgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1tYW5hZ2UnLCB7XHJcblxyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctbWFuYWdlJyxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSArICh3aW5kb3cubG9jYXRpb24ucG9ydCA/ICc6JyArIHdpbmRvdy5sb2NhdGlvbi5wb3J0OiAnJyksXHJcbiAgICAgICAgICAgICAgICBwb3J0YWxzOiB0aGlzLnBvcnRhbHMsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcblxyXG4gICAgICAgICAgICByZWZyZXNoOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdwb3J0YWxzJykubG9hZCgpLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgdGhpcy4kc2V0KCdwb3J0YWxzJywgZC5kYXRhLnBvcnRhbHMpOyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIChlKSA9PiB7IHRoaXMuJHNldCgncG9ydGFscycsIFtdKTsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24oaWQpIHtcclxuICAgICAgICAgICAgICAgIFZ1ZS5zZXJ2aWNlKCdwb3J0YWxzJykucmVtb3ZlKHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogaWQsXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgKGQpID0+IHsgdGhpcy5yZWZyZXNoKCk7IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBMYW5kaW5nLk1hbmFnZUNyZWF0ZSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLW1hbmFnZS1jcmVhdGUnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1tYW5hZ2UtY3JlYXRlJyxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGZvcm06IHRoaXMuZm9ybSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJHNldCgnZm9ybScsIHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiBudWxsLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBWdWUuc2VydmljZSgncG9ydGFscycpLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMuZm9ybS50aXRsZSxcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihcclxuICAgICAgICAgICAgICAgICAgICAoZCkgPT4geyB0aGlzLiRyb3V0ZXIuZ28oJy9tYW5hZ2UnKX0sXHJcbiAgICAgICAgICAgICAgICAgICAgKGUpID0+IHsgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBMYW5kaW5nKTtcclxuIiwiTGFuZGluZyA9IHdpbmRvdy5MYW5kaW5nIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKFZ1ZSwgJCwgTGFuZGluZywgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgTGFuZGluZy5TdG9yYWdlID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctcHJpY2luZycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXByaWNpbmcnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgTGFuZGluZyk7XHJcbiIsIkxhbmRpbmcgPSB3aW5kb3cuTGFuZGluZyB8fCB7fTtcclxuXHJcbihmdW5jdGlvbihWdWUsICQsIExhbmRpbmcsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIExhbmRpbmcuU3RvcmFnZSA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXN0b3JhZ2UnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1zdG9yYWdlJyxcclxuICAgIH0pO1xyXG5cclxuICAgIExhbmRpbmcuU3RvcmFnZUZ1bGwgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1zdG9yYWdlLWZ1bGwnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy1zdG9yYWdlLWZ1bGwnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgTGFuZGluZyk7XHJcbiIsIkxhbmRpbmcgPSB3aW5kb3cuTGFuZGluZyB8fCB7fTtcclxuXHJcbihmdW5jdGlvbihWdWUsICQsIExhbmRpbmcsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIExhbmRpbmcuU3VwZXIgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnbGFuZGluZy1zdXBlcicsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNsYW5kaW5nLXN1cGVyJyxcclxuICAgIH0pO1xyXG5cclxufSkoVnVlLCBqUXVlcnksIExhbmRpbmcpO1xyXG4iLCJMYW5kaW5nID0gd2luZG93LkxhbmRpbmcgfHwge307XHJcblxyXG4oZnVuY3Rpb24oVnVlLCAkLCBMYW5kaW5nLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBMYW5kaW5nLlZpZGVvID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2xhbmRpbmctdmlkZW8nLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjbGFuZGluZy12aWRlbycsXHJcbiAgICB9KTtcclxuXHJcbn0pKFZ1ZSwgalF1ZXJ5LCBMYW5kaW5nKTtcclxuIiwiTGFuZGluZyA9IHdpbmRvdy5MYW5kaW5nIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKFZ1ZSwgJCwgTGFuZGluZywgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgTGFuZGluZy5Vc2VjYXNlcyA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdsYW5kaW5nLXVzZWNhc2VzJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2xhbmRpbmctdXNlY2FzZXMnLFxyXG4gICAgfSk7XHJcblxyXG59KShWdWUsIGpRdWVyeSwgTGFuZGluZyk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgdmFyIHNjYWxlID0gMTtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1hY3Rpb25zJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWFjdGlvbnMnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGNhdGVnb3J5OiBPYmplY3QsXHJcbiAgICAgICAgICAgIGRvbWFpbjogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3RcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGl0ZW0sIGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHpvb206IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBzY2FsZSArPSAoZXZlbnQgPT0gJ2luJykgPyAwLjEgOiAtMC4xO1xyXG4gICAgICAgICAgICAgICAgJCgnLmdlLmdlLXBhZ2UnKS5jc3MoJ3RyYW5zZm9ybScsICdzY2FsZSgnICsgc2NhbGUgKyAnKScpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUpO1xyXG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWJyYW5kJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLWJyYW5kJyxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUpO1xyXG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWNvbnRhaW5lcicsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1jb250YWluZXInLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuZ2xvYmFscywgdGhpcy5zZXR0aW5ncywgdGhpcy5wYWdlLCB0aGlzLmNhdGVnb3J5KTtcclxuICAgICAgICAgICAgLy8gcmV0dXJuIHtcclxuICAgICAgICAgICAgLy8gICAgIHBhZ2U6IHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24ucGFnZVxyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgLy8gfSxcclxuICAgICAgICAvLyByZWFkeTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKHRoaXMuZ2xvYmFscywgdGhpcy5zZXR0aW5ncywgdGhpcy5wYWdlKTtcclxuICAgICAgICAvLyB9XHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlKTtcclxuIiwiU2hlbGwgPSB3aW5kb3cuU2hlbGwgfHwge307XHJcblxyXG4oZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgdmFyIHJ1bnRpbWUgPSBWdWUuc2VydmljZSgncnVudGltZScsIHtcclxuXHJcbiAgICAgICAgZXZhbHVhdGU6IGZ1bmN0aW9uKHNlbGYsIGIsIHYpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChiICYmIGIuZXhwcmVzc2lvbikge1xyXG5cclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGIuc3RyYXRlZ3kgPT0gJ2V2YWwnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHNlbGYuJGV2YWwoYi5leHByZXNzaW9uKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYi5zdHJhdGVneSA9PSAnd2lyZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gc2VsZi4kZ2V0KGIuZXhwcmVzc2lvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd2YWx1ZScsIHZhbHVlLCBiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLiRpbnRlcnBvbGF0ZShiLmV4cHJlc3Npb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2Fubm90IGV2YWx1YXRlIGV4cHJlc3Npb24nLCBiLmV4cHJlc3Npb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdjtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBldmFsdWF0ZVBhcmFtczogZnVuY3Rpb24oc2VsZiwgcHJvcHMsIHBhcmFtcykge1xyXG5cclxuICAgICAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBwcm9wID0gcHJvcHNbaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW0gPSBwYXJhbXMgJiYgcGFyYW1zW3Byb3AubmFtZV07XHJcbiAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wOiBwcm9wLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtOiBwYXJhbSB8fCB7fSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB7fTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gaXRlbXNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIG4gPSBpdGVtLnByb3AubmFtZTtcclxuICAgICAgICAgICAgICAgIHZhciByID0gaXRlbS5wcm9wLnZhcmlhYmxlO1xyXG4gICAgICAgICAgICAgICAgdmFyIGIgPSBpdGVtLnBhcmFtLmJpbmRpbmc7XHJcbiAgICAgICAgICAgICAgICB2YXIgdiA9IGl0ZW0ucGFyYW0udmFsdWU7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0ucHJvcC50eXBlID09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyBJbXBsZW1lbnRcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbS5wcm9wLnR5cGUgPT0gJ211bHRpcGxlJykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoYiAmJiBiLmV4cHJlc3Npb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2diA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXJyYXkgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHJ1bnRpbWUuZXZhbHVhdGUoc2VsZiwgYiwgdik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdnYgPSByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCQuaXNBcnJheShyZXN1bHQpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcmVzdWx0Lmxlbmd0aDsgaisrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdm0gPSBuZXcgVnVlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IE9iamVjdC5hc3NpZ24oSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzZWxmLiRkYXRhKSksIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiBqLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmVzdWx0W2pdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyYXkucHVzaCh0aGlzLmV2YWx1YXRlUGFyYW1zKHZtLCBpdGVtLnByb3AucHJvcHMsIGIucGFyYW1zKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2diA9IGFycmF5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXJyYXkgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCB2Lmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmkgPSB2W2pdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZpLl9hY3Rpb24gIT0gJ3JlbW92ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJheVtpbmRleCsrXSA9IHRoaXMuZXZhbHVhdGVQYXJhbXMoc2VsZiwgaXRlbS5wcm9wLnByb3BzLCB2aSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZ2ID0gciA/IHsgdmFsdWU6IGFycmF5IH0gOiBhcnJheTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlW25dID0gdnY7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZ2ID0gcnVudGltZS5ldmFsdWF0ZShzZWxmLCBiLCB2KTtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZVtuXSA9IHZ2O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh2YWx1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBmdW5jdGlvbiBzdHViKHRpdGxlLCBzdWJ0aXRsZSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdOVFIxWERlZmF1bHRCdW5kbGUvU3R1YicsXHJcbiAgICAgICAgICAgIF9hY3Rpb246ICdpZ25vcmUnLFxyXG4gICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiB7IHZhbHVlOiB0aXRsZSB9LFxyXG4gICAgICAgICAgICAgICAgc3VidGl0bGU6IHsgdmFsdWU6IHN1YnRpdGxlIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgRGVjb3JhdG9yTWl4aW4gPSB7XHJcblxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBtZXRob2RzOiB7XHJcblxyXG4gICAgICAgICAgICByZW1vdmVXaWRnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goJ3JlbW92ZUNoaWxkV2lkZ2V0JywgeyBpdGVtOiB0aGlzLm1vZGVsIH0pO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZG9BcHBseTogZnVuY3Rpb24obW9kZWwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobW9kZWwpKSwge1xyXG4gICAgICAgICAgICAgICAgICAgIF9hY3Rpb246IHRoaXMubW9kZWwuX2FjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMubW9kZWwuX2FjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6ICd1cGRhdGUnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBzaG93U2V0dGluZ3M6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBkaWFsb2cgPSBuZXcgU2hlbGwuV2lkZ2V0cy5Nb2RhbEVkaXRvcih7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsczogdGhpcy5nbG9iYWxzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvd25lcjogdGhpcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiB0aGlzLndpZGdldFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbDogdGhpcy5tb2RlbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudDogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKSlcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm93bmVyLmRvQXBwbHkodGhpcy5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pLiRtb3VudCgpLiRhcHBlbmRUbygkKCdib2R5JykuZ2V0KDApKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgQmluZGluZ3NNaXhpbiA9IHtcclxuXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBiaW5kaW5nczogdGhpcy5iaW5kaW5ncyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdkYXRhJywgKGRhdGEpID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciBiaW5kaW5ncyA9IHJ1bnRpbWUuZXZhbHVhdGVQYXJhbXModGhpcywgdGhpcy53aWRnZXQucHJvcHMsIHRoaXMubW9kZWwucGFyYW1zKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnYmluZGluZ3MnLCBiaW5kaW5ncyk7XHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ3N0b3JhZ2UnLCAoc3RvcmFnZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdmFyIGJpbmRpbmdzID0gcnVudGltZS5ldmFsdWF0ZVBhcmFtcyh0aGlzLCB0aGlzLndpZGdldC5wcm9wcywgdGhpcy5tb2RlbC5wYXJhbXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdiaW5kaW5ncycsIGJpbmRpbmdzKTtcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnbW9kZWwnLCAobW9kZWwpID0+IHtcclxuICAgICAgICAgICAgICAgIHZhciBiaW5kaW5ncyA9IHJ1bnRpbWUuZXZhbHVhdGVQYXJhbXModGhpcywgdGhpcy53aWRnZXQucHJvcHMsIG1vZGVsLnBhcmFtcylcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnYmluZGluZ3MnLCBiaW5kaW5ncyk7XHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGRlZXA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdmFyIENvbXBvc2l0ZU1peGluID0ge1xyXG5cclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiB0aGlzLmNoaWxkcmVuLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ2l0ZW1zJywgKGl0ZW1zKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gW107XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gaXRlbXNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLl9hY3Rpb24gIT0gJ3JlbW92ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA8IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5zdHViKCkpKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBkZWVwOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBldmVudHM6IHtcclxuXHJcbiAgICAgICAgICAgIHJlbW92ZUNoaWxkV2lkZ2V0OiBmdW5jdGlvbihkYXRhKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBkYXRhLml0ZW07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uX2FjdGlvbiA9PSAnY3JlYXRlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMuJHJlbW92ZShpdGVtKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5fYWN0aW9uID0gJ3JlbW92ZSc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtcyA9IHRoaXMuaXRlbXMuc2xpY2UoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgU29ydGFibGVNaXhpbiA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBmaW5kKGNoaWxkcmVuLCBkb21JbmRleCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gMDtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGggJiYgaW5kZXggPCBkb21JbmRleDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkLl9hY3Rpb24gIT0gJ3JlbW92ZScpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaW5kZXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG5cclxuICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZDogdGhpcy5zZWxlY3RlZCxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy4kcm91dGUucHJpdmF0ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2hlbGwgPSBWdWUuc2VydmljZSgnc2hlbGwnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdzZWxlY3RlZCcsIGZ1bmN0aW9uKHNlbGVjdGVkKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNvcnRhYmxlID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNvcnRhYmxlLmNyZWF0ZSgkKHNlbGVjdG9yLCBzZWxmLiRlbCkuZ2V0KDApLCB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICd3aWRnZXRzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVsbDogJ2Nsb25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogMTUwLFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkFkZDogZnVuY3Rpb24gKGV2dCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhbGV0dGUgPSAkKGV2dC5pdGVtKS5jbG9zZXN0KCcuZ2UuZ2UtcGFsZXR0ZScpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHcgPSAkKGV2dC5pdGVtKS5kYXRhKCd3aWRnZXQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFwYWxldHRlLmxlbmd0aCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGV2dC5pdGVtKS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5pID0gZmluZChzZWxmLml0ZW1zLCBldnQubmV3SW5kZXgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgd2lkZ2V0ID0gc2hlbGwuZ2V0V2lkZ2V0KHcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIEluaXRpYWxpemUgcGFyYW1zIGluIHNlcnZpY2UgbGF5ZXJcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pdGVtcy5zcGxpY2UobmksIDAsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogd2lkZ2V0LmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hY3Rpb246ICdjcmVhdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczogd2lkZ2V0LnBhcmFtc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHdpZGdldC5wYXJhbXMpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB7fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldHM6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiAnY3JlYXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRyYWdnZWQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdnVlOiBldnQuZnJvbS5fX2RyYWdnZWRfXyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiAkKCcuZ2UuZ2Utd2lkZ2V0JywgZXZ0Lml0ZW0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lOiAkKCcuZ2UuZ2Utd2lkZ2V0JywgZXZ0LmNsb25lKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvbnRhaW5lciA9ICQoZXZ0LnRvKS5jbG9zZXN0KCcuZ2UuZ2Utd2lkZ2V0JykuZ2V0KDApLl9fdnVlX187XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5pID0gZmluZChzZWxmLml0ZW1zLCBldnQubmV3SW5kZXgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdJdGVtID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkcmFnZ2VkLnZ1ZS5tb2RlbCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3SXRlbS5fYWN0aW9uID0gJ2NyZWF0ZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgbmV3SXRlbS5yZXNvdXJjZS5pZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBuZXdJdGVtLmlkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnZWQuaXRlbS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuaXRlbXMuc3BsaWNlKG5pLCAwLCBuZXdJdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pdGVtcyA9IGNvbnRhaW5lci5pdGVtcy5zbGljZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25TdGFydDogZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldnQuZnJvbS5fX2RyYWdnZWRfXyA9ICQoJy5nZS5nZS13aWRnZXQnLCBldnQuaXRlbSkuZ2V0KDApLl9fdnVlX187XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25SZW1vdmU6IGZ1bmN0aW9uKGV2dCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRyYWdnZWQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2dWU6IGV2dC5mcm9tLl9fZHJhZ2dlZF9fLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogJCgnLmdlLmdlLXdpZGdldCcsIGV2dC5pdGVtKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lOiAkKCcuZ2UuZ2Utd2lkZ2V0JywgZXZ0LmNsb25lKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGFjayA9ICBkcmFnZ2VkLnZ1ZS4kcGFyZW50LiRwYXJlbnQuJHBhcmVudDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnZWQuY2xvbmUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ2dlZC52dWUubW9kZWwuX2FjdGlvbiA9PSAnY3JlYXRlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2suaXRlbXMuJHJlbW92ZShkcmFnZ2VkLnZ1ZS5tb2RlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcmFnZ2VkLnZ1ZS5tb2RlbC5fYWN0aW9uID0gJ3JlbW92ZSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrLml0ZW1zID0gc3RhY2suaXRlbXMuc2xpY2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblVwZGF0ZTogZnVuY3Rpb24gKGV2dCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9pID0gc2VsZi5pdGVtcy5pbmRleE9mKGV2dC5mcm9tLl9fZHJhZ2dlZF9fLm1vZGVsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5pID0gZmluZChzZWxmLml0ZW1zLCBldnQubmV3SW5kZXgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9pICE9IG5pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLml0ZW1zLnNwbGljZShuaSwgMCwgc2VsZi5pdGVtcy5zcGxpY2Uob2ksIDEpWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuaXRlbXMgPSBzZWxmLml0ZW1zLnNsaWNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkVuZDogZnVuY3Rpb24gKGV2dCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGV2dC5mcm9tLl9fZHJhZ2dlZF9fO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5zb3J0YWJsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc29ydGFibGUuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc29ydGFibGUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdFRhcmdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIHVuc2VsZWN0VGFyZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtZGVjb3JhdG9yLXN0dWInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZGVjb3JhdG9yLXN0dWInLFxyXG4gICAgICAgIG1peGluczogWyBEZWNvcmF0b3JNaXhpbiwgQmluZGluZ3NNaXhpbiBdLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RhY2s6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0b3JhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcclxuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3QsXHJcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxyXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci13aWRnZXQnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZGVjb3JhdG9yLXdpZGdldCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIERlY29yYXRvck1peGluLCBCaW5kaW5nc01peGluIF0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdGFjazogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RvcmFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBtb2RlbDogT2JqZWN0LFxyXG4gICAgICAgICAgICB3aWRnZXQ6IE9iamVjdCxcclxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXHJcbiAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtZGVjb3JhdG9yLWhvcmlzb250YWwnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZGVjb3JhdG9yLWhvcmlzb250YWwnLFxyXG4gICAgICAgIG1peGluczogWyBEZWNvcmF0b3JNaXhpbiwgQ29tcG9zaXRlTWl4aW4sIFNvcnRhYmxlTWl4aW4oJz4uZ2UuZ2UtY29udGVudCA+LndnLndnLWRlZmF1bHQtc3RhY2sgPi53Zy53Zy1jb250ZW50ID4ud2cud2ctdGFibGUgPi53Zy53Zy1yb3cnKSwgQmluZGluZ3NNaXhpbiBdLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RhY2s6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0b3JhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcclxuICAgICAgICAgICAgd2lkZ2V0OiBPYmplY3QsXHJcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxyXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHN0dWI6IGZ1bmN0aW9uKCkgeyByZXR1cm4gc3R1YignSG9yaXNvbnRhbCBTdGFjaycsICdEcm9wIEhlcmUnKTsgfVxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1kZWNvcmF0b3ItdmVydGljYWwnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZGVjb3JhdG9yLXZlcnRpY2FsJyxcclxuICAgICAgICBtaXhpbnM6IFsgRGVjb3JhdG9yTWl4aW4sIENvbXBvc2l0ZU1peGluLCBTb3J0YWJsZU1peGluKCc+LmdlLmdlLWNvbnRlbnQgPi53Zy53Zy1kZWZhdWx0LXN0YWNrID4ud2cud2ctY29udGVudCA+LndnLndnLXRhYmxlJyksIEJpbmRpbmdzTWl4aW4gXSxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdG9yYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0LFxyXG4gICAgICAgICAgICBlZGl0YWJsZTogQm9vbGVhbixcclxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBzdHViOiBmdW5jdGlvbigpIHsgcmV0dXJuIHN0dWIoJ1ZlcnRpY2FsIFN0YWNrJywgJ0Ryb3AgSGVyZScpOyB9XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWRlY29yYXRvci1jYW52YXMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtZGVjb3JhdG9yLWNhbnZhcycsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvbXBvc2l0ZU1peGluLCBTb3J0YWJsZU1peGluKCc+LmdlLmdlLWNvbnRlbnQgPi53Zy53Zy1kZWZhdWx0LXN0YWNrID4ud2cud2ctY29udGVudCA+LndnLndnLXRhYmxlJykgXSxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdG9yYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxyXG4gICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHN0dWI6IGZ1bmN0aW9uKCkgeyByZXR1cm4gc3R1YignVmVydGljYWwgU3RhY2snLCAnRHJvcCBIZXJlJyk7IH1cclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLWNhdGVnb3JpZXMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtY2F0ZWdvcmllcycsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgY2F0ZWdvcmllczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGl0ZW0sIGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtZG9tYWlucycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1kb21haW5zJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBkb21haW5zOiBBcnJheSxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgU2hlbGwsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFNoZWxsLkxvYWRlciA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1sb2FkZXInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtbG9hZGVyJyxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHBvcnRhbDogbnVsbCxcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiBudWxsLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3BvcnRhbHMnKS5nZXQoeyBpZDogdGhpcy4kcm91dGUucGFyYW1zLnBvcnRhbCB9KS50aGVuKFxyXG4gICAgICAgICAgICAgICAgKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ3BvcnRhbCcsIGQuZGF0YS5wb3J0YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgnc2V0dGluZ3MnLCBkLmRhdGEuc2V0dGluZ3MpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1wYWdlJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXBhZ2UnLFxyXG4gICAgICAgIG1peGluczogWyAvKkNvcmUuQ29udGFpbmVyTWl4aW4sIENvcmUuU29ydGFibGVNaXhpbiovIF0sXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBzZXR0aW5nczogT2JqZWN0LFxyXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGRlY29yYXRvcjogdGhpcy5kZWNvcmF0b3IsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiB0aGlzLmRhdGEsXHJcbiAgICAgICAgICAgICAgICBzdG9yYWdlOiB0aGlzLnN0b3JhZ2UsXHJcbiAgICAgICAgICAgICAgICBwYWdlU2V0dGluZ3M6IHt9LFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgcnVudGltZSA9IFZ1ZS5zZXJ2aWNlKCdydW50aW1lJyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmRlY29yYXRvciA9ICdzaGVsbC1kZWNvcmF0b3ItY2FudmFzJztcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0ge307XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcmFnZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ3BhZ2UucmVzb3VyY2UnLCAocmVzb3VyY2UpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNldCgncGFnZVNldHRpbmdzLndpZHRoJywgJzk2MHB4Jyk7IC8vIGRlZmF1bHRcclxuICAgICAgICAgICAgICAgIGlmIChyZXNvdXJjZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAocGFyYW0gaW4gcmVzb3VyY2UucGFyYW1zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHNldCgncGFnZVNldHRpbmdzLicgKyByZXNvdXJjZS5wYXJhbXNbcGFyYW1dLm5hbWUsIHJlc291cmNlLnBhcmFtc1twYXJhbV0udmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgncGFnZS5zdG9yYWdlcycsIChzdG9yYWdlcykgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzdG9yYWdlcykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcmFnZSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0b3JhZ2VzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3QgPSBzdG9yYWdlc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmFnZVtzdC5uYW1lXSA9IHt9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzdC52YXJpYWJsZXMubGVuZ3RoOyBqKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFyaWFibGUgPSBzdC52YXJpYWJsZXNbal07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG9yYWdlW3N0Lm5hbWVdW3ZhcmlhYmxlLm5hbWVdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBydW50aW1lLmV2YWx1YXRlKHRoaXMsIHZhcmlhYmxlLmJpbmRpbmcsIHZhcmlhYmxlLnZhbHVlKSB8fCBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ3N0b3JhZ2UnLCBzdG9yYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZGVlcDogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgncGFnZS5zb3VyY2VzJywgKHNvdXJjZXMpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc291cmNlcykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucHVzaCh0aGlzLmRvUmVxdWVzdChzb3VyY2VzW2ldKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVmZXJyZWQubGVuZ3RoID4gMSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgJC53aGVuLmFwcGx5KHRoaXMsIGRlZmVycmVkKS5kb25lKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtzb3VyY2VzW2ldLm5hbWVdID0gYXJndW1lbnRzW2ldWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2V0KCdkYXRhJywgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGVmZXJyZWQubGVuZ3RoID09IDEpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkWzBdLmRvbmUoZnVuY3Rpb24oZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbc291cmNlc1swXS5uYW1lXSA9IGQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRzZXQoJ2RhdGEnLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBkZWVwOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgZG9SZXF1ZXN0OiBmdW5jdGlvbihzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcXVlcnkgPSB7fTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcy5wYXJhbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcGFyYW0gPSBzLnBhcmFtc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW0uaW4gPT0gJ3F1ZXJ5JyAmJiBwYXJhbS5zcGVjaWZpZWQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHBhcmFtLmJpbmRpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMuJGludGVycG9sYXRlKHBhcmFtLmJpbmRpbmcpIC8vIFRPRE8gSW50ZXJwb2xhdGUgaW4gcGFnZSBjb250ZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBwYXJhbS52YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnlbcGFyYW0ubmFtZV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBzLm1ldGhvZCxcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IHMudXJsLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBxdWVyeSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXBhZ2VzJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXBhZ2VzJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBwYWdlczogQXJyYXksXHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgdmFyIFBhbGV0dGVJdGVtID1cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXBhbGV0dGUtaXRlbScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1wYWxldHRlLWl0ZW0nLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIHdpZGdldDogT2JqZWN0LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb21wdXRlZDoge1xyXG4gICAgICAgICAgICB0aHVtYm5haWw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICcvYnVuZGxlcy8nICsgdGhpcy53aWRnZXQucHJvdmlkZXIuYWxpYXMgKyAnLycgKyB0aGlzLndpZGdldC50aHVtYm5haWwucGF0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS5jcmVhdGUodGhpcy4kZWwsIHtcclxuICAgICAgICAgICAgICAgIGdyb3VwOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3dpZGdldHMnLFxyXG4gICAgICAgICAgICAgICAgICAgIHB1bGw6ICdjbG9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgcHV0OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogMTUwLFxyXG4gICAgICAgICAgICAgICAgc29ydDogZmFsc2UsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXBhbGV0dGUnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcGFsZXR0ZScsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgICAgICBjYXRlZ29yeTogT2JqZWN0LFxyXG4gICAgICAgICAgICBjYXRlZ29yaWVzOiBBcnJheSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbXBvbmVudHM6IHtcclxuICAgICAgICAgICAgJ3BhbGV0dGUtaXRlbSc6IFBhbGV0dGVJdGVtXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhldmVudCwgaXRlbSwgY29udGV4dCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgU2hlbGwsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFNoZWxsLlNoZWxsID0ge1xyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgVnVlLnNlcnZpY2UoJ3NoZWxsJywge1xyXG5cclxuICAgICAgICAgICAgICAgIGdldFdpZGdldDogKGlkKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zZXR0aW5ncy53aWRnZXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3ID0gdGhpcy5zZXR0aW5ncy53aWRnZXRzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAody5pZCA9PSBpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdsb2JhbHMgPSB7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb246IHtcclxuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBwYWdlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBzdG9yYWdlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiB0aGlzLnNldHRpbmdzLFxyXG4gICAgICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWwsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcblxyXG4gICAgU2hlbGwuU2hlbGxQdWJsaWMgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcHVibGljJywge1xyXG4gICAgICAgIG1peGluczogWyBTaGVsbC5TaGVsbCBdLFxyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXB1YmxpYycsXHJcbiAgICB9KTtcclxuXHJcbiAgICBTaGVsbC5TaGVsbFByaXZhdGUgPVxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtcHJpdmF0ZScsIHtcclxuXHJcbiAgICAgICAgbWl4aW5zOiBbIFNoZWxsLlNoZWxsIF0sXHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtcHJpdmF0ZScsXHJcblxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcmVsZXZhbnQoY3VycmVudCwgY29sbGVjdGlvbikge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghY3VycmVudCB8fCBjdXJyZW50Ll9hY3Rpb24gPT0gJ3JlbW92ZScgfHwgKGNvbGxlY3Rpb24gJiYgY29sbGVjdGlvbi5pbmRleE9mKGN1cnJlbnQpIDwgMCkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2xsZWN0aW9uLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYyA9IGNvbGxlY3Rpb25baV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYy5fYWN0aW9uICE9ICdyZW1vdmUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50ICYmIGN1cnJlbnQuX2FjdGlvbiA9PSAncmVtb3ZlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnc2V0dGluZ3MuY2F0ZWdvcmllcycsIChjYXRlZ29yaWVzKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGNhdGVnb3J5ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGlmIChjYXRlZ29yaWVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeSA9IGNhdGVnb3JpZXNbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdmFyIHN1YiA9IGNhdGVnb3JpZXNbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgKGNhdGVnb3JpZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBjYXRlZ29yeSA9IHN1Yi5jYXRlZ29yaWVzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uY2F0ZWdvcnkgPSBjYXRlZ29yeTtcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdtb2RlbC5kb21haW5zJywgKGRvbWFpbnMpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uZG9tYWluID0gcmVsZXZhbnQodGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5kb21haW4sIGRvbWFpbnMpO1xyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ21vZGVsLnBhZ2VzJywgKHBhZ2VzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnBhZ2UgPSByZWxldmFudCh0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnBhZ2UsIHBhZ2VzKTtcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdnbG9iYWxzLnNlbGVjdGlvbi5wYWdlLnNvdXJjZXMnLCAoc291cmNlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5zb3VyY2UgPSByZWxldmFudCh0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnNvdXJjZSwgc291cmNlcyk7XHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnZ2xvYmFscy5zZWxlY3Rpb24ucGFnZS5zdG9yYWdlcycsIChzdG9yYWdlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5zdG9yYWdlID0gcmVsZXZhbnQodGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5zdG9yYWdlLCBzdG9yYWdlcyk7XHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczoge1xyXG5cclxuICAgICAgICAgICAgZ2V0V2lkZ2V0OiBmdW5jdGlvbihpZCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zZXR0aW5ncy53aWRnZXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHcgPSB0aGlzLnNldHRpbmdzLndpZGdldHNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHcuaWQgPT0gaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXZlbnRzOiB7XHJcbiAgICAgICAgICAgIHB1bGw6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL3NldHRpbmdzJyxcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5kb25lKChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBkKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHB1c2g6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL3NldHRpbmdzL2RvLXVwZGF0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuZG9uZSgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5tb2RlbCwgZCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZWxlY3RDYXRlZ29yeTogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5jYXRlZ29yeSA9IGRhdGEuaXRlbTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2VsZWN0RG9tYWluOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLmRvbWFpbiA9IGRhdGEuaXRlbTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2VsZWN0UGFnZTogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxzLnNlbGVjdGlvbi5wYWdlID0gZGF0YS5pdGVtO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZWxlY3RTb3VyY2U6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFscy5zZWxlY3Rpb24uc291cmNlID0gZGF0YS5pdGVtO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZWxlY3RTdG9yYWdlOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdsb2JhbHMuc2VsZWN0aW9uLnN0b3JhZ2UgPSBkYXRhLml0ZW07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgU2hlbGwsIHVuZGVmaW5lZCk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtc291cmNlcycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC1zb3VyY2VzJyxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBzb3VyY2VzOiBBcnJheSxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlKTtcclxuIiwiLy8gKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgdW5kZWZpbmVkKSB7XHJcbi8vXHJcbi8vICAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1zdGFja2VkJywge1xyXG4vLyAgICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXN0YWNrZWQnLFxyXG4vLyAgICAgICAgIG1peGluczogWyBDb3JlLlN0YWNrZWQgXVxyXG4vLyAgICAgfSk7XHJcbi8vXHJcbi8vIH0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XHJcbiIsIihmdW5jdGlvbigkLFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnc2hlbGwtc3RvcmFnZXMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtc3RvcmFnZXMnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIHN0b3JhZ2VzOiBBcnJheSxcclxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlKTtcclxuIiwiKGZ1bmN0aW9uKCQsVnVlLCB1bmRlZmluZWQpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC1zdHViJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI3NoZWxsLXN0dWInLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUpO1xyXG4iLCJTaGVsbCA9IHdpbmRvdy5TaGVsbCB8fCB7fTtcclxuU2hlbGwuV2lkZ2V0cyA9IHdpbmRvdy5TaGVsbC5XaWRnZXRzIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKCQsIFZ1ZSwgU2hlbGwsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFNoZWxsLldpZGdldCA9XHJcbiAgICBWdWUuY29tcG9uZW50KCdzaGVsbC13aWRnZXQnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjc2hlbGwtd2lkZ2V0JyxcclxuICAgICAgICBtaXhpbnM6IFsgLyogQ29yZS5EZWNvcmF0b3JNaXhpbiwgQ29yZS5Db250YWluZXJNaXhpbiwgQ29yZS5Tb3J0YWJsZU1peGluLCBDb3JlLkJpbmRpbmdzTWl4aW4gKi8gXSxcclxuICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcclxuICAgICAgICAgICAgc3RhY2s6IE9iamVjdCxcclxuICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcclxuICAgICAgICAgICAgZGF0YTogT2JqZWN0LFxyXG4gICAgICAgICAgICBzdG9yYWdlOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVjb3JhdG9ycyA9IHtcclxuICAgICAgICAgICAgICAgIGFsdGVybmF0aXZlczoge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICdkZWZhdWx0LXN0YWNrLXBhZ2UnOiBmdW5jdGlvbigpIHsgT2JqZWN0LmFzc2lnbih0aGlzLCB7IHNlbGVjdG9yOiAnLndnLndnLXRhYmxlJywgc3R1Yjogc3R1YignVmVydGljYWwgU3RhY2snLCAnRHJvcCBIZXJlJykgfSkgfSxcclxuICAgICAgICAgICAgICAgICAgICAvLyAnZGVmYXVsdC1zdGFjay1ob3Jpc29udGFsJzogZnVuY3Rpb24oKSB7IE9iamVjdC5hc3NpZ24odGhpcywgeyBzZWxlY3RvcjogJy53Zy53Zy1yb3cnLCBzdHViOiBzdHViKCdIb3Jpc29udGFsIFN0YWNrJywgJ0Ryb3AgSGVyZScpIH0pIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gJ2RlZmF1bHQtc3RhY2stdmVydGljYWwnOiBmdW5jdGlvbigpIHsgT2JqZWN0LmFzc2lnbih0aGlzLCB7IHNlbGVjdG9yOiAnLndnLndnLXRhYmxlJywgc3R1Yjogc3R1YignVmVydGljYWwgU3RhY2snLCAnRHJvcCBIZXJlJykgfSkgfSxcclxuICAgICAgICAgICAgICAgICAgICAnZGVmYXVsdC1zdGFjay1ob3Jpc29udGFsJzogJ3NoZWxsLWRlY29yYXRvci1ob3Jpc29udGFsJyxcclxuICAgICAgICAgICAgICAgICAgICAnZGVmYXVsdC1zdGFjay12ZXJ0aWNhbCc6ICdzaGVsbC1kZWNvcmF0b3ItdmVydGljYWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICdkZWZhdWx0LXN0dWInOiAnc2hlbGwtZGVjb3JhdG9yLXN0dWInLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGZhbGxiYWNrOiAnc2hlbGwtZGVjb3JhdG9yLXdpZGdldCcsXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnd2lkZ2V0Jyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgc2hlbGwgPSBWdWUuc2VydmljZSgnc2hlbGwnKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMud2lkZ2V0ID0gc2hlbGwuZ2V0V2lkZ2V0KHRoaXMubW9kZWwudHlwZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZGVjb3JhdG9yID0gdGhpcy5kZWNvcmF0b3JzLmFsdGVybmF0aXZlc1t0aGlzLndpZGdldC50YWddIHx8IHRoaXMuZGVjb3JhdG9ycy5mYWxsYmFjaztcblxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLiRyb3V0ZSk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuZGVjb3JhdG9yID0gJ3NoZWxsLWRlY29yYXRvci1zdHViJztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHdpZGdldDogdGhpcy53aWRnZXQsXHJcbiAgICAgICAgICAgICAgICBkZWNvcmF0b3I6IHRoaXMuZGVjb3JhdG9yLFxyXG4gICAgICAgICAgICAgICAgLy8gaXRlbXM6IHRoaXMud2lkZ2V0cyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCxWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ3NoZWxsLXRhcmdldCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNzaGVsbC10YXJnZXQnLFxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUpO1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
