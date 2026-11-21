import{r as a,j as r,C as Ke,S as Qe,O as Ye,E as et,B as tt,u as ve,a as Ne,b as Te,H as nt,d as st}from"./r3f-03QbClAS.js";import{aO as it,aM as Pe,aP as Ue,X as pe,aQ as rt,av as oe,aw as qe,V as x,i as ot,aR as Me,aS as ke,a as at,aT as ze,ad as ct,ay as xe,aU as lt,y as dt,aj as Le,aG as ut,h as me,D as ft}from"./three-CNyVTFKM.js";import{B as Xe,S as Re}from"./index-CnGfK8gS.js";const Oe=new oe,we=new x;class $e extends it{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],n=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],i=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(i),this.setAttribute("position",new Pe(e,3)),this.setAttribute("uv",new Pe(n,2))}applyMatrix4(e){const n=this.attributes.instanceStart,i=this.attributes.instanceEnd;return n!==void 0&&(n.applyMatrix4(e),i.applyMatrix4(e),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let n;e instanceof Float32Array?n=e:Array.isArray(e)&&(n=new Float32Array(e));const i=new Ue(n,6,1);return this.setAttribute("instanceStart",new pe(i,3,0)),this.setAttribute("instanceEnd",new pe(i,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let n;e instanceof Float32Array?n=e:Array.isArray(e)&&(n=new Float32Array(e));const i=new Ue(n,6,1);return this.setAttribute("instanceColorStart",new pe(i,3,0)),this.setAttribute("instanceColorEnd",new pe(i,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new rt(e.geometry)),this}fromLineSegments(e){const n=e.geometry;return this.setPositions(n.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new oe);const e=this.attributes.instanceStart,n=this.attributes.instanceEnd;e!==void 0&&n!==void 0&&(this.boundingBox.setFromBufferAttribute(e),Oe.setFromBufferAttribute(n),this.boundingBox.union(Oe))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new qe),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,n=this.attributes.instanceEnd;if(e!==void 0&&n!==void 0){const i=this.boundingSphere.center;this.boundingBox.getCenter(i);let t=0;for(let c=0,d=e.count;c<d;c++)we.fromBufferAttribute(e,c),t=Math.max(t,i.distanceToSquared(we)),we.fromBufferAttribute(n,c),t=Math.max(t,i.distanceToSquared(we));this.boundingSphere.radius=Math.sqrt(t),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}}ze.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new at},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};Me.line={uniforms:ke.merge([ze.common,ze.fog,ze.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		float trimSegmentAlpha( const in vec4 start, const in vec4 end ) {

			// compute the interpolation factor needed to trim the segment so it terminates
			// between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column

			// we need different nearEstimate formula for reversed and default depth buffer
			// a is positive with a reversed depth buffer so it can be used for controlling the code flow
			float nearEstimate = ( a > 0.0 ) ? ( - b / ( a + 1.0 ) ) : ( - 0.5 * b / a );

			return ( nearEstimate - start.z ) / ( end.z - start.z );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef USE_DASH

				float lineDistanceStart = dashScale * instanceDistanceStart;
				float lineDistanceEnd = dashScale * instanceDistanceEnd;

			#endif

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					float alpha = trimSegmentAlpha( start, end );
					end.xyz = mix( start.xyz, end.xyz, alpha );

					#ifdef USE_DASH

						lineDistanceEnd = mix( lineDistanceStart, lineDistanceEnd, alpha );

					#endif

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					float alpha = trimSegmentAlpha( end, start );
					start.xyz = mix( end.xyz, start.xyz, alpha );

					#ifdef USE_DASH

						lineDistanceStart = mix( lineDistanceEnd, lineDistanceStart, alpha );

					#endif

				}

			}

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? lineDistanceStart : lineDistanceEnd;
				vUv = uv;

			#endif

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = perspective ? normalize( mix( start.xyz, end.xyz, 0.5 ) ) : vec3( 0.0, 0.0, - 1.0 );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;

				// only shift the depth of vertices in front of the camera (#35137)
				if ( clip.w > 0.0 ) clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			float alpha = opacity;
			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			#ifdef WORLD_UNITS

				float len;

				if ( isOrthographic ) {

					// View rays are parallel to the z axis so the distance reduces to camera-space XY
					vec2 lineDir = worldEnd.xy - worldStart.xy;
					float t = clamp( dot( worldPos.xy - worldStart.xy, lineDir ) / dot( lineDir, lineDir ), 0.0, 1.0 );
					len = length( worldStart.xy + lineDir * t - worldPos.xy );

				} else {

					// Find the closest points on the view ray and the line segment
					vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
					vec3 lineDir = worldEnd - worldStart;
					vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

					vec3 p1 = worldStart + lineDir * params.x;
					vec3 p2 = rayEnd * params.y;
					vec3 delta = p1 - p2;
					len = length( delta );

				}

				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};class Be extends ot{constructor(e){super({type:"LineMaterial",uniforms:ke.clone(Me.line.uniforms),vertexShader:Me.line.vertexShader,fragmentShader:Me.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0!==this.worldUnits&&(this.needsUpdate=!0),e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}}const _e=new xe,Ce=new x,Ie=new x,E=new xe,A=new xe,q=new xe,Ee=new x,Ae=new dt,j=new lt,We=new x,Se=new oe,be=new qe,k=new xe;let X,ae;function Fe(o,e,n){return k.set(0,0,-e,1).applyMatrix4(o.projectionMatrix),k.multiplyScalar(1/k.w),k.x=ae/n.width,k.y=ae/n.height,k.applyMatrix4(o.projectionMatrixInverse),k.multiplyScalar(1/k.w),Math.abs(Math.max(k.x,k.y))}function pt(o,e){const n=o.matrixWorld,i=o.geometry,t=i.attributes.instanceStart,c=i.attributes.instanceEnd,d=Math.min(i.instanceCount,t.count);for(let u=0,h=d;u<h;u++){j.start.fromBufferAttribute(t,u),j.end.fromBufferAttribute(c,u),j.applyMatrix4(n);const v=new x,w=new x;X.distanceSqToSegment(j.start,j.end,w,v),w.distanceTo(v)<ae*.5&&e.push({point:w,pointOnLine:v,distance:X.origin.distanceTo(w),object:o,face:null,faceIndex:u,uv:null,uv1:null})}}function ht(o,e,n){const i=e.projectionMatrix,c=o.material.resolution,d=o.matrixWorld,u=o.geometry,h=u.attributes.instanceStart,v=u.attributes.instanceEnd,w=Math.min(u.instanceCount,h.count),S=-e.near;X.at(1,q),q.w=1,q.applyMatrix4(e.matrixWorldInverse),q.applyMatrix4(i),q.multiplyScalar(1/q.w),q.x*=c.x/2,q.y*=c.y/2,q.z=0,Ee.copy(q),Ae.multiplyMatrices(e.matrixWorldInverse,d);for(let z=0,Q=w;z<Q;z++){if(E.fromBufferAttribute(h,z),A.fromBufferAttribute(v,z),E.w=1,A.w=1,E.applyMatrix4(Ae),A.applyMatrix4(Ae),E.z>S&&A.z>S)continue;if(E.z>S){const T=E.z-A.z,P=(E.z-S)/T;E.lerp(A,P)}else if(A.z>S){const T=A.z-E.z,P=(A.z-S)/T;A.lerp(E,P)}E.applyMatrix4(i),A.applyMatrix4(i),E.multiplyScalar(1/E.w),A.multiplyScalar(1/A.w),E.x*=c.x/2,E.y*=c.y/2,A.x*=c.x/2,A.y*=c.y/2,j.start.copy(E),j.start.z=0,j.end.copy(A),j.end.z=0;const y=j.closestPointToPointParameter(Ee,!0);j.at(y,We);const D=Le.lerp(E.z,A.z,y),H=D>=-1&&D<=1,B=Ee.distanceTo(We)<ae*.5;if(H&&B){j.start.fromBufferAttribute(h,z),j.end.fromBufferAttribute(v,z),j.start.applyMatrix4(d),j.end.applyMatrix4(d);const T=new x,P=new x;X.distanceSqToSegment(j.start,j.end,P,T),n.push({point:P,pointOnLine:T,distance:X.origin.distanceTo(P),object:o,face:null,faceIndex:z,uv:null,uv1:null})}}}class mt extends ct{constructor(e=new $e,n=new Be({color:Math.random()*16777215})){super(e,n),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,n=e.attributes.instanceStart,i=e.attributes.instanceEnd,t=new Float32Array(2*n.count);for(let d=0,u=0,h=n.count;d<h;d++,u+=2)Ce.fromBufferAttribute(n,d),Ie.fromBufferAttribute(i,d),t[u]=u===0?0:t[u-1],t[u+1]=t[u]+Ce.distanceTo(Ie);const c=new Ue(t,2,1);return e.setAttribute("instanceDistanceStart",new pe(c,1,0)),e.setAttribute("instanceDistanceEnd",new pe(c,1,1)),this}raycast(e,n){const i=this.material.worldUnits,t=e.camera;if(t===null&&!i&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.'),i===!1&&(this.material.resolution.x===0||this.material.resolution.y===0))return;const c=e.params.Line2!==void 0&&e.params.Line2.threshold||0;X=e.ray;const d=this.matrixWorld,u=this.geometry,h=this.material;ae=h.linewidth+c,u.boundingSphere===null&&u.computeBoundingSphere(),be.copy(u.boundingSphere).applyMatrix4(d);let v;if(i)v=ae*.5;else{const S=Math.max(t.near,be.distanceToPoint(X.origin));v=Fe(t,S,h.resolution)}if(be.radius+=v,X.intersectsSphere(be)===!1)return;u.boundingBox===null&&u.computeBoundingBox(),Se.copy(u.boundingBox).applyMatrix4(d);let w;if(i)w=ae*.5;else{const S=Math.max(t.near,Se.distanceToPoint(X.origin));w=Fe(t,S,h.resolution)}Se.expandByScalar(w),X.intersectsBox(Se)!==!1&&(i?pt(this,n):ht(this,t,n))}onBeforeRender(e){const n=this.material.uniforms;n&&n.resolution&&(e.getViewport(_e),this.material.uniforms.resolution.value.set(_e.z,_e.w))}}class Ze extends $e{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const n=e.length-3,i=new Float32Array(2*n);for(let t=0;t<n;t+=3)i[2*t]=e[t],i[2*t+1]=e[t+1],i[2*t+2]=e[t+2],i[2*t+3]=e[t+3],i[2*t+4]=e[t+4],i[2*t+5]=e[t+5];return super.setPositions(i),this}setColors(e){const n=e.length-3,i=new Float32Array(2*n);for(let t=0;t<n;t+=3)i[2*t]=e[t],i[2*t+1]=e[t+1],i[2*t+2]=e[t+2],i[2*t+3]=e[t+3],i[2*t+4]=e[t+4],i[2*t+5]=e[t+5];return super.setColors(i),this}setFromPoints(e){const n=e.length-1,i=new Float32Array(6*n);for(let t=0;t<n;t++)i[6*t]=e[t].x,i[6*t+1]=e[t].y,i[6*t+2]=e[t].z||0,i[6*t+3]=e[t+1].x,i[6*t+4]=e[t+1].y,i[6*t+5]=e[t+1].z||0;return super.setPositions(i),this}fromLine(e){const n=e.geometry;return this.setPositions(n.attributes.position.array),this}}class vt extends mt{constructor(e=new Ze,n=new Be({color:Math.random()*16777215})){super(e,n),this.isLine2=!0,this.type="Line2"}}const xt=`${Xe}scenes/christmas-street.glb`,yt=`${Xe}maris.glb`,gt=450,ie=new me(2.6,1.7,.35),je=new me(.4,2,1.8),wt=`
uniform float uTime; varying vec3 vPos;
void main(){
  vec3 p = position;
  p.z += sin(p.x*0.6+uTime*0.8)*0.12 + sin(p.y*0.8-uTime*0.6)*0.10 + sin((p.x+p.y)*0.35+uTime*0.4)*0.18;
  vec4 w = modelMatrix * vec4(p,1.0);
  vPos = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`,St=`
uniform vec3 uDeep; uniform vec3 uShallow; varying vec3 vPos;
void main(){
  vec3 n = normalize(cross(dFdx(vPos), dFdy(vPos)));
  float d = clamp(dot(n, normalize(vec3(0.35,1.0,0.25)))*0.5+0.5, 0.0, 1.0);
  float dist = clamp(length(vPos.xz)/26.0, 0.0, 1.0);
  vec3 c = mix(uShallow, uDeep, clamp(dist*0.9 + (1.0-d)*0.55, 0.0, 1.0));
  gl_FragColor = vec4(c, 1.0);
}`;function bt(){const o=a.useRef(null),e=a.useMemo(()=>({uTime:{value:0},uDeep:{value:new me("#0B1D2A")},uShallow:{value:new me("#1f8f8c")}}),[]);return ve((n,i)=>{o.current&&(o.current.uniforms.uTime.value+=i)}),r.jsxs("mesh",{"rotation-x":-Math.PI/2,position:[0,-.05,0],children:[r.jsx("planeGeometry",{args:[140,140,110,110]}),r.jsx("shaderMaterial",{ref:o,vertexShader:wt,fragmentShader:St,uniforms:e})]})}const Mt="varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",zt=`
varying vec3 vDir;
void main(){
  float h = clamp(vDir.y, 0.0, 1.0);
  vec3 horizon = vec3(0.93, 0.56, 0.38);
  vec3 mid = vec3(0.13, 0.33, 0.42);
  vec3 top = vec3(0.035, 0.085, 0.14);
  vec3 c = mix(horizon, mid, smoothstep(0.0, 0.22, h));
  c = mix(c, top, smoothstep(0.18, 0.75, h));
  gl_FragColor = vec4(c, 1.0);
}`;function _t(){const o=a.useRef(null);return ve(({camera:e})=>o.current?.position.copy(e.position)),r.jsxs("mesh",{ref:o,renderOrder:-10,children:[r.jsx("sphereGeometry",{args:[110,32,16]}),r.jsx("shaderMaterial",{vertexShader:Mt,fragmentShader:zt,side:ut,depthWrite:!1,fog:!1})]})}const Ge=.6,He=7.8,Ve=6,Et=o=>o*o*(3-2*o),De=(o,e,n)=>o+(e-o)*n;function At({progress:o,runId:e,narrow:n,frame:i}){const{camera:t,size:c,scene:d}=Te(),u=Te(B=>B.controls),h=a.useRef(!1);a.useEffect(()=>{h.current=!1},[e]),a.useEffect(()=>{const B=t;n?B.setViewOffset(c.width,c.height,0,-c.height*.2,c.width,c.height):B.setViewOffset(c.width,c.height,-c.width*.15,0,c.width,c.height),B.updateProjectionMatrix()},[t,c,n]),a.useEffect(()=>{const B=document.querySelector(".hero-canvas"),T=()=>h.current=!0;return B?.addEventListener("pointerdown",T),()=>B?.removeEventListener("pointerdown",T)},[]);const v=a.useMemo(()=>new x,[]),w=a.useMemo(()=>new x,[]),S=a.useMemo(()=>new x,[]),z=a.useMemo(()=>new x,[]),Q=a.useMemo(()=>new x,[]),F=a.useMemo(()=>new x,[]),y=a.useMemo(()=>new oe,[]),D=a.useRef(30),H=a.useRef(!1);return ve(({clock:B},T)=>{if(h.current)return;const P=t,G=Et(Math.min(o.current,1)),ce=G>=1?Math.sin(B.elapsedTime*.2)*.035:0,$=De(0,n?.38:.5,G)+ce,Y=De(.22,n?.5:.36,G),R=i.current;if(y.min.set(Ge,0,R.focus.z-Ve),y.max.set(He,2.6,R.focus.z+Ve),y.expandByPoint(R.focus).expandByPoint(R.maris),R.ready){const _=Le.smoothstep(o.current,.9,1);y.min.lerp(R.min,_),y.max.lerp(R.max,_),y.min.x=Math.min(y.min.x,Ge),y.max.x=Math.max(y.max.x,He)}F.set((y.min.x+y.max.x)/2,De(1,1.4,G),(y.min.z+y.max.z)/2),w.set(Math.sin($)*Math.cos(Y),Math.sin(Y),Math.cos($)*Math.cos(Y)),S.set(Math.cos($),0,-Math.sin($)),z.crossVectors(w,S).normalize();const ye=Math.tan(Le.degToRad(P.fov/2)),le=ye*(c.width/c.height),he=n?.9:.66,de=n?.46:.85;let W=8;for(let _=0;_<8;_++){Q.set(_&1?y.max.x:y.min.x,_&2?y.max.y:y.min.y,_&4?y.max.z:y.min.z).sub(F);const p=Q.dot(w);W=Math.max(W,Math.abs(Q.dot(S))/(le*he)+p,Math.abs(Q.dot(z))/(ye*de)+p)}const ue=1-Math.exp(-T*3.5);R.resnap&&(R.resnap=!1,H.current=!1),H.current||(v.copy(F),D.current=W,H.current=!0),v.lerp(F,ue),D.current+=(W-D.current)*ue,W=D.current,t.position.copy(v).addScaledVector(w,W),t.lookAt(v),u?.target.copy(v);const re=d.fog;re&&(re.near=W*.95,re.far=W*3.4)}),null}const jt=.55,Je=7;function Dt({frame:o,hand:e}){const{scene:n,animations:i}=Ne(yt),t=a.useRef(null),{actions:c}=st(i,t),d=a.useRef(null),u=a.useRef(null);return a.useEffect(()=>{n.traverse(h=>{/Conductor|Winter|MouthFrown|MouthO|MouthWide|Toy(?!Tree)/.test(h.name)&&(h.visible=!1),h.name==="Maris_Spindle"&&(u.current=h)}),c[Object.keys(c).find(h=>h.endsWith("_weave"))??""]?.reset().fadeIn(.3).play()},[n,c]),ve(({clock:h},v)=>{const w=o.current.maris;w.x=Je,w.z+=(o.current.focus.z+1.6-w.z)*(1-Math.exp(-v*2.5)),d.current?.position.copy(w),d.current?.updateMatrixWorld(!0),u.current&&u.current.getWorldPosition(e),t.current&&(t.current.position.y=.1+Math.sin(h.elapsedTime*1.4)*.03,t.current.rotation.y=.75+Math.sin(h.elapsedTime*.5)*.08)}),r.jsxs("group",{ref:d,children:[r.jsxs("mesh",{position:[0,-.07,0],scale:[.5,.14,.5],children:[r.jsx("icosahedronGeometry",{args:[1,0]}),r.jsx("meshStandardMaterial",{color:"#3a5566",flatShading:!0,roughness:1})]}),r.jsx("group",{ref:t,scale:jt,position:[0,.1,0],"rotation-y":.75,children:r.jsx("primitive",{object:n})}),r.jsx("pointLight",{position:[1.2,2.3,1.7],color:"#ffd9a0",intensity:24,distance:10,decay:2}),r.jsx("pointLight",{position:[-1.3,1.8,-1.3],color:"#5fe0d0",intensity:11,distance:8,decay:2})]})}function Tt({replay:o,building:e,runId:n,onProgress:i,hand:t,progress:c,frame:d}){const u=Ne(xt),h=a.useRef(null),v=a.useRef({t:0,next:0,eventIdx:0,active:[],last:null,lastCorrected:!1,reported:-1,seed:!1}),{scene:w,items:S,lastT:z,glow:Q,fit:F}=a.useMemo(()=>{const p=u.scene.clone(!0),b=new Map;for(const m of o.events)b.has(m.part)||b.set(m.part,{t:m.t_ms,corrected:m.corrected});const O=o.events.length?o.events[o.events.length-1].t_ms:0,l=O+1500,C=[],ee=[],V=new oe;p.updateMatrixWorld(!0),p.traverse(m=>{const M=m;if(!M.isMesh)return;let te=l,ne=!1;for(let se=M;se;se=se.parent){const N=b.get(se.name);N&&N.t<te&&(te=N.t,ne=N.corrected)}V.setFromObject(M),C.push({size:V.getSize(new x).length(),mesh:M,t:te,scale:M.scale.clone(),at:-1,corrected:ne,code:te===l}),V.setFromObject(M),ee.push(V.getCenter(new x))}),C.sort((m,M)=>m.t-M.t);const s=(m,M)=>m.slice().sort((te,ne)=>te-ne)[Math.floor((m.length-1)*M)],f=ee.map(m=>m.x),U=ee.map(m=>m.z),Z=s(f,.05),ge=s(f,.95),g=s(U,.05),L=s(U,.95),I=Math.max(ge-Z,L-g,1),J=36/I,K=m=>{for(let M=m;M;M=M.parent)if(/^Mountain/.test(M.name))return!0;return!1};for(let m=C.length-1;m>=0;m--)(C[m].size>I*.5||K(C[m].mesh))&&(C[m].mesh.visible=!1,C.splice(m,1));const fe=[];for(const m of C){const M=m.mesh.name,te=/^(LampHead|EaveBulb|TreeStar|Garland|LampShade)/.test(M),ne=/Window/.test(M);if(!te&&!ne)continue;const se=m.mesh.material;if(!se||!("emissive"in se))continue;const N=se.clone();N.emissive=new me(ne?"#ffb85c":"#ffd27a"),N.emissiveIntensity=ne?1.6:3.2,m.mesh.material=N,fe.push({mat:N,base:N.emissiveIntensity,phase:Math.random()*6.28})}return{scene:p,items:C,lastT:O,glow:fe,fit:{s:J,cx:(Z+ge)/2,cz:(g+L)/2}}},[u.scene,o]),y=()=>{const p=v.current;p.t=0,p.next=0,p.eventIdx=0,p.active=[],p.last=null,p.reported=-1;for(const b of S)b.mesh.visible=!1,b.at=-1};a.useEffect(()=>{y();const p=parseFloat(new URLSearchParams(location.search).get("at")??"");n===0&&p>0&&(v.current.t=p*z,v.current.seed=!0)},[n,S]);const D=a.useMemo(()=>Array.from({length:32},()=>new x),[]),H=a.useMemo(()=>new Float32Array(96),[]),B=a.useMemo(()=>new x,[]),T=Te(p=>p.size),P=a.useMemo(()=>{const p=new Ze;p.setPositions(new Float32Array(96));const b=new Be({color:16777215,linewidth:5.5,toneMapped:!1,transparent:!0,opacity:.95,depthTest:!1,depthWrite:!1});b.color.copy(ie);const O=new vt(p,b);return O.frustumCulled=!1,O.renderOrder=999,O.visible=!1,O},[]);a.useEffect(()=>{P.material.resolution.set(T.width,T.height)},[T,P]);const G=a.useRef(null),ce=a.useRef(null),$=14,Y=a.useRef([]),R=a.useRef(Array($).fill(-1)),ye=a.useRef(0),le=7,he=a.useRef([]),de=a.useRef(null),W=a.useRef(null),ue=a.useRef(!1),re=a.useMemo(()=>new oe,[]),_=a.useMemo(()=>new x,[]);return ve(({clock:p,camera:b},O)=>{const l=v.current;if(!d.current.ready&&h.current){h.current.updateMatrixWorld(!0);const s=new oe;for(const f of S)re.setFromObject(f.mesh),f.mesh.userData.c=re.getCenter(new x),f.code||s.union(re);s.min.y=Math.max(s.min.y,0),d.current.min.copy(s.min),d.current.max.copy(s.max),d.current.focus.set((s.min.x+s.max.x)/2,.5,s.min.z+1),d.current.maris.set(Je,.1,s.min.z+2.6),d.current.ready=!0}for(const s of Q)s.mat.emissiveIntensity=s.base*(.75+.25*Math.sin(p.elapsedTime*2.3+s.phase)+.12*Math.sin(p.elapsedTime*5.1+s.phase*2));for(c.current=z>0?Math.min(l.t/z,1):0,e&&(l.t+=Math.min(O,.05)*1e3*Re);l.next<S.length&&S[l.next].t<=l.t;){const s=S[l.next++];if(s.mesh.visible=!0,s.mesh.scale.setScalar(1e-4),s.at=l.seed?-1e12:l.t,l.active.push(s),!s.code&&(l.last=s.mesh,l.lastCorrected=s.corrected,!l.seed)){const f=ye.current++%$;R.current[f]=p.elapsedTime,Y.current[f].position.copy(s.mesh.userData.c),Y.current[f].userData.c=s.corrected}s.code&&!ue.current&&de.current&&(ue.current=!0,de.current.position.copy(s.mesh.userData.c),de.current.position.y+=4)}l.seed&&(d.current.snap=!0),l.seed=!1;for(let s=l.active.length-1;s>=0;s--){const f=l.active[s],U=Math.min((l.t-f.at)/(gt*Re),1),Z=1+2.2*Math.pow(U-1,3)+1.2*Math.pow(U-1,2);f.mesh.scale.copy(f.scale).multiplyScalar(Math.max(Z,1e-4)),U>=1&&l.active.splice(s,1)}for(;l.eventIdx<o.events.length&&o.events[l.eventIdx].t_ms<=l.t;)l.eventIdx++;if(l.eventIdx!==l.reported){l.reported=l.eventIdx;const s=l.eventIdx>0?o.events[l.eventIdx-1]:null;i({n:l.eventIdx,last:s?{tool:s.tool,part:s.part,corrected:s.corrected}:null,done:l.t>z+1500})}for(let s=0;s<$;s++){const f=Y.current[s];if(!f)continue;const U=(p.elapsedTime-R.current[s])/.9;if(f.visible=R.current[s]>=0&&U>=0&&U<1,f.visible){f.quaternion.copy(b.quaternion),f.scale.setScalar(.15+U*1.2);const Z=f.material;Z.opacity=(1-U)*.95,Z.color.copy(f.userData.c?je:ie)}}if(W.current){const s=ue.current&&l.t>=z+1500;W.current.style.opacity=s?"1":"0"}const C=P,ee=l.t>=z+1500,V=e&&!!l.last;C.visible=V,G.current&&(G.current.visible=V),ce.current&&(ce.current.visible=V);for(let s=0;s<le;s++){const f=he.current[s];f&&(f.visible=V&&ee)}if(V&&l.last){const s=B.copy(l.last.userData.c);s.y+=.2,d.current.focus.copy(s),d.current.snap&&(d.current.snap=!1,d.current.maris.z=s.z+1.6,d.current.resnap=!0);const f=t,U=C.material;U.color.copy(l.lastCorrected?je:ie),U.opacity=ee?.6:.95,U.linewidth=ee?3.6:5.5;const Z=f.distanceTo(s);_.lerpVectors(f,s,.5),_.y+=Math.min(Z*.2,3)+.4;for(let g=0;g<D.length;g++){const L=g/(D.length-1),I=(1-L)*(1-L),J=2*L*(1-L),K=L*L;D[g].set(f.x*I+_.x*J+s.x*K,f.y*I+_.y*J+s.y*K,f.z*I+_.z*J+s.z*K),D[g].y+=Math.sin(L*9-p.elapsedTime*4)*.05*Math.sin(L*Math.PI),H[g*3]=D[g].x,H[g*3+1]=D[g].y,H[g*3+2]=D[g].z}C.geometry.setPositions(H);for(let g=0;g<le;g++){const L=he.current[g];if(!L||!L.visible)continue;const I=((g+1)/(le+1)+p.elapsedTime*.03*(1+g%3))%1,J=(1-I)*(1-I),K=2*I*(1-I),fe=I*I;L.position.set(f.x*J+_.x*K+s.x*fe+Math.sin(p.elapsedTime*1.3+g)*.15,f.y*J+_.y*K+s.y*fe+Math.sin(p.elapsedTime*1.7+g*2)*.15+.1,f.z*J+_.z*K+s.z*fe+Math.cos(p.elapsedTime*1.1+g)*.15)}G.current?.position.copy(s),ce.current?.position.copy(f);const ge=(1+Math.sin(p.elapsedTime*6)*.2)*(ee?.7:1);G.current?.scale.setScalar(ge),G.current?.material?.color.copy(l.lastCorrected?je:ie)}}),r.jsxs(r.Fragment,{children:[r.jsx("group",{ref:h,scale:F.s,position:[-F.cx*F.s+3.5,.1,-F.cz*F.s-1],children:r.jsx("primitive",{object:w})}),r.jsx("primitive",{object:P}),Array.from({length:$},(p,b)=>r.jsxs("mesh",{ref:O=>{Y.current[b]=O},visible:!1,renderOrder:998,children:[r.jsx("ringGeometry",{args:[.85,1,40]}),r.jsx("meshBasicMaterial",{color:ie,toneMapped:!1,transparent:!0,depthTest:!1,depthWrite:!1,side:ft})]},b)),Array.from({length:le},(p,b)=>r.jsxs("mesh",{ref:O=>{he.current[b]=O},visible:!1,renderOrder:997,children:[r.jsx("sphereGeometry",{args:[.03+b%3*.012,8,8]}),r.jsx("meshBasicMaterial",{color:ie,toneMapped:!1,transparent:!0,opacity:.6,depthTest:!1})]},b)),r.jsx("group",{ref:de,children:r.jsx(nt,{center:!0,zIndexRange:[5,0],style:{pointerEvents:"none"},children:r.jsx("div",{ref:W,className:"code-label",style:{opacity:0},children:"made by code"})})}),r.jsxs("mesh",{ref:G,visible:!1,children:[r.jsx("sphereGeometry",{args:[.12,12,12]}),r.jsx("meshBasicMaterial",{color:ie,toneMapped:!1,depthTest:!1})]}),r.jsxs("mesh",{ref:ce,visible:!1,children:[r.jsx("sphereGeometry",{args:[.06,10,10]}),r.jsx("meshBasicMaterial",{color:ie,toneMapped:!1})]})]})}function Pt({replay:o,building:e,runId:n,visible:i,onProgress:t,lowPower:c}){const d=typeof window<"u"&&window.innerWidth<860,u=a.useMemo(()=>new x(7.4,.5,-15),[]),h=a.useRef(0),v=a.useRef({min:new x(-18,0,-18),max:new x(18,6,18),ready:!1,focus:new x(3.5,.5,-17),maris:new x(7.4,.1,-15),snap:!1});return r.jsxs(Ke,{className:"hero-canvas",frameloop:i?"always":"never",dpr:[1,2],camera:{position:[10,6,30],fov:d?46:38},gl:{antialias:!c,powerPreference:"high-performance"},children:[r.jsx("color",{attach:"background",args:["#0B1D2A"]}),r.jsx("fog",{attach:"fog",args:["#2a4f5a",38,105]}),r.jsx("ambientLight",{intensity:.55,color:"#9fd8dc"}),r.jsx("hemisphereLight",{args:["#6fa8c8","#0b1d2a",.5]}),r.jsx("directionalLight",{position:[-8,9,6],intensity:1.9,color:"#ffc98a"}),r.jsx(_t,{}),r.jsx(bt,{}),r.jsx(Qe,{count:c?40:110,scale:[46,9,46],position:[0,5,0],size:5,speed:.35,opacity:.9,color:"#ffd9a0"}),r.jsxs(a.Suspense,{fallback:null,children:[r.jsx(Tt,{replay:o,building:e,runId:n,onProgress:t,hand:u,progress:h,frame:v}),r.jsx(Dt,{frame:v,hand:u})]}),r.jsx(Ye,{makeDefault:!0,enableZoom:!1,enablePan:!1,maxPolarAngle:Math.PI/2.1,target:[1.5,1.6,1.5]}),r.jsx(At,{progress:h,runId:n,narrow:d,frame:v}),!c&&r.jsx(et,{children:r.jsx(tt,{intensity:1.1,luminanceThreshold:1,luminanceSmoothing:.2,mipmapBlur:!0})})]})}export{Pt as default};
