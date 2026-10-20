// ─── Template Definitions ─────────────────────────────────────────────────────
// Each template has: name, cat, icon, fields (for the option builder), and
// generate(opts) → { cause, correction }

// Removes hyphens/dashes from generated output text, since the destination
// program doesn't accept them. Em-dashes become a comma; word hyphens
// (letter-hyphen-letter, e.g. "high-pitched") become a space. Spec codes that
// mix letters and digits (0W-20, R-134a, DOT ratings) keep their character
// intact by converting their hyphen to nothing so "0W-20" reads "0W20".
function sanitizeOutput(text) {
  if (!text) return text;
  return text
    // Safety net: strip any stray {placeholder} a template may have missed.
    .replace(/\s*\{[^}]*\}/g, '')
    // em-dash / en-dash used as a separator → comma
    .replace(/\s*[—–]\s*/g, ', ')
    // hyphen between two letters (word hyphen) → space
    .replace(/([A-Za-z])-([A-Za-z])/g, '$1 $2')
    // any remaining hyphen (e.g. in spec codes like 0W-20, R-134a) → removed
    .replace(/-/g, '')
    // tidy spacing and orphaned punctuation
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,:])/g, '$1')
    .replace(/,\s*,/g, ',')
    .replace(/\(\s*\)/g, '')
    .trim();
}

// Helpers for templates to drop blank fields cleanly instead of leaving a
// placeholder. val('5','qts') → '5 qts'; val('', 'qts') → ''. join() glues the
// non-empty pieces with single spaces.
function val(v, unit) {
  const x = (v == null ? '' : String(v)).trim();
  if (!x) return '';
  return unit ? `${x} ${unit}` : x;
}
function joinBits(...bits) {
  return bits.map(b => (b == null ? '' : String(b)).trim()).filter(Boolean).join(' ');
}

// Builds a routine-maintenance cause line. If a mileage is entered, it reads
// "Routine maintenance — service due at [X] interval." Otherwise just "Routine maintenance."
function routineCause(mileage) {
  const m = (mileage || '').toString().trim();
  if (!m) return 'Routine maintenance.';
  // accept "60k", "60000", "60,000" etc — display as entered
  return `Routine maintenance — service due at ${m} interval.`;
}

