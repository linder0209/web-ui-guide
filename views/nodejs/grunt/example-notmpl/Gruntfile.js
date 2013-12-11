module.exports = function(grunt) {
 
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    //配置concat插件
    concat: {
      options: {
        // 定义一个用于插入合并输出文件之间的字符
        separator: ';'
      },
      dist: {
        // 将要被合并的文件
        src: ['src/**/*.js'],
        // 合并后的JS文件的存放位置
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    // 配置uglify插件
    uglify: {
      options: {
        // 此处定义的banner注释将插入到输出文件的顶部
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    // 配置qunit插件
    qunit: {
      files: ['test/**/*.html']
    },
    // 配置jshint插件
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        //这里是覆盖JSHint默认配置的选项
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    // 配置watch插件
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit']
    }
  });
   
  //加载所需要的Grunt插件
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
 
  // 设置一些task,最重要的是default任务
  // 在命令行上输入"grunt test"，test task就会被执行。
  grunt.registerTask('test', ['jshint', 'qunit']);
  // 只需在命令行上输入"grunt"，就会执行default task
  grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
 
};