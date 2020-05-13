//import justifiedImageGrid from "./justified-image-grid";
//import * as layoutGeometry from "justified-layout";

import justifiedLayout from './lib/justified-layout';



interface JustifiedLayout {
	containerWidth:number;
	targetRowHeight: number;
	layout: string;
	containerPadding: number;
	boxSpacing: number;
  }
  

const parsePluginData = (node:  ComponentNode | FrameNode ) => {
	let conf:JustifiedLayout = {
		containerWidth:node.width,  
		targetRowHeight: 10,
		layout: "JUSTIFIED",
		containerPadding: 10,
		boxSpacing: 10
	}
	if (node.getPluginData("justifiedImageGridConf") != "") {
		let data  = JSON.parse(node.getPluginData("justifiedImageGridConf"));
		conf.targetRowHeight = parseFloat(data.targetRowHeight)
		conf.layout= "JUSTIFIED",
		conf.containerPadding= parseFloat( data.containerPadding),
		conf.boxSpacing= parseFloat( data.boxSpacing)
	  }
	  return conf
}


function justifiedImageGrid(frame: ComponentNode | FrameNode) {

	const children = frame.children.slice(0).reverse();
	const ratios = [];

	children.map((child, index) => {
	  if ("x" in child) {
		let ratio = child.width / child.height;
		if (child.getPluginData("justifiedRatio") != "") {
		  ratio = parseFloat(child.getPluginData("justifiedRatio"));
		}
		ratios.push(ratio);
	  }
	});

	let conf= parsePluginData(frame);
	const layout = justifiedLayout(ratios, conf);
  
	children.map((child, index) => {
	  if ("x" in child) {
		const { top, left, width, height } = layout.boxes[index];
		child.x = left;
		child.y = top;
		child.resize(width, height);
	  }
	});

	frame.resizeWithoutConstraints(frame.width, layout.containerHeight);
}

let updateSelection = ()=>{
	let nodes = []
	figma.currentPage.selection.map(node =>{
		if (node.type === "FRAME" || node.type === "COMPONENT"){
			nodes.push(
				{
					id: node.id,
					settings: parsePluginData(node)
				}
			)
		}
	})
	
	figma.ui.postMessage(nodes)
}

// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {width: 232, height: 208 });

updateSelection()

figma.on("selectionchange", () => {
	updateSelection()
})

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
	// One way of distinguishing between different types of messages sent from
	// your HTML page is to use an object with a "type" property like this.
	if (msg.type === 'update-layout') {
		msg.nodes.map(node =>{
			let frameNode = figma.getNodeById(node.id)
			if (frameNode.type === "FRAME" || node.type === "COMPONENT") {
				frameNode.setPluginData("justifiedImageGridConf", JSON.stringify(node.settings) )
				justifiedImageGrid(frameNode)
			}
		})
	//	const nodes: SceneNode[] = [];
	//	figma.currentPage.selection = nodes;
	//	figma.viewport.scrollAndZoomIntoView(nodes);
	}

	// Make sure to close the plugin when you're done. Otherwise the plugin will
	// keep running, which shows the cancel button at the bottom of the screen.
	//figma.closePlugin();
};