const TEMPLATES = [
  {
    id: 'oil_change',
    name: 'Oil & Filter Change',
    cat: 'Maintenance',
    icon: 'ti-droplet',
    fields: [
      { id: 'mileage', label: 'Due-at interval (optional)', type: 'input', placeholder: 'e.g. 7.5k', inputType: 'text' },
      { id: 'viscosity', label: 'Oil viscosity', type: 'toggle', options: ['0W-16','0W-20','5W-20','0W-30','5W-30','5W-40','0W-40'] },
      { id: 'quarts', label: 'Quarts', type: 'input', placeholder: 'e.g. 5.7', inputType: 'text' },
      { id: 'oil_type', label: 'Oil type', type: 'toggle', options: ['Full Synthetic','Synthetic Blend','Conventional','High Mileage'] },
      { id: 'olm_reset', label: 'OLM reset', type: 'toggle', options: ['Yes','N/A'] },
    ],
    generate(o) {
      const olm = o.olm_reset === 'N/A' ? '' : ' Reset oil life monitor.';
      const oilDesc = joinBits(val(o.quarts, 'qts'), o.viscosity, o.oil_type);
      const fillSentence = oilDesc
        ? `Filled with ${oilDesc} engine oil.`
        : 'Filled engine oil to spec.';
      return {
        cause: routineCause(o.mileage),
        correction: `Drained engine oil and removed oil filter. Installed new OEM-spec oil filter. Reinstalled drain plug with new sealing washer and torqued to spec. ${fillSentence}${olm} Verified no leaks at drain plug and filter. Checked final oil level — at full mark on dipstick.`
      };
    }
  },
  {
    id: 'tire_rotation',
    name: 'Tire Rotation',
    cat: 'Tires',
    icon: 'ti-rotate-clockwise-2',
    fields: [
      { id: 'vibration', label: 'Vibration complaint?', type: 'toggle', options: ['Yes'] },
      { id: 'pattern', label: 'Rotation pattern', type: 'toggle', options: ['Front to rear','X-pattern','Left to right (staggered)','Full spare rotation'] },
      { id: 'balanced', label: 'Balanced?', type: 'toggle', options: ['Balanced'] },
      { id: 'road_force', label: 'Road force balance?', type: 'toggle', options: ['Road force'] },
      { id: 'torque', label: 'Lug nut torque (ft-lbs)', type: 'input', placeholder: 'e.g. 100', inputType: 'text' },
      { id: 'psi', label: 'Tire pressure (PSI)', type: 'input', placeholder: 'e.g. 35', inputType: 'text' },
      { id: 'mileage', label: 'Due-at interval (optional)', type: 'input', placeholder: 'e.g. 7k', inputType: 'text' },
    ],
    generate(o) {
      const pat = o.pattern ? o.pattern.toLowerCase() : '';
      const balanced = o.balanced === 'Balanced';
      const roadForce = o.road_force === 'Road force';
      const vib = o.vibration === 'Yes';

      const cause = vib
        ? 'Customer states vehicle vibrates at speed. Inspected tires and wheels — balance out of spec.'
        : routineCause(o.mileage);

      let balanceNote = '';
      if (balanced) {
        balanceNote = roadForce
          ? ' Road force balanced all four wheels.'
          : ' Balanced all four wheels.';
      }
      const testDrive = vib ? ' Test drove vehicle — vibration resolved.' : '';

      const rotateSentence = pat
        ? `Rotated tires ${pat} per vehicle rotation pattern.`
        : 'Rotated tires per vehicle rotation pattern.';
      const torqueSentence = o.torque
        ? ` Reinstalled wheels and torqued lug nuts to ${o.torque} ft-lbs.`
        : ' Reinstalled wheels and torqued lug nuts to spec.';
      const psiSentence = o.psi
        ? ` Adjusted all four tire pressures to ${o.psi} PSI per door placard specification.`
        : ' Adjusted all four tire pressures per door placard specification.';

      return {
        cause,
        correction: `${rotateSentence}${balanceNote}${torqueSentence}${psiSentence}${testDrive}`
      };
    }
  },
  {
    id: 'flat_repair',
    name: 'Flat Repair',
    cat: 'Tires',
    icon: 'ti-circle-dashed',
    fields: [
      { id: 'location', label: 'Tire location', type: 'toggle', options: ['LF','RF','LR','RR'] },
      { id: 'cause', label: 'Cause of flat', type: 'toggle', options: ['Nail / screw in tread','Road debris','Valve stem leak','Sidewall damage — unrepairable','Bead leak'] },
      { id: 'repairable', label: 'Outcome', type: 'toggle', options: ['Repaired','Not repairable — replacement needed'] },
      { id: 'road_force', label: 'Road force balance?', type: 'toggle', options: ['Road force'] },
      { id: 'torque', label: 'Lug nut torque (ft-lbs)', type: 'input', placeholder: 'e.g. 100', inputType: 'text' },
      { id: 'psi', label: 'Set pressure (PSI)', type: 'input', placeholder: 'e.g. 35', inputType: 'text' },
    ],
    generate(o) {
      const loc = o.location ? `${o.location} ` : '';
      const flatCause = o.cause ? o.cause.toLowerCase() : '';
      const repaired = o.repairable !== 'Not repairable — replacement needed';
      const balanceVerb = o.road_force === 'Road force' ? 'road force balanced' : 'balanced';
      const torqueBit = o.torque ? ` to ${o.torque} ft-lbs` : ' to spec';
      const psiBit = o.psi ? ` to ${o.psi} PSI` : '';

      const removedPhrase = flatCause ? `Removed ${flatCause} from tread area. ` : '';
      const foundPhrase = flatCause ? `Found ${flatCause} — ` : 'Found ';

      const correction = repaired
        ? `Dismounted ${loc}tire. ${removedPhrase}Verified puncture within repairable zone. Installed plug-patch per industry standard. Remounted and ${balanceVerb} tire. Reinstalled wheel, torqued lug nuts${torqueBit}. Inflated${psiBit} per door placard.`
        : `Dismounted ${loc}tire. ${foundPhrase}outside repairable zone / sidewall damage. Tire condemned as non-repairable. See separate line for replacement.`;

      const causeFound = flatCause ? ` — found ${flatCause}` : '';
      return {
        cause: `Customer states ${loc}tire flat / low. Inspected tire${causeFound}.`,
        correction
      };
    }
  },
  {
    id: 'tire_replace',
    name: 'Tire Replacement',
    cat: 'Tires',
    icon: 'ti-circle',
    fields: [
      { id: 'positions', label: 'Tires replaced', type: 'multicheck', options: ['LF','RF','LR','RR'] },
      { id: 'size', label: 'Tire size', type: 'input', placeholder: 'e.g. 235/55R18', inputType: 'text' },
      { id: 'brand', label: 'Brand / model', type: 'input', placeholder: 'e.g. Michelin CrossClimate2', inputType: 'text' },
      { id: 'install_loc', label: 'Installed on', type: 'toggle', options: ['As removed','Front','Rear','Rotated to opposite axle'] },
      { id: 'road_force', label: 'Road force balance?', type: 'toggle', options: ['Road force'] },
      { id: 'torque', label: 'Lug nut torque (ft-lbs)', type: 'input', placeholder: 'e.g. 100', inputType: 'text' },
      { id: 'psi', label: 'Set pressure (PSI)', type: 'input', placeholder: 'e.g. 35', inputType: 'text' },
      { id: 'tpms', label: 'TPMS sensors', type: 'toggle', options: ['Reused existing','Replaced sensors','Service kits only'] },
    ],
    generate(o) {
      const positions = (o.positions && o.positions.length) ? o.positions : [];
      const tpms = o.tpms || 'Reused existing';

      // Build a natural phrase for which tires
      const set = new Set(positions);
      const hasFront = set.has('LF') && set.has('RF');
      const hasRear = set.has('LR') && set.has('RR');
      let whichTires;
      if (positions.length === 4) whichTires = 'all four tires';
      else if (hasFront && !set.has('LR') && !set.has('RR')) whichTires = 'both front tires';
      else if (hasRear && !set.has('LF') && !set.has('RF')) whichTires = 'both rear tires';
      else if (positions.length === 1) whichTires = `the ${positions[0]} tire`;
      else if (positions.length) whichTires = `the ${positions.join(', ')} tires`;
      else whichTires = 'tires';

      const count = positions.length;
      const balanceVerb = o.road_force === 'Road force' ? 'Road force balanced' : 'Balanced';
      const balanceObj = count === 4 ? 'all four wheels' : (count === 1 ? 'the wheel' : 'the replaced wheels');

      // "new <size> <brand>" only if we have either
      const newTireDesc = joinBits(o.size, o.brand);
      const newTireBit = newTireDesc ? ` — new ${newTireDesc}` : '';

      let installNote = '';
      if (o.install_loc === 'Front') installNote = ' Installed new tires on front axle.';
      else if (o.install_loc === 'Rear') installNote = ' Installed new tires on rear axle.';
      else if (o.install_loc === 'Rotated to opposite axle') installNote = ' Rotated new tires to opposite axle per fitment.';

      let tpmsNote = '';
      if (tpms === 'Replaced sensors') tpmsNote = ' Replaced TPMS sensors; performed TPMS relearn per OEM procedure.';
      else if (tpms === 'Service kits only') tpmsNote = ' Installed new TPMS service kits (valve core, cap, seal, nut); performed TPMS relearn per OEM procedure.';
      else tpmsNote = ' Verified TPMS sensors functional; performed TPMS relearn per OEM procedure.';

      const torqueBit = o.torque ? ` to ${o.torque} ft-lbs` : ' to spec';
      const psiBit = o.psi ? ` to ${o.psi} PSI` : '';

      return {
        cause: `Inspected tires — tread at or below wear indicators. Replacement recommended.`,
        correction: `Mounted and ${balanceVerb.toLowerCase()} ${whichTires}${newTireBit}. ${balanceVerb} ${balanceObj}.${installNote}${tpmsNote} Reinstalled wheels, torqued lug nuts${torqueBit}. Inflated${psiBit} per door placard.`
      };
    }
  },
  {
    id: 'fuel_additive',
    name: 'Fuel Additive',
    cat: 'Maintenance',
    icon: 'ti-droplet-filled',
    fields: [
      { id: 'product', label: 'Product used', type: 'input', placeholder: 'e.g. Valvoline Fuel System Cleaner', inputType: 'text', defaultValue: 'Valvoline Fuel System Cleaner' },
      { id: 'mileage', label: 'Due-at interval (optional)', type: 'input', placeholder: 'e.g. 8k', inputType: 'text' },
    ],
    generate(o) {
      const prod = o.product || 'Valvoline Fuel System Cleaner';
      return {
        cause: routineCause(o.mileage),
        correction: `Added ${prod} to fuel tank per product dosing instructions. Service helps clean fuel injectors, intake valves, and combustion chamber deposits to maintain fuel system performance.`
      };
    }
  },
  {
    id: 'coolant_flush',
    name: 'Coolant Flush',
    cat: 'Fluids',
    icon: 'ti-temperature',
    fields: [
      { id: 'condition', label: 'Service basis', type: 'toggle', options: ['Routine maintenance','Contaminated / discolored'] },
      { id: 'mileage', label: 'Due-at interval (optional)', type: 'input', placeholder: 'e.g. 60k', inputType: 'text' },
      { id: 'coolant_spec', label: 'Coolant type', type: 'toggle', options: ['Kia Green (OEM)','Kia Pink (OEM)','Valvoline Zerex G-05','Valvoline Zerex G-48','Valvoline Zerex Asian Vehicle Red','Valvoline Zerex Asian Vehicle Blue','OAT (orange)','HOAT (yellow)'] },
      { id: 'coolant_qty', label: 'Total capacity (qts)', type: 'input', placeholder: 'e.g. 8', inputType: 'text' },
      { id: 'super_cleaner', label: 'Valvoline Radiator Super Cleaner', type: 'toggle', options: ['Used'] },
      { id: 'protector', label: 'Valvoline Water Pump Lubricant & Protector', type: 'toggle', options: ['Used'] },
    ],
    generate(o) {
      const spec = (o.coolant_spec || '').trim();
      const qty = (o.coolant_qty || '').trim();
      const cause = o.condition === 'Contaminated / discolored'
        ? 'Coolant found discolored / contaminated — flush required.'
        : routineCause(o.mileage);
      const cleanerNote = o.super_cleaner === 'Used'
        ? ' Connected flush machine in-line and circulated Valvoline Radiator Super Cleaner through cooling system, evacuating old coolant as new coolant was introduced.'
        : '';
      const protectorNote = o.protector === 'Used'
        ? ' Added Valvoline Water Pump Lubricant & Protector to coolant at refill.'
        : '';
      // Build the refill phrase from only the parts that were entered.
      const refillBits = [qty ? `${qty} qts` : '', spec].filter(Boolean).join(' ');
      const refillSentence = refillBits
        ? ` Refilled system with ${refillBits} coolant per manufacturer spec.`
        : ' Refilled system with coolant per manufacturer spec.';
      return {
        cause,
        correction: `Drained cooling system.${cleanerNote}${refillSentence}${protectorNote} Bled air from cooling system per OEM procedure. Verified coolant level at cold fill line. No leaks noted.`
      };
    }
  },
  {
    id: 'trans_flush',
    name: 'Transmission Flush',
    cat: 'Fluids',
    icon: 'ti-settings-cog',
    fields: [
      { id: 'condition', label: 'Service basis', type: 'toggle', options: ['Routine maintenance','Discolored / contaminated','Metal shavings / debris in fluid'] },
      { id: 'mileage', label: 'Due-at interval (optional)', type: 'input', placeholder: 'e.g. 58k', inputType: 'text' },
      { id: 'trans_type', label: 'Transmission type', type: 'toggle', options: ['Automatic','CVT','DCT','Manual'] },
      { id: 'fluid_spec', label: 'Fluid spec', type: 'input', placeholder: 'e.g. Valvoline ATF+4', inputType: 'text', defaultValue: 'Valvoline ATF' },
      { id: 'fluid_qty', label: 'Fluid quantity (qts)', type: 'input', placeholder: 'e.g. 7', inputType: 'text' },
      { id: 'pan', label: 'Pan drop / filter', type: 'toggle', options: ['Pan dropped & filter replaced','Drain & fill only (no filter access)'] },
    ],
    generate(o) {
      const ttype = o.trans_type || 'Automatic';
      const isManual = ttype === 'Manual';
      const spec = (o.fluid_spec || '').trim();
      const qty = (o.fluid_qty || '').trim();
      const panDrop = o.pan === 'Pan dropped & filter replaced';
      const panNote = (panDrop && !isManual) ? ' Removed and cleaned transmission pan. Installed new OEM-spec transmission filter and pan gasket. Reinstalled pan and torqued bolts to spec.' : '';
      let cause = routineCause(o.mileage);
      if (o.condition === 'Discolored / contaminated') cause = 'Transmission fluid found discolored / contaminated — service required.';
      else if (o.condition === 'Metal shavings / debris in fluid') cause = 'Metal shavings / debris found in transmission fluid on drain — possible internal wear. Service performed; advise further diagnosis if condition persists.';
      // Build the refill phrase from only the parts that were entered.
      const fluidKind = isManual ? 'manual transmission fluid' : 'transmission fluid';
      const refillBits = [qty ? `${qty} qts` : '', spec].filter(Boolean).join(' ');
      const refillPhrase = refillBits ? `${refillBits} ${fluidKind}` : fluidKind;
      const correction = isManual
        ? `Drained manual transmission fluid. Reinstalled and torqued drain/fill plugs to spec. Refilled with ${refillPhrase} per OEM spec. Verified fluid level at fill plug. No leaks noted.`
        : `Drained ${ttype.toLowerCase()} transmission fluid.${panNote} Refilled with ${refillPhrase}. Verified fluid level at operating temperature per OEM procedure. No leaks noted.`;
      return {
        cause,
        correction
      };
    }
  },
  {
    id: 'intake_clean',
    name: 'Intake Cleaning',
    cat: 'Maintenance',
    icon: 'ti-wind',
    fields: [
      { id: 'mileage', label: 'Due-at interval (optional)', type: 'input', placeholder: 'e.g. 60k', inputType: 'text' },
      { id: 'method', label: 'Method', type: 'toggle', options: ['Pressurized intake mist','Walnut blast'] },
    ],
    generate(o) {
      const method = o.method || 'Pressurized intake mist';
      let corrDetail;
      if (method === 'Walnut blast') {
        corrDetail = 'Removed intake/exhaust manifold for access. Walnut-blasted intake valves to remove carbon buildup. Cleaned media from ports and reinstalled manifold, torqued to spec.';
      } else {
        corrDetail = 'Added fuel system additive to fuel tank. Pressurized intake cleaning chemical and misted into intake through the intake tract to coat and break up carbon on the back of the intake valves. Verified normal operation after service.';
      }
      return {
        cause: routineCause(o.mileage),
        correction: corrDetail
      };
    }
  },
  {
    id: 'brake_flush',
    name: 'Brake Flush',
    cat: 'Fluids',
    icon: 'ti-droplet-off',
    fields: [
      { id: 'condition', label: 'Service basis', type: 'toggle', options: ['Routine maintenance','Discolored / contaminated'] },
      { id: 'mileage', label: 'Due-at interval (optional)', type: 'input', placeholder: 'e.g. 48k', inputType: 'text' },
      { id: 'fluid_spec', label: 'Fluid spec', type: 'toggle', options: ['DOT 3','DOT 4','DOT 5.1'] },
      { id: 'fluid_source', label: 'Fluid brand', type: 'input', placeholder: 'e.g. Valvoline DOT 4', inputType: 'text', defaultValue: 'Valvoline DOT 4' },
    ],
    generate(o) {
      const spec = (o.fluid_spec || '').trim();
      const brand = (o.fluid_source || '').trim();
      const cause = o.condition === 'Discolored / contaminated'
        ? 'Brake fluid found discolored and contaminated — flush required.'
        : routineCause(o.mileage);
      // First sentence names the spec; refill names the brand (which usually
      // already includes the spec, so don't repeat it).
      const freshFluid = spec ? `fresh ${spec} fluid` : 'fresh brake fluid';
      const refillFluid = brand || (spec ? `${spec} brake fluid` : 'brake fluid');
      return {
        cause,
        correction: `Connected pressure bleeder and pushed ${freshFluid} through the brake lines until fluid ran clear. Topped off master cylinder reservoir with ${refillFluid}. Verified firm pedal. No leaks noted.`
      };
    }
  },
  {
    id: 'engine_air',
    name: 'Engine Air Filter',
    cat: 'Maintenance',
    icon: 'ti-filter',
    fields: [
      { id: 'mileage', label: 'Due-at interval (optional)', type: 'input', placeholder: 'e.g. 30k', inputType: 'text' },
      { id: 'condition', label: 'Filter condition', type: 'toggle', options: ['Dirty / restricted','Heavily soiled','Torn / damaged'] },
    ],
    generate(o) {
      const cond = o.condition || 'Dirty / restricted';
      return {
        cause: routineCause(o.mileage),
        correction: `Removed and replaced engine air filter — found ${cond.toLowerCase()}. Installed new OEM-spec engine air filter. Reinstalled air box, secured all retaining clips and reconnected intake tube. Verified no vacuum leaks at intake connections after reassembly.`
      };
    }
  },
  {
    id: 'cabin_air',
    name: 'Cabin Air Filter',
    cat: 'Maintenance',
    icon: 'ti-air-conditioning',
    fields: [
      { id: 'mileage', label: 'Due-at interval (optional)', type: 'input', placeholder: 'e.g. 16k', inputType: 'text' },
      { id: 'condition', label: 'Filter condition', type: 'toggle', options: ['Heavily soiled','Dirty / restricted','Debris present'] },
    ],
    generate(o) {
      const cond = o.condition || 'Heavily soiled';
      return {
        cause: routineCause(o.mileage),
        correction: `Removed cabin air filter housing. Replaced cabin air filter — found ${cond.toLowerCase()}. Reinstalled housing cover and verified proper seating of all clips.`
      };
    }
  },
  {
    id: 'battery',
    name: 'Charging / Starting System',
    cat: 'Electrical',
    icon: 'ti-battery-charging-2',
    fields: [
      { id: 'concern', label: 'Customer concern', type: 'toggle', options: ['Routine / proactive replacement','Vehicle died while driving','Had to jump-start','Crank / no-start','No-crank / no-start','Slow crank','Battery / charging warning light'] },
      { id: 'battery_test', label: 'Battery test', type: 'toggle', options: ['Passed','Failed load test','Failed CCA below spec','Voltage too low — would not hold charge'] },
      { id: 'alt_test', label: 'Alternator / charging test', type: 'toggle', options: ['Output within spec','Low output — undercharging','No output — failed','Overcharging'] },
      { id: 'starter_test', label: 'Starter test', type: 'toggle', options: ['Operates normally','High current draw','Intermittent engagement','No engagement — failed'] },
      { id: 'charge_v', label: 'Charging output voltage', type: 'input', placeholder: 'e.g. 14.2', inputType: 'text' },
      { id: 'replaced', label: 'Component(s) replaced', type: 'multicheck', options: ['Battery','Alternator','Starter'] },
      { id: 'group', label: 'Battery group size (if replaced)', type: 'input', placeholder: 'e.g. 48 / H6', inputType: 'text' },
      { id: 'terminals', label: 'Cleaned terminals?', type: 'toggle', options: ['Yes'] },
      { id: 'bms', label: 'BMS registration', type: 'toggle', options: ['Completed','Not required'] },
    ],
    generate(o) {
      const concernMap = {
        'Vehicle died while driving': 'Customer states vehicle died while driving.',
        'Had to jump-start': 'Customer states vehicle required a jump-start.',
        'Crank / no-start': 'Customer states vehicle cranks but will not start.',
        'No-crank / no-start': 'Customer states vehicle will not crank or start.',
        'Slow crank': 'Customer states vehicle is slow to crank.',
        'Battery / charging warning light': 'Customer states battery / charging warning light is on.',
      };
      const concernLine = concernMap[o.concern] || '';

      // Build findings from each test
      const findings = [];
      if (o.battery_test) {
        findings.push(o.battery_test === 'Passed'
          ? 'battery tested good'
          : `battery ${o.battery_test.toLowerCase()}`);
      }
      if (o.alt_test) {
        const altMap = {
          'Output within spec': 'charging system output within spec',
          'Low output — undercharging': 'alternator output low — undercharging',
          'No output — failed': 'alternator no output — failed',
          'Overcharging': 'alternator overcharging',
        };
        findings.push(altMap[o.alt_test] || o.alt_test.toLowerCase());
      }
      if (o.starter_test) {
        const startMap = {
          'Operates normally': 'starter operates normally',
          'High current draw': 'starter drawing high current',
          'Intermittent engagement': 'starter engages intermittently',
          'No engagement — failed': 'starter no engagement — failed',
        };
        findings.push(startMap[o.starter_test] || o.starter_test.toLowerCase());
      }
      const chargeV = o.charge_v ? ` Charging output measured ${o.charge_v}V.` : '';
      const findingsLine = findings.length
        ? `Tested charging and starting system — ${findings.join(', ')}.${chargeV}`
        : `Performed charging and starting system analysis.${chargeV}`;

      const cause = (concernLine ? concernLine + ' ' : '') + findingsLine;

      // Build correction from replaced components
      const replaced = (o.replaced && o.replaced.length) ? o.replaced : [];
      const corrParts = [];
      if (replaced.includes('Battery')) {
        const grp = o.group || '{group size}';
        corrParts.push(`Removed and replaced battery with new group ${grp} battery.`);
      }
      if (replaced.includes('Alternator')) corrParts.push('Removed and replaced alternator. Verified charging output within spec after replacement.');
      if (replaced.includes('Starter')) corrParts.push('Removed and replaced starter. Verified proper cranking and engagement after replacement.');
      if (o.terminals === 'Yes') corrParts.push('Cleaned battery terminals and posts; applied anti-corrosion spray.');
      if (o.bms === 'Completed') corrParts.push('Performed BMS / battery registration via scan tool.');

      const correction = corrParts.length
        ? corrParts.join(' ')
        : 'Diagnosis only — see findings. Recommend repairs per results above.';

      return { cause, correction };
    }
  },
  {
    id: 'wipers',
    name: 'Wiper Blades',
    cat: 'Maintenance',
    icon: 'ti-windmill',
    fields: [
      { id: 'condition', label: 'Old blade condition', type: 'toggle', options: ['Streaking','Skipping / chattering','Torn rubber','Worn / aged'] },
      { id: 'driver_size', label: 'Driver size', type: 'input', placeholder: 'e.g. 26"', inputType: 'text' },
      { id: 'pass_size', label: 'Passenger size', type: 'input', placeholder: 'e.g. 18"', inputType: 'text' },
      { id: 'rear', label: 'Rear wiper', type: 'toggle', options: ['Replaced rear wiper','N/A — no rear wiper'] },
      { id: 'rear_size', label: 'Rear wiper size (if replaced)', type: 'input', placeholder: 'e.g. 14"', inputType: 'text' },
    ],
    generate(o) {
      const cond = o.condition || 'worn';
      const d = (o.driver_size || '').trim();
      const p = (o.pass_size || '').trim();
      const rearReplaced = o.rear === 'Replaced rear wiper';
      const rearSize = (o.rear_size || '').trim();
      const rearNote = rearReplaced
        ? (rearSize ? ` Replaced rear wiper blade with ${rearSize} blade.` : ' Replaced rear wiper blade.')
        : '';
      // Front blade sentence adapts to whichever sizes are present.
      let frontSentence;
      if (d && p) frontSentence = `Installed new ${d} driver and ${p} passenger wiper blades per OEM spec.`;
      else if (d) frontSentence = `Installed new ${d} driver side wiper blade per OEM spec.`;
      else if (p) frontSentence = `Installed new ${p} passenger side wiper blade per OEM spec.`;
      else frontSentence = 'Installed new front wiper blades per OEM spec.';
      return {
        cause: `Wiper blades found ${cond.toLowerCase()} — replacement recommended.`,
        correction: `Removed worn wiper blades. ${frontSentence} Tested wiper operation on all speed settings — wipers clear cleanly.${rearNote}`
      };
    }
  },
  {
    id: 'brake_inspect',
    name: 'Brake Inspection',
    cat: 'Brakes',
    icon: 'ti-circle',
    fields: [
      { id: 'concern', label: 'Customer concern', type: 'toggle', options: ['Routine inspection','High-pitched squeal','Grinding noise','Vibration during braking'] },
      { id: 'front_mm', label: 'Front pad thickness (mm)', type: 'input', placeholder: 'e.g. 6', inputType: 'text' },
      { id: 'rear_mm', label: 'Rear pad thickness (mm)', type: 'input', placeholder: 'e.g. 4', inputType: 'text' },
      { id: 'rotor_front', label: 'Front rotor condition', type: 'toggle', options: ['Within spec','At min thickness','Scoring noted','Warped — vibration','Glazed','Recommend replacement'] },
      { id: 'rotor_rear', label: 'Rear rotor condition', type: 'toggle', options: ['Within spec','At min thickness','Scoring noted','Warped — vibration','Glazed','Recommend replacement'] },
      { id: 'fluid', label: 'Brake fluid condition', type: 'toggle', options: ['Good','Discolored — recommend flush'] },
      { id: 'lines', label: 'Lines / hoses', type: 'toggle', options: ['No issues noted','Seepage noted — recommend replacement'] },
    ],
    generate(o) {
      const rotorF = o.rotor_front || 'Within spec';
      const rotorR = o.rotor_rear || 'Within spec';
      const fluid = o.fluid || 'Good';
      const lines = o.lines || 'No issues noted';

      const concernMap = {
        'High-pitched squeal': 'Customer states high-pitched squeal when braking.',
        'Grinding noise': 'Customer states grinding noise when braking.',
        'Vibration during braking': 'Customer states vibration / pulsation when braking.',
      };
      const cause = concernMap[o.concern] || 'Brake inspection performed per customer request / maintenance schedule.';

      const frontPads = o.front_mm ? ` Front brake pads: ${o.front_mm}mm remaining.` : '';
      const rearPads = o.rear_mm ? ` Rear brake pads: ${o.rear_mm}mm remaining.` : '';

      return {
        cause,
        correction: `Performed full brake system inspection.${frontPads}${rearPads} Front rotors: ${rotorF.toLowerCase()}. Rear rotors: ${rotorR.toLowerCase()}. Brake fluid condition: ${fluid.toLowerCase()}. Brake lines and flexible hoses: ${lines.toLowerCase()}. Parking brake functional and adjusted.`
      };
    }
  },
  {
    id: 'ac_diag',
    name: 'AC Diagnosis',
    cat: 'HVAC',
    icon: 'ti-snowflake',
    fields: [
      { id: 'concern', label: 'Customer concern', type: 'toggle', options: ['Not cooling','Warm air only','Intermittent cooling','Noise from AC'] },
      { id: 'refrigerant', label: 'Refrigerant type', type: 'toggle', options: ['R-134a','R-1234yf'] },
      { id: 'static_high', label: 'Static high-side (PSI)', type: 'input', placeholder: 'e.g. 85', inputType: 'text' },
      { id: 'static_low', label: 'Static low-side (PSI)', type: 'input', placeholder: 'e.g. 85', inputType: 'text' },
      { id: 'run_high', label: 'Running high-side (PSI)', type: 'input', placeholder: 'e.g. 220', inputType: 'text' },
      { id: 'run_low', label: 'Running low-side (PSI)', type: 'input', placeholder: 'e.g. 35', inputType: 'text' },
      { id: 'compressor', label: 'Compressor operation', type: 'toggle', options: ['Clutch engages normally','Clutch not engaging','Cycles rapidly — overcharge/undercharge','Compressor noise noted'] },
      { id: 'leaks', label: 'Leak check', type: 'toggle', options: ['No obvious leaks noted','Leak detected — see notes','UV dye added for trace'] },
      { id: 'leak_location', label: 'Leak location (if found)', type: 'input', placeholder: 'e.g. Condenser, front seal', inputType: 'text' },
      { id: 'recovered', label: 'Refrigerant recovered (lbs/kg)', type: 'input', placeholder: 'e.g. 1.2', inputType: 'text' },
      { id: 'filled', label: 'Refrigerant added (lbs/kg)', type: 'input', placeholder: 'e.g. 1.5', inputType: 'text' },
      { id: 'duct_temp', label: 'Duct temp after charge (°F)', type: 'input', placeholder: 'e.g. 42', inputType: 'text' },
    ],
    generate(o) {
      const ref = o.refrigerant || 'R-134a';
      const unit = ref === 'R-1234yf' ? 'kg' : 'lbs';
      const concern = o.concern || 'not cooling';

      // Pressure sentences: show only the sides that were entered.
      const staticSide = joinBits(
        o.static_high ? `high side: ${o.static_high} PSI` : '',
        o.static_low ? `low side: ${o.static_low} PSI` : ''
      ).replace(' low', ', low');
      const staticSentence = staticSide ? ` Static pressures — ${staticSide}.` : '';

      const runSide = joinBits(
        o.run_high ? `high side: ${o.run_high} PSI` : '',
        o.run_low ? `low side: ${o.run_low} PSI` : ''
      ).replace(' low', ', low');
      const runSentence = runSide
        ? ` Started vehicle and enabled AC. Running pressures — ${runSide}.`
        : ' Started vehicle and enabled AC.';

      const compSentence = o.compressor ? ` Compressor operation: ${o.compressor.toLowerCase()}.` : '';
      const leak = o.leaks || 'No obvious leaks noted';
      const leakSentence = ` Leak check: ${leak.toLowerCase()}.`;
      const leakLoc = (o.leak_location && leak !== 'No obvious leaks noted') ? ` Location: ${o.leak_location}.` : '';

      const recoveredSentence = o.recovered ? ` Recovered ${o.recovered} ${unit} of ${ref} refrigerant.` : '';
      const rechargeSentence = o.filled
        ? ` Recharged system with ${o.filled} ${unit} of ${ref}.`
        : '';
      const ductSentence = o.duct_temp ? ` Verified duct temperature at ${o.duct_temp}°F after charge.` : '';

      return {
        cause: `Customer states AC ${concern.toLowerCase()}. Performed AC system diagnosis.`,
        correction: `Connected ${ref} manifold gauge set.${staticSentence}${runSentence}${compSentence}${leakSentence}${leakLoc}${recoveredSentence}${rechargeSentence}${ductSentence}`.trim()
      };
    }
  },
  {
    id: 'alignment',
    name: 'Wheel Alignment',
    cat: 'Tires',
    icon: 'ti-arrow-autofit-width',
    fields: [
      { id: 'reason', label: 'Reason for alignment', type: 'toggle', options: ['Maintenance package','Pulling / drifting complaint','Uneven tire wear','New tires','Part replacement'] },
      { id: 'package', label: 'Package interval (if maintenance)', type: 'input', placeholder: 'e.g. 30k', inputType: 'text' },
      { id: 'part', label: 'Part replaced (if applicable)', type: 'input', placeholder: 'e.g. outer tie rod end', inputType: 'text' },
      { id: 'type', label: 'Alignment type', type: 'toggle', options: ['Four-wheel','Front (thrust angle)'] },
      { id: 'adjusted', label: 'Angles adjusted', type: 'multicheck', options: ['Toe','Camber','Caster'] },
      { id: 'result', label: 'Result', type: 'toggle', options: ['Set to spec','Some angles not adjustable — see notes'] },
    ],
    generate(o) {
      const type = o.type || 'Four-wheel';
      const adjusted = (o.adjusted && o.adjusted.length) ? o.adjusted.join(', ').toLowerCase() : 'all adjustable angles';
      const result = o.result === 'Some angles not adjustable — see notes'
        ? 'Set adjustable angles to spec; some angles out of spec and not adjustable without additional parts — see recommendations.'
        : 'Set all adjustable angles to manufacturer specification.';

      let cause;
      switch (o.reason) {
        case 'Pulling / drifting complaint':
          cause = 'Customer states vehicle pulls / drifts. Alignment checked and found out of spec.';
          break;
        case 'Uneven tire wear':
          cause = 'Uneven tire wear noted. Alignment checked and found out of spec.';
          break;
        case 'New tires':
          cause = 'Alignment performed with new tire installation to protect tire life.';
          break;
        case 'Part replacement':
          cause = o.part
            ? `Alignment required following replacement of ${o.part}.`
            : 'Alignment required following suspension / steering part replacement.';
          break;
        case 'Maintenance package':
        default:
          cause = o.package
            ? `Alignment performed as part of ${o.package} maintenance package.`
            : 'Alignment performed as part of scheduled maintenance package.';
          break;
      }

      return {
        cause,
        correction: `Performed ${type.toLowerCase()} alignment. Measured and recorded initial angles. Adjusted ${adjusted}. ${result} Verified steering wheel centered and vehicle tracks straight.`
      };
    }
  },
  {
    id: 'bulb',
    name: 'Light Bulb Replacement',
    cat: 'Electrical',
    icon: 'ti-bulb',
    fields: [
      { id: 'location', label: 'Bulb location', type: 'toggle', options: ['Headlight (low beam)','Headlight (high beam)','Turn signal','Brake light','Tail light','Reverse light','License plate','Fog light','Interior'] },
      { id: 'side', label: 'Side', type: 'toggle', options: ['LH','RH','Both'] },
      { id: 'bulb_num', label: 'Bulb size / number', type: 'input', placeholder: 'e.g. 9005 / H11', inputType: 'text' },
      { id: 'concern', label: 'How identified', type: 'toggle', options: ['Customer states bulb out','Found during inspection','Warning on dash'] },
      { id: 'diag', label: 'Recommend diagnostics?', type: 'toggle', options: ['Bulb only — resolved','Recommend circuit diagnostics if recurs'] },
    ],
    generate(o) {
      const loc = o.location ? `${o.location.toLowerCase()} ` : '';
      const side = o.side ? `${o.side} ` : '';
      const num = o.bulb_num ? ` (${o.bulb_num})` : '';

      let cause;
      if (o.concern === 'Found during inspection') cause = `Found ${side}${loc}bulb inoperative during inspection.`;
      else if (o.concern === 'Warning on dash') cause = `Dash warning for ${side}${loc}bulb out. Verified bulb inoperative.`;
      else cause = `Customer states ${side}${loc}bulb out. Verified bulb inoperative.`;

      const diagNote = o.diag === 'Recommend circuit diagnostics if recurs'
        ? ' If failure recurs, recommend circuit / electrical diagnostics to check for underlying fault.'
        : '';

      return {
        cause,
        correction: `Removed and replaced ${side}${loc}bulb${num}. Verified proper operation after replacement.${diagNote}`
      };
    }
  },
  {
    id: 'state_inspection',
    name: 'State Inspection',
    cat: 'Inspection',
    icon: 'ti-license',
    fields: [
      { id: 'reason', label: 'Reason for inspection', type: 'toggle', options: ['License plate renewal','Vehicle sale'] },
      { id: 'types', label: 'Inspection(s) performed', type: 'multicheck', options: ['Safety','Emissions','ID/OD'] },
      { id: 'safety_result', label: 'Safety result', type: 'toggle', options: ['Passed','Failed — see recommendations'] },
      { id: 'emissions_result', label: 'Emissions result', type: 'toggle', options: ['Passed','Failed'] },
      { id: 'emissions_fail_reason', label: 'Emissions fail reason', type: 'toggle', options: ['Monitors not set','Check engine light on','See recommendations'] },
    ],
    generate(o) {
      const types = (o.types && o.types.length) ? o.types : [];

      const lines = [];
      if (types.includes('Safety')) {
        const failed = o.safety_result === 'Failed — see recommendations';
        lines.push(failed
          ? 'Safety inspection — failed. See recommendations.'
          : 'Safety inspection — passed.');
      }
      if (types.includes('Emissions')) {
        const res = o.emissions_result || 'Passed';
        let line = `Emissions inspection — ${res.toLowerCase()}`;
        if (res === 'Failed' && o.emissions_fail_reason) line += ` (${o.emissions_fail_reason.toLowerCase()})`;
        lines.push(line + '.');
      }
      if (types.includes('ID/OD')) {
        lines.push('Performed ID/OD verification.');
      }
      const correction = lines.length ? lines.join(' ') : 'Performed state inspection.';

      const cause = o.reason
        ? `Inspection requested for ${o.reason.toLowerCase()}.`
        : 'State inspection requested.';
      return { cause, correction };
    }
  },
  {
    id: 'maint_package',
    name: 'Maintenance Package',
    cat: 'Maintenance',
    icon: 'ti-package',
    fields: [
      { id: 'mileage', label: 'Package mileage', type: 'input', placeholder: 'e.g. 30k', inputType: 'text' },
      { id: 'viscosity', label: 'Oil viscosity', type: 'toggle', options: ['0W-16','0W-20','5W-20','0W-30','5W-30','5W-40','0W-40'] },
      { id: 'quarts', label: 'Oil quarts', type: 'input', placeholder: 'e.g. 5.7', inputType: 'text' },
      { id: 'oil_type', label: 'Oil grade', type: 'toggle', options: ['Full Synthetic','Synthetic Blend','Conventional','High Mileage'] },
      { id: 'torque', label: 'Lug nut torque (ft-lbs)', type: 'input', placeholder: 'e.g. 100', inputType: 'text' },
      { id: 'psi', label: 'Tire pressure (PSI)', type: 'input', placeholder: 'e.g. 35', inputType: 'text' },
      { id: 'trans', label: 'Include transmission flush', type: 'toggle', options: ['Yes'] },
      { id: 'coolant', label: 'Include coolant flush', type: 'toggle', options: ['Yes'] },
      { id: 'intake', label: 'Include intake clean', type: 'toggle', options: ['Yes'] },
      { id: 'alignment', label: 'Include alignment', type: 'toggle', options: ['Yes'] },
    ],
    generate(o) {
      const mi = (o.mileage || '').trim();
      const oilDesc = joinBits(val(o.quarts, 'qts'), o.viscosity, o.oil_type);

      const parts = [];
      parts.push(oilDesc ? `Changed oil and filter — ${oilDesc}.` : 'Changed oil and filter.');
      // Rotation sentence shows torque/PSI only when entered.
      const rotBits = joinBits(
        o.torque ? `torqued lugs to ${o.torque} ft-lbs` : 'torqued lugs to spec',
        o.psi ? `set pressures to ${o.psi} PSI` : 'set pressures to placard spec'
      ).replace(' set', ', set');
      parts.push(`Rotated tires, ${rotBits}.`);
      parts.push('Added fuel system additive.');
      parts.push('Replaced engine air filter and cabin air filter.');
      if (o.trans === 'Yes') parts.push('Performed transmission fluid service.');
      if (o.coolant === 'Yes') parts.push('Performed coolant flush and refill.');
      if (o.intake === 'Yes') parts.push('Performed intake cleaning service.');
      if (o.alignment === 'Yes') parts.push('Performed four-wheel alignment, set angles to spec.');

      return {
        cause: mi ? `${mi} maintenance.` : 'Scheduled maintenance package.',
        correction: parts.join(' ')
      };
    }
  },
  {
    id: 'brake_replace',
    name: 'Brake Replacement',
    cat: 'Completed Repairs',
    icon: 'ti-disc',
    fields: [
      { id: 'concern', label: 'Reason', type: 'toggle', options: ['Worn — inspection','High-pitched squeal','Grinding noise','Vibration during braking'] },
      { id: 'axle', label: 'Axle(s)', type: 'toggle', options: ['Front','Rear','Front & rear'] },
      { id: 'scope', label: 'Scope', type: 'toggle', options: ['Pads only','Pads & rotors','Pads & resurfaced rotors'] },
      { id: 'hardware', label: 'Hardware / shims replaced', type: 'toggle', options: ['Yes'] },
      { id: 'torque', label: 'Lug nut torque (ft-lbs)', type: 'input', placeholder: 'e.g. 100', inputType: 'text' },
    ],
    generate(o) {
      const axle = (o.axle || 'Front').toLowerCase();
      const scope = o.scope || 'Pads & rotors';

      const concernMap = {
        'High-pitched squeal': 'Customer states high-pitched squeal when braking. Inspected and found brakes worn.',
        'Grinding noise': 'Customer states grinding noise when braking. Inspected and found brakes worn beyond spec.',
        'Vibration during braking': 'Customer states vibration when braking. Inspected and found rotors warped / out of spec.',
        'Worn — inspection': 'Brakes found worn beyond spec on inspection. Replacement recommended.',
      };
      const cause = concernMap[o.concern] || concernMap['Worn — inspection'];

      let scopeText;
      if (scope === 'Pads only') scopeText = `Replaced ${axle} brake pads`;
      else if (scope === 'Pads & resurfaced rotors') scopeText = `Replaced ${axle} brake pads and resurfaced rotors`;
      else scopeText = `Replaced ${axle} brake pads and rotors`;

      const hw = o.hardware === 'Yes' ? ' Installed new hardware / shims.' : '';
      const torqueBit = o.torque ? ` to ${o.torque} ft-lbs` : ' to spec';

      return {
        cause,
        correction: `${scopeText}.${hw} Lubricated caliper slides and contact points. Reinstalled wheels and torqued lug nuts${torqueBit}. Verified firm pedal and proper brake operation on test.`
      };
    }
  },
  {
    id: 'ac_replace',
    name: 'AC Component Replacement',
    cat: 'Completed Repairs',
    icon: 'ti-snowflake',
    fields: [
      { id: 'concern', label: 'Customer concern', type: 'toggle', options: ['Not cooling','Warm air only','Intermittent cooling','Noise from AC'] },
      { id: 'refrigerant', label: 'Refrigerant type', type: 'toggle', options: ['R-134a','R-1234yf'] },
      { id: 'parts', label: 'Part(s) replaced', type: 'multicheck', options: ['Schrader valves','Condenser','Compressor','Expansion valve','Lines','Evaporator core'] },
      { id: 'oil', label: 'Added system oil', type: 'toggle', options: ['Yes'] },
      { id: 'recharge', label: 'Recharge amount (lbs/kg)', type: 'input', placeholder: 'e.g. 1.5', inputType: 'text' },
    ],
    generate(o) {
      const ref = o.refrigerant || 'R-134a';
      const unit = ref === 'R-1234yf' ? 'kg' : 'lbs';
      const concern = (o.concern || 'not cooling').toLowerCase();
      const parts = (o.parts && o.parts.length) ? o.parts : [];
      const partsText = parts.length ? parts.join(', ').toLowerCase() : '';
      const oilNote = o.oil === 'Yes' ? ' Added system oil per spec.' : '';

      const foundBit = partsText ? `: ${partsText}` : '';
      const replacedSentence = partsText ? ` Replaced ${partsText}.` : '';
      const rechargeSentence = o.recharge
        ? ` Evacuated system and recharged with ${o.recharge} ${unit} of ${ref}.`
        : ` Evacuated system and recharged ${ref} to spec.`;

      return {
        cause: `Customer states AC ${concern}. Diagnosed system and found failed component(s)${foundBit}.`,
        correction: `Recovered ${ref} refrigerant.${replacedSentence}${oilNote}${rechargeSentence} Verified proper cooling and pressures after repair.`
      };
    }
  },
];

