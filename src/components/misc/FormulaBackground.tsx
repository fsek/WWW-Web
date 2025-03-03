import Tex from "./Tex";

// don't forget to escape the backslashes with another backslash
const texes = [
	"x^2+y^2 \\le 1",
	"n",
	"\\pi",
	"e^{\\pi i}+1=0",
	"G_{\\mu \\nu}+\\Lambda g_{\\mu \\nu}=\\kappa T_{\\mu \\nu}",
];

export default function FormulaBackground() {
	return (
		<div className="text-4xl text-neutral-400">
			{texes.map((tex) => (
				<Tex key={tex} tex={tex} displayMode />
			))}
		</div>
	);
}
