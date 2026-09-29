/* ================= TOPIC 1 ================= */
fig('1','The streamlined reasoning cycle','Each step feeds the next, reflection sits between them, and decisions are shared with the patient at the center.','Rothstein 2003; Schenkman 2006; Deutsch 2022',function(){
  var b='',cx=280,cy=150,rx=205,ry=108;
  var st=[['Interview / history','focused Qs, ROS, form Ho'],['Exam','systems review, movement analysis, OMs, impairments'],['Evaluation','Dx, prognosis, PIP/N-PIP/AP, POC'],['POC / interventions',''],['Reassessment','outcome measures'],['Outcome','goals met or modified']];
  var pts=st.map(function(s,i){var a=-Math.PI/2+i*2*Math.PI/6-Math.PI/6;return [cx+rx*Math.cos(a),cy+ry*Math.sin(a)]});
  pts.forEach(function(p,i){var q=pts[(i+1)%6];var dx=q[0]-p[0],dy=q[1]-p[1],d=Math.sqrt(dx*dx+dy*dy),ux=dx/d,uy=dy/d;b+=A(p[0]+ux*62,p[1]+uy*34,q[0]-ux*62,q[1]-uy*34,'faint')});
  pts.forEach(function(p,i){b+=BX(p[0]-70,p[1]-27,140,54,st[i][0],st[i][1]?[st[i][1]]:[],i===2?'acc':'', i===2?'tacc':'')});
  b+=B(cx-95,cy-20,190,40,['Shared decision-making','patient ↔ therapist'],'warm','twarm');
  b+=T(cx,296,'Reflection between every step','ts');
  return S(560,305,'Six-step clinical reasoning cycle with shared decision-making in the center',b);
});
fig('1','Problem types and how to manage them','Who raised the problem decides PIP vs N-PIP. When it exists decides remediation vs prevention.','Rothstein 2003',function(){
  var b='';
  b+=T(210,22,'EXISTS NOW','th')+T(420,22,'MAY OCCUR LATER','th');
  b+=BX(20,36,120,58,'PIP','reported by the patient','acc','tacc')+BX(20,104,120,58,'N-PIP','therapist, team or family','pos','tpos');
  b+=BS(150,36,120,58,'current PIP','')+BS(150,104,120,58,'current N-PIP','');
  b+=BS(360,36,120,58,'anticipated PIP','')+BS(360,104,120,58,'anticipated N-PIP','');
  b+=BX(150,176,120,44,'Remediation','','acc','tacc')+BX(360,176,120,44,'Prevention','AP: educate','warm','twarm');
  b+=A(210,166,210,174,'faint')+A(420,166,420,174,'faint');
  return S(500,230,'Grid of problem types by who identifies them and when they occur',b);
});
fig('1','Choosing outcome measures deductively','Start broad at referral and narrow the list after each piece of information.','Potter 2011',function(){
  var s=['Referral: initial list','Initial observation','History','Systems review','Final selection'],b='';
  s.forEach(function(t,i){var w=460-i*70,x=280-w/2,y=16+i*44;b+=BS(x,y,w,34,t,i===4?'acc':'');if(i<4)b+=A(280,y+34,280,y+44,'faint')});
  return S(560,240,'Funnel narrowing outcome measure choices',b);
});