// ─── State ────────────────────────────────────────────────────────────────────
let jobs = JSON.parse(localStorage.getItem('techJobs') || '[]');
let editIndex = -1;
let currentWeekOffset = 0;
let activeTemplateId = null;
let optionValues = {}; // { fieldId: value }
let queue = []; // [{ name, cause, correction }]
let activeOutputTab = 'cause';
let selectedJobs = new Set(); // job ids checked in the Work Log

// ─── Tabs ─────────────────────────────────────────────────────────────────────
function showTab(name, btn) {
  document.querySelectorAll('.tab-page').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
  if (name === 'log') renderLog();
  if (name === 'summary') renderSummary();
  if (name === 'ai') { generatePromptText(); renderQueue(); }
  if (name === 'trip') renderTrip();
}

// ─── Template List ────────────────────────────────────────────────────────────
// Display order for the template list: common at top, flushes/simple in middle,
// diagnostics near the bottom, completed repairs at the very end.
const TEMPLATE_ORDER = [
  // Common
  'oil_change','tire_rotation','maint_package','tire_replace','flat_repair','wipers','bulb','state_inspection','battery',
  // Flushes & fluids / simple services
  'coolant_flush','trans_flush','brake_flush','intake_clean','fuel_additive','engine_air','cabin_air','alignment',
  // Diagnostic
  'brake_inspect','ac_diag',
  // Completed repairs (at the very end)
  'brake_replace','ac_replace',
];

