function idAsNumber(value: string | null): number {
	if (value === null || value.trim() === "") return -1;
	const num = Number(value);
	return Number.isNaN(num) ? -1 : num;
}

export default idAsNumber;
