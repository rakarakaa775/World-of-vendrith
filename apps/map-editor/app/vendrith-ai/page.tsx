"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMapEditorSupabaseClient } from "../../editor/supabase-client";
type Message = { role: "user" | "assistant"; text: string; evidence?: Array<{ source: string; fact: string; confidence: string }>; model?: string };
const initialMessages: Message[] = [{ role: "assistant", text: "Halo. Saya Vendrith AI. Saya bisa mempertahankan konteks percakapan, membaca evidence project melalui tools, dan tetap read/analyze tanpa mengubah project." }];
export default function VendrithAiPage() {
  const router = useRouter(); const [messages,setMessages]=useState<Message[]>(initialMessages); const [prompt,setPrompt]=useState(""); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  const send = async (value=prompt) => {
    const trimmed=value.trim(); if(!trimmed||loading)return; setPrompt(""); setError("");
    const history=messages.map(({role,text})=>({role,content:text})).slice(-12); setMessages(current=>[...current,{role:"user",text:trimmed}]); setLoading(true);
    try {
      const client=createMapEditorSupabaseClient(); if(!client) throw new Error("Supabase Auth belum dikonfigurasi.");
      const { data: sessionData } = await client.auth.getSession(); const accessToken=sessionData.session?.access_token;
      if(!accessToken) throw new Error("Silakan login terlebih dahulu.");
      const response=await fetch("/api/vendrith-ai",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${accessToken}`},body:JSON.stringify({prompt:trimmed,mode:"explain",conversation:history})});
      const result=await response.json() as {response?:string;model?:string;evidence?:Array<{source:string;fact:string;confidence:string}>;error?:string};
      if(!response.ok)throw new Error(result.error??"AI request failed.");
      setMessages(current=>[...current,{role:"assistant",text:result.response??"Model tidak mengembalikan jawaban.",evidence:result.evidence??[],model:result.model}]);
    } catch(caught){setError(caught instanceof Error?caught.message:"Vendrith AI request failed.");} finally{setLoading(false);}
  };
  return <main style={{minHeight:"100vh",background:"var(--map-editor-bg)",color:"var(--map-editor-text)",display:"grid",gridTemplateRows:"auto 1fr"}}>
    <header style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",borderBottom:"1px solid var(--map-editor-line)",background:"var(--map-editor-panel)"}}>
      <button type="button" onClick={()=>router.push("/")} style={{padding:"7px 10px"}}>← Menu Utama</button>
      <div><strong style={{fontSize:18}}>✦ Vendrith AI</strong><div style={{fontSize:11,color:"#94a3b8"}}>Web AI Agent · Model + Tools + Evidence</div></div>
      <span style={{marginLeft:"auto",fontSize:10,border:"1px solid #166534",color:"#86efac",borderRadius:999,padding:"4px 8px"}}>{loading?"AI THINKING…":"AI AGENT READY"}</span>
    </header>
    <section style={{width:"min(1100px, 100%)",margin:"0 auto",padding:18,display:"grid",gridTemplateRows:"1fr auto",gap:14,minHeight:0}}>
      <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) 260px",gap:14,minHeight:0}}>
        <div style={{border:"1px solid var(--map-editor-border)",borderRadius:12,background:"var(--map-editor-panel)",display:"flex",flexDirection:"column",minHeight:0}}>
          <div style={{padding:"12px 14px",borderBottom:"1px solid var(--map-editor-line)",fontSize:12,color:"#94a3b8"}}>WEB AI AGENT CONVERSATION</div>
          <div style={{flex:1,overflow:"auto",padding:14,display:"grid",alignContent:"start",gap:10}}>
            {messages.map((message,index)=><div key={index} style={{maxWidth:"90%",justifySelf:message.role==="user"?"end":"start",padding:"10px 12px",borderRadius:10,border:"1px solid var(--map-editor-border)",background:message.role==="user"?"var(--map-editor-selected)":"var(--map-editor-button)",lineHeight:1.5,fontSize:13}}><div style={{whiteSpace:"pre-wrap"}}>{message.text}</div>{message.model&&<div style={{marginTop:8,fontSize:10,color:"#86efac"}}>Model: {message.model}</div>}{message.evidence&&message.evidence.length>0&&<details style={{marginTop:8}}><summary style={{cursor:"pointer",fontSize:10,color:"#94a3b8"}}>Evidence ({message.evidence.length})</summary><div style={{marginTop:7,display:"grid",gap:5}}>{message.evidence.map((item,i)=><div key={i} style={{fontSize:10,padding:7,border:"1px solid var(--map-editor-line)",borderRadius:7}}><strong>{item.source}</strong> · {item.confidence}<div>{item.fact}</div></div>)}</div></details>}</div>)}
            {loading&&<div style={{fontSize:12,color:"#94a3b8"}}>Web AI Agent sedang membaca project dan memilih tools yang diperlukan…</div>}
          </div>
          <div style={{padding:12,borderTop:"1px solid var(--map-editor-line)",display:"flex",gap:8}}><textarea value={prompt} onChange={event=>setPrompt(event.target.value)} onKeyDown={event=>{if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();void send();}}} placeholder="Tanyakan apa saja tentang Vendrith..." rows={2} style={{flex:1,resize:"none",padding:10,borderRadius:8,border:"1px solid var(--map-editor-border)",background:"var(--map-editor-button)",color:"#fff"}}/><button type="button" onClick={()=>void send()} disabled={!prompt.trim()||loading} style={{alignSelf:"stretch",padding:"0 16px"}}>{loading?"…":"Kirim"}</button></div>
          {error&&<div style={{margin:"0 12px 12px",padding:9,borderRadius:7,border:"1px solid #7f1d1d",color:"#fca5a5",fontSize:11}}>{error}</div>}
        </div>
        <aside style={{border:"1px solid var(--map-editor-border)",borderRadius:12,background:"var(--map-editor-panel)",padding:14,height:"fit-content"}}><div style={{fontSize:12,color:"#94a3b8",marginBottom:8}}>WEB AGENT CAPABILITIES</div><div style={{display:"grid",gap:7,fontSize:11,lineHeight:1.45,color:"#cbd5e1"}}><div>✓ Repository & code evidence</div><div>✓ Documentation & rules</div><div>✓ Asset/license evidence</div><div>✓ World/Region/Playable inspection</div><div>✓ NPC schema & runtime validation</div><div>✓ Multi-turn conversation context</div></div><div style={{marginTop:14,paddingTop:12,borderTop:"1px solid var(--map-editor-line)",fontSize:10,lineHeight:1.5,color:"#64748b"}}>Guardrail: Web Agent hanya read/analyze. Mutation dan high-risk tools tetap tidak diekspos endpoint ini.</div></aside>
      </div>
      <div style={{padding:"10px 12px",border:"1px solid #166534",borderRadius:8,background:"rgba(20,100,50,.10)",fontSize:11,color:"#cbd5e1"}}><strong>Runtime:</strong> Browser → /api/vendrith-ai → Supabase Auth → Agent Orchestrator → ModelProvider + tools → evidence → response.</div>
    </section>
  </main>;
}