function orderedTemplates() {
  const rank = id => {
    const i = TEMPLATE_ORDER.indexOf(id);
    return i === -1 ? 999 : i;
  };
  return TEMPLATES.slice().sort((a, b) => rank(a.id) - rank(b.id));
}

function renderTemplateList(filter) {
  const list = document.getElementById('tmpl-list');
  const ordered = orderedTemplates();
  const filtered = filter
    ? ordered.filter(t => t.name.toLowerCase().includes(filter) || t.cat.toLowerCase().includes(filter))
    : ordered;
  list.innerHTML = filtered.map(t =>
    `<button class="tmpl-item ${activeTemplateId === t.id ? 'active' : ''}" onclick="selectTemplate('${t.id}')">
      <i class="ti ${t.icon}"></i>
      <span>${t.name}</span>
      <span class="tmpl-cat">${t.cat}</span>
    </button>`
  ).join('');
}

function filterTemplates() {
  const q = document.getElementById('tmpl-search').value.toLowerCase().trim();
  renderTemplateList(q || null);
}

function selectTemplate(id) {
  activeTemplateId = id;
  optionValues = {};
  renderTemplateList(document.getElementById('tmpl-search').value.toLowerCase().trim() || null);
  buildOptionsPanel();
  generateOutput();
  document.getElementById('builder-empty').style.display = 'none';
  document.getElementById('options-card').style.display = '';
  document.getElementById('output-section').style.display = '';
}

