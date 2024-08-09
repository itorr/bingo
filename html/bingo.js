const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const itemWidth = 200;
const labelHeight = itemWidth * 0.2;



const copyRightText = [
	'lab.magiconch.com/bingo',
	'宾果游戏生成器',
	'@卜卜口',
	'神奇海螺试验场',
].join(' · ');

const lazy = (fn, delay = 100) => {
	let timer = null;
	return (...args) => {
		if(timer) clearTimeout(timer);
		timer = setTimeout(() => {
			fn(...args);
		}, delay);
	};
};


const chooseImage = async () => {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = 'image/*';
	input.click();
	return new Promise(resolve => {
		input.addEventListener('change', e => {
			resolve(e.target.files[0]);
		});
	});
};
const readImageToURL = async (file) => {
	return URL.createObjectURL(file);
};
const getImageElFromURL = async (url) => {
	return new Promise(resolve => {
		const img = new Image();
		img.src = url;
		img.onload = () => {
			resolve(img);
		};
	});
};
const isImageEl = (el) => el instanceof HTMLImageElement;
const v = new Vue({
	el: '.app',
	data: {
		output: null,
		currentId: null,
		config: {
			margin: 40, // px
			rows: 5,
			cols: 5,
			headHeight: 100,
			fit: 'cover',
			Texts: {},
			Images: {},
			title: '',
			sub: '',
		},
	},
	methods: {
		async chooseItemImage(id){
			const file = await chooseImage();
			console.log(file,id)
			const dataURL = await readImageToURL(file);
			console.log(dataURL)
			const img = await getImageElFromURL(dataURL);
			console.log(img)
			// this.config.Texts[id] = img;
			this.$set(this.config.Images, id, img);
		},
		generator(){
			const { config } = this;
			const { rows, Texts, Images, title, sub , margin, fit, headHeight  } = config;
			const cols = rows;

			const width = cols * itemWidth + margin * 2;
			const height = rows * itemWidth + margin * 2 + headHeight;

			canvas.width = width;
			canvas.height = height;

			
			const ctx = canvas.getContext('2d');

			ctx.fillStyle = '#FFF';
			ctx.fillRect(0, 0, width, height);

			ctx.fillStyle = '#222';


			const maxWidth = cols * itemWidth / 2;

			if(cols > 3){
				ctx.font = 'bold 60px sans-serif';

				ctx.textBaseline = 'bottom';
				// 绘制标题
				ctx.fillText( title || '宾果游戏生成器', margin, headHeight + margin / 2 , maxWidth);


				// 绘制副标题
				ctx.font = '30px sans-serif';
				ctx.textAlign = 'right';
				ctx.fillText( sub || '连成线你就是赢家', width - margin, headHeight + margin / 2 , maxWidth);
			} else {
				ctx.font = 'bold 50px sans-serif';

				ctx.textAlign = 'center';
				ctx.textBaseline = 'top';
				// 绘制标题
				ctx.fillStyle = '#222';
				ctx.fillText( title || '宾果游戏生成器', width / 2, margin * 0.9 , width);

				// 绘制副标题
				ctx.font = '30px sans-serif';
				ctx.fillText( sub || '连成线你就是赢家', width / 2, margin * 2.3 , width);
			}


			// 绘制末尾
			ctx.fillStyle = '#AAA';
			ctx.font = '18px sans-serif';
			ctx.textAlign = 'left';
			ctx.textBaseline = 'bottom';
			ctx.fillText(copyRightText, margin, height - margin / 4);

			
			ctx.fillStyle = '#222';
			ctx.strokeStyle = '#222';

			// 居中
			ctx.transform(1, 0, 0, 1, margin, margin + headHeight);

			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.font = 'bold 30px sans-serif';

			for(let x = 0; x < cols; x++){
				for(let y = 0; y < rows; y++){
					const key = `${x}-${y}`;
					// if(!Texts[key]) continue;


					ctx.save();
					// 画个裁剪框
					ctx.beginPath();
					ctx.rect(x * itemWidth, y * itemWidth, itemWidth, itemWidth);
					ctx.clip();

					
					const image = Images[key];

					const text = Texts[key];

					if(image){
						// contain 保持比例填充形式裁切边缘绘制
						const { naturalWidth, naturalHeight } = image;

						if(fit === 'contain'){
							const scale = Math.max(naturalWidth, naturalHeight) / itemWidth;
							const width = naturalWidth / scale;
							const height = naturalHeight / scale;
							ctx.drawImage(
								image, 
								x * itemWidth + itemWidth / 2 - width / 2, 
								y * itemWidth + itemWidth / 2 - height / 2,
								width, height
							);
						}

						else if(fit === 'cover'){
							const scale = Math.min(naturalWidth, naturalHeight) / itemWidth;
							const width = naturalWidth / scale;
							const height = naturalHeight / scale;
							ctx.drawImage(
								image,
								x * itemWidth + itemWidth / 2 - width / 2, 
								y * itemWidth + itemWidth / 2 - height / 2, 
								width, height
							);
						}
						if(text){
							// 在图片下缘画个黑色半透明背景
							ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
							ctx.fillRect(
								x * itemWidth, y * itemWidth + itemWidth - labelHeight, 
								itemWidth, labelHeight
							);

							ctx.fillStyle = '#FFF';
							ctx.font = 'bold 20px sans-serif';
							ctx.fillText(text, x * itemWidth + itemWidth / 2, y * itemWidth + itemWidth - labelHeight / 2, itemWidth - margin / 4);
						}
					}

					// 如果是文字
					else if(text){
						ctx.fillText(text, x * itemWidth + itemWidth / 2, y * itemWidth + itemWidth / 2, itemWidth - margin / 4);
					}

					ctx.restore();

				}
			}

			// 画线

			ctx.lineWidth = 4;
			// 圆角
			ctx.lineJoin = 'round';
			ctx.lineCap = 'round';

			ctx.beginPath();
			for(let i = 0; i <= rows; i++){
				// 加上边距
				ctx.moveTo(0, i * itemWidth);
				ctx.lineTo(cols * itemWidth, i * itemWidth);
				
			}
			for(let i = 0; i <= cols; i++){
				ctx.moveTo(i * itemWidth, 0);
				ctx.lineTo(i * itemWidth, rows * itemWidth);
			}
			ctx.stroke();

			console.log('done');
		},
		_generator: lazy(function(){
			v.generator();
		}),
	},
	watch: {
		config: {
			handler(){
				this._generator();
			},
			deep: true,
		}
	},
	mounted(){
		this.$refs['output'].appendChild(canvas);
	}
});


