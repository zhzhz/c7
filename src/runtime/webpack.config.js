const path = require('path')

module.exports = {
    //mode:"production",
    mode:"development",
    //入口，打包webapck的入口文件地址，相对路径时，./不能省略
    entry: './main.js',
    //output：指定输出路径，filename：文件名称
    output:{
        filename:'c7.js' ,
        //path是绝对路径
        path: path.join(__dirname,"output")
    },

	module:{
	rules: [
        {
    		test: /\.js$/,
    		use: {
      			loader: 'babel-loader'
   		},
    		exclude: '/node_modules/'
  	}
	]
	}
}


