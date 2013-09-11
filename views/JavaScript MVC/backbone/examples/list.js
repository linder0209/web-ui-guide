$(function(){

	//Model:表示一个学生
	var Student=Backbone.Model.extend({
		//默认值
		defaults:function(){
			return{
				name:"XXX",
				age:"0",
				selected:false,
				id:Students.nextId()
			};
		},
		
		//初始化的时候判断，如果设置的属性值非法就设为默认值
		initialize:function(){
			if(!this.get("name")){
				this.set({"name":this.defaults().name});
			}
			if(!this.get("age")||!(/(^[1-9]\d*$)/.test(this.get("age")))){
				this.set({"age":this.defaults().age});
			}
		},

		//标记该学生是否被选中
		toggle:function(){
			this.save({selected:!this.get("selected")});
		}
	});

	//Collection:Model的集合，即所有学生的集合
	var Students=Backbone.Collection.extend({
		
		model:Student,
		
		//本地数据库，用到backbone-localstorage.js
		//localStorage:new Backbone.LocalStorage("Students-Table"),

		//返回被选中的学生的集合
		selected:function(){
			return this.filter(function(student){return student.get('selected');});
		},

		//给每个学生一个编号
		nextId:function(){
			if(!this.length)
				return 1;
			return this.last().get('id')+1;
		}
	});

	//定义一个学生集合对象
	var Students=new Students;


	//View:这个视图表示table中的一列，即一个学生，对应一个Model
	var StudentView=Backbone.View.extend({
		//表示<tr></tr>元素
		tagName:"tr",
		
		//将相应模板写入template属性中，_.template()为underscore.js中的方法
		template:_.template($('#item-template').html()),

		//绑定该tr下的事件
		events:{
			"click .toggle":"toggleSelect",
			"dblclick td":"edit",
			"click a.destroy":"clear",
			"blur .edit":"close"
		},

		//初始化该View，listenTo监听model的事件
		initialize:function(){
			//model发生变化就重新渲染视图
			this.listenTo(this.model,'change',this.render);
			//销毁model
			this.listenTo(this.model,'destroy',this.remove);
		},

		//this.$el为该tr节点元素，将template渲染进该节点，并把model的值写入
		render:function(){
			this.$el.html(this.template(this.model.toJSON()));
			//如果该行被选中，则切换样式
			this.$el.toggleClass('selected',this.model.get('selected'));
			return this;
		},

		//判断该行是否被选中，对应model中的selected属性
		toggleSelect:function(){
			this.model.toggle();
		},

		//双击td将样式变为可编辑
		edit:function(e){
			$(e.currentTarget).addClass("editing").find("input,select").focus();
		},

		//编辑状态下失去焦点，则修改完成
		close:function(e){
			var input=$(e.currentTarget);

			if(input.attr('name')=="name"){
				if(!input.val()){
					input.val(this.model.defaults().name);
				}
				this.model.save({"name":input.val()});
			}else if(input.attr('name')=="gender"){
				this.model.save({"gender":input.val()});
			}else{
				if(!input.val()||!(/(^[1-9]\d*$)/.test(input.val()))){
					input.val(this.model.defaults().age);
				}
				this.model.save({"age":input.val()});
			}
			input.parent().removeClass("editing");
		},

		//删除该行的时候删除相应model
		clear:function(){
			this.model.destroy();
		}
	});


	//View:这个视图表示$("#content")，用来表现整个学生表格
	var AppView=Backbone.View.extend({
		el:$("#content"),

		events:{
			"click #add-student":"addNewStudent",
			"click #clear-selected":"clearSelected",
			"click #select-all":"selectAll"
		},

		initialize:function(){
			this.allCheckbox=$("#select-all");
			this.main=$("#main");
			this.footer=$('footer');
			this.name=$("#new-name");
			this.age=$("#new-age");
			this.gender=$("#new-gender");

			//Collection中增加一个Model就触发add事件
			this.listenTo(Students,'add',this.addOne);
			//一旦调用fetch方法就触法reset事件
			this.listenTo(Students,'reset',this.addAll);
			//all事件表示该View下的所有事件，即触法任意事件就触法all事件
			this.listenTo(Students,'all',this.render);

			//从本地数据库中获取所有学生
			//Students.fetch();
			
			var students = this.options.students;
			Students.add(students);
		},

		//渲染视图
		render:function(){
			var selected=Students.selected().length;
			
			if(Students.length){
				this.main.show();
				this.footer.show();
				this.footer.html(this.statsTemplate({selected:selected}));
			}else{
				this.main.hide();
				this.footer.hide();
			}
			//判断所有学生是否被选中
			this.allCheckbox.attr("checked",selected==Students.length?true:false);
		},

		//增加一个学生，同时将model传入StudentView中
		addOne:function(student){
			var view=new StudentView({model:student});
			//将渲染后的每一列添加到表格中
			this.$("#student-list").append(view.render().el);
		},

		//增加所有学生，通过Collection.each依次调用addOne方法
		addAll:function(){
			Students.each(this.addOne,this);
		},

		//增加一个新学生
		addNewStudent:function(){
			Students.create({name:this.name.val(),gender:this.gender.val(),age:this.age.val()});
			this.name.val('');
			this.age.val('');
			this.gender.val(1);
		},

		//删除选中列，_.invoke(集合,方法)
		clearSelected:function(){
			_.invoke(Students.selected(),'destroy');
		},

		//选中所有
		selectAll:function(){
			var selected=this.allCheckbox.attr('checked')=="checked";
			Students.each(function(student){
				student.save({'selected':selected});
			});
		}
	});

	//创建View
	var students =[{
		name:'name1',
		gender:'0',
		age:23
	},{
		name:'name2',
		gender:'1',
		age:45
	}];
	var App=new AppView({students:students});
});