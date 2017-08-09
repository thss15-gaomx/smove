(function(){
	var can1, can2;   //canvas1画布 ,   canvas2画布
	var ctx1, ctx2;   //两个画笔
	var canWid, canHei;  //画布的宽高
	var lastframetime,  diffframetime=0;  // 上一帧动画的时间，两帧时间差
	var playerOb, goalOb, attackOb;  //果实对象 和 玩家对象
	var scoreOb, waveOb;      //和数据对象（计算分值）和圆圈对象
	var pauseTime = 80;     //暂停时间
	var keysDown;      //存储按键信息
	var areaX = 130, areaY = 200; //游戏框的位置
	var areaW = 240, areaH = 240, areaR = 50;  //游戏框的大小
	var scale = new Array();  //背景渐变
	var crashR = 0;
	// **********************************************************************************全局函数、初始化、判断等*******
	// *****************************************************************************************************************
	window.smove = {};
	smove.getReady = function(){
		scoreOb = new scoreObject();   //创建的时候已经初始化

		can1 = document.getElementById('canvas1');
		ctx1 = can1.getContext('2d');  //上面的canvas
		can2 = document.getElementById('canvas2');
		ctx2 = can2.getContext('2d');   //下面的canvas
		can1.addEventListener('click', smove.onClick, false);

		canWid = can1.width;
		canHei = can1.height;

		var my_gradient=ctx2.createLinearGradient(0,0,0,canHei);
        my_gradient.addColorStop(0,"#3366cc");
        my_gradient.addColorStop(1,"#33ccff");
        ctx2.fillStyle=my_gradient;
        ctx2.fillRect(0,0,canWid,canHei);

		ctx2.fillStyle="rgba(255, 215, 0, "+ 0.8 +")";
		ctx2.fillRect(0,canHei * 0.5 + 100,canWid, 150);
		ctx2.textAlign = 'center';
		ctx2.font = '90px verdana';
		ctx2.fillStyle = "rgba(255, 255, 255, "+ 1 +")";
		ctx2.fillText("SMOVE", canWid * 0.5, canHei * 0.5 - 50);
		ctx2.shadowBlur = 10;
		ctx2.shadowColor = "white";
		ctx2.font = '50px verdana';
		ctx2.fillText("Start Game", canWid * 0.5, canHei * 0.5 + 180);

	}

	smove.init = function(){
		ctx1.fillStyle = 'white';
		ctx1.font = '20px 微软雅黑';
		ctx1.textAlign = 'center';

		ctx2.shadowBlur = 0;
		ctx2.shadowColor = "black";

		for(var i = 1; i < 10; i++){
			scale[i] = 0;
		}
		scale[0] = 400;

		// Handle keyboard controls
		addEventListener("keydown", function (e) {
			keysDown = e.keyCode;
			update();
		}, false);

		attackOb = new attackObject();
		attackOb.init();

		playerOb = new playerObject();
		playerOb.init();

		goalOb = new goalObject();
		goalOb.init();
		while(playerOb.line == goalOb.line && goalOb.row == playerOb.row){
			goalOb.init();
		}

		waveOb = new waveObject();
		waveOb.init();
	}
 
	smove.gameLoop = function(){   //使用帧绘画，一直在画的东西
		requestAnimFrame(smove.gameLoop);
		var now = Date.now();    //1970 00:00:00 到现在的毫秒数
		diffframetime = now - lastframetime;
		lastframetime = now;

		ctx2.clearRect(0, 0, canWid, canHei);    //清除画布2
		can2App.drawBackgorund();

		if(pauseTime > 0){
			pauseTime--;
		}
		else{
			bornAttack();
			attackOb.drawAttack();  //画子弹部分
		}

		ctx1.clearRect(0, 0, canWid, canHei);    //清除画布1
		playerOb.drawPlayer();
		goalOb.drawGoal();
		if(scoreOb.gameStatus == 1){  //如果游戏没有结束
		 	smove.getGoal();  //随时判断果实是否被吃掉
			smove.getAttack();  //判断是否受到攻击
		}
		scoreOb.drawScore();

		waveOb.drawWave();
	}

	smove.onClick = function(){
		if(scoreOb.gameStatus == 0){
			scoreOb.gameStatus = 1;			
            smove.init();
            lastframetime = Date.now();
            smove.gameLoop();
		}
		else if(scoreOb.gameStatus == 2){   //如果游戏为结束状态
			scoreOb.gameStatus = 1;
			playerOb.init();
			goalOb.init();
			scoreOb.init();
			attackOb.init();
			for(var i = 1; i < 10; i++){
				scale[i] = 0;
			}
			scale[0] = canHei;
			pauseTime = 80;
			crashR = 0;
		}
	}

	smove.getGoal = function(){     //吃到果实得分
		if (playerOb.line == goalOb.line && goalOb.row == playerOb.row){
		    ++scoreOb.score;
			waveOb.born();     //吃掉的时候，产生圆圈
			while(playerOb.line == goalOb.line && goalOb.row == playerOb.row){
				goalOb.init();
			}
		}
	}
	smove.getAttack = function(){    //碰到子弹
		for(var i = 0; i < attackOb.num; i++ ){
			if(distance(playerOb.x, playerOb.y, attackOb.x[i], attackOb.y[i], 20)){
			 	scoreOb.gameStatus = 2;
			}
		}
	}

	update = function () {
		if (38 == keysDown && playerOb.line != 0) { // Player up
			playerOb.line--;
		}
		if (40 == keysDown && playerOb.line != 2) { // Player down
			playerOb.line++;
		}
		if (37 == keysDown && playerOb.row != 0) { // Player left
			playerOb.row--;
		}
		if (39 == keysDown && playerOb.row != 2) { // Player holding right
			playerOb.row++;
		}
	};

	// *******************************************************画布2上绘制东西  （背景，子弹）**********************
	window.can2App = {};
	// **************************************************************************画背景****************************************
	can2App.drawBackgorund = function(){
        // 创建渐变
		if(scoreOb.level > 1){
			if(scale[scoreOb.level - 1] < canHei){
				scale[scoreOb.level - 1] += 4;
			}
		}
        var my_gradient=ctx2.createLinearGradient(0,0,0,scale[scoreOb.level - 1]);
		switch (scoreOb.level){
			case 1:
				my_gradient.addColorStop(0,"#3366cc");
        		my_gradient.addColorStop(1,"#33ccff");
				break;
			case 2:
				my_gradient.addColorStop(0,"#008b8b");
        		my_gradient.addColorStop(1,"#40e0d0");
				break;
			case 3:
				my_gradient.addColorStop(0,"#db7093");
        		my_gradient.addColorStop(1,"#ffb6c1");
				break;
			case 4:
				my_gradient.addColorStop(0,"#ff7f50");
        		my_gradient.addColorStop(1,"#ffa07a");
				break;
			case 5:
				my_gradient.addColorStop(0,"#808000");
        		my_gradient.addColorStop(1,"#bdb76b");
				break;
			case 6:
				my_gradient.addColorStop(0,"#5f9ea0");
        		my_gradient.addColorStop(1,"#b0e0e6");
				break;
			case 7:
				my_gradient.addColorStop(0,"#483d8b");
        		my_gradient.addColorStop(1,"#6a5acd");
				break;
			case 8:
				my_gradient.addColorStop(0,"#8b4513");
        		my_gradient.addColorStop(1,"#d2691e");
				break;	
			default:
				my_gradient.addColorStop(0,"#3366cc");
        		my_gradient.addColorStop(1,"#33ccff");
				break;
		}
        ctx2.fillStyle=my_gradient;
        ctx2.fillRect(0,0,canWid,canHei);
 
        ctx2.strokeStyle="#f5f5f5";
		ctx2.lineWidth=5;
        ctx2.beginPath();
        ctx2.moveTo(areaX + areaR, areaY);            
        ctx2.arcTo(areaX + areaW, areaY, areaX + areaW, areaY + areaH, areaR);  
        ctx2.arcTo(areaX + areaW, areaY + areaH, areaX, areaY + areaH, areaR); 
        ctx2.arcTo(areaX, areaY + areaH, areaX, areaY, areaR); 
        ctx2.arcTo(areaX, areaY, areaX + areaW, areaY, areaR);  
        ctx2.closePath();
        ctx2.stroke();
 
		ctx2.lineWidth=2;
        ctx2.beginPath();
        ctx2.moveTo(areaX + 8, areaY + 0.333 * areaH);
        ctx2.lineTo(areaX + areaW - 8, areaY + 0.333 * areaH);
        ctx2.stroke();
 
        ctx2.beginPath();
        ctx2.moveTo(areaX + 8, areaY + 0.667 * areaH);
        ctx2.lineTo(areaX + areaW - 8, areaY + 0.667 * areaH);
        ctx2.stroke();
 
        ctx2.beginPath();
        ctx2.moveTo(areaX + 0.333 * areaW, areaY + 8);
        ctx2.lineTo(areaX + 0.333 * areaW, areaY + areaH - 8);
        ctx2.stroke();
 
        ctx2.beginPath();
        ctx2.moveTo(areaX + 0.667 * areaW, areaY + 8);
        ctx2.lineTo(areaX + 0.667 * areaW, areaY + areaH - 8);
        ctx2.stroke();
	}

	//********************************************************************//定义攻击球类****************************
	var attackObject = function(){
		this.num = 1;
		this.x = [];
		this.y = [];
		this.type = [];   //子弹的类型
		this.way = [];   //子弹的行列
		this.speed = [];  //子弹速度
		this.alive = [];  //bool，是否活着
	}
	attackObject.prototype.init = function(){
		for(var i = 0; i < this.num; i++){
			this.x[i] = this.y[i] = 0;
			this.speed[i] = 4;
			this.alive[i] = false;   //初始值都为false
			this.type[i]  = 0;
		}
	}
	attackObject.prototype.drawAttack = function(){
		if(scoreOb.level < 6){
			this.num = scoreOb.level;
		}
		else{
			this.num = 5;
		}
		for(var i = 0; i < this.num; i++){
			this.speed[i] = 3.5 + 0.5 * scoreOb.level;
			if(this.alive[i]){
				switch (this.type[i]){
					case 1:
						this.y[i] += this.speed[i];
						if(this.y[i] > 700){
							this.dead(i);
						}
						break;
					case 2:
						this.y[i] -= this.speed[i];
						if(this.y[i] < -50){
							this.dead(i);
						}
						break;
					case 3:
						this.x[i] += this.speed[i];
						if(this.x[i] > 550){
							this.dead(i);
						}
						break;
					case 4:
						this.x[i] -= this.speed[i];
						if(this.x[i] < -50){
							this.dead(i);
						}
						break;
				}

				ctx2.beginPath();
				ctx2.arc(this.x[i],this.y[i],20,0,360,false);
				ctx2.fillStyle="black";//填充颜色,默认是黑色
				ctx2.fill();//画实心圆
				ctx2.closePath();
			}
		}
	}
	attackObject.prototype.born = function(i){
		this.alive[i] = true;
		var flag = Math.random();  
		var way = parseInt(Math.random() * 100) % 3;
		if(flag < 0.25){                        //上
			this.type[i] = 1;
			this.way = way;
			this.x[i] = areaX + (2 * this.way + 1) * (areaW / 6);    //子弹的横坐标
			this.y[i] = -50;    //子弹的总坐标
		}
		else if(flag >= 0.25 && flag < 0.5){    //下
			this.type[i] = 2;
			this.way = way;
			this.x[i] = areaX + (2 * this.way + 1) * (areaW / 6);    //子弹的横坐标
			this.y[i] = 700;    //子弹的总坐标
		}
		else if(flag >= 0.5 && flag < 0.75){    //左
			this.type[i] = 3;
			this.way = way;
			this.x[i] = -50;    //子弹的横坐标
			this.y[i] = areaY + (2 * this.way + 1) * (areaH / 6);    //子弹的总坐标
		}
		else{                                   //右
			this.type[i] = 4;
			this.way = way;
			this.x[i] = 550;    //子弹的横坐标
			this.y[i] = areaY + (2 * this.way + 1) * (areaH / 6);    //子弹的总坐标
		}
	}
	attackObject.prototype.dead = function(i){
		this.alive[i] = false;
	}
	function bornAttack() {     //循环子弹，如果状态为false，则让它生成
		for(var i = 0; i < attackOb.num; i++){
			if(!attackOb.alive[i]){
				attackOb.born(i);
				return false;
			}
		}
	}

	//***********************************************************************画布1上绘制东西****************
	// **********************************************************************************************************
	window.can1App = {};

 //********************************************************************//定义玩家球类*********************
	var playerObject = function(){
    	this.x = 0;
    	this.y = 0;
		this.line = 0;
		this.row = 0;
    }
 
 	playerObject.prototype.init = function(){
		this.line = parseInt(Math.random() * 100) % 3;
		this.row = parseInt(Math.random() * 100) % 3;
     	this.x = areaX + (2 * this.row + 1) * (areaW / 6);
		this.y = areaY + (2 * this.line + 1) * (areaH / 6);
	}

	playerObject.prototype.drawPlayer = function(){
		this.x = areaX + (2 * this.row + 1) * (areaW / 6);
		this.y = areaY + (2 * this.line + 1) * (areaH / 6);
		if(scoreOb.gameStatus == 1){
			ctx1.beginPath();
			ctx1.arc(this.x,this.y,25,0,360,false);
			ctx1.fillStyle="gold";//填充颜色,默认是黑色
			ctx1.fill();//画实心圆
			ctx1.closePath();
		}
		else if(scoreOb.gameStatus == 2){
			ctx1.lineWidth = 3;
			crashR += diffframetime * 0.04;
			if(crashR < 200){
				var alpha = 1 - crashR / 150;
				ctx1.strokeStyle = "rgba(255, 215, 0, "+ alpha +")";
				ctx1.beginPath();
				ctx1.arc(this.x, this.y, crashR, 0, 2 * Math.PI);   
				ctx1.stroke();
			}
		}
	}

 //********************************************************************//定义目标球类*********************
	var goalObject = function(){
    	this.x = 0;
    	this.y = 0;
		this.line = 0;
		this.row = 0;
		this.degree = 0;
    }
 
 	goalObject.prototype.init = function(){
		this.line = parseInt(Math.random() * 100) % 3;
		this.row = parseInt(Math.random() * 100) % 3;
		this.x = areaX + (2 * this.row + 1) * (areaW / 6);
		this.y = areaY + (2 * this.line + 1) * (areaH / 6);
		this.degree = 0;
	}

	goalObject.prototype.drawGoal = function(){
		this.x = areaX + (2 * this.row + 1) * (areaW / 6);
		this.y = areaY + (2 * this.line + 1) * (areaH / 6);
		this.degree = (this.degree + 5) % 360;
		ctx1.beginPath();
    	//设置顶点的坐标，根据顶点制定路径
        ctx1.lineTo(this.x - 15 * Math.cos((45+this.degree)/180*Math.PI),
                    this.y - 15 * Math.sin((45+this.degree)/180*Math.PI));
        ctx1.lineTo(this.x + 15 * Math.cos((45-this.degree)/180*Math.PI),
                    this.y + 15 * Math.sin((45-this.degree)/180*Math.PI));
		ctx1.lineTo(this.x + 15 * Math.cos((45+this.degree)/180*Math.PI),
                    this.y + 15 * Math.sin((45+this.degree)/180*Math.PI));
		ctx1.lineTo(this.x - 15 * Math.cos((45-this.degree)/180*Math.PI),
                    this.y - 15 * Math.sin((45-this.degree)/180*Math.PI));
        ctx1.closePath();
		if(scoreOb.score % 10 == 9){
			ctx1.fillStyle = "yellow";
		}
		else{
			ctx1.fillStyle = "white";
		}
		ctx1.fill();
		ctx1.fillStyle = "white";
	}

	//********************************************************************//定义数据类***************************
	var scoreObject = function(){
		this.score = 0;
		this.level = 1;
		this.alpha = 0;
		this.gameStatus = 0;
	}
	scoreObject.prototype.init = function(){
		this.score = 0;
		this.level = 1;
		this.alpha = 0;
	}
	scoreObject.prototype.drawScore = function(){
		this.level = parseInt(this.score / 10) + 1;
		ctx1.fillText("LEVEL: " + this.level, canWid * 0.5, canHei-65);

		ctx1.save();
		ctx1.font = '30px verdana';
		ctx1.fillText("SCORE: " + this.score, canWid * 0.5, 50);
		ctx1.font = '20px verdana';

		if(scoreOb.gameStatus == 2){
			this.alpha += diffframetime * 0.0005;
			if(this.alpha > 1){
				this.alpha = 1;
			}
			ctx1.fillStyle="rgba(255, 215, 0, "+ this.alpha * 0.8 +")";
			ctx1.fillRect(0,canHei * 0.5 + 90,canWid, 150);
			ctx1.font = '40px verdana';
			ctx1.shadowBlur = 10;
			ctx1.shadowColor = "white";
			ctx1.fillStyle = "rgba(255, 255, 255, "+ this.alpha +")";
			ctx1.fillText("GAME OVER", canWid * 0.5, canHei * 0.5 + 160);
			ctx1.save();
			ctx1.font = '25px verdana';
			ctx1.fillText("CLICK TO RESTART", canWid * 0.5, canHei * 0.5 + 195);
			ctx1.restore();
		}
		ctx1.restore();
	}

	//****************************************************************//吃果实效果类*************************
	var waveObject = function(){
		this.num = 5;
		this.x = [];
		this.y = [];
		this.r = [];   //半径
		this.status = [];   //当前圆圈的使用状态
	}
	waveObject.prototype.init = function(){
		for(var i = 0; i < this.num; i++){
			this.x[i] = canWid * 0.5;
			this.y[i] = canHei * 0.5;
			this.status[i] = false;    //初始化圆圈未被使用
			this.r[i] = 0;
		}
	}
	waveObject.prototype.drawWave = function(){    //绘制一个圆圈
		ctx1.save();
		ctx1.lineWidth = 3;
		for(var i = 0; i< this.num; i++){
			if(this.status[i]){     //如果圆圈是使用状态，则绘制圆圈
				this.r[i] += diffframetime * 0.04;
				if(this.r[i] > 60){
					this.status[i] = false;
					return false;
				}
				if(this.r[i] < 25){
					ctx1.fillStyle = "f5f5f5";
					ctx1.fillText("+1", playerOb.x, playerOb.y - 30);
				}
				var alpha = 1 - this.r[i] / 60;

				ctx1.strokeStyle = "rgba(255, 255, 255, "+ alpha +")";
				ctx1.beginPath();
				ctx1.arc(this.x[i], this.y[i], this.r[i], 0, 2 * Math.PI);   
				ctx1.stroke();
			}
		}
		ctx1.restore();
	}
	waveObject.prototype.born = function(){     //出生一个圆圈。
		for(var i = 0; i< this.num; i++){
			if(!this.status[i]){
				this.status[i] = true;   //把圆圈状态设为使用状态
				this.x[i] = goalOb.x;
				this.y[i] = goalOb.y;
				this.r[i] = 10;
				return false;   //找到一个未使用的圆圈，就结束。
			}
		}
	}
})();