/* ================= TOPIC 2 ================= */
fig('2','The movement continuum','Five phases. What you watch for changes by phase.','Quinn 2021',function(){
  var ph=[['Initial conditions','alignment, symmetry, stability'],['Preparation','understanding, response timing'],['Initiation','muscle timing, direction'],['Execution','speed, coordination, symptoms'],['Termination','goal met, alignment']],b='';
  ph.forEach(function(p,i){var x=6+i*111;b+=BX(x,30,100,96,p[0],[p[1]],i===1?'warm':'',i===1?'twarm':'');if(i<4)b+=A(x+100,78,x+111,78,'')});
  return S(560,140,'Five movement continuum phases left to right',b);
});
fig('2','Categorizing by individual and environment','Tasks get harder as the person and the environment start moving.','Schenkman 2006 (after Gentile)',function(){
  var b='';
  b+=T(200,20,'STATIONARY ENVIRONMENT','th')+T(390,20,'MOVING ENVIRONMENT','th');
  b+=T(70,75,'Stationary','tb','middle')+T(70,90,'individual','ts')+T(70,165,'Moving','tb')+T(70,180,'individual','ts');
  b+=BX(120,34,170,76,'1','sitting quietly on a mat, quiet area','pos','tpos')+BX(305,34,170,76,'3','standing still in a busy clinic','')+BX(120,124,170,76,'2','walking in a quiet area','')+BX(305,124,170,76,'4','walking in a busy clinic','neg','tneg');
  return S(500,210,'Two by two grid of task conditions',b);
});
fig('2','Regressing a task','Add help one layer at a time, and note how, how much and where you assist.','Quinn 2021',function(){
  var s=[['1 Verbal cue','acc'],['2 Tactile cue','warm'],['3 Physical assistance','neg']],b='';
  s.forEach(function(x,i){var y=150-i*52,w=180+i*60;b+=B(20,y,w,40,[x[0]],x[1],'t'+x[1])});
  b+=T(480,60,'Still can\'t change','tb')+T(480,76,'the pattern?','tb')+T(480,100,'→ likely synergistically','ts')+T(480,115,'bound','ts');
  return S(560,200,'Staircase of cues from verbal to physical',b);
});

/* ================= TOPIC 3 ================= */
fig('3','Visual pathway lesions','Before the chiasm, one eye is affected. After it, the same half of both fields is lost, opposite the lesion.','Author\'s notes (figure as labeled)',function(){
  var b='';
  b+=C(150,40,20,'bx')+C(250,40,20,'bx')+T(150,44,'L','ts')+T(250,44,'R','ts');
  b+=P('M150 60 L200 110 L150 160','ln')+P('M250 60 L200 110 L250 160','ln');
  b+=P('M150 160 Q140 200 170 240','ln')+P('M250 160 Q260 200 230 240','ln');
  b+=T(200,128,'chiasm','ts')+T(290,200,'radiations','ts','start')+T(290,150,'tract','ts','start');
  function mk(x,y,n){return C(x,y,8,'bx neg')+T(x,y+4,String(n),'ts')}
  b+=mk(240,80,1)+mk(200,110,2)+mk(245,160,4)+mk(262,210,'5/6')+mk(228,250,7);
  function hl(ex,yy){return 'M'+ex+' '+(yy-14)+' A14 14 0 0 0 '+ex+' '+(yy+14)+'Z'}
  function hr(ex,yy){return 'M'+ex+' '+(yy-14)+' A14 14 0 0 1 '+ex+' '+(yy+14)+'Z'}
  var rows=[['1 R optic nerve: blind R eye',null,'all'],['2 Chiasm: both temporal fields','hl','hr'],['4 R tract: L homonymous hemianopia','hl','hl'],['5/6 R radiations: L quadrant cut','q','q'],['7 R occipital: L homonymous hemianopia','hl','hl']];
  rows.forEach(function(r,i){var yy=40+i*50,x=330;
    function eye(ex,f){var s=C(ex,yy,14,'bx');if(f==='all')s+=C(ex,yy,13,'f-negs');else if(f==='hl')s+='<path class="f-negs" d="'+hl(ex,yy)+'"/>';else if(f==='hr')s+='<path class="f-negs" d="'+hr(ex,yy)+'"/>';else if(f==='q')s+='<path class="f-negs" d="M'+ex+' '+yy+' L'+(ex-14)+' '+yy+' A14 14 0 0 0 '+ex+' '+(yy+14)+'Z"/>';return s}
    b+=eye(x,r[1])+eye(x+32,r[2])+T(x+52,yy+4,r[0],'ts','start')});
  b+=T(346,290,'left eye · right eye (shaded = lost; quadrant shown as inferior for 5)','ts');
  return S(640,300,'Schematic visual pathway with numbered lesion sites and field cuts',b);
},'Schematic; quadrant side follows the source figure.');
fig('3','Levels of consciousness','From unarousable to awake and attentive.','Tindall 1990; Fell 2018',function(){
  var s=[['Coma','GCS < 8','neg'],['Stupor','noxious only','neg'],['Obtunded','repeated stimulation','warm'],['Lethargic','falls back asleep','warm'],['Alert','awake, attentive','pos']],b='';
  s.forEach(function(x,i){var X=6+i*111;b+=BX(X,40,100,70,x[0],[x[1]],x[2],'t'+x[2])});
  b+=A(20,140,540,140,'','harder to arouse ← → more awake',280,160,'ts');
  return S(560,170,'Five levels of consciousness on a scale',b);
});
fig('3','Reading the head impulse test','A corrective saccade back to target after a quick turn points to the side of the turn.','Author\'s notes',function(){
  var b='';
  function head(ox,good){var s=C(ox,90,40,'bx')+C(ox-14,82,6,'f-surf')+C(ox+14,82,6,'f-surf');
    s+=A(ox,40,ox+50,34,'acc','quick 5–10° turn R',ox+40,22,'tacc ts');
    if(good){s+=C(ox-12,82,3,'f-ink')+C(ox+16,82,3,'f-ink')+T(ox,160,'Eyes stay on target','tpos tb')+T(ox,176,'negative HIT','ts')}
    else{s+=C(ox-4,82,3,'f-ink')+C(ox+24,82,3,'f-ink')+A(ox+30,110,ox-10,110,'neg','saccade L',ox+10,128,'tneg ts')+T(ox,160,'Corrective saccade','tneg tb')+T(ox,176,'+R HIT (R loss)','ts')}
    return s}
  b+=head(150,true)+head(410,false);
  return S(560,190,'Two heads showing a normal and a positive head impulse test',b);
});