// ─── Options Panel ────────────────────────────────────────────────────────────
function buildOptionsPanel() {
  const tmpl = TEMPLATES.find(t => t.id === activeTemplateId);
  if (!tmpl) return;
  document.getElementById('opt-icon').className = `ti ${tmpl.icon}`;
  document.getElementById('opt-title').textContent = tmpl.name;
  document.getElementById('opt-cat').textContent = tmpl.cat;

  // Pre-fill defaults
  tmpl.fields.forEach(f => {
    if (f.defaultValue && !optionValues[f.id]) optionValues[f.id] = f.defaultValue;
  });

  const body = document.getElementById('opt-body');
  body.innerHTML = `<div class="options-grid" id="opts-inner"></div>`;
  const inner = document.getElementById('opts-inner');

  tmpl.fields.forEach(f => {
    const wrap = document.createElement('div');
    wrap.className = `opt-group${(f.type === 'multicheck' || f.type === 'toggle') ? ' full' : ''}`;
    const label = document.createElement('label');
    label.textContent = f.label;
    wrap.appendChild(label);

    if (f.type === 'toggle') {
      const tg = document.createElement('div');
      tg.className = 'toggle-group';
      f.options.forEach(opt => {
        const pill = document.createElement('span');
        pill.className = `toggle-pill ${optionValues[f.id] === opt ? 'selected' : ''}`;
        pill.textContent = opt;
        pill.onclick = () => {
          // Clicking the already-selected pill deselects it (clears the value)
          optionValues[f.id] = optionValues[f.id] === opt ? undefined : opt;
          buildOptionsPanel();
          generateOutput();
        };
        tg.appendChild(pill);
      });
      wrap.appendChild(tg);
    } else if (f.type === 'multicheck') {
      const ct = document.createElement('div');
      ct.className = 'check-tiles';
      f.options.forEach(opt => {
        const tile = document.createElement('span');
        const selected = Array.isArray(optionValues[f.id]) && optionValues[f.id].includes(opt);
        tile.className = `check-tile ${selected ? 'selected' : ''}`;
        tile.innerHTML = `<i class="ti ${selected ? 'ti-check' : 'ti-circle'}" style="font-size:12px;"></i>${opt}`;
        tile.onclick = () => {
          if (!Array.isArray(optionValues[f.id])) optionValues[f.id] = [];
          const idx = optionValues[f.id].indexOf(opt);
          if (idx >= 0) optionValues[f.id].splice(idx, 1);
          else optionValues[f.id].push(opt);
          buildOptionsPanel();
          generateOutput();
        };
        ct.appendChild(tile);
      });
      wrap.appendChild(ct);
    } else if (f.type === 'input') {
      const inp = document.createElement('input');
      inp.type = f.inputType || 'text';
      inp.placeholder = f.placeholder || '';
      inp.value = optionValues[f.id] || '';
      inp.oninput = () => {
        optionValues[f.id] = inp.value;
        generateOutput();
      };
      wrap.appendChild(inp);
    }

    inner.appendChild(wrap);
  });
}

// ─── Output ───────────────────────────────────────────────────────────────────
function generateOutput() {
  const tmpl = TEMPLATES.find(t => t.id === activeTemplateId);
  if (!tmpl) return;
  const result = tmpl.generate(optionValues);
  document.getElementById('out-cause').value = sanitizeOutput(result.cause);
  document.getElementById('out-correction').value = sanitizeOutput(result.correction);
}

