import{r as a,j as r,C as Ke,S as Qe,O as Ye,E as et,B as tt,u as ve,a as Ne,b as Te,H as nt,d as st}from"./r3f-03QbClAS.js";import{aO as it,aM as Pe,aP as Ue,X as pe,aQ as rt,av as oe,aw as qe,V as y,i as ot,aR as Me,aS as ke,a as at,aT as ze,ad as ct,ay as xe,aU as lt,y as dt,aj as Le,aG as ut,h as me,D as ft}from"./three-CNyVTFKM.js";import{B as Xe,S as Re}from"./index-D5HT5WYI.js";const Oe=new oe,we=new y;class $e extends it{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],n=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],i=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(i),this.setAttribute("position",new Pe(e,3)),this.setAttribute("uv",new Pe(n,2))}applyMatrix4(e){const n=this.attributes.instanceStart,i=this.attributes.instanceEnd;return n!==void 0&&(n.applyMatrix4(e),i.applyMatrix4(e),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let n;e instanceof Float32Array?n=e:Array.isArray(e)&&(n=new Float32Array(e));const i=new Ue(n,6,1);return this.setAttribute("instanceStart",new pe(i,3,0)),this.setAttribute("instanceEnd",new pe(i,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let n;e instanceof Float32Array?n=e:Array.isArray(e)&&(n=new Float32Array(e));const i=new Ue(n,6,1);return this.setAttribute("instanceColorStart",new pe(i,3,0)),this.setAttribute("instanceColorEnd",new pe(i,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new rt(e.geometry)),this}fromLineSegments(e){const n=e.geometry;return this.setPositions(n.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new oe);const e=this.attributes.instanceStart,n=this.attributes.instanceEnd;e!==void 0&&n!==void 0&&(this.boundingBox.setFromBufferAttribute(e),Oe.setFromBufferAttribute(n),this.boundingBox.union(Oe))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new qe),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,n=this.attributes.instanceEnd;if(e!==void 0&&n!==void 0){const i=this.boundingSphere.center;this.boundingBox.getCenter(i);let t=0;for(let c=0,d=e.count;c<d;c++)we.fromBufferAttribute(e,c),t=Math.max(t,i.distanceToSquared(we)),we.fromBufferAttribute(n,c),t=Math.max(t,i.distanceToSquared(we));this.boundingSphere.radius=Math.sqrt(t),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}}ze.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new at},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};Me.line={uniforms:ke.merge([ze.common,ze.fog,ze.line]),vertexShader:`
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
		`};class Be extends ot{constructor(e){super({type:"LineMaterial",uniforms:ke.clone(Me.line.uniforms),vertexShader:Me.line.vertexShader,fragmentShader:Me.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0!==this.worldUnits&&(this.needsUpdate=!0),e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}}const _e=new xe,Ce=new y,Ie=new y,E=new xe,A=new xe,q=new xe,Ee=new y,Ae=new dt,j=new lt,We=new y,Se=new oe,be=new qe,k=new xe;let X,ae;function Fe(o,e,n){return k.set(0,0,-e,1).applyMatrix4(o.projectionMatrix),k.multiplyScalar(1/k.w),k.x=ae/n.width,k.y=ae/n.height,k.applyMatrix4(o.projectionMatrixInverse),k.multiplyScalar(1/k.w),Math.abs(Math.max(k.x,k.y))}function pt(o,e){const n=o.matrixWorld,i=o.geometry,t=i.attributes.instanceStart,c=i.attributes.instanceEnd,d=Math.min(i.instanceCount,t.count);for(let u=0,x=d;u<x;u++){j.start.fromBufferAttribute(t,u),j.end.fromBufferAttribute(c,u),j.applyMatrix4(n);const f=new y,S=new y;X.distanceSqToSegment(j.start,j.end,S,f),S.distanceTo(f)<ae*.5&&e.push({point:S,pointOnLine:f,distance:X.origin.distanceTo(S),object:o,face:null,faceIndex:u,uv:null,uv1:null})}}function ht(o,e,n){const i=e.projectionMatrix,c=o.material.resolution,d=o.matrixWorld,u=o.geometry,x=u.attributes.instanceStart,f=u.attributes.instanceEnd,S=Math.min(u.instanceCount,x.count),m=-e.near;X.at(1,q),q.w=1,q.applyMatrix4(e.matrixWorldInverse),q.applyMatrix4(i),q.multiplyScalar(1/q.w),q.x*=c.x/2,q.y*=c.y/2,q.z=0,Ee.copy(q),Ae.multiplyMatrices(e.matrixWorldInverse,d);for(let b=0,$=S;b<$;b++){if(E.fromBufferAttribute(x,b),A.fromBufferAttribute(f,b),E.w=1,A.w=1,E.applyMatrix4(Ae),A.applyMatrix4(Ae),E.z>m&&A.z>m)continue;if(E.z>m){const U=E.z-A.z,R=(E.z-m)/U;E.lerp(A,R)}else if(A.z>m){const U=A.z-E.z,R=(A.z-m)/U;A.lerp(E,R)}E.applyMatrix4(i),A.applyMatrix4(i),E.multiplyScalar(1/E.w),A.multiplyScalar(1/A.w),E.x*=c.x/2,E.y*=c.y/2,A.x*=c.x/2,A.y*=c.y/2,j.start.copy(E),j.start.z=0,j.end.copy(A),j.end.z=0;const g=j.closestPointToPointParameter(Ee,!0);j.at(g,We);const T=Le.lerp(E.z,A.z,g),H=T>=-1&&T<=1,P=Ee.distanceTo(We)<ae*.5;if(H&&P){j.start.fromBufferAttribute(x,b),j.end.fromBufferAttribute(f,b),j.start.applyMatrix4(d),j.end.applyMatrix4(d);const U=new y,R=new y;X.distanceSqToSegment(j.start,j.end,R,U),n.push({point:R,pointOnLine:U,distance:X.origin.distanceTo(R),object:o,face:null,faceIndex:b,uv:null,uv1:null})}}}class mt extends ct{constructor(e=new $e,n=new Be({color:Math.random()*16777215})){super(e,n),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,n=e.attributes.instanceStart,i=e.attributes.instanceEnd,t=new Float32Array(2*n.count);for(let d=0,u=0,x=n.count;d<x;d++,u+=2)Ce.fromBufferAttribute(n,d),Ie.fromBufferAttribute(i,d),t[u]=u===0?0:t[u-1],t[u+1]=t[u]+Ce.distanceTo(Ie);const c=new Ue(t,2,1);return e.setAttribute("instanceDistanceStart",new pe(c,1,0)),e.setAttribute("instanceDistanceEnd",new pe(c,1,1)),this}raycast(e,n){const i=this.material.worldUnits,t=e.camera;if(t===null&&!i&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.'),i===!1&&(this.material.resolution.x===0||this.material.resolution.y===0))return;const c=e.params.Line2!==void 0&&e.params.Line2.threshold||0;X=e.ray;const d=this.matrixWorld,u=this.geometry,x=this.material;ae=x.linewidth+c,u.boundingSphere===null&&u.computeBoundingSphere(),be.copy(u.boundingSphere).applyMatrix4(d);let f;if(i)f=ae*.5;else{const m=Math.max(t.near,be.distanceToPoint(X.origin));f=Fe(t,m,x.resolution)}if(be.radius+=f,X.intersectsSphere(be)===!1)return;u.boundingBox===null&&u.computeBoundingBox(),Se.copy(u.boundingBox).applyMatrix4(d);let S;if(i)S=ae*.5;else{const m=Math.max(t.near,Se.distanceToPoint(X.origin));S=Fe(t,m,x.resolution)}Se.expandByScalar(S),X.intersectsBox(Se)!==!1&&(i?pt(this,n):ht(this,t,n))}onBeforeRender(e){const n=this.material.uniforms;n&&n.resolution&&(e.getViewport(_e),this.material.uniforms.resolution.value.set(_e.z,_e.w))}}class Ze extends $e{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const n=e.length-3,i=new Float32Array(2*n);for(let t=0;t<n;t+=3)i[2*t]=e[t],i[2*t+1]=e[t+1],i[2*t+2]=e[t+2],i[2*t+3]=e[t+3],i[2*t+4]=e[t+4],i[2*t+5]=e[t+5];return super.setPositions(i),this}setColors(e){const n=e.length-3,i=new Float32Array(2*n);for(let t=0;t<n;t+=3)i[2*t]=e[t],i[2*t+1]=e[t+1],i[2*t+2]=e[t+2],i[2*t+3]=e[t+3],i[2*t+4]=e[t+4],i[2*t+5]=e[t+5];return super.setColors(i),this}setFromPoints(e){const n=e.length-1,i=new Float32Array(6*n);for(let t=0;t<n;t++)i[6*t]=e[t].x,i[6*t+1]=e[t].y,i[6*t+2]=e[t].z||0,i[6*t+3]=e[t+1].x,i[6*t+4]=e[t+1].y,i[6*t+5]=e[t+1].z||0;return super.setPositions(i),this}fromLine(e){const n=e.geometry;return this.setPositions(n.attributes.position.array),this}}class vt extends mt{constructor(e=new Ze,n=new Be({color:Math.random()*16777215})){super(e,n),this.isLine2=!0,this.type="Line2"}}const xt=`${Xe}scenes/christmas-street.glb`,yt=`${Xe}maris.glb`,gt=450,ie=new me(2.6,1.7,.35),je=new me(.4,2,1.8),wt=`
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
}`;function _t(){const o=a.useRef(null);return ve(({camera:e})=>o.current?.position.copy(e.position)),r.jsxs("mesh",{ref:o,renderOrder:-10,children:[r.jsx("sphereGeometry",{args:[110,32,16]}),r.jsx("shaderMaterial",{vertexShader:Mt,fragmentShader:zt,side:ut,depthWrite:!1,fog:!1})]})}const Ge=.6,He=7.8,Ve=6,Et=o=>o*o*(3-2*o),De=(o,e,n)=>o+(e-o)*n;function At({progress:o,runId:e,narrow:n,frame:i}){const{camera:t,size:c,scene:d}=Te(),u=Te(P=>P.controls),x=a.useRef(!1);a.useEffect(()=>{x.current=!1},[e]),a.useEffect(()=>{const P=t;n?P.setViewOffset(c.width,c.height,0,-c.height*.2,c.width,c.height):P.setViewOffset(c.width,c.height,-c.width*.15,0,c.width,c.height),P.updateProjectionMatrix()},[t,c,n]),a.useEffect(()=>{const P=document.querySelector(".hero-canvas"),U=()=>x.current=!0;return P?.addEventListener("pointerdown",U),()=>P?.removeEventListener("pointerdown",U)},[]);const f=a.useMemo(()=>new y,[]),S=a.useMemo(()=>new y,[]),m=a.useMemo(()=>new y,[]),b=a.useMemo(()=>new y,[]),$=a.useMemo(()=>new y,[]),D=a.useMemo(()=>new y,[]),g=a.useMemo(()=>new oe,[]),T=a.useRef(30),H=a.useRef(!1);return ve(({clock:P},U)=>{if(x.current)return;const R=t,G=Et(Math.min(o.current,1)),ce=G>=1?Math.sin(P.elapsedTime*.2)*.035:0,Z=De(0,n?.38:.5,G)+ce,Y=De(.22,n?.5:.36,G),O=i.current;if(g.min.set(Ge,0,O.focus.z-Ve),g.max.set(He,2.6,O.focus.z+Ve),g.expandByPoint(O.focus).expandByPoint(O.maris),O.ready){const _=Le.smoothstep(o.current,.9,1);g.min.lerp(O.min,_),g.max.lerp(O.max,_),g.min.x=Math.min(g.min.x,Ge),g.max.x=Math.max(g.max.x,He)}D.set((g.min.x+g.max.x)/2,De(1,1.4,G),(g.min.z+g.max.z)/2),S.set(Math.sin(Z)*Math.cos(Y),Math.sin(Y),Math.cos(Z)*Math.cos(Y)),m.set(Math.cos(Z),0,-Math.sin(Z)),b.crossVectors(S,m).normalize();const ye=Math.tan(Le.degToRad(R.fov/2)),le=ye*(c.width/c.height),he=n?.9:.66,de=n?.46:.85;let F=8;for(let _=0;_<8;_++){$.set(_&1?g.max.x:g.min.x,_&2?g.max.y:g.min.y,_&4?g.max.z:g.min.z).sub(D);const h=$.dot(S);F=Math.max(F,Math.abs($.dot(m))/(le*he)+h,Math.abs($.dot(b))/(ye*de)+h)}const ue=1-Math.exp(-U*3.5);O.resnap&&(O.resnap=!1,H.current=!1),H.current||(f.copy(D),T.current=F,H.current=!0),f.lerp(D,ue),T.current+=(F-T.current)*ue,F=T.current,t.position.copy(f).addScaledVector(S,F),t.lookAt(f),u?.target.copy(f);const re=d.fog;re&&(re.near=F*.95,re.far=F*3.4)}),null}const jt=.55,Je=7;function Dt({frame:o,hand:e}){const{scene:n,animations:i}=Ne(yt),t=a.useRef(null),{actions:c}=st(i,t),d=a.useRef(null),u=a.useRef(null),x=a.useRef(-1.4);return a.useEffect(()=>{n.traverse(f=>{/Conductor|Winter|MouthFrown|MouthO|MouthWide|Toy(?!Tree)/.test(f.name)&&(f.visible=!1),f.name==="Maris_Spindle"&&(u.current=f)}),c[Object.keys(c).find(f=>f.endsWith("_weave"))??""]?.reset().fadeIn(.3).play()},[n,c]),ve(({clock:f},S)=>{const m=o.current.maris;if(m.x=Je,m.z+=(o.current.focus.z+1.6-m.z)*(1-Math.exp(-S*2.5)),d.current?.position.copy(m),d.current?.updateMatrixWorld(!0),u.current&&u.current.getWorldPosition(e),t.current){t.current.position.y=.1+Math.sin(f.elapsedTime*1.4)*.03;const b=o.current.focus;let D=Math.atan2(b.x-m.x,b.z-m.z)-x.current;D=Math.atan2(Math.sin(D),Math.cos(D)),x.current+=D*(1-Math.exp(-S*3)),t.current.rotation.y=x.current+Math.sin(f.elapsedTime*.5)*.06}}),r.jsxs("group",{ref:d,children:[r.jsxs("mesh",{position:[0,-.07,0],scale:[.5,.14,.5],children:[r.jsx("icosahedronGeometry",{args:[1,0]}),r.jsx("meshStandardMaterial",{color:"#3a5566",flatShading:!0,roughness:1})]}),r.jsx("group",{ref:t,scale:jt,position:[0,.1,0],"rotation-y":-1.4,children:r.jsx("primitive",{object:n})}),r.jsx("pointLight",{position:[1.2,2.3,1.7],color:"#ffd9a0",intensity:24,distance:10,decay:2}),r.jsx("pointLight",{position:[-1.3,1.8,-1.3],color:"#5fe0d0",intensity:11,distance:8,decay:2})]})}function Tt({replay:o,building:e,runId:n,onProgress:i,hand:t,progress:c,frame:d}){const u=Ne(xt),x=a.useRef(null),f=a.useRef({t:0,next:0,eventIdx:0,active:[],last:null,lastCorrected:!1,reported:-1,seed:!1}),{scene:S,items:m,lastT:b,glow:$,fit:D}=a.useMemo(()=>{const h=u.scene.clone(!0),M=new Map;for(const v of o.events)M.has(v.part)||M.set(v.part,{t:v.t_ms,corrected:v.corrected});const C=o.events.length?o.events[o.events.length-1].t_ms:0,l=C+1500,I=[],ee=[],V=new oe;h.updateMatrixWorld(!0),h.traverse(v=>{const z=v;if(!z.isMesh)return;let te=l,ne=!1;for(let se=z;se;se=se.parent){const N=M.get(se.name);N&&N.t<te&&(te=N.t,ne=N.corrected)}V.setFromObject(z),I.push({size:V.getSize(new y).length(),mesh:z,t:te,scale:z.scale.clone(),at:-1,corrected:ne,code:te===l}),V.setFromObject(z),ee.push(V.getCenter(new y))}),I.sort((v,z)=>v.t-z.t);const s=(v,z)=>v.slice().sort((te,ne)=>te-ne)[Math.floor((v.length-1)*z)],p=ee.map(v=>v.x),L=ee.map(v=>v.z),J=s(p,.05),ge=s(p,.95),w=s(L,.05),B=s(L,.95),W=Math.max(ge-J,B-w,1),K=36/W,Q=v=>{for(let z=v;z;z=z.parent)if(/^Mountain/.test(z.name))return!0;return!1};for(let v=I.length-1;v>=0;v--)(I[v].size>W*.5||Q(I[v].mesh))&&(I[v].mesh.visible=!1,I.splice(v,1));const fe=[];for(const v of I){const z=v.mesh.name,te=/^(LampHead|EaveBulb|TreeStar|Garland|LampShade)/.test(z),ne=/Window/.test(z);if(!te&&!ne)continue;const se=v.mesh.material;if(!se||!("emissive"in se))continue;const N=se.clone();N.emissive=new me(ne?"#ffb85c":"#ffd27a"),N.emissiveIntensity=ne?1.6:3.2,v.mesh.material=N,fe.push({mat:N,base:N.emissiveIntensity,phase:Math.random()*6.28})}return{scene:h,items:I,lastT:C,glow:fe,fit:{s:K,cx:(J+ge)/2,cz:(w+B)/2}}},[u.scene,o]),g=()=>{const h=f.current;h.t=0,h.next=0,h.eventIdx=0,h.active=[],h.last=null,h.reported=-1;for(const M of m)M.mesh.visible=!1,M.at=-1};a.useEffect(()=>{g();const h=parseFloat(new URLSearchParams(location.search).get("at")??"");n===0&&h>0&&(f.current.t=h*b,f.current.seed=!0)},[n,m]);const T=a.useMemo(()=>Array.from({length:32},()=>new y),[]),H=a.useMemo(()=>new Float32Array(96),[]),P=a.useMemo(()=>new y,[]),U=Te(h=>h.size),R=a.useMemo(()=>{const h=new Ze;h.setPositions(new Float32Array(96));const M=new Be({color:16777215,linewidth:5.5,toneMapped:!1,transparent:!0,opacity:.95,depthTest:!1,depthWrite:!1});M.color.copy(ie);const C=new vt(h,M);return C.frustumCulled=!1,C.renderOrder=999,C.visible=!1,C},[]);a.useEffect(()=>{R.material.resolution.set(U.width,U.height)},[U,R]);const G=a.useRef(null),ce=a.useRef(null),Z=14,Y=a.useRef([]),O=a.useRef(Array(Z).fill(-1)),ye=a.useRef(0),le=7,he=a.useRef([]),de=a.useRef(null),F=a.useRef(null),ue=a.useRef(!1),re=a.useMemo(()=>new oe,[]),_=a.useMemo(()=>new y,[]);return ve(({clock:h,camera:M},C)=>{const l=f.current;if(!d.current.ready&&x.current){x.current.updateMatrixWorld(!0);const s=new oe;for(const p of m)re.setFromObject(p.mesh),p.mesh.userData.c=re.getCenter(new y),p.code||s.union(re);s.min.y=Math.max(s.min.y,0),d.current.min.copy(s.min),d.current.max.copy(s.max),d.current.focus.set((s.min.x+s.max.x)/2,.5,s.min.z+1),d.current.maris.set(Je,.1,s.min.z+2.6),d.current.ready=!0}for(const s of $)s.mat.emissiveIntensity=s.base*(.75+.25*Math.sin(h.elapsedTime*2.3+s.phase)+.12*Math.sin(h.elapsedTime*5.1+s.phase*2));for(c.current=b>0?Math.min(l.t/b,1):0,e&&(l.t+=Math.min(C,.05)*1e3*Re);l.next<m.length&&m[l.next].t<=l.t;){const s=m[l.next++];if(s.mesh.visible=!0,s.mesh.scale.setScalar(1e-4),s.at=l.seed?-1e12:l.t,l.active.push(s),!s.code&&(l.last=s.mesh,l.lastCorrected=s.corrected,!l.seed)){const p=ye.current++%Z;O.current[p]=h.elapsedTime,Y.current[p].position.copy(s.mesh.userData.c),Y.current[p].userData.c=s.corrected}s.code&&!ue.current&&de.current&&(ue.current=!0,de.current.position.copy(s.mesh.userData.c),de.current.position.y+=4)}l.seed&&(d.current.snap=!0),l.seed=!1;for(let s=l.active.length-1;s>=0;s--){const p=l.active[s],L=Math.min((l.t-p.at)/(gt*Re),1),J=1+2.2*Math.pow(L-1,3)+1.2*Math.pow(L-1,2);p.mesh.scale.copy(p.scale).multiplyScalar(Math.max(J,1e-4)),L>=1&&l.active.splice(s,1)}for(;l.eventIdx<o.events.length&&o.events[l.eventIdx].t_ms<=l.t;)l.eventIdx++;if(l.eventIdx!==l.reported){l.reported=l.eventIdx;const s=l.eventIdx>0?o.events[l.eventIdx-1]:null;i({n:l.eventIdx,last:s?{tool:s.tool,part:s.part,corrected:s.corrected}:null,done:l.t>b+1500})}for(let s=0;s<Z;s++){const p=Y.current[s];if(!p)continue;const L=(h.elapsedTime-O.current[s])/.9;if(p.visible=O.current[s]>=0&&L>=0&&L<1,p.visible){p.quaternion.copy(M.quaternion),p.scale.setScalar(.15+L*1.2);const J=p.material;J.opacity=(1-L)*.95,J.color.copy(p.userData.c?je:ie)}}if(F.current){const s=ue.current&&l.t>=b+1500;F.current.style.opacity=s?"1":"0"}const I=R,ee=l.t>=b+1500,V=e&&!!l.last;I.visible=V,G.current&&(G.current.visible=V),ce.current&&(ce.current.visible=V);for(let s=0;s<le;s++){const p=he.current[s];p&&(p.visible=V&&ee)}if(V&&l.last){const s=P.copy(l.last.userData.c);s.y+=.2,d.current.focus.copy(s),d.current.snap&&(d.current.snap=!1,d.current.maris.z=s.z+1.6,d.current.resnap=!0);const p=t,L=I.material;L.color.copy(l.lastCorrected?je:ie),L.opacity=ee?.6:.95,L.linewidth=ee?3.6:5.5;const J=p.distanceTo(s);_.lerpVectors(p,s,.5),_.y+=Math.min(J*.2,3)+.4;for(let w=0;w<T.length;w++){const B=w/(T.length-1),W=(1-B)*(1-B),K=2*B*(1-B),Q=B*B;T[w].set(p.x*W+_.x*K+s.x*Q,p.y*W+_.y*K+s.y*Q,p.z*W+_.z*K+s.z*Q),T[w].y+=Math.sin(B*9-h.elapsedTime*4)*.05*Math.sin(B*Math.PI),H[w*3]=T[w].x,H[w*3+1]=T[w].y,H[w*3+2]=T[w].z}I.geometry.setPositions(H);for(let w=0;w<le;w++){const B=he.current[w];if(!B||!B.visible)continue;const W=((w+1)/(le+1)+h.elapsedTime*.03*(1+w%3))%1,K=(1-W)*(1-W),Q=2*W*(1-W),fe=W*W;B.position.set(p.x*K+_.x*Q+s.x*fe+Math.sin(h.elapsedTime*1.3+w)*.15,p.y*K+_.y*Q+s.y*fe+Math.sin(h.elapsedTime*1.7+w*2)*.15+.1,p.z*K+_.z*Q+s.z*fe+Math.cos(h.elapsedTime*1.1+w)*.15)}G.current?.position.copy(s),ce.current?.position.copy(p);const ge=(1+Math.sin(h.elapsedTime*6)*.2)*(ee?.7:1);G.current?.scale.setScalar(ge),G.current?.material?.color.copy(l.lastCorrected?je:ie)}}),r.jsxs(r.Fragment,{children:[r.jsx("group",{ref:x,scale:D.s,position:[-D.cx*D.s+3.5,.1,-D.cz*D.s-1],children:r.jsx("primitive",{object:S})}),r.jsx("primitive",{object:R}),Array.from({length:Z},(h,M)=>r.jsxs("mesh",{ref:C=>{Y.current[M]=C},visible:!1,renderOrder:998,children:[r.jsx("ringGeometry",{args:[.85,1,40]}),r.jsx("meshBasicMaterial",{color:ie,toneMapped:!1,transparent:!0,depthTest:!1,depthWrite:!1,side:ft})]},M)),Array.from({length:le},(h,M)=>r.jsxs("mesh",{ref:C=>{he.current[M]=C},visible:!1,renderOrder:997,children:[r.jsx("sphereGeometry",{args:[.03+M%3*.012,8,8]}),r.jsx("meshBasicMaterial",{color:ie,toneMapped:!1,transparent:!0,opacity:.6,depthTest:!1})]},M)),r.jsx("group",{ref:de,children:r.jsx(nt,{center:!0,zIndexRange:[5,0],style:{pointerEvents:"none"},children:r.jsx("div",{ref:F,className:"code-label",style:{opacity:0},children:"made by code"})})}),r.jsxs("mesh",{ref:G,visible:!1,children:[r.jsx("sphereGeometry",{args:[.12,12,12]}),r.jsx("meshBasicMaterial",{color:ie,toneMapped:!1,depthTest:!1})]}),r.jsxs("mesh",{ref:ce,visible:!1,children:[r.jsx("sphereGeometry",{args:[.06,10,10]}),r.jsx("meshBasicMaterial",{color:ie,toneMapped:!1})]})]})}function Pt({replay:o,building:e,runId:n,visible:i,onProgress:t,lowPower:c}){const d=typeof window<"u"&&window.innerWidth<860,u=a.useMemo(()=>new y(7.4,.5,-15),[]),x=a.useRef(0),f=a.useRef({min:new y(-18,0,-18),max:new y(18,6,18),ready:!1,focus:new y(3.5,.5,-17),maris:new y(7.4,.1,-15),snap:!1});return r.jsxs(Ke,{className:"hero-canvas",frameloop:i?"always":"never",dpr:[1,2],camera:{position:[10,6,30],fov:d?46:38},gl:{antialias:!c,powerPreference:"high-performance"},children:[r.jsx("color",{attach:"background",args:["#0B1D2A"]}),r.jsx("fog",{attach:"fog",args:["#2a4f5a",38,105]}),r.jsx("ambientLight",{intensity:.55,color:"#9fd8dc"}),r.jsx("hemisphereLight",{args:["#6fa8c8","#0b1d2a",.5]}),r.jsx("directionalLight",{position:[-8,9,6],intensity:1.9,color:"#ffc98a"}),r.jsx(_t,{}),r.jsx(bt,{}),r.jsx(Qe,{count:c?40:110,scale:[46,9,46],position:[0,5,0],size:5,speed:.35,opacity:.9,color:"#ffd9a0"}),r.jsxs(a.Suspense,{fallback:null,children:[r.jsx(Tt,{replay:o,building:e,runId:n,onProgress:t,hand:u,progress:x,frame:f}),r.jsx(Dt,{frame:f,hand:u})]}),r.jsx(Ye,{makeDefault:!0,enableZoom:!1,enablePan:!1,maxPolarAngle:Math.PI/2.1,target:[1.5,1.6,1.5]}),r.jsx(At,{progress:x,runId:n,narrow:d,frame:f}),!c&&r.jsx(et,{children:r.jsx(tt,{intensity:1.1,luminanceThreshold:1,luminanceSmoothing:.2,mipmapBlur:!0})})]})}export{Pt as default};
