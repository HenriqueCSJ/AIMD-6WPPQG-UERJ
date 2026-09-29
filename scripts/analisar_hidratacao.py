from pathlib import Path
import argparse, numpy as np, json, re
p=argparse.ArgumentParser();p.add_argument('xyz');p.add_argument('--out');args=p.parse_args()
lines=Path(args.xyz).read_text().splitlines();frames=[];i=0
while i<len(lines):
    try:n=int(lines[i])
    except ValueError:break
    if i+n+2>len(lines):break
    rows=[l.split() for l in lines[i+2:i+n+2]]
    if any(len(r)<4 for r in rows):break
    elements=[r[0] for r in rows];coords=np.array([[float(v) for v in r[1:4]] for r in rows]);comment=lines[i+1]
    match=re.search(r'\bt\s*=\s*([\d.Ee+-]+)',comment)
    assert match,comment
    t=float(match.group(1))
    frames.append((t,coords));i+=n+2
if not frames:raise SystemExit('No complete frames')
ns=[i for i,e in enumerate(elements) if e=='N'];ox=[i for i,e in enumerate(elements) if e=='O'];hs=[i for i,e in enumerate(elements) if e=='H']
cs=[i for i,e in enumerate(elements) if e=='C']
times=np.array([f[0] for f in frames]);xyz=np.array([f[1] for f in frames]);dist=np.linalg.norm(xyz-xyz[:,0:1,:],axis=2)
# Hysteresis contacts, entry <2.6 A and exit >3.0 A; operational, not a bond order.
contact=np.zeros((len(frames),len(elements)),dtype=bool)
contact[0]=dist[0]<2.6
for j in range(1,len(frames)):contact[j]=np.where(contact[j-1],dist[j]<=3.,dist[j]<2.6)
cnN=contact[:,ns].sum(axis=1);cnO=contact[:,ox].sum(axis=1)
initial_ox=[o for o in ox if dist[0,o]<2.6]
nh=np.linalg.norm(xyz[:,ns,None,:]-xyz[:,None,hs,:],axis=3)
oh=np.linalg.norm(xyz[:,ox,None,:]-xyz[:,None,hs,:],axis=3)
report={'frames':len(frames),'time_fs':[float(times[0]),float(times[-1])],'N_indices':ns,'water_O_indices':ox,'initial_inner_O':initial_ox,'Zn_N_initial_A':dist[0,ns].tolist(),'Zn_N_final_A':dist[-1,ns].tolist(),'Zn_N_min_A':dist[:,ns].min(axis=0).tolist(),'Zn_O_initial_A':dist[0,ox].tolist(),'Zn_O_final_A':dist[-1,ox].tolist(),'cnN_states':dict(zip(*[a.tolist() for a in np.unique(cnN,return_counts=True)])),'cnO_range':[int(cnO.min()),int(cnO.max())],'first_N_contact_fs':next((float(t) for t,n in zip(times,cnN) if n>=1),None),'first_two_N_fs':next((float(t) for t,n in zip(times,cnN) if n==2),None),'initial_waters_outside_final':[o for o in initial_ox if not contact[-1,o]],'maximum_radius_A':float(np.linalg.norm(xyz,axis=2).max()),'NH_count_range_per_N':[[int(v.min()),int(v.max())] for v in (nh<1.25).sum(axis=2).T],'OH_count_range_per_O':[[int(v.min()),int(v.max())] for v in (oh<1.25).sum(axis=2).T],'sampled_events':[]}
for target in sorted(set([float(times[0])]+np.arange(np.ceil(times[0]/500)*500,times[-1]+1,500).tolist())):
    j=int(np.argmin(abs(times-target)))
    report['sampled_events'].append({'fs':float(times[j]),'Zn_N':dist[j,ns].round(3).tolist(),'CN_N':int(cnN[j]),'CN_O':int(cnO[j]),'inner_O':[o for o in ox if contact[j,o]]})
result=json.dumps(report,indent=2)
skeletal=[]
for a in ns+cs:
    for b in ns+cs:
        if b<=a:continue
        lengths=np.linalg.norm(xyz[:,a]-xyz[:,b],axis=1)
        if lengths[0]>1.75:continue
        skeletal.append({'atoms':[a,b],'elements':[elements[a],elements[b]],'initial_A':float(lengths[0]),'range_A':[float(lengths.min()),float(lengths.max())],'final_A':float(lengths[-1]),'first_over_2A_fs':next((float(t) for t,d in zip(times,lengths) if d>2.),None)})
report['ligand_skeletal_bonds']=skeletal
report['ligand_skeleton_intact_under_2A']=all(b['range_A'][1]<2. for b in skeletal)
result=json.dumps(report,indent=2)
if args.out:Path(args.out).write_text(result+'\n')
print(result)