function switchOutputTab(tab, el) {
  activeOutputTab = tab;
  document.querySelectorAll('.output-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('out-cause-wrap').style.display = tab === 'cause' ? '' : 'none';
  document.getElementById('out-corr-wrap').style.display = tab === 'correction' ? '' : 'none';
}

function copyActive() {
  const val = activeOutputTab === 'cause'
    ? document.getElementById('out-cause').value
    : document.getElementById('out-correction').value;
  navigator.clipboard.writeText(val).then(() => {
    const el = document.getElementById('copy-success');
    el.style.display = 'flex';
    setTimeout(() => el.style.display = 'none', 2000);
  });
}

// ─── Queue ────────────────────────────────────────────────────────────────────
function addToQueue() {
  const tmpl = TEMPLATES.find(t => t.id === activeTemplateId);
  if (!tmpl) return;
  const cause = document.getElementById('out-cause').value.trim();
  const correction = document.getElementById('out-correction').value.trim();
  if (!cause && !correction) { showToast('Generate output first', 'info'); return; }
  queue.push({ name: tmpl.name, cause, correction });
  renderQueue();
  showToast(`${tmpl.name} added to queue`, 'success');
}

function renderQueue() {
  const html = !queue.length
    ? '<div class="queue-empty">No services queued — build a template and add it above.</div>'
    : queue.map((item, i) => `
      <div class="queue-item">
        <div style="flex:1; min-width:0;">
          <div class="queue-item-name">${item.name}</div>
          <div class="queue-item-cause"><span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text3);">Cause: </span>${item.cause}</div>
          <div class="queue-item-corr"><span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text3);">Correction: </span>${item.correction}</div>
        </div>
        <button class="queue-remove" onclick="removeFromQueue(${i})"><i class="ti ti-x"></i></button>
      </div>
    `).join('');

  const list = document.getElementById('queue-list');
  if (list) list.innerHTML = html;
  const listAI = document.getElementById('queue-list-ai');
  if (listAI) listAI.innerHTML = html;

  const count = document.getElementById('queue-count');
  if (count) count.textContent = queue.length;
  const countAI = document.getElementById('queue-count-ai');
  if (countAI) countAI.textContent = queue.length;
}

function removeFromQueue(i) {
  queue.splice(i, 1);
  renderQueue();
}

function clearQueue() {
  if (queue.length && !confirm('Clear all queued services?')) return;
  queue = [];
  renderQueue();
}

function sendQueueToRO() {
  if (!queue.length) { showToast('Queue is empty', 'info'); return; }
  const causes = queue.map(item => item.cause).filter(Boolean).join('\n');
  const corrections = queue.map(item => `${item.name}: ${item.correction}`).filter(Boolean).join('\n\n');
  const existing_findings = document.getElementById('ro-findings').value.trim();
  const existing_work = document.getElementById('ro-work').value.trim();
  document.getElementById('ro-findings').value = existing_findings ? existing_findings + '\n' + causes : causes;
  document.getElementById('ro-work').value = existing_work ? existing_work + '\n\n' + corrections : corrections;
  autosaveRO();
  showToast(`${queue.length} service(s) sent to RO notepad`, 'success');
  queue = [];
  renderQueue();
  showTab('ro', document.querySelectorAll('.nav-btn')[1]);
}

// ─── AI Prompt Builder ──────────────────────────────────────────────────────────
const AI_CAUSE_LIMIT = 450;
const AI_CORRECTION_LIMIT = 950;

function generatePromptText() {
  const customerStates = document.getElementById('ai-input-customer').value.trim();
  const diagnosis = document.getElementById('ai-input-diagnosis').value.trim();
  const recommendation = document.getElementById('ai-input-recommendation').value.trim();
  const context = document.getElementById('ai-context').value; // recommendation | completed

  const statusLine = context === 'completed'
    ? "This is completed work — it has already been performed. Write the correction in past tense as a finished repair."
    : "This is recommended work — it hasn't been completed yet. Write the correction as a recommendation for the customer, not as completed work.";

  const notesLines = [
    customerStates ? `Customer states: ${customerStates}` : '',
    diagnosis ? `Diagnosis / what I found: ${diagnosis}` : '',
    recommendation ? `Recommendation / work performed: ${recommendation}` : '',
  ].filter(Boolean).join('\n');

  const prompt = `I need cause and correction stories for a repair order. The cause has a max of 450 characters, and the correction has a max of 950 characters. ${statusLine}

Write in a technician's voice (e.g. "Customer states...", "Inspected and found...", "Tested..."). Be specific and factual, no fluff. Do not exceed the character limits — tighten the wording rather than cutting off mid-sentence.

Here is the info:
${notesLines || '[fill in the boxes above]'}`;

  document.getElementById('ai-prompt-output').value = prompt;
}

function copyPromptText() {
  const val = document.getElementById('ai-prompt-output').value;
  navigator.clipboard.writeText(val).then(() => {
    const el = document.getElementById('ai-copy-success');
    el.style.display = 'flex';
    setTimeout(() => el.style.display = 'none', 2000);
  });
}

function clearAIBuilder() {
  ['ai-input-customer','ai-input-diagnosis','ai-input-recommendation','ai-out-cause','ai-out-correction'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const ctx = document.getElementById('ai-context');
  if (ctx) ctx.value = 'recommendation';
  generatePromptText();
  updateAICharCounts();
  showToast('AI builder cleared', 'info');
}

function updateAICharCounts() {
  const cause = document.getElementById('ai-out-cause').value;
  const corr = document.getElementById('ai-out-correction').value;
  const causeEl = document.getElementById('ai-cause-count');
  const corrEl = document.getElementById('ai-corr-count');
  causeEl.textContent = `${cause.length} / ${AI_CAUSE_LIMIT}`;
  corrEl.textContent = `${corr.length} / ${AI_CORRECTION_LIMIT}`;
  causeEl.style.color = cause.length > AI_CAUSE_LIMIT ? 'var(--accent)' : 'var(--text3)';
  corrEl.style.color = corr.length > AI_CORRECTION_LIMIT ? 'var(--accent)' : 'var(--text3)';
}

let aiActiveOutputTab = 'cause';
function switchAIOutputTab(tab, el) {
  aiActiveOutputTab = tab;
  el.parentElement.querySelectorAll('.output-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('ai-out-cause-wrap').style.display = tab === 'cause' ? '' : 'none';
  document.getElementById('ai-out-corr-wrap').style.display = tab === 'correction' ? '' : 'none';
}

function copyAIActive() {
  const val = aiActiveOutputTab === 'cause'
    ? document.getElementById('ai-out-cause').value
    : document.getElementById('ai-out-correction').value;
  navigator.clipboard.writeText(val).then(() => {
    const el = document.getElementById('ai-copy-success');
    el.style.display = 'flex';
    setTimeout(() => el.style.display = 'none', 2000);
  });
}

function addAIToQueue() {
  const cause = document.getElementById('ai-out-cause').value.trim();
  const correction = document.getElementById('ai-out-correction').value.trim();
  if (!cause && !correction) { showToast('Nothing to add yet', 'info'); return; }
  queue.push({ name: 'Custom — AI written', cause, correction });
  renderQueue();
  showToast('Added to queue', 'success');
}

// ─── Request Templates Modal ──────────────────────────────────────────────────
function openRequestModal() { document.getElementById('request-modal').classList.add('open'); }
function closeRequestModal() { document.getElementById('request-modal').classList.remove('open'); }
function submitTemplateRequest() {
  const txt = document.getElementById('request-text').value.trim();
  if (!txt) return;
  closeRequestModal();
  const prompt = `I'm an automotive technician. Please write detailed service sign-out templates with both a CAUSE and CORRECTION section for each of the following procedures. Use Valvoline products where applicable (no BG products). Include relevant placeholders in {curly_braces} for specs that vary. Procedures:\n\n${txt}`;
  window.open(`https://claude.ai/new?q=${encodeURIComponent(prompt)}`, '_blank');
}

// ─── RO Notepad ──────────────────────────────────────────────────────────────
function autosaveRO() {
  const data = {
    num: document.getElementById('ro-num').value,
    date: document.getElementById('ro-date').value,
    vehicle: document.getElementById('ro-vehicle').value,
    vin: document.getElementById('ro-vin').value,
    sw: document.getElementById('ro-sw').value,
    miles: document.getElementById('ro-miles').value,
    concern: document.getElementById('ro-concern').value,
    codes: document.getElementById('ro-codes').value,
    findings: document.getElementById('ro-findings').value,
    work: document.getElementById('ro-work').value,
    hours: document.getElementById('ro-hours').value,
    status: document.getElementById('ro-status').value,
  };
  localStorage.setItem('techRO_draft', JSON.stringify(data));
  const label = document.getElementById('autosave-label');
  const now = new Date();
  label.textContent = `Saved ${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
}

function loadRODraft() {
  const raw = localStorage.getItem('techRO_draft');
  if (!raw) { document.getElementById('ro-date').value = new Date().toISOString().split('T')[0]; return; }
  const d = JSON.parse(raw);
  document.getElementById('ro-num').value = d.num || '';
  document.getElementById('ro-date').value = d.date || new Date().toISOString().split('T')[0];
  document.getElementById('ro-vehicle').value = d.vehicle || '';
  document.getElementById('ro-vin').value = d.vin || '';
  document.getElementById('ro-sw').value = d.sw || '';
  document.getElementById('ro-miles').value = d.miles || '';
  document.getElementById('ro-concern').value = d.concern || '';
  document.getElementById('ro-codes').value = d.codes || '';
  document.getElementById('ro-findings').value = d.findings || '';
  document.getElementById('ro-work').value = d.work || '';
  document.getElementById('ro-hours').value = d.hours || '';
  document.getElementById('ro-status').value = d.status || 'done';
}

function clearRO() {
  if (!confirm('Clear the current RO notepad? Saved log entries are not affected.')) return;
  localStorage.removeItem('techRO_draft');
  ['ro-num','ro-vehicle','ro-vin','ro-sw','ro-miles','ro-concern','ro-codes','ro-findings','ro-work','ro-hours'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('ro-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('ro-status').value = 'done';
  document.getElementById('autosave-label').textContent = 'Auto-saved';
  showToast('RO cleared — ready for new job', 'info');
}

function saveROToLog() {
  const get = id => document.getElementById(id).value.trim();
  const ro = get('ro-num'), vehicle = get('ro-vehicle');
  if (!ro && !vehicle) { showToast('Add RO # or vehicle name first', 'info'); return; }
  const job = {
    id: Date.now(),
    date: get('ro-date') || new Date().toISOString().split('T')[0],
    ro: ro || '—',
    vehicle: vehicle || '—',
    vin: get('ro-vin'),
    sw: get('ro-sw'),
    miles: get('ro-miles'),
    concern: get('ro-concern') || '—',
    codes: get('ro-codes') || '',
    findings: get('ro-findings'),
    work: get('ro-work'),
    hours: parseFloat(get('ro-hours')) || 0,
    status: document.getElementById('ro-status').value,
  };
  jobs.push(job);
  saveJobs();
  showToast('Job added to work log', 'success');
  updateLogBadge();
}

// ─── Work Log ─────────────────────────────────────────────────────────────────
function saveJobs() { localStorage.setItem('techJobs', JSON.stringify(jobs)); }

const STATUS_LABEL = { done: 'Completed', wip: 'Waiting on Parts', customer: 'Waiting on Customer', review: 'Needs Review' };
const STATUS_CLASS = { done: 'pill-done', wip: 'pill-parts', customer: 'pill-customer', review: 'pill-review' };

function renderLog() {
  const search = (document.getElementById('log-search').value || '').toLowerCase();
  const filter = document.getElementById('log-filter').value;
  let list = jobs.filter(j => {
    const match = !search || [j.ro, j.vehicle, j.concern, j.codes, j.findings].join(' ').toLowerCase().includes(search);
    const statusMatch = !filter || j.status === filter;
    return match && statusMatch;
  }).slice().reverse();

  const empty = document.getElementById('log-empty');
  const wrap = document.getElementById('log-table-wrap');
  document.getElementById('log-count-label').textContent = `${list.length} job${list.length !== 1 ? 's' : ''}`;

  if (!list.length) { empty.style.display = 'block'; wrap.style.display = 'none'; updateSelectionUI(); return; }
  empty.style.display = 'none'; wrap.style.display = 'block';

  // Drop any selected ids that are no longer visible (filtered out / deleted)
  const visibleIds = new Set(list.map(j => j.id));
  selectedJobs.forEach(id => { if (!visibleIds.has(id)) selectedJobs.delete(id); });

  document.getElementById('log-tbody').innerHTML = list.map(j => {
    const realIndex = jobs.indexOf(j);
    const checked = selectedJobs.has(j.id) ? 'checked' : '';
    return `<tr>
      <td style="padding-right:0;"><input type="checkbox" ${checked} onchange="toggleJobSelection(${j.id}, this)" style="cursor:pointer; width:15px; height:15px; accent-color:var(--accent);"></td>
      <td style="white-space:nowrap;font-size:12px;color:var(--text2);">${j.date}</td>
      <td class="td-ro">${j.ro}</td>
      <td class="td-vehicle">${j.vehicle}</td>
      <td class="td-notes">${j.concern}</td>
      <td style="font-size:12px;color:var(--text2);font-family:'DM Mono',monospace;">${j.codes || '—'}</td>
      <td>${j.hours ? `<span class="hours-badge"><i class="ti ti-clock" style="font-size:11px;"></i>${j.hours.toFixed(1)}</span>` : '<span style="color:var(--text3);">—</span>'}</td>
      <td><span class="pill ${STATUS_CLASS[j.status] || 'pill-done'}">${STATUS_LABEL[j.status] || j.status}</span></td>
      <td class="td-actions">
        <button class="btn btn-ghost btn-sm" onclick="openEditModal(${realIndex})"><i class="ti ti-pencil"></i></button>
        <button class="btn btn-ghost btn-sm btn-danger" onclick="deleteJob(${realIndex})"><i class="ti ti-trash"></i></button>
      </td>
    </tr>`;
  }).join('');

  updateSelectionUI();
}

function toggleJobSelection(id, el) {
  if (el.checked) selectedJobs.add(id);
  else selectedJobs.delete(id);
  updateSelectionUI();
}

function toggleSelectAll(el) {
  // Operate only on currently visible (filtered) rows
  const search = (document.getElementById('log-search').value || '').toLowerCase();
  const filter = document.getElementById('log-filter').value;
  const visible = jobs.filter(j => {
    const match = !search || [j.ro, j.vehicle, j.concern, j.codes, j.findings].join(' ').toLowerCase().includes(search);
    const statusMatch = !filter || j.status === filter;
    return match && statusMatch;
  });
  if (el.checked) visible.forEach(j => selectedJobs.add(j.id));
  else visible.forEach(j => selectedJobs.delete(j.id));
  renderLog();
}

function updateSelectionUI() {
  const btn = document.getElementById('delete-selected-btn');
  const count = selectedJobs.size;
  document.getElementById('selected-count').textContent = count;
  btn.style.display = count ? 'inline-flex' : 'none';

  // Sync the select-all checkbox state against visible rows
  const selectAll = document.getElementById('select-all-jobs');
  if (selectAll) {
    const search = (document.getElementById('log-search').value || '').toLowerCase();
    const filter = document.getElementById('log-filter').value;
    const visible = jobs.filter(j => {
      const match = !search || [j.ro, j.vehicle, j.concern, j.codes, j.findings].join(' ').toLowerCase().includes(search);
      const statusMatch = !filter || j.status === filter;
      return match && statusMatch;
    });
    const allSelected = visible.length > 0 && visible.every(j => selectedJobs.has(j.id));
    const someSelected = visible.some(j => selectedJobs.has(j.id));
    selectAll.checked = allSelected;
    selectAll.indeterminate = someSelected && !allSelected;
  }
}

function deleteSelected() {
  const count = selectedJobs.size;
  if (!count) return;
  if (!confirm(`Delete ${count} selected job${count !== 1 ? 's' : ''}? This cannot be undone.`)) return;
  jobs = jobs.filter(j => !selectedJobs.has(j.id));
  selectedJobs.clear();
  saveJobs();
  renderLog();
  updateLogBadge();
  showToast(`${count} job${count !== 1 ? 's' : ''} deleted`, 'info');
}

function deleteJob(index) {
  if (!confirm(`Delete RO ${jobs[index].ro} — ${jobs[index].vehicle}?`)) return;
  selectedJobs.delete(jobs[index].id);
  jobs.splice(index, 1);
  saveJobs();
  renderLog();
  updateLogBadge();
  showToast('Job deleted', 'info');
}

function updateLogBadge() { document.getElementById('log-nav-count').textContent = jobs.length; }

function exportCSV() {
  if (!jobs.length) { showToast('No jobs to export yet', 'info'); return; }
  const headers = ['Date','RO #','Vehicle','VIN','Service Writer','Mileage In','Concern','Codes','Findings/Cause','Work Performed/Correction','Hours Flagged','Status'];
  const rows = jobs.map(j => [j.date,j.ro,j.vehicle,j.vin,j.sw,j.miles,j.concern,j.codes,j.findings,j.work,j.hours,STATUS_LABEL[j.status]||j.status].map(v => `"${(v||'').toString().replace(/"/g,'""')}"`).join(','));
  downloadFile('work_log.csv', [headers.join(','), ...rows].join('\n'), 'text/csv');
  showToast('CSV exported', 'success');
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function openEditModal(index) {
  editIndex = index;
  const j = jobs[index];
  document.getElementById('edit-ro-num').value = j.ro === '—' ? '' : j.ro;
  document.getElementById('edit-ro-date').value = j.date;
  document.getElementById('edit-ro-vehicle').value = j.vehicle === '—' ? '' : j.vehicle;
  document.getElementById('edit-ro-vin').value = j.vin || '';
  document.getElementById('edit-ro-sw').value = j.sw || '';
  document.getElementById('edit-ro-miles').value = j.miles || '';
  document.getElementById('edit-ro-concern').value = j.concern === '—' ? '' : j.concern;
  document.getElementById('edit-ro-codes').value = j.codes || '';
  document.getElementById('edit-ro-findings').value = j.findings || '';
  document.getElementById('edit-ro-work').value = j.work || '';
  document.getElementById('edit-ro-hours').value = j.hours || '';
  document.getElementById('edit-ro-status').value = j.status || 'done';
  document.getElementById('edit-modal').classList.add('open');
}

function closeEditModal() { document.getElementById('edit-modal').classList.remove('open'); editIndex = -1; }

function saveEdit() {
  if (editIndex < 0) return;
  const get = id => document.getElementById(id).value.trim();
  jobs[editIndex] = {
    ...jobs[editIndex],
    ro: get('edit-ro-num') || '—',
    date: get('edit-ro-date'),
    vehicle: get('edit-ro-vehicle') || '—',
    vin: get('edit-ro-vin'),
    sw: get('edit-ro-sw'),
    miles: get('edit-ro-miles'),
    concern: get('edit-ro-concern') || '—',
    codes: get('edit-ro-codes'),
    findings: get('edit-ro-findings'),
    work: get('edit-ro-work'),
    hours: parseFloat(get('edit-ro-hours')) || 0,
    status: document.getElementById('edit-ro-status').value,
  };
  saveJobs();
  closeEditModal();
  renderLog();
  renderSummary();
  showToast('Job updated', 'success');
}

// ─── Weekly Summary ───────────────────────────────────────────────────────────
function getWeekBounds(offset) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day === 0 ? 7 : day) - 1) + offset * 7);
  monday.setHours(0,0,0,0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23,59,59,999);
  return { monday, sunday };
}

function renderSummary() {
  const { monday, sunday } = getWeekBounds(currentWeekOffset);
  const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  document.getElementById('week-label').textContent = `${fmt(monday)} – ${fmt(sunday)}`;
  const weekJobs = jobs.filter(j => { const d = new Date(j.date + 'T12:00:00'); return d >= monday && d <= sunday; });
  const totalHours = weekJobs.reduce((s, j) => s + (j.hours || 0), 0);
  const completed = weekJobs.filter(j => j.status === 'done').length;
  const review = weekJobs.filter(j => j.status === 'review').length;
  document.getElementById('summary-stats').innerHTML = `
    <div class="stat-card"><div class="stat-label">Total jobs</div><div class="stat-value">${weekJobs.length}</div><div class="stat-sub">this week</div></div>
    <div class="stat-card"><div class="stat-label">Hours flagged</div><div class="stat-value">${totalHours.toFixed(1)}</div><div class="stat-sub">total</div></div>
    <div class="stat-card"><div class="stat-label">Completed</div><div class="stat-value">${completed}</div><div class="stat-sub">jobs</div></div>
    <div class="stat-card"><div class="stat-label">Needs review</div><div class="stat-value">${review}</div><div class="stat-sub">jobs</div></div>
  `;
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const rows = days.map((name, i) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);
    const iso = dayDate.toISOString().split('T')[0];
    const dayJobs = weekJobs.filter(j => j.date === iso);
    const hrs = dayJobs.reduce((s,j) => s + (j.hours||0), 0);
    const vehicles = [...new Set(dayJobs.map(j => j.vehicle))].filter(v => v !== '—').join(', ');
    const isToday = iso === new Date().toISOString().split('T')[0];
    return `<tr ${isToday ? 'style="background:var(--accent-light);"' : ''}>
      <td style="font-weight:${isToday?'600':'400'};font-size:13px;">${name}${isToday ? ' <span style="font-size:11px;color:var(--accent);font-weight:500;">today</span>' : ''}</td>
      <td>${dayJobs.length || '<span style="color:var(--text3);">—</span>'}</td>
      <td>${hrs > 0 ? `<span class="hours-badge"><i class="ti ti-clock" style="font-size:11px;"></i>${hrs.toFixed(1)}</span>` : '<span style="color:var(--text3);">—</span>'}</td>
      <td style="font-size:12px;color:var(--text2);">${vehicles || '<span style="color:var(--text3);">—</span>'}</td>
    </tr>`;
  });
  document.getElementById('summary-tbody').innerHTML = rows.join('');
}

