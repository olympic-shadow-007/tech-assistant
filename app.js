// ─── Template Definitions ─────────────────────────────────────────────────────
// Each template has: name, cat, icon, fields (for the option builder), and
// generate(opts) → { cause, correction }

const TEMPLATES = [
  {
    id: 'oil_change',
    name: 'Oil & Filter Change',
    cat: 'Maintenance',
    icon: 'ti-droplet',
    fields: [
      { id: 'viscosity', label: 'Oil viscosity', type: 'toggle', options: ['0W-16','0W-20','5W-20','5W-30','5W-40','0W-40'] },
      { id: 'quarts', label: 'Quarts', type: 'input', placeholder: 'e.g. 5.7', inputType: 'text' },
      { id: 'oil_type', label: 'Oil type', type: 'toggle', options: ['Full Synthetic','Synthetic Blend','Conventional','High Mileage'] },
      { id: 'olm_reset', label: 'OLM reset', type: 'toggle', options: ['Yes','N/A'] },
    ],
    generate(o) {
      const vis = o.viscosity || '{viscosity}';
      const qts = o.quarts || '{quarts}';
      const type = o.oil_type || '{oil type}';
      const olm = o.olm_reset === 'N/A' ? '' : ' Reset oil life monitor.';
      return {
        cause: 'Routine maintenance.',
        correction: `Drained engine oil and removed oil filter. Installed new OEM-spec oil filter. Reinstalled drain plug with new sealing washer and torqued to spec. Filled with ${qts} qts ${vis} ${type} engine oil.${olm} Verified no leaks at drain plug and filter. Checked final oil level — at full mark on dipstick.`
      };
    }
  },
  {
    id: 'tire_rotation',
    name: 'Tire Rotation',
    cat: 'Tires',
    icon: 'ti-rotate-clockwise-2',
    fields: [
      { id: 'pattern', label: 'Rotation pattern', type: 'toggle', options: ['Front to rear','Rear to front','X-pattern','Full spare rotation'] },
      { id: 'torque', label: 'Lug nut torque (ft-lbs)', type: 'input', placeholder: 'e.g. 100', inputType: 'text' },
      { id: 'psi', label: 'Tire pressure (PSI)', type: 'input', placeholder: 'e.g. 35', inputType: 'text' },
    ],
    generate(o) {
      const pat = o.pattern || '{rotation pattern}';
      const torque = o.torque || '{torque}';
      const psi = o.psi || '{psi}';
      return {
        cause: 'Routine maintenance.',
        correction: `Rotated tires ${pat.toLowerCase()} per vehicle rotation pattern. Reinstalled wheels and torqued lug nuts to ${torque} ft-lbs. Adjusted all four tire pressures to ${psi} PSI per door placard specification.`
      };
    }
  },
  {
    id: 'tire_balance',
    name: 'Tire Rotation & Balance',
    cat: 'Tires',
    icon: 'ti-hexagon',
    fields: [
      { id: 'pattern', label: 'Rotation pattern', type: 'toggle', options: ['Front to rear','Rear to front','X-pattern'] },
      { id: 'torque', label: 'Lug nut torque (ft-lbs)', type: 'input', placeholder: 'e.g. 100', inputType: 'text' },
      { id: 'psi', label: 'Tire pressure (PSI)', type: 'input', placeholder: 'e.g. 35', inputType: 'text' },
      { id: 'balance_spec', label: 'Balance spec (grams)', type: 'input', placeholder: 'e.g. 0.25', inputType: 'text' },
      { id: 'vibration', label: 'Customer complaint?', type: 'toggle', options: ['Yes — vibration complaint','No — scheduled service'] },
    ],
    generate(o) {
      const pat = o.pattern || '{rotation pattern}';
      const torque = o.torque || '{torque}';
      const psi = o.psi || '{psi}';
      const bspec = o.balance_spec || '{balance spec}';
      const vib = o.vibration === 'Yes — vibration complaint';
      const cause = vib
        ? 'Customer states vehicle vibrates at highway speeds. Inspected all four tires and wheels — found balance out of spec.'
        : 'Routine maintenance.';
      const testDrive = vib ? ' Road force balanced; test drove vehicle — vibration resolved.' : '';
      return {
        cause,
        correction: `Rotated tires ${pat.toLowerCase()} per vehicle rotation pattern. Road force balanced all four wheels — all within ${bspec} gram spec.${testDrive} Reinstalled wheels and torqued lug nuts to ${torque} ft-lbs. Adjusted all four tire pressures to ${psi} PSI per door placard specification.`
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
      { id: 'torque', label: 'Lug nut torque (ft-lbs)', type: 'input', placeholder: 'e.g. 100', inputType: 'text' },
      { id: 'psi', label: 'Set pressure (PSI)', type: 'input', placeholder: 'e.g. 35', inputType: 'text' },
    ],
    generate(o) {
      const loc = o.location || '{location}';
      const cause = o.cause || '{cause}';
      const torque = o.torque || '{torque}';
      const psi = o.psi || '{psi}';
      const repaired = o.repairable !== 'Not repairable — replacement needed';
      const correction = repaired
        ? `Dismounted ${loc} tire. Removed ${cause.toLowerCase()} from tread area. Verified puncture within repairable zone. Installed plug-patch per industry standard. Remounted and balanced tire. Reinstalled wheel, torqued lug nuts to ${torque} ft-lbs. Inflated to ${psi} PSI per door placard.`
        : `Dismounted ${loc} tire. Found ${cause.toLowerCase()} — outside repairable zone / sidewall damage. Tire condemned as non-repairable. See separate line for replacement.`;
      return {
        cause: `Customer states ${loc} tire flat / low. Inspected tire — found ${cause.toLowerCase()}.`,
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
      { id: 'torque', label: 'Lug nut torque (ft-lbs)', type: 'input', placeholder: 'e.g. 100', inputType: 'text' },
      { id: 'psi', label: 'Set pressure (PSI)', type: 'input', placeholder: 'e.g. 35', inputType: 'text' },
      { id: 'tpms', label: 'TPMS sensors', type: 'toggle', options: ['Reused existing','Replaced sensors','Service kits only'] },
    ],
    generate(o) {
      const pos = (o.positions && o.positions.length) ? o.positions.join(', ') : '{positions}';
      const size = o.size || '{size}';
      const brand = o.brand || '{brand/model}';
      const torque = o.torque || '{torque}';
      const psi = o.psi || '{psi}';
      const tpms = o.tpms || 'Reused existing';
      let tpmsNote = '';
      if (tpms === 'Replaced sensors') tpmsNote = ' Replaced TPMS sensors; performed TPMS relearn per OEM procedure.';
      else if (tpms === 'Service kits only') tpmsNote = ' Installed new TPMS service kits (valve core, cap, seal, nut); performed TPMS relearn per OEM procedure.';
      else tpmsNote = ' Verified TPMS sensors functional; performed TPMS relearn per OEM procedure.';
      const count = o.positions ? o.positions.length : '';
      const countStr = count ? `${count} ` : '';
      return {
        cause: `Inspected tires — tread at or below wear indicators. Replacement recommended.`,
        correction: `Dismounted old tires. Mounted ${countStr}new ${size} ${brand} tires at ${pos} position(s). Road force balanced all replaced wheels.${tpmsNote} Reinstalled wheels, torqued lug nuts to ${torque} ft-lbs. Inflated all tires to ${psi} PSI per door placard. Disposed of old tires per shop policy.`
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
      { id: 'mileage_note', label: 'Interval note', type: 'toggle', options: ['Due at 8k interval','Customer requested','First time'] },
    ],
    generate(o) {
      const prod = o.product || 'Valvoline Fuel System Cleaner';
      const interval = o.mileage_note === 'Due at 8k interval' ? 'Routine maintenance — fuel system service recommended every 8,000 miles.' : 'Routine maintenance.';
      return {
        cause: interval,
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
      { id: 'coolant_spec', label: 'Coolant type', type: 'toggle', options: ['Kia Green (OEM)','Kia Pink (OEM)','Valvoline Zerex G-05','Valvoline Zerex G-48','Valvoline Zerex Asian Vehicle Red','Valvoline Zerex Asian Vehicle Blue','OAT (orange)','HOAT (yellow)'] },
      { id: 'coolant_qty', label: 'Total capacity (qts)', type: 'input', placeholder: 'e.g. 8', inputType: 'text' },
      { id: 'mileage', label: 'Mileage interval', type: 'toggle', options: ['Due at 60k interval','Customer requested','Contaminated / discolored'] },
    ],
    generate(o) {
      const spec = o.coolant_spec || '{coolant spec}';
      const qty = o.coolant_qty || '{qty}';
      let cause = 'Routine maintenance.';
      if (o.mileage === 'Contaminated / discolored') cause = 'Coolant found discolored / contaminated — flush required.';
      else if (o.mileage === 'Due at 60k interval') cause = 'Routine maintenance — coolant service recommended every 60,000 miles.';
      return {
        cause,
        correction: `Drained and flushed cooling system. Flushed with clean water until discharge ran clear. Refilled system with ${qty} qts ${spec} coolant per manufacturer spec. Bled air from cooling system per OEM procedure. Verified coolant level at cold fill line. No leaks noted.`
      };
    }
  },
  {
    id: 'trans_flush',
    name: 'Transmission Flush',
    cat: 'Fluids',
    icon: 'ti-settings-cog',
    fields: [
      { id: 'trans_type', label: 'Transmission type', type: 'toggle', options: ['Automatic','CVT','DCT'] },
      { id: 'fluid_spec', label: 'Fluid spec', type: 'input', placeholder: 'e.g. Valvoline ATF+4', inputType: 'text', defaultValue: 'Valvoline ATF' },
      { id: 'fluid_qty', label: 'Fluid quantity (qts)', type: 'input', placeholder: 'e.g. 7', inputType: 'text' },
      { id: 'pan', label: 'Pan drop / filter', type: 'toggle', options: ['Pan dropped & filter replaced','Drain & fill only (no filter access)'] },
      { id: 'interval', label: 'Service basis', type: 'toggle', options: ['Due at 58k interval','Customer requested'] },
    ],
    generate(o) {
      const ttype = o.trans_type || 'Automatic';
      const spec = o.fluid_spec || 'Valvoline ATF';
      const qty = o.fluid_qty || '{qty}';
      const panDrop = o.pan === 'Pan dropped & filter replaced';
      const panNote = panDrop ? ' Removed and cleaned transmission pan. Installed new OEM-spec transmission filter and pan gasket. Reinstalled pan and torqued bolts to spec.' : '';
      const cause = o.interval === 'Due at 58k interval' ? 'Routine maintenance — transmission fluid service recommended every 58,000 miles.' : 'Routine maintenance.';
      return {
        cause,
        correction: `Drained ${ttype.toLowerCase()} transmission fluid.${panNote} Refilled with ${qty} qts ${spec} transmission fluid. Verified fluid level at operating temperature per OEM procedure. No leaks noted.`
      };
    }
  },
  {
    id: 'intake_clean',
    name: 'Intake Cleaning',
    cat: 'Maintenance',
    icon: 'ti-wind',
    fields: [
      { id: 'product', label: 'Product used', type: 'input', placeholder: 'e.g. Valvoline Throttle Body & Intake Cleaner', inputType: 'text', defaultValue: 'Valvoline Throttle Body & Intake Cleaner' },
      { id: 'method', label: 'Method', type: 'toggle', options: ['Throttle body spray','Induction service (intake off)','Walnut blast (GDI)'] },
      { id: 'interval', label: 'Service basis', type: 'toggle', options: ['Due at 60k interval','Customer requested'] },
    ],
    generate(o) {
      const prod = o.product || 'Valvoline Throttle Body & Intake Cleaner';
      const method = o.method || 'Throttle body spray';
      let corrDetail = '';
      if (method === 'Walnut blast (GDI)') corrDetail = 'Removed intake manifold and performed walnut media blast on intake valves to remove carbon buildup. Cleaned media from intake ports. Reinstalled intake manifold and torqued to spec.';
      else if (method === 'Induction service (intake off)') corrDetail = `Removed intake assembly. Applied ${prod} to throttle body bore, intake ports, and intake manifold. Cleaned throttle body butterfly and bore. Reinstalled intake and torqued to spec.`;
      else corrDetail = `Applied ${prod} to throttle body bore and intake per label instructions. Cleaned throttle body butterfly and bore of carbon deposits.`;
      const cause = o.interval === 'Due at 60k interval' ? 'Routine maintenance — intake cleaning recommended every 60,000 miles.' : 'Routine maintenance.';
      return {
        cause,
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
      { id: 'fluid_spec', label: 'Fluid spec', type: 'toggle', options: ['DOT 3','DOT 4','DOT 5.1'] },
      { id: 'fluid_source', label: 'Fluid brand', type: 'input', placeholder: 'e.g. Valvoline DOT 4', inputType: 'text', defaultValue: 'Valvoline DOT 4' },
      { id: 'condition', label: 'Fluid condition', type: 'toggle', options: ['Discolored / contaminated','Due at 48k interval','Customer requested'] },
    ],
    generate(o) {
      const spec = o.fluid_spec || 'DOT 4';
      const brand = o.fluid_source || 'Valvoline DOT 4';
      let cause = 'Routine maintenance.';
      if (o.condition === 'Discolored / contaminated') cause = 'Brake fluid found discolored and contaminated — flush required.';
      else if (o.condition === 'Due at 48k interval') cause = 'Routine maintenance — brake fluid service recommended every 48,000 miles.';
      return {
        cause,
        correction: `Flushed brake hydraulic system using pressure bleeder. Bled all four corners in sequence until fresh ${spec} fluid visible at each caliper bleeder. Filled master cylinder reservoir to max with ${brand} ${spec} brake fluid. Verified firm pedal. No leaks noted.`
      };
    }
  },
  {
    id: 'engine_air',
    name: 'Engine Air Filter',
    cat: 'Maintenance',
    icon: 'ti-filter',
    fields: [
      { id: 'condition', label: 'Filter condition', type: 'toggle', options: ['Dirty / restricted','Heavily soiled','Torn / damaged'] },
    ],
    generate(o) {
      const cond = o.condition || 'Dirty / restricted';
      return {
        cause: 'Routine maintenance.',
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
      { id: 'condition', label: 'Filter condition', type: 'toggle', options: ['Heavily soiled','Dirty / restricted','Debris present'] },
      { id: 'interval', label: 'Service basis', type: 'toggle', options: ['Due at 16k interval','Customer requested'] },
    ],
    generate(o) {
      const cond = o.condition || 'Heavily soiled';
      const cause = o.interval === 'Due at 16k interval' ? 'Routine maintenance — cabin air filter service recommended every 16,000 miles.' : 'Routine maintenance.';
      return {
        cause,
        correction: `Removed cabin air filter housing. Replaced cabin air filter — found ${cond.toLowerCase()}. Reinstalled housing cover and verified proper seating of all clips.`
      };
    }
  },
  {
    id: 'battery',
    name: 'Battery Replacement',
    cat: 'Electrical',
    icon: 'ti-battery-charging-2',
    fields: [
      { id: 'group', label: 'Battery group size', type: 'input', placeholder: 'e.g. 48 / H6', inputType: 'text' },
      { id: 'test_result', label: 'Test result', type: 'toggle', options: ['Failed load test','Failed CCA below spec','Voltage too low — would not hold charge'] },
      { id: 'terminals', label: 'Cleaned terminals?', type: 'toggle', options: ['Yes'] },
      { id: 'charge_check', label: 'Checked charging system?', type: 'toggle', options: ['Yes'] },
      { id: 'charge_v', label: 'Alternator output voltage', type: 'input', placeholder: 'e.g. 14.2', inputType: 'text' },
      { id: 'bms', label: 'BMS registration', type: 'toggle', options: ['Completed','Not required'] },
    ],
    generate(o) {
      const grp = o.group || '{group size}';
      const test = o.test_result || 'Failed load test';
      const chargeV = o.charge_v || '{charge V}';
      const bms = o.bms === 'Completed' ? ' Performed BMS / battery registration via scan tool.' : '';
      const terminalNote = o.terminals === 'Yes' ? ' Cleaned battery terminals and posts; applied anti-corrosion spray.' : '';
      const chargeNote = o.charge_check === 'Yes' ? ` Verified charging system output — alternator output ${chargeV}V, within spec.` : '';
      return {
        cause: `Battery load tested — ${test.toLowerCase()}. Replacement required.`,
        correction: `Removed original battery. Installed new group ${grp} battery.${terminalNote}${chargeNote}${bms}`
      };
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
      const d = o.driver_size || '{driver size}';
      const p = o.pass_size || '{passenger size}';
      const rearReplaced = o.rear === 'Replaced rear wiper';
      const rearNote = rearReplaced ? ` Replaced rear wiper blade with ${o.rear_size || '{rear size}'} blade.` : '';
      return {
        cause: `Wiper blades found ${cond.toLowerCase()} — replacement recommended.`,
        correction: `Removed worn wiper blades. Installed new ${d} driver and ${p} passenger wiper blades per OEM spec. Tested wiper operation on all speed settings — wipers clear cleanly.${rearNote}`
      };
    }
  },
  {
    id: 'brake_inspect',
    name: 'Brake Inspection',
    cat: 'Brakes',
    icon: 'ti-circle',
    fields: [
      { id: 'front_mm', label: 'Front pad thickness (mm)', type: 'input', placeholder: 'e.g. 6', inputType: 'text' },
      { id: 'rear_mm', label: 'Rear pad thickness (mm)', type: 'input', placeholder: 'e.g. 4', inputType: 'text' },
      { id: 'rotor_front', label: 'Front rotor condition', type: 'toggle', options: ['Within spec','At min thickness','Scoring noted','Recommend replacement'] },
      { id: 'rotor_rear', label: 'Rear rotor condition', type: 'toggle', options: ['Within spec','At min thickness','Scoring noted','Recommend replacement'] },
      { id: 'fluid', label: 'Brake fluid condition', type: 'toggle', options: ['Good','Discolored — recommend flush'] },
      { id: 'lines', label: 'Lines / hoses', type: 'toggle', options: ['No issues noted','Seepage noted — recommend replacement'] },
    ],
    generate(o) {
      const fmm = o.front_mm || '{front mm}';
      const rmm = o.rear_mm || '{rear mm}';
      const rotorF = o.rotor_front || 'Within spec';
      const rotorR = o.rotor_rear || 'Within spec';
      const fluid = o.fluid || 'Good';
      const lines = o.lines || 'No issues noted';
      return {
        cause: 'Brake inspection performed per customer request / maintenance schedule.',
        correction: `Performed full brake system inspection. Front brake pads: ${fmm}mm remaining. Rear brake pads: ${rmm}mm remaining. Front rotors: ${rotorF.toLowerCase()}. Rear rotors: ${rotorR.toLowerCase()}. Brake fluid condition: ${fluid.toLowerCase()}. Brake lines and flexible hoses: ${lines.toLowerCase()}. Parking brake functional and adjusted.`
      };
    }
  },
  {
    id: 'ac_diag',
    name: 'AC Diagnosis',
    cat: 'HVAC',
    icon: 'ti-snowflake',
    fields: [
      { id: 'refrigerant', label: 'Refrigerant type', type: 'toggle', options: ['R-134a','R-1234yf'] },
      { id: 'static_high', label: 'Static high-side (PSI)', type: 'input', placeholder: 'e.g. 85', inputType: 'text' },
      { id: 'static_low', label: 'Static low-side (PSI)', type: 'input', placeholder: 'e.g. 85', inputType: 'text' },
      { id: 'run_high', label: 'Running high-side (PSI)', type: 'input', placeholder: 'e.g. 220', inputType: 'text' },
      { id: 'run_low', label: 'Running low-side (PSI)', type: 'input', placeholder: 'e.g. 35', inputType: 'text' },
      { id: 'compressor', label: 'Compressor operation', type: 'toggle', options: ['Clutch engages normally','Clutch not engaging','Cycles rapidly — overcharge/undercharge','Compressor noise noted'] },
      { id: 'leaks', label: 'Leak check', type: 'toggle', options: ['No obvious leaks noted','Leak detected — see notes','UV dye added for trace'] },
      { id: 'leak_location', label: 'Leak location (if found)', type: 'input', placeholder: 'e.g. Condenser, front seal', inputType: 'text' },
      { id: 'recovered', label: 'Refrigerant recovered (oz)', type: 'input', placeholder: 'e.g. 14', inputType: 'text' },
      { id: 'filled', label: 'Refrigerant added (oz)', type: 'input', placeholder: 'e.g. 20', inputType: 'text' },
      { id: 'duct_temp', label: 'Duct temp after charge (°F)', type: 'input', placeholder: 'e.g. 42', inputType: 'text' },
      { id: 'concern', label: 'Customer concern', type: 'toggle', options: ['Not cooling','Warm air only','Intermittent cooling','Noise from AC'] },
    ],
    generate(o) {
      const ref = o.refrigerant || 'R-134a';
      const sh = o.static_high || '{static high}';
      const sl = o.static_low || '{static low}';
      const rh = o.run_high || '{running high}';
      const rl = o.run_low || '{running low}';
      const comp = o.compressor || '{compressor operation}';
      const leak = o.leaks || 'No obvious leaks noted';
      const leakLoc = (o.leak_location && leak !== 'No obvious leaks noted') ? ` Location: ${o.leak_location}.` : '';
      const recovered = o.recovered ? `${o.recovered} oz` : '{recovered}';
      const filled = o.filled ? `${o.filled} oz` : '{filled}';
      const ductTemp = o.duct_temp ? `${o.duct_temp}°F` : '{duct temp}';
      const concern = o.concern || 'not cooling';
      return {
        cause: `Customer states AC ${concern.toLowerCase()}. Performed AC system diagnosis.`,
        correction: `Connected ${ref} manifold gauge set. Static pressures — high side: ${sh} PSI, low side: ${sl} PSI. Started vehicle and enabled AC. Running pressures — high side: ${rh} PSI, low side: ${rl} PSI. Compressor operation: ${comp.toLowerCase()}. Leak check: ${leak.toLowerCase()}.${leakLoc} Recovered ${recovered} of ${ref} refrigerant. Recharged system with ${filled} ${ref}. Verified duct temperature at ${ductTemp} after charge.`
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
      { id: 'types', label: 'Inspection(s) performed', type: 'multicheck', options: ['Safety','Emissions','ID/OD (Identification/Odometer)'] },
      { id: 'safety_result', label: 'Safety result', type: 'toggle', options: ['Passed','Failed — see recommendations'] },
      { id: 'emissions_result', label: 'Emissions result', type: 'toggle', options: ['Passed','Failed'] },
      { id: 'emissions_fail_reason', label: 'Emissions fail reason', type: 'toggle', options: ['Monitors not set','Check engine light on','See recommendations'] },
    ],
    generate(o) {
      const reason = o.reason || '{reason}';
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
      if (types.includes('ID/OD (Identification/Odometer)')) {
        lines.push('Performed ID/OD (identification number / odometer) verification.');
      }
      const correction = lines.length ? lines.join(' ') : 'Performed {inspection type} inspection.';

      return {
        cause: `Inspection requested for ${reason.toLowerCase()}.`,
        correction
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
}

// ─── Template List ────────────────────────────────────────────────────────────
function renderTemplateList(filter) {
  const list = document.getElementById('tmpl-list');
  const filtered = filter
    ? TEMPLATES.filter(t => t.name.toLowerCase().includes(filter) || t.cat.toLowerCase().includes(filter))
    : TEMPLATES;
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
  document.getElementById('out-cause').value = result.cause;
  document.getElementById('out-correction').value = result.correction;
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

// ─── Init ─────────────────────────────────────────────────────────────────────
renderTemplateList();
renderQueue();
loadRODraft();
updateLogBadge();
generatePromptText();
