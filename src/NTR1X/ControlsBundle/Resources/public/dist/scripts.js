(function($, Vue, undefined) {

    $(document).ready(function() {

        $('[data-vue]').each(function(index, element) {

            new Vue({
                el: $('[data-vue-body]', element).get(0),
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

    function generateId() {

        var ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var ID_LENGTH = 8;

        var rtn = '';
        for (var i = 0; i < ID_LENGTH; i++) {
            rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
        }
        return rtn;
    }

    Core.WidgetMixin = {

        props: {
            page: Object,
            data: Object,
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

            this.randomId = generateId();

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
            editable: Boolean,
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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZ1ZS5qcyIsImNsaWVudC9jbGllbnQuanMiLCJjb21wb25lbnRzL2VkaXRvci5qcyIsImNvbXBvbmVudHMvZm9ybS5qcyIsImNvbXBvbmVudHMvZ3JpZC5qcyIsImNvbXBvbmVudHMvaW5saW5lLmpzIiwiY29tcG9uZW50cy9taXhpbnMuanMiLCJjb21wb25lbnRzL21vZGFsLmpzIiwiZGlyZWN0aXZlcy9jb21iby5qcyIsImRpcmVjdGl2ZXMvZGF0ZS5qcyIsImRpcmVjdGl2ZXMvcmljaC5qcyIsImRpcmVjdGl2ZXMvc2Nyb2xsYWJsZS5qcyIsImRpcmVjdGl2ZXMvdGFncy5qcyIsImhvb2tzL21vZGFsLmpzIiwiZmlsdGVycy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9PQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCQsIFZ1ZSwgdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICQoJ1tkYXRhLXZ1ZV0nKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XHJcblxyXG4gICAgICAgICAgICBuZXcgVnVlKHtcclxuICAgICAgICAgICAgICAgIGVsOiAkKCdbZGF0YS12dWUtYm9keV0nLCBlbGVtZW50KS5nZXQoMCksXHJcbiAgICAgICAgICAgICAgICBkYXRhOiAkKGVsZW1lbnQpLmRhdGEoKSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUpO1xyXG4iLCIiLCJDb3JlID0gd2luZG93LkNvcmUgfHwge307XHJcblxyXG4oZnVuY3Rpb24oVnVlLCAkLCBDb3JlKSB7XHJcblxyXG4gICAgQ29yZS5UYWJzTWl4aW4gPSBmdW5jdGlvbihhY3RpdmUpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB0YWJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZTogYWN0aXZlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgbWV0aG9kczoge1xyXG5cclxuICAgICAgICAgICAgICAgIGFjdGl2YXRlOiBmdW5jdGlvbih0YWIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYnMuYWN0aXZlID0gdGFiO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBpc0FjdGl2ZTogZnVuY3Rpb24odGFiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFicy5hY3RpdmUgPT0gdGFiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIENvcmUuQWN0aW9uTWl4aW4gPSBmdW5jdGlvbihNb2RhbEVkaXRvcikge1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG5cclxuICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIG1vZGVsOiBPYmplY3QsXHJcbiAgICAgICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgICAgICAgICBvcGVuOiBmdW5jdGlvbihjb250ZXh0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkaWFsb2cgPSBuZXcgTW9kYWxFZGl0b3Ioe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsczogdGhpcy5nbG9iYWxzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3duZXI6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IHRoaXMubW9kZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm93bmVyLmRvQXBwbHkodGhpcy5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRyZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRkZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pLiRtb3VudCgpLiRhcHBlbmRUbygkKCdib2R5JykuZ2V0KDApKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgZG9BcHBseTogZnVuY3Rpb24obW9kZWwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLm1vZGVsLCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG1vZGVsKSksIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogdGhpcy5tb2RlbC5fYWN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMubW9kZWwuX2FjdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndXBkYXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICBDb3JlLkVkaXRvck1peGluID0gZnVuY3Rpb24oTGlzdFZpZXdlciwgTW9kYWxFZGl0b3IpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICBpdGVtczogQXJyYXksXHJcbiAgICAgICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIG1ldGhvZHM6IHtcclxuXHJcbiAgICAgICAgICAgICAgICB0cmlnZ2VyOiBmdW5jdGlvbihldmVudCwgaXRlbSwgY29udGV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGlhbG9nID0gbmV3IE1vZGFsRWRpdG9yKHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbHM6IHRoaXMuZ2xvYmFscyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudDogaXRlbSA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpIDoge31cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vd25lci5kb0NyZWF0ZSh0aGlzLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJGRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSkuJG1vdW50KCkuJGFwcGVuZFRvKCQoJ2JvZHknKS5nZXQoMCkpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRvUmVtb3ZlKGl0ZW0sIGNvbnRleHQpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBpdGVtO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBuZXcgTW9kYWxFZGl0b3Ioe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsczogdGhpcy5nbG9iYWxzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3duZXI6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6IGl0ZW0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW0pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm93bmVyLmRvVXBkYXRlKHRoaXMuY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0OiAgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pLiRtb3VudCgpLiRhcHBlbmRUbygkKCdib2R5JykuZ2V0KDApKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgZG9DcmVhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKE9iamVjdC5hc3NpZ24oe30sIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoaXRlbSkpLCB7IF9hY3Rpb246ICdjcmVhdGUnIH0pKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBkb1VwZGF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMuYWN0aXZlLCBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGl0ZW0pKSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfYWN0aW9uOiB0aGlzLmFjdGl2ZS5fYWN0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMuYWN0aXZlLl9hY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ3VwZGF0ZSdcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcyA9ICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKTsvL3RoaXMuaXRlbXMuc2xpY2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgICAgICBkb1JlbW92ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLml0ZW1zLmluZGV4T2YoaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMuaXRlbXNbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5fYWN0aW9uID09ICdjcmVhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLiRyZW1vdmUoaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLl9hY3Rpb24gPSAncmVtb3ZlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcyA9ICQuZXh0ZW5kKHRydWUsIFtdLCB0aGlzLml0ZW1zKTtcclxuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncmVzaXplJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZXZlbnRzOiB7XHJcbiAgICAgICAgICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy5jcmVhdGUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxyXG4gICAgICAgICAgICAgICAgdXBkYXRlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMudXBkYXRlKGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcclxuICAgICAgICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24oZGF0YSkgeyB0aGlzLnJlbW92ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXHJcbiAgICAgICAgICAgICAgICBkb0NyZWF0ZTogZnVuY3Rpb24oZGF0YSkgeyB0aGlzLmRvQ3JlYXRlKGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcclxuICAgICAgICAgICAgICAgIGRvVXBkYXRlOiBmdW5jdGlvbihkYXRhKSB7IHRoaXMuZG9VcGRhdGUoZGF0YS5pdGVtLCBkYXRhLmNvbnRleHQpOyB9LFxyXG4gICAgICAgICAgICAgICAgZG9SZW1vdmU6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy5kb1JlbW92ZShkYXRhLml0ZW0sIGRhdGEuY29udGV4dCk7IH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICBDb3JlLkxpc3RWaWV3ZXJNaXhpbiA9IHtcclxuXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgICAgICAgICBnbG9iYWxzOiBPYmplY3RcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7IHRoaXMuJGRpc3BhdGNoKGV2ZW50LCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHQgfSk7IH0sXHJcbiAgICAgICAgICAgIGNyZWF0ZTogZnVuY3Rpb24oaXRlbSwgY29udGV4dCkgeyB0aGlzLiRkaXNwYXRjaCgnY3JlYXRlJywgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0fSApOyB9LFxyXG4gICAgICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGl0ZW0sIGNvbnRleHQpIHsgdGhpcy4kZGlzcGF0Y2goJ3VwZGF0ZScsIHsgaXRlbTogaXRlbSwgY29udGV4dDogY29udGV4dH0gKTsgfSxcclxuICAgICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbihpdGVtLCBjb250ZXh0KSB7IHRoaXMuJGRpc3BhdGNoKCdyZW1vdmUnLCB7IGl0ZW06IGl0ZW0sIGNvbnRleHQ6IGNvbnRleHR9ICk7IH0sXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBDb3JlLk1vZGFsRWRpdG9yTWl4aW4gPSB7XHJcblxyXG4gICAgICAgIGF0dGFjaGVkOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgICQodGhpcy4kZWwpLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICQodGhpcy4kZWwpLm9uKCdoaWRlLmJzLm1vZGFsJywgKGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGRldGFjaGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCh0aGlzLiRlbCkubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHN1Ym1pdDogZnVuY3Rpb24oKSB7fSxcclxuICAgICAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKCkge31cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIlZ1ZS5jb21wb25lbnQoJ3YtZm9ybScsIHtcclxuXHJcblx0cHJvcHM6IHtcclxuXHRcdGFjdGlvbjogU3RyaW5nLFxyXG5cdFx0bWV0aG9kOiBTdHJpbmcsXHJcblx0XHRpbml0OiBPYmplY3QsXHJcblx0XHRkb25lOiBGdW5jdGlvbixcclxuXHRcdGZhaWw6IEZ1bmN0aW9uLFxyXG5cdFx0bW9kZWw6IE9iamVjdCxcclxuXHR9LFxyXG5cclxuXHQvLyByZXBsYWNlOiBmYWxzZSxcclxuXHJcblx0Ly8gdGVtcGxhdGU6IGBcclxuXHQvLyBcdDxmb3JtPlxyXG5cdC8vIFx0XHQ8c2xvdD48L3Nsb3Q+XHJcblx0Ly8gXHQ8L2Zvcm0+XHJcblx0Ly8gYCxcclxuXHJcblx0YWN0aXZhdGU6IGZ1bmN0aW9uKGRvbmUpIHtcclxuXHJcblx0XHR0aGlzLm9yaWdpbmFsID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKSk7XHJcblxyXG5cdFx0JCh0aGlzLiRlbClcclxuXHJcblx0XHRcdC5vbignc3VibWl0JywgKGUpID0+IHtcclxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0dGhpcy5zdWJtaXQoKTtcclxuXHRcdFx0fSlcclxuXHRcdFx0Lm9uKCdyZXNldCcsIChlKSA9PiB7XHJcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdHRoaXMucmVzZXQoKTtcclxuXHRcdFx0fSlcclxuXHJcblx0XHRkb25lKCk7XHJcblx0fSxcclxuXHJcblx0ZGF0YTogZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0bW9kZWw6IHRoaXMubW9kZWxcclxuXHRcdH07XHJcblx0fSxcclxuXHJcblx0bWV0aG9kczoge1xyXG5cclxuXHRcdHN1Ym1pdDogZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0XHQvLyBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG5cdFx0XHQvLyBjb25zb2xlLmxvZyh0aGlzLm1vZGVsKTtcclxuXHJcblx0XHRcdCQuYWpheCh7XHJcblx0XHRcdFx0dXJsOiB0aGlzLmFjdGlvbixcclxuXHRcdFx0XHRtZXRob2Q6IHRoaXMubWV0aG9kLFxyXG5cdFx0XHRcdGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuXHRcdFx0XHRkYXRhOiBKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsKVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQuZG9uZSgoZCkgPT4ge1xyXG5cdFx0XHRcdGlmIChkb25lIGluIHRoaXMpIHRoaXMuZG9uZShkKTtcclxuXHRcdFx0fSlcclxuXHRcdFx0LmZhaWwoZnVuY3Rpb24oZSkgeyBpZiAoZmFpbCBpbiB0aGlzKSB0aGlzLmZhaWwoZSk7IH0uYmluZCh0aGlzKSlcclxuXHRcdH0sXHJcblxyXG5cdFx0cmVzZXQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRPYmplY3QuYXNzaWduKHRoaXMubW9kZWwsIHRoaXMub3JpZ2luYWwpO1xyXG5cdFx0fVxyXG5cdH0sXHJcbn0pOyIsIihmdW5jdGlvbigkLCBWdWUsIHVuZGVmaW5lZCkge1xyXG5cclxuXHQvLyB2YXIgbW9kZWwgPSB7XHJcblx0Ly8gXHRsaXN0OiBbXVxyXG5cdC8vIH07XHJcblx0Ly9cclxuXHQvLyB2YXIgYm9keSA9IFZ1ZS5leHRlbmQoe1xyXG5cdC8vIFx0Y3JlYXRlZDogZnVuY3Rpb24oKSAgeyB0aGlzLiRkaXNwYXRjaCgncmVnaXN0ZXItYm9keScsIHRoaXMpIH0sXHJcblx0Ly8gfSk7XHJcblxyXG5cdFZ1ZS5jb21wb25lbnQoJ2dyaWQtdGFibGUnLCB7XHJcblxyXG5cdFx0cmVwbGFjZTogZmFsc2UsXHJcblxyXG5cdFx0cHJvcHM6IHtcclxuXHRcdFx0ZDogQXJyYXlcclxuXHRcdH0sXHJcblxyXG5cdFx0Ly8gZGF0YTogZnVuY3Rpb24oKSB7XHJcblx0XHQvLyBcdHJldHVybiB7XHJcblx0XHQvLyBcdFx0aXRlbXM6IHRoaXMuZC5zbGljZSgwKVxyXG5cdFx0Ly8gXHR9XHJcblx0XHQvLyB9LFxyXG5cclxuXHRcdG1ldGhvZHM6IHtcclxuXHJcblx0XHRcdGFkZDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0Y29uc29sZS5sb2coJ2FzZGFzZCcpO1xyXG5cdFx0XHRcdHRoaXMuaXRlbXMucHVzaCh7fSk7XHJcblx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5pdGVtcyk7XHJcblx0XHRcdH0sXHJcblxyXG5cdFx0XHRyZW1vdmU6IGZ1bmN0aW9uKGluZGV4KSB7XHJcblx0XHRcdFx0dGhpcy5pdGVtcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUpO1xyXG4iLCJWdWUuY29tcG9uZW50KCdpbmxpbmUtdGV4dCcsXHJcblx0VnVlLmV4dGVuZCh7XHJcblx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScgXSxcclxuXHRcdHRlbXBsYXRlOiBgXHJcblx0XHRcdDxkaXYgY2xhc3M9XCJpbmxpbmUtY29udGFpbmVyXCI+XHJcblx0XHRcdFx0PGlucHV0IGNsYXNzPVwiaW5saW5lLWNvbnRyb2xcIiB0eXBlPVwidGV4dFwiIG5hbWU9XCJ7eyBuYW1lIH19XCIgdi1tb2RlbD1cInZhbHVlXCIgLz5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRgXHJcblx0fSlcclxuKTtcclxuXHJcblZ1ZS5jb21wb25lbnQoJ2lubGluZS1jaGVja2JveCcsXHJcblx0VnVlLmV4dGVuZCh7XHJcblx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScgXSxcclxuXHRcdHRlbXBsYXRlOiBgXHJcblx0XHRcdDxkaXYgY2xhc3M9XCJpbmxpbmUtY29udGFpbmVyXCI+XHJcblx0XHRcdFx0PGlucHV0IGNsYXNzPVwiaW5saW5lLWNoZWNrYm94XCIgdHlwZT1cImNoZWNrYm94XCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIiAvPlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdGBcclxuXHR9KVxyXG4pO1xyXG5cclxuVnVlLmNvbXBvbmVudCgnaW5saW5lLXNlbGVjdCcsXHJcblx0VnVlLmV4dGVuZCh7XHJcblx0XHRwcm9wczogWyAnbmFtZScsICd2YWx1ZScsICdvcHRpb25zJyBdLFxyXG5cdFx0dGVtcGxhdGU6IGBcclxuXHRcdFx0PGRpdiBjbGFzcz1cImlubGluZS1jb250YWluZXJcIj5cclxuXHRcdFx0XHQ8c2VsZWN0IGNsYXNzPVwiaW5saW5lLWNvbnRyb2wxXCIgbmFtZT1cInt7IG5hbWUgfX1cIiB2LW1vZGVsPVwidmFsdWVcIj5cclxuXHRcdFx0XHRcdDxvcHRpb24gdi1mb3I9XCJvcHRpb24gaW4gb3B0aW9uc1wiIHZhbHVlPVwie3sgb3B0aW9uLmtleSB9fVwiPnt7IG9wdGlvbi52YWx1ZSB9fTwvb3B0aW9uPlxyXG5cdFx0XHRcdDwvc2VsZWN0PlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdGBcclxuXHR9KVxyXG4pO1xyXG5cclxuVnVlLmNvbXBvbmVudCgnaW5saW5lLXZhbHVlJyxcclxuXHRWdWUuZXh0ZW5kKHtcclxuXHRcdHByb3BzOiBbICduYW1lJywgJ3ZhbHVlJywgJ2NsYXNzJyBdLFxyXG5cdFx0dGVtcGxhdGU6IGBcclxuXHRcdFx0PGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwie3sgbmFtZSB9fVwiIHYtbW9kZWw9XCJ2YWx1ZVwiIC8+XHJcblx0XHRcdDxzcGFuIDpjbGFzcz1cImNsYXNzXCI+e3sgdmFsdWUgfX08L3NwYW4+XHJcblx0XHRgXHJcblx0fSlcclxuKTtcclxuIiwiQ29yZSA9IHdpbmRvdy5Db3JlIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKFZ1ZSwgJCwgQ29yZSkge1xyXG5cclxuICAgIGZ1bmN0aW9uIGdlbmVyYXRlSWQoKSB7XHJcblxyXG4gICAgICAgIHZhciBBTFBIQUJFVCA9ICcwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWic7XHJcbiAgICAgICAgdmFyIElEX0xFTkdUSCA9IDg7XHJcblxyXG4gICAgICAgIHZhciBydG4gPSAnJztcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IElEX0xFTkdUSDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHJ0biArPSBBTFBIQUJFVC5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogQUxQSEFCRVQubGVuZ3RoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBydG47XHJcbiAgICB9XHJcblxyXG4gICAgQ29yZS5XaWRnZXRNaXhpbiA9IHtcclxuXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXHJcbiAgICAgICAgICAgIHN0YWNrOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGJpbmRpbmdzOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGNoaWxkcmVuOiBBcnJheSxcclxuICAgICAgICAgICAgZWRpdGFibGU6IEJvb2xlYW4sXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZGF0YTogIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgc3lzdGVtSWQ6IHRoaXMuc3lzdGVtSWQsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmFuZG9tSWQgPSBnZW5lcmF0ZUlkKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnYmluZGluZ3MuaWQnLCBmdW5jdGlvbih2YWx1ZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3lzdGVtSWQgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zeXN0ZW1JZCA9IHRoaXMucmFuZG9tSWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKGV2ZW50LCBpdGVtLCBjb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRkaXNwYXRjaChldmVudCwgeyBpdGVtOiBpdGVtLCBjb250ZXh0OiBjb250ZXh0IH0pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgQ29yZS5TdGFja2VkTWl4aW4gPSB7XHJcblxyXG4gICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgIGdsb2JhbHM6IE9iamVjdCxcclxuICAgICAgICAgICAgc2V0dGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgcGFnZTogT2JqZWN0LFxyXG4gICAgICAgICAgICBkYXRhOiBPYmplY3QsXHJcbiAgICAgICAgICAgIGVkaXRhYmxlOiBCb29sZWFuLFxyXG4gICAgICAgICAgICBjaGlsZHJlbjogQXJyYXksXHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcblxyXG4gICAgLy8gQ29yZS5CaW5kaW5nc01peGluID0ge1xyXG4gICAgLy9cclxuICAgIC8vICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgcmV0dXJuIHtcclxuICAgIC8vICAgICAgICAgICAgIGJpbmRpbmdzOiB0aGlzLmJpbmRpbmdzLFxyXG4gICAgLy8gICAgICAgICB9O1xyXG4gICAgLy8gICAgIH0sXHJcbiAgICAvL1xyXG4gICAgLy8gICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIGZ1bmN0aW9uIHJlY3VyKHBhcmFtcykge1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHt9O1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgIGZvcih2YXIga2V5IGluIHBhcmFtcykge1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICBpZiAocGFyYW1zW2tleV1bJ2JpbmRpbmcnXSkge1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgdmFsdWVba2V5XSA9IHNlbGYuJGludGVycG9sYXRlKHBhcmFtc1trZXldWydiaW5kaW5nJ10pO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCQuaXNBcnJheShwYXJhbXNba2V5XVsndmFsdWUnXSkpIHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIHZhbHVlW2tleV0gPSBbXTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBwYXJhbXNba2V5XVsndmFsdWUnXS5sZW5ndGg7IGkrKykge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVba2V5XVtpXSA9IHJlY3VyKHBhcmFtc1trZXldWyd2YWx1ZSddW2ldKTtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB2YWx1ZVtrZXldID0gcGFyYW1zW2tleV1bJ3ZhbHVlJ107XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICAgICAgfVxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgdGhpcy4kd2F0Y2goJ2RhdGEucGFyYW1zJywgZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICAvLyAgICAgICAgICAgICBzZWxmLmJpbmRpbmdzID0gcmVjdXIoc2VsZi5kYXRhLnBhcmFtcyk7XHJcbiAgICAvLyAgICAgICAgIH0sIHtcclxuICAgIC8vICAgICAgICAgICBkZWVwOiB0cnVlLFxyXG4gICAgLy8gICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZSxcclxuICAgIC8vICAgICAgICAgfSk7XHJcbiAgICAvLyAgICAgfVxyXG4gICAgLy8gfVxyXG5cclxuICAgIC8vIENvcmUuRGVjb3JhdG9yTWl4aW4gPSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgdmFyIGRlY29yYXRvciA9IHRoaXMuZGVjb3JhdG9yc1t0aGlzLndpZGdldC50YWddO1xyXG4gICAgLy8gICAgICAgICBpZiAoZGVjb3JhdG9yKSBkZWNvcmF0b3IoKTtcclxuICAgIC8vICAgICB9XHJcbiAgICAvLyB9XHJcblxyXG4gICAgLy8gQ29yZS5Db250YWluZXJNaXhpbiA9IHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgcHJvcHM6IHtcclxuICAgIC8vICAgICAgICAgaXRlbXM6IEFycmF5LFxyXG4gICAgLy8gICAgIH0sXHJcbiAgICAvL1xyXG4gICAgLy8gICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICByZXR1cm4ge1xyXG4gICAgLy8gICAgICAgICAgICAgY2hpbGRyZW46IHRoaXMuY2hpbGRyZW4sXHJcbiAgICAvLyAgICAgICAgIH07XHJcbiAgICAvLyAgICAgfSxcclxuICAgIC8vXHJcbiAgICAvLyAgICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgdGhpcy4kd2F0Y2goJ2l0ZW1zJywgZnVuY3Rpb24oaXRlbXMpIHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBbXTtcclxuICAgIC8vICAgICAgICAgICAgIGlmIChpdGVtcykge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBpdGVtc1tpXTtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uX2FjdGlvbiAhPSAncmVtb3ZlJykge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChpdGVtKTtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgICAgIH1cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICBjb25zb2xlLmxvZyhzZWxmKTtcclxuICAgIC8vICAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPCAyKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coc2VsZi4kcmVmcy53aWRnZXQsIHNlbGYuZGF0YSwgc2VsZik7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcyk7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgLy8gaWYgKHNlbGYuJHJlZnMud2lkZ2V0KSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgLy8gY2hpbGRyZW4ucHVzaChKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNlbGYuc3R1YikpKTtcclxuICAgIC8vICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAvLyAgICAgICAgICAgICB9XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xyXG4gICAgLy8gICAgICAgICB9LCB7XHJcbiAgICAvLyAgICAgICAgICAgICBpbW1lZGlhdGU6IHRydWUsXHJcbiAgICAvLyAgICAgICAgICAgICBkZWVwOiB0cnVlLFxyXG4gICAgLy8gICAgICAgICB9KTtcclxuICAgIC8vICAgICB9LFxyXG4gICAgLy9cclxuICAgIC8vICAgICBldmVudHM6IHtcclxuICAgIC8vICAgICAgICAgcmVtb3ZlQ2hpbGRXaWRnZXQ6IGZ1bmN0aW9uKGRhdGEpIHsgdGhpcy5kb1JlbW92ZUNoaWxkV2lkZ2V0KGRhdGEuaXRlbSwgZGF0YS5jb250ZXh0KTsgfSxcclxuICAgIC8vICAgICB9LFxyXG4gICAgLy9cclxuICAgIC8vICAgICBtZXRob2RzOiB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICByZW1vdmVXaWRnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICAgICAgdGhpcy4kcGFyZW50LiRkaXNwYXRjaCgncmVtb3ZlQ2hpbGRXaWRnZXQnLCB7IGl0ZW06IHRoaXMuZGF0YSB9KTtcclxuICAgIC8vICAgICAgICAgfSxcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIGRvUmVtb3ZlQ2hpbGRXaWRnZXQ6IGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICBpZiAoaXRlbS5fYWN0aW9uID09ICdjcmVhdGUnKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcy4kcmVtb3ZlKGl0ZW0pO1xyXG4gICAgLy8gICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICBpdGVtLl9hY3Rpb24gPSAncmVtb3ZlJztcclxuICAgIC8vICAgICAgICAgICAgIH1cclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICB0aGlzLml0ZW1zID0gJC5leHRlbmQodHJ1ZSwgW10sIHRoaXMuaXRlbXMpO1xyXG4gICAgLy8gICAgICAgICB9XHJcbiAgICAvLyAgICAgfSxcclxuICAgIC8vIH07XHJcblxyXG4gICAgLy8gQ29yZS5Tb3J0YWJsZU1peGluID0ge1xyXG4gICAgLy9cclxuICAgIC8vICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHJldHVybiB7XHJcbiAgICAvLyAgICAgICAgICAgICBzZWxlY3RlZDogdGhpcy5zZWxlY3RlZCxcclxuICAgIC8vICAgICAgICAgfTtcclxuICAgIC8vICAgICB9LFxyXG4gICAgLy9cclxuICAgIC8vICAgICByZWFkeTogZnVuY3Rpb24oKSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICB0aGlzLiR3YXRjaCgnc2VsZWN0ZWQnLCBmdW5jdGlvbihzZWxlY3RlZCkge1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgIGlmIChzZWxlY3RlZCkge1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICBzZWxmLnNvcnRhYmxlID1cclxuICAgIC8vICAgICAgICAgICAgICAgICBTb3J0YWJsZS5jcmVhdGUoJChzZWxmLnNlbGVjdG9yLCB0aGlzLiRlbCkuZ2V0KDApLCB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIGdyb3VwOiB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnd2lkZ2V0cycsXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogMTUwLFxyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgb25BZGQ6IGZ1bmN0aW9uIChldnQpIHtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFsZXR0ZSA9ICQoZXZ0Lml0ZW0pLmNsb3Nlc3QoJy5nZS5nZS1wYWxldHRlJyk7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFwYWxldHRlLmxlbmd0aCkge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoZXZ0Lml0ZW0pLnJlbW92ZSgpO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaSA9IGZpbmQoc2VsZi5pdGVtcywgZXZ0Lm5ld0luZGV4KTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHdpZGdldCA9IHNlbGYuJHJvb3QuJHJlZnMuc2hlbGwuZ2V0V2lkZ2V0KCQoZXZ0Lml0ZW0pLmRhdGEoJ3dpZGdldCcpKTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pdGVtcy5zcGxpY2UoaS5pbmRleCwgMCwge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB3aWRnZXQuaWQsXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IFtdLFxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogJ2NyZWF0ZSdcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiB3aWRnZXQucGFyYW1zXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkod2lkZ2V0LnBhcmFtcykpXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHt9XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICxcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2FjdGlvbjogJ2NyZWF0ZScsXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuaXRlbXMgPSAkLmV4dGVuZCh0cnVlLCBbXSwgc2VsZi5pdGVtcyk7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICBvbkVuZDogZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIGlmICAoZXZ0Lm5ld0luZGV4ICE9IGV2dC5vbGRJbmRleCkge1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9pID0gZmluZChzZWxmLml0ZW1zLCBldnQub2xkSW5kZXgpO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuaSA9IGZpbmQoc2VsZi5pdGVtcywgZXZ0Lm5ld0luZGV4KTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pdGVtcy5zcGxpY2UobmkuaW5kZXgsIDAsIHNlbGYuaXRlbXMuc3BsaWNlKG9pLmluZGV4LCAxKVswXSk7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pdGVtcyA9ICQuZXh0ZW5kKHRydWUsIFtdLCBzZWxmLml0ZW1zKTtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIGlmIChzZWxmLnNvcnRhYmxlKSB7XHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIHNlbGYuc29ydGFibGUuZGVzdHJveSgpO1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICBzZWxmLnNvcnRhYmxlID0gbnVsbDtcclxuICAgIC8vICAgICAgICAgICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgIH0sIHtcclxuICAgIC8vICAgICAgICAgICAgIGltbWVkaWF0ZTogdHJ1ZVxyXG4gICAgLy8gICAgICAgICB9KTtcclxuICAgIC8vICAgICB9LFxyXG4gICAgLy9cclxuICAgIC8vICAgICBtZXRob2RzOiB7XHJcbiAgICAvLyAgICAgICAgIHNlbGVjdFRhcmdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgIC8vICAgICAgICAgfSxcclxuICAgIC8vXHJcbiAgICAvLyAgICAgICAgIHVuc2VsZWN0VGFyZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgIC8vICAgICAgICAgfSxcclxuICAgIC8vICAgICB9XHJcbiAgICAvLyB9O1xyXG5cclxufSkoVnVlLCBqUXVlcnksIENvcmUsIHVuZGVmaW5lZCk7XHJcbiIsIlZ1ZS5jb21wb25lbnQoJ21vZGFsJywge1xyXG5cclxuICAgIHByb3BzOiB7XHJcbiAgICAgICAgaWQ6IFN0cmluZyxcclxuICAgICAgICBjdXJyZW50OiBPYmplY3QsXHJcbiAgICAgICAgb3JpZ2luYWw6IE9iamVjdCxcclxuICAgIH0sXHJcblxyXG4gICAgbWV0aG9kczoge1xyXG5cclxuICAgICAgICBzdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goJ3N1Ym1pdCcsIHRoaXMuY3VycmVudCk7XHJcbiAgICAgICAgICAgIC8vIE9iamVjdC5hc3NpZ24odGhpcy5vcmlnaW5hbCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmN1cnJlbnQpKSk7XHJcbiAgICAgICAgICAgICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgcmVzZXQ6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdGhpcy4kZGlzcGF0Y2goJ3Jlc2V0JywgdGhpcy5jdXJyZW50KTtcclxuICAgICAgICAgICAgLy8gT2JqZWN0LmFzc2lnbih0aGlzLmN1cnJlbnQsIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5vcmlnaW5hbCkpKTtcclxuICAgICAgICAgICAgJChlLnRhcmdldCkuY2xvc2VzdCgnLm1vZGFsJykubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG4iLCJWdWUuZGlyZWN0aXZlKCdjb21ibycsIHtcclxuXHJcblx0YmluZDogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdGlmICgkLmZuLnRhZ3NpbnB1dCkge1xyXG5cclxuXHRcdFx0JCh0aGlzLmVsKS5zZWxlY3QyKHtcclxuXHRcdFx0XHR0YWdzOiB0cnVlLFxyXG5cdFx0XHRcdG11bHRpcGxlOiBmYWxzZSxcclxuXHRcdFx0XHRjcmVhdGVUYWc6IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuXHRcdFx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0XHRcdGlkOiBwYXJhbXMudGVybSxcclxuXHRcdFx0XHRcdFx0dGV4dDogcGFyYW1zLnRlcm0sXHJcblx0XHRcdFx0XHRcdG5ld09wdGlvbjogdHJ1ZVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0dXBkYXRlOiBmdW5jdGlvbiAobmV3VmFsdWUsIG9sZFZhbHVlKSB7XHJcblx0fSxcclxuXHR1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHR9XHJcbn0pO1xyXG4iLCJWdWUuZGlyZWN0aXZlKCdkYXRlJywge1xyXG5cclxuXHRiaW5kOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRcclxuXHRcdGlmICgkLmZuLmRhdGVwaWNrZXIpIHtcclxuXHJcblx0XHRcdCQodGhpcy5lbCkuZGF0ZXBpY2tlcih7XHJcblx0XHRcdFx0YXV0b2Nsb3NlOiB0cnVlLFxyXG5cdFx0XHRcdHRvZGF5SGlnaGxpZ2h0OiB0cnVlLFxyXG5cdFx0XHRcdGZvcm1hdDogXCJ5eXl5LW1tLWRkXCJcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHR1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuXHR9LFxyXG5cdHVuYmluZDogZnVuY3Rpb24gKCkge1xyXG5cdH1cclxufSk7XHJcbiIsIlZ1ZS5kaXJlY3RpdmUoJ3JpY2gnLCB7XHJcblxyXG4gICAgYmluZDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiAod2luZG93LkNLRURJVE9SKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVkaXRvciA9IENLRURJVE9SLmlubGluZSh0aGlzLmVsLCB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZXNTZXQ6IFtcclxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdCb2xkZXInLCBlbGVtZW50OiAnc3BhbicsIGF0dHJpYnV0ZXM6IHsgJ2NsYXNzJzogJ2V4dHJhYm9sZCd9IH1cclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICB0b29sYmFyR3JvdXBzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgLy8geyBuYW1lOiAnY2xpcGJvYXJkJywgICBncm91cHM6IFsgJ2NsaXBib2FyZCcsICd1bmRvJyBdIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgLy8geyBuYW1lOiAnZWRpdGluZycsICAgICBncm91cHM6IFsgJ2ZpbmQnLCAnc2VsZWN0aW9uJywgJ3NwZWxsY2hlY2tlcicgXSB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2xpbmtzJyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHsgbmFtZTogJ2Zvcm1zJyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtuYW1lOiAndG9vbHMnfSxcclxuICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ2RvY3VtZW50JywgZ3JvdXBzOiBbJ21vZGUnLCAnZG9jdW1lbnQnLCAnZG9jdG9vbHMnXX0sXHJcbiAgICAgICAgICAgICAgICAgICAge25hbWU6ICdvdGhlcnMnfSxcclxuICAgICAgICAgICAgICAgICAgICB7bmFtZTogJ3BhcmFncmFwaCcsIGdyb3VwczogWydsaXN0JywgJ2luZGVudCcsICdibG9ja3MnLCAnYWxpZ24nXX0sXHJcbiAgICAgICAgICAgICAgICAgICAge25hbWU6ICdjb2xvcnMnfSxcclxuICAgICAgICAgICAgICAgICAgICAnLycsXHJcbiAgICAgICAgICAgICAgICAgICAge25hbWU6ICdiYXNpY3N0eWxlcycsIGdyb3VwczogWydiYXNpY3N0eWxlcycsICdjbGVhbnVwJ119LFxyXG4gICAgICAgICAgICAgICAgICAgIHtuYW1lOiAnc3R5bGVzJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgJy8nLFxyXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ2luc2VydCcsIGdyb3VwczogWyAnSW1hZ2VCdXR0b24nIF0gIH1cclxuICAgICAgICAgICAgICAgICAgICAvL3tuYW1lOiAnYWJvdXQnfVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWRpdG9yLnVwZGF0ZUVsZW1lbnQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudm0uJHNldCh0aGlzLmV4cHJlc3Npb24sICQodGhpcy5lbCkudmFsKCkpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0RGF0YSh0aGlzLnZtLiRnZXQodGhpcy5leHByZXNzaW9uKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygndXBkYXRlJywgbmV3VmFsdWUsIG9sZFZhbHVlKTtcclxuICAgIH0sXHJcblxyXG4gICAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5lZGl0b3IuZGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMuZWRpdG9yID0gbnVsbDtcclxuICAgICAgICB0aGlzLnRleHRhcmVhID0gbnVsbDtcclxuICAgICAgICB0aGlzLmlucHV0ID0gbnVsbDtcclxuICAgIH1cclxufSk7XHJcbiIsIlZ1ZS5kaXJlY3RpdmUoJ3Njcm9sbGFibGUnLCB7XHJcblxyXG4gICAgYmluZDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAkKHRoaXMuZWwpLmNzcyh7XHJcbiAgICAgICAgICAgICdvdmVyZmxvdyc6ICdhdXRvJyxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gaWYgKCQuZm4ubUN1c3RvbVNjcm9sbGJhcikge1xyXG4gICAgICAgIC8vICAgICBWdWUubmV4dFRpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gICAgICAgICAkKHRoaXMuZWwpLm1DdXN0b21TY3JvbGxiYXIoe1xyXG4gICAgICAgIC8vICAgICAgICAgICAgIGF4aXM6IHRoaXMuZXhwcmVzc2lvblxyXG4gICAgICAgIC8vICAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgIH0sXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuICAgIH0sXHJcbiAgICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIH1cclxufSk7XHJcbiIsIlZ1ZS5kaXJlY3RpdmUoJ3RhZ3MnLCB7XHJcblxyXG5cdGJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRpZiAoJC5mbi50YWdzaW5wdXQpIHtcclxuXHJcblx0XHRcdCQodGhpcy5lbCkudGFnc2lucHV0KHtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHR1cGRhdGU6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuXHR9LFxyXG5cdHVuYmluZDogZnVuY3Rpb24gKCkge1xyXG5cdH1cclxufSk7XHJcbiIsIihmdW5jdGlvbigkKSB7XHJcblxyXG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcG9zaXRpb24oZWxlbWVudCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIG1vZGFsID0gJChlbGVtZW50KSxcclxuICAgICAgICAgICAgICAgIGRpYWxvZyA9ICQoJy5tb2RhbC1kaWFsb2cnLCBtb2RhbCk7XHJcblxyXG4gICAgICAgICAgICBtb2RhbC5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgZGlhbG9nLmNzcyhcIm1hcmdpbi10b3BcIiwgTWF0aC5tYXgoMCwgKCQod2luZG93KS5oZWlnaHQoKSAtIGRpYWxvZy5oZWlnaHQoKSkgLyAyKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkKCQoZG9jdW1lbnQpLCAnLm1vZGFsLm1vZGFsLWNlbnRlcicpLm9uKCdzaG93LmJzLm1vZGFsJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICByZXBvc2l0aW9uKGUudGFyZ2V0KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICQoJy5tb2RhbC5tb2RhbC1jZW50ZXI6dmlzaWJsZScpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHJlcG9zaXRpb24oZWxlbWVudCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnkpO1xyXG4iLCJWdWUuZmlsdGVyKCdqc29uUGF0aCcsIGZ1bmN0aW9uIChjb250ZXh0LCBzdHIpIHtcclxuICAgIGlmIChzdHIgPT09IHVuZGVmaW5lZCB8fCBjb250ZXh0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHJlID0gL3soW159XSspfS9nO1xyXG5cclxuICAgIHJlc3VsdCA9IHN0ci5yZXBsYWNlKHJlLCBmdW5jdGlvbihtYXRjaCwgZXhwcikge1xyXG4gICAgICAgIGpzb24gPSBKU09OUGF0aCh7XHJcbiAgICAgICAgICAgIGpzb246IGNvbnRleHQsXHJcbiAgICAgICAgICAgIHBhdGg6IGV4cHJcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoanNvbi5oYXNPd25Qcm9wZXJ0eSgxKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ2FycmF5JztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4ganNvbjtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAocmVzdWx0ID09ICdhcnJheScpIHtcclxuICAgICAgICByZXR1cm4gSlNPTlBhdGgoe1xyXG4gICAgICAgICAgICBqc29uOiBjb250ZXh0LFxyXG4gICAgICAgICAgICBwYXRoOiBzdHIucmVwbGFjZShyZSwgXCIkMVwiKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59KTtcclxuXHJcblZ1ZS5maWx0ZXIoJ2Fzc2lnbicsIGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZTEsIHNvdXJjZTIsIHNvdXJjZTMpIHtcclxuXHJcblx0cmV0dXJuIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UxLCBzb3VyY2UyLCBzb3VyY2UzKTtcclxufSk7XHJcblxyXG5WdWUuZmlsdGVyKCdjb3B5JywgZnVuY3Rpb24gKHNvdXJjZSkge1xyXG5cclxuXHRyZXR1cm4gbmV3IFZ1ZSh7XHJcblx0XHRkYXRhOiBzb3VyY2UgIT0gbnVsbFxyXG5cdFx0XHQ/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc291cmNlKSlcclxuXHRcdFx0OiBudWxsXHJcblx0fSkuJGRhdGE7XHJcbn0pO1xyXG5cclxuVnVlLmZpbHRlcignY2xvbmUnLCBmdW5jdGlvbiAoc291cmNlKSB7XHJcblxyXG5cdHJldHVybiBuZXcgVnVlKHtcclxuXHRcdGRhdGE6IHNvdXJjZSAhPSBudWxsXHJcblx0XHRcdD8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzb3VyY2UpKVxyXG5cdFx0XHQ6IG51bGxcclxuXHR9KS4kZGF0YTtcclxufSk7XHJcblxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
