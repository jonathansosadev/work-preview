import { toggleBlockType } from 'tiptap-commands';
import { Node } from 'tiptap';

export default class Uppercase extends Node {
	get name() {
		return 'uppercase';
	}

	get schema() {
		return {
			attrs: {
				textTransform: {
					default: 'none'
				}
			},
			content: 'inline*',
			group: 'block',
			draggable: false,
			parseDOM: [
				{
					tag: 'u',
					getAttrs: (node) => ({
						textTransform: node.style.textTransform || 'none'
					})
				}
			],
			toDOM: (node) => [ 'u', { style: `text-transform: ${node.attrs.textTransform}` }, 0 ]
		};
	}

	commands({ type, schema }) {
		return (attrs) => toggleBlockType(type, schema.nodes.uppercase, attrs);
	}
}