/* ================= TOPIC 4 ================= */
fig('4','Spasticity vs rigidity','Speed up the stretch: spastic resistance climbs, rigid resistance stays the same.','Author\'s notes',function(){
  var b=axes(70,190,420,160,'Speed of passive stretch →','Resistance');
  b+=P('M72 170 C200 165 300 110 480 40','ln thick neg')+T(486,44,'Spasticity','tneg tb','start');
  b+=P('M72 100 L480 100','ln thick acc')+T(486,104,'Rigidity','tacc tb','start');
  return S(580,220,'Shape-only chart of resistance vs stretch speed',b);
},'shape only');
fig('4','The four synergies at a glance','Highlighted boxes are the strongest components of each pattern.','Sathian 2011; author\'s notes',function(){
  var cols=[['UE flexion',['Scap elev/retract','Shoulder abd/ER','Elbow flexion','Supination','Wrist/finger flex'],[2]],['UE extension',['Scap protraction','Shoulder adduction','Shoulder IR, elbow ext','Pronation','Wrist/finger flex'],[1,3]],['LE flexion',['Hip flexion','Hip abd/ER','Knee flexion','Ankle DF','Toe DF'],[0]],['LE extension',['Hip adduction','Hip ext/IR','Knee extension','Ankle PF','Toe flexion'],[0,2,3]]],b='';
  cols.forEach(function(c,i){var x=8+i*138;b+=T(x+63,20,c[0].toUpperCase(),'th');c[1].forEach(function(t,j){var hi=c[2].indexOf(j)>=0;b+=B(x,32+j*38,126,32,[t],hi?'acc':'mut',hi?'tacc':'')})});
  return S(560,230,'Four columns of synergy components with strongest ones highlighted',b);
});
fig('4','UMCT hip and knee flexion grades','Three reps, as high and as fast as possible, within 10 seconds.','Hislop 1995',function(){
  var b=axes(60,150,460,110,'','');
  b+=R(62,60,138,60,'f-negs')+R(200,60,138,60,'f-warms')+R(338,60,180,60,'f-poss');
  b+=T(131,94,'Weak','tneg tb')+T(269,94,'Moderate','twarm tb')+T(428,94,'Strong','tpos tb');
  [[62,'0°'],[200,'30°'],[338,'60°']].forEach(function(p){b+=T(p[0],168,p[1],'ts')});
  b+=T(290,40,'Weak also = any range but > 10 s for 3 reps','ts')+T(290,186,'Flexion arc (degrees)','ts');
  return S(560,195,'Bands showing weak, moderate and strong flexion arcs',b);
});