function changeWeek(dir) { currentWeekOffset += dir; renderSummary(); }

function exportWeekCSV() {
  const { monday, sunday } = getWeekBounds(currentWeekOffset);
  const weekJobs = jobs.filter(j => { const d = new Date(j.date + 'T12:00:00'); return d >= monday && d <= sunday; });
  if (!weekJobs.length) { showToast('No jobs this week to export', 'info'); return; }
  const headers = ['Date','RO #','Vehicle','Concern','Codes','Hours','Status'];
  const rows = weekJobs.map(j => [j.date,j.ro,j.vehicle,j.concern,j.codes,j.hours,STATUS_LABEL[j.status]||j.status].map(v=>`"${(v||'').toString().replace(/"/g,'""')}"`).join(','));
  downloadFile('week_summary.csv', [headers.join(','),...rows].join('\n'), 'text/csv');
  showToast('Week CSV exported', 'success');
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function downloadFile(name, content, mime) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = name;
  a.click();
}

let toastTimer;
function showToast(msg, type='info') {
  const el = document.getElementById('toast');
  const icon = el.querySelector('i');
  document.getElementById('toast-msg').textContent = msg;
  el.className = `toast ${type}`;
  icon.className = type === 'success' ? 'ti ti-check' : 'ti ti-info-circle';
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

document.getElementById('edit-modal').addEventListener('click', e => { if(e.target === e.currentTarget) closeEditModal(); });
document.getElementById('request-modal').addEventListener('click', e => { if(e.target === e.currentTarget) closeRequestModal(); });

// ─── Theme (light / dark) ─────────────────────────────────────────────────────
function applyTheme(theme) {
  const icon = document.getElementById('theme-icon');
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (icon) icon.className = 'ti ti-sun';
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (icon) icon.className = 'ti ti-moon';
  }
}

function toggleTheme() {
  const current = localStorage.getItem('techTheme') === 'dark' ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('techTheme', next);
  applyTheme(next);
}

function loadTheme() {
  applyTheme(localStorage.getItem('techTheme') === 'dark' ? 'dark' : 'light');
}

// ─── Trip Expenses ────────────────────────────────────────────────────────────
const TRIP_LS = 'tripData';
const CP_KEYS = ['depart_home','arrive_hotel','depart_hotel','arrive_home'];
const CP_META = {
  depart_home:  { n: 1, label: 'Leave home',      file: '1-leave-home' },
  arrive_hotel: { n: 2, label: 'Arrive at hotel', file: '2-arrive-hotel' },
  depart_hotel: { n: 3, label: 'Leave hotel',     file: '3-leave-hotel' },
  arrive_home:  { n: 4, label: 'Arrive home',     file: '4-arrive-home' },
};

function defaultTrip() {
  return {
    destination: '', perMile: '0.72', hourly: '',
    checkpoints: {
      depart_home:  { odo: '', time: '', photo: false },
      arrive_hotel: { odo: '', time: '', photo: false },
      depart_hotel: { odo: '', time: '', photo: false },
      arrive_home:  { odo: '', time: '', photo: false },
    },
    receipts: [],
  };
}
let trip = loadTrip();
let stagedReceiptPhoto = null;    // File picked but not yet added
let tripURLs = [];                // object URLs to revoke on re-render

function loadTrip() {
  try { const r = JSON.parse(localStorage.getItem(TRIP_LS)); if (r && r.checkpoints) return Object.assign(defaultTrip(), r); } catch (e) {}
  return defaultTrip();
}
function saveTrip() { try { localStorage.setItem(TRIP_LS, JSON.stringify(trip)); } catch (e) {} }
function saveTripField(field, val) { trip[field] = val; saveTrip(); }
function saveCheckpoint(key, field, val) { trip.checkpoints[key][field] = val; saveTrip(); }

