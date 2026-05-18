const fs = require('fs');
let code = fs.readFileSync('lib/seedData.ts', 'utf8');

code = code.replace(/const rawData: any\[\] = \[\n\nimport \{ addDays, format \} from 'date-fns';\n\nconst START_DATE = new Date\(2026, 4, 18\); \/\/ May 18, 2026\n\nexport const INITIAL_TRACKER_DATA: CourseDay\[\] = rawData.map\(\(day\) => \{\n  const dateObj = addDays\(START_DATE, day.dayNumber - 1\);\n  return \{\n    \.\.\.day,\n    date: format\(dateObj, 'yyyy-MM-dd'\)\n  \};\n\}\);\n/g, 'const rawData: any[] = [\n  {\n    "dayNumber": 1,\n    "lectures": [');

code = `import { CourseDay } from '../types';
import { addDays, format } from 'date-fns';

` + code;

code = code.replace(/\];\n$/g, `];

const START_DATE = new Date(2026, 4, 18);

export const INITIAL_TRACKER_DATA: CourseDay[] = rawData.map((day) => {
  const dateObj = addDays(START_DATE, day.dayNumber - 1);
  return {
    ...day,
    date: format(dateObj, 'yyyy-MM-dd')
  };
});
`);

fs.writeFileSync('lib/seedData.ts', code);