/* ================= TOPIC 5 ================= */
fig('5','Cognition as a building','Attention is the foundation. If it cracks, every floor above is shaky.','After Schwabish 2026',function(){
  var f=[['Penthouse: higher-level EF','acc'],['Organization, reasoning',''],['Memory',''],['Lobby: processing',''],['Foundation: attention','warm']],b='';
  f.forEach(function(x,i){b+=B(80,20+i*44,300,36,[x[0]],x[1],x[1]?'t'+x[1]:'')});
  b+=R(392,20,40,212,'f-s2')+T(412,130,'WM','tb')+T(470,110,'Elevator =','ts','start')+T(470,126,'working','ts','start')+T(470,142,'memory','ts','start');
  return S(560,245,'Stacked building floors for cognition',b);
});
fig('5','Where speech breaks down','Language, planning and execution are separate steps, so each disorder has a different fingerprint.','Author\'s notes',function(){
  var s=[['Language','Aphasia','acc'],['Motor planning','Apraxia of speech','warm'],['Motor execution','Dysarthria','neg']],b='';
  s.forEach(function(x,i){var X=20+i*180;b+=BX(X,30,160,60,x[0],'','mut')+A(X+80,90,X+80,110,'faint')+BX(X,112,160,56,x[1],'',x[2],'t'+x[2]);if(i<2)b+=A(X+160,60,X+180,60,'')});
  b+=T(100,190,'paraphasias, anomia','ts')+T(280,190,'inconsistent, groping','ts')+T(460,190,'consistent, slurred','ts');
  return S(560,205,'Three stages of speech production mapped to three disorders',b);
});

/* ================= TOPIC 6 ================= */
fig('6','PNF techniques by goal','Most techniques build mobility; two build stability.','Author\'s notes',function(){
  var mob=['Rhythmic initiation','Dynamic reversals','Repeated stretch','Combination of isotonics','Replication'],st=['Rhythmic stabilization','Dynamic reversals + hold'],b='';
  b+=T(150,20,'MOBILITY','th tacc')+T(420,20,'STABILITY','th tpos');
  mob.forEach(function(t,i){b+=B(40,32+i*40,220,32,[t],'acc','tacc')});
  st.forEach(function(t,i){b+=B(310,32+i*40,220,32,[t],'pos','tpos')});
  return S(560,240,'Two columns sorting PNF techniques',b);
});
fig('6','HIIT after stroke: interval shape','Short high bursts alternate with recovery for 25–30 minutes.','Crozier 2018',function(){
  var b=axes(60,170,470,130,'Time (25–30 min session)','Intensity'),d='M62 150';
  for(var i=0;i<6;i++){var x=62+i*76;d+=' L'+x+' 150 L'+x+' 60 L'+(x+30)+' 60 L'+(x+30)+' 150 L'+(x+76)+' 150'}
  b+=P(d,'ln thick acc')+T(80,52,'85–95% HRR','tacc ts','start')+T(140,165,'recovery','ts');
  return S(560,200,'Shape-only interval chart',b);
},'shape only');

/* ================= TOPIC 7 ================= */
fig('7','Sit to stand in four phases','Lift-off separates phase I from II and carries the highest ground reaction force.','Schenkman 1990; Fell 2018',function(){
  var ph=[['Phase I',['flexion-momentum','iliopsoas, abs, TA; ES eccentric']],['Phase II',['momentum-transfer','hip and knee extensors']],['Phase III',['extension','extensor co-activation']],['Phase IV',['stabilization','co-contraction']]],b='';
  ph.forEach(function(p,i){var x=6+i*138;b+=BX(x,40,128,90,p[0],p[1],i===1?'acc':'',i===1?'tacc':'');if(i<3)b+=A(x+128,85,x+138,85,'')});
  b+=L(140,24,140,140,'neg dash')+T(140,18,'lift-off: peak GRF','tneg ts')+L(278,24,278,140,'faint dash')+T(278,152,'max DF','ts');
  return S(560,165,'Four sit-to-stand phases in sequence',b);
});
fig('7','Six kinds of manual cue','Your hands can activate, direct, compress, load, resist or shape.','Author\'s notes',function(){
  var c=[['Muscle-specific','over the muscle'],['Directional','with the movement'],['Approximation','compress the joint'],['Loading','through the long axis'],['Resistance','opposite the movement'],['Alignment','shape the posture']],b='';
  c.forEach(function(x,i){var X=10+(i%3)*182,Y=20+Math.floor(i/3)*80;b+=BX(X,Y,170,66,x[0],[x[1]],i===1?'acc':i===4?'neg':'',i===1?'tacc':i===4?'tneg':'')});
  return S(560,180,'Six boxes naming manual cue types',b);
});

