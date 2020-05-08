<script>

	//import Global CSS from the svelte boilerplate
	//contains Figma color vars, spacing vars, utility classes and more
	import { GlobalCSS } from 'figma-plugin-ds-svelte';

	//import some Svelte Figma UI components
	import { Button, Input, Label,Section, SelectMenu, Type,IconSpacing,IconHorizontalPadding } from 'figma-plugin-ds-svelte';

	//menu items, this is an array of objects to populate to our select menus
	let menuItems = [
        { 'value': 'rectangle', 'label': 'Rectangle', 'group': null, 'selected': false },
        { 'value': 'triangle', 'label': 'Triangle ', 'group': null, 'selected': false },
        { 'value': 'circle', 'label': 'Circle', 'group': null, 'selected': false }
	];
	
	const settings = {
		targetRowHeight: 10,
		layout: "JUSTIFIED",
		containerPadding: 10,
		boxSpacing: 10
	}


	var disabled = true;
	var selectedShape;
	var count = 5;

	var nodes  = [];

	window.onmessage = async (event) => {
 		nodes = []
		event.data.pluginMessage.map(node =>{	
			node.settings = {
				targetRowHeight: 200,
				layout: "JUSTIFIED",
				containerPadding: 20,
				boxSpacing: 20
			}
			nodes.push(node)
		})
	}


	//this is a reactive variable that will return false when a value is selected from
	//the select menu, its value is bound to the primary buttons disabled prop
	$: disabled = selectedShape === null;

	function updateLayout() {
		parent.postMessage({ pluginMessage: { 
			'type': 'update-layout', 
			'nodes': nodes,
		} }, '*');
	}

	function cancel() {
		parent.postMessage({ pluginMessage: { 'type': 'cancel' } }, '*')
	}

</script>


<div class="wrapper p-xxsmall">
	{#if nodes.length > 0}
	{#each nodes as node}
		<div class="frame">
			<Section>{node.id}</Section>
			<div class="frame-inputs">
			<Input iconText="H" bind:value={node.settings.targetRowHeight} class="mb-xxsmall"/>
			<Input iconName="{IconHorizontalPadding}" bind:value={node.settings.containerPadding} class="mb-xxsmall"/>
			<Input iconName="{IconSpacing}" bind:value={node.settings.boxSpacing} class="mb-xxsmall"/>
			</div>
		</div>
	{/each}
	<div class="flex p-xxsmall mb-xsmall">
	<Button on:click={cancel} variant="secondary" class="mr-xsmall">Cancel</Button>
	<Button on:click={updateLayout} bind:disabled={disabled}>Update Layout</Button>
	</div>
	{:else}
	<Type size="large" weight="bold">Please sellect at least one frame</Type>
	{/if}
</div>


<style>

.frame-inputs{
	display: grid;
	grid-template-columns: repeat(3,1fr);
	grid-gap: var(--size-xxsmall);
}

</style>