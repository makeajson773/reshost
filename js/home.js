$(window).on('load',function() {
	$("#btnExtend").hide();
	var lastGameType = 0;
	function refreshData() {
		var app = window.app;
		if (!app)
			return;
		var ret = app.remoteCall(1006, '' + app.getParentChannelId());
		if (!ret) {
			layer.msg("获取数据失败");
			return;
		}
		var retObj = JSON.parse(ret);
		if (!(retObj.result > 0)) {
			layer.msg("获取数据失败");
			return;
		}
		$("#remainPoint").text(retObj.point);
		lastGameType = retObj.type;
		switch (retObj.type) {
		case 0:
			{
				$("#gameState").removeClass(["text-secondary", "text-success", "text-danger"]);
				$("#gameState").addClass("text-secondary");
				var keyTimes = window.app.getKeyTimes();
				if (keyTimes > 0){
					$("#gameState").html('试玩模式(剩余：<span class="text-danger">'+keyTimes+'</span>次)');
				}else{
					$("#gameState").text("试玩模式");
				}
				$("#btnActive").removeClass(["btn-danger","btn-warning"]);
				$("#btnActive").addClass("btn-warning");
				$("#btnActive").text("激活会员");
				$("#btnActive").show();
				$("#stEndTime").hide();
				$("#btnExtend").hide();
			}
			break;
		case 1:
			{
				$("#gameState").removeClass(["text-secondary", "text-success", "text-danger"]);
				$("#gameState").addClass("text-success");
				$("#gameState").text("普通会员");
				$("#btnActive").removeClass(["btn-danger","btn-warning"]);
				$("#btnActive").addClass("btn-danger");
				$("#btnActive").text("升级超级会员");
				$("#btnActive").show();
				if (retObj.expired){
					$("#stEndTime").text('(已过期)');
					$("#btnExtend").show();
				}else{
					if (typeof(retObj.endTime) === 'string')
					{
						$("#stEndTime").text('('+retObj.endTime+'到期)');
						$("#btnExtend").show();
					}
					else
					{
						$("#stEndTime").text('(永久)');
						$("#btnExtend").hide();
					}
				}
				$("#stEndTime").show();
			}
			break;
		case 2:
			{
				$("#gameState").removeClass(["text-secondary", "text-success", "text-danger"]);
				$("#gameState").addClass("text-danger");
				$("#gameState").text("超级会员");
				$("#btnActive").hide();
				if (retObj.expired){
					$("#stEndTime").text('(已过期)');
					$("#btnExtend").show();
				}else{
					if (typeof(retObj.endTime) === 'string')
					{
						$("#stEndTime").text('('+retObj.endTime+'到期)');
						$("#btnExtend").show();
					}
					else
					{
						$("#stEndTime").text('(永久)');
						$("#btnExtend").hide();
					}
				}
				$("#stEndTime").show();
			}
			break;
		}
		if (retObj.account != null && typeof (retObj.account) === 'string' && retObj.account.length > 0)
			$("#bindAccount").text(retObj.account);
	}
	refreshData();

	$('#btnPay').click(function() {
		window.location.href = "pay.html";
	});

	$('#btnChagre').click(function() {
		layer.prompt({
			title: '请输入充值码',
			offset: 't',
			btn: ['充值', '取消']
		}, function(value, index, elem) {
			//alert(value); //得到value
			var app = window.app;
			if (!app || value.length < 5)
				return;
			var ret = app.remoteCall(1007, value);
			if (!ret) {
				layer.msg("发生错误，请稍后再试");
				return;
			}
			var retObj = JSON.parse(ret);
			if (!(retObj.result > 0))
			{
				layer.msg("发生错误，请稍后再试");
				return;
			}
			switch(retObj.result){
				case 1:{
					layer.close(index);
					layer.msg('成功充入 ' + result.point + " 游戏点");
					refreshData();
				}break;
				case 2:{
					layer.msg('充值卡已使用，请更换充值卡');
				}break;
				case 3:{
					layer.msg('无效的充值卡号');
				}break;
				case 4:{
					layer.msg('充值卡已失效');
				}break;
				case 5:{
					layer.msg('充值卡已被禁用，如有疑问请联系客服');
				}break;
			}
			
		});
	});
	function tryActiveGame() {
		var app = window.app;
		if (!app) {
			layer.msg('不支持该操作');
			return;
		}
		var ret = app.remoteCall(1004, '');
		if (!ret) {
			layer.msg('开通会员失败，请尝试手动开通或联系客服咨询');
			return;
		}
		var retObj = JSON.parse(ret);
		if (!(retObj.result > 0)) {
			layer.msg('开通会员失败，请尝试手动开通或联系客服咨询');
			return;
		}
		switch (retObj.result) {
		case 1:{
				var activeRet = app.setActiveCode(retObj.code);
				if (activeRet > 0 || activeRet === -21 || activeRet === -22 || activeRet === -23){
					refreshData();
					var cf2 = layer.confirm('开通普通会员成功，是否继续升级为超级会员？', {
						title: "提示",
						btn: ['升级', '取消']//按钮
					}, function() {
						layer.close(cf2);
						window.location.href = "pay.html?buyType=3";
					}, function() {
					});
				}else{
					layer.msg("开通普通会员失败，请稍后重试或联系客服");
					break;
				}
			}break;
		case 2:
			{
				layer.msg('您已是会员，无需再次开通');
			}
			break;
		case 3:
			{
				var cf1 = layer.confirm('当前剩余点数不足，是否进行点数充值？', {
					title: "提示",
					btn: ['充值', '取消']//按钮
				}, function() {
					window.location.href = "pay.html?buyType=1";
				}, function() {
				});
			}
			break;
		case 4:
			layer.msg('开通会员失败，如有疑问，请联系客服');
			break;
		}

	}

	$('#btnActive').click(function(){
		if (lastGameType <= 0)
			tryActiveGame();
		else if (lastGameType === 1){
			window.location.href = "pay.html?buyType=3";
		}
	});
	$('#btnStartGame').click(function(){
		window.app.StartGame();
	});
	$('#btnExtend').click(function(){
		var cf = layer.confirm('<select id="extendType" class="form-select"><option value="1" selected>续费1个月(100点)</option><option value="2">续费3个月(290点)</option><option value="3">续费6个月(580点)</option><option value="4">升级永久会员(1000点)</option></select>',{
			title:'请选择会员续费类型：',
			btn:["续费"]

		},function(){
			var buyType = $('#extendType').children("option:selected").val();
			var ret = window.app.remoteCall(1010,'' + buyType);
			if (!ret){
				layer.msg("续费失败，请稍后重试或联系客服咨询。");
				return;
			}
			var retObj = JSON.parse(ret);
			if (!(retObj.result > 0)){
				layer.msg("续费失败，请稍后重试或联系客服咨询。");
				return;
			}
			switch(retObj.result){
				case 1:{
					layer.confirm('您目前还不是会员，是否立即开通会员？',{
						title:"开通会员",
						btn:["开通","取消"]
					},function(){
						tryActiveGame();
					});
				}break;
				case 2:{
					layer.msg("您已经是永久会员，无需续费");
				}break;
				case 3:{
					layer.confirm('游戏点数不足，是否立即充值？',{
						btn:["充值","取消"]
					},function(){
						window.location.href = "pay.html?buyType=1";
					});
				}break;
				case 4:{
					layer.msg("续费成功");
					refreshData();
				}break;
			}
		});
	});
});