/* ================= TOPIC 8 ================= */
fig('8','Opening a tight hand','Work from gravity and the wrist to the thumb, then the fingers, and only then the wrist.','Author\'s notes',function(){
  var s=['Gravity: trunk flexion, arm forward','Flex the wrist','Thumb first: thenar pressure, abduct','Spread metacarpal heads from thumb side','Fingers open, then wrist extends','Heel of hand on surface; slide out'],b='';
  s.forEach(function(t,i){var x=6+(i%3)*184,y=20+Math.floor(i/3)*84;b+=BS(x,y,168,66,(i+1)+'. '+t,i===2?'acc':'');});
  b+=A(174,53,190,53,'')+A(358,53,374,53,'')+A(458,86,100,104,'faint')+A(174,137,190,137,'')+A(358,137,374,137,'');
  return S(560,200,'Six-step hand opening sequence',b);
});
fig('8','Shoulder ROM limits in hemiplegia','Stay under 90° unless you facilitate upward rotation and ER; never past 140°.','Author\'s notes',function(){
  var b='',cx=150,cy=150,r=120;
  function seg(f0,f1,k){var x0=cx+r*Math.sin(f0*Math.PI/180),y0=cy+r*Math.cos(f0*Math.PI/180),x1=cx+r*Math.sin(f1*Math.PI/180),y1=cy+r*Math.cos(f1*Math.PI/180);return '<path class="'+k+'" d="M'+cx+' '+cy+' L'+x0+' '+y0+' A'+r+' '+r+' 0 0 0 '+x1+' '+y1+'Z"/>'}
  function lab(f,t,k){var x=cx+(r+18)*Math.sin(f*Math.PI/180),y=cy+(r+18)*Math.cos(f*Math.PI/180);return T(x,y+4,t,k)}
  b+=seg(0,90,'f-poss')+seg(90,140,'f-warms')+seg(140,180,'f-negs')+C(cx,cy,5,'f-ink');
  b+=lab(0,'0°','ts')+lab(90,'90°','ts')+lab(140,'140°','ts')+lab(180,'180°','ts');
  b+=T(cx+55,cy+50,'OK','tpos tb')+T(cx+75,cy-35,'facilitate','twarm tb')+T(cx+30,cy-95,'stop','tneg tb');
  b+=T(330,90,'0–90°: OK','tpos tb','start')+T(330,120,'90–140°: only with scapular','twarm tb','start')+T(330,136,'upward rotation + humeral ER','ts','start')+T(330,152,'(thumb up)','ts','start')+T(330,182,'> 140°: stop','tneg tb','start');
  return S(580,300,'Fan diagram of safe shoulder flexion ranges',b);
},'Schematic angles.');

/* ================= TOPIC 9 ================= */
fig('9','What goes where in a SOAP note','O is the session itself; A is your judgment about it.','Author\'s notes',function(){
  var s=[['S','What the patient says at the start','mut'],['O','Chronological: task, cues, reps, assist, outcome','acc'],['A','Judgment of progress; safety, fall risk, caregiver burden','warm'],['P','What you will do next visit','pos']],b='';
  s.forEach(function(x,i){b+=B(20,14+i*50,50,40,[x[0]],x[2],'t'+x[2])+BS(80,14+i*50,460,40,x[1],'')});
  return S(560,220,'Four stacked SOAP sections',b);
});
fig('9','The EGRESS test','Each step must be safe before the next. If not, stop and bring the right help or equipment.','UHDB NHS; author\'s notes',function(){
  var s=['Move to edge of surface','March while sitting','Stand and march in place','Step forward and back'],b='';
  s.forEach(function(t,i){var x=6+i*138;b+=BS(x,40,126,60,(i+1)+'. '+t,i===3?'pos':'');if(i<3)b+=A(x+126,70,x+138,70,'')});
  b+=T(280,130,'Unsafe at any step → stop','tneg tb');
  return S(560,145,'Four EGRESS steps in sequence',b);
});