// ── IndexedDB photo store (photos are too big for localStorage) ──
const TRIP_DB = 'tripDB', TRIP_STORE = 'photos';
function idbOpen() {
  return new Promise((resolve, reject) => {
    let req;
    try { req = indexedDB.open(TRIP_DB, 1); } catch (e) { return reject(e); }
    req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(TRIP_STORE)) req.result.createObjectStore(TRIP_STORE); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbPut(key, blob) {
  const db = await idbOpen();
  return new Promise((res, rej) => { const tx = db.transaction(TRIP_STORE, 'readwrite'); tx.objectStore(TRIP_STORE).put(blob, key); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
}
async function idbGet(key) {
  const db = await idbOpen();
  return new Promise((res, rej) => { const tx = db.transaction(TRIP_STORE, 'readonly'); const r = tx.objectStore(TRIP_STORE).get(key); r.onsuccess = () => res(r.result || null); r.onerror = () => rej(r.error); });
}
async function idbDel(key) {
  const db = await idbOpen();
  return new Promise((res, rej) => { const tx = db.transaction(TRIP_STORE, 'readwrite'); tx.objectStore(TRIP_STORE).delete(key); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
}
async function idbClear() {
  const db = await idbOpen();
  return new Promise((res, rej) => { const tx = db.transaction(TRIP_STORE, 'readwrite'); tx.objectStore(TRIP_STORE).clear(); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
}

// ── Shrink a photo so it stays email-friendly; keep original if it won't load ──
function downscaleImage(file, maxEdge = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale)), h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load failed')); };
    img.src = url;
  });
}
async function storePhoto(dbKey, file) {
  let blob;
  try { blob = await downscaleImage(file); } catch (e) { blob = file; } // fall back to original (e.g. HEIC)
  await idbPut(dbKey, blob);
}
function extForBlob(blob) {
  const t = (blob && blob.type) || '';
  if (t.includes('png')) return 'png';
  if (t.includes('webp')) return 'webp';
  if (t.includes('heic')) return 'heic';
  return 'jpg';
}

// ── Photo handlers ──
async function onCheckpointPhoto(key, file) {
  if (!file) return;
  try {
    await storePhoto('cp_' + key, file);
    trip.checkpoints[key].photo = true; saveTrip();
    renderTrip();
    showToast('Photo added', 'success');
  } catch (e) { showToast('Could not save photo on this device', 'info'); }
}
async function removeCheckpointPhoto(key) {
  try { await idbDel('cp_' + key); } catch (e) {}
  trip.checkpoints[key].photo = false; saveTrip();
  renderTrip();
}
function onReceiptPhotoStaged(file) {
  stagedReceiptPhoto = file || null;
  const btn = document.querySelector('.rcpt-photo-btn');
  const lbl = document.getElementById('rcpt-photo-label');
  if (btn) btn.classList.toggle('staged', !!file);
  if (lbl) lbl.textContent = file ? 'Photo ✓' : 'Photo';
}
async function addReceipt() {
  const cat = document.getElementById('rcpt-cat').value;
  const amt = document.getElementById('rcpt-amt').value.trim();
  const date = document.getElementById('rcpt-date').value || new Date().toISOString().split('T')[0];
  const note = document.getElementById('rcpt-note').value.trim();
  if (!amt && !stagedReceiptPhoto) { showToast('Add an amount or a photo first', 'info'); return; }
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  let hasPhoto = false;
  if (stagedReceiptPhoto) {
    try { await storePhoto('rcpt_' + id, stagedReceiptPhoto); hasPhoto = true; } catch (e) { showToast('Photo could not be saved, receipt added without it', 'info'); }
  }
  trip.receipts.push({ id, category: cat, amount: amt, date, note, photo: hasPhoto });
  saveTrip();
  // reset entry row
  document.getElementById('rcpt-amt').value = '';
  document.getElementById('rcpt-note').value = '';
  onReceiptPhotoStaged(null);
  renderTrip();
  showToast('Receipt added', 'success');
}
async function deleteReceipt(id) {
  const r = trip.receipts.find(x => x.id === id);
  if (r && r.photo) { try { await idbDel('rcpt_' + id); } catch (e) {} }
  trip.receipts = trip.receipts.filter(x => x.id !== id);
  saveTrip();
  renderTrip();
}

// ── Number / time / format helpers ──
function numOf(v) { if (v == null) return null; const n = parseFloat(String(v).replace(/[^0-9.\-]/g, '')); return isNaN(n) ? null : n; }
function hoursBetween(a, b) { if (!a || !b) return null; const d1 = new Date(a), d2 = new Date(b); if (isNaN(d1) || isNaN(d2)) return null; return (d2 - d1) / 3600000; }
function money(n) { return (n == null) ? '—' : n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }); }
function milesFmt(n) { return (n == null) ? '—' : n.toLocaleString('en-US') + ' mi'; }
function hoursFmt(h) { if (h == null) return '—'; const neg = h < 0; const mins = Math.round(Math.abs(h) * 60); return (neg ? '-' : '') + Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm'; }

// ── The math ──
function computeTrip() {
  const cp = trip.checkpoints;
  const dh = numOf(cp.depart_home.odo), ah = numOf(cp.arrive_hotel.odo), dhotel = numOf(cp.depart_hotel.odo), ahome = numOf(cp.arrive_home.odo);
  const perMile = numOf(trip.perMile), hourly = numOf(trip.hourly);

  const outMiles  = (ah != null && dh != null) ? ah - dh : null;
  const weekMiles = (dhotel != null && ah != null) ? dhotel - ah : null;
  const retMiles  = (ahome != null && dhotel != null) ? ahome - dhotel : null;
  const totalMiles = (ahome != null && dh != null) ? ahome - dh : null;

  const outHrs = hoursBetween(cp.depart_home.time, cp.arrive_hotel.time);
  const retHrs = hoursBetween(cp.depart_hotel.time, cp.arrive_home.time);
  const paidHrs = (outHrs || 0) + (retHrs || 0);

  const mileagePay = (totalMiles != null && perMile != null) ? totalMiles * perMile : null;
  const drivePay = (hourly != null) ? paidHrs * hourly : null;

  const rcptByCat = { Food: 0, Gas: 0, Lodging: 0, Other: 0 };
  let rcptTotal = 0;
  trip.receipts.forEach(r => { const a = numOf(r.amount) || 0; rcptByCat[r.category] = (rcptByCat[r.category] || 0) + a; rcptTotal += a; });

  const earnings = (mileagePay || 0) + (drivePay || 0);
  const grand = earnings + rcptTotal;

  const missing = [];
  if ([dh, ah, dhotel, ahome].some(x => x == null)) missing.push('all four odometer readings');
  if (!cp.depart_home.time || !cp.arrive_hotel.time) missing.push('outbound drive times');
  if (!cp.depart_hotel.time || !cp.arrive_home.time) missing.push('return drive times');
  if (perMile == null) missing.push('pay-per-mile rate');
  if (hourly == null) missing.push('hourly drive rate');

  return { dh, ah, dhotel, ahome, perMile, hourly, outMiles, weekMiles, retMiles, totalMiles, outHrs, retHrs, paidHrs, mileagePay, drivePay, rcptByCat, rcptTotal, earnings, grand, missing };
}

// ── Rendering ──
function clearTripURLs() { tripURLs.forEach(u => { try { URL.revokeObjectURL(u); } catch (e) {} }); tripURLs = []; }

function renderTrip() {
  clearTripURLs();
  // Populate top fields
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
  setVal('trip-dest', trip.destination);
  setVal('trip-permile', trip.perMile);
  setVal('trip-hourly', trip.hourly);
  CP_KEYS.forEach(k => { setVal('cp-' + k + '-odo', trip.checkpoints[k].odo); setVal('cp-' + k + '-time', trip.checkpoints[k].time); });
  const rd = document.getElementById('rcpt-date'); if (rd && !rd.value) rd.value = new Date().toISOString().split('T')[0];

  // Checkpoint thumbnails
  CP_KEYS.forEach(k => {
    const el = document.getElementById('thumb-' + k);
    if (!el) return;
    if (trip.checkpoints[k].photo) {
      el.classList.add('has-img');
      el.innerHTML = `<img data-dbkey="cp_${k}" alt="${CP_META[k].label} photo" onclick="openLightbox('cp_${k}')"><button class="thumb-remove" onclick="removeCheckpointPhoto('${k}')"><i class="ti ti-x"></i>Remove</button>`;
    } else { el.classList.remove('has-img'); el.innerHTML = ''; }
  });

  renderReceipts();
  renderTripSummary();
  hydrateThumbs(document.getElementById('tab-trip'));
}

function renderReceipts() {
  const list = document.getElementById('receipt-list');
  if (!list) return;
  if (!trip.receipts.length) { list.innerHTML = '<div class="receipt-empty">No receipts yet — add your gas and food as you go.</div>'; return; }
  // group by date, newest day first
  const byDate = {};
  trip.receipts.forEach(r => { (byDate[r.date] = byDate[r.date] || []).push(r); });
  const dates = Object.keys(byDate).sort().reverse();
  const catClass = { Food: 'cat-food', Gas: 'cat-gas', Lodging: 'cat-lodging', Other: 'cat-other' };
  list.innerHTML = dates.map(date => {
    const rows = byDate[date];
    const dayTotal = rows.reduce((s, r) => s + (numOf(r.amount) || 0), 0);
    const niceDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return `<div class="receipt-day">
      <div class="receipt-day-head"><span class="rd-date">${niceDate}</span><span class="rd-total">${money(dayTotal)}</span></div>
      ${rows.map(r => `<div class="receipt-row">
        <span class="rcpt-cat-pill ${catClass[r.category] || 'cat-other'}">${r.category}</span>
        <span class="rcpt-amt">${money(numOf(r.amount) || 0)}</span>
        <span class="rcpt-note-txt">${r.note ? escapeHtml(r.note) : ''}</span>
        ${r.photo ? `<img class="rcpt-thumb-img" data-dbkey="rcpt_${r.id}" alt="receipt" onclick="openLightbox('rcpt_${r.id}')">` : ''}
        <button class="rcpt-del" onclick="deleteReceipt('${r.id}')" title="Delete"><i class="ti ti-trash"></i></button>
      </div>`).join('')}
    </div>`;
  }).join('');
}

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function renderTripSummary() {
  const c = computeTrip();

  // Receipt totals strip
  const rt = document.getElementById('receipt-totals');
  if (rt) {
    const bits = [];
    ['Food', 'Gas', 'Lodging', 'Other'].forEach(cat => { if (c.rcptByCat[cat]) bits.push(`<span class="rt-item">${cat}: <b>${money(c.rcptByCat[cat])}</b></span>`); });
    rt.innerHTML = trip.receipts.length ? bits.join('') + `<span class="rt-grand">Receipts total: <b>${money(c.rcptTotal)}</b></span>` : '';
  }

  const sum = document.getElementById('trip-summary');
  if (!sum) return;
  const dateRange = (() => {
    const a = trip.checkpoints.depart_home.time, b = trip.checkpoints.arrive_home.time;
    const f = t => t ? new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
    const fa = f(a), fb = f(b);
    if (fa && fb) return `${fa} – ${fb}`;
    return fa || fb || '';
  })();

  const missingNote = c.missing.length
    ? `<div class="ts-missing"><i class="ti ti-alert-triangle"></i> Still need: ${c.missing.join(', ')}. The total below fills in as you add them.</div>` : '';

  sum.innerHTML = `
    <div class="ts-head">
      <div class="ts-dest">${trip.destination ? escapeHtml(trip.destination) : 'Trip summary'}</div>
      <div class="ts-dates">${dateRange}</div>
    </div>

    <div class="ts-section-label">Mileage</div>
    <table class="ts-table">
      <thead><tr><th>Leg</th><th class="num">Miles</th><th class="num">Drive time</th></tr></thead>
      <tbody>
        <tr><td>Outbound (home → hotel)</td><td class="num">${milesFmt(c.outMiles)}</td><td class="num">${hoursFmt(c.outHrs)}</td></tr>
        <tr><td>At destination (local)</td><td class="num">${milesFmt(c.weekMiles)}</td><td class="num">not paid</td></tr>
        <tr><td>Return (hotel → home)</td><td class="num">${milesFmt(c.retMiles)}</td><td class="num">${hoursFmt(c.retHrs)}</td></tr>
        <tr class="ts-sub"><td>Total</td><td class="num">${milesFmt(c.totalMiles)}</td><td class="num">${hoursFmt(c.paidHrs || null)} paid</td></tr>
      </tbody>
    </table>

    <div class="ts-section-label">Pay</div>
    <div class="ts-pay">
      <div class="ts-paytile"><div class="l">Mileage pay</div><div class="v">${money(c.mileagePay)}</div><div class="s">${c.totalMiles != null ? milesFmt(c.totalMiles) : '—'} × ${c.perMile != null ? money(c.perMile) : '$—'}/mi</div></div>
      <div class="ts-paytile"><div class="l">Drive-time pay</div><div class="v">${money(c.drivePay)}</div><div class="s">${hoursFmt(c.paidHrs || null)} × ${c.hourly != null ? money(c.hourly) : '$—'}/hr</div></div>
    </div>

    <div class="ts-section-label">Reimbursements</div>
    <table class="ts-table">
      <tbody>
        ${['Food', 'Gas', 'Lodging', 'Other'].filter(cat => c.rcptByCat[cat]).map(cat => `<tr><td>${cat}</td><td class="num">${money(c.rcptByCat[cat])}</td></tr>`).join('') || '<tr><td>No receipts yet</td><td class="num">—</td></tr>'}
        <tr class="ts-sub"><td>Receipts total</td><td class="num">${money(c.rcptTotal)}</td></tr>
      </tbody>
    </table>

    <div class="ts-grand"><span class="l">Total expected from employer</span><span class="v">${money(c.grand)}</span></div>
    ${missingNote}
  `;
}

// Load any <img data-dbkey> that doesn't have a src yet
function hydrateThumbs(root) {
  if (!root) return;
  root.querySelectorAll('img[data-dbkey]').forEach(async img => {
    if (img.getAttribute('src')) return;
    try {
      const blob = await idbGet(img.getAttribute('data-dbkey'));
      if (blob) { const u = URL.createObjectURL(blob); tripURLs.push(u); img.src = u; }
    } catch (e) {}
  });
}

// ── Lightbox ──
let lightboxURL = null;
async function openLightbox(dbKey) {
  try {
    const blob = await idbGet(dbKey);
    if (!blob) return;
    if (lightboxURL) URL.revokeObjectURL(lightboxURL);
    lightboxURL = URL.createObjectURL(blob);
    document.getElementById('lightbox-img').src = lightboxURL;
    document.getElementById('photo-lightbox').classList.add('open');
  } catch (e) {}
}
function closeLightbox() {
  document.getElementById('photo-lightbox').classList.remove('open');
  if (lightboxURL) { URL.revokeObjectURL(lightboxURL); lightboxURL = null; }
  document.getElementById('lightbox-img').src = '';
}

// ── Summary text (for the .txt and the ZIP) ──
function buildTripSummaryText() {
  const c = computeTrip();
  const L = [];
  L.push('TRIP EXPENSE SUMMARY');
  if (trip.destination) L.push(trip.destination);
  L.push('='.repeat(40));
  L.push('');
  L.push('MILEAGE CHECKPOINTS');
  CP_KEYS.forEach(k => {
    const cp = trip.checkpoints[k];
    const t = cp.time ? new Date(cp.time).toLocaleString('en-US') : '—';
    L.push(`  ${CP_META[k].n}. ${CP_META[k].label}: odometer ${cp.odo || '—'}, ${t}`);
  });
  L.push('');
  L.push('MILEAGE');
  L.push(`  Outbound (home to hotel): ${milesFmt(c.outMiles)}  (${hoursFmt(c.outHrs)})`);
  L.push(`  At destination (local):   ${milesFmt(c.weekMiles)}  (not paid for time)`);
  L.push(`  Return (hotel to home):   ${milesFmt(c.retMiles)}  (${hoursFmt(c.retHrs)})`);
  L.push(`  TOTAL MILES:              ${milesFmt(c.totalMiles)}`);
  L.push(`  Paid drive time:          ${hoursFmt(c.paidHrs || null)}`);
  L.push('');
  L.push('PAY');
  L.push(`  Mileage pay:    ${money(c.mileagePay)}   (${c.totalMiles != null ? milesFmt(c.totalMiles) : '—'} x ${c.perMile != null ? money(c.perMile) : '$—'}/mi)`);
  L.push(`  Drive-time pay: ${money(c.drivePay)}   (${hoursFmt(c.paidHrs || null)} x ${c.hourly != null ? money(c.hourly) : '$—'}/hr)`);
  L.push('');
  L.push('RECEIPTS');
  if (trip.receipts.length) {
    trip.receipts.slice().sort((a, b) => a.date.localeCompare(b.date)).forEach(r => {
      L.push(`  ${r.date}  ${r.category.padEnd(8)} ${money(numOf(r.amount) || 0).padStart(10)}  ${r.note || ''}`);
    });
    L.push('  ' + '-'.repeat(36));
    ['Food', 'Gas', 'Lodging', 'Other'].forEach(cat => { if (c.rcptByCat[cat]) L.push(`  ${cat} subtotal: ${money(c.rcptByCat[cat])}`); });
    L.push(`  Receipts total: ${money(c.rcptTotal)}`);
  } else { L.push('  (none)'); }
  L.push('');
  L.push('='.repeat(40));
  L.push(`TOTAL EXPECTED FROM EMPLOYER: ${money(c.grand)}`);
  L.push(`  = mileage ${money(c.mileagePay || 0)} + drive time ${money(c.drivePay || 0)} + receipts ${money(c.rcptTotal)}`);
  if (c.missing.length) { L.push(''); L.push('NOTE — still missing: ' + c.missing.join(', ') + '.'); }
  L.push('');
  L.push('Generated ' + new Date().toLocaleString('en-US'));
  return L.join('\n');
}

// ── Gather all photos from IndexedDB with sensible filenames ──
async function gatherTripPhotos() {
  const out = [];
  for (const k of CP_KEYS) {
    if (trip.checkpoints[k].photo) {
      try { const b = await idbGet('cp_' + k); if (b) out.push({ name: `mileage/${CP_META[k].file}.${extForBlob(b)}`, blob: b }); } catch (e) {}
    }
  }
  let i = 1;
  for (const r of trip.receipts.slice().sort((a, b) => a.date.localeCompare(b.date))) {
    if (r.photo) {
      try { const b = await idbGet('rcpt_' + r.id); if (b) { const nn = String(i).padStart(2, '0'); out.push({ name: `receipts/${nn}-${r.category.toLowerCase()}-${r.date}.${extForBlob(b)}`, blob: b }); } } catch (e) {}
    }
    i++;
  }
  return out;
}

function triggerBlobDownload(filename, blob) {
  const u = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = u; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 4000);
}

async function downloadTripZip() {
  try {
    if (typeof JSZip === 'undefined') throw new Error('JSZip unavailable');
    showToast('Building ZIP…', 'info');
    const zip = new JSZip();
    zip.file('summary.txt', buildTripSummaryText());
    const photos = await gatherTripPhotos();
    photos.forEach(p => zip.file(p.name, p.blob));
    const content = await zip.generateAsync({ type: 'blob' });
    const base = (trip.destination || 'trip').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'trip';
    triggerBlobDownload(`${base}-expenses.zip`, content);
    showToast('ZIP downloaded', 'success');
  } catch (e) {
    showToast('ZIP failed — use “Download files individually” as backup', 'info');
  }
}

async function downloadTripFilesIndividually() {
  // Backup path: summary + each photo, one at a time. No compression involved.
  triggerBlobDownload('summary.txt', new Blob([buildTripSummaryText()], { type: 'text/plain' }));
  let photos = [];
  try { photos = await gatherTripPhotos(); } catch (e) {}
  if (!photos.length) { showToast('Summary downloaded (no photos to save)', 'success'); return; }
  showToast(`Downloading ${photos.length} photo(s)…`, 'info');
  for (const p of photos) {
    triggerBlobDownload(p.name.split('/').pop(), p.blob);
    await new Promise(r => setTimeout(r, 400)); // let the browser queue each one
  }
  showToast('All files downloaded', 'success');
}

function downloadTripSummaryTxt() {
  triggerBlobDownload('trip-summary.txt', new Blob([buildTripSummaryText()], { type: 'text/plain' }));
  showToast('Summary downloaded', 'success');
}

async function startNewTrip() {
  if (!confirm('Start a new trip? This clears the current trip and all its photos from this device. Make sure you have downloaded everything first.')) return;
  try { await idbClear(); } catch (e) {}
  trip = defaultTrip();
  saveTrip();
  stagedReceiptPhoto = null;
  // reset entry row fields
  ['rcpt-amt', 'rcpt-note'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  onReceiptPhotoStaged(null);
  renderTrip();
  showToast('New trip started', 'success');
}

// ─── Init ─────────────────────────────────────────────────────────────────────
loadTheme();
renderTemplateList();
renderQueue();
loadRODraft();
updateLogBadge();
generatePromptText();
