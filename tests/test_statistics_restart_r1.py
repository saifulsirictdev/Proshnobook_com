"""Independent checks for restart batch01; never grants teacher/live approval."""
from fractions import Fraction as F
import hashlib
import importlib.util
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'content/question-bank/ssc/math/chapter-17'
OUT=BASE/'restart-r1'
def read(name):return json.loads((OUT/name).read_text())
spec=importlib.util.spec_from_file_location('restart',ROOT/'scripts/question-bank/rebuild-statistics-r1.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)

class StatisticsRestart(unittest.TestCase):
    def test_backup_gate_rejects_missing_or_mismatched_verification(self):
        receipt=read('input-backup-receipt.json');intake=read('source-intake.json')
        module.require_backup(receipt,intake)
        for field in ['driveVerified','independentDriveMetadataRead','localArchiveVerified']:
            changed={**receipt,field:False}
            with self.assertRaises(ValueError):module.require_backup(changed,intake)
        with self.assertRaises(ValueError):module.require_backup({**receipt,'drive':{**receipt['drive'],'md5':'bad'}},intake)
        with self.assertRaises(ValueError):module.require_backup(receipt,{**intake,'sourceSha256':'bad'})

    def test_actual_input_backup_identity(self):
        r=read('input-backup-receipt.json')
        self.assertEqual(r['bytes'],343027)
        self.assertEqual(r['md5'],'b4115edc00244e8b51dc45e8dead3fcc')
        self.assertEqual(r['sha256'],'2f627b166e288bd6b6ceb685de9364e764ab70c0f7abe56b3a50fcb34d0ff64c')
        self.assertEqual(r['drive']['fileId'],'1jMQRYec_15VaQdk_2HBdwi_ypCwjuIlk')

    def test_source_scope_and_complete_raw_lists(self):
        s=read('source-intake.json');rows=s['records']
        self.assertEqual(s['explicitStatisticsCQCount'],68)
        self.assertEqual(len(rows),68)
        self.assertEqual(sum(bool(x['rawValues']) for x in rows),5)
        self.assertEqual(s['sourceSha256'],'3073b57036389457394475529eb75483b8a63c24fb66ec93549f3272e5157912')
        self.assertTrue(all(not x['officialBoardAuthenticated'] for x in rows))
        self.assertEqual(len(rows[8]['rawValues']),35)
        self.assertEqual(len(rows[13]['rawValues']),32)

    def test_independent_cq_answer_fixtures(self):
        expected=[('87/2','44'),('151/2','457/6'),('127/2','63'),('343/10','761/22'),('729/31','307/13'),('649/10','649/10'),('1997/32','127/2'),('1103/43','437/17'),('2715/74','221/6'),('853/31','359/13')]
        records=[r for r in read('batch01-checks.json') if r['id'].startswith('CQ')]
        for r,(mean,median) in zip(records,expected):
            d=r['model'];N=sum(d['f']);mids=[F(2*a+d['h']-1,2) for a in d['starts']]
            self.assertEqual(F(d['mean']),F(mean))
            self.assertEqual(sum(x*f for x,f in zip(mids,d['f']))/N,F(mean))
            self.assertEqual(F(d['median']),F(median))
            running=0
            for a,f in zip(d['starts'],d['f']):
                if 2*(running+f)>=N:
                    self.assertEqual(F(2*a-1,2)+(F(N,2)-running)*d['h']/f,F(median));break
                running+=f
            if r['raw'] is not None:
                self.assertEqual([sum(a<=v<a+d['h'] for v in r['raw']) for a in d['starts']],d['f'])
            if r['method']=='mode':
                fs=d['f'];j=fs.index(max(fs));p=fs[j-1] if j else 0;q=fs[j+1] if j+1<len(fs) else 0
                mode=F(2*d['starts'][j]-1,2)+F(fs[j]-p,2*fs[j]-p-q)*d['h']
                self.assertEqual(mode,F(d['mode']))

    def test_graph_coordinates_and_comparison(self):
        count=0
        for r in read('batch01-checks.json'):
            if not r['id'].startswith('CQ'):continue
            d=r['model'];ps=[(F(x),y) for x,y in r['graphPoints']]
            if r['graphKind']=='polygon':
                mids=list(map(F,d['mids']));self.assertEqual(ps,[(mids[0]-d['h'],0),*zip(mids,d['f']),(mids[-1]+d['h'],0)])
            elif r['graphKind']=='less':self.assertEqual(ps,list(zip(map(F,d['bounds']),[0,*d['cf']])) )
            elif r['graphKind']=='more':self.assertEqual(ps,list(zip(map(F,d['bounds']),[d['N'],*[d['N']-x for x in d['cf']]])))
            elif r['graphKind']=='compare':
                second=sum(F(x)*f for x,f in zip(d['mids'],r['secondF']))/sum(r['secondF'])
                self.assertEqual(second,F(r['secondMean']));self.assertEqual(second-F(d['mean']),F(r['difference']))
            if ps:count+=1
        self.assertEqual(count,8)

    def test_authored_mcq_keys_and_explanations(self):
        expected=['9.5','30–39','10','13','1','13','7','(35.5, 12)','23','7']
        qs=read('batch01-mcq.json')['items']
        self.assertEqual([q['options'][q['correct']] for q in qs],expected)
        for q in qs:self.assertEqual(len(set(q['options'].values())),4)
        for r in read('batch01-checks.json'):
            if r['id'].startswith('MCQ'):self.assertEqual(set(r['optionReasons']),set('ABCD'))

    def test_marks_and_short_question_load(self):
        for q in read('batch01-cq.json')['items']:
            self.assertEqual([p['marks'] for p in q['parts']],[2,4,4])
            for p in q['parts'][1:]:
                self.assertGreater(len(p['solution']),150)
                self.assertNotIn('মধ্যমান কত',p['question'])
        for q in read('batch01-sq.json')['items']:
            self.assertLess(len(q['text']),250)
            self.assertNotIn('অঙ্কন কর',q['text'])
            self.assertNotIn('আনুমানিক মধ্যক নির্ণয়',q['text'])
        self.assertIn('20',read('batch01-sq.json')['items'][1]['explanation'])

    def test_lineage_inputs_and_new_payload_hashes(self):
        checks=read('batch01-checks.json');lookup={}
        for k in ('mcq','cq','sq'):
            for i,q in enumerate(read(f'batch01-{k}.json')['items'],1):lookup[f'{k.upper()}-{i:03}']=q
        self.assertEqual(len(lookup),30)
        self.assertEqual(len({(r['oldSlot']['file'],r['oldSlot']['item']) for r in checks}),30)
        for r in checks:
            old=r['oldSlot'];q=json.loads((BASE/old['file']).read_text())['items'][old['item']-1]
            self.assertEqual(module.canonical(q),old['digest'])
            self.assertEqual(module.canonical(lookup[r['id']]),r['newDigest'])
            self.assertFalse(r['approved'])
        m=json.loads((BASE/'targets-v1-manifest.json').read_text())
        for f in m['files']:self.assertEqual(hashlib.sha256((BASE/f['file']).read_bytes()).hexdigest(),f['sha256'])
        for f in read('progress.json')['files']:self.assertEqual(hashlib.sha256((OUT/f['file']).read_bytes()).hexdigest(),f['sha256'])

    def test_status_does_not_claim_600_complete_or_approval(self):
        p=read('progress.json')
        self.assertEqual(p['totalReconstructed'],30)
        self.assertEqual(p['remaining'],570)
        self.assertEqual(p['reconstructed'],{'MCQ':10,'CQ':10,'SQ':10})
        self.assertEqual(p['approved'],0);self.assertEqual(p['published'],0)
        self.assertFalse(p['teacherApproved']);self.assertFalse(p['oldPayloadsModified']);self.assertFalse(p['lostVersionRecovered'])

if __name__=='__main__':unittest.main()