v.generator();




// 屏蔽拖放默认事件
window.addEventListener('dragover', e => {
	e.preventDefault();
	e.stopPropagation();
});

const getXY = (e) => {
	const { clientX, clientY } = e;

	const rect = canvas.getBoundingClientRect();
	console.log(rect)
	const { left, top, width, height } = rect;

	
	const scale = canvas.width / width;

	const x = (clientX - left) * scale;
	const y = (clientY - top) * scale;

	return { x, y };
}
// 监控拖放释放事件
canvas.addEventListener('drop', e => {
	e.preventDefault();
	// 获取图片文件 或者 图片元素
	const file = e.dataTransfer.files[0];
	console.log(e)
	if(!file) return;
	
	
	const { x, y } = getXY(e);

	const itemX = Math.floor((x - margin) / itemWidth);
	const itemY = Math.floor((y - margin - headHeight) / itemWidth);

	// 在范围内
	if(itemX >= 0 && itemX < cols && itemY >= 0 && itemY < rows){
		// v.chooseItemImage(itemX, itemY);
		console.log('在范围内', itemX, itemY);
	}
	else{
		console.log('范围外', itemX, itemY);
	}
});


canvas.addEventListener('mousemove', e => {
	
	const { x, y } = getXY(e);
	const { margin, rows, cols, headHeight } = v.config;

	const itemX = Math.floor((x - margin) / itemWidth);
	const itemY = Math.floor((y - margin - headHeight) / itemWidth);

	// 在范围内
	if(itemX >= 0 && itemX < cols && itemY >= 0 && itemY < rows){
		// v.chooseItemImage(itemX, itemY);
		canvas.style.cursor = 'pointer';
	}
	else{
		canvas.style.cursor = '';
	}
});

// 点击事件
canvas.addEventListener('click', e => {
	const { x, y } = getXY(e);

	const { margin, rows, cols, headHeight } = v.config;
	
	// 点击标题
	if(y < margin + headHeight){
		console.log('title')
	}

	// 点击末尾
	else if(y > canvas.height - margin){
		console.log('footer')
	}

	// 点击方格
	else {
		const itemX = Math.floor((x - margin) / itemWidth);
		const itemY = Math.floor((y - margin - headHeight) / itemWidth);

		// 在范围内
		if(itemX >= 0 && itemX < cols && itemY >= 0 && itemY < rows){
			// v.chooseItemImage(itemX, itemY);
			console.log('在范围内', itemX, itemY);
			v.currentId = `${itemX}-${itemY}`;
		}
		else{
			console.log('范围外', itemX, itemY);
		}
	}
})