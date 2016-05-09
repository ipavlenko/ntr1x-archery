(function($, Vue, undefined) {

    $(document).ready(function() {

        $('[data-vue]').each(function(index, element) {

            new Vue({
                el: element,
                data: $(element).data(),
            });
        })
    });

})(jQuery, Vue);

Core = window.Core || {};

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
                globals: Object
            },

            methods: {

                open: function(context) {

                    var dialog = new ModalEditor({

                        data: {
                            globals: this.globals,
                            owner: this,
                            context: context,
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

                    console.log(this);
                    this.items.push(Object.assign({}, JSON.parse(JSON.stringify(item)), { _action: 'create' }));
                    $(window).trigger('resize');
                    this.active = null;
                },

                doUpdate: function(item, context) {

                    Object.assign(this.active, JSON.parse(JSON.stringify(item)), {
                        _action: this.active._action
                            ? this.active._action
                            : 'update'
                    });

                    this.items = $.extend(true, [], this.items);//this.items.slice();
                    $(window).trigger('resize');
                    this.active = null;
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

                    this.items = $.extend(true, [], this.items);
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

Core = window.Core || {};

(function(Vue, $, Core) {

    Core.WidgetMixin = {

        props: {
            page: Object,
            data: Object,
            stack: Object,
            bindings: Object,
            children: Array,
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
            children: Array,
        },
    };

    // Core.BindingsMixin = {
    //
    //     data: function() {
    //         return {
    //             bindings: this.bindings,
    //         };
    //     },
    //
    //     ready: function() {
    //
    //         function recur(params) {
    //
    //             var value = {};
    //
    //             for(var key in params) {
    //
    //                 if (params[key]['binding']) {
    //
    //                     value[key] = self.$interpolate(params[key]['binding']);
    //
    //                 } else if ($.isArray(params[key]['value'])) {
    //
    //                     value[key] = [];
    //
    //                     for(var i = 0; i < params[key]['value'].length; i++) {
    //                         value[key][i] = recur(params[key]['value'][i]);
    //                     }
    //
    //                 } else {
    //                     value[key] = params[key]['value'];
    //                 }
    //             }
    //
    //             return value;
    //         }
    //
    //         this.$watch('data.params', function(params) {
    //             self.bindings = recur(self.data.params);
    //         }, {
    //           deep: true,
    //           immediate: true,
    //         });
    //     }
    // }

    // Core.DecoratorMixin = {
    //
    //     ready: function() {
    //         var decorator = this.decorators[this.widget.tag];
    //         if (decorator) decorator();
    //     }
    // }

    // Core.ContainerMixin = {
    //
    //     props: {
    //         items: Array,
    //     },
    //
    //     data: function() {
    //         return {
    //             children: this.children,
    //         };
    //     },
    //
    //     ready: function() {
    //
    //         var self = this;
    //
    //         this.$watch('items', function(items) {
    //
    //             var children = [];
    //             if (items) {
    //                 for (var i = 0; i < items.length; i++) {
    //                     var item = items[i];
    //                     if (item._action != 'remove') {
    //                         children.push(item);
    //                     }
    //                 }
    //             }
    //
    //             console.log(self);
    //             if (children.length < 2) {
    //                 // console.log(self.$refs.widget, self.data, self);
    //                 // console.log(this);
    //                 // if (self.$refs.widget) {
    //                 // children.push(JSON.parse(JSON.stringify(self.stub)));
    //                 // }
    //             }
    //
    //             this.children = children;
    //         }, {
    //             immediate: true,
    //             deep: true,
    //         });
    //     },
    //
    //     events: {
    //         removeChildWidget: function(data) { this.doRemoveChildWidget(data.item, data.context); },
    //     },
    //
    //     methods: {
    //
    //         removeWidget: function() {
    //             this.$parent.$dispatch('removeChildWidget', { item: this.data });
    //         },
    //
    //         doRemoveChildWidget: function(item) {
    //
    //             if (item._action == 'create') {
    //                 this.items.$remove(item);
    //             } else {
    //                 item._action = 'remove';
    //             }
    //
    //             this.items = $.extend(true, [], this.items);
    //         }
    //     },
    // };

    // Core.SortableMixin = {
    //
    //     data: function() {
    //
    //         return {
    //             selected: this.selected,
    //         };
    //     },
    //
    //     ready: function() {
    //
    //         var self = this;
    //
    //         this.$watch('selected', function(selected) {
    //
    //             if (selected) {
    //
    //                 self.sortable =
    //                 Sortable.create($(self.selector, this.$el).get(0), {
    //                     group: {
    //                         name: 'widgets',
    //                     },
    //                     animation: 150,
    //
    //                     onAdd: function (evt) {
    //
    //                         var palette = $(evt.item).closest('.ge.ge-palette');
    //
    //                         if (!palette.length) {
    //                             $(evt.item).remove();
    //
    //                             var i = find(self.items, evt.newIndex);
    //
    //                             var widget = self.$root.$refs.shell.getWidget($(evt.item).data('widget'));
    //
    //                             self.items.splice(i.index, 0, {
    //                                 type: widget.id,
    //                                 resource: {
    //                                     params: [],
    //                                     _action: 'create'
    //                                 },
    //                                 params: widget.params
    //                                     ? JSON.parse(JSON.stringify(widget.params))
    //                                     : {}
    //                                 ,
    //                                 _action: 'create',
    //                             });
    //
    //                             self.items = $.extend(true, [], self.items);
    //                         }
    //                     },
    //
    //                     onEnd: function (evt) {
    //
    //                         if  (evt.newIndex != evt.oldIndex) {
    //
    //                             evt.preventDefault();
    //
    //                             var oi = find(self.items, evt.oldIndex);
    //                             var ni = find(self.items, evt.newIndex);
    //
    //                             self.items.splice(ni.index, 0, self.items.splice(oi.index, 1)[0]);
    //                         }
    //
    //                         self.items = $.extend(true, [], self.items);
    //                     }
    //                 });
    //
    //             } else {
    //
    //                 if (self.sortable) {
    //                     self.sortable.destroy();
    //                     self.sortable = null;
    //                 }
    //             }
    //         }, {
    //             immediate: true
    //         });
    //     },
    //
    //     methods: {
    //         selectTarget: function() {
    //             this.selected = true;
    //         },
    //
    //         unselectTarget: function() {
    //             this.selected = false;
    //         },
    //     }
    // };

})(Vue, jQuery, Core, undefined);

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

Vue.filter('jsonPath', function (context, str) {
    var re = /{([^}]+)}/g;
    try {
        return str.replace(re, function(match, expr) {
            return JSONPath({
                json: context,
                path: expr
            });
        });
    } catch (e) {
        return 'Bad Expression';
    }
});


Vue.filter('binding', function (data) {

	console.log(data);
	console.log('param = get binding value from data');
	console.log('get param from global scope');

    // for example, binding param is "{{ 'asd' }}"
    // that's mean 'asd' must be concatiname with value.

    // If value is 'QWE' and binding param is 'asd', result will be QWEasd

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

Vue.directive('scrollable', {

    bind: function () {

        $(this.el).css({
            'overflow': 'auto',
        });

        // if ($.fn.mCustomScrollbar) {
        //     Vue.nextTick(function() {
        //         $(this.el).mCustomScrollbar({
        //             axis: this.expression
        //         });
        //     }.bind(this));
        // }

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

        $(window).on('resize', () => {
            $('.modal.modal-center:visible').each(function(index, element) {
                reposition(element);
            });
        });
    });

})(jQuery);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZ1ZS5qcyIsImNvbXBvbmVudHMvZWRpdG9yLmpzIiwiY29tcG9uZW50cy9mb3JtLmpzIiwiY29tcG9uZW50cy9ncmlkLmpzIiwiY29tcG9uZW50cy9pbmxpbmUuanMiLCJjb21wb25lbnRzL21peGlucy5qcyIsImNvbXBvbmVudHMvbW9kYWwuanMiLCJmaWx0ZXJzL2luZGV4LmpzIiwiZGlyZWN0aXZlcy9jb21iby5qcyIsImRpcmVjdGl2ZXMvZGF0ZS5qcyIsImRpcmVjdGl2ZXMvcmljaC5qcyIsImRpcmVjdGl2ZXMvc2Nyb2xsYWJsZS5qcyIsImRpcmVjdGl2ZXMvdGFncy5qcyIsImhvb2tzL21vZGFsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigkLCBWdWUsIHVuZGVmaW5lZCkge1xuXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgJCgnW2RhdGEtdnVlXScpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcblxuICAgICAgICAgICAgbmV3IFZ1ZSh7XG4gICAgICAgICAgICAgICAgZWw6IGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgZGF0YTogJChlbGVtZW50KS5kYXRhKCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUpO1xuIiwiQ29yZSA9IHdpbmRvdy5Db3JlIHx8IHt9O1xuXG4oZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XG5cbiAgICBDb3JlLlRhYnNNaXhpbiA9IGZ1bmN0aW9uKGFjdGl2ZSkge1xuXG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHRhYnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZTogYWN0aXZlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgICAgICAgICBhY3RpdmF0ZTogZnVuY3Rpb24odGFiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFicy5hY3RpdmUgPSB0YWI7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGlzQWN0aXZlOiBmdW5jdGlvbih0YWIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFicy5hY3RpdmUgPT0gdGFiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIENvcmUuQWN0aW9uTWl4aW4gPSBmdW5jdGlvbihNb2RhbEVkaXRvcikge1xuXG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICAgICAgbW9kZWw6IE9iamVjdCxcbiAgICAgICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG1ldGhvZHM6IHtcblxuICAgICAgICAgICAgICAgIG9wZW46IGZ1bmN0aW9uKGNvbnRleHQpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgZGlhbG9nID0gbmV3IE1vZGFsRWRpdG9yKHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvd25lcjogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiB0aGlzLm1vZGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCkpXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vd25lci5kb0FwcGx5KHRoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KS4kbW91bnQoKS4kYXBwZW5kVG8oJCgnYm9keScpLmdldCgwKSk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGRvQXBwbHk6IGZ1bmN0aW9uKG1vZGVsKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG1vZGVsKSksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hY3Rpb246IHRoaXMubW9kZWwuX2FjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy5tb2RlbC5fYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBDb3JlLkVkaXRvck1peGluID0gZnVuY3Rpb24oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpIHtcblxuICAgICAgICByZXR1cm4ge1xuXG4gICAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgICAgIGl0ZW1zOiBBcnJheSxcbiAgICAgICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG1ldGhvZHM6IHtcblxuICAgICAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBkaWFsb2cgPSBuZXcgTW9kYWxFZGl0b3Ioe1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsczogdGhpcy5nbG9iYWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudDogaXRlbSA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpIDoge31cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm93bmVyLmRvQ3JlYXRlKHRoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KS4kbW91bnQoKS4kYXBwZW5kVG8oJCgnYm9keScpLmdldCgwKSk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvUmVtb3ZlKGl0ZW0sIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IGl0ZW07XG5cbiAgICAgICAgICAgICAgICAgICAgbmV3IE1vZGFsRWRpdG9yKHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvd25lcjogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vd25lci5kb1VwZGF0ZSh0aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXQ6ICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KS4kbW91bnQoKS4kYXBwZW5kVG8oJCgnYm9keScpLmdldCgwKSk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGRvQ3JlYXRlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaChPYmplY3QuYXNzaWduKHt9LCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW0pKSwgeyBfYWN0aW9uOiAnY3JlYXRlJyB9KSk7XG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBkb1VwZGF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xuXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5hY3RpdmUsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiB0aGlzLmFjdGl2ZS5fYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyB0aGlzLmFjdGl2ZS5fYWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zID0gJC5leHRlbmQodHJ1ZSwgW10sIHRoaXMuaXRlbXMpOy8vdGhpcy5pdGVtcy5zbGljZSgpO1xuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgZG9SZW1vdmU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLml0ZW1zLmluZGV4T2YoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5pdGVtc1tpbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5fYWN0aW9uID09ICdjcmVhdGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcy4kcmVtb3ZlKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLl9hY3Rpb24gPSAncmVtb3ZlJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMgPSAkLmV4dGVuZCh0cnVlLCBbXSwgdGhpcy5pdGVtcyk7XG4gICAgICAgICAgICAgICAgICAgICQod2luZG93KS50cmlnZ2VyKCdyZXNpemUnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24oZGF0YSkgeyB0aGlzLmNyZWF0ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXG4gICAgICAgICAgICAgICAgdXBkYXRlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMudXBkYXRlKGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcbiAgICAgICAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy5yZW1vdmUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxuICAgICAgICAgICAgICAgIGRvQ3JlYXRlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMuZG9DcmVhdGUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxuICAgICAgICAgICAgICAgIGRvVXBkYXRlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMuZG9VcGRhdGUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxuICAgICAgICAgICAgICAgIGRvUmVtb3ZlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMuZG9SZW1vdmUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBDb3JlLkxpc3RWaWV3ZXJNaXhpbiA9IHtcblxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxuICAgICAgICAgICAgZ2xvYmFsczogT2JqZWN0XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgdHJpZ2dlcjogZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHsgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTsgfSxcbiAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkgeyB0aGlzLiRkaXNwYXRjaCgnY3JlYXRlJywgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0fSApOyB9LFxuICAgICAgICAgICAgdXBkYXRlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7IHRoaXMuJGRpc3BhdGNoKCd1cGRhdGUnLCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHR9ICk7IH0sXG4gICAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHsgdGhpcy4kZGlzcGF0Y2goJ3JlbW92ZScsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dH0gKTsgfSxcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBDb3JlLk1vZGFsRWRpdG9yTWl4aW4gPSB7XG5cbiAgICAgICAgYXR0YWNoZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAkKHRoaXMuJGVsKS5tb2RhbCgnc2hvdycpO1xuICAgICAgICAgICAgJCh0aGlzLiRlbCkub24oJ2hpZGUuYnMubW9kYWwnLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGV0YWNoZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCh0aGlzLiRlbCkubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKCkge30sXG4gICAgICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7fVxuICAgICAgICB9XG4gICAgfTtcblxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XG4iLCJWdWUuY29tcG9uZW50KCd2LWZvcm0nLCB7XG5cblx0cHJvcHM6IHtcblx0XHRhY3Rpb246IFN0cmluZyxcblx0XHRtZXRob2Q6IFN0cmluZyxcblx0XHRpbml0OiBPYmplY3QsXG5cdFx0ZG9uZTogRnVuY3Rpb24sXG5cdFx0ZmFpbDogRnVuY3Rpb24sXG5cdFx0bW9kZWw6IE9iamVjdCxcblx0fSxcblxuXHQvLyByZXBsYWNlOiBmYWxzZSxcblxuXHQvLyB0ZW1wbGF0ZTogYFxuXHQvLyBcdDxmb3JtPlxuXHQvLyBcdFx0PHNsb3Q+PC9zbG90PlxuXHQvLyBcdDwvZm9ybT5cblx0Ly8gYCxcblxuXHRhY3RpdmF0ZTogZnVuY3Rpb24oZG9uZSkge1xuXG5cdFx0dGhpcy5vcmlnaW5hbCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5tb2RlbCkpO1xuXG5cdFx0JCh0aGlzLiRlbClcblxuXHRcdFx0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdHRoaXMuc3VibWl0KCk7XG5cdFx0XHR9KVxuXHRcdFx0Lm9uKCdyZXNldCcsIChlKSA9PiB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0dGhpcy5yZXNldCgpO1xuXHRcdFx0fSlcblxuXHRcdGRvbmUoKTtcblx0fSxcblxuXHRkYXRhOiBmdW5jdGlvbigpIHtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRtb2RlbDogdGhpcy5tb2RlbFxuXHRcdH07XG5cdH0sXG5cblx0bWV0aG9kczoge1xuXG5cdFx0c3VibWl0OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0Ly8gZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHQvLyBjb25zb2xlLmxvZyh0aGlzLm1vZGVsKTtcblxuXHRcdFx0JC5hamF4KHtcblx0XHRcdFx0dXJsOiB0aGlzLmFjdGlvbixcblx0XHRcdFx0bWV0aG9kOiB0aGlzLm1ldGhvZCxcblx0XHRcdFx0Y29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuXHRcdFx0XHRkYXRhOiBKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKVxuXHRcdFx0fSlcblx0XHRcdC5kb25lKChkKSA9PiB7XG5cdFx0XHRcdGlmIChkb25lIGluIHRoaXMpIHRoaXMuZG9uZShkKTtcblx0XHRcdH0pXG5cdFx0XHQuZmFpbChmdW5jdGlvbihlKSB7IGlmIChmYWlsIGluIHRoaXMpIHRoaXMuZmFpbChlKTsgfS5iaW5kKHRoaXMpKVxuXHRcdH0sXG5cblx0XHRyZXNldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIHRoaXMub3JpZ2luYWwpO1xuXHRcdH1cblx0fSxcbn0pOyIsIihmdW5jdGlvbigkLCBWdWUsIHVuZGVmaW5lZCkge1xuXG5cdC8vIHZhciBtb2RlbCA9IHtcblx0Ly8gXHRsaXN0OiBbXVxuXHQvLyB9O1xuXHQvL1xuXHQvLyB2YXIgYm9keSA9IFZ1ZS5leHRlbmQoe1xuXHQvLyBcdGNyZWF0ZWQ6IGZ1bmN0aW9uKCkgIHsgdGhpcy4kZGlzcGF0Y2goJ3JlZ2lzdGVyLWJvZHknLCB0aGlzKSB9LFxuXHQvLyB9KTtcblxuXHRWdWUuY29tcG9uZW50KCdncmlkLXRhYmxlJywge1xuXG5cdFx0cmVwbGFjZTogZmFsc2UsXG5cblx0XHRwcm9wczoge1xuXHRcdFx0ZDogQXJyYXlcblx0XHR9LFxuXG5cdFx0Ly8gZGF0YTogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gXHRyZXR1cm4ge1xuXHRcdC8vIFx0XHRpdGVtczogdGhpcy5kLnNsaWNlKDApXG5cdFx0Ly8gXHR9XG5cdFx0Ly8gfSxcblxuXHRcdG1ldGhvZHM6IHtcblxuXHRcdFx0YWRkOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ2FzZGFzZCcpO1xuXHRcdFx0XHR0aGlzLml0ZW1zLnB1c2goe30pO1xuXHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLml0ZW1zKTtcblx0XHRcdH0sXG5cblx0XHRcdHJlbW92ZTogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRcdFx0dGhpcy5pdGVtcy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdH0pO1xuXG59KShqUXVlcnksIFZ1ZSk7XG4iLCJWdWUuY29tcG9uZW50KCdpbmxpbmUtdGV4dCcsXG5cdFZ1ZS5leHRlbmQoe1xuXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJyBdLFxuXHRcdHRlbXBsYXRlOiBgXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxuXHRcdFx0XHQ8aW5wdXQgY2xhc3M9XCJpbmxpbmUtY29udHJvbFwiIHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIiAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0YFxuXHR9KVxuKTtcblxuVnVlLmNvbXBvbmVudCgnaW5saW5lLWNoZWNrYm94Jyxcblx0VnVlLmV4dGVuZCh7XG5cdFx0cHJvcHM6IFsgJ25hbWUnLCAndmFsdWUnIF0sXG5cdFx0dGVtcGxhdGU6IGBcblx0XHRcdDxkaXYgY2xhc3M9XCJpbmxpbmUtY29udGFpbmVyXCI+XG5cdFx0XHRcdDxpbnB1dCBjbGFzcz1cImlubGluZS1jaGVja2JveFwiIHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCIgLz5cblx0XHRcdDwvZGl2PlxuXHRcdGBcblx0fSlcbik7XG5cblZ1ZS5jb21wb25lbnQoJ2lubGluZS1zZWxlY3QnLFxuXHRWdWUuZXh0ZW5kKHtcblx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScsICdvcHRpb25zJyBdLFxuXHRcdHRlbXBsYXRlOiBgXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiaW5saW5lLWNvbnRhaW5lclwiPlxuXHRcdFx0XHQ8c2VsZWN0IGNsYXNzPVwiaW5saW5lLWNvbnRyb2wxXCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIj5cblx0XHRcdFx0XHQ8b3B0aW9uIHYtZm9yPVwib3B0aW9uIGluIG9wdGlvbnNcIiB2YWx1ZT1cInt7IG9wdGlvbi5rZXkgfX1cIj57eyBvcHRpb24udmFsdWUgfX08L29wdGlvbj5cblx0XHRcdFx0PC9zZWxlY3Q+XG5cdFx0XHQ8L2Rpdj5cblx0XHRgXG5cdH0pXG4pO1xuXG5WdWUuY29tcG9uZW50KCdpbmxpbmUtdmFsdWUnLFxuXHRWdWUuZXh0ZW5kKHtcblx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScsICdjbGFzcycgXSxcblx0XHR0ZW1wbGF0ZTogYFxuXHRcdFx0PGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiIC8+XG5cdFx0XHQ8c3BhbiA6Y2xhc3M9XCJjbGFzc1wiPnt7IHZhbHVlIH19PC9zcGFuPlxuXHRcdGBcblx0fSlcbik7XG4iLCJDb3JlID0gd2luZG93LkNvcmUgfHwge307XG5cbihmdW5jdGlvbihWdWUsICQsIENvcmUpIHtcblxuICAgIENvcmUuV2lkZ2V0TWl4aW4gPSB7XG5cbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIHBhZ2U6IE9iamVjdCxcbiAgICAgICAgICAgIGRhdGE6IE9iamVjdCxcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXG4gICAgICAgICAgICBiaW5kaW5nczogT2JqZWN0LFxuICAgICAgICAgICAgY2hpbGRyZW46IEFycmF5LFxuICAgICAgICB9LFxuXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goZXZlbnQsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dCB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQ29yZS5TdGFja2VkTWl4aW4gPSB7XG5cbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcbiAgICAgICAgICAgIHNldHRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBwYWdlOiBPYmplY3QsXG4gICAgICAgICAgICBjaGlsZHJlbjogQXJyYXksXG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIC8vIENvcmUuQmluZGluZ3NNaXhpbiA9IHtcbiAgICAvL1xuICAgIC8vICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgICAgIHJldHVybiB7XG4gICAgLy8gICAgICAgICAgICAgYmluZGluZ3M6IHRoaXMuYmluZGluZ3MsXG4gICAgLy8gICAgICAgICB9O1xuICAgIC8vICAgICB9LFxuICAgIC8vXG4gICAgLy8gICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcbiAgICAvL1xuICAgIC8vICAgICAgICAgZnVuY3Rpb24gcmVjdXIocGFyYW1zKSB7XG4gICAgLy9cbiAgICAvLyAgICAgICAgICAgICB2YXIgdmFsdWUgPSB7fTtcbiAgICAvL1xuICAgIC8vICAgICAgICAgICAgIGZvcih2YXIga2V5IGluIHBhcmFtcykge1xuICAgIC8vXG4gICAgLy8gICAgICAgICAgICAgICAgIGlmIChwYXJhbXNba2V5XVsnYmluZGluZyddKSB7XG4gICAgLy9cbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIHZhbHVlW2tleV0gPSBzZWxmLiRpbnRlcnBvbGF0ZShwYXJhbXNba2V5XVsnYmluZGluZyddKTtcbiAgICAvL1xuICAgIC8vICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCQuaXNBcnJheShwYXJhbXNba2V5XVsndmFsdWUnXSkpIHtcbiAgICAvL1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgdmFsdWVba2V5XSA9IFtdO1xuICAgIC8vXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgcGFyYW1zW2tleV1bJ3ZhbHVlJ10ubGVuZ3RoOyBpKyspIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVtrZXldW2ldID0gcmVjdXIocGFyYW1zW2tleV1bJ3ZhbHVlJ11baV0pO1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgfVxuICAgIC8vXG4gICAgLy8gICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB2YWx1ZVtrZXldID0gcGFyYW1zW2tleV1bJ3ZhbHVlJ107XG4gICAgLy8gICAgICAgICAgICAgICAgIH1cbiAgICAvLyAgICAgICAgICAgICB9XG4gICAgLy9cbiAgICAvLyAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy9cbiAgICAvLyAgICAgICAgIHRoaXMuJHdhdGNoKCdkYXRhLnBhcmFtcycsIGZ1bmN0aW9uKHBhcmFtcykge1xuICAgIC8vICAgICAgICAgICAgIHNlbGYuYmluZGluZ3MgPSByZWN1cihzZWxmLmRhdGEucGFyYW1zKTtcbiAgICAvLyAgICAgICAgIH0sIHtcbiAgICAvLyAgICAgICAgICAgZGVlcDogdHJ1ZSxcbiAgICAvLyAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlLFxuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyB9XG5cbiAgICAvLyBDb3JlLkRlY29yYXRvck1peGluID0ge1xuICAgIC8vXG4gICAgLy8gICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgICAgIHZhciBkZWNvcmF0b3IgPSB0aGlzLmRlY29yYXRvcnNbdGhpcy53aWRnZXQudGFnXTtcbiAgICAvLyAgICAgICAgIGlmIChkZWNvcmF0b3IpIGRlY29yYXRvcigpO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuXG4gICAgLy8gQ29yZS5Db250YWluZXJNaXhpbiA9IHtcbiAgICAvL1xuICAgIC8vICAgICBwcm9wczoge1xuICAgIC8vICAgICAgICAgaXRlbXM6IEFycmF5LFxuICAgIC8vICAgICB9LFxuICAgIC8vXG4gICAgLy8gICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAgICAgcmV0dXJuIHtcbiAgICAvLyAgICAgICAgICAgICBjaGlsZHJlbjogdGhpcy5jaGlsZHJlbixcbiAgICAvLyAgICAgICAgIH07XG4gICAgLy8gICAgIH0sXG4gICAgLy9cbiAgICAvLyAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xuICAgIC8vXG4gICAgLy8gICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgLy9cbiAgICAvLyAgICAgICAgIHRoaXMuJHdhdGNoKCdpdGVtcycsIGZ1bmN0aW9uKGl0ZW1zKSB7XG4gICAgLy9cbiAgICAvLyAgICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBbXTtcbiAgICAvLyAgICAgICAgICAgICBpZiAoaXRlbXMpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBpdGVtc1tpXTtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLl9hY3Rpb24gIT0gJ3JlbW92ZScpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKGl0ZW0pO1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgfVxuICAgIC8vICAgICAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICAgICAgfVxuICAgIC8vXG4gICAgLy8gICAgICAgICAgICAgY29uc29sZS5sb2coc2VsZik7XG4gICAgLy8gICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA8IDIpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coc2VsZi4kcmVmcy53aWRnZXQsIHNlbGYuZGF0YSwgc2VsZik7XG4gICAgLy8gICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMpO1xuICAgIC8vICAgICAgICAgICAgICAgICAvLyBpZiAoc2VsZi4kcmVmcy53aWRnZXQpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgLy8gY2hpbGRyZW4ucHVzaChKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNlbGYuc3R1YikpKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgLy8gfVxuICAgIC8vICAgICAgICAgICAgIH1cbiAgICAvL1xuICAgIC8vICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICAvLyAgICAgICAgIH0sIHtcbiAgICAvLyAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXG4gICAgLy8gICAgICAgICAgICAgZGVlcDogdHJ1ZSxcbiAgICAvLyAgICAgICAgIH0pO1xuICAgIC8vICAgICB9LFxuICAgIC8vXG4gICAgLy8gICAgIGV2ZW50czoge1xuICAgIC8vICAgICAgICAgcmVtb3ZlQ2hpbGRXaWRnZXQ6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy5kb1JlbW92ZUNoaWxkV2lkZ2V0KGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcbiAgICAvLyAgICAgfSxcbiAgICAvL1xuICAgIC8vICAgICBtZXRob2RzOiB7XG4gICAgLy9cbiAgICAvLyAgICAgICAgIHJlbW92ZVdpZGdldDogZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgICAgICAgICAgdGhpcy4kcGFyZW50LiRkaXNwYXRjaCgncmVtb3ZlQ2hpbGRXaWRnZXQnLCB7IGl0ZW06IHRoaXMuZGF0YSB9KTtcbiAgICAvLyAgICAgICAgIH0sXG4gICAgLy9cbiAgICAvLyAgICAgICAgIGRvUmVtb3ZlQ2hpbGRXaWRnZXQ6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAvL1xuICAgIC8vICAgICAgICAgICAgIGlmIChpdGVtLl9hY3Rpb24gPT0gJ2NyZWF0ZScpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcy4kcmVtb3ZlKGl0ZW0pO1xuICAgIC8vICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICAgICAgICAgIGl0ZW0uX2FjdGlvbiA9ICdyZW1vdmUnO1xuICAgIC8vICAgICAgICAgICAgIH1cbiAgICAvL1xuICAgIC8vICAgICAgICAgICAgIHRoaXMuaXRlbXMgPSAkLmV4dGVuZCh0cnVlLCBbXSwgdGhpcy5pdGVtcyk7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgIH0sXG4gICAgLy8gfTtcblxuICAgIC8vIENvcmUuU29ydGFibGVNaXhpbiA9IHtcbiAgICAvL1xuICAgIC8vICAgICBkYXRhOiBmdW5jdGlvbigpIHtcbiAgICAvL1xuICAgIC8vICAgICAgICAgcmV0dXJuIHtcbiAgICAvLyAgICAgICAgICAgICBzZWxlY3RlZDogdGhpcy5zZWxlY3RlZCxcbiAgICAvLyAgICAgICAgIH07XG4gICAgLy8gICAgIH0sXG4gICAgLy9cbiAgICAvLyAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xuICAgIC8vXG4gICAgLy8gICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgLy9cbiAgICAvLyAgICAgICAgIHRoaXMuJHdhdGNoKCdzZWxlY3RlZCcsIGZ1bmN0aW9uKHNlbGVjdGVkKSB7XG4gICAgLy9cbiAgICAvLyAgICAgICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAvL1xuICAgIC8vICAgICAgICAgICAgICAgICBzZWxmLnNvcnRhYmxlID1cbiAgICAvLyAgICAgICAgICAgICAgICAgU29ydGFibGUuY3JlYXRlKCQoc2VsZi5zZWxlY3RvciwgdGhpcy4kZWwpLmdldCgwKSwge1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgZ3JvdXA6IHtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnd2lkZ2V0cycsXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB9LFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiAxNTAsXG4gICAgLy9cbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIG9uQWRkOiBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgLy9cbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFsZXR0ZSA9ICQoZXZ0Lml0ZW0pLmNsb3Nlc3QoJy5nZS5nZS1wYWxldHRlJyk7XG4gICAgLy9cbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXBhbGV0dGUubGVuZ3RoKSB7XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoZXZ0Lml0ZW0pLnJlbW92ZSgpO1xuICAgIC8vXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpID0gZmluZChzZWxmLml0ZW1zLCBldnQubmV3SW5kZXgpO1xuICAgIC8vXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3aWRnZXQgPSBzZWxmLiRyb290LiRyZWZzLnNoZWxsLmdldFdpZGdldCgkKGV2dC5pdGVtKS5kYXRhKCd3aWRnZXQnKSk7XG4gICAgLy9cbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pdGVtcy5zcGxpY2UoaS5pbmRleCwgMCwge1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogd2lkZ2V0LmlkLFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IHtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IFtdLFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hY3Rpb246ICdjcmVhdGUnXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiB3aWRnZXQucGFyYW1zXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHdpZGdldC5wYXJhbXMpKVxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDoge31cbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICxcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9hY3Rpb246ICdjcmVhdGUnLFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAvL1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLml0ZW1zID0gJC5leHRlbmQodHJ1ZSwgW10sIHNlbGYuaXRlbXMpO1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgLy9cbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIG9uRW5kOiBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgLy9cbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBpZiAgKGV2dC5uZXdJbmRleCAhPSBldnQub2xkSW5kZXgpIHtcbiAgICAvL1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAvL1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2kgPSBmaW5kKHNlbGYuaXRlbXMsIGV2dC5vbGRJbmRleCk7XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuaSA9IGZpbmQoc2VsZi5pdGVtcywgZXZ0Lm5ld0luZGV4KTtcbiAgICAvL1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLml0ZW1zLnNwbGljZShuaS5pbmRleCwgMCwgc2VsZi5pdGVtcy5zcGxpY2Uob2kuaW5kZXgsIDEpWzBdKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgLy9cbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLml0ZW1zID0gJC5leHRlbmQodHJ1ZSwgW10sIHNlbGYuaXRlbXMpO1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgfVxuICAgIC8vICAgICAgICAgICAgICAgICB9KTtcbiAgICAvL1xuICAgIC8vICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgLy9cbiAgICAvLyAgICAgICAgICAgICAgICAgaWYgKHNlbGYuc29ydGFibGUpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIHNlbGYuc29ydGFibGUuZGVzdHJveSgpO1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgc2VsZi5zb3J0YWJsZSA9IG51bGw7XG4gICAgLy8gICAgICAgICAgICAgICAgIH1cbiAgICAvLyAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICB9LCB7XG4gICAgLy8gICAgICAgICAgICAgaW1tZWRpYXRlOiB0cnVlXG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyAgICAgfSxcbiAgICAvL1xuICAgIC8vICAgICBtZXRob2RzOiB7XG4gICAgLy8gICAgICAgICBzZWxlY3RUYXJnZXQ6IGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSB0cnVlO1xuICAgIC8vICAgICAgICAgfSxcbiAgICAvL1xuICAgIC8vICAgICAgICAgdW5zZWxlY3RUYXJnZXQ6IGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAvLyAgICAgICAgIH0sXG4gICAgLy8gICAgIH1cbiAgICAvLyB9O1xuXG59KShWdWUsIGpRdWVyeSwgQ29yZSwgdW5kZWZpbmVkKTtcbiIsIlZ1ZS5jb21wb25lbnQoJ21vZGFsJywge1xuXG4gICAgcHJvcHM6IHtcbiAgICAgICAgaWQ6IFN0cmluZyxcbiAgICAgICAgY3VycmVudDogT2JqZWN0LFxuICAgICAgICBvcmlnaW5hbDogT2JqZWN0LFxuICAgIH0sXG5cbiAgICBtZXRob2RzOiB7XG5cbiAgICAgICAgc3VibWl0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB0aGlzLiRkaXNwYXRjaCgnc3VibWl0JywgdGhpcy5jdXJyZW50KTtcbiAgICAgICAgICAgIC8vIE9iamVjdC5hc3NpZ24odGhpcy5vcmlnaW5hbCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmN1cnJlbnQpKSk7XG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5jbG9zZXN0KCcubW9kYWwnKS5tb2RhbCgnaGlkZScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlc2V0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB0aGlzLiRkaXNwYXRjaCgncmVzZXQnLCB0aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgLy8gT2JqZWN0LmFzc2lnbih0aGlzLmN1cnJlbnQsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5vcmlnaW5hbCkpKTtcbiAgICAgICAgICAgICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcbiIsIlZ1ZS5maWx0ZXIoJ2pzb25QYXRoJywgZnVuY3Rpb24gKGNvbnRleHQsIHN0cikge1xuICAgIHZhciByZSA9IC97KFtefV0rKX0vZztcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UocmUsIGZ1bmN0aW9uKG1hdGNoLCBleHByKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTlBhdGgoe1xuICAgICAgICAgICAgICAgIGpzb246IGNvbnRleHQsXG4gICAgICAgICAgICAgICAgcGF0aDogZXhwclxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuICdCYWQgRXhwcmVzc2lvbic7XG4gICAgfVxufSk7XG5cblxuVnVlLmZpbHRlcignYmluZGluZycsIGZ1bmN0aW9uIChkYXRhKSB7XG5cblx0Y29uc29sZS5sb2coZGF0YSk7XG5cdGNvbnNvbGUubG9nKCdwYXJhbSA9IGdldCBiaW5kaW5nIHZhbHVlIGZyb20gZGF0YScpO1xuXHRjb25zb2xlLmxvZygnZ2V0IHBhcmFtIGZyb20gZ2xvYmFsIHNjb3BlJyk7XG5cbiAgICAvLyBmb3IgZXhhbXBsZSwgYmluZGluZyBwYXJhbSBpcyBcInt7ICdhc2QnIH19XCJcbiAgICAvLyB0aGF0J3MgbWVhbiAnYXNkJyBtdXN0IGJlIGNvbmNhdGluYW1lIHdpdGggdmFsdWUuXG5cbiAgICAvLyBJZiB2YWx1ZSBpcyAnUVdFJyBhbmQgYmluZGluZyBwYXJhbSBpcyAnYXNkJywgcmVzdWx0IHdpbGwgYmUgUVdFYXNkXG5cbn0pO1xuXG5WdWUuZmlsdGVyKCdhc3NpZ24nLCBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UxLCBzb3VyY2UyLCBzb3VyY2UzKSB7XG5cblx0cmV0dXJuIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UxLCBzb3VyY2UyLCBzb3VyY2UzKTtcbn0pO1xuXG5WdWUuZmlsdGVyKCdjb3B5JywgZnVuY3Rpb24gKHNvdXJjZSkge1xuXG5cdHJldHVybiBuZXcgVnVlKHtcblx0XHRkYXRhOiBzb3VyY2UgIT0gbnVsbFxuXHRcdFx0PyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNvdXJjZSkpXG5cdFx0XHQ6IG51bGxcblx0fSkuJGRhdGE7XG59KTtcblxuVnVlLmZpbHRlcignY2xvbmUnLCBmdW5jdGlvbiAoc291cmNlKSB7XG5cblx0cmV0dXJuIG5ldyBWdWUoe1xuXHRcdGRhdGE6IHNvdXJjZSAhPSBudWxsXG5cdFx0XHQ/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc291cmNlKSlcblx0XHRcdDogbnVsbFxuXHR9KS4kZGF0YTtcbn0pO1xuXG4iLCJWdWUuZGlyZWN0aXZlKCdjb21ibycsIHtcblxuXHRiaW5kOiBmdW5jdGlvbiAoKSB7XG5cblx0XHRpZiAoJC5mbi50YWdzaW5wdXQpIHtcblxuXHRcdFx0JCh0aGlzLmVsKS5zZWxlY3QyKHtcblx0XHRcdFx0dGFnczogdHJ1ZSxcblx0XHRcdFx0bXVsdGlwbGU6IGZhbHNlLFxuXHRcdFx0XHRjcmVhdGVUYWc6IGZ1bmN0aW9uIChwYXJhbXMpIHtcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0aWQ6IHBhcmFtcy50ZXJtLFxuXHRcdFx0XHRcdFx0dGV4dDogcGFyYW1zLnRlcm0sXG5cdFx0XHRcdFx0XHRuZXdPcHRpb246IHRydWVcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cdHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuXHR9LFxuXHR1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0fVxufSk7XG4iLCJWdWUuZGlyZWN0aXZlKCdkYXRlJywge1xuXG5cdGJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcblx0XHRpZiAoJC5mbi5kYXRlcGlja2VyKSB7XG5cblx0XHRcdCQodGhpcy5lbCkuZGF0ZXBpY2tlcih7XG5cdFx0XHRcdGF1dG9jbG9zZTogdHJ1ZSxcblx0XHRcdFx0dG9kYXlIaWdobGlnaHQ6IHRydWUsXG5cdFx0XHRcdGZvcm1hdDogXCJ5eXl5LW1tLWRkXCJcblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblx0dXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XG5cdH0sXG5cdHVuYmluZDogZnVuY3Rpb24gKCkge1xuXHR9XG59KTtcbiIsIlZ1ZS5kaXJlY3RpdmUoJ3JpY2gnLCB7XG5cbiAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgaWYgKHdpbmRvdy5DS0VESVRPUikge1xuXG4gICAgICAgICAgICB0aGlzLmVkaXRvciA9IENLRURJVE9SLmlubGluZSh0aGlzLmVsLCB7XG4gICAgICAgICAgICAgICAgc3R5bGVzU2V0OiBbXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ0JvbGRlcicsIGVsZW1lbnQ6ICdzcGFuJywgYXR0cmlidXRlczogeyAnY2xhc3MnOiAnZXh0cmFib2xkJ30gfVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgdG9vbGJhckdyb3VwczogW1xuICAgICAgICAgICAgICAgICAgICAvLyB7IG5hbWU6ICdjbGlwYm9hcmQnLCAgIGdyb3VwczogWyAnY2xpcGJvYXJkJywgJ3VuZG8nIF0gfSxcbiAgICAgICAgICAgICAgICAgICAgLy8geyBuYW1lOiAnZWRpdGluZycsICAgICBncm91cHM6IFsgJ2ZpbmQnLCAnc2VsZWN0aW9uJywgJ3NwZWxsY2hlY2tlcicgXSB9LFxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdsaW5rcycgfSxcbiAgICAgICAgICAgICAgICAgICAgLy8geyBuYW1lOiAnZm9ybXMnIH0sXG4gICAgICAgICAgICAgICAgICAgIHtuYW1lOiAndG9vbHMnfSxcbiAgICAgICAgICAgICAgICAgICAge25hbWU6ICdkb2N1bWVudCcsIGdyb3VwczogWydtb2RlJywgJ2RvY3VtZW50JywgJ2RvY3Rvb2xzJ119LFxuICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ290aGVycyd9LFxuICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ3BhcmFncmFwaCcsIGdyb3VwczogWydsaXN0JywgJ2luZGVudCcsICdibG9ja3MnLCAnYWxpZ24nXX0sXG4gICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnY29sb3JzJ30sXG4gICAgICAgICAgICAgICAgICAgICcvJyxcbiAgICAgICAgICAgICAgICAgICAge25hbWU6ICdiYXNpY3N0eWxlcycsIGdyb3VwczogWydiYXNpY3N0eWxlcycsICdjbGVhbnVwJ119LFxuICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ3N0eWxlcyd9LFxuICAgICAgICAgICAgICAgICAgICAnLycsXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2luc2VydCcsIGdyb3VwczogWyAnSW1hZ2VCdXR0b24nIF0gIH1cbiAgICAgICAgICAgICAgICAgICAgLy97bmFtZTogJ2Fib3V0J31cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5lZGl0b3Iub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZWRpdG9yLnVwZGF0ZUVsZW1lbnQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnZtLiRzZXQodGhpcy5leHByZXNzaW9uLCAkKHRoaXMuZWwpLnZhbCgpKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNldERhdGEodGhpcy52bS4kZ2V0KHRoaXMuZXhwcmVzc2lvbikpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygndXBkYXRlJywgbmV3VmFsdWUsIG9sZFZhbHVlKTtcbiAgICB9LFxuXG4gICAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLmRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy5lZGl0b3IgPSBudWxsO1xuICAgICAgICB0aGlzLnRleHRhcmVhID0gbnVsbDtcbiAgICAgICAgdGhpcy5pbnB1dCA9IG51bGw7XG4gICAgfVxufSk7XG4iLCJWdWUuZGlyZWN0aXZlKCdzY3JvbGxhYmxlJywge1xuXG4gICAgYmluZDogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICQodGhpcy5lbCkuY3NzKHtcbiAgICAgICAgICAgICdvdmVyZmxvdyc6ICdhdXRvJyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gaWYgKCQuZm4ubUN1c3RvbVNjcm9sbGJhcikge1xuICAgICAgICAvLyAgICAgVnVlLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgICAgICAgICQodGhpcy5lbCkubUN1c3RvbVNjcm9sbGJhcih7XG4gICAgICAgIC8vICAgICAgICAgICAgIGF4aXM6IHRoaXMuZXhwcmVzc2lvblxuICAgICAgICAvLyAgICAgICAgIH0pO1xuICAgICAgICAvLyAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgLy8gfVxuXG4gICAgfSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICB9LFxuICAgIHVuYmluZDogZnVuY3Rpb24gKCkge1xuICAgIH1cbn0pO1xuIiwiVnVlLmRpcmVjdGl2ZSgndGFncycsIHtcblxuXHRiaW5kOiBmdW5jdGlvbiAoKSB7XG5cblx0XHRpZiAoJC5mbi50YWdzaW5wdXQpIHtcblxuXHRcdFx0JCh0aGlzLmVsKS50YWdzaW5wdXQoe1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXHR1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcblx0fSxcblx0dW5iaW5kOiBmdW5jdGlvbiAoKSB7XG5cdH1cbn0pO1xuIiwiKGZ1bmN0aW9uKCQpIHtcblxuICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGZ1bmN0aW9uIHJlcG9zaXRpb24oZWxlbWVudCkge1xuXG4gICAgICAgICAgICB2YXIgbW9kYWwgPSAkKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIGRpYWxvZyA9ICQoJy5tb2RhbC1kaWFsb2cnLCBtb2RhbCk7XG5cbiAgICAgICAgICAgIG1vZGFsLmNzcygnZGlzcGxheScsICdibG9jaycpO1xuICAgICAgICAgICAgZGlhbG9nLmNzcyhcIm1hcmdpbi10b3BcIiwgTWF0aC5tYXgoMCwgKCQod2luZG93KS5oZWlnaHQoKSAtIGRpYWxvZy5oZWlnaHQoKSkgLyAyKSk7XG4gICAgICAgIH1cblxuICAgICAgICAkKCQoZG9jdW1lbnQpLCAnLm1vZGFsLm1vZGFsLWNlbnRlcicpLm9uKCdzaG93LmJzLm1vZGFsJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmVwb3NpdGlvbihlLnRhcmdldCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplJywgKCkgPT4ge1xuICAgICAgICAgICAgJCgnLm1vZGFsLm1vZGFsLWNlbnRlcjp2aXNpYmxlJykuZWFjaChmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHJlcG9zaXRpb24oZWxlbWVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbn0pKGpRdWVyeSